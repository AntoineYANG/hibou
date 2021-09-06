import { nanoid } from "nanoid";

const valueKey: unique symbol = Symbol('value');
const entriesKey: unique symbol = Symbol('entries');
const vidKey: unique symbol = Symbol('vid');
const neverVal: unique symbol = Symbol('never');

type ImmutableObject<T> = Array<{
  [valueKey]: T extends Record<string | number | symbol, any> ? typeof neverVal : T;
  [entriesKey]: T extends Record<string | number | symbol, any> ? {
    [K in keyof T]: ImmutableObject<T[K]>;
  } : typeof neverVal;
  [vidKey]: string;
}>;

const createImmutableObject = <T>(value: T, vid: string): ImmutableObject<T>[0] => {
  if (typeof value === 'object' && value) {
    const ref = {
      [valueKey]: neverVal,
      [entriesKey]: {},
      [vidKey]: vid
    } as unknown as ImmutableObject<T>[0];
    Object.entries(value).forEach(([k, v]) => {
      ref[entriesKey][k] = [createImmutableObject(v, vid)];
    });
    return ref;
  }
  return {
    [valueKey]: value,
    [entriesKey]: neverVal,
    [vidKey]: vid
  } as unknown as ImmutableObject<T>[0];
};

const findMatching = <T>(history: ImmutableObject<T>, allVids: string[], vid: string): ImmutableObject<T>[0] | undefined => {
  const matchedVids: string[] = [];
  for (let i = 0; i < allVids.length; i++) {
    matchedVids.push(allVids[i]);
    if (allVids[i] === vid) {
      break;
    }
  }
  return [...history].reverse().find(({ [vidKey]: vid }) => matchedVids.includes(vid));
};

const resolveImmutableObject = <T>(history: ImmutableObject<T>, vids: string[], vid: string): Readonly<T> => {
  const obj = findMatching(history, vids, vid);
  if (!obj) {
    throw new Error(`Object is not found at ${vid}`);
  }
  if (obj[entriesKey] === neverVal) {
    return obj[valueKey] as Readonly<T>;
  }
  const ref = {} as Readonly<T>;
  Object.entries(obj[entriesKey]).forEach(([k, v]) => {
    ref[k] = resolveImmutableObject(v, vids, vid);
  });
  return ref;
};

const updateImmutableObject = <T>(history: ImmutableObject<T>, next: T, vid: string): boolean => {
  const prev = [...history].reverse()[0];
  if (prev[entriesKey] === neverVal) {
    if (typeof next === 'object' && next) {
      history.push(createImmutableObject(next, vid));
      return true;
    }
    if (Object.is(prev[valueKey], next)) {
      return false;
    }
    history.push(createImmutableObject(next, vid));
    return true;
  } else {
    if (typeof next === 'object' && next) {
      let changed = false;
      const h = { ...prev, [vidKey]: vid };
      Object.entries(h[entriesKey]).forEach(([k, v]) => {
        if (next[k] === undefined) {
          changed = true;
          v[valueKey] = undefined;
        } else {
          changed = updateImmutableObject(v, next[k], vid) || changed;
        }
      });
      Object.entries(next).forEach(([k, v]) => {
        if (h[entriesKey][k] === undefined) {
          changed = true;
          h[entriesKey][k] = createImmutableObject(v, vid);
        }
      });
      if (changed) {
        history.push(h);
      }
      return changed;
    } else {
      history.push(createImmutableObject(next, vid));
      return true;
    }
  }
};

export class Immutable<T> {

  private _data: ImmutableObject<T>;
  private _vids: string[];

  constructor(value: T) {
    const vid = nanoid(8);
    this._data = [createImmutableObject(value, vid)];
    this._vids = [vid];
  }

  private push(value: T): void {
    const vid = nanoid(8);
    updateImmutableObject(this._data, value, vid);
    this._vids.push(vid);
  }

  get current(): Readonly<T> {
    return resolveImmutableObject(this._data, this._vids, [...this._vids].reverse()[0]);
  }

  set current(value: T) {
    this.push(value);
  }

  debug(obj: ImmutableObject<any> = this._data, path = 'this'): void {
    const current = [...obj].reverse()[0];
    console.log(`<${path}> @${current[vidKey]}`);
    if (current[entriesKey] !== neverVal) {
      Object.entries(current[entriesKey]).forEach(([k, v]) => {
        this.debug(v, `${path}.${k}`);
      });
    } else {
      obj.forEach(ss => {
        console.log(` @${ss[vidKey]} | ${ss[valueKey]}`);
      });
    }
  }

}
