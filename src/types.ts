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
  emit: <Name extends keyof EE>(eventName: Name, ...args: Parameters<EE[Name]>) => void;
};

type TimeTravelCaller<S extends Record<string, any>, A extends Record<string, any>> = {
  go: (idx: number) => Readonly<S>;
  prev: () => Readonly<S>;
  next: () => Readonly<S>;
  backFor: (...args: [actionName: keyof A] | [count: number, actionName: keyof A]) => Readonly<S>;
  backTill: (...args: [actionName: keyof A] | [count: number, actionName: keyof A]) => Readonly<S>;
  forwardFor: (...args: [actionName: keyof A] | [count: number, actionName: keyof A]) => Readonly<S>;
  forwardTill: (...args: [actionName: keyof A] | [count: number, actionName: keyof A]) => Readonly<S>;
  end: () => Readonly<S>;
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
  state: Readonly<S>;
  subscribe: (callback: () => void, deps?: [Pointer<S>, ...Pointer<S>[]]) => void;
  unsubscribe(callback: () => void): void;
  listen: <Name extends keyof EE>(actionName: Name, callback: (...args: Parameters<EE[Name]>) => void) => void;
  once: <Name extends keyof EE>(actionName: Name, callback: (...args: Parameters<EE[Name]>) => void) => void;
  actions: (
    & ContextActions<S, A>
    & ContextSyncActions<S, A>
    & ContextAsyncActions<S, AA>
  );
  computed: ComputedState<S, AD>;
} & EventEmitters<EE>;

export type Hooks<S extends Record<string, any>, A extends string, AA extends string> = {
  beforeDispatch: ((actionName: A | AA, state: Readonly<S>, then: () => void) => void)[];
};
