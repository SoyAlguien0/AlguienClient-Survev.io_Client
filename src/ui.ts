const uiElements = document.querySelectorAll<HTMLInputElement>("#ui-boost-counter, #ui-health-counter,#ui-weapon-container,#ui-right-center,"
                                    +"#ui-top-left,#ui-leaderboard-wrapper,#ui-killfeed-wrapper,#ui-equipped-ammo-wrapper,"
                                    +"#ui-bottom-center-right,#ui-top-center-scopes, #ui-kill-leader-wrapper,"
                                    +"#ui-map-expand-desktop, #ui-map-minimize, #ui-map-info, #ui-spec-counter");

const servers = {
    na: "wss://usr.mathsiscoolfun.com:8001/ptc",
    eu: "wss://eur.mathsiscoolfun.com:8001/ptc",
    ru: "wss://russia.mathsiscoolfun.com:8001/ptc",
    asia: "wss://asr.mathsiscoolfun.com:8001/ptc",
    sa: "wss://sa.mathsiscoolfun.com:8001/ptc"
};

type Region = keyof typeof servers;

const serverSelector = document.querySelector<HTMLInputElement>('#server-select-main');
const teamServerSelector = document.querySelector<HTMLInputElement>('#team-server-select');

export const applyUiSettings = ()=> {
    const opacityValue = document.querySelector<HTMLInputElement>('.slider-oppacity > input')?.value;
    const scaleValue = document.querySelector<HTMLInputElement>('.slider-scale > input')?.value;
    for (const uiElement of uiElements) {
        uiElement.style.scale = scaleValue+'%';
        uiElement.style.opacity = opacityValue+'%';
    }
}

export const setSettings = ()=> {
    document.querySelector<HTMLElement>('#ui-game-menu')!.style.height = 'fit-content';
    addSettingOptions();
    initCounters();
    loadSettings();
}

export const addSettingOptions = ()=> {
    addSetting('Oppacity');
    addSetting('Scale', '70');
}

const createSettingElement = (settingText:string, min:string, max:string)=> {
    const setting = document.createElement('div');
    setting.classList.add('modal-settings-item', 'slider-container', 'slider-'+settingText.toLowerCase());

    const settingTextElement = document.createElement('p');
    settingTextElement.classList.add('modal-slider-text');
    settingTextElement.textContent = settingText;

    const settingInput = document.createElement('input');
    settingInput.type = "range";
    settingInput.min = min;
    settingInput.max = max;
    settingInput.value = max;
    settingInput.classList.add('slider', 'sl-master-volume');
    settingInput.dataset.setting = settingText.toLowerCase();

    setting.appendChild(settingTextElement);
    setting.appendChild(settingInput);

    setting.addEventListener('change', (e)=>{
        updateSettings(e.target as HTMLInputElement);
        applyUiSettings();
    });
    
    return setting;
}

const createCounterElement = (name:string) => {
    const counter = document.createElement("div");
    counter.id = 'counter-'+name;
    counter.textContent = name.toUpperCase()+": 0";
    Object.assign(counter.style, {
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        padding: "5px 10px",
        marginTop: "10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        zIndex: "2",
        pointerEvents: "none",
    })

    return counter;
}

const addCounter = (name:string)=> {
    const topLeft = document.querySelector('#ui-top-left');
    const counter = createCounterElement(name);

    topLeft?.append(counter);
}

let fpsCounter:any = null;
let pingCounter:any = null;
const initCounters = ()=> {
    addCounter('fps');
    fpsCounter = document.querySelector('#counter-fps');
    addCounter('ping');
    pingCounter = document.querySelector('#counter-ping');
}

let lastUpdate = performance.now();
let frameCount = 0;

export const updateFpsCounter = () => {
    frameCount++;

    const now = performance.now();
    const elapsed = now - lastUpdate;

    if (elapsed < 500) return;

    const fps = Math.round((frameCount * 1000)/elapsed);

    if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${fps}`;
    }

    frameCount = 0;
    lastUpdate = now;
};

let socket:any = null;
let sendTime = 0;
let lastPingTime = 0;
let waitingForResponse = false;
let ping = 9999;
let tries = 0;

const teamMenu = document.querySelector<HTMLElement>('#team-menu');
let actualRegion = teamMenu?.style.display == "hidden" ? serverSelector!.value as Region : teamServerSelector!.value as Region;

let reconnectTries = 0;
const openSocket = () => {
    socket = new WebSocket(servers[actualRegion]);
    socket.binaryType = "arraybuffer";
    socket.addEventListener("message", () => {
        if (!waitingForResponse) return;

        const arrivedTime = performance.now();

        ping = arrivedTime - sendTime;
        waitingForResponse = false;

        if (pingCounter) {
            pingCounter.textContent = `PING: ${Math.round(ping)}ms`;
        }
        reconnectTries = 0;
    });

    socket.addEventListener("error", ()=> {
        resetSocket();
    })
}
openSocket();

let retrying = false;
export const resetSocket = () => {
    actualRegion = teamMenu?.style.display == "hidden" ? serverSelector!.value as Region : teamServerSelector!.value as Region;
    socket.close();

    if (retrying) return;
    retrying = true;

    setTimeout(()=>{
        retrying = false;
        openSocket();
        reconnectTries++;
    }, 1000*reconnectTries);
}

export const updatePingCounter = () => {
    const now = performance.now();
    const elapsed = now - lastPingTime;

    if (elapsed < 500) return;
    if (waitingForResponse && elapsed > 3000 && tries <= 3) {
        socket.close();
        openSocket();
        tries++;
        return;
    }
    if (socket.readyState !== WebSocket.OPEN) return;
    if (waitingForResponse) return;

    lastPingTime = now;
    waitingForResponse = true;
    sendTime = now;

    socket.send(new ArrayBuffer(1));
};

const addSetting = (settingText:string, min:string = "0", max:string = "100")=> {
    const settingsLinks = document.querySelector('#settings-links');
    settingsLinks?.before(createSettingElement(settingText, min, max));

    const quitButton = document.querySelector('#btn-game-quit');
    quitButton?.before(createSettingElement(settingText, min, max));
}

const updateSettings = (triggeredSettingElement:HTMLInputElement) => {
    const settingElements = document.querySelectorAll<HTMLInputElement>('[data-setting]');
    for (const settingElement of settingElements) {
        if (settingElement.dataset.setting == triggeredSettingElement.dataset.setting) {
            settingElement.value = triggeredSettingElement.value;
        }
    }
    storeSettings(settingElements);
}

const storeSettings = (settingElements:NodeListOf<HTMLInputElement>) => {
    let clientSettings:any = {};

    for (const settingElement of settingElements) {
        clientSettings[settingElement.dataset.setting!] = settingElement.value;
    }

    localStorage.setItem('client settings', JSON.stringify(clientSettings));
}

const loadSettings = () => {
    const clientSettings = JSON.parse(localStorage.getItem('client settings') || '{}');
    const settingElements = document.querySelectorAll<HTMLInputElement>('[data-setting]');
    for (const settingElement of settingElements) {
        if (clientSettings[settingElement.dataset.setting!]) {
            settingElement.value = clientSettings[settingElement.dataset.setting!];
        }
    }
}