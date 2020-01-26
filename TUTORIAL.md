# foldmaker.js Tutorial

## Block matching and creating a tree structure

Let's say we want to convert the following string into a nested object.

```js
let string = `
{
  foo
  {
    bar
  }
  {}
}
`
```

First, let us tokenize the string. Tokenize function is imported and used in the following fashion:

```js
import { tokenize } from 'foldmaker'

// Start with tokenization
let tokens = tokenize(string, [
  [' ', /[ \n]+/], // spaces or newline characters
  ['{', /{/],
  ['}', /}/],
  ['K', /\w*/] // E stands for 'key'
])
console.log(tokens)
```

Note that the first argument is the string to be tokenized and the second is the **TokenMatchers** argument. It's an array that should have the following shape:

```ts
PropTypes.arrayOf(PropTypes.shape([
  TokenType<String of length 1>,
  TokenRegExp<RegExp>
]))
```

Let's observe the **TokenStream** that is logged into console:

```
(15) [
  0: {type: " ", value: "↵"}
  1: {type: "{", value: "{"}
  2: {type: " ", value: "↵  "}
  3: {type: "K", value: "foo"}
  4: {type: " ", value: "↵  "}
  5: {type: "{", value: "{"}
  6: {type: " ", value: "↵    "}
  7: {type: "K", value: "bar"}
  8: {type: " ", value: "↵  "}
  9: {type: "}", value: "}"}
  10: {type: " ", value: "↵  "}
  11: {type: "{", value: "{"}
  12: {type: "}", value: "}"}
  13: {type: " ", value: "↵"}
  14: {type: "}", value: "}"}
  length: 15
  __proto__: Array(0)
]
```

Remember that newline and space characters are not needed in our case. We could simply not include them by providing a callback function to our tokenizer as the third argument.

```js
let tokens = tokenize(
  string,
  [
    [' ', /[ \n]+/], // spaces or newline characters
    ['{', /{/],
    ['}', /}/],
    ['K', /\w*/]
  ],
  ({ type, value }) => {
    // Ignore spaces and newline characters right from the start
    if (type === ' ') return null
    return { type, value }
  }
)
```

Now we have less tokens, only the relevant ones remain:

```
(8) [
  0: {type: "{", value: "{"}
  1: {type: "K", value: "foo"}
  2: {type: "{", value: "{"}
  3: {type: "K", value: "bar"}
  4: {type: "}", value: "}"}
  5: {type: "{", value: "{"}
  6: {type: "}", value: "}"}
  7: {type: "}", value: "}"}
  length: 8
  __proto__: Array(0)
]
```

Now, we can start seeing the real benefits of Foldmaker. Let's start by converting out **TokensStream** into a **FoldmakerObject**.

```js
console.log(Foldmaker(tokens))
```

```
FoldmakerObject
  array: (8) ["{", "foo", "{", "bar", "}", "{", "}", "}"]
  string: "{K{K}{}}"
  modified: false
  __proto__: Object
```

A FoldmakerObject has two main keys: `array` and `string`. They always map to each other. When a manipulation on the array is carried out, the same should be carried out on the string. The array's length (8) and the string's length (8) are same to each other, and should remain same after each manipulation.

Let's return to our case. In out string, `{bar}` and `{}` should represent object blocks. One is an object with a single key, and the other is an empty object. Lets check if we can match them by using Foldmaker.

```js
Foldmaker(tokens).replace(/\{K*\}/, result => {
  console.log(result[0])
})
```

As seen, we used `.replace()` method of Foldmaker. (Not to be confused with `String.replace`) The first argument is a RegExp, and the second one is a function. `result` is an array-like object. We are logging only the first element of `result`, since we are not dealing with any capturing groups. The output on the console is:

```
(3) ["{", "bar", "}"]
(2) ["{", "}"]
```

We succesfully matched these blocks. Now lets replace them. Let's replace them with an object. In Foldmaker, we can replace strings in the array with any of the JavaScript types. Let's replace all the blocks with `{hello: 'world'}`

```js
let fm = Foldmaker(tokens).replace(/\{K*\}/, result => {
  return { hello: 'world' }
})
console.log(fm)
```

See the console:

```
FoldmakerObject
  array: (5) ["{", "foo", {hello: 'world'}, {hello: 'world'}, "}"]
  string: "{K11}"
  modified: true
  __proto__: Object
```

We did it. Also notice that it says `string: "{w11}"`. What's happening right there? We know that curly braces and the letter K are valid token names that we have set in `TokenMatchers`, but where did those 1's come from?

This is an important thing about Foldmaker. If you don't specify a token type for what you are returning in the callback function, the token type falls back to `'1'`. So, you probably wouldn't want to use `1` or `'1'` as a TokenType in any stage. This is **Rule 1** for Foldmaker:

> Unsetted **TokenType**s during transforms will have `'1'` as the **TokenType**.

There is also **Rule 0**:

> Unmatched characters during `tokenize` method will have `'0'` as the **TokenType**.

If we return an array during transforms, the first element of the array will be considered as the TokenType and the second will be our transform. If we return `null` or `undefined`, the node will simply be ignored. The following way, we set `'K'` as the TokenType for our transform.

```js
let fm = Foldmaker(tokens).replace(/\{K*\}/, result => {
  let obj = {}
  obj.key = result[0].slice(1, -1)[0] // name without curly braces
  return ['K', obj]
})
console.log(fm.array)
```

```
(5) ["{", "foo", {key: 'bar'}, {}, "}"]
```

Now, if we run this process multiple times, we can reduce the structure, step by step, into the following form:

```
Original: (8) ["{", "foo", "{", "bar", "}", "{", "}", "}"]
Step 1:   (5) ["{", "foo",   { 0: "bar"},    {},      "}"]
Step 2:   (1) [ {0: "foo", 1: { 0: "bar"}, 2: {}       } ]
```

This process could be achieved by only slightly modifying what we have done already:

```diff
- let fm = Foldmaker(tokens).replace(/\{K*\}/, result => {
+ let f = Foldmaker(tokens).parse(/\{K*\}/, result => {
    let obj = {}
-   obj.key = result[0].slice(1, -1)[0]
+   let keys = result[0].slice(1, -1)

+   keys.forEach((key, i) => (obj[i] = key))
    return ['K', obj]
  })
  console.log(fm.array)
```

`parse` and `replace` methods are very similar. They share the same argument structure. Parse method consists of multiple iterations of replace method until there is no change anymore. Thus, when we "package" our object under the TokenType of `'K'`, in the next iteration, it gets matched, just like how key names are matched.

The final code is:

```js
let tokens = tokenize(
  string,
  [
    [' ', /[ \n]+/], // spaces or newline characters
    ['{', /{/],
    ['}', /}/],
    ['K', /\w*/]
  ],
  ({ type, value }) => {
    // Ignore spaces and newline characters right from the start
    if (type === ' ') return null
    return { type, value }
  }
)

let fm = Foldmaker(tokens).parse(/\{K*\}/, result => {
  let obj = {}
  let keys = result[0].slice(1, -1) // content without curly braces
  keys.forEach((key, i) => {
    obj[i] = key
  })
  return ['K', obj]
})
console.log(fm.array) // logs [{"0":"foo","1":{"0":"bar"},"2":{}}]
```

```js
let fm = Foldmaker(tokens)
  .parse(/\{K*\}/, result => {})
  .parse([
    visitor(/\{K*\}/, result => {}),
    visitor(/\{K*\}/, result => {})    
  ])
  .parse(/\{K*\}/, result => {})
```
