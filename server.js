const openfinLauncher = require('hadouken-js-adapter');
const portfinder = require('portfinder');
const express = require('express');
const openfinConfigBuilder = require("openfin-config-builder")
const path = require('path');
var app = express();
var target;

app.use(express.static(__dirname + '/public'));

// Express Routes
app.get('/app.json', (req, res) => {
    var manifest = JSON.parse(req.query.manifest);
    console.log("Serving Manifest:");
    console.log(manifest)
    res.send(manifest);
});

app.get('/index.html', (req, res) => {
    index = path.resolve("./public/launcher/index.html");
    console.log("Serving index.html:");
    console.log(index);
    res.sendFile(index);
});

app.get('/favicon.ico', (req, res) => {
    icon = path.resolve("./public/launcher/favicon.ico");
    res.sendFile(icon );
});

function buildManifest(){
    manifest = require("./public/launcher/config/app.json");
    manifest.startup_app.url = target + "/index.html";
    manifest.startup_app.applicationIcon = target + "/favicon";
    manifest.shortcut = target + "/favicon";
    return manifest;
};


//Setup the configs for the apps that will not launch on start
function setupAppConfigs(){

    openfinConfigBuilder.update({
        startup_app: {
            url: target + '/launcher/index.html',
            applicationIcon: target + '/launcher/favicon.ico'
        },
        shortcut: {
            icon: target + '/launcher/favicon.ico'
        }
    }, path.resolve("./public/launcher/config/app.json"));

    openfinConfigBuilder.update({
        startup_app: {
            url: target + '/provider/index.html',
            applicationIcon: target + '/provider/favicon.ico'
        },
        shortcut: {
            icon: target + '/provider/favicon.ico'
        }
    }, path.resolve("./public/provider/config/app.json"));
};

portfinder.getPortPromise().then((port) => {
    target = "http://localhost:" + port;
    setupAppConfigs();
    app.listen(port, () =>{ 
        console.log("Server started at: " + target);
        openfinLauncher.launch({manifestUrl: target + "/launcher/config/app.json"});
    });
}).catch((err) => {
    console.log("Unable to discover a free port: " + err);
    console.log("-- Exiting --");
});

/*
//Update our config and launch openfin.
function launchOpenFin() {
    openfinConfigBuilder.update({
        startup_app: {
            url: target + '/launcher/index.html',
            applicationIcon: target + '/launcher/favicon.ico'
        },
        shortcut: {
            icon: target + '/launcher/favicon.ico'
        }
    }, launcherConfigPath)
        .then(openfinLauncher.launchOpenFin({ configPath: target + "/launcher/config/app.json" }))
        .catch(err => console.log(err));
}
*/

/*
//Start the server server and launch our app.
liveServer.start(serverParams).on('listening', () => {
    const { address, port } = liveServer.server.address();
    target = `http://localhost:${ port }`;
    setupSecondaryConfigs() ;
    launchOpenFin();
});
*/