const clone = source => {
  if (Array.isArray(source)) {
    const cloned = []
    source.forEach((value, i) => {
      cloned[i] = clone(value)
    })
    return cloned
  } else if (typeof source === 'object') {
    const cloned = {}
    for (const prop in source) {
      if (source.hasOwnProperty(prop)) {
        cloned[prop] = clone(source[prop])
      }
    }
    return cloned
  } else {
    return source
  }
}

export default clone
