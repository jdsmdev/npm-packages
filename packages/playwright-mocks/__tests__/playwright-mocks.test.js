'use strict';

const playwrightMocks = require('..');
const assert = require('assert').strict;

assert.strictEqual(playwrightMocks(), 'Hello from playwrightMocks');
console.info('playwrightMocks tests passed');
