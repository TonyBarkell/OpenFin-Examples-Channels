var rvmDownloader = require('./src/rvm-downloader');
var nixLauncher = require('./src/nix-launcher');
var winLauncher = require('./src/win-launcher');
var expandOptions = require('./src/expand-options');
var assetUtilities = require('./src/asset-utilities');

var runningOs = assetUtilities.getRunningOs();
var launchOpenFin = runningOs === assetUtilities.OS_TYPES.windows ? winLauncher.launchOpenFin : nixLauncher.launchOpenFin;

module.exports = {
    launchOpenFin: launchOpenFin,
    downloadRvm: function() {
        var defaultOptions = expandOptions({});
        return rvmDownloader.download(defaultOptions.rvmUrl);
    }
};
