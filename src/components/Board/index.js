import styled from 'styled-components'

const Board = styled.div`
  align-self: center;
  display: grid;
  grid-area: board;
  grid-gap: 0;
  grid-template-areas: 'zero one two' 'three four five' 'six seven eight';
  grid-template-columns: 20vh 20vh 20vh;
  grid-template-rows: 20vh 20vh 20vh;
  height: 60vh;
  justify-self: center;
  margin: auto;
  width: 60vh;
`
Board.displayName = 'Board'

export default Board
