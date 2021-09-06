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
  Pointer
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
    this.batchQueue.forEach(({ apply, resolve }) => {
      this.history.current = Object.assign({}, this.state, apply(this.state));
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
      this.batchQueue.push({ apply, resolve });
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
    this.listeners[eventName] = (this.listeners[eventName] ?? []).concat({
      callback,
      once: false
    });
  }

  once<Name extends keyof EE>(eventName: Name, callback: (...args: Parameters<EE[Name]>) => void): void {
    this.listeners[eventName] = (this.listeners[eventName] ?? []).concat({
      callback,
      once: true
    });
  }

}

export const createContext = <
  S extends Record<string, any>,
  A extends Record<string, Action<S>>,
  AA extends Record<string, AsyncAction<S>>,
  AD extends Record<`get${Uppercase<string>}`, ContextAdapter<S>>,
  EE extends Record<string, (...args: [any] | any) => any>
>(config: {
  init: S;
  actions?: A;
  asyncActions?: AA;
  adapters?: AD;
  emitters?: EE;
}): Context<S, A, AA, AD, EE> => {
  const store = new Store<S, keyof A & string, keyof AA & string, EE>(config.init);
  const actions = {} as ContextActions<S, A>;
  const syncActions = {} as ContextSyncActions<S, A>;
  Object.entries(config.actions ?? {}).forEach(([key, value]) => {
    actions[key as keyof A] = (...args: ActionArgs<S, typeof value>) => {
      return store.dispatch(key, value, ...args);
    };
    syncActions[`${key as keyof A}Sync`] = (...args: ActionArgs<S, typeof value>) => {
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
        return store.dispatchSync(key as keyof AA & string, () => nextState);
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
    emit: store.emit.bind(store)
  });
  Object.entries(config.adapters ?? {}).forEach(([key, adapt]: [keyof AD & string, (state: Readonly<S>) => any]) => {
    if (/^get[A-Z]/.test(key)) {
      const firstLetter = /^get(?<F>[A-Z])/.exec(key).groups.F;
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
