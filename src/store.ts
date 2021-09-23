import { Immutable } from './immutable';
import {
  Getter,
  Hooks,
  Pointer,
  TimeTravelCaller,
} from './types';
import { resolvePtr } from './utils';

/**
 * Container of data
 * @class Store
 * @template S typeof the data it maintains
 * @template A names of common action methods
 * @template AA names of async action methods
 * @template EE emittable event names
 */
export default class Store<
  S extends Record<string, unknown>,
  A extends string,
  AA extends string,
  EE extends Record<string, (...args: [unknown] | []) => unknown>
> {

  private history: Immutable<S>;

  private batchQueue: {
    action: A | AA;
    apply: (prevState: S) => Partial<S>;
    resolve: (state: Readonly<S>) => void;
  }[] = [];

  private isBatching = false;

  private subscribers: {
    callback: () => void;
    deps: '*' | Getter<unknown>[];
    prev: unknown[];
  }[] = [];

  private listeners: {
    [Name in keyof EE]?: {
      callback: (...args: Parameters<EE[keyof EE]>) => void;
      once: boolean;
    }[];
  } = {};

  private hooks: Hooks<S, A, AA> = {
    beforeDispatch: []
  };

  private updates: {
    [version: string]: A | AA;
  } = {};

  constructor(state: S) {
    this.history = new Immutable(state);
    this.travel = {
      at:      (idx: number) => this.history.at(idx),
      go:      (idx: number) => this.history.go(idx),
      move:    (idx: number) => this.history.go(this.history.head + idx),
      prev:    () => this.history.go(this.history.head - 1),
      next:    () => this.history.go(this.history.head + 1),
      backFor: (...args: [actionName: A | AA] | [count: number, actionName: A | AA]) => {
        const actionName = args[1] ?? args[0];
        let count = typeof args[0] === 'number' ? args[0] : 1;
        let vid = this.history.versions[this.history.head];
        const versions = this.history.versions.slice(0, this.history.head);

        while (count > 0 && versions.length) {
          const prev = versions.pop() as string;

          if (this.updates[prev] === actionName) {
            count -= 1;
            vid = prev;
          }
        }
        return this.history.go(
          this.history.versions.findIndex(version => version === vid)
        );
      },
      backTill: (...args: [actionName: A | AA] | [count: number, actionName: A | AA]) => {
        this.travel.backFor(...args);
        return this.travel.prev();
      },
      forwardFor: (...args: [actionName: A | AA] | [count: number, actionName: A | AA]) => {
        const actionName = args[1] ?? args[0];
        let count = typeof args[0] === 'number' ? args[0] : 1;
        let vid = this.history.versions[this.history.head];
        const versions = this.history.versions.slice(this.history.head + 1);

        while (count > 0 && versions.length) {
          const prev = versions.shift() as string;

          if (this.updates[prev] === actionName) {
            count -= 1;
            vid = prev;
          }
        }
        return this.history.go(
          this.history.versions.findIndex(version => version === vid)
        );
      },
      forwardTill: (...args: [actionName: A | AA] | [count: number, actionName: A | AA]) => {
        // if failed to move forward, `prev()` will make the version behind the previous one.
        const vidBeforeMove = this.history.versions[this.history.head];
        this.travel.forwardFor(...args);
        const vidAfterMove = this.history.versions[this.history.head];
        return vidAfterMove === vidBeforeMove ? this.state : this.travel.prev();
      },
      latest:       () => this.history.go(this.history.versions.length - 1),
      clearForward: () => this.history.clearForward()
    };
  }

  private postUpdate(): void {
    this.subscribers = this.subscribers.map(({ callback: info, deps, prev }) => {
      if (deps === '*') {
        info();
        return { callback: info, deps, prev };
      }
      let shouldUpdate = false;
      const mem: unknown[] = [];

      for (let i = 0; i < deps.length; i += 1) {
        const next = deps[i]();

        if (!Object.is(next, prev[i])) { // diff
          shouldUpdate = true;
        }
        mem.push(next);
      }

      if (shouldUpdate) {
        info();
      }

      return {
        callback: info,
        deps,
        prev:     mem
      };
    });
  }

  private batch(): void {
    if (this.isBatching) {
      return;
    }
    this.isBatching = true;
    setTimeout(() => this.update(), 10);
  }

  private update(): void {
    console.log('batched update', this.batchQueue.length);
    const resolveFuncs: ((state: Readonly<S>) => void)[] = [];
    this.batchQueue.forEach(({ action, apply, resolve }) => {
      this.history.current = Object.assign({}, this.state, apply(this.state));
      this.updates[this.history.versions[this.history.head]] = action;
      resolveFuncs.push(resolve);
    });
    resolveFuncs.forEach(resolve => {
      resolve(this.state);
    });
    this.postUpdate();
    this.isBatching = false;
  }

  get state(): Readonly<S> {
    return this.history.current;
  }

  dispatch<P extends unknown[]>(
    actionName: A,
    action: (prevState: S, ...args: P) => Partial<S>,
    ...args: P
  ): Promise<Readonly<S>> {
    return new Promise<Readonly<S>>((resolve, reject) => {
      const apply = (prevState: S): Partial<S> => action(prevState, ...args);

      for (let i = 0; i < this.hooks.beforeDispatch.length; i += 1) {
        let shouldDispatch = false;
        this.hooks.beforeDispatch[i](
          actionName,
          this.state,
          () => {
            shouldDispatch = true;
          }
        );

        if (!shouldDispatch) { // blocked
          reject(new Error('Dispatch is blocked'));
          return;
        }
      }
      this.batchQueue.push({ action: actionName, apply, resolve });
      this.batch();
    });
  }

  dispatchSync<P extends unknown[]>(
    actionName: A | AA,
    action: (prevState: S, ...args: P) => Partial<S>, ...args: P
  ): Readonly<S> | undefined {
    for (let i = 0; i < this.hooks.beforeDispatch.length; i += 1) {
      let shouldDispatch = false;
      this.hooks.beforeDispatch[i](
        actionName,
        this.state,
        () => {
          shouldDispatch = true;
        }
      );

      if (!shouldDispatch) { // blocked
        return undefined;
      }
    }
    this.history.current = Object.assign({}, this.state, action(this.state, ...args));
    this.updates[this.history.versions[this.history.head]] = actionName;
    this.postUpdate();
    return this.state;
  }

  emit<Name extends keyof EE>(eventName: Name, ...args: Parameters<EE[Name]>): void {
    const listeners = this.listeners[eventName];
    
    if (listeners) {
      this.listeners[eventName] = listeners.filter(({ callback, once }) => {
        callback(...args);
        return !once;
      });
    }
  }

  subscribe(callback: () => void, deps?: Pointer<S>[]): void {
    if (deps === undefined) {
      this.subscribers.push({
        callback,
        deps: '*',
        prev: []
      });
    } else {
      const getters: Getter<unknown>[] = [];
      const prev: unknown[] = [];
      deps.forEach(ptr => {
        const { value, getter } = resolvePtr<S, ReturnType<typeof ptr>>(() => this.state, ptr);
        getters.push(getter);
        prev.push(value);
      });
      this.subscribers.push({
        callback,
        deps: getters,
        prev
      });
    }
  }

  unsubscribe(callback: () => void): void {
    this.subscribers = this.subscribers.filter(subscriber => subscriber.callback !== callback);
  }

  listen<Name extends keyof EE>(eventName: Name, callback: (...args: Parameters<EE[Name]>) => void): void {
    this.listeners[eventName] = (
      this.listeners[eventName] ?? [] as {
        callback: (...args: Parameters<EE[keyof EE]>) => void;
        once: boolean;
      }[]
    ).concat({
      callback,
      once: false
    });
  }

  once<Name extends keyof EE>(eventName: Name, callback: (...args: Parameters<EE[Name]>) => void): void {
    this.listeners[eventName] = (
      this.listeners[eventName] ?? [] as {
        callback: (...args: Parameters<EE[keyof EE]>) => void;
        once: boolean;
      }[]
    ).concat({
      callback,
      once: true
    });
  }

  travel: TimeTravelCaller<S, A | AA>;

}
