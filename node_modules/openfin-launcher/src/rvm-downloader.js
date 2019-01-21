var q = require('q');
var assetFetcher = require('./asset-fetcher');
var assetUtilities = require('./asset-utilities');
var fs = require('fs');
var path = require('path');

function download(url, writePath) {
    var deffered = q.defer();
    var tmpLocation = '.rvmTmp';
    assetFetcher.downloadFile(url, tmpLocation, function(err) {
        if (err) {
            deffered.reject(err);
        } else {
            assetUtilities.unzipFile(tmpLocation, path.dirname(writePath), function(unzipErr) {
                if (unzipErr) {
                    deffered.reject(unzipErr);
                } else {
                    fs.unlink(tmpLocation);
                    //unzip pipe finishes early and the file is still being moved by the OS, need to wait it out.
                    setTimeout(deffered.resolve, 300);
                }
            });
        }
    });

    return deffered.promise;
}

module.exports = {
    download: download
};
