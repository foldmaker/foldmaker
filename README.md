# ![](logo.png)

Foldmaker is a lightweight tool (120 lines uncommented), and **a way of thinking** for building parsers. It was designed to be as user-friendly and minimal as possible. Design of Foldmaker is centered around a single idea that makes parsing easier:

> **PARSING IS RE-TOKENIZATION**

Now you know the truth. With the power of the truth, you can implement JSON.parse only in [~45 lines](https://github.com/foldmaker/json-parse) or SCSS-like preprocessors only in [~50 lines](https://github.com/foldmaker/css-nested). It's relieving that this truth can be explained with words. Not all the truths can be. Some truths are metaphors only. This one is not a metaphor. It's quite literal: Foldmaker uses its tokenizer function, also during parsing. The same function. We use it, first to tokenize our **string**, then to tokenize our **token stream**. Then we use it again, on the resulting token stream, and so on. Repeat after me:

> To **parse()** is to **tokenize()**. and to recursively **parse()** is solely to **tokenize()** enough times.

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

In foldmaker, tokenization and parsing are analogous processes. Under the hood, our tokenizer function is also used as the parser function. First our **string** gets tokenized by it, then our **token stream** gets tokenized. This is possible, because in Foldmaker, **token stream is a string!** This is possible thanks to the first rule of Foldmaker's specification:

> 1. Use one-character token names

Now, I'm going to explain why we have this rule. Let's say, in the following string, we want to match the condition inside the if block. We want to identifiy `foo === 1` part as the "condition" .
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
`Foldmaker` function takes **array of tokens** as the input. So when we input our array to Foldmaker like below:
```js
Foldmaker(tokens)
```
we get the following `FoldmakerObject`. 
```js
{
  array: ["if", "(", "foo ", "=== ", "1", ") ", "{ print('ONE') }"  ],
  string: "i(pop)b",
  prototype: FoldmakerObject
}
```
Observe that both token types and values are mapped to create an array and a string. Element at each indexes of the string and the array inside this object, maps to each other.

Foldmaker is an abstraction for you to  The most important thing

Before the truth, you need to learn 3 rules of Foldmaker:

> 2. Don't use '0' as a token name, it's reserved for unknown token type.
> 3. Don't use '1' as a token name, it's reserved for unset parsed token type.

Let's say, we want to be able to parse the following string:
```
{name:Spongebob, friends:{friend1: Patrick, friend2: Sandy}}
```
The following is  **BNF**  (Backus-Naur Form) notation on how to parse it.
```
<value>    ::= <object> | <string> 
<object>   ::= "{" <property> {"," <property>}* "}" | "{}"
<property> ::= <string> ":" <value>
```

```js
Tokenizer part:
s: /\w+/
*: /[\{\},:]/ 
 
Parser part:
v: /o|s/
o: /{p(,p)*}|{}/
p: /s:v/
```
This is  **BNF**  (Backus-Naur Form) notation to describe context-free grammars


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