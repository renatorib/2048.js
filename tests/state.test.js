import { directions, createBoardFromMatrix, gameState, moveState } from '../src'

const { RIGHT } = directions

const state = gameState(createBoardFromMatrix([
  [2, 0, 0, 0],
  [0, 2, 2, 0],
  [0, 0, 2, 0],
  [2, 2, 2, 2]
]))

it('Should computate moves', () => {
  const moved = moveState(RIGHT)(state)
  expect(moved.moves).toEqual(1)
})

it('Should computate score', () => {
  const moved = moveState(RIGHT)(state)
  expect(moved.score).toEqual(12)
  expect(moved.scoreEarned).toEqual(12)
})
