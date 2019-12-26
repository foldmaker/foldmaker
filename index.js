// Main class
export default class Foldmaker {
  constructor(obj) {
    if (obj && typeof obj === 'object') {
      this.array = obj.map(el => el.value)
      this.string = obj.map(el => el.type).join('')
    } else {
      this.array = []
      this.string = ''
    }
    this.modified = false
  }

  parse(tokens, directives) {
    let map = this
    let emptyMap = new Foldmaker()
    /* debug */var startTime = Date.now()
    do {
      /* debug */if (Date.now() - startTime > 100) {console.warn('infinite loop busted'); break}
      tokenize(map.string, tokens, direct(map, directives, emptyMap))
      map = emptyMap
      emptyMap = new Foldmaker()
    } while (map.modified === true)
    return map
  }

  // To be used on an empty foldmaker
  add(string, object) {
    this.array.push(object)
    this.string += string
    this.modified = true
  }

  noop(result) {
    this.array = this.array.concat(result[0])
    this.string += result.m[0]
  }
}

// Foldmaker constructor
export let from = tokens => new Foldmaker(tokens)

// Basic traversal
export let traverse = (array, callback) => {
  array.forEach(el => {
    callback(el)
  })
}

// Basic traversal of objects
export let traverseObjects = (array, callback) => {
  array.forEach(el => {
    if (typeof el === 'object') {
      callback(el)
    }
  })
}

export let flatten = (arr, fn = a => a) => {
  return arr.reduce(function(flat, el) {
    let val = flat.concat(Array.isArray(el) ? flatten(el) : fn(el))
    return val
  }, [])
}

export let tokenize = (string, TOKENS, CALLBACK) => {
  let index = 0
  let tokens = []
  let len = TOKENS.length

  /* debug */var startTime = Date.now()
  while (string) {
    /* debug */if (Date.now() - startTime > 100) {console.warn('infinite loop'); break}
    /* debug */var startTime = Date.now()
    for (let i = 0; i < len; i += 1) {
      /* debug */if (Date.now() - startTime > 100) {console.warn('infinite loop'); break}
      // Try to find a token. If not found, go to the next iteration of the loop
      let m = TOKENS[i][1].exec(string)
      if (!m || m.index !== 0) continue
      let { type, value } = {
        type: TOKENS[i][0],
        value: m[0]
      }
      let returnValue = CALLBACK ? CALLBACK({ type, value, m, index }) : { type, value }
      if (returnValue) tokens.push(returnValue)

      // Advance by slicing the string and push tokens to the list
      string = string.slice(value.length)
      index += value.length
      break
    }
  }
  return tokens
}

export let getOccurences = (map, m, index) => {
  let count = m[0].length
  let whole = map.array.slice(index, count + index)
  let occurences = [whole]

  let cursor = 0
  m.forEach((el, i) => {
    if (i !== 0) {
      if (el) {
        let count = el.length
        let occ = whole.slice(cursor, count + cursor)
        occurences.push(occ)
        cursor = count + cursor
      } else {
        occurences.push(null)
      }
    }
  })
  occurences.m = m
  occurences.index = index
  occurences.count = m[0].length
  return occurences
}

export let direct = (map, directives, self) => ({ type, value, m, index }) => {
  let result = getOccurences(map, m, index)
  if (directives[type]) {
    let returnValue = directives[type](result, self)
    if (returnValue) {
      if (Array.isArray(returnValue)) self.add(returnValue[0], returnValue[1])
      else self.add('o', returnValue)
    }
  } else {
    self.noop(result)
  }
}

Foldmaker.from = from
Foldmaker.traverse = traverse
Foldmaker.traverseObjects = traverseObjects
Foldmaker.flatten = flatten
Foldmaker.tokenize = tokenize
