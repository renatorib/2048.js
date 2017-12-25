import clone from './clone'

const map = fn => array => clone(array).map(fn)

export default map
