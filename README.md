# Adding the game board

The first thing we'll do is to set up a game board. In this step, we're just going to create a visual board. We won't worry about updating the board, tracking players, or anything else. We'll just make a nice-looking tic-tac-toe board.

To do this, we're going to use [styled-components](https://www.styled-components.com/). The `styled-components` library makes it easy for us to create React components that carry their own CSS style with them. When the application is built, the `styled-components` library will automatically extract the CSS from each component, wrap it in a unique CSS class, and inject it into a stylesheet in the head of the HTML document, just like a regular CSS stylesheet. What's more, it will add that unique class name to the React component.

For more information on how this works and the whys, check out [this video by MaxStoiber](https://www.youtube.com/watch?v=bIK2NwoK9xk), the inventor of `styled-components`.

But first, let's just create a basic board. Currently, our `src/components/App/index.js` file looks like this:

```javascript
import React from 'react'

export default function App () {
  return <h1>Tic-Tac-Toe</h1>
}
```

We'll replace the current output with a simple board made up of `div` elements. Make your `src/components/App/index.js` file look like this:

```javascript
import React from 'react'

export default function App () {
  return (
    <div>
      <div>
        <div>0</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
      </div>
    </div>
  )
}
```

The outermost div will be our App, the first nested div will be our Board, and the nine divs nested in that one will be our nine Squares.

Save your changes and run `yarn start` then point your browser to [http://localhost:3000/](http://localhost:3000/) to see the changes. You should see something like thes:

![First pass at the game board](./assets/first-pass-game-board.png)

Doesn't look much like a tic-tac-toe board, does it. But don't worry, we'll fix that shortly. Notice that we've numbered the squares starting with zero. That's because were going to use a JavaScript array to keep track of our board's squares, and JavaScript array indices begin with 0.

Before we move on, let's do a commit:

```bash
git add -A
git commit -m "Add first pass at game board"
git push
```
