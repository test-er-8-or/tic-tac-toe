import { SQUARE_CLICKED } from '..'

function squareClicked (square) {
  return {
    type: SQUARE_CLICKED,
    payload: {
      square
    }
  }
}

export { squareClicked }
