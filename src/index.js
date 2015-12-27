/**
 * Autor: Evstigneev Andrey
 * Date: 17.09.2014
 * Time: 23:01
 */

'use strict';

const RE_VAR = /\@\{([a-z][a-z\d]*)\}/gi;
const RE_SPACES = /[\s\n\t]+/g;

function isRegExp(v){
    return Object.prototype.toString.call(v) === '[object RegExp]';
}

export default class {
    
    constructor(){
        this._registry = Object.create(null);
    }
    
    defvar(name, pattern){
        if(typeof this._registry[name] !== 'undefined'){
            throw new Error(`rebus Error: variable "${name}" is already register`);
        }

        this._registry[name] = isRegExp(pattern) ?
            // remove modifiers & start/end slashes
            ["/", pattern.source, "/"].join("").slice(1, -1) :
            pattern;

        return this;
    }
    
    compile(pattern, mods){
        let registry = this._registry,
            str = pattern.replace(RE_SPACES, '').replace(RE_VAR, (all, g1) => {
                if(typeof registry[g1] === 'undefined'){
                    throw new Error(`rebus Error: variable "${g1}" was not found in the pattern "${pattern}"`);
                }

                return registry[g1];
            });

        return new RegExp(str, mods);
    }
}
