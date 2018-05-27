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
