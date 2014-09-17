/**
 * Autor: Evstigneev Andrey
 * Date: 17.09.2014
 * Time: 23:02
 */

var assert = require("assert"),
    rebus = require('../rebus.js');

describe('birch', function(){

    describe('registry', function(){

        it('not unique key', function(){
            rebus.register('a', '$');

            assert.throws(function(){
                rebus.register('a', '$');
            });

            delete rebus.registry['a'];
        });

        it('valid keys', function(){
            var keys = [
                'a',
                'a123',
                'test',
                'TEST'
            ];

            keys.forEach(function(key){
                rebus.register(key, '$');
                delete rebus.registry[key];
            })
        });

        it('invalid keys', function(){
            var keys = [
                'тест',
                '$a123',
                'test_test',
                '123',
                'test test',
                'test-test'
            ];

            keys.forEach(function(key){
                assert.throws(function(){
                    rebus.register(key, '$');
                });

                delete rebus.registry[key];
            })
        });

    });

    describe('pattern processing', function(){

        it('not processing strings', function(){
            var vals = [
                ['a', '@'],
                ['b', '\\d'],
                ['c', './.~!@#$%^&*()[]']
            ];

            vals.forEach(function(val){
                var key = val[0],
                    s = val[1];

                rebus.register(key, s);
                assert.equal(rebus.registry[key], s);

                delete rebus.registry[key];
            })
        });

        it('regexp constructors', function(){
            var vals = [
                ['a', new RegExp('\\d'), '\\d'],
                ['b', new RegExp(/\d/), '\\d'],
                ['c', new RegExp('^\\d\\d$', 'gmi'), '^\\d\\d$'],
                ['d', new RegExp(/\d\d/i), '\\d\\d']
            ];

            vals.forEach(function(val){
                var key = val[0],
                    obj = val[1],
                    rs = val[2];

                rebus.register(key, obj);
                assert.equal(rebus.registry[key], rs);

                delete rebus.registry[key];
            })
        });

        it('regexp literals', function(){
            var vals = [
                ['a', /\d/, '\\d'],
                ['b', /\d/gmi, '\\d'],
                ['c', /^\d\d$/, '^\\d\\d$'],
                ['d', /\d\d/g, '\\d\\d']
            ];

            vals.forEach(function(val){
                var key = val[0],
                    obj = val[1],
                    rs = val[2];

                rebus.register(key, obj);
                assert.equal(rebus.registry[key], rs);

                delete rebus.registry[key];
            })
        })

    });
});
