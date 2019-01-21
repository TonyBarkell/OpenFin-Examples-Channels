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

    // From another window or application, connect to the 'counter' channel as a client:

    async function makeClient() {
        const connectPayload = { payload: 'Client App Payload' };
        const client = await fin.InterApplicationBus.Channel.connect('counter', connectPayload);

        client.register('pushMessage', (payload, identity) => {
            console.log(`Payload: ${JSON.stringify(payload)} sent from channel provider with identity: ${JSON.stringify(identity)}`);
            const me = fin.Window.getCurrentSync().identity;
            return `Push message received by ${JSON.stringify(me)}`;
        });

        return {
            getValue: () => client.dispatch('getValue'),
            increment: () => client.dispatch('increment'),
            incrementBy: (x) => client.dispatch('incrementBy', {amount: x}),
            throwError: () => client.dispatch('throwError'),
            unregisteredAction: () => client.dispatch('unregisteredAction')
        }
    }

    let channelClient;
    makeClient().then(async (clientBus) => {
        channelClient = clientBus;
        console.log('Connected to Channel, client bus saved in variable "channelClient".');
        const one = await clientBus.increment();
        console.log('counter number: ', one);
        const eleven = await clientBus.incrementBy(10);
        console.log('counter number: ', eleven);
        try{
            const error = await clientBus.throwError();
        } catch (e) {
            console.error(e);
        }
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