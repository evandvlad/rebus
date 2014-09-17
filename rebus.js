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

    var RE_KEY = /^[a-z][a-z\d]*$/i,
        KEY_SIGN = '@';

    function isRegExp(v){
        return Object.prototype.toString.call(v) === '[object RegExp]';
    }

    return {

        version : '0.0.0',

        registry : Object.create(null),

        register : function(key, pattern){
            if(typeof this.registry[key] !== 'undefined'){
                throw new Error('pattern with key: ' + key + ' is already register');
            }

            if(!RE_KEY.test(key)){
                throw new Error('invalid key: ' + key);
            }

            this.registry[key] = isRegExp(pattern) ? this._regexpToString(pattern) : pattern;

            return this;
        },

        compile : function(pattern, mods){
            var keys = Object.keys(this.registry),

                re = pattern.split(KEY_SIGN).reduce(function(acc, part, i){
                    var isIdent = i % 2,
                        result = part,
                        kindx;

                    if(isIdent){
                        kindx = keys.indexOf(part);

                        if(kindx === -1){
                            throw new Error('key: ' + part + ' in pattern: ' + pattern + ' not found');
                        }

                        result = this.registry[keys[kindx]];
                    }

                    return acc += result;
                }.bind(this), '');

                return new RegExp(re, mods);
        },

        _regexpToString : function(pattern){
            return ["/", pattern.source, "/"].join("").slice(1, -1);
        }
    };

}));