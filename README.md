# Checking for a winner

This is a long one, and we cover a lot of new code and new ideas, so take your time, move slowly, look carefully, and think about what it all means. Be careful not to miss changes. Computers are notoriously unforgiving. One character out of place and it probably won't work.

As you must know, you win in Tic-Tac-Toe (AKA Noughts & Crosses) by marking three squares in a row with your mark, either vertically, horizontally, or diagonally.

Our squares are numbered like this:

```
 0 | 1 | 2
-----------
 3 | 4 | 5
-----------
 6 | 7 | 8
````

That means that there are eight possible wins:

1. `[ 0, 1, 2 ]`
1. `[ 3, 4, 5 ]`
1. `[ 6, 7, 8 ]`
1. `[ 0, 3, 6 ]`
1. `[ 1, 4, 7 ]`
1. `[ 2, 5, 8 ]`
1. `[ 0, 4, 8 ]`
1. `[ 2, 4, 6 ]`

But there's a problem. Can you spot it? 

It is this: our state contains a list of _moves_. Here's a sample game: `[0, 4, 6, 3, 5, 2, 1, 7, 8]`. The even-numbered indexes (0, 2, etc.) represent X moves; the odd-numbered indexes (1, 3, etc.) represent O moves. But we don't have a board in our state, so, for example, if `0-1-2` is a win, we'd have to check that 0, 1, and 2 were all in the moves array, _but also that they all appeared in either even-numbered spots (X wins) or odd-numbered spots (O wins), not a mix of the two!_

```
[ 0, 4, 6, 3, 5, 2, 1, 7, 8 ]
  x  o  x  o  x  o  x  o  x
```

Here you can see that 0 and 1 were played by `x`, but 2 was played by `o`, so `[ 0, 1, 2 ]` is _not_ a win despite all three squares having been played.

There are a few other things to consider. For example, do we need to check for a win on every move? Obviously not. You can't win on the first move, for example. So how many moves must take place before someone can win?

Remember that we're going to have X make the first move. So a minimum of 5 moves (3 X, 2 O) is necessary for a win. Put another way, X _could_ win on move 5, 7, or 9; O could win on move 6 or 8. There can never be more than 9 moves as there are only 9 squares.

We could add a board array to our state, but then we'd have to track both moves and the board. What if we get them out of whack somehow? We want a _single source of truth_.

So we need to be able either to determine the win directly from the `moves` array, or to convert it on the fly after each move into something like a board so we can check for a win.

Let's try it and see how difficult it is.

## Generating a game board on the fly

[Ramda](http://ramdajs.com/) is your friend. Functions for everything! Remember this one?

```javascript
times(identity, 9) // yields [0, 1, 2, 3, 4, 5, 6, 7, 8]
```

[Try it](http://ramdajs.com/repl/?v=0.25.0#?times%28identity%2C%209%29)

So that gives us a board with the numbers of the squares. Now we need to "map" our players moves to the board. If only we had a way to convert a move to a player! Oh, wait. Remember this utility function?

```javascript
// src/utilities/getPlayer/index.js
import { indexOf } from 'ramda'

export default function getPlayer (square, moves = []) {
  const move = indexOf(square, moves)

  if (move < 0) {
    return undefined
  }

  return move % 2 === 0 ? 'x' : 'o'
}
```

Couldn't we use that and our `moves` array from our state? Let's say this is our `moves` array: `[0, 4, 1, 3, 2]`. That's a win for X, by the way. It's a board that would look like this:

```
 X | X | X
-----------
 O | O |
-----------
   |   |
```

That should yield a board array like this: `['x', 'x', 'x', 'o', 'o', undefined, undefined, undefined, undefined]`.

So let's add a `getBoard` utility function. We'll need a `src/utilities/getBoard` folder, and we'll start with a `src/utilities/getBoard/index.spec.js` file. Here's our code:

```javascript
// src/utilities/getBoard/index.spec.js
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
```

It fails, of course. Now let's use our `times(identity, 9)` board and map through it checking each square against the `moves` array we passed in, and returning a _new_ array in which the square either contains a player or is undefined. Create `src/utilities/getBoard/index.js` and add this code:

```javascript
// src/utilities/getBoard/index.js
import { identity, map, times } from 'ramda'

import { getPlayer } from '..'

export default function getBoard (moves) {
  return map(square => getPlayer(square, moves), times(identity, 9))
}
```

And our test passes. It's a simple utility function (all the best are), so it even passes 100% coverage. Good time for a commit. But first, let's add our import/export to `src/utilities/index.js`:

```javascript
// src/utilities/index.js
import getBoard from './getBoard'
import getPlayer from './getPlayer'

export { getBoard, getPlayer }
```

Now:

```bash
git add -A
git commit -m "Add the getBoard utility function"
git push
```

## Checking for wins

Let's take our winning patters from above and convert them to an array of arrays:

```javascript
const patterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]
```

Now, all we need to do is filter on those patterns and return any in which all three squares have the same player in them. So what we want to know is:

1. Is there a player's mark in the first square of the three, i.e., is it a move? AND
1. Does the first square have the same mark as the second square? AND
1. Does the second square have the same mark as the third square?

Let's create yet another utility function, this one called `getWins`. It will take the current board and return an array of the winning pattern(s), if any. We'll need a `src/utilities/getWins` folder and a `src/utilities/getWins/index.spec.js` file. We'll write a test:

```javascript
// src/utilities/getWins/index.spec.js
import getWins from '.'

describe('utilities:getWins', () => {
  it('returns a array with the winning pattern when there is a single win', () => {
    const board = ['x', 'o', 'x', 'o', 'x', 'o', 'x', undefined, undefined]
    const wins = [[2, 4, 6]]

    expect(getWins(board)).toEqual(wins)
  })
})
```

That's a win along the diagonal from top right to bottom left. Note that the `getWins` function should return an array _of arrays_, because there can be more than one winning trinity. Now let's make it rain.

We will run filter on our _patterns_, comparing to the board in success. IF the first square is not `undefined` AND the first square belongs to the same player as the second AND the second square belongs to the same player as the third, THEN we will include that win pattern in the output. Create `src/utilities/getWins/index.js` and add this code:

```javascript
// src/utilities/getWins/index.js
import { filter } from 'ramda'

const patterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

export default function getWins (board) {
  return filter(pattern => {
    const [s1, s2, s3] = pattern

    return (
      Boolean(board[s1]) && board[s1] === board[s2] && board[s2] === board[s3]
    )
  }, patterns)
}
```

Great! Let's extend our tests to include a board that has no win (empty array out) and one with two wins. Here's our new `src/utilities/getWins/index.spec.js`:

```javascript
// src/utilities/getWins/index.spec.js
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
```

That should cover us, and indeed test coverage is 100%. Now let's add our `getWins` function to our utilities import/export in `src/utilities/index.js`:

```javascript
// src/utilities/index.js
import getBoard from './getBoard'
import getPlayer from './getPlayer'
import getWins from './getWins'

export { getBoard, getPlayer, getWins }
```

Check our tests, and time for a commit.

```bash
git add -A
git commit -m "Add a getWins utility function"
git push
```

## Updating the state

So now we have a utility function that will give us an array of winning combinations. It may return an empty array if no one has won (yet). It may return an array with a single winning combination of squares, which is itself an array. (We call this a two-dimensional array, that is, an array of arrays.) Or, in remote cases, there will be two winning combinations. There will never be three.

A little thought tells us that X, who moves first, will get a maximum of five plays, and that O, who always moves second, will get a maximum of four plays. There are, after all, only nine squares.

As two winning combinations means `2 * 3 === 6`, six squares, it should be obvious that the two combinations must share at least one square, and that the only player who can ever achieve this "double play" is X. If you draw the eight possible wins on the board you will also see that no two combinations ever share _more than one square_.

Keep thinking. Even if it were possible for a player to make plays in six squares, it would still not be possible to have two winning combinations because that would require moving in two squares simultaneously. Otherwise, the first winning combination would end the game, and there would never be another. This leads us to another realisation, which is that the last square played in a double win _must be the shared square_.

Finally, looking at the board, you can see that any square could be the winning square, and that this variously leads to a plus shape, an X shape, an L shape, or a T shape (the L and T might be rotated 90, 180, or 270 degrees). Want to play a game with a double win, maybe for testing? Start in an outer square and go around the outer edge in order in either direction, then play the center square last. That will give you an x or a + win, depending on whether you started in a corner (x) or a side (+) square.

Here are three possible outputs from our `getWins` function:

```jasvascript
[]                      // no winner (yet)
[[0, 1, 2]]             // top row
[[0, 1, 2], [0, 3, 6]]  // top row, left column
```

Once we have this output, we're going to want to store it in the state. Might also be nice to store the winning player, X or O. Also, we don't actually need an array of arrays. All we care about is which squares were part of the win, so we can _flatten_ our wins array and remove duplicates. That would make `[[0, 1, 2], [0, 3, 6]]` look like this `[0, 1, 2, 3, 6]`.

Our state is managed by Redux, and the way we update it is by dispatching an "action" to our Redux store. Our actions, as you may recall, take the form:

```javascript
{
  type: 'NAME_OF_TYPE',
  payload: {
    // some payload
  },
  meta: {
    // optional metadata
  }
}
```

So first thing we'll need is an action type. Let's call it `GAME_OVER`. We'll add it to `src/state/constants.js`:

```javascript
// src/state/constants.js
export const GAME_OVER = 'GAME_OVER'
export const SQUARE_CLICKED = 'SQUARE_CLICKED'
```

You may have noticed that I like to keep things in alphabetical order. This makes it easier to find things when our files get a bit larger and more complex.

We'll want to add this to our `src/state/index.js` imports and exports:

```javascript
// src/state/index.js
import { squareClicked } from './actions'
import { GAME_OVER, SQUARE_CLICKED } from './constants'
import { initialState, rootReducer } from './reducers'
import { getMoves } from './selectors'
import configureStore from './store'

export {
  configureStore,
  GAME_OVER,
  getMoves,
  initialState,
  rootReducer,
  SQUARE_CLICKED,
  squareClicked
}
```

Again, note that my exports are alphabetised, and my imports are alphabetised _by filename_, so they align with the files in the navigation tree in my VSCode editor. You may find this a bit much, but I find it makes finding things easier when I come back to my code later.

What will our state look like after the above array of winning combinations is returned from our `getWins` function. We want to store the winning squares and the winning player, right? So why not something like this:

```javascript
const state = {
  moves: [1, 4, 2, 5, 3, 7, 6, 8, 0],
  winningSquares: [0, 1, 2, 3, 6],
  winningPlayer: 'x'
}
```

Or, here is a simpler win by O:

```javascript
const state = {
  moves: [3, 4, 0, 6, 1, 2],
  winningSquares: [2, 4, 6],
  winningPlayer: 'o'
}
```

We can simply pass the `winningSquares` and the `winningPlayer` into our action's `payload`:

```javascript
const action = {
  type: GAME_OVER,
  payload: {
    winningSquares: [0, 1, 2, 3, 6],
    winningPlayer: 'x'
  }
}
```

I chose the double win here to show that we only need to store the winning squares, not the winning combinations, but we could do it either way.

So let's create our action creator test first. Change `src/state/actions/index.spec.js` to this:

```javascript
// src/state/actions/index.spec.js
import { gameOver, squareClicked } from '.'
import { GAME_OVER, SQUARE_CLICKED } from '..'

describe('state:actions', () => {
  describe('gameOver', () => {
    it('produces the correct action when the game is over', () => {
      const squares = [0, 4, 8, 2, 6]
      const player = 'x'

      expect(gameOver(squares, player)).toMatchObject({
        type: GAME_OVER,
        payload: {
          winners: {
            squares,
            player
          }
        }
      })
    })
  })

  describe('squareClicked', () => {
    it('produces the correct action for clicking a Square', () => {
      const square = 4

      expect(squareClicked(square)).toMatchObject({
        type: SQUARE_CLICKED,
        payload: {
          square: 4
        }
      })
    })
  })
})
```

We'll keep the action simple, with just `squares` and `player`. Run the tests with `yarn test` and it will fail, of course. Now let's add the `gameOver` action creator to make this test pass. In `src/state/actions/index.js`:

```javascript
// src/state/actions/index.js
import { GAME_OVER, SQUARE_CLICKED } from '..'

function gameOver (squares, player) {
  return {
    type: GAME_OVER,
    payload: {
      winners: {
        squares,
        player
      }
    }
  }
}

function squareClicked (square) {
  return {
    type: SQUARE_CLICKED,
    payload: {
      square
    }
  }
}

export { gameOver, squareClicked }
```

And now the tests pass. Add it to our `src/state/index.js` imports and exports:

```javascript
// src/state/index.js
import { gameOver, squareClicked } from './actions'
import { GAME_OVER, SQUARE_CLICKED } from './constants'
import { initialState, rootReducer } from './reducers'
import { getMoves } from './selectors'
import configureStore from './store'

export {
  configureStore,
  GAME_OVER,
  gameOver,
  getMoves,
  initialState,
  rootReducer,
  SQUARE_CLICKED,
  squareClicked
}
```

And we're good to go. But we'll need to consume this action in the reducer, so let's do that next, after a commit:

```bash
git add -A
git commit -m "Add gameOver action creator"
git push
```

## Handling the GAME_OVER action

So our reducer will take the `squares` and `player` from the `GAME_OVER` action payload and store them in the state as `winningSquares` and `winningPlayer` respectively, flattening out our `winners` object from the payload. We'll start with the tests, of course. Let's make `src/state/reducers/index.spec.js` look like this:

```javascript
// src/state/reducers/index.spec.js
import { initialState, rootReducer } from '.'
import { gameOver, squareClicked } from '..'

describe('state:reducers', () => {
  describe('rootReducer', () => {
    it('defaults to the initialState', () => {
      expect(rootReducer(undefined, {})).toBe(initialState)
    })

    it('handles an unknown action type by returning the state unchanged', () => {
      const state = 'state'

      expect(rootReducer(state, {})).toBe(state)
    })

    it('handles a move by appending the Square number to the moves array', () => {
      const state = {
        moves: [4, 0]
      }

      expect(rootReducer(state, squareClicked(2))).toMatchObject({
        moves: [4, 0, 2]
      })
    })

    it('returns the state unchanged when the square is not supplied', () => {
      const state = {
        moves: [4, 0]
      }

      expect(rootReducer(state, squareClicked())).toMatchObject({
        moves: [4, 0]
      })
    })

    it('adds the winningSquares and the winningPlayer, if any, on GAME_OVER', () => {
      const state = {
        moves: [0, 1, 2, 3, 4, 5, 6]
      }

      expect(rootReducer(state, gameOver([2, 4, 6], 'x'))).toMatchObject({
        moves: [0, 1, 2, 3, 4, 5, 6],
        winningSquares: [2, 4, 6],
        winningPlayer: 'x'
      })
    })
  })
})
```

Note that last test. That's our new one. Run the tests with `yarn test` and it fails. Now we'll add the code to make it pass to the reducer in `src/state/reducers/index.js`:

```javascript
// src/state/reducers/index.js
import { isUndefined } from 'ramda-adjunct'

import { GAME_OVER, SQUARE_CLICKED } from '..'

const initialState = { moves: [] }

function rootReducer (state = initialState, { payload = {}, type }) {
  const { square, winners: { squares, player } = {} } = payload

  switch (type) {
    case GAME_OVER:
      return {
        ...state,
        winningSquares: squares,
        winningPlayer: player
      }
    case SQUARE_CLICKED:
      return {
        ...state,
        moves: isUndefined(square) ? state.moves : [...state.moves, square]
      }
    default:
      return state
  }
}

export { initialState, rootReducer }
```

That makes the tests pass. We haven't added any exports, so no need to change `src/state/index.js` this time. Let's do a commit:

```bash
git add -A
git commit -m "Update reducer for GAME_OVER action"
git push
```

## Retrieving the winningGames and winningPlayer from state

We still need a way to get these values back out of our state, and that means selectors. We'll add a couple of tests to `src/state/selectors/index.spec.js` to test that our selectors work:

```javascript
// src/state/selectors/index.spec.js
import { getMoves, getWinningPlayer, getWinningSquares } from '.'

describe('state:selectors', () => {
  describe('getMoves', () => {
    it('extracts the moves array from the state', () => {
      const moves = [4, 0, 2]
      const state = { moves }

      expect(getMoves(state)).toBe(moves)
    })
  })

  describe('getWinningPlayer', () => {
    it('extracts the moves array from the state', () => {
      const winningPlayer = 'x'
      const state = { winningPlayer }

      expect(getWinningPlayer(state)).toBe(winningPlayer)
    })
  })

  describe('getWinningSquares', () => {
    it('extracts the moves array from the state', () => {
      const winningSquares = [0, 3, 6]
      const state = { winningSquares }

      expect(getWinningSquares(state)).toBe(winningSquares)
    })
  })
})
```

(Note the second and third tests.) These fail as expected, so we update `src/state/selectors/index.js` to add the selectors to make the tests pass:

```javascript
// src/state/selectors/index.js
export function getMoves ({ moves }) {
  return moves
}

export function getWinningPlayer ({ winningPlayer }) {
  return winningPlayer
}

export function getWinningSquares ({ winningSquares }) {
  return winningSquares
}
```

Pretty simple, eh? Tests pass, and because we've added new exports, we need to update the `src/state/index.js` file:

```javascript
// src/state/index.js
import { gameOver, squareClicked } from './actions'
import { GAME_OVER, SQUARE_CLICKED } from './constants'
import { initialState, rootReducer } from './reducers'
import { getMoves, getWinningPlayer, getWinningSquares } from './selectors'
import configureStore from './store'

export {
  configureStore,
  GAME_OVER,
  gameOver,
  getMoves,
  getWinningPlayer,
  getWinningSquares,
  initialState,
  rootReducer,
  SQUARE_CLICKED,
  squareClicked
}
```

Now we can create an action on game over, update the state with the winning squares and player, and retrieve those values from the state. What remains is to somehow trigger the `getWins` function and, if it returns one or two winning combinations, or there are no more squares to play, then we want to dispatch our action and update our state accordingly. We'll get to that next.

Meanwhile, notice how _simple_ our application really is. Scroll back up and look at our state objects after a win. Nothing complex, right? A list of moves by the number of the square played, a list of winning squares, a winning player.

Or check out our selectors. We destructure the simple state and just return the part we want. Our action creators are similarly simple, and our reducer just updates the state accordingly. It may seem like a lot of moving parts, but it's not, really. Actions to get data into the state, a reducer to update it, and selectors to get the data back out again.

As for the React components, they, too, are fairly simple and clean. Each creates a part of the view based on the props. The props are updated when the state changes (we extract some of them from the state using `mapStateToProps`), so the HTML output becomes nothing more than _a projection of the state into the view_. And that's the way we want it. It's much simpler than Model-View-Whatever. Essentially, it's just a view and a state machine.

Let's do a commit:

```bash
git add -A
git commit -m "Add getWinningPlayer and getWinningSquares selectors"
git push
```
