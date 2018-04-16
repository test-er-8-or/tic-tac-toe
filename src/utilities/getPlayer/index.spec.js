import getPlayer from '.'

describe('utilities:getPlayer', () => {
  it('returns undefined if moves array not provided', () => {
    expect(getPlayer(4)).toBeUndefined()
  })

  it('returns `x` for even-numbered moves', () => {
    expect(getPlayer(4, [4, 0])).toBe('x')
  })

  it('returns `o` for odd-numbered moves', () => {
    expect(getPlayer(0, [4, 0])).toBe('o')
  })

  it('returns undefined for empty squares (not moved yet)', () => {
    expect(getPlayer(3, [4, 0])).toBeUndefined()
  })
})
