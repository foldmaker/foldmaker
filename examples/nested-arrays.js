import Foldmaker, { tokenize } from '../src'

// Description:
// Parses a nested array of numbers and arrays, and returns an array.
// Example input:
// let input = '[5,1, 2 ,[30, 40, [500, 600], 70], [], 8]'

export default string => {
  let tokens = tokenize(
    string,
    [
      ['n', /[\.0-9]+/], // Number
      [' ', /\s+/], // Whitespace
      ['*', /[\]\[,]/], // Delimiters
    ],
    t => {
      if (t.type == '*') t.type = t.value
      // Let them remain unchanged
      else if (t.type == ' ') return null // Ignore Whitespace
      return t
    }
  )

  return Foldmaker(tokens).parse(/\[[an](,[an])*\]|\[\]/, ({ raw }) => {
    let array = raw.filter(val => val !== ',')
    array = array.slice(1, array.length - 1)
    return ['a', array]
  }).values[0]
}

