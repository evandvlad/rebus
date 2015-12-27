'use strict';

var tests = require('./spec'),
    
    Rebus = require('../dist/rebus'),
    RebusMin = require('../dist/rebus.min');

tests.run(Rebus);
tests.run(RebusMin);

