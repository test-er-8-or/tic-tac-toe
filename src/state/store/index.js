import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'

import { rootReducer } from '..'

export default function configureStore () {
  return createStore(rootReducer, devToolsEnhancer())
}
