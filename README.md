# Building a Tic-Tac-Toe application with React

This is a tutorial for building a Tic-Tac-Toe game with React, Redux, `redux-observable`, Rx.js, and more. We'll start simply, and continue building on the app, step by step, until we've created something quite powerful. Note: this is still a work-in-progress. [YMMV](https://en.wiktionary.org/wiki/your_mileage_may_vary#English).

Each step of the tutorial is a different branch. We could have used tagged commits, but it's easier to go back and update branches as we discover typos and other errors. So branches it is.

To start the tutorial, begin with the [00-set-up](https://github.com/test-er-8-or/tic-tac-toe/tree/00-set-up) branch. Follow the instructions carefully. When you complete that branch, move on to the next branch, and then the next.

If you get to the end of a step (branch) and your code doesn't quite work and you've given up on trying to debug it, you can simply clone the next branch and start from there with a (hopefully) working copy of the application so far.

There are a few drawbacks to this simple approach, but it works for now. Eventually, we'll move this tutorial to an actual learning management system, which will make it much easier to use.

We strongly recommend working with the real-world tools&mdash;GitHub, Visual Studio Code, iTerm2 or equivalent, etc.&mdash;but if you can't get them set up, we do also provide an easy way to complete the tutorial using [CodeSandbox.io](https://codesandbox.io/). Just follow our [CodeSandbox instructions](./code-sandbox-README.md).

## How to get the most out of this tutorial

This tutorial uses a modern method of learning called "Just-in-time learning" (JITL). The idea behind JITL is to learn only what you need to know, precisely when you need to know it, and to apply it immediately.

_This is very different from the way you have learned in the past_, and it may take some getting used to. Virtually all the instruction you've had in your life so far will most likely have been what we call "Just-in-_case_ learning" (JICL). Just-in-case learning means expending time, energy, and money learning things that you may never need, or won't need in the foreseeable future, because, well, _just in case_.

This is a tremendous waste, and it often exhausts novices because they don't know where to put their effort for the maximal return. They tend to take a shotgun approach, trying to learn a little bit of everything, and learning nothing very well. Often, they quit in frustration.

There are several other tools from the [Munat Methodology](https://github.com/PaperHat/munat-methodology) in use here. Let's discuss a few:

## Learn inductively not deductively

Begin with concrete examples, then abstract the principles, not the other way around. Stay as low on the tree of abstraction as you can.

In this tutorial, we show you the code _first_, even though you may have no clue what it means or how it works. Type it into your own code (or copy and paste, but typing it will help you to learn it more rapidly) and _see how it works_. Once you see how it works, _then_ we'll explain it, but only what you really need to know.

## Learn outside-in

Begin with the context and framework so you know where you are going, then fill in the detail.

Rather than learn a lot of little bits of code that eventually, someday, if you stick with it _might_ add up to a web application, we begin by generating the basic application right up front. Now you can see where we're going. Then we modify it little by little until it becomes the final product. We don't waste time explaining variables, loops, conditionals, etc.&mdash;these will become clear with regular use, and, _after you've seen them a few times_, we'll take a moment to point them out to you.

This means you're always oriented as to where you are and where you want to go, _even if you don't understand any of the details just yet_. Be patient. We'll get there.

## Favour skills over knowledge

Skills require mentoring and practice, and practice makes permanent. Do it right the first time and every time. Knowledge is perishable and volatile and can be acquired instantly and the moment it is needed. Hello, Google!

The key to this tutorial is _repetition_. Go through it the first time just following along and typing (or copying and pasting) the code and getting an idea of what's involved and how it works, generally. Don't try to understand everything! Don't worry that you don't understand everything (_no one_ does)! Just get through the tutorial and make it work.

**Then** go through it _from scratch_ a second time. This time, take a bit more time to examine the code. Try to understand not only _what_ we did, but _how_ we did it. What do all these funny words really mean? They are not that hard to figure out&mdash;as long as you don't go down rabbit holes.

What do I mean by that? Take this line of code:

```javascript
import { map } from 'ramda'
```

What does that mean? Well, even if you've never done _any_ programming before, you probably know that "import" means to bring something in from outside. So 'ramda' must be something outside our code (in fact, it's a library of code we're borrowing functions from), and "map" must be something we'll need that isn't already available to us, so we have to go get it.

But how does this really work?

**WHO CARES?**

This is the most important thing to understand when doing this tutorial: **Don't dig any deeper than you need to!** It's enough to know that you're importing something called "map" from something called "ramda". Elsewhere, we've given you a link to the Ramda documentation that you can use _when you need to know how that works_. But that's not now, the first time you see this. So **don't** go running off to figure out what it means! Just leave it.

Will you need to know how imports work, and how importing from a library such as Ramda differs from importing from your own JS files? Yes, of course you will. _But not right now!_ So _let it go_. Catch it on the second pass, or the third, or maybe never if it turns out you can get the job done without having to know it.

This is the part of _Just-in time learning_ that is _so difficult_ for most of us. We've spent our entire lives believing that we have to memorise all sorts of things in order to be truly knowledgeable. That might have been true 50 years ago, but today it's demonstrably false! Almost everything you're going to learn in this tutorial will be obsolete in a year or two, if not in a few months or weeks! Every thing you memorise or learn that you don't need in that period is time, energy, and _money_ wasted (time === money). So just don't do it!

The key to learning skills, such as programming, is _repetition_. If you need to remember something, it will be because you need to use it all the time, and if you use something all the time, then you will _automatically memorise it by repetition_. So no need to work at it. Just do the tutorial repeatedly, learning a bit more each time, and forget about memorising things.

Make notes of things you _might_ want to look up later as you go along. Then don't look them up until you have to. You may be surprised to find that you end up tossing out your notes never having bothered to look up even one thing from them.

## Follow the single, shortest path

Pick one good way to do the thing and stick to it. Providing alternatives early on only confuses and increases cognitive load. There will be time to learn other approaches later.

There are a thousand ways you could build this Tic-Tac-Toe app. Is this the _best_ way? Who cares? It's a _good enough_ way. I promise you that this method is pretty close to current state-of-the-art as of the latest commit. If you ask fifty React developers if this is the best way to do this, you'll get fifty different answers, but mostly that's just [bikeshedding](https://en.wikipedia.org/wiki/Law_of_triviality). This method is good enough. Follow these instructions and keep repeating until you have them down cold.

Then you can try a slightly different approach. And then another. Vary it a bit this way or that. Try it with a different framework. Over time, you'll find what you like and you'll change your code accordingly. And that's as it should be. But right now, when you're first learning i, just do it _one way_. In short, either follow these instructions precisely, or choose a different tutorial. Don't try to diverge from the instructions until you're sure you understand them.

The fifth-dan black belt can create her own style. The yellow-belt beginner who attempts this will only make a fool of himself. Follow the single, shortest path to the goal. Repeat until you know it blindfolded. Then seek nearby paths and continue this process until you can travel at will.

## "But some choice you made is wrong!"

This tutorial is an experiment with a new methodology for learning&mdash;really, a combination of many well-known, but often ignored, methods for learning. As such, it uses a very specific pedagogy. You may not like this approach. You may even _hate_ this approach. If that is the case, then I happily urge you to write your own tutorial following your own pedagogy. Hell, write a book about it. I'm doing so.

But don't ask me to change this approach or rewrite this the way you'd prefer it. I didn't happen upon this approach by accident; neither did I just throw together a few techniques that sounded good. I've spent more than twenty years experimenting with and honing this approach. I'm not likely to abandon it or change it on a whim, and certainly not on _your_ whim.

But that doesn't mean that I'm not open to criticism or new ideas! I'm just not interested in [gratuitous](http://www.dictionary.com/browse/gratuitous) ones. If something really doesn't seem to work, and you think you know a better way, then by all means ask questions about it or suggest an alternative. I'm happy to learn new things. The goal here is not to do things _my_ way, but to do the _the best way I can discover_.

Also, bear in mind that I'm working with a large and diverse group of learners. What works for you, might not work as well for others. Ideally, all learning would be made-to-measure (another of the Munat methods), but with an online tutorial such as this, that's simply not possible. Yet. I'm working on some ideas. So this is a shot fired at centre of mass.

**To be clear: By putting this online and inviting you to take part in it, subject to the understanding above, I am creating a _social contract_ with you. That means that I have a responsibility to make sure this is an _effective_ use of your time. Anything else is simply disrespectful. I take that responsibility very seriously, so if something is really wrong, or simply does not work (within reason), then _please_ let me know and I'll fix it ASAP. I hope you find this tutorial as effective and efficient as I've intended it to be. In short, I've tried to write the tutorial that I wish I had when I was first learning JavaScript and React.**

So have fun! Go forth and learn.

## Start with the [set up](https://github.com/test-er-8-or/tic-tac-toe/tree/00-set-up)

1. [Set up](https://github.com/test-er-8-or/tic-tac-toe/tree/00-set-up)
1. [Add the game board](https://github.com/test-er-8-or/tic-tac-toe/tree/01-add-the-game-board)
1. [Add snapshots](https://github.com/test-er-8-or/tic-tac-toe/tree/02-add-snapshots)
1. [Add click-handler and player](https://github.com/test-er-8-or/tic-tac-toe/tree/03-add-click-handler-and-player)
1. [Add state management](https://github.com/test-er-8-or/tic-tac-toe/tree/04-add-state-management)

More to come . . .
