/*global describe, it */
'use strict';
var openfinLauncher = require('../'),
    expect = require('chai').expect;

describe('openfin-launcher', function() {
    describe('launchOpenFin function', function() {
        it('should exist', function() {
            expect(openfinLauncher.launchOpenFin).not.be.undefined();
        });
    });
});

/*
var ofl = require('./index');
ofl.launchOpenFin({configPath: 'http://local:8080/app.json'});


var ofl = require('./index');
ofl.launchOpenFin({configPath: 'http://cdn.openfin.co/demos/lightstreamer/app.json'});

 */
