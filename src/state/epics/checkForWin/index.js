import { of } from 'rxjs'
import { mergeMap, withLatestFrom } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { head, length, union } from 'ramda'
import { isNonEmptyArray } from 'ramda-adjunct'

import { gameOver } from '../../actions'
import { SQUARE_CLICKED } from '../../constants'
import { getMoves } from '../../selectors'
import { getBoard, getWins } from '../../../utilities'

export default function checkForWinEpic (action$, state$) {
  return action$.pipe(
    ofType(SQUARE_CLICKED),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const moves = getMoves(state)
      const plays = length(moves)

      if (plays < 5) {
        return of()
      }

      const board = getBoard(moves)
      const wins = getWins(board)

      if (isNonEmptyArray(wins)) {
        const squares = length(wins) < 2 ? head(wins) : union(...wins)
        const player = board[head(squares)]

        return of(gameOver(squares, player))
      }

      if (plays > 8) {
        return of(gameOver([]))
      }

      return of()
    })
  )
}
