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

    fin.desktop.System.showDeveloperTools(app.uuid, app.uuid);

    // Create the channel with channelName `counter` as a provider:

async function makeProvider() {
    let x = 0;
    const channelName = 'counter';
    const provider = await fin.InterApplicationBus.Channel.create(channelName);
    provider.onConnection((identity, payload) => {
        console.log('onConnection identity: ', JSON.stringify(identity));
        console.log('onConnection payload: ', JSON.stringify(payload));
    });
    provider.onDisconnection((identity) => {
        console.log('onDisconnection identity: ', JSON.stringify(identity));
    });
    provider.register('getValue', (payload, identity) => {
        console.log('Value of x requested from', identity);
        return x;
    });
    provider.register('increment', () => ++x);
    provider.register('incrementBy', (payload) => x += payload.amount);
    provider.register('throwError', () => {
        throw new Error('Error in channelProvider')
    });

    return {
        publishToClients: (msg) => provider.publish('pushMessage', msg)
    }
}

    let channelProvider;
    makeProvider().then(async (providerBus) => {
        channelProvider = providerBus
        console.log('Channel has been created and saved in variable "channelProvider".');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const responseArray = providerBus.publishToClients('Example message from provider');
        responseArray.forEach(promiseResponse => {
            promiseResponse.then(console.log);
        });
    });
};

function openDevTools(){
    const app = fin.desktop.Application.getCurrent();
    fin.desktop.System.showDeveloperTools(app.uuid, app.uuid);
};