import { Getter } from "./types";

const createGetterTracked = <T>(target: T, logger: (key: string) => void): T => {
  if (typeof target === 'object' && target) {
    const ref = Object.assign({}, target);
    Object.entries(target).forEach(([k, v]) => {
      Object.defineProperty(ref, k, {
        get() {
          logger(k);
          return createGetterTracked(v, logger);
        }
      });
    });
    return ref;
  } else {
    return target;
  }
};

export const resolvePtr = <S, R>(getState: () => Readonly<S>, definition: (root: Readonly<S>) => R): {
  value: R;
  getter: Getter<R>;
} => {
  const path: string[] = [];
  const value = definition(createGetterTracked(getState(), key => path.push(key)));
  const getter = () => {
    const p = [...path];
    let target: unknown = getState();
    while (p.length) {
      target = (target as any)[p.shift()!];
    }
    return target as Readonly<R>;
  };
  return {
    value,
    getter
  };
};
