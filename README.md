# Adding state management with Redux

We now have click handlers on our Squares, but all they do is log out the number of the Square to the dev console. That's not much use.

What we want is to track the players' moves in a `moves` array. We need somewhere to store that. We could store it in the internal state of the `App` component&mdash;and that's how most developers would probably do it initially&mdash;but, really, we will find it much easier in the long run to store all our state in one place, not distributed throughout the app.

A great way to do this is with the [redux](https://redux.js.org/) library.

Let's build a store in which we can keep our `moves` array. Then we'll pass that store into our `App` component (using React's [context](https://reactjs.org/docs/context.html) feature). In our `App` component we'll add a "selector" that gets the current state of our `moves` array, and a method that "dispatches" an action to the store that will append a move onto the `moves` array. It may seem complex, but it's actually very simple.

To begin, we'll create an action that represents a player's move. We're going to use a JavaScript Object with a `type` key and a `payload` key, and in the payload we'll include the square that the player is playing. Here is what our 'SQUARE_CLICKED' action is going to look like:

```javascript
{
  type: 'SQUARE_CLICKED',
  payload: {
    square: 4
  }
}
```

This is the current practice for Redux actions: a `type`, a `payload`, and, if necessary, a `meta` key.

We'll have a very limited, _enumerated_ set of action types, so let's create constants for the type names. First, let's create a folder to hold our state management code under the `src` folder and call it `src/state`. Then in there, let's create a `src/state/constants.js` file and a `src/state/index.js` file. Add the following to the `constants.js` file:

```javascript
export const SQUARE_CLICKED = 'SQUARE_CLICKED'
```

Pretty simple file, eh? Now we'll do our regular import/export in the `src/state/index.js` file:

```javascript
import { SQUARE_CLICKED } from './constants'

export { SQUARE_CLICKED }
```

And we'll add this file to our list of files the coverage tool should ignore in `package.json`:

```json
"collectCoverageFrom": [
  "!src/registerServiceWorker.js",
  "!src/index.js",
  "!src/components/index.js",
  "!src/state/index.js",
  "!src/utilities/index.js",
  "src/**/*.{js,jsx}",
  "!<rootDir>/node_modules/"
],
```

Now we can use that action type to create our action. We're going to make an action creator function for our `squareClicked` action. Create a new folder under `src/state` at `src/state/actions` and an `index.spec.js` file in that folder. Now we'll add our test:

```javascript
import { squareClicked } from '.'
import { SQUARE_CLICKED } from '..'

describe('state:actions', () => {
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

Run the tests (use `p` and `actions` to filter on the actions folder) and you should see it fail. Now let's make it pass. Create a `src/state/actions/index.js` file with the following code:

```javascript
import { SQUARE_CLICKED } from '..'

function squareClicked (square) {
  return {
    type: SQUARE_CLICKED,
    payload: {
      square
    }
  }
}

export { squareClicked }
```

By now it should be obvious how this works. And the test should be passing. Let's add that to our `src/state/index.js` file:

```javascript
import { squareClicked } from './actions'
import { SQUARE_CLICKED } from './constants'

export { SQUARE_CLICKED, squareClicked }
```
  
We have a working action creator! Let's commit to it:

```bash
git add -A
git commit -m "Add squareClicked action creator"
git push
```
