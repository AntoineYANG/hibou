import Store from './store';
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
  ContextInitConfig,
  ContextSyncActions,
} from './types';


/**
 * Creates a context instance which includes the getters and callable methods.
 * @param {ContextInitConfig<Store, A, AA, AD, EE>} config initial configuration
 * @returns {Context<S, A, AA, AD, EE>} context instance
 */
export const createContext = <
  S extends Record<string, unknown>,
  A extends Record<string, Action<S>>,
  AA extends Record<string, AsyncAction<S>>,
  AD extends Record<`get${Uppercase<string>}`, ContextAdapter<S>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EE extends Record<string, (...args: any[]) => unknown>
>(config: ContextInitConfig<S, A, AA, AD, EE>): Context<S, A, AA, AD, EE> => {
  const store = new Store<S, keyof A & string, keyof AA & string, EE>(config.init);
  const actions = {} as ContextActions<S, A>;
  const syncActions = {} as ContextSyncActions<S, A>;
  Object.entries(config.actions ?? {}).forEach(([key, value]) => {
    actions[key as keyof A] = (...args: ActionArgs<S, typeof value>) => store.dispatch(key, value, ...args);

    syncActions[`${key as keyof A}Sync`] = (
      ...args: ActionArgs<S, typeof value>
    ) => store.dispatchSync(key, value, ...args);
  });
  const asyncActions = {} as ContextAsyncActions<S, AA>;
  Object.entries(config.asyncActions ?? {}).forEach(([key, value]) => {
    asyncActions[key as keyof AA & string] = async (...args: AsyncActionArgs<S, typeof value>) => {
      try {
        const nextState = await value(() => store.state, ...args);
        return store.dispatch(key as keyof AA & string, () => nextState);
      } catch (err) {
        console.error(err);
      }
      return null;
    };
  });
  const computed = {} as ComputedState<S, AD>;
  const context: Context<S, A, AA, AD, EE> = Object.assign({}, {
    state:       store.state,
    computed,
    actions:     Object.assign({}, syncActions, actions, asyncActions),
    subscribe:   store.subscribe.bind(store),
    unsubscribe: store.unsubscribe.bind(store),
    listen:      store.listen.bind(store),
    once:        store.once.bind(store),
    emit:        (store.emit as () => void).bind(store) as Context<S, A, AA, AD, EE>['emit'],
    travel:      store.travel
  });
  Object.entries(config.adapters ?? {}).forEach(entry => {
    const [key, adapt] = entry as [keyof AD & string, (state: Readonly<S>) => unknown];

    if (/^get[A-Z]/.test(key)) {
      const firstLetter = /^get(?<F>[A-Z])/.exec(key)?.groups?.F as string;
      const name = key.replace(new RegExp(`^get${firstLetter}`), firstLetter.toLowerCase());
      Reflect.defineProperty(computed, name, {
        get: () => adapt(store.state)
      });
    }
  });
  Reflect.defineProperty(context, 'state', {
    get: () => store.state
  });
  return context;
};
