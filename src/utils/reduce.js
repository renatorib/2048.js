import clone from './clone'

const reduce = (fn, init) => array => clone(array).reduce(fn, init)

export default reduce
