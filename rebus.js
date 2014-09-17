/**
 * Autor: Evstigneev Andrey
 * Date: 17.09.2014
 * Time: 23:01
 */

(function(global, initializer){

    global.rebus = initializer();

    if(typeof module !== 'undefined' && module.exports){
        module.exports = global.rebus;
    }

}(this, function(){

    'use strict';

    var RE_KEY = /^[a-z][a-z\d]*/i,
        KEY_SIGN = '@';

    function isRegExp(v){
        return Object.prototype.toString.call(v) === '[object RegExp]';
    }

    return {

        version : '0.0.0',

        registry : Object.create(null),

        defvar : function(key, pattern){
            var match;

            if(typeof this.registry[key] !== 'undefined'){
                throw new Error('pattern with key: ' + key + ' is already register');
            }

            match = key.match(RE_KEY);

            if(!(match && match[0] === key)){
                throw new Error('invalid key: ' + key);
            }

            this.registry[key] = isRegExp(pattern) ? this._regexpToString(pattern) : pattern;

            return this;
        },

        compile : function(pattern, mods){
            var registry = this.registry,
                keys = Object.keys(registry),

                re = pattern.split(KEY_SIGN).reduce(function(acc, part, i){
                    var result = part,
                        match;

                    if(i > 0){
                        match = part.match(RE_KEY);

                        if(!match || keys.indexOf(match[0]) === -1){
                            throw new Error('key: ' + part + ' in pattern: ' + pattern + ' not found');
                        }


                        result = registry[match[0]] + part.slice(match[0].length);
                    }

                    return acc += result;
                }, '');

                return new RegExp(re, mods);
        },

        _regexpToString : function(pattern){
            // remove modifiers & start/end slashes
            return ["/", pattern.source, "/"].join("").slice(1, -1);
        }
    };

}));