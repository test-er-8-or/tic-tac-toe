import { gameOver, squareClicked } from './actions'
import { GAME_OVER, SQUARE_CLICKED } from './constants'
import { initialState, rootReducer } from './reducers'
import { getMoves } from './selectors'
import configureStore from './store'

export {
  configureStore,
  GAME_OVER,
  gameOver,
  getMoves,
  initialState,
  rootReducer,
  SQUARE_CLICKED,
  squareClicked
}
