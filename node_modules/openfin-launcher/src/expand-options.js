var os = require('os');
var _ = require('lodash');
var path = require('path');

var xpLocation = '\\Local Settings\\Application Data\\OpenFin';
var winEightOrGreater = '\\AppData\\Local\\OpenFin';
var isWindows = os.type().toLowerCase().indexOf('windows') !== -1;
var isMac = os.type().toLowerCase().indexOf('darwin') !== -1;


function expand(options) {
    var defaultOptions = {
        rvmUrl: 'https://developer.openfin.co/release/rvm/latest'
    };

    if (isWindows) {
        var isXP = isWindows && (+os.release().split('.')[0]) < 6;
        var defaultAppData = path.join(process.env['USERPROFILE'], isXP ? xpLocation : winEightOrGreater);
        defaultOptions.rvmPath = path.resolve(defaultAppData, 'OpenFinRVM.exe');
    }
    if (isMac) {
        //TODO:support multiple versions....
        defaultOptions.macAppPath = '/Applications/OpenFin.app';
    }
    // use the options, filling in the defaults without clobbering them
    return _.defaults(_.clone(options), defaultOptions);

}

module.exports = expand;
