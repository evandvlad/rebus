/**
 * Autor: Evstigneev Andrey
 * Date: 17.09.2014
 * Time: 23:02
 */

var assert = require("assert"),
    Rebus = require('../rebus.js');

describe('birch', function(){

    describe('registry', function(){

        it('not unique key', function(){
            var rebus = new Rebus();

            rebus.defvar('a', '$');

            assert.throws(function(){
                rebus.defvar('a', '$');
            });
        });

    });

    describe('pattern processing', function(){

        it('not processing strings', function(){
            var rebus = new Rebus(),
                vals = [
                    ['a', '@'],
                    ['b', '\\d'],
                    ['c', './.~!@#$%^&*()[]']
                ];

            vals.forEach(function(val){
                var key = val[0],
                    s = val[1];

                rebus.defvar(key, s);
                assert.equal(rebus.registry[key], s);
            });
        });

        it('regexp constructors', function(){
            var rebus = new Rebus(),
                vals = [
                    ['a', new RegExp('\\d'), '\\d'],
                    ['b', new RegExp(/\d/), '\\d'],
                    ['c', new RegExp('^\\d\\d$', 'gmi'), '^\\d\\d$'],
                    ['d', new RegExp(/\d\d/i), '\\d\\d']
                ];

            vals.forEach(function(val){
                var key = val[0],
                    obj = val[1],
                    rs = val[2];

                rebus.defvar(key, obj);
                assert.equal(rebus.registry[key], rs);
            });
        });

        it('regexp literals', function(){
            var rebus = new Rebus(),
                vals = [
                    ['a', /\d/, '\\d'],
                    ['b', /\d/gmi, '\\d'],
                    ['c', /^\d\d$/, '^\\d\\d$'],
                    ['d', /\d\d/g, '\\d\\d']
                ];

            vals.forEach(function(val){
                var key = val[0],
                    obj = val[1],
                    rs = val[2];

                rebus.defvar(key, obj);
                assert.equal(rebus.registry[key], rs);
            });
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

            rebus.defvar('a', '\\.');

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
