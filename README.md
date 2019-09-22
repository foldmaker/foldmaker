# ![](logo.png)
Foldmaker is a lightweight parser generator (120 lines uncommented). It can be used to build tokenizers, parsers, transpilers, linters, formatters, syntax highlighters and all other stuff. It is designed to be as minimal as possible. The API is designed to be user-friendly. You can implement SCSS-like preprocessors [only in ~70 lines](https://github.com/foldmaker/css-nested). 

I should warn you that Foldmaker is **opinionated!** When implementing a tokenizer (lexer) or a [scanner-less parser](https://en.wikipedia.org/wiki/Scannerless_parsing), Foldmaker can be used as any other parser, and therefore can be considered as unopinionated. However, in most complex cases (where you will have to use Foldmaker's `parse()` method), you will have to understand and apply the [following specifications](#tokenmapping-foldmaker-is-opinionated).

## Usage

Foldmaker can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm), by the following command:

```sh
npm install foldmaker
```
Importing Foldmaker by the default export is enough:

```js
import Foldmaker from 'foldmaker'
```

## TokenMapping (Foldmaker is Opinionated!)
Foldmaker is based on an innovative technique, that I would like to call "TokenMapping". Real power of Foldmaker comes from this technique. I don't believe I'm the first person to propose this technique, however I couldn't find it anywhere, so if you know its previous uses, please inform me.

TokenMapping is basically a specification for the structure of the Foldmaker object. A Foldmaker object has two main properties: 
**`array: Array`** and **`string: String`**. Take a look at this simple, valid Foldmaker object:
```js
{
  array: ["console.log", "(", "foo ", "=== ", "100", ";", ")" ],
  string: "i(ion;)",
}
```
Observe that both `array`'s and `string`'s length is 7 and they map to each other.
```js
"console.log",   "(",   "foo ",   "=== ",   "100",   ";",   ")"
      i           (       i         o         n       ;      ) 
```
This is simply it. A Foldmaker object is valid if `fm.array.length === fm.string.length` is true, where `fm` is the Foldmaker object. Now, for a Foldmaker object, 

- When using tokenizer, each token type must be a **string**, and this string's **length must be exactly 1**.


Unlike most parser generators, other than the tokenization part, it also uses regular expressions in the parsing part (more on this later). This makes Foldmaker an opinionated parser. This brings a lot of advantages: 
- Since searching with regular expressions is highly optimized, the resulting parsers can be more performant.





 For instance, `Foldmaker.tokenize()`, which is the lexer function, does not return the line and row numbers of the token. However, if you want, you can easily implement it by providing a callback function.


Foldmaker consists of `Foldmaker` class and a few helpers: `Foldmaker.tokenize()`, `Foldmaker.flatten()`, `Foldmaker.traverse()`, and `Foldmaker.traverseObjects()`. These helpers are the ones that are required for common use cases. Foldmaker class

tokenize()

## Demos

- **[infinite-loop-protection](https://github.com/foldmaker/infinite-loop-protection)**: A JavaScript transpiler that modifies your loops with a break condition
- **[shallow-ast](https://github.com/foldmaker/shallow-ast)**: A fast and 'shallow' AST generator for JavaScript
- **[css-nested](https://github.com/foldmaker/css-nested)**: Unwraps nested rules (like SCSS)
- **[css-indent](https://github.com/foldmaker/css-indent)**: Unwraps nested rules (like SASS)
- **[indent-to-tree](https://github.com/foldmaker/indent-to-tree)**: Converts indentation-based input into a tree


## Examples
## API

### Foldmaker class constructor
### tokenize()
### flatten()
### traverse()

https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js#tools-for-compiler-writers

## LICENSE [MIT](LICENSE)
