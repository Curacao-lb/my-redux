function createStore(reducer, enhancer) {

  // 当传入enhancer时，增强 store
  if (enhancer) {
    return enhancer(createStore)(reducer)
  }

  let state = null
  let listeners = []

  function dispatch(action) {
    // 改变 state
    state = reducer(state, action)
    // 让 listener 执行
    listeners.forEach(listener => listener())
  }

  function getState() {
    return state
  }

  // 把 listener 放进去，并且返回解除订阅的一个函数
  function subscribe(listener) {
    listeners.push(listener)

    return function unsubscribe() {
      listeners = listeners.filter(l => l !== listener)
    }
  }

  dispatch({
    type: 'INIT'
  })

  return {
    dispatch,
    getState,
    subscribe
  }
}


// 测试用例

// applyMiddleware(a, b, c ...)
// createStore(reducer, applyMiddleware(a, b, c ...))
// 类似高阶函数写法
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer) => {
    const store = createStore(reducer)

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => store.dispatch(action, ...args)
    }

    // 中间件函数的执行链
    const middlewareChain = middlewares.map(middleware => middleware(middlewareAPI))

    const dispatch = compose(...middlewareChain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}

// 通过中间件 middleware，来增强 dispatch 的功能
function middleware(dispatch, getState) {
  return (next) => {
    return (action) => {
      // 下一个中间件，实现中间件的串行调用
      next(action)
    }
  }
}

function compose(...funcs) {
  if (funcs?.length === 0) {
    // 没有中间件
    return (args) => args
  }

  if (funcs?.length === 1) {
    // 只有一个中间件
    return funcs[0]
  }

  // 多个中间件
  return funcs.reduce((pre, next) => (...args) => pre(next(...args)))
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'inc':
      return state + 1
    case 'dec':
      return state - 1
    default:
      return 0
  }
}

const store = createStore(reducer, applyMiddleware(logger))

const { subscribe, dispatch, getState } = store

subscribe(() => {
  const state = getState()
  console.log(state);
})

dispatch({
  type: 'inc'
})

function logger({ dispatch, getState }) {
  return next => action => {
    const preState = getState()
    console.log('start logger');
    console.log('pre state', preState)
    console.log('action', action);
    const result = next(action)
    const nextState = getState()
    console.log('next state', nextState)

    return result
  }
}