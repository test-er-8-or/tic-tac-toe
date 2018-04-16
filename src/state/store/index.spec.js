import configureStore from '.'

describe('state:store', () => {
  describe('configureStore', () => {
    it('creates a store', () => {
      expect(configureStore()).toHaveProperty('getState')
      expect(configureStore()).toHaveProperty('dispatch')
      expect(configureStore()).toHaveProperty('subscribe')
    })
  })
})
