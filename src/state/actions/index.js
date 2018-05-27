import { GAME_OVER, SQUARE_CLICKED } from '..'

function gameOver (squares, player) {
  return {
    type: GAME_OVER,
    payload: {
      winners: {
        squares,
        player
      }
    }
  }
}

function squareClicked (square) {
  return {
    type: SQUARE_CLICKED,
    payload: {
      square
    }
  }
}

export { gameOver, squareClicked }
