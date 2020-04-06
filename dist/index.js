"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.visitor = exports.traverse = exports.tokenize = exports.FoldmakerObject = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FoldmakerObject = /*#__PURE__*/function () {
  function FoldmakerObject(obj) {
    _classCallCheck(this, FoldmakerObject);

    var hasTokens = obj && Array.isArray(obj);
    this.array = hasTokens ? obj.map(function (el) {
      return el.value;
    }) : [];
    this.string = hasTokens ? obj.map(function (el) {
      return el.type;
    }).join('') : '';
    this.modified = false; // These are here: easy extendability

    this.__proto__._tokenize = tokenize;
    this.__proto__._traverse = traverse;
  }

  _createClass(FoldmakerObject, [{
    key: "replace",
    value: function replace() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _this$_getDataFromArg = this._getDataFromArguments(args),
          tokens = _this$_getDataFromArg.tokens,
          debug = _this$_getDataFromArg.debug;

      return this._replace(this, tokens, debug);
    }
  }, {
    key: "parse",
    value: function parse() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _this$_getDataFromArg2 = this._getDataFromArguments(args),
          tokens = _this$_getDataFromArg2.tokens,
          debug = _this$_getDataFromArg2.debug;

      var self = this;

      do {
        self = (_readOnlyError("self"), this._replace(self, tokens, debug));
      } while (self.modified === true);

      return self;
    }
  }, {
    key: "traverse",
    value: function traverse(callback) {
      this.array = this._traverse(this.array, callback);
      return this;
    }
  }, {
    key: "add",
    value: function add(string, object) {
      this.array = this.array.concat(object);
      this.string += string;
    }
  }, {
    key: "_getDataFromArguments",
    value: function _getDataFromArguments(_ref) {
      var _ref2 = _slicedToArray(_ref, 3),
          tokens = _ref2[0],
          callback = _ref2[1],
          debug = _ref2[2];

      if (tokens instanceof RegExp) {
        tokens = [[callback, tokens]];
      } else {
        tokens = tokens.map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              a = _ref4[0],
              b = _ref4[1];

          return [b, a];
        });
        debug = callback;
      } // Add this as the last token by default, this will prevent infinite loops


      tokens.push([function () {
        return undefined;
      }, /[\s\n\S]/]);
      return {
        tokens: tokens,
        debug: debug
      };
    }
  }, {
    key: "_replace",
    value: function _replace(oldState, tokens, debug) {
      var _this = this;

      var state = Foldmaker();
      var string = oldState.string,
          array = oldState.array;

      this._tokenize(string, tokens, function (_ref5) {
        var type = _ref5.type,
            map = _ref5.map,
            index = _ref5.index;

        var occurrence = _this._getOccurrence(array, map, index);

        _this._manipulate(type, occurrence, state, oldState);
      });

      if (debug) debug(state);
      return state;
    }
  }, {
    key: "_getOccurrence",
    value: function _getOccurrence(array, map, index) {
      var count = map[0].length;
      return {
        raw: array.slice(index, count + index),
        index: index,
        count: count,
        map: map
      };
    }
  }, {
    key: "_manipulate",
    value: function _manipulate(type, occurrence, state, oldState) {
      var result = type(occurrence, state, oldState);

      if (result) {
        if (Array.isArray(result)) state.add(result[0], [result[1]]);else state.add('1', [result]);
        state.modified = true;
      } else {
        state.add(occurrence.map[0], occurrence.raw);
      }
    }
  }]);

  return FoldmakerObject;
}();

exports.FoldmakerObject = FoldmakerObject;

var tokenize = function tokenize(string, dictionary, callback) {
  var index = 0,
      tokens = []; // Add this as the last token by default, this will prevent infinite loops

  dictionary.push(['0', /[\s\n\S]/]);

  while (string) {
    dictionary.some(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 2),
          type = _ref7[0],
          regex = _ref7[1];

      var map = regex.exec(string);

      if (map && map.index === 0) {
        // If not found, we are here
        var value = map[0];
        var tokenValue = callback ? callback({
          type: type,
          value: value,
          map: map,
          index: index
        }) : {
          type: type,
          value: value
        };
        if (tokenValue) tokens.push(tokenValue); // Advance by slicing the string and push tokens to the list

        string = string.slice(value.length);
        index += value.length;
        return true;
      }
    });
  }

  return tokens;
};

exports.tokenize = tokenize;

var traverse = function traverse(node, callback) {
  var also = function also(subNode) {
    return subNode && traverse(subNode, callback);
  };

  if (Array.isArray(node)) return node.map(function (item) {
    return callback(item, also);
  });else return callback(node, also);
};

exports.traverse = traverse;

var visitor = function visitor(a, b) {
  return [a, b];
};

exports.visitor = visitor;

var Foldmaker = function Foldmaker(tokens) {
  return new FoldmakerObject(tokens);
};

Foldmaker.FoldmakerObject = FoldmakerObject;
Foldmaker.traverse = traverse;
Foldmaker.tokenize = tokenize;
Foldmaker.visitor = visitor;
Foldmaker.fm = Foldmaker; // shorthand, circular

var _default = Foldmaker;
exports["default"] = _default;