class FoldmakerObject {
  constructor(obj) {
    if (obj && typeof Array.isArray(obj)) {
      this.array = obj.map(el => el.value)
      this.string = obj.map(el => el.type).join('')
    } else {
      this.array = []
      this.string = ''
    }
    this.modified = false
  }

  replace(visitors, callback) {
    let tokens = getTokensFromVisitors(visitors, callback)
    return replace(this, tokens)
  }

  parse(visitors, callback) {
    let tokens = getTokensFromVisitors(visitors, callback)
    let self = this
    do {
      self = replace(self, tokens)
    } while (self.modified === true)
    return self
  }

  flatten(callback) {
    return flatten(this.array, callback)
  }

  // To be used on an empty foldmaker
  add(string, object) {
    this.array.push(object)
    this.string += string
    this.modified = true
  }

  noop(result) {
    this.array = this.array.concat(result[0]) // TODO
    this.string += result.map[0]
  }
}

export let visitor = (token, directive) => ({ token, directive })

export let flatten = (ARRAY, CALLBACK = value => value) =>
  ARRAY.reduce((accumulator, item) => {
    let val = accumulator.concat(Array.isArray(item) ? flatten(item) : CALLBACK(item))
    return val
  }, [])

export let tokenize = (STRING, TOKENS, CALLBACK) => {
  let index = 0
  let tokens = []
  // Add this as the last token by default, this will prevent infinite loops
  TOKENS.push(['0', /[\s\n\S]/])
  let len = TOKENS.length

  while (STRING) {
    for (let i = 0; i < len; i += 1) {
      // Try to find a token. If not found, go to the next iteration of the loop
      let map = TOKENS[i][1].exec(STRING)
      if (!map || map.index !== 0) continue
      let { type, value } = { type: TOKENS[i][0], value: map[0] }
      let returnValue = CALLBACK ? CALLBACK({ type, value, map, index }) : { type, value }
      if (returnValue) tokens.push(returnValue)

      // Advance by slicing the string and push tokens to the list
      STRING = STRING.slice(value.length)
      index += value.length
      break
    }
  }
  return tokens
}

export const getOccurences = (array, map, index) => {
  let count = map[0].length
  const whole = array.slice(index, count + index)
  let occurences = [whole]
  let cursor = 0
  map.forEach((el, i) => {
    if (i !== 0) {
      if (el) {
        count = el.length
        const occ = whole.slice(cursor, count + cursor)
        occurences.push(occ)
        cursor = count + cursor
      } else {
        occurences.push(null)
      }
    }
  })
  occurences.map = map
  occurences.index = index
  occurences.count = map[0].length
  return occurences
}

export const direct = (array, newState) => ({ type, value, map, index }) => {
  const result = getOccurences(array, map, index)
  const returnValue = type(result)
  if (returnValue) {
    if (Array.isArray(returnValue)) newState.add(returnValue[0], returnValue[1])
    else newState.add('1', returnValue)
  } else {
    newState.noop(result)
  }
}

export const replace = (self, tokens) => {
  let newState = Foldmaker()
  tokenize(self.string, tokens, direct(self.array, newState))
  return newState
}

export const getTokensFromVisitors = (visitors, callback) => {
  if (visitors instanceof RegExp) visitors = [{ token: visitors, directive: callback }]
  let tokens = visitors.map(visitor => [visitor.directive, visitor.token])
  // Add this as the last token by default, this will prevent infinite loops
  tokens.push([() => null, /[\s\n\S]/])
  return tokens
}

const Foldmaker = tokens => new FoldmakerObject(tokens)
Foldmaker.flatten = flatten
Foldmaker.tokenize = tokenize
Foldmaker.visitor = visitor
export default Foldmaker
