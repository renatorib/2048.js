import {
  clone,
  pipe,
  flatten,
  reverse,
  reduce,
  shallowEqual,
  map,
} from './utils'

// directions keywords
export const directions = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
}

const { LEFT, RIGHT, UP, DOWN } = directions

// directions mapped to cartesian coodinates offset moves
export const offsets = {
  [LEFT]: [-1, 0],
  [RIGHT]: [+1, 0],
  [UP]: [0, -1],
  [DOWN]: [0, +1],
}

// move a coordinate with a offset
// ex.: moveCoord([+1, 0], [2, 2]) -> [3, 2]
//      moveCoord([0, -1], [2, 2]) -> [2, 1]
const moveCoord = (offsets, coord) =>
  map((offset, i) => offset + coord[i])(offsets)

/* tiles */

const createKey = () =>
  Math.random()
    .toString(36)
    .substr(2, 8)

export const newTile = ({
  // key is a unique hash for each tile
  // when tile is moved the key dont change
  // it's great to track the tile movement before/after
  // and can be used to animate
  key = createKey(),
  // value is the tile value: 0, 2, 4, 8, 16...
  // 0 means empty
  value = 0,
  // the score of title, used to
  // calculate the score of board
  score = 0,
} = {}) => ({ key, value, score })

export const mergeTiles = (tile, target) => ({
  ...newTile({
    value: tile.value + target.value,
    score: tile.value + target.value + tile.score + target.score,
    key: tile.key,
  }),
  // lock tile to not merge twice in same move
  locked: true,
})

export const mapMatrix = fn => board =>
  clone(board).map((row, y) => row.map((tile, x) => fn(tile, x, y)))

export const eachMatrixValue = fn => board =>
  clone(board).forEach((row, y) => row.forEach((tile, x) => fn(tile, x, y)))

export const emptyCoords = board => {
  const coords = []
  const pushIfEmpty = (tile, x, y) => tile.value === 0 && coords.push([x, y])
  eachMatrixValue(pushIfEmpty)(board)

  return coords
}

export const randomEmptyCoord = board => {
  const coords = emptyCoords(board)
  const chosen = coords[Math.floor(Math.random() * coords.length)]

  return typeof chosen === 'undefined' ? false : chosen
}

/* board */

const matrix = (size = 4) => Array(size).fill(Array(size).fill())

export const newEmptyBoard = pipe(matrix, mapMatrix(newTile))

export const newBoard = (size = 4) =>
  pipe(newEmptyBoard, spawnTile, spawnTile)(size)

export const matrixToBoard = matrix =>
  mapMatrix(value => newTile({ value }))(matrix)

export const values = board => mapMatrix(tile => tile.value)(board)

export const flatValues = board => pipe(values, flatten)(board)

export const spawnTile = board => {
  const cloned = clone(board)
  const position = randomEmptyCoord(cloned)
  const value = Math.random() <= 0.1 ? 4 : 2

  if (position) {
    const [x, y] = position
    cloned[y][x] = newTile({ value })
  }

  return cloned
}

export const moveBoard = (direction, coord = [0, 0], turn = 1) => board => {
  const [x, y] = coord
  const [ox, oy] = offsets[direction] || [0, 0]

  // always move to up or left (will be reversed in down/right)
  const [tx, ty] = moveCoord([-Math.abs(ox), -Math.abs(oy)], coord)

  // reverse columns if down, reverse rows if right
  const setup = (oy > 0 && reverse) || (ox > 0 && map(reverse)) || clone

  // setup board
  const moving = setup(board)
  const tile = moving[y][x]
  const target = moving[ty] && moving[ty][tx]

  if (!target) {
    // tile do not have a target
    // it's already on the right wall
  } else if (
    tile.value > 0 &&
    target.value === tile.value &&
    !target.locked &&
    !tile.locked
  ) {
    // tile and target tile have same value and both are unlocked
    // time to merge tile in target tile
    moving[ty][tx] = mergeTiles(tile, target)
    moving[y][x] = newTile({})
  } else if (tile.value > 0 && target.value === 0) {
    // previous tile is empty, time to move!
    moving[ty][tx] = newTile({ ...tile })
    moving[y][x] = newTile({})
  } else {
    // otherwise, we can't move it, keep the tile intact.
  }

  const moved = setup(moving)

  if (moved[y][x + 1]) {
    // keep moving tiles from row
    return moveBoard(direction, [x + 1, y], turn)(moved)
  } else if (moved[y + 1]) {
    // now, lets to next row
    return moveBoard(direction, [0, y + 1], turn)(moved)
  } else if (turn < moved[0].length - 1) {
    // new turn of row tile moving
    return moveBoard(direction, [0, 0], turn + 1)(moved)
  }

  // our work is done, unlock all tiles
  // and return fresh-new moved board
  return mapMatrix(tile => {
    const movedTile = clone(tile)
    delete movedTile.locked
    return movedTile
  })(moved)
}

export const canMoveBoard = direction => board => {
  const moved = moveBoard(direction)(board)
  return !shallowEqual(flatValues(board), flatValues(moved))
}

export const scoreBoard = board =>
  pipe(clone, flatten, reduce((value, tile) => value + tile.score, 0))(board)

export const isGameOver = board => {
  return !Object.values(directions).some(dir => canMoveBoard(dir)(board))
}

/* game state */

const canMoveDirections = board => ({
  [LEFT]: canMoveBoard(LEFT)(board),
  [RIGHT]: canMoveBoard(RIGHT)(board),
  [UP]: canMoveBoard(UP)(board),
  [DOWN]: canMoveBoard(DOWN)(board),
})

export const newGameState = (board = newBoard()) => ({
  board,
  gameOver: false,
  score: 0,
  scoreEarned: 0,
  moves: 0,
  canMove: canMoveDirections(board),
})

export const move = direction => prevState => {
  if (!canMoveBoard(direction)(prevState.board)) {
    return clone(prevState)
  }

  const board = pipe(moveBoard(direction), spawnTile)(prevState.board)
  const gameOver = isGameOver(board)
  const score = scoreBoard(board)
  const scoreEarned = score - prevState.score
  const moves = prevState.moves + 1
  const canMove = canMoveDirections(board)

  return { board, gameOver, score, scoreEarned, moves, canMove }
}
