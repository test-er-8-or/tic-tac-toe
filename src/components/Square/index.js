import React from 'react'
import styled from 'styled-components'
import { isUndefined } from 'ramda-adjunct'

const StyledSquare = styled.div`
  border-color: hsla(0, 0%, 0%, 0.2);
  border-style: solid;
  border-width: 0 ${({ index }) => (index % 3 === 2 ? 0 : '2px')}
    ${({ index }) => (index < 6 ? '2px' : 0)} 0;
  cursor: default;
  font-size: 16vh;
  font-weight: bold;
  line-height: 20vh;
  text-align: center;
  text-transform: uppercase;
`
StyledSquare.defaultName = 'StyledSquare'

const SquarePlayed = styled(StyledSquare)`
  color: ${({ player }) =>
    player === 'x' ? 'hsla(6, 59%, 50%, 1)' : 'hsla(145, 63%, 32%, 1)'};
`
SquarePlayed.defaultName = 'SquarePlayed'

const SquareLost = styled(StyledSquare)`
  color: hsla(0, 0%, 90%, 1);
`
SquareLost.defaultName = 'SquareLost'

const SquarePlayable = styled(StyledSquare)`
  cursor: pointer;
`
SquarePlayable.defaultName = 'SquarePlayable'

export default function Square ({
  handleClick,
  index,
  isWinningSquare,
  player
}) {
  if (isUndefined(isWinningSquare)) {
    return isUndefined(player) ? (
      <SquarePlayable index={index} onClick={handleClick} />
    ) : (
      <SquarePlayed index={index} player={player}>
        {player}
      </SquarePlayed>
    )
  }

  if (isUndefined(player)) {
    return <StyledSquare index={index} />
  }

  return isWinningSquare ? (
    <SquarePlayed index={index} player={player}>
      {player}
    </SquarePlayed>
  ) : (
    <SquareLost index={index} player={player}>
      {player}
    </SquareLost>
  )
}
