import {
  clone,
  pipe,
  flatten,
  reverse,
  reduce,
  shallowEqual,
  map,
} from './utils'

// directions coordinates
export const directions = {
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1],
}

const { LEFT, RIGHT, UP, DOWN } = directions

// move a coordinate with a offset
// ex.: moveCoord([+1, 0], [2, 2]) -> [3, 2]
//      moveCoord([0, -1], [2, 2]) -> [2, 1]
export const moveCoord = (direction, coord) =>
  map((offset, i) => offset + coord[i])(direction)

/* tiles */

const createKey = () =>
  Math.random()
    .toString(36)
    .substr(2, 8)

export const createTile = ({
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
  // other meta values
  ...rest
} = {}) => ({ key, value, score, ...rest })

export const mergeTile = (tile, target) =>
  createTile({
    value: tile.value + target.value,
    score: tile.value + target.value + tile.score + target.score,
    key: tile.key,
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

export const randomEmptyTileCoord = board => {
  const coords = emptyCoords(board)
  const chosen = coords[Math.floor(Math.random() * coords.length)]

  return typeof chosen === 'undefined' ? false : chosen
}

/* board */

export const createMatrix = (size = 4) => Array(size).fill(Array(size).fill())

export const createBoard = pipe(createMatrix, mapMatrix(createTile))

export const createSpawnedBoard = (size = 4) =>
  pipe(createBoard, spawnInBoard, spawnInBoard)(size)

export const createBoardFromMatrix = matrix =>
  mapMatrix(value => createTile({ value }))(matrix)

export const getBoardValues = board => mapMatrix(tile => tile.value)(board)

export const getBoardFlatValues = board => pipe(getBoardValues, flatten)(board)

export const spawnInBoard = board => {
  const cloned = clone(board)
  const position = randomEmptyTileCoord(cloned)
  const value = Math.random() <= 0.1 ? 4 : 2

  if (position) {
    const [x, y] = position
    cloned[y][x] = createTile({ value })
  }

  return cloned
}

export const moveBoard = (direction, coord = [0, 0], turn = 1) => board => {
  const [x, y] = coord
  const [ox, oy] = direction || [0, 0]

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
    moving[ty][tx] = mergeTile(tile, target)
    moving[y][x] = createTile({})
  } else if (tile.value > 0 && target.value === 0) {
    // previous tile is empty, time to move!
    moving[ty][tx] = createTile({ ...tile })
    moving[y][x] = createTile({})
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
  return !shallowEqual(getBoardFlatValues(board), getBoardFlatValues(moved))
}

export const getBoardScore = board =>
  pipe(clone, flatten, reduce((value, tile) => value + tile.score, 0))(board)

export const isBoardImmobile = board => {
  return !Object.values(directions).some(dir => canMoveBoard(dir)(board))
}

/* game state */

const getCanMoveDirections = board => ({
  left: canMoveBoard(LEFT)(board),
  right: canMoveBoard(RIGHT)(board),
  up: canMoveBoard(UP)(board),
  down: canMoveBoard(DOWN)(board),
})

export const gameState = (
  board = createSpawnedBoard(),
  // below is state values that cannot be computed using the board
  // are computed inside moveState
  { scoreEarned = 0, moves = 0 } = {}
) => ({
  board,
  moves,
  scoreEarned,
  isGameOver: isBoardImmobile(board),
  score: getBoardScore(board),
  canMove: getCanMoveDirections(board),
})

export const moveState = direction => prevState => {
  if (!canMoveBoard(direction)(prevState.board)) return clone(prevState)

  const board = pipe(moveBoard(direction), spawnInBoard)(prevState.board)

  return gameState(board, {
    moves: prevState.moves + 1,
    scoreEarned: getBoardScore(board) - prevState.score,
  })
}
