var assetFetcher = require('./asset-fetcher');
var os = require('os');
var path = require('path');
var fs = require('fs');
var unzip = require('unzip');
var log = require('single-line-log').stdout;
var spawn = require('child_process').spawn;

var home = process.env.HOME;
var runtimeRoot = process.env.RUNTIME_ROOT || 'https://developer.openfin.co/release/runtime/';

var OS_TYPES = {
    windows: 0,
    mac: 1,
    linux: 2
};

function getRunningOs() {
    if (os.type().toLowerCase().indexOf('windows') !== -1) {
        return OS_TYPES.windows;
    } else if (os.type().toLowerCase().indexOf('darwin') !== -1) {
        return OS_TYPES.mac;
    } else if (os.type().toLowerCase().indexOf('linux') !== -1) {
        return OS_TYPES.linux;
    } else {
        throw new Error('OS Not supported');
    }
}

//Once in the OpenFin version folder, what is the platform specific executable.
function getPlatformExecutableSubPath() {
    var runningOs = getRunningOs();
    switch (runningOs) {
        case OS_TYPES.mac:
            return 'OpenFin.app/Contents/MacOS/OpenFin';
        case OS_TYPES.linux:
            return 'openfin';
    }
}

function getDownloadLocation(version) {
    var runningOs = getRunningOs();
    switch (runningOs) {
        case OS_TYPES.windows:
            return runtimeRoot + version;
        case OS_TYPES.mac:
            return runtimeRoot + 'mac/x64/' + version;
        case OS_TYPES.linux:
            return runtimeRoot + 'linux/' + os.arch() + '/' + version;
    }
}

function unzipFile(file, output, cb) {
    var runningOs = getRunningOs();
    output = output || '';

    log('unziping ' + file + ' to ' + output + '\n');
    if (runningOs === OS_TYPES.windows) {
        fs.createReadStream(file)
            .pipe(unzip.Extract({
                path: output
            }))
            .on('finish', cb)
            .on('error', function(err) {
                cb(err);
            });
    } else {
        var uz = spawn('unzip', [file, '-d', output], {
            encoding: 'utf8'
        });
        uz.on('exit', function() {
            cb();
        });
        uz.stdout.on('data', function(data) {
            console.log("" + data);
        });
        uz.stderr.on('data', function(data) {
            console.log("" + data);
        });
    }
}

function resolveRuntimeVersion(channel, cb) {
    var u = runtimeRoot + channel;
    assetFetcher.requestWithRetry(u, 'HEAD', function(err, response) {
        if (err) {
            cb(null);
        } else if (response.headers['content-length'] > 100) {
            cb(channel);
        } else {
            assetFetcher.getData(u, function(err, data) {
                if (err) {
                    cb(null);
                } else {
                    cb(data);
                }
            });
        }

        response.resume();
    });
}

//TODO:Handle windows as well.
//we will create the folder structure:
// home/OpenFin/Runtime/version
function createFolderStructure(version, cb) {
    var ofFolder = path.join(home, 'OpenFin');
    var rtFolder = path.join(ofFolder, 'Runtime');
    var rtVersionFolder = path.join(rtFolder, version);

    fs.mkdir(ofFolder, function() {
        fs.mkdir(rtFolder, function() {
            fs.mkdir(rtVersionFolder, function() {
                cb(null, rtVersionFolder);
            });
        });
    });
}

function getRuntimeStartPath(folder, cb) {
    var rPath = path.join(folder, getPlatformExecutableSubPath());
    fs.stat(rPath, function(err) {
        if (err) {
            cb(null);
        } else {
            cb(rPath);
        }
    });
}

function downloadRuntime(version, cb) {
    resolveRuntimeVersion(version, function(v) {
        if (v) {
            createFolderStructure(v, function(err, dstFolder) {
                if (err) {
                    cb(err);
                } else {
                    var tmpFile = path.join(dstFolder, 'tmp');
                    getRuntimeStartPath(dstFolder, function(runtimePath) {
                        if (runtimePath) {
                            fs.chmodSync(dstFolder, 0755);
                            cb(null, runtimePath);
                        } else {
                            log('downloading version: ' + v + '\n');
                            assetFetcher.downloadFile(getDownloadLocation(v), tmpFile, function(dlErr) {
                                if (dlErr) {
                                    log('Issue downloading ' + v + '\n' + dlErr.message + '\n');
                                    cb(dlErr);
                                } else {
                                    log('Download complete, now unziping \n');
                                    unzipFile(tmpFile, dstFolder, function() {
                                        log('Unzip complete, starting runtime \n');
                                        fs.unlinkSync(tmpFile);
                                        downloadRuntime(version, cb);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports = {
    resolveRuntimeVersion: resolveRuntimeVersion,
    downloadRuntime: downloadRuntime,
    unzipFile: unzipFile,
    getRunningOs: getRunningOs,
    OS_TYPES: OS_TYPES
};
