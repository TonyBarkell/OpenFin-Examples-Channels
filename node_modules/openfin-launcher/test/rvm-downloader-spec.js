/*global describe, it */
'use strict';
var expect = require('chai').expect;

describe('rvm downloader', function() {
    var rvmDownloader = require('../src/rvm-downloader.js');

    describe('download function', function() {
        it('should exist', function() {
            expect(rvmDownloader.download).not.be.undefined();
        });
    });
});
