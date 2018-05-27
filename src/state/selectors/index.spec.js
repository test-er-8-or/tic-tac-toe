import { getMoves, getWinningPlayer, getWinningSquares } from '.'

describe('state:selectors', () => {
  describe('getMoves', () => {
    it('extracts the moves array from the state', () => {
      const moves = [4, 0, 2]
      const state = { moves }

      expect(getMoves(state)).toBe(moves)
    })
  })

  describe('getWinningPlayer', () => {
    it('extracts the moves array from the state', () => {
      const winningPlayer = 'x'
      const state = { winningPlayer }

      expect(getWinningPlayer(state)).toBe(winningPlayer)
    })
  })

  describe('getWinningSquares', () => {
    it('extracts the moves array from the state', () => {
      const winningSquares = [0, 3, 6]
      const state = { winningSquares }

      expect(getWinningSquares(state)).toBe(winningSquares)
    })
  })
})
