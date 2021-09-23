# hibou.js

A scalable state container module


## Usage

```typescript
import { createContext } from './src/core';

// creates a context instance
const context = createContext({
  init: obj
});
```

### Initial Config

* **init** `required <object>`
  
  Initial value of the state.

* **actions** `optional <object>`

  Defines several functions which receives the previous state and perhaps, more parameters, returns part of the next state.

* **asyncActions** `optional <object>`

  Like those in **actions**, this is a set of named functions which computes the state too. However, it only contains `AsyncFunction`s, usually depending on network requests or timers.

* **adapters** `optional <object>`

  Defines several functions which returns a value computed from the current state.
  **WARNING**: a method of **adapters** must be named as `/get[A-Z].*/`.

* **emitters** `optional <object>`

  Describes several functions which may brings payload. Their name will be the event name used when trigger an emitting.


## APIs

### actions

Methods to generate a new action to update the state. It includes three kind of methods -

1. **Common Actions**

  These methods are all named as the functions passed to `createContext()` as `actions` when the context is initialized.

  Actions generated from these methods will be batched to fewer updates, thus the update and the return value of the method called is async.
  
  example:

  ```typescript
  const context = createContext({
    init: initialState,
    actions: {
      plus: (s, n: number = 1) => ({
        num: s.num + n
      })
    }
  });
  
  // The two calling as follow will be batched as one update, they both return a Promise instance
  context.actions.plus();
  context.actions.plus(2);
  ```

2. **Synchronized Actions**
  
  These methods are derivate ones corresponding to each Common Action.
  
  A method named `foo` will generate a synchronized caller `fooSync` (concat with a `-Sync` suffix). Unlike Common Actions, calling a Synchronized Actions will always causes an update. The state will be immediately updated and so will the listeners be triggered.

  A Synchronized Action returns a snapshot of the updated state.

  example:

  ```typescript
  const context = createContext({
    init: initialState,
    actions: {
      plus: (s, n: number = 1) => ({
        num: s.num + n
      })
    }
  });
  
  // The two calling as follow will both cause a new update and return an immediate value
  context.actions.plusSync();
  context.actions.plusSync(2);
  ```

3. **ASync Actions**

  An Async Action is an `AsyncFunction` which will return a partial state.

  These methods are all named as the functions passed to `createContext()` as `asyncActions`
  when the context is initialized. Like Common Actions, dispatching of Async Actions will be batched.

  example:

  ```typescript
  const context = createContext({
    init: initialState,
    asyncActions: {
      asyncPlus: async (getState, id: string) => {
        const num = await get(`/xxx?id=${id}`).then(res => res.data);
        return {
          num: getState().num + num
        };
      }
    }
  });
  
  context.actions.asyncPlus('abc');
  ```


### computed

Computed values.

These methods are all named from the functions passed to `createContext()` as `adapters`
when the context is initialized. A method named `getVal` will generate a getter `val` (removed the `get-` prefix and uncapitalized).

example:

```typescript
const context = createContext({
  init: initialState,
  adapters: {
    getDoubleNum: s => {
      return s.num2;
    }
  }
});

const { doubleNum } = context.computed;
```


### emit(eventName[, payload])

Emits an event, may be bound with a payload.

An emitting will not cause unknown change of the state.

example:

```typescript
const context = createContext({
  init: initialState,
  emitters: {
    xxxEvent: () => 0,
    numEvent: (num: number) => 0
  }
});

context.emit('xxxEvent');
context.emit('numEvent', 2);
```


### listen(eventName, callback)

Appends a listener.

Callback will be triggered when the corresponding event is emitted.

```typescript
const context = createContext({
  init: initialState,
  emitters: {
    xxxEvent: () => 0,
    numEvent: (num: number) => 0
  }
});

context.listen('xxxEvent', () => {
  console.log('xxxEvent is emitted');
});
context.listen('numEvent', num => {
  console.log(`numEvent is emitted, payload is ${num}`);
});
```


### once(eventName, callback)

Appends a listener which will be unmounted after the callback is triggered.

```typescript
const context = createContext({
  init: initialState,
  emitters: {
    xxxEvent: () => 0,
    numEvent: (num: number) => 0
  }
});

context.once('xxxEvent', () => {
  console.log('xxxEvent is emitted');
});
context.once('numEvent', num => {
  console.log(`numEvent is emitted, payload is ${num}`);
});
```


### state

Returns the readonly snapshot of the current state.


### subscribe(callback)

Appends a listener, the callback will be triggered when the state is updated.

The optional second parameter is an array including several getters/adapters. Only when a member in the array changed after an update will the callback be called.

example:

```typescript
context.subscribe(() => {
  // this will be called when the state is updated
  console.log('called 1');
});

context.subscribe(() => {
  // this will only be called when state.name OR state.inner.id is changed
  console.log('called 2');
}, [s => s.name, s => s.inner.id]);

context.subscribe(() => {
  // this is INVALID since the callback can NEVER be called
  console.log('called 3');
}, []);
```


### travel

Time-travel methods.

#### travel.at(idx)

**Returns** the state at the idx-th version.

This will NOT apply any changes to the state.

#### travel.go(idx)

**Resets** the state to the idx-th version.

Calling `clearForward()` or making any updating will delete all the records in front of the idx-th version.

#### travel.move(idx)

Resets the state to the certain version from the current one. Version moves forward if `idx` is positive.

Calling `clearForward()` or making any updating will delete all the records in front of the idx-th version.

#### travel.prev()

Resets the state to the previous version of the current one.

Calling `clearForward()` or making any updating will delete all the records in front of the target version.

#### travel.next()

Resets the state to the next version of the current one.

Calling `clearForward()` or making any updating will delete all the records in front of the target version.

#### travel.backFor([actionName, ]count)

Resets the state back to the version in which the given action is dispatched.

Calling `clearForward()` or making any updating will delete all the records in front of the target version.


#### travel.backTill([actionName, ]count)

Resets the state back right before a version in which the given action is dispatched.

Calling `clearForward()` or making any updating will delete all the records in front of the target version.

#### travel.forwardFor([actionName, ]count)

Resets the state forward to the version in which the given action is dispatched.

Calling `clearForward()` or making any updating will delete all the records in front of the target version.

#### travel.forwardTill([actionName, ]count)

Resets the state forward right before a version in which the given action is dispatched.

Calling `clearForward()` or making any updating will delete all the records in front of the target version.

#### travel.latest()

Resets the state to the latest version, if the current version is moved back and not overwritten.

#### travel.clearForward()

Deletes all the versions in front of the current version.


### unsubscribe(callback)

Removes a listener.
