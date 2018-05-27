import getBoard from '.'

describe('utilities:getBoard', () => {
  it('returns the correct board given a set of moves', () => {
    const moves = [0, 4, 1, 3, 2]

    expect(getBoard(moves)).toMatchObject([
      'x',
      'x',
      'x',
      'o',
      'o',
      undefined,
      undefined,
      undefined,
      undefined
    ])
  })
})
