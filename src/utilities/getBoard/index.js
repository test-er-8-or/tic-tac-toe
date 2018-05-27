import { identity, map, times } from 'ramda'

import { getPlayer } from '..'

export default function getBoard (moves) {
  return map(square => getPlayer(square, moves), times(identity, 9))
}
