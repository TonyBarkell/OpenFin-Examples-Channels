function minimiseWindow(){
    var finWindow = fin.desktop.Window.getCurrent();
    finWindow.minimize();
};

function restoreWindow(){
    var finWindow = fin.desktop.Window.getCurrent();
    finWindow.restore();
};

function closeWindow(){
    var finWindow = fin.desktop.Window.getCurrent();
    finWindow.close();
};

function maximiseWindow(){
    console.log("maximising window")
    var finWindow = fin.desktop.Window.getCurrent();
    finWindow.maximize();
};

//event listeners.
document.addEventListener('DOMContentLoaded', () => {
    if (typeof fin != 'undefined') {
	fin.desktop.main(onMain);
    } else {
        ofVersion.innerText = 'OpenFin is not available - you are probably running in a browser.';
    }
});

//Once the DOM has loaded and the OpenFin API is ready
function onMain() {
    const app = fin.desktop.Application.getCurrent();
    fin.desktop.System.getVersion(version => {
	const ofVersion = document.querySelector('#of-version');
	ofVersion.innerText = version;	
    });
};

function openDevTools(){
    const app = fin.desktop.Application.getCurrent();
    fin.desktop.System.showDeveloperTools(app.uuid, app.uuid);
};

async function baseManifestUrl(){
    return new Promise((resolve, reject) =>{
        fin.desktop.Application.getCurrent().getInfo(info => {
            manifestUrl = info.manifestUrl;
            var start = manifestUrl.indexOf("/", 8);
            resolve( manifestUrl.substr(0, start) );
        });
    });
};

async function launchProvider(){
    var manifestBase = await baseManifestUrl();
    console.log(manifestBase);
    fin.desktop.Application.createFromManifest(manifestBase + "/provider/config/app.json", function(app) {
        app.run();
    }, function(error) {
        console.error('Failed to create app from manifest: ', error);
    });
};

async function launchClient(){
    var manifestBase = await baseManifestUrl();
    httpGetAsync(manifestBase + "/client/config/app.json", function(data){
        console.log("inside get http callback");
        var manifest = JSON.stringify(newClientManifest(manifestBase, JSON.parse(data)));
        console.log(manifestBase + "/app.json?manifest=" + manifest);
        fin.desktop.Application.createFromManifest(manifestBase + "/app.json?manifest=" + encodeURI(manifest), function(app) {
            app.run();
          }, function(error) {
            console.error('Failed to create app from manifest: ', error);
          });
    });  
};

var clientAppNo = 0;
function newClientManifest(target, manifest){
    clientAppNo++;
    manifest.startup_app.url = target + "/client/index.html";
    manifest.startup_app.uuid = "ClientApp" + clientAppNo;
    manifest.startup_app.name = "Client App "+ clientAppNo;
    manifest.startup_app.applicationIcon = target + "/client/favicon.ico";
    manifest.shortcut = target + "/client/favicon.ico";
    return manifest;
};

function httpGetAsync(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}