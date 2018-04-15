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

## Thinking in React

React is all about building reusable components. Think of them as our own, bespoke HTML elements. What kind of components would we want here? Well, we have a game board that consists of nine squares, each of which can hold either an X or an O. So it's seems reasonable that our `App` component would hold a `Board` component, and that our `Board` components would hold nine instances of a `Square` component.

We'll start at the top. Let's begin by styling our `App` component. To do this, we'll create a `StyledApp` component with `styled-components` and we'll use that in our `App` component.

First, we'll need to import the `styled-component` library at the top of our `src/components/App/index.js` file. Then we'll create a `StyledApp` component by using the `styled.div` method and passing it a [template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Multi-line_strings). This utilises a new feature of JavaScript called [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).

```javascript
import React from 'react'
import styled from 'styled-components'

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
    </StyledApp>
  )
}
```

If you check the browser, you should see this:

![Updated board](./assets/updated-board.png)

Not much has changed (yet), but you can see that the font family has changed to Verdana (compare with the earlier screenshot), so our styles are being applied.

We can also verify this by looking in the Chrome Devtools (or the equivalent in whatever browser you're using). If we look in the `<head>` element, we can see that the stylesheet has been extracted and injected into a `<style>` element, and that the class has a unique name:

![CSS injected into the head element](./assets/chrome-devtools-stylesheet.png)

And if we look in the body, we can see that this unique class has been applied to our App's `<div>` element:

![Unique class added to our App div element](./assets/chrome-devtools-board.png)

Sweet! Now let's create our Board component.

First, we'll create a new folder under `src/components`. Call it `Board` and add an `index.js` file in it. We'll follow this pattern of naming the folder with the component name (in [PascalCase]()), and using `index.js` for the file name (`index.js` files are loaded by default, so we can still use `import Board from './components/Board'` to import the Board component). You're folder/file hierarchy should look like this when you're done:

![Folder hierarchy after adding Board component](./assets/folders-after-board-added.png)

Then in the `src/components/Board/index.js` file, add the following:

```javascript
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

export default Board
```

This is not a class in CSS, so we won't explain all the CSS we're using here. If you're interested, you can simply read more about [CSS Grid Layout]().

Some things to note:

* We aren't using any [JSX](https://reactjs.org/docs/jsx-in-depth.html), so we don't need to import React (JSX is the JavaScript that looks like HTML in our files).
* We create a styled `<div />` component by calling the `div` function from the `styled` library _and passing it a template string. Template strings are multi-line strings delimited by the back tick (```) character.
* We're using CSS Grid Layout to create a grid with three rows of three cells each. These cells will be our Squares.
* We call the squares 'zero', 'one', 'two', etc., which corresponds to the square's index in an array (JavaScript array indices start at 0).
* Each row is `20vh` units high, and each column is `20vh` units wide. A `vh` unit is 1% of the height of the window, so each square will have height and width equal to 20% of the height of the window area.
* The gap between the squares is set to 0 pixels.

Let's add our `Board` export to our `src/components/index.js` file so that we can import it easily:

```javascript
import App from './App'
import Board from './Board'

export { App, Board }
```

And now let's import it into our `src/components/App/index.js` file so that we can use it:

```javascript
import React from 'react'
import styled from 'styled-components'

import { Board } from '../'

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
        <div>0</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
      </Board>
    </StyledApp>
  )
}
```

Run `yarn start` and see what it looks like. (Or, if you've never bothered to shut the server down using `Control-c`, you can just check your browser and it should have updated automatically.) You should see something like this:

![First CSS grid board](./assets/first-grid-board.png)

Time for another commit:

```bash
git add -A
git commit -m "Add CSS grid board with styled-components"
git push
```
