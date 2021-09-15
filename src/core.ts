import { Immutable } from './immutable';
import {
  Action,
  ActionArgs,
  AsyncAction,
  AsyncActionArgs,
  ComputedState,
  Context,
  ContextActions,
  ContextAdapter,
  ContextAsyncActions,
  ContextSyncActions,
  Getter,
  Hooks,
  Pointer,
  TimeTravelCaller
} from './types';
import { resolvePtr } from './utils';

class Store<
  S extends Record<string, any>,
  A extends string,
  AA extends string,
  EE extends Record<string, (...args: [any] | []) => any>
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
    prev: any[];
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
  }

  private postUpdate(): void {
    this.subscribers = this.subscribers.map(({ callback, deps, prev }) => {
      if (deps === '*') {
        callback();
        return { callback, deps, prev };
      } else {
        let shouldUpdate = false;
        const mem: unknown[] = [];
        for (let i = 0; i < deps.length; i++) {
          const next = deps[i]();
          if (!Object.is(next, prev[i])) { // diff
            shouldUpdate = true;
          }
          mem.push(next);
        }
        if (shouldUpdate) {
          callback();
        }
        return {
          callback,
          deps,
          prev: mem
        };
      }
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

  dispatch<P extends any[]>(
    actionName: A,
    action: (prevState: S, ...args: P) => Partial<S>,
    ...args: P
  ): Promise<Readonly<S>> {
    return new Promise<Readonly<S>>((resolve, reject) => {
      const apply = (prevState: S): Partial<S> => {
        return action(prevState, ...args);
      };
      for (let i = 0; i < this.hooks.beforeDispatch.length; i++) {
        let shouldDispatch = false;
        this.hooks.beforeDispatch[i](actionName, this.state, () => shouldDispatch = true);
        if (!shouldDispatch) { // blocked
          reject('Dispatch is blocked');
          return;
        }
      }
      this.batchQueue.push({ action: actionName, apply, resolve });
      this.batch();
    });
  }

  dispatchSync<P extends any[]>(
    actionName: A | AA,
    action: (prevState: S, ...args: P) => Partial<S>, ...args: P
  ): Readonly<S> | undefined {
    for (let i = 0; i < this.hooks.beforeDispatch.length; i++) {
      let shouldDispatch = false;
      this.hooks.beforeDispatch[i](actionName, this.state, () => shouldDispatch = true);
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
    this.listeners[eventName] = (this.listeners[eventName]! ?? []).concat({
      callback,
      once: false
    });
  }

  once<Name extends keyof EE>(eventName: Name, callback: (...args: Parameters<EE[Name]>) => void): void {
    this.listeners[eventName] = (this.listeners[eventName]! ?? []).concat({
      callback,
      once: true
    });
  }

  travel: TimeTravelCaller<S, A | AA> = {
    at: (idx: number) => this.history.at(idx),
    go: (idx: number) => this.history.go(idx),
    move: (idx: number) => this.history.go(this.history.head + idx),
    prev: () => this.history.go(this.history.head - 1),
    next: () => this.history.go(this.history.head + 1),
    backFor: (...args: [actionName: A | AA] | [count: number, actionName: A | AA]) => {
      const actionName = args[1] ?? args[0];
      let count = typeof args[0] === 'number' ? args[0] : 1;
      let vid = this.history.versions[this.history.head];
      const versions = this.history.versions.slice(0, this.history.head);
      while (count > 0 && versions.length) {
        const prev = versions.pop()!;
        if (this.updates[prev] === actionName) {
          count -= 1;
          vid = prev;
        }
      }
      return this.history.go(this.history.versions.findIndex(v => v === vid));
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
        const prev = versions.shift()!;
        if (this.updates[prev] === actionName) {
          count -= 1;
          vid = prev;
        }
      }
      return this.history.go(this.history.versions.findIndex(v => v === vid));
    },
    forwardTill: (...args: [actionName: A | AA] | [count: number, actionName: A | AA]) => {
      // if failed to move forward, `prev()` will make the version behind the previous one.
      const vidBeforeMove = this.history.versions[this.history.head];
      this.travel.forwardFor(...args);
      const vidAfterMove = this.history.versions[this.history.head];
      return vidAfterMove === vidBeforeMove ? this.state : this.travel.prev();
    },
    latest: () => this.history.go(this.history.versions.length - 1),
    clearForward: () => this.history.clearForward()
  };

}

export const createContext = <
  S extends Record<string, any>,
  A extends Record<string, Action<S>>,
  AA extends Record<string, AsyncAction<S>>,
  AD extends Record<`get${Uppercase<string>}`, ContextAdapter<S>>,
  EE extends Record<string, (...args: [any] | any) => any>
>(config: {
  /**
   * Initial value of the state.
   */
  init: S;
  /**
   * Action generators.
   */
  actions?: A;
  /**
   * Async functions which is used to update the state.
   */
  asyncActions?: AA;
  /**
   * Adapters used to describe a derivate value of the state.
   */
  adapters?: AD;
  /**
   * Emittable events which will not cause an update.
   */
  emitters?: EE;
}): Context<S, A, AA, AD, EE> => {
  const store = new Store<S, keyof A & string, keyof AA & string, EE>(config.init);
  const actions = {} as ContextActions<S, A>;
  const syncActions = {} as ContextSyncActions<S, A>;
  Object.entries(config.actions ?? {}).forEach(([key, value]) => {
    actions[key as keyof A] = (...args: ActionArgs<S, typeof value>) => {
      return store.dispatch(key, value, ...args);
    };
    (syncActions as any)[`${key as keyof A}Sync`] = (...args: ActionArgs<S, typeof value>) => {
      return store.dispatchSync(key, value, ...args);
    };
  });
  const asyncActions = {} as ContextAsyncActions<S, AA>;
  Object.entries(config.asyncActions ?? {}).forEach(([key, value]) => {
    asyncActions[key as keyof AA & string] = async (...args: AsyncActionArgs<S, typeof value>) => {
      try {
        const nextState = await value(() => {
          return store.state;
        }, ...args);
        return store.dispatch(key as keyof AA & string, () => nextState);
      } catch (err) {
        console.error(err);
      }
      return null;
    };
  });
  const computed = {} as ComputedState<S, AD>;
  const context: Context<S, A, AA, AD, EE> = Object.assign({}, {
    state: store.state,
    computed,
    actions: Object.assign({}, syncActions, actions, asyncActions),
    subscribe: store.subscribe.bind(store),
    unsubscribe: store.unsubscribe.bind(store),
    listen: store.listen.bind(store),
    once: store.once.bind(store),
    emit: (store.emit as any).bind(store),
    travel: store.travel
  });
  Object.entries(config.adapters ?? {}).forEach(entry => {
    const [key, adapt] = entry as [keyof AD & string, (state: Readonly<S>) => any];
    if (/^get[A-Z]/.test(key)) {
      const firstLetter = /^get(?<F>[A-Z])/.exec(key)!.groups!.F;
      const name = key.replace(new RegExp(`^get${firstLetter}`), firstLetter.toLowerCase());
      Object.defineProperty(computed, name, {
        get: () => {
          return adapt(store.state);
        }
      });
    }
  });
  Object.defineProperty(context, 'state', {
    get: () => {
      return store.state;
    }
  });
  return context;
};
