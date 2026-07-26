const uiElements = document.querySelectorAll<HTMLElement>("#ui-bottom-center-0,#ui-weapon-container,#ui-right-center,"
                                    +"#ui-top-left,#ui-leaderboard-wrapper,#ui-killfeed-wrapper,#ui-equipped-ammo-wrapper,"
                                    +"#ui-bottom-center-right,#ui-top-center-scopes, #ui-kill-leader-wrapper,"
                                    +"#ui-map-expand-desktop, #ui-map-minimize, #ui-map-info, #ui-spec-counter");

export const applyUiSettings = ()=> {
    const opacityValue = document.querySelector<HTMLElement>('.slider-oppacity > input')?.value;
    const scaleValue = document.querySelector<HTMLElement>('.slider-scale > input')?.value;
    for (const uiElement of uiElements) {
        uiElement.style.scale = scaleValue+'%';
        uiElement.style.opacity = opacityValue+'%';
    }
}

export const setSettings = ()=> {
    document.querySelector<HTMLElement>('#ui-game-menu')!.style.height = 'fit-content';
    addSettingOptions();
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
        updateSettings(e.target as HTMLElement);
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

const updateSettings = (inputElementEvent:HTMLElement) => {
    const inputElements = document.querySelectorAll<HTMLElement>('.slider-oppacity > input, .slider-scale > input');
    for (const inputElement of inputElements) {
        if (inputElement.dataset.setting == inputElementEvent.dataset.setting) {
            inputElement.value = inputElementEvent.value;
        }
    }
}