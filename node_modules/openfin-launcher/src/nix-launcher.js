var spawn = require('child_process').spawn;
var q = require('q');
var expandOptions = require('./expand-options');
var assetFetcher = require('./asset-fetcher');
var assetUtilities = require('./asset-utilities');

function isURL(str) {
    return (typeof str === 'string') && str.lastIndexOf('http') >= 0;
}

function download(url, existingDeffered) {
    var deffered = existingDeffered || q.defer();
    assetFetcher.getData(url, function(err, data) {
        if (err) {
            deffered.reject(err);
        } else {
            deffered.resolve(data);
        }
    });
    return deffered.promise;
}

function getConfig(configPath) {
    var deffered = q.defer();
    if (isURL(configPath)) {
        return download(configPath).then(function(config) {
            return JSON.parse(config);
        });
    } else {
        var appConfig = require(configPath);
        deffered.resolve(appConfig);
    }
    return deffered.promise;
}

function launch(options) {
    var deffered = q.defer();
    var combinedOpts = expandOptions(options);

    getConfig(combinedOpts.configPath).then(function(config) {
        try {
            assetUtilities.downloadRuntime(config.runtime.version, function(err, runtimePath) {
                if (err) {
                    deffered.reject(err);
                } else {
                    var args = config.runtime.arguments ? config.runtime.arguments.split(' ') : [];
                    //BUG: in linux there is a bug were '--no-sandbox' is required.
                    if (assetUtilities.getRunningOs() === assetUtilities.OS_TYPES.linux) {
                        args.push('--no-sandbox');
                    }
                    args.unshift('--startup-url="' + combinedOpts.configPath + '"');
                    args.push('--version-keyword=' + config.runtime.version);
                    if (config.devtools_port) {
                        args.push('--remote-debugging-port=' + config.devtools_port);
                    }
                    var of = spawn(runtimePath, args, {
                        encoding: 'utf8'
                    });

                    of.stdout.on('data', function(data) {
                        var sData = '' + data;

                        if (options.noAttach) {
                            if (sData.indexOf('Opened on')) {
                                deffered.resolve();
                            }
                        } else {
                            console.log(sData);
                        }
                    }); 
                    of.stderr.on('data', function(data) {
                        console.log('' + data);
                    });

                    of.on('exit', function(code) {
                        console.log(code);
                        deffered.resolve(code);
                    });
                }
            });
        } catch (error) {
            console.log(error);
            deffered.reject(error);
        }
    }).fail(function(err) {
        deffered.reject(err);
    });
    return deffered.promise;
}

module.exports = {
    launchOpenFin: launch
};
