import { gameOver, squareClicked } from './actions'
import { GAME_OVER, SQUARE_CLICKED } from './constants'
import { initialState, rootReducer } from './reducers'
import { getMoves, getWinningPlayer, getWinningSquares } from './selectors'
import configureStore from './store'

export {
  configureStore,
  GAME_OVER,
  gameOver,
  getMoves,
  getWinningPlayer,
  getWinningSquares,
  initialState,
  rootReducer,
  SQUARE_CLICKED,
  squareClicked
}
