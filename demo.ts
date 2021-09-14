import { createContext } from "./src/core";

const obj = {
  num: 12,
  name: 'xyz',
  inner: {
    id: 1 
  }
};

const context = createContext({
  init: obj,
  actions: {
    reset: () => ({
      num: 0
    }),
    plus: (s, n: number = 1) => ({
      num: s.num + n
    }),
    setId: (_, id: number) => ({
      inner: {
        id
      }
    })
  },
  asyncActions: {
    asyncPlus: async (getState, num: number) => {
      await new Promise(res => setTimeout(res, 1000));
      return {
        num: getState().num + num
      };
    }
  },
  adapters: {
    getDoubleNum: s => {
      return s.num * 2;
    }
  },
  emitters: {
    xxxEvent: () => {},
    numEvent: (_: number) => {}
  }
});

const main = () => {
  context.subscribe(() => {
    console.log('update num', context.state.num, ' double =', context.computed.doubleNum);
  }, [s => s.num]);
  context.subscribe(() => {
    console.log('update', context.state.name, context.state.inner);
  }, [s => s.name, s => s.inner.id]);
  context.listen('xxxEvent', () => {
    console.log('xxxEvent');
  });
  // context.actions.plus(10);
  // context.actions.reset();
  // context.actions.plus();
  // context.actions.setId(-1);
  context.actions.plusSync();
  context.actions.plusSync();
  context.actions.setIdSync(2);
  context.actions.plusSync();
  context.actions.setIdSync(3);
  context.actions.plusSync();
  context.actions.setIdSync(4);
  context.actions.plusSync();
  context.actions.setIdSync(5);
  context.actions.plusSync(5);
  // context.actions.asyncPlus(7);
  context.emit('xxxEvent');
  console.log(context.state);
  // context.travel.go(-1);
  context.travel.backFor(2, 'plus');
  console.log(context.state);
  context.travel.forwardTill(2, 'plus');
  console.log(context.state);
};

main();
