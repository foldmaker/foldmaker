export class FoldmakerObject {
  constructor(tokens) {
    let hasTokens = tokens && Array.isArray(tokens)
    this.types = hasTokens ? tokens.map((el) => el.type).join('') : ''
    this.values = hasTokens ? tokens.map((el) => el.value) : []
    this.props = hasTokens ? tokens : []
    this.modified = false
    // These are here: easy extendability
    this.__proto__._tokenize = tokenize
    this.__proto__._traverse = traverse
  }

  replace(...args) {
    const { dictionary, debug } = this._getDataFromArguments(args)
    return this._replace(this, dictionary, debug)
  }

  parse(...args) {
    const { dictionary, debug } = this._getDataFromArguments(args)
    let self = this
    do {
      self = this._replace(self, dictionary, debug)
    } while (self.modified === true)
    return self
  }

  traverse(callback) {
    this.values = this._traverse(this.values, callback)
    return this
  }

  add(string, values, props) {
    this.types += string
    this.values = this.values.concat(values)
    this.props = this.props.concat(props)
  }
  
  _getDataFromArguments([dictionary, callback, debug]) {
    if (dictionary instanceof RegExp) {
      dictionary = [[callback, dictionary]]
    } else {
      dictionary = dictionary.map(([a, b]) => [b, a])
      debug = callback
    }
    // Add this as the last token by default, this will prevent infinite loops
    dictionary.push([() => undefined, /[\s\n\S]/])
    return { dictionary, debug }
  }

  _replace(oldState, dictionary, debug) {
    let state = Foldmaker()
    let { types, values, props } = oldState
    this._tokenize(types, dictionary, ({ type, map, index }) => {
      const slicedProps = this._getProps(props, map, index)
      const occurrence = this._getOccurrence(values, slicedProps, map, index)
      this._manipulate(type, occurrence, slicedProps, state, oldState)
    })
    if(debug) debug(state)
    return state
  }

  _getProps (props, map, index) {
    let count = map[0].length
    return props.slice(index, count + index)
  }
  
  _getOccurrence (values, props, map, index) {
    let count = map[0].length
    return {
      raw: values.slice(index, count + index),
      props, index, count, map
    }
  }
  
  _manipulate (type, occurrence, props, state, oldState) {
    const result = type(occurrence, state, oldState)
    if (result) {
      if (Array.isArray(result)) state.add(result[0], [result[1]], [props])
      else state.add('1', [result])
      state.modified = true
    } else {
      state.add(occurrence.map[0], occurrence.raw, props)
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

const Foldmaker = (dictionary) => new FoldmakerObject(dictionary)
Foldmaker.FoldmakerObject = FoldmakerObject
Foldmaker.traverse = traverse
Foldmaker.tokenize = tokenize
Foldmaker.visitor = visitor
Foldmaker.fm = Foldmaker // shorthand, circular
export default Foldmaker
