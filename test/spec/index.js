/**
 * Autor: Evstigneev Andrey
 * Date: 17.09.2014
 * Time: 23:02
 */

'use strict';

var assert = require("assert");

module.exports = {
    
    run : function(Rebus){

        describe('Rebus', function(){

            describe('registry', function(){

                it('not unique key', function(){
                    var rebus = new Rebus();

                    rebus.defvar('a', '$');

                    assert.throws(function(){
                        rebus.defvar('a', '$');
                    }, /rebus Error: variable "a" is already register/);
                });
            });

            describe('compile', function(){

                it('concat strings', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', '@');
                    rebus.defvar('b', '#');

                    r1 = rebus.compile('@{a}@{b}');
                    assert.equal(r1.test('@#'), true);
                    assert.equal(r1.test('#@'), false);
                    assert.equal(r1.test('!!@####!!'), true);
                });

                it('escaped strings', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', new RegExp('\\.'));

                    r1 = rebus.compile('@{a}');
                    assert.equal(r1.test('.'), true);
                    assert.equal(r1.test('t'), false);
                });

                it('concat strings with limiters', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', '@');
                    rebus.defvar('b', '#');

                    r1 = rebus.compile('^@{a}@{b}$');
                    assert.equal(r1.test('@#'), true);
                    assert.equal(r1.test('#@'), false);
                    assert.equal(r1.test('!!@####!!'), false);
                });

                it('concat strings with modifiers', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', 'a');
                    rebus.defvar('b', 'b');

                    r1 = rebus.compile('^@{a}@{b}$', 'i');
                    assert.equal(r1.test('ab'), true);
                    assert.equal(r1.test('Ab'), true);
                    assert.equal(r1.test('aB'), true);
                    assert.equal(r1.test('!!ab!!'), false);
                });

                it('strings alts', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', 'a');
                    rebus.defvar('b', 'b');

                    r1 = rebus.compile('a@{a}|@{b}');
                    assert.equal(r1.test('aab'), true);
                    assert.equal(r1.test('aa'), true);
                    assert.equal(r1.test('ab'), true);
                    assert.equal(r1.test('a'), false);
                    assert.equal(r1.test('!!!!'), false);
                });

                it('strings plus', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', 'a');
                    rebus.defvar('b', 'b');

                    r1 = rebus.compile('a(@{a}+)');
                    assert.equal(r1.test('aab'), true);
                    assert.equal(r1.test('aa'), true);
                    assert.equal(r1.test('ab'), false);
                    assert.equal(r1.test('a'), false);
                    assert.equal(r1.test('!!!!'), false);
                });

                it('strings asterix', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', 'a');
                    rebus.defvar('b', 'b');

                    r1 = rebus.compile('a(@{a}*)');
                    assert.equal(r1.test('aab'), true);
                    assert.equal(r1.test('aa'), true);
                    assert.equal(r1.test('a'), true);
                    assert.equal(r1.test('!!!!'), false);
                });

                it('ignore spaces', function(){
                    var rebus = new Rebus(),
                        r1;

                    rebus.defvar('a', 'a');
                    rebus.defvar('b', 'b');

                    r1 = rebus.compile('^ @{a} @{b} $');
                    assert.equal(r1.test('ab'), true);
                    assert.equal(r1.test('a b'), false);
                    assert.equal(r1.test(' a b '), false);
                });
                
                it('exception if use undefined variable', function(){
                    var rebus = new Rebus();
                        
                    assert.throws(function(){
                        rebus.compile('^ @{a} @{b} $');
                    }, /rebus Error: variable "a" was not found in the pattern /);
                });
            });

            describe('examples', function(){

                it('ex 1', function(){
                    var rebus = new Rebus(),
                        r;

                    rebus.defvar('S', '@');
                    rebus.defvar('V', /[a-z][a-z\d]*/);

                    r = rebus.compile('^ @{S} \{ @{V} \} $', 'i');

                    assert.equal(r.test('@{var}'), true);
                    assert.equal(r.test('@{var124}'), true);
                    assert.equal(r.test('@{VAR124}'), true);

                    assert.equal(r.test('@{13VAR124}'), false);
                    assert.equal(r.test('@{{var}}'), false);
                    assert.equal(r.test('${{var}}'), false);
                    assert.equal(r.test('{var}'), false);
                });

                it('ex 2', function(){
                    var rebus = new Rebus(),
                        r;

                    rebus.defvar('digit', /\d/);
                    rebus.defvar('letter', /[a-z]/);
                    rebus.defvar('sign', /[_$]/);
                    rebus.defvar('head', rebus.compile('(@{sign} | @{letter})'));
                    rebus.defvar('tail', rebus.compile('(@{head} | @{digit})'));

                    r = rebus.compile('^ @{head} @{tail}* $', 'i');

                    assert.equal(r.test('$var'), true);
                    assert.equal(r.test('$___var___'), true);
                    assert.equal(r.test('_var'), true);
                    assert.equal(r.test('var'), true);
                    assert.equal(r.test('v1a2r3'), true);
                    assert.equal(r.test('VAR'), true);

                    assert.equal(r.test('1var'), false);
                    assert.equal(r.test('#var'), false);
                });
            });
        });

    }
};

