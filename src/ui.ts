const uiElements = document.querySelectorAll<HTMLInputElement>("#ui-boost-counter, #ui-health-counter,#ui-weapon-container,#ui-right-center,"
                                    +"#ui-top-left,#ui-leaderboard-wrapper,#ui-killfeed-wrapper,#ui-equipped-ammo-wrapper,"
                                    +"#ui-bottom-center-right,#ui-top-center-scopes, #ui-kill-leader-wrapper,"
                                    +"#ui-map-expand-desktop, #ui-map-minimize, #ui-map-info, #ui-spec-counter");

let fpsCounter:any = null;

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

const initCounters = ()=> {
    addCounter('fps');
    fpsCounter = document.querySelector('#counter-fps');
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
    const clientSettings = JSON.parse(localStorage.getItem('client settings') || '');
    const settingElements = document.querySelectorAll<HTMLInputElement>('[data-setting]');
    for (const settingElement of settingElements) {
        if (clientSettings[settingElement.dataset.setting!]) {
            settingElement.value = clientSettings[settingElement.dataset.setting!];
        }
    }
}