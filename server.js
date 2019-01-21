const liveServer = require('live-server');
const openfinConfigBuilder = require('openfin-config-builder');
const openfinLauncher = require('openfin-launcher');
const path = require('path');

let target;
const launcherConfigPath = path.resolve('public/launcher/config/app.json');
const providerConfigPath = path.resolve('public/provider/config/app.json');
const clientConfigPath = path.resolve('public/client/config/app.json');
const serverParams = {
    root: path.resolve('public'),
    open: false,
    logLevel: 2
};

//Setup the configs for the apps that will not launch on start
function setupSecondaryConfigs(){
    openfinConfigBuilder.update({
        startup_app: {
            url: target + '/provider/index.html',
            applicationIcon: target + '/provider/favicon.ico'
        },
        shortcut: {
            icon: target + '/provider/favicon.ico'
        }
    }, providerConfigPath);

    openfinConfigBuilder.update({
        startup_app: {
            url: target + '/client/index.html',
            applicationIcon: target + '/client/favicon.ico'
        },
        shortcut: {
            icon: target + '/client/favicon.ico'
        }
    }, clientConfigPath);
}

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


//Start the server server and launch our app.
liveServer.start(serverParams).on('listening', () => {
    const { address, port } = liveServer.server.address();
    target = `http://localhost:${ port }`;
    setupSecondaryConfigs() ;
    launchOpenFin();
});