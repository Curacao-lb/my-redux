function createStore(reducer) {
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

const store = createStore(reducer)

const { subscribe, dispatch, getState } = store

subscribe(() => {
  const state = getState()
  console.log(state);
})

dispatch({
  type: 'inc'
})