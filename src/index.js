export class FoldmakerObject {
  constructor(obj) {
    let hasTokens = obj && Array.isArray(obj)
    this.array = hasTokens ? obj.map((el) => el.value) : []
    this.string = hasTokens ? obj.map((el) => el.type).join('') : ''
    this.modified = false
    // These are here: easy extendability
    this.__proto__._tokenize = tokenize
    this.__proto__._traverse = traverse
  }

  replace(...args) {
    const { tokens, debug } = this._getDataFromArguments(args)
    return this._replace(this, tokens, debug)
  }

  parse(...args) {
    const { tokens, debug } = this._getDataFromArguments(args)
    let self = this
    do {
      self = this._replace(self, tokens, debug)
    } while (self.modified === true)
    return self
  }

  traverse(callback) {
    this.array = this._traverse(this.array, callback)
    return this
  }

  add(string, object) {
    this.array = this.array.concat(object)
    this.string += string
  }
  
  _getDataFromArguments([tokens, callback, debug]) {
    if (tokens instanceof RegExp) {
      tokens = [[callback, tokens]]
    } else {
      tokens = tokens.map(([a, b]) => [b, a])
      debug = callback
    }
    // Add this as the last token by default, this will prevent infinite loops
    tokens.push([() => undefined, /[\s\n\S]/])
    return { tokens, debug }
  }

  _replace(oldState, tokens, debug) {
    let state = Foldmaker()
    let { string, array } = oldState
    this._tokenize(string, tokens, ({ type, map, index }) => {
      const occurrence = this._getOccurrence(array, map, index)
      this._manipulate(type, occurrence, state, oldState)
    })
    if(debug) debug(state)
    return state
  }
  
  _getOccurrence (array, map, index) {
    let count = map[0].length
    return {
      raw: array.slice(index, count + index),
      index, count, map
    }
  }
  
  _manipulate (type, occurrence, state, oldState) {
    const result = type(occurrence, state, oldState)
    if (result) {
      if (Array.isArray(result)) state.add(result[0], [result[1]])
      else state.add('1', [result])
      state.modified = true
    } else {
      state.add(occurrence.map[0], occurrence.raw)
    }
  }
}

export const tokenize = (string, dictionary, callback) => {
  let index = 0, tokens = []
  // Add this as the last token by default, this will prevent infinite loops
  dictionary.push(['0', /[\s\n\S]/])
  while (string) {
    dictionary.some(([type, regex]) => {
      let map = regex.exec(string)
      if (map && map.index === 0) {
        // If not found, we are here
        const value = map[0]
        const tokenValue = callback ? callback({ type, value, map, index }) : { type, value }
        if (tokenValue) tokens.push(tokenValue)
        // Advance by slicing the string and push tokens to the list
        string = string.slice(value.length)
        index += value.length
        return true
      }
    })
  }
  return tokens
}

export const traverse = (node, callback) => {
  let also = (subNode) => subNode && traverse(subNode, callback)
  if (Array.isArray(node)) return node.map((item) => callback(item, also))
  else return callback(node, also)
}

export const visitor = (a, b) => [a, b]

const Foldmaker = (tokens) => new FoldmakerObject(tokens)
Foldmaker.FoldmakerObject = FoldmakerObject
Foldmaker.traverse = traverse
Foldmaker.tokenize = tokenize
Foldmaker.visitor = visitor
Foldmaker.fm = Foldmaker // shorthand, circular
export default Foldmaker
