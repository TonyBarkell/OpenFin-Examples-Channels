var request = require('request');
var fs = require('fs');
var log = require('single-line-log').stdout;

function requestWithRetry(u, method, cb) {
    var isHttps = u.lastIndexOf('https') >= 0;

    function onError(err) {
        if (isHttps) {
            console.log('HTTPS download failed, trying http');
            requestWithRetry(u.replace('https', 'http'), method, cb);
        } else {
            cb(err);
        }
    }

    request[method.toLowerCase()]({
        url: u
    }).on('response', function(response) {
        console.log('status code ', response.statusCode);
        cb(null, response);
    }).on('error', onError);
}

function getData(u, cb) {
    requestWithRetry(u, 'GET', function(err, response) {
        var content = '';

        response.setEncoding('utf8');
        if (response.statusCode !== 200) {
            cb(new Error('Error, status code:' + response.statusCode));
        } else {
            response.on('data', function(chunk) {
                content += chunk;
            });
            response.on('end', function() {
                cb(null, content);
            });
        }
    });
}

function downloadFile(location, writeLocation, cb) {
    requestWithRetry(location, 'GET', function(err, response) {
        if (err) {
            try {
                fs.unlink(location);
            } catch (ignoreErr) {
                console.log(ignoreErr);
            }
            cb(err);
        } else if (response.statusCode !== 200) {
            if (response.statusCode === 404) {
                cb(new Error('Specified runtime not available for OS'));
            } else {
                cb(new Error('Issue Downloadig' + response.statusCode));
            }
        } else {
            var dloaded = 0;
            var file = fs.createWriteStream(writeLocation);

            response.pipe(file);
            response.on('data', function(chunk) {
                dloaded += chunk.length;
                var dlPercent = Math.floor((dloaded / response.headers['content-length']) * 100);
                log('downloading', location + '\ndownloaded: ' + dlPercent + '% \n');
            });
            file.on('finish', function() {
                file.close();
                cb();
            });
        }
    });
}

module.exports = {
    requestWithRetry: requestWithRetry,
    getData: getData,
    downloadFile: downloadFile
};
