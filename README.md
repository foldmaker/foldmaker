# ![](logo.png)
Foldmaker is a lightweight tool (120 lines uncommented), and **a way of thinking** for building parsers. It was designed to be as user-friendly and minimal as possible. Design of Foldmaker is centered around a single idea that makes parsing easier:

> **PARSING IS RE-TOKENIZATION**

Now you know the Truth. With the power of the Truth, you can implement JSON.parse only in [~45 lines](https://github.com/foldmaker/json-parse) or SCSS-like preprocessors only in [~50 lines](https://github.com/foldmaker/css-nested). It's relieving that this Truth can explained with words. Not all the truths can be. Some truths are only metaphors. This one is not only a metaphor. It's very literal: Foldmaker uses its tokenizer function, also during parsing. The same function. We use it, first to tokenize our **string**, then to tokenize our **token stream**. Then we use it again, on the resulting token stream, and so on. Repeat after me: 
> To **parse()** is to **tokenize()**. and to recursively **parse()** is only to **tokenize()** enough times.

More on this is explained below.

## Usage
Foldmaker can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm), by the following command:
```sh
npm install foldmaker
```
Importing Foldmaker by the default export is enough:
```js
import  Foldmaker  from  'foldmaker'
```

## The truth: "PARSING IS RE-TOKENIZATION"






Another level of abstraction to the Truth,
> Use one-character token names.


Let's say, we want to match the condition inside the if block.
```
if(foo === 1) { print('ONE') }
```
Imagine, after tokenization, it has the following form. `i` for if, `p` for primitive, `o` for operator and `b` for body.
```js
{
  array: ["if", "(", "foo ", "=== ", "1", ") ", "{ print('ONE') }"  ],
  string: "i(pop)b",
}
```
It's clear that we need to match  `pop` (primitive, operator, primitive in series) right?
Let's reduce `pop` (primitive, operator, primitive in series) into `c` (condition)
```js
{
  array: ["if", "(", Object, ") ", "{ print('ONE') }"  ],
  string: "i(c)b",
}
```
Now, did you see how easy it was? Let's see the other alternative
```
CONDITION: PRIMITIVE, OPERATOR, PRIMITIVE {, OPERATOR, PRIMITIVE}*
c: /pop(op)*/
```

**Summary:** Use one-character token names, so that you can leverage the power of string matching twice.

Foldmaker imposes a restricted way to write parsers. The user should give tokens one-character names. Like 'a', 'B' or '5'.
is based on a smart way, that I would like to call "Map of the Territory". 

Real power of Foldmaker comes from this technique. I don't believe I'm the first person to propose this technique, however I couldn't find it anywhere, so if you know its previous uses, please inform me.

  

TokenMapping is basically a specification for the structure of the Foldmaker object. A Foldmaker object has two main properties:

**`array: Array`** and **`string: String`**. Take a look at this simple, valid Foldmaker object:

```js
{
  array: ["if", "(", "foo ", "=== ", "1", ") ", "{ print('ONE') }"  ],
  string: "k(ion)e",
}
```

Observe that both `array`'s and `string`'s length is 7 and they map to each other.

```js

"if", "(", "foo ", "=== ", "100", ")", "{ print('ONE') }",

k  (  i  o  n  )  b

```

This is simply it. A Foldmaker object is valid if `fm.array.length === fm.string.length` is true, where `fm` is the Foldmaker object. Now, how does this exactly help? First, I should mention that, in this example, "k" stands for keyword, "i" stands for identifier, "o" for operator, "n" for number, "b" for block, and the rest stands for the same characters as themselves (parantheses).

  

Now, see the following RegExp that matches expressions (non-zero length clusters of identifiers, operators and numbers). Let's call this type of RegExps as "meta-expression" or "MetaExp"

...

# This Section Is Incomplete

  

- When using tokenizer, each token type must be a **string**, and this string's **length must be exactly 1**.

  

(more on this later). This makes Foldmaker an opinionated parser. This brings a lot of advantages:

- Since searching with regular expressions is highly optimized, the resulting parsers can be more performant.

  

For instance, `Foldmaker.tokenize()`, which is the lexer function, does not return the line and row numbers of the token. However, if you want, you can easily implement it by providing a callback function.

  

Foldmaker consists of `Foldmaker` class and a few helpers: `Foldmaker.tokenize()`, `Foldmaker.flatten()`, `Foldmaker.traverse()`, and `Foldmaker.traverseObjects()`. These helpers are the ones that are required for common use cases. Foldmaker class

  
  

## Examples

## API

  

### Foldmaker class constructor

### tokenize()

### flatten()

### traverse()

  

https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js#tools-for-compiler-writers

  

## LICENSE [MIT](LICENSE)