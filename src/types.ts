type Str<T> = T extends string ? T : T extends number | bigint | boolean ? `${T}` : never;

export type Action<S extends Record<string, any>> = (
  | ((prevState: Readonly<S>, ...args: any[]) => Partial<S>)
);

export type AsyncAction<S extends Record<string, any>> = (
  | ((getState: () => Readonly<S>, ...args: any[]) => Promise<Partial<S>>)
);

export type ActionArgs<S extends Record<string, any>, A extends Action<S>> = (
  | (A extends ((prevState: Readonly<S>, ...args: infer P) => Partial<S>) ? P : never)
);

export type AsyncActionArgs<S extends Record<string, any>, A extends AsyncAction<S>> = (
  | (A extends ((getState: () => Readonly<S>, ...args: infer P) => Promise<Partial<S>>) ? P : never)
);

type SyncParams<A extends Record<string, any>> = {
  [Name in keyof A]: Name extends string ? `${Name}Sync` : never;
};

type AsyncKey<A extends Record<string, any>, Name extends `${string}Sync`> = Name extends `${infer P}Sync` ? (
  P extends keyof A ? P : never
) : never;

type SyncKeys<A extends Record<string, any>> = SyncParams<A>[keyof A];

export type ContextActions<
  S extends Record<string, any>,
  A extends Record<string, Action<S>>
> = {
  [Name in keyof A]: (...args: ActionArgs<S, A[Name]>) => Promise<Readonly<S>>
};

export type ContextSyncActions<
  S extends Record<string, any>,
  A extends Record<string, Action<S>>
> = {
  [Key in SyncKeys<A>]: (...args: ActionArgs<S, A[AsyncKey<A, Key>]>) => Readonly<S>
};

export type ContextAsyncActions<
  S extends Record<string, any>,
  AA extends Record<string, AsyncAction<S>>
> = {
  [Name in keyof AA]: (...args: AsyncActionArgs<S, AA[Name]>) => Promise<Readonly<S | null>>
};

export type ContextAdapter<
  S extends Record<string, any>
> = (state: Readonly<S>) => any;

type AdapterParams<AD extends Record<string, any>> = {
  [Name in keyof AD]: Name extends `get${infer P}` ? P extends Capitalize<P> ? Uncapitalize<P> : never : never;
};

type AdapterKey<AD> = AD extends string ? `get${Capitalize<AD>}` : never;

type AdaptedKeys<AD extends Record<string, any>> = AdapterParams<AD>[keyof AD];

export type ComputedState<
  S extends Record<string, any>,
  AD extends Record<string, ContextAdapter<S>>
> = {
  [Name in AdaptedKeys<AD>]: Readonly<ReturnType<AD[AdapterKey<Name>]>>
};

type EventEmitters<EE extends Record<string, (...args: [any] | []) => any>> = {
  /**
   * Emits an event, may be bound with a payload.
   * An emitting will not cause any change of the state.
   */
  emit: <Name extends keyof EE>(eventName: Name, ...args: Parameters<EE[Name]>) => void;
};

export type TimeTravelCaller<S extends Record<string, any>, A extends string> = {
  /**
   * Returns the state at the `idx`-th version.
   * @param {number} idx index of the version, count from the end if `idx` is negative
   * @returns {Readonly<S>} a readonly snapshot of the state at the given version
   */
  at: (idx: number) => Readonly<S>;
  /**
   * Resets the state to the `idx`-th version.
   * 
   * Call `clearForward()` or update anything to delete all the records after this version.
   * @param {number} idx index of the version, count from the end if `idx` is negative
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  go: (idx: number) => Readonly<S>;
  /**
   * Resets the state to the certain version from the current one.
   * Version moves forward if `idx` is positive.
   * 
   * Call `clearForward()` or update anything to delete all the records after this version.
   * @param {number} idx steps to move
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  move: (idx: number) => Readonly<S>;
  /**
   * Resets the state to the previous version of the current one.
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  prev: () => Readonly<S>;
  /**
   * Resets the state to the next version of the current one.
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  next: () => Readonly<S>;
  /**
   * Resets the state back to the version in which the given action is dispatched.
   * @param {number} count if `count` is given, use the `count`-th version which meets the condition
   * @param {A} actionName name of the action
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  backFor: (...args: [actionName: A] | [count: number, actionName: A]) => Readonly<S>;
  /**
   * Resets the state back right before a version in which the given action is dispatched.
   * @param {number} count if `count` is given, use the `count`-th version which meets the condition
   * @param {A} actionName name of the action
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  backTill: (...args: [actionName: A] | [count: number, actionName: A]) => Readonly<S>;
  /**
   * Resets the state forward to the version in which the given action is dispatched.
   * @param {number} count if `count` is given, use the `count`-th version which meets the condition
   * @param {A} actionName name of the action
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  forwardFor: (...args: [actionName: A] | [count: number, actionName: A]) => Readonly<S>;
  /**
   * Resets the state forward right before a version in which the given action is dispatched.
   * @param {number} count if `count` is given, use the `count`-th version which meets the condition
   * @param {A} actionName name of the action
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  forwardTill: (...args: [actionName: A] | [count: number, actionName: A]) => Readonly<S>;
  /**
   * Resets the state to the latest version, if the current version is moved back and not overwritten.
   * @returns {Readonly<S>} a readonly snapshot of the state reset
   */
  latest: () => Readonly<S>;
  /**
   * Deletes all the versions in front of the current version.
   */
  clearForward: () => void;
};

export type Pointer<S extends Record<string, any>> = (root: Readonly<S>) => any;
export type Getter<R> = () => Readonly<R>;

export type Context<
  S extends Record<string, any>,
  A extends Record<string, Action<S>>,
  AA extends Record<string, AsyncAction<S>>,
  AD extends Record<string, ContextAdapter<S>>,
  EE extends Record<string, (...args: [any] | []) => any>
> = {
  /**
   * Gets a readonly snapshot of the current state.
   */
  state: Readonly<S>;
  /**
   * Subscribe to the context.
   * @param {() => void} callback a callback which will be called once the context is updated
   * @param {[(root: Readonly<S>) => any, ...((root: Readonly<S>) => any)[]]} deps
   * if `deps` is given, `callback` will be triggered only after one or more of these watched variables change.
   * A member of `deps` is a function describing how to get a watched value from the readonly current state.
   */
  subscribe: (callback: () => void, deps?: [Pointer<S>, ...Pointer<S>[]]) => void;
  /**
   * Removes a listener.
   * @param {() => void} callback the real callback function passed to `subscribe()`
   */
  unsubscribe: (callback: () => void) => void;
  /**
   * Appends a listener.
   * @param {Name} actionName the name of the action to be listened
   * @param {(...args: Parameters<EE[Name]>) => void} callback a callback which will be called once an action
   * meeting the condition is dispatched
   */
  listen: <Name extends keyof EE>(actionName: Name, callback: (...args: Parameters<EE[Name]>) => void) => void;
  /**
   * Appends an disposable listener. Unlike `listen()`, `once()` can only be triggered once.
   * @param {Name} actionName the name of the action to be listened
   * @param {(...args: Parameters<EE[Name]>) => void} callback a callback which will be called once an action
   * meeting the condition is dispatched
   */
  once: <Name extends keyof EE>(actionName: Name, callback: (...args: Parameters<EE[Name]>) => void) => void;
  /**
   * Methods to generate a new action to update the state. It includes three kind of methods -
   * + Common Actions
   * > These methods are all named as the functions passed to `createContext()` as `actions`
   * when the context is initialized.
   * Actions generated from these methods will be batched to fewer updates,
   * thus the update and the return value of the method called is async.
   * @example
   * ```typescript
   * const context = createContext({
   *   init: initialState,
   *   actions: {
   *     plus: (s, n: number = 1) => ({
   *       num: s.num + n
   *     })
   *   }
   * });
   * 
   * // The two calling as follow will be batched as one update, they both return a Promise instance
   * context.actions.plus();
   * context.actions.plus(2);
   * ```
   * + Synchronized Actions
   * > These methods are derivate ones corresponding to each Common Action.
   * A method named `foo` will generate a synchronized caller `fooSync` (concat with a `-Sync` suffix).
   * Unlike Common Actions, calling a Synchronized Actions will always causes an update.
   * The state will be immediately updated and so will the listeners be triggered.
   * A Synchronized Action returns a snapshot of the updated state.
   * @example
   * ```typescript
   * const context = createContext({
   *   init: initialState,
   *   actions: {
   *     plus: (s, n: number = 1) => ({
   *       num: s.num + n
   *     })
   *   }
   * });
   * 
   * // The two calling as follow will both cause a new update and return an immediate value
   * context.actions.plusSync();
   * context.actions.plusSync(2);
   * ```
   * + ASync Actions
   * > An Async Action is an async function which will return a partial state.
   * These methods are all named as the functions passed to `createContext()` as `asyncActions`
   * when the context is initialized.
   * Like Common Actions, dispatching of Async Actions will be batched.
   * @example
   * ```typescript
   * const context = createContext({
   *   init: initialState,
   *   asyncActions: {
   *     asyncPlus: async (getState, id: string) => {
   *       const num = await get(`/xxx?id=${id}`).then(res => res.data);
   *       return {
   *         num: getState().num + num
   *       };
   *     }
   *   }
   * });
   * 
   * context.actions.asyncPlus('abc');
   * ```
   */
  actions: (
    & ContextActions<S, A>
    & ContextSyncActions<S, A>
    & ContextAsyncActions<S, AA>
  );
  /**
   * Getters of computed values.
   * These methods are all named from the functions passed to `createContext()` as `adapters`
   * when the context is initialized.
   * A method named `getVal` will generate a getter `val` (removed the `get-` prefix and uncapitalized).
   * @example
   * ```typescript
   * const context = createContext({
   *   init: initialState,
   *   adapters: {
   *     getDoubleNum: s => {
   *       return s.num * 2;
   *     }
   *   }
   * });
   * 
   * const { doubleNum } = context.computed;
   * ```
   */
  computed: ComputedState<S, AD>;
} & EventEmitters<EE> & {
  /**
   * Time-travel methods
   */
  travel: TimeTravelCaller<S, Str<keyof A | keyof AA>>;
};

export type Hooks<S extends Record<string, any>, A extends string, AA extends string> = {
  beforeDispatch: ((actionName: A | AA, state: Readonly<S>, then: () => void) => void)[];
};
