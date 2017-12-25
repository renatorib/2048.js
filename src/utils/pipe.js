const pipe = (...fns) => (...props) =>
  fns.reduce((res, fn) => fn(res), ...props)

export default pipe
