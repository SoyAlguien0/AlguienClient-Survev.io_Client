const uiElements = document.querySelectorAll<HTMLInputElement>("#ui-boost-counter, #ui-health-counter,#ui-weapon-container,#ui-right-center,"
                                    +"#ui-top-left,#ui-leaderboard-wrapper,#ui-killfeed-wrapper,#ui-equipped-ammo-wrapper,"
                                    +"#ui-bottom-center-right,#ui-top-center-scopes, #ui-kill-leader-wrapper,"
                                    +"#ui-map-expand-desktop, #ui-map-minimize, #ui-map-info, #ui-spec-counter");

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
    loadSettings();
}

export const addSettingOptions = ()=> {
    createSetting('Oppacity');
    createSetting('Scale', '70');
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

const createSetting = (settingText:string, min:string = "0", max:string = "100")=> {
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