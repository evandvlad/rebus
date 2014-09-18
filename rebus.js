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

    var RE_VAR = /\@\{([a-z][a-z\d]*)\}/g,
        RE_SPACES = /[\s\n\t]+/g;

    function isRegExp(v){
        return Object.prototype.toString.call(v) === '[object RegExp]';
    }

    return {

        version : '0.0.0',

        registry : Object.create(null),

        defvar : function(key, pattern){
            if(typeof this.registry[key] !== 'undefined'){
                throw new Error('pattern with key: ' + key + ' is already register');
            }

            this.registry[key] = isRegExp(pattern) ?
                // remove modifiers & start/end slashes
                ["/", pattern.source, "/"].join("").slice(1, -1) :
                pattern;

            return this;
        },

        compile : function(pattern, mods){
            var registry = this.registry,
                str = pattern.replace(RE_SPACES, '').replace(RE_VAR, function(all, g1){
                    if(typeof registry[g1] === 'undefined'){
                        throw new Error('key: ' + g1 + ' in pattern: ' + pattern + ' not found');
                    }

                    return registry[g1];
                });

                return new RegExp(str, mods);
        }
    };

}));