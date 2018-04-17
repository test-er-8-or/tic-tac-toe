import React from 'react'
import { shallow } from 'enzyme'
import configureStore from 'redux-mock-store'

import Square from '.'
import { initialState, SQUARE_CLICKED } from '../../state'

const mockStore = configureStore()

describe('containers:Square', () => {
  it(`maps state and dispatch to props`, () => {
    const square = 4
    const store = mockStore({ moves: [0, 3, square] })
    const wrapper = shallow(<Square index={square} store={store} />)

    expect(wrapper.props()).toEqual(
      expect.objectContaining({
        player: 'x',
        handleClick: expect.any(Function)
      })
    )
  })

  it(`maps handleClick to dispatch ${SQUARE_CLICKED} action`, () => {
    const square = 4
    const store = mockStore(initialState)

    store.dispatch = jest.fn()

    const wrapper = shallow(<Square index={square} store={store} />)

    wrapper
      .dive()
      .props()
      .onClick()

    expect(store.dispatch).toHaveBeenCalledWith({
      type: SQUARE_CLICKED,
      payload: {
        square
      }
    })
  })
})
