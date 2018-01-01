![2048.js](./docs/imgs/logo.png)

A library based in a functional programming paradigm to creates a 2048 game.

## What is it?

Some pure functions to handle a matrix/board of a 2048 game.  
For example: you can take a game state, execute a movement, spawn a new tile (2 or 4) and return a new game state with a moved board.

![2048.js](./docs/imgs/move-right.png)

#### Why?

Why not?

## Introduction Guide

For a better understanding of the docs, read this introduction guide.

### Value
A Value is the value of a tile: 2, 4, 8, 16, etc.
```ts
type Value = number
``` 

### Tile
A Tile is an object with Value and some meta data.
```ts
type Tile = {
  value: Value, // Value
  score: number, // score of tile, used to calculate total score
  key: string, // a hash to identify the tile, can be used to animations & others
}

// example
const tile = { value: 8, score: 16, key: 'kfao4fjt' }
```

### Matrix
A Matrix is a two-dimensional array.
```ts
type _ = any
type Matrix = [
  [_, _, _, _],
  [_, _, _, _],
  [_, _, _, _],
  [_, _, _, _],
]
``` 

### Board
A Board is a matrix with Tile object in their values.  
```ts
type T = Tile
type Board = [
  [T, T, T, T],
  [T, T, T, T],
  [T, T, T, T],
  [T, T, T, T],
]
```

### BoardValues
A BoardValues is a matrix with Value in their values, istead of tiles.
```js
type V = Value
type BoardValues = [
  [V, V, V, V],
  [V, V, V, V],
  [V, V, V, V],
  [V, V, V, V],
]

// example
const boardValues = [
  [0, 2, 0, 2],
  [0, 0, 2, 4],
  [0, 0, 2, 4],
  [0, 2, 4, 8],
]
``` 

### Coordinate
A Coordinate is a matrix x/y position. An array with X and Y values.
```ts
type Coordinate = [number /* x */, number /* y */]

// example
const position = [3, 2] // position X: 3, Y: 2 of a matrix
``` 

### Direction
A Direction is just a string that says to board to where it will be move
```ts
type Direction = [number /* x offset */, number /* y offset */]

// example
const RIGHT = [1, 0] // a right move is x + 1, y + 0 on matrix
const LEFT = [-1, 0] // a left move is x - 1, y + 0 on matrix
const UP = [0, -1] // an up move is x + 0, y - 1 on matrix
const DOWN = [0, 1] // a down move is x + 0, y + 1 on matrix

/*
  Note:
  In a regular cartesian plan, the UP movement should be y + 1, but
  because we work with a matrix in javascript, each array line (Y) is
  incremental to down. That is, the further down, the greater the Y value.

  [
                    y =
    [0, 2, 0, 2],   — 0 
    [0, 0, 2, 4],   — 1
    [0, 0, 2, 4],   — 2
    [0, 2, 4, 8],   — 3

     |  |  |  |
 x = 0  1  2  3
  ]
*/
``` 

## Docs

Subtitle:  
```js
V = Value
D = Direction
C = Coordinate
T = Tile
[T] = Board
[V] = BoardValues
[*] = Matrix
```

All functions and properties can be imported from '2048.js' npm package:
```js
import { directions, createBoard, moveBoard, /*, etc. */ } from '2048.js'
const { LEFT, RIGHT, UP, DOWN } = directions
```

## Docs API

### directions
`directions: { RIGHT, LEFT, UP, DOWN }`

A object with all possible directions to use in move logics.

```js
moveBoard(directions.RIGHT)(board)
moveBoard(directions.UP)(board)

console.log(directions.RIGHT) // -> [1, 0] (is a coordinate offset)
```

### moveCoord
`moveCoord(D, coord)`

### createTile
`createTile(): T`

Creates a new tile.

```jsx
const tile = createTile()
const tile16 = createTile({ value: 16 }) // with some default value
```

### createMatrix
`createMatrix(size = 4): [*]`

Creates a new matrix.

```js
const matrix = createMatrix() // create 4x4 matrix with undefined values
``` 

### createBoard
`createBoard(size = 4): [T]`

Creates a new board.

```js
const board = createBoard() // create 4x4 board
const board5 = createBoard(5) // create 5x5 board
``` 

### createSpawnedBoard
`createSpawnedBoard(size = 4): [T]`

Creates a new board with two random generated tiles using `spawnInBoard`.  

### moveBoard
`moveBoard(D)([T]): [T]` 

Creates a new board passing a direction and current board.

```js
const moved = moveBoard(RIGHT)(board)
``` 

### mapMatrix
`mapMatrix(fn)([*]): [*]`

Map a matrix.

```jsx
const matrixWithPositions = mapMatrix((_, x, y) => { x, y })(createMatrix())
``` 

### spawnInBoard
`spawnInBoard([T]): [T]`

Spawn a new tile in some empty position in a board.

```js
let state = createBoard()
state = moveBoard(RIGHT)(state)
state = spawnInBoard(state)
``` 

### canMoveBoard
`canMoveBoard(D)([T]): boolean`

Check if it's possible to make a move in a certain direction in a board.

```js
const canMoveToRight = canMoveBoard(RIGHT)(board)
```

### isBoardImmobile
`isBoardImmobile([T]): boolean`

Check if there are no more possible moves in a board.

```js
const isGameOver = isBoardImmobile(board)
```

### getBoardScore
`getBoardScore([T]): number`

Get the score of a board.

```js
const score = getBoardScore(board)
// score: 548
```

### getBoardValues
`getBoardValues([T]): [V]`

Takes a matrix with tiles and return a matrix with their values.

```js
// board[0][0] -> { value: 16, ... }
const boardValues = getBoardValues(board)
// boardValues[0][0] -> 16
```

### getBoardFlatValues
`getBoardFlatValues([T]): V[]`

Takes a matrix with tiles and return a flat array with their values.

```js
const flattened = getBoardFlatValues(board)
// flattened -> [0, 0, 0, 2, 0, 0, 0, 2, 0, 2, 2, 2, 0, 2, 2, 4]
```