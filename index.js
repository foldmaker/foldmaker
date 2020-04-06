class FoldmakerObject {
  constructor(obj) {
    let hasTokens = obj && Array.isArray(obj)
    this.array = hasTokens ? obj.map(el => el.value) : []
    this.string = hasTokens ? obj.map(el => el.type).join('') : ''
    this.modified = false
  }

  replace(visitors, callback) {
    let tokens = getTokensFromVisitors(visitors, callback)
    return replace(this, tokens)
  }

  parse(visitors, callback, debug) {
    let tokens = getTokensFromVisitors(visitors, callback)
    if (Array.isArray(visitors)) debug = callback
    let self = this
    do {
      self = replace(self, tokens)
      if(debug) debug(self)
    } while (self.modified === true)
    return self
  }
  
  traverse(callback) {
    this.array = traverse(this.array, callback)
    return this
  }

  call(callback) {
    return callback(this)
  }

  concatenate(string, object) {
    this.array = this.array.concat(object)
    this.string += string
  }
}

export const traverse = (node, callback) => {
  let also = subNode => subNode && traverse(subNode, callback)
  if(Array.isArray(node)) return node.map((item) => callback(item, also))
  else return callback(node, also)
}

export let tokenize = (STRING, TOKENS, CALLBACK) => {
  let index = 0, tokens = []
  // Add this as the last token by default, this will prevent infinite loops
  TOKENS.push(['0', /[\s\n\S]/])

  while (STRING) {
    TOKENS.some(([type, regex]) => {
      let map = regex.exec(STRING)
      if (map && map.index === 0) {
        // If not found, we are here
        let value = map[0]
        let returnValue = CALLBACK ? CALLBACK({ type, value, map, index }) : { type, value }
        if (returnValue) tokens.push(returnValue) // TODO:

        // Advance by slicing the string and push tokens to the list
        STRING = STRING.slice(value.length)
        index += value.length
        return true 
      }
    })
  }
  return tokens
}

export const getTokensFromVisitors = (tokens, callback) => {
  if (tokens instanceof RegExp) tokens = [[callback, tokens]]
  else tokens = tokens.map(([a,b]) => [b,a])
  // Add this as the last token by default, this will prevent infinite loops
  tokens.push([() => undefined, /[\s\n\S]/])
  return tokens
}

export let visitor = (a, b, c) => ([a, b, c])

export const getOccurrence = (array, map, index) => {
  let count = map[0].length
  return {
    raw: array.slice(index, count + index),
    index, count, map
  }
}

export const replace = (self, tokens) => {
  let state = Foldmaker()
  let { string, array } = self
  tokenize(string, tokens, ({ type, map,index }) => {
    const occurrence = getOccurrence(array, map, index)
    manipulate(state, type, occurrence)
  })
  return state
}

export const manipulate = (state, type, occurrence) => {
    const result = type(occurrence)
    if (result) {
      if (Array.isArray(result)) state.concatenate(result[0], [result[1]])
      else state.concatenate('1', [result])
      state.modified = true
    } else {
      state.concatenate(occurrence.map[0], occurrence.raw)
    }
}

const Foldmaker = tokens => new FoldmakerObject(tokens)
Foldmaker.traverse = traverse
Foldmaker.tokenize = tokenize
Foldmaker.visitor = visitor
export default Foldmaker
