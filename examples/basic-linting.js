import Foldmaker, { tokenize, visitor } from '../src'

// Same as the nested-arrays example, additionally there is some
// custom visitors that check for invalid series of tokens.

export default string => {
  let tokens = tokenize(
    string,
    [
      ['n', /[\.0-9]+/], // Number
      [' ', /\s+/], // Whitespace
      ['*', /[\]\[,]/], // Delimiters
    ],
    t => {
      if (t.type == '*') t.type = t.value // Let them remain unchanged
      else if (t.type == ' ') return null // Ignore Whitespace
      return t
    }
  )

  return Foldmaker(tokens).parse([
    visitor(/\[[an](,[an])*\]|\[\]/, ({ raw }) => {
      let array = raw.filter(val => val !== ',')
      array = array.slice(1, array.length - 1)
      return ['a', array]
    }),
    errorVisitor(/[an][an]/, i => 'Missing comma at index ' + i),
    errorVisitor(/,\]/, i => 'Unnecessary comma at index ' + i),
    errorVisitor(/\[,/, i => 'Unnecessary comma at index ' + i),
    errorVisitor(/,,|\]\[/, i => 'Unexpected character at index ' + i),
  ])
}

// Gets leftmost non-array element
function getNonArrayElem(arr) {
  if (Array.isArray(arr)) return arr[0]
  return arr
}

// Custom visitor for printing the error message
const errorVisitor = (regex, callback) => {
  const customCallback = result => {
    let index = getNonArrayElem(result.props[1]).index
    throw SyntaxError(callback(index))
  }
  return [regex, customCallback]
}
