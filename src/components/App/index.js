import React from 'react'
import styled from 'styled-components'

import { Board, Square } from '../'

const StyledApp = styled.div`
  display: grid;
  font-family: 'Verdana', sans-serif;
  grid-template-areas: 'board';
  height: 100vh;
  margin: 0;
  padding: 0;
  width: 100vw;
`

export default function App () {
  return (
    <StyledApp>
      <Board>
        <Square index={0} player='x' />
        <Square index={1} player='o' />
        <Square index={2} player='x' />
        <Square index={3} player='o' />
        <Square index={4} player='x' />
        <Square index={5} player='o' />
        <Square index={6} player='x' />
        <Square index={7} player='o' />
        <Square index={8} player='x' />
      </Board>
    </StyledApp>
  )
}
