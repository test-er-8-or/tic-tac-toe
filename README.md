# Trigger the check for a win

We want to run `getWins` to check for a win each time the player moves&mdash;starting with the fifth move. Remember that it takes five moves&mdash;three by X and two by O&mdash;before anyone can win. X can win on move five, seven, or nine. O can win on move six or eight.

We could add a new prop called `checkForWin` to our connected `Square` container using the `mapDispatchToProps` function that would:

1. Get the `moves` array from the current state after each move
1. Run the `getWins` function on it if the `moves` array had at least five moves in it
1. Dispatch a `gameOver` action if `getWins` returned a winning combination(s), or if every square was played (a tie)

But this complicates our containers and adds potential race conditions (meaning that the order in which the actions are dispatched could be uncertain).

Another option is to do the check when we run the `squareClicked` action, and this might seem like a good place to do it. But it doesn't distinguish the `SQUARE_CLICKED` event and the `GAME_OVER` event. We'd like to keep our events distinct. Each event should dispatch a single action, and each action should represent a single event. Keep things simple.

What we really want is a way to trigger a _second_ action whenever a first action occurs _and_ certain conditions are met. For example, here we want to trigger a `GAME_OVER` action whenever:

1. A `SQUARE_CLICKED` action is dispatched AND
1. A player has won or the game is a tie

How can we do this? We can use `redux-observable` to observe each `SQUARE_CLICKED` action after it goes through the reducer, and then add a `GAME_OVER` action to the stream if the game is, indeed, over.

[redux-observable](https://redux-observable.js.org/) works as "middleware" on our reducer. We'll add this middleware to the store and it will run immediately after the reducer. It will receive the same action and payload that the reducer received, but the _updated_ state (it runs _after_ the reducer). 

In other words our middleware will be passed each `SQUARE_CLICKED` action and its payload, but _after_ the reducer has run, so the state we'll see is the _updated_ state.

`redux-observable` uses [Rx.js](http://reactivex.io/rxjs/) to turn our actions into a "stream" of actions, meaning that our middleware will treat actions as an endless stream of events. It will listen for new actions and treat them as part of that never-ending stream. This is a rather abstract concept and difficult to grasp at first, but don't worry about it. You can use this without fully understanding it, and after you've seen what it does a few times, it will begin to become clear to you. It's both simpler and easier than you might think.

We already installed `redux-observable` and `rxjs` during set up, so now we just need to use them.

The way `redux-observable` works is that we create something called an `epic`. Then we add that epic to the Redux store as "middleware". The store runs the epic every time the reducer is called, but _after_ the reducer runs. (It is also possible for middleware to run _before_ the reducer.)

## Creating our first epic

We'll start with our unit tests. First, you'll need to create a `src/state/epics` folder. In that, add `src/state/epics/index.js`. Then create a subfolder for our first epic, `src/state/epics/checkForWin` and add an index file there, too: `src/state/epics/checkForWin/index.spec.js`.

```javascript
// src/state/epics/checkForWin/index.spec.js
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'

import checkForWinEpic from './'
import { gameOver, squareClicked } from '../../actions'
import { getMoves } from '../../selectors'
import { getBoard, getWins } from '../../../utilities'

jest.mock('../../actions', () => ({
  gameOver: jest.fn().mockReturnValue({ type: 'GAME_OVER' }),
  squareClicked: jest.fn().mockReturnValue({ type: 'SQUARE_CLICKED' })
}))

jest.mock('../../selectors', () => ({
  getMoves: jest
    .fn()
    .mockReturnValueOnce([])                            // no moves
    .mockReturnValueOnce([4, 6, 0, 7])                  // < 5 moves
    .mockReturnValueOnce([4, 6, 0, 7, 1])               // 4 < moves < 9
    .mockReturnValueOnce([4, 6, 0, 7, 8])               // 4 < moves < 9
    .mockReturnValueOnce([0, 1, 2, 4, 3, 5, 7, 6, 8])   // full board
    .mockReturnValue([0, 1, 2, 5, 8, 7, 6, 3, 4])       // full board
}))

jest.mock('../../../utilities', () => ({
  getBoard: jest
    .fn()
    .mockReturnValueOnce([
      'x',
      'x',
      undefined,
      undefined,
      'x',
      undefined,
      'o',
      'o',
      undefined
    ]) // Five plays (no win) [4, 6, 0, 7, 1]
    .mockReturnValueOnce([
      'x',
      undefined,
      undefined,
      undefined,
      'x',
      undefined,
      'o',
      'o',
      'x'
    ]) // Five plays win [4, 6, 0, 7, 8]
    .mockReturnValueOnce(['x', 'o', 'x', 'x', 'o', 'o', 'o', 'x', 'x']) // Tie game [0, 1, 2, 4, 3, 5, 7, 6, 8]
    .mockReturnValue(['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o', 'x']), // Double win [0, 1, 2, 5, 8, 7, 6, 3, 4]
  getWins: jest
    .fn()
    .mockReturnValueOnce() // Check but no win
    .mockReturnValueOnce([[0, 4, 8]]) // Check and win
    .mockReturnValueOnce([]) // Check and tie
    .mockReturnValue([[0, 4, 8], [2, 4, 6]]) // Check and win
}))

describe('epics', function () {
  describe('checkForWin', function () {
    it(`checks for and responds to wins correctly`, function () {
      const epicMiddleware = createEpicMiddleware(checkForWinEpic)
      const store = configureMockStore([epicMiddleware])({})
      const action = squareClicked()

      store.dispatch(action)
      store.dispatch(action)
      store.dispatch(action)
      store.dispatch(action)
      store.dispatch(action)
      store.dispatch(action)

      expect(gameOver.mock.calls).toEqual([
        [[0, 4, 8, 2, 6], 'x'],
        [[0, 4, 8], 'x'],
        [[]],
        [[0, 4, 8, 2, 6], 'x']
      ])
      expect(store.getActions()).toEqual([
        action,
        action,
        action,
        gameOver(),
        action,
        gameOver(),
        action,
        gameOver(),
        action,
        gameOver()
      ])

      epicMiddleware.replaceEpic(checkForWinEpic)
    })
  })
})
```

Let's go through this one step at a time.

```javascript
import configureMockStore from 'redux-mock-store'
import { createEpicMiddleware } from 'redux-observable'
```

Instead of using our real store, we'll use `redux-mock-store` to mock out our store (make a fake one). We'll also need the `createEpicMiddleware` function from `redux-observable` to add our epic middleware to the store as middleware.

```javascript
import checkForWinEpic from './'
import { gameOver, squareClicked } from '../../actions'
import { getMoves } from '../../selectors'
import { getBoard, getWins } from '../../../utilities'
```

The epic we'll be defining next (to make this test pass) is `checkForWinEpic` and will be in an `index.js` file in this folder. In our epic, we'll need access to the `squareClicked` and `gameOver` action creators, the `getMoves` selector, and the utility functions to `getBoard` and `getWins`, so we import these here. The first thing we'll do is override them with mock functions.

The reason for this is that we only want to test our epic, _not_ all the other functions it relies upon. Those are tested elsewhere. Testing only the epic code rather than the epic code _and all subordinate code_ keeps our tests simpler and more focused, and reduces duplication, which saves time, effort, and money.

 ```javascript
jest.mock('../../actions', () => ({
  gameOver: jest.fn().mockReturnValue({ type: 'GAME_OVER' }),
  squareClicked: jest.fn().mockReturnValue({ type: 'SQUARE_CLICKED' })
}))
 ```

 This is how we mock out the `gameOver` and `squareClicked` actions. We use `jest.fn()` to create a mock function and tell it to return a specified value every time the function is called. That the values are not identical to what the real functions would return is irrelevant as we're also mocking the functions to which these actions would be passed.

 ```javascript
jest.mock('../../selectors', () => ({
  getMoves: jest
    .fn()
    .mockReturnValueOnce([4])
    .mockReturnValueOnce([4, 6, 0, 7])
    .mockReturnValueOnce([4, 6, 0, 7, 1])
    .mockReturnValueOnce([4, 6, 0, 7, 8])
    .mockReturnValueOnce([0, 1, 2, 4, 3, 5, 7, 6, 8])
    .mockReturnValue([0, 1, 2, 5, 8, 7, 6, 3, 4])
}))
 ```

 Next we mock the `getMoves` selector, but we have it return different results for each call. This is so that we can test different responses for different inputs. Here we have a single move, then four moves, so no check and no `GAME_OVER` action, right? That's because we won't run our check until we have at least five moves. So here we're testing that moves fewer than five will not trigger the check or result in an `GAME_OVER` action.

 For the remaining four return values, we'll get the board with `getBoard`, then check for wins with `getWins`. Once we check for wins, then there are three possible outcomes:

 1. There is a win or wins: output a `gameOver` action with the winning squares and the player
 1. There is no win, and the game is still playable: do nothing
 1. There is no win, and the game is no longer playable (all squares played): output an empty `gameOver` action

Note that it _really doesn't matter_ **what** we return for the next four tests. It only matters _how many plays_. This is because we're also going to mock the `getBoard` and `getWins` functions, so `getMoves` and the length of the array it returns determine _only_ which conditional branch 


Now in our `src/state/epics/checkForWin/index.js` file, we'll begin by creating our `checkForWinEpic` function and exporting it as the default function:

```javascript
// src/state/epics/checkForWin/index.js
export default function checkForWin () {}
```

While we're at it, let's import it and re-export it in `src/state/epics/index.js`:

```javascript
// src/state/epics/index.js
import checkForWinEpic from './checkForWin'

export { checkForWinEpic }
```

With that taken care of, we can go back to constructing our first epic.

Redux-observable epics receive a _stream_ of Redux actions. The epic can do nothing, or it can add a _new_ action to the stream of actions. The epics run in "middleware" that we'll add to our store in a moment. The redux-observable middleware runs _after_ the reducer. So when the reducer receives our `SQUARE_CLICKED` action with the index of a square on the board, it will add that move to our state's `moves` array, and then return the new state.

At this point the Epic middleware will be called with the same action and the _new_ state. This is the perfect time for us to check whether that move was a winning move, no? In our epic, we'll filter out any actions _other than_ `SQUARE_CLICKED` actions. After each `SQUARE_CLICKED` action, however, we'll run our `getWins` utility function on the `moves` array and see if there are any winning patterns. If there is one (or more) winning pattern, then we'll inject a _new_ action into the stream of actions&mdash;a `GAME_OVER` action. We've already written that action, and updated the reducer to handle it, and even written our selector to get the game state out of our application state. All we need is the trigger.

So, first, the epic will receive as arguments the "stream" of actions, which will indicate with a dollar sign (\$) instead of an s&mdash;`action$`, and the store, which we'll need to retrieve the updated `moves` array. Then we'll use redux-observable's `ofType` method to filter our actions so that only the ones we want get through (those of type `SQUARE_CLICKED`). Then we'll use the `mergeMap` method from Rx.js to apply a function to each action as it comes in&mdash;just like the regular `map` function.

For now we'll pass it an anonymous function that takes the action and just returns an empty "Observable".

What is this Observable? An Observable is simply an object (provided by Rx.js), that wraps another object and gives it super powers. For example, the previously mentioned `ofType` method, which knows to look for the `type` key in the action and retrieve its value, then pass only those actions that match the passed-in value (`SQUARE_CLICKED`). The Redux observable middleware uses Rx.js to wrap each action in an Rx.js Observable before passing it in to our epic, and we must return an Observable-wrapped action back out. We'll use Rx.js's `Observable.of` method to do that.

So in the code below, every time an action is passed to the reducer, _after_ it goes through the reducer it is wrapped in an Observable superpower cloak and passed to our epic along with the store (from which we can get the current state). The `ofType` method checks that the type of the object matches `SQUARE_CLICKED`. If it does, it passes it along to the `mergeMap` method which applies a function to it and then returns a _new_ Observable-wrapped action to the reducer.

You can probably see a potential problem here. Once we pass a new action back to the reducer, won't _action_ also end up back in our epic after going through the reducer? Yes, it will, which means we could chain epics if we wanted to. _But it also means that if we pass the **original** action out of our epic, we'll create an **infinite loop**. As exciting as that sounds, it's actually pretty boring as everything stops working. Then kaboom. Try it if you don't believe it. Just make sure you're heavily insured and standing a safe distance from your laptop!

```javascript
// src/state/epics/checkForWin/index.js
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/of'

import { SQUARE_CLICKED } from '../..'

export default function checkForWinEpic (action$, store) {
  return action$.ofType(SQUARE_CLICKED).mergeMap((action => Observable.of())
}
```

So again:

* `action$` is a stream of actions coming to our epic after they've passed through the reducer and done whatever it is they are wont to do to our application state
* `store` is our store, from which we can get the new state
* `ofType` tests each action against an action type we pass in (here it's `SQUARE_CLICKED`) and only passes the Observable-wrapped action on if its type matches
* `mergeMap` maps the action by taking the function we pass in and applying it to each action in the stream as it arrives, and it takes the Observable we pass back out (here an Observable of nothing) and sends it around again to run through the reducer just like any other action (redux-observable strips the Observable back off of it first)

So now in the function we're passing to `mergeMap` we need to decide whether or not to pass a _new_ action back to the reducer. If the game has not yet been won (or ended in a tie), then we'll pass an empty Observable. But if the game is over, then we'll create a `GAME_OVER` action, wrap it in an Observable, and pass that back to update our state.

For this, we'll need to import our `getMoves` selector to retrieve the moves from the state, and our `gameOver` action creator to update our application state if the game is over. We'll also need our two utility functions, `getBoard` to convert the `moves` array to a game board, and `getWins` to check for winning patterns. And we'll need a few of those clever functions from `ramda` and `ramda-adjunct` to make it easier.

```javascript
// src/state/epics/checkForWin/index.js
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/of'
import { head, length, union } from 'ramda'
import { isNonEmptyArray } from 'ramda-adjunct'

import { getMoves, gameOver, SQUARE_CLICKED } from '../..'
import { getBoard, getWins } from '../../../utilities'

export default function checkForWinEpic (action$, store) {
  return action$.ofType(SQUARE_CLICKED).mergeMap(({ payload }) => {
    const moves = getMoves(store.getState()) // get the moves array from the store
    const plays = length(moves) // length of the moves array tells us how many plays

    if (plays < 5) {
      // do nothing - can't win with fewer than five plays
    }

    const board = getBoard(moves) // convert the moves array to a board array
    const wins = getWins(board)   // get zero or more winning patterns

    if (isNonEmptyArray(wins)) {  // found at least one winning pattern!
      // game over! somebody won
      // return a wrapped gameOver action with the winning squares and the player
    }

    if (plays > 8) { // no more squares to play
      // game over! (it's a tie)
      // return a wrapped empty gameOver action to indicate a tie
    }

    // do nothing (none of the above conditions met)
  })
}
```

Make sure you understand what each line above is doing. Now let's fill in the rest. For fewer than five moves or none of the conditions met, we can simply return an empty Observable: `return Observable.of()`.

For more than eight plays, the board is full and we can return a wrapped and empty `gameOver` action: `return Observable.of(gameOver())`.

The real work is done when we have a non-empty array of wins. That means _somebody won_. **Remember, the wins array is an _array of arrays_, where each inner array is a winning pattern. So we need to flatten out this array to get our winning squares. In other words, if we have one winning pattern&mdash;`[[0, 4, 8]]`&mdash;then we just want to return that inner array. But if we have _two_ winning patterns, we want to return a single array of all the winning squares without any duplicates, and as the most moves any player can make is five, there will always be a duplicate square.

There are many ways to go about this. Your author likes set theory, so he prefers `union`, which combines two sets removing duplicates (exactly what we called for, right?). Works just as well with lists or arrays.

So if the length of the `wins` array is less than two, we can simply use `head` to grab the first element in the array (there is only one) and return that. If there are two wining patterns, we'll pass them both as arguments to `union` using the spread operator (`...`) to spread the two arrays into two arguments, and we'll get back the set of moves with duplicates removed. For example, if the `wins` array is `[[0, 4, 8], [2, 4, 6]]` (a big X for "X") then the spread operator means we call `union([0, 4, 8], [2, 4, 6])` and the output will be exactly what we want: `[0, 2, 4, 6, 8]`.

We can then figure out which player won by checking the first square of our winning pattern against the board we created. Is it an X or an O? We then return a wrapped `gameOver` action with the correct data: `return Observable.of(gameOver(squares, player))`. Here's what our final `checkForWinEpic` looks like.

```javascript
// src/state/epics/checkForWin/index.js
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/of'
import { head, length, union } from 'ramda'
import { isNonEmptyArray } from 'ramda-adjunct'

import { getMoves, gameOver, SQUARE_CLICKED } from '../..'
import { getBoard, getWins } from '../../../utilities'

export default function checkForWinEpic (action$, store) {
  return action$.ofType(SQUARE_CLICKED).mergeMap(({ payload }) => {
    const moves = getMoves(store.getState())
    const plays = length(moves)

    if (plays < 5) {
      return Observable.of()
    }

    const board = getBoard(moves)
    const wins = getWins(board)

    if (isNonEmptyArray(wins)) {
      const squares = length(wins) < 2 ? head(wins) : union(...wins)
      const player = board[head(squares)]

      return Observable.of(gameOver(squares, player))
    }

    if (plays > 8) {
      return Observable.of(gameOver([]))
    }

    return Observable.of()
  })
}
```

## Setting up the epic middleware

One last thing we need to do to make all this work is plug in our middleware. We'll do this in our `src/state/store/index.js` file. You can pretty much just read the following code carefully to see what it does.

```javascript
// src/state/store/index.js
import { applyMiddleware, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createEpicMiddleware } from 'redux-observable'

import { rootReducer as reducer } from '..'
import { checkForWinEpic } from '../epics'

const epicMiddleware = createEpicMiddleware(checkForWinEpic)
const baseMiddleware = applyMiddleware(epicMiddleware)
const middleware = composeWithDevTools(baseMiddleware)

export default function configureStore () {
  return createStore(reducer, middleware)
}
```

Now run the app with `yarn start` and open the Redux DevTools and watch as you click squares. When you hit a winning combination, or run out of squares, you should see after a very brief pause the `GAME_OVER` action appear in the flow.

![Epic win!](/assets/epic-win.png)

![Epic Redux DevTools output](/assets/epic-redux-output.png)

Our epic needs a unit test, of course, but this lesson is long enough, so we'll spare you. For now.

We'll stop here and pick back up with the next lesson. Run `yarn start` and make sure it all works before moving on.

It should work like this:

![Double win](/assets/double-win.png)

Or this:

![Single O win](/assets/single-o-win.png)

Or this:

![Cats](/assets/cats.png)

Nice! Let's do a commit:

```bash
git add -A
git commit -m "Add check for win"
git push
```
