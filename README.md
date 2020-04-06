# ![](logo.png)

Foldmaker is a lightweight tool (120 lines uncommented), and **a way of thinking** for building general-purpose parsers. It was designed to be minimal and user-friendly. It has its own characteristic way of parsing. Design of Foldmaker is centered around a single idea that makes parsing easier:

> **PARSING IS RE-TOKENIZATION**

Now you know the truth. With the power of the truth, you can implement JSON.parse only in [~45 lines](https://github.com/foldmaker/json-parse) or SCSS-like preprocessors only in [~50 lines](https://github.com/foldmaker/css-nested). It's relieving that this truth can be explained with words. Not all the truths can be. Some truths are metaphors only. This one is not a metaphor. It's quite literal: Foldmaker uses its tokenizer function, also during parsing. The same function. We use it, first to tokenize our **string**, then to tokenize our **token stream**. Then we use it again, on the resulting token stream, and so on. Repeat after me:

> To **parse()** is to **tokenize()**. and to recursively **parse()** is solely to **tokenize()** enough times.

More on this is explained below.

### Special versions

-  [@foldmaker/strict](https://github.com/foldmaker/foldmaker-strict) - Strict mode with error logging
-  [@foldmaker/capturing-groups](https://github.com/foldmaker/foldmaker-capturing-groups) - Offers capturing group  support

### Examples
-  [@foldmaker/json-parse](https://github.com/foldmaker/json-parse) - JSON.parse implementation. Does not check validity.
-  [@foldmaker/css-nested](https://github.com/foldmaker/css-nested) - Tiny plugin to unwrap nested CSS rules (like SCSS)
-  [@foldmaker/shallow-ast](https://github.com/foldmaker/shallow-ast) - Error tolerant AST generator for JS-like languages

### Installation
Foldmaker can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm), by the following command:
```sh
npm install foldmaker
```
Importing Foldmaker by the default export is enough:
```js
import  Foldmaker  from  'foldmaker'
```

## How it works?

In foldmaker, tokenization and parsing are analogous processes. Our tokenizer function is also used as the parser function under the hood. First our **string** gets tokenized by it, then our **token stream** gets tokenized. This is possible, because in Foldmaker, **token stream is a string!** This is possible thanks to the **first rule** of Foldmaker's specification:

> 1. Always use one-character token names

While this rule may seem to restrict the user, but it has its own advantages. Let me explain. Let's say, in the following string, we want to match the condition inside the if block. We want to identify `foo === 1` part as the "**condition**" .
```
if(foo === 1) { print('ONE') }
```
Imagine, after tokenization, we have the following array of tokens. `i` for if, `p` for primitive, `o` for operator and `b` for body.
```js
let tokens = [
  {type: "i", value: "if"},
  {type: "(", value: "("},
  {type: "p", value: "foo"},
  {type: "o", value: "==="},
  {type: "p", value: "1"},
  {type: ")", value: ")"},
  {type: "b", value: "{ print('ONE') }"}
]
```
Now let's input our **array of tokens** inside `Foldmaker`  like below:
```js
let fm = Foldmaker(tokens)
```
we get the following `FoldmakerObject`. 
```js
{
  array: ["if", "(", "foo ", "=== ", "1", ") ", "{ print('ONE') }"  ],
  string: "i(pop)b",
  __proto__: FoldmakerObject
}
```
This is the first maneuver of Foldmaker. It creates two streams by joining types and values. Observe that each element of the string maps to an element in the array with the same index, and vice versa. Now, let's return to our case. In our case, we need to match the string that is represented by `pop` (primitive, operator, primitive in series) right? Let's say that we are going to mark that as `c` (condition). First, let's log our matching occurrence in the console. 

We simply use `replace` method of Foldmaker:
```js
let fm = fm.replace(/pop/, result => console.log(result))
console.log(fm.string)
```
Console output:
```js
First log: {
  raw: ["foo",  "===",  "1"],
  map: ["pop",  index:  0,  input:  "pop)b",  groups:  undefined],
  index: 2,
  count: 3
}
Second log: "i(pop)b"
```
As you can see on the first log, our occurrence is shown in the `raw` key. Since we didn't return anything inside the callback function of the `replace` method, the string in our Foldmaker instance (`fm.string`) did not change, as can be seen on the second log. Let's manipulate If we return something inside the callback function as the following:
```js
let fm = fm.replace(/pop/, result => {
	return ['c', { value: result.raw }]
})
console.log(fm)
```
console output will be:
```js
{
  array: ["if", "(", Object, ") ", "{ print('ONE') }"  ],
  string: "i(c)b",
}
```

> 2. Don't use '0' as a token name, it's reserved for unknown token type.
> 3. Don't use '1' as a token name, it's reserved for unset parsed token type.
**Input string:**
```js
{"a": 1, "b": 2, "c": [1, 2, 3, {"deep": {}}]}
```
**Foldmaker's parsing steps:**
```
Token stream : {s:n,s:n,s:[n,n,n,{s:{}}]}
Iteration 1  : {k,k,s:[n,n,n,{s:o}]}
Iteration 2  : {k,k,s:[n,n,n,{k}]}
Iteration 3  : {k,k,s:[n,n,n,o]}
Iteration 4  : {k,k,s:a}
Iteration 5  : {k,k,k}
Iteration 6  : o
Iteration 7  : o
```


## API

### Exports
| Export                      | Usage                                | Description  |
|-----------------------------|--------------------------------------|--------------|
| **default** (function)      | `Foldmaker(tokensArray)  `           | Takes a `tokensArray` and returns a FoldmakerObject  |
| **tokenize** (function)     | `tokenize(string, dictionary {, callback })` | Tokenizes the `string` by using `dictionary`. Returns an array of tokens.  |
| **traverse** (function)     | `traverse(node, callback)`           | Conducts tree traversal for `node`. Node can be of type non-array or array. |
| **visitor** (function)      | `visitor(regexp, callback)`          | Is a helper function |
| **FoldmakerObject** (class) | -                                    |   |
| **fm** (function)           | `fm(tokensArray)`                    | Is a shorthand for default export (circular)  |

### Methods of `FoldmakerObject`
| Method   | Usage                                | Arguments of callback           |   |   |
|----------|--------------------------------------|---------------------------------|---|---|
| **parse**    | `parse(regex , callback {, debug })`   | `(result {, state {, oldState}})` |   |   |
| **replace**  | `replace(regex , callback {, debug })` | `(result {, state {, oldState}})` |   |   |
| **traverse** | `traverse(callback)`                   | `(object {, alsoTraverse})`       |   |   |
| **add**      | `add(string, array)`                   | -                                |   |   |




https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js#tools-for-compiler-writers

  

## LICENSE [MIT](LICENSE)