import React from 'react'
import { shallow } from 'enzyme'

import App from '.'

describe('components:App', () => {
  it('renders the App with a blank game board and nine squares', () => {
    expect(toJson(shallow(<App />).dive())).toMatchSnapshot()
  })

  it('renders the App with a game board three moves: center, top-left, top-right', () => {
    expect(toJson(shallow(<App moves={[4, 0, 2]} />).dive())).toMatchSnapshot()
  })
})
