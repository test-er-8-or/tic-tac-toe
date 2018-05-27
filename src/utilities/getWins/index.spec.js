import getWins from '.'

describe('utilities:getWins', () => {
  it('returns an empty array when there are no wins', () => {
    const board = [
      'x',
      'o',
      'x',
      'o',
      'x',
      'o',
      undefined,
      undefined,
      undefined
    ]
    const wins = []

    expect(getWins(board)).toEqual(wins)
  })

  it('returns a array with the winning pattern when there is a single win', () => {
    const board = ['x', 'o', 'x', 'o', 'x', 'o', 'x', undefined, undefined]
    const wins = [[2, 4, 6]]

    expect(getWins(board)).toEqual(wins)
  })

  it('returns a array with two winning patterns when there are two wins', () => {
    const board = ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o', 'x']
    const wins = [[0, 4, 8], [2, 4, 6]]

    expect(getWins(board)).toEqual(wins)
  })
})
