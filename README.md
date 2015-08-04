# ReactJSTest
An example of ReactJS components that could be created

This project was initially built to do the main ReactJS tutorial.

https://facebook.github.io/react/docs/tutorial.html

Then I built a demo, based on a UI in Anubis, that deals with viewing and modifying datablocks. Check out the "DatablockPopupContainer.js" file.

These are some notes I've found, that help understand the ideas behind React:

**Components are Just State Machines**

React thinks of UIs as simple state machines. By thinking of a UI as being in various states and rendering those states, it's easy to keep your UI consistent.
In React, you simply update a component's state, and then render a new UI based on this new state. React takes care of updating the DOM for you in the most efficient way.
[http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html]

**State is reserved for interactivity only**

In React, data flows one way: from owner to child. This is because data only flows one direction in the Von Neumann model of computing. You can think of it as "one-way data binding."
[http://facebook.github.io/react/docs/thinking-in-react.html]

**Questions to figure out if it is state:**

Let's go through each one and figure out which one is state. Simply ask three questions about each piece of data:
* Is it passed in from a parent via props? If so, it probably isn't state.
* Does it change over time? If not, it probably isn't state.
* Can you compute it based on any other state or props in your component? If so, it's not state.
[http://facebook.github.io/react/docs/thinking-in-react.html]
