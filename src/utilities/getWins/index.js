import { filter } from 'ramda'

const patterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

export default function getWins (board) {
  return filter(pattern => {
    const [s1, s2, s3] = pattern

    return (
      Boolean(board[s1]) && board[s1] === board[s2] && board[s2] === board[s3]
    )
  }, patterns)
}
