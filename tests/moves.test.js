import { values, directions, moveBoard, matrixToBoard } from '../src'
import { pipe } from '../src/utils'

const { LEFT, RIGHT, UP, DOWN } = directions

const matrixMove = (dir) => pipe(
  matrixToBoard, moveBoard(dir), values
)

const up = matrixMove(UP)
const down = matrixMove(DOWN)
const right = matrixMove(RIGHT)
const left = matrixMove(LEFT)

const base = [
  [2, 0, 0, 0],
  [0, 2, 2, 0],
  [0, 0, 2, 0],
  [2, 2, 2, 2]
]

it('Should move board to UP', () => {
  expect(up(base)).toEqual([
    [4, 4, 4, 2],
    [0, 0, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ])
})

it('Should move board to DOWN', () => {
  expect(down(base)).toEqual([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0],
    [4, 4, 4, 2],
  ])
})

it('Should move board to RIGHT', () => {
  expect(right(base)).toEqual([
    [0, 0, 0, 2],
    [0, 0, 0, 4],
    [0, 0, 0, 2],
    [0, 0, 4, 4],
  ])
})

it('Should move board to LEFT', () => {
  expect(left(base)).toEqual([
    [2, 0, 0, 0],
    [4, 0, 0, 0],
    [2, 0, 0, 0],
    [4, 4, 0, 0],
  ])
})

