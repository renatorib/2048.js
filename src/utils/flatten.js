import clone from './clone'

const flatten = array =>
  clone(array).reduce(
    (acc, value) => [
      ...acc,
      ...(Array.isArray(value) ? flatten(value) : [value]),
    ],
    []
  )

export default flatten
