# Retro snake - javascript game
Retro snake game created in javascript.

## Table of Contents

* [About](#about)
* [Quick Start](#quick-start)
* [Documentation](#documentation)
* [To be done](#to-be-done)

## About

![Snake game](./documentation/game_screen.jpg)

I created this game to use it as a loader for long running reports but some bosses didn't agree with me :-) so feel free to use it as you like. For those who don't know the rules of the game (if they exists), the rules are simple. You need to eat food to grow and avoid hitting the walls and yourself. The bigger you are, the more difficult will be. So, take fun and good luck.

## Quick start
You need to include **snake.css** and **snake.min.js** in your head tag:
```html
<link rel="stylesheet" href="./styles/snake.css" />
<script src="./dist/snake.min.js"></script>
```

First you need to add game container in your body tag:
```html
<div id="game-container"></div>
```

Then you need to initialize game in script tag:
```javascript
function onDocumentLoad() {
   new Game('#game-container');
}
document.addEventListener('DOMContentLoaded', onDocumentLoad);
```
And that's it. See [Documentation](#documentation) section for controls and options.

## Documentation

###### Game controls
- **SPACE BAR** - start game or restart after game over,
- **UP ARROW** - move up,
- **DOWN ARROW** - move down,
- **LEFT ARROW** - move left,
- **RIGHT ARROW** - move right,
- **Z** - decrease game level,
- **X** - increase game level.

###### Options
There is a few options that can be used to change game settings.
```javascript
new Game('#game-container', {SPEED: 5, BOARD_WIDTH: 20, BOARD_HEIGHT: 10});
```
Available options:
- **SPEED** - speed for game start (default: 1, range: 1-10),
- **BOARD_WIDTH** - width of the game board (default: 20, range: 10-40),
- **DOWN ARROW** - height of the game board (default: 10, range: 5-20).

## To be done
- game graphics
