import { applyMiddleware, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createEpicMiddleware } from 'redux-observable'

import { rootReducer as reducer } from '..'
import { checkForWinEpic } from '../epics'

const epicMiddleware = createEpicMiddleware(checkForWinEpic)
const baseMiddleware = applyMiddleware(epicMiddleware)
const middleware = composeWithDevTools(baseMiddleware)

export default function configureStore () {
  return createStore(reducer, middleware)
}
