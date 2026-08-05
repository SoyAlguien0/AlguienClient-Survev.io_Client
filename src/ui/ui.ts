import {
    weaponAmmoColors,
    uiElements,
    boostCounter,
    healthContainer,
    boostBars,
    actualHealthContainer,
    gunsContainer,
} from "../consts.js";
import { resendPing } from "./ping.js";

//todo: separate, objects

let opacityValue:any = "100";
let scaleValue:any = "100";
export let hideMiniMap:any = false;

export const applyUiSettings = () => {
    opacityValue = document.querySelector<HTMLInputElement>(
        ".slider-opacity > input",
    )?.value;

    scaleValue = document.querySelector<HTMLInputElement>(
        ".slider-scale > input",
    )?.value;

    hideMiniMap = document.querySelector<HTMLInputElement>(
        ".checkbox-hideminimap > input",
    )?.checked;

    for (const uiElement of uiElements) {
        uiElement.style.scale = scaleValue + "%";
        uiElement.style.opacity = opacityValue + "%";
    }
};

let boostDisplay = null;
let percentageText = null;

const initStatusDisplays = () => {
    boostDisplay = document.createElement("div");
    boostDisplay.classList.add("boost-display");
    Object.assign(boostDisplay.style, {
        position: "absolute",
        bottom: "25px",
        right: "335px",
        color: "#FF901A",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        padding: "5px 10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        zIndex: "10",
        textAlign: "center",
    });

    percentageText = document.createElement("span");
    percentageText.classList.add("health-text");
    Object.assign(percentageText.style, {
        width: "100%",
        textAlign: "center",
        marginTop: "5px",
        color: "#333",
        fontSize: "20px",
        fontWeight: "bold",
        position: "absolute",
        zIndex: "10",
    });
    healthContainer!.appendChild(percentageText);
    boostCounter!.appendChild(boostDisplay);
};

const createCounterElement = (name: string) => {
    const counter = document.createElement("div");
    counter.id = "counter-" + name;
    counter.textContent = name.toUpperCase() + ": 0";
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
    });

    return counter;
};

const addCounter = (name: string) => {
    const topLeft = document.querySelector("#ui-top-left");
    const counter = createCounterElement(name);

    topLeft?.append(counter);
};

let fpsCounter: any = null;
let pingCounter: any = null;
const initCounters = () => {
    addCounter("fps");
    fpsCounter = document.querySelector("#counter-fps");
    addCounter("ping");
    pingCounter = document.querySelector("#counter-ping");
};

let lastUpdate = performance.now();
let frameCount = 0;

const updateFpsCounter = () => {
    frameCount++;

    const now = performance.now();
    const elapsed = now - lastUpdate;

    if (elapsed < 500) return;

    const fps = Math.round((frameCount * 1000) / elapsed);

    if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${fps}`;
    }

    frameCount = 0;
    lastUpdate = now;
};

export const updatePingCounter = (ping: number) => {
    if (pingCounter) {
        pingCounter.textContent = `PING: ${Math.round(ping)}ms`;
    }
};

const updateBoostBars = () => {
    let totalBoost = 0;
    const weights = [25, 25, 40, 10];
    boostBars.forEach((bar, index) => {
        const width = Number.parseFloat(bar.style.width || "0");
        if (!Number.isNaN(width)) totalBoost += width * (weights[index] / 100);
    });
    const averageBoost = Math.round(totalBoost);
    boostDisplay!.textContent = `AD: ${averageBoost}%`;
    if (averageBoost == 0) {
        boostCounter!.style.opacity = "0%";
    } else {
        boostCounter!.style.opacity = `${opacityValue}%`;
    }
};

const updateHealthBars = (): void => {
    const width = Math.round(
        Number.parseFloat(actualHealthContainer!.style.width),
    );
    percentageText!.textContent = `${width}%`;
};

const updateGunsBorder = () => {
    for (const gunContainer of gunsContainer) {
        gunContainer.style.borderColor = "white";
        const name = gunContainer.querySelector(".ui-weapon-name")?.textContent;
        if (gunContainer.dataset.slot) {
            gunContainer.style.borderColor = name
                ? weaponAmmoColors[name as string]
                : "white";
        } else if (gunContainer.id == "ui-weapon-id-4") {
            gunContainer.style.borderColor = "#2f4032";
        }
    }
};

export const updateUi = () => {
    updateFpsCounter();
    resendPing();
    updateBoostBars();
    updateHealthBars();
    updateGunsBorder();
};

//todo: improve this
const createSettingElement = (
    settingText: string,
    type: string,
    contentText: string,
    min: string,
    max: string,
) => {
    const setting = document.createElement("div");
    if (type == "slider") {
        setting.classList.add(
            "modal-settings-item",
            "slider-container",
            "slider-" + settingText.toLowerCase(),
        );

        const settingTextElement = document.createElement("p");
        settingTextElement.classList.add("modal-slider-text");
        settingTextElement.textContent = contentText;

        const settingInput = document.createElement("input");
        settingInput.type = "range";
        settingInput.min = min;
        settingInput.max = max;
        settingInput.value = max;
        settingInput.classList.add("slider", "sl-master-volume");
        settingInput.dataset.setting = settingText.toLowerCase();

        setting.appendChild(settingTextElement);
        setting.appendChild(settingInput);

        setting.addEventListener("change", (e) => {
            updateSettings(e.target as HTMLInputElement);
            applyUiSettings();
        });

    } else if (type == "checkbox") {
        setting.classList.add(
            "modal-settings-item",
            "checkbox-" + settingText.toLowerCase(),
        );

        const settingTextElement = document.createElement("p");
        settingTextElement.classList.add("modal-settings-checkbox-text");
        settingTextElement.textContent = contentText;

        const settingInput = document.createElement("input");
        settingInput.type = "checkbox";
        settingInput.dataset.setting = settingText.toLowerCase();

        setting.appendChild(settingInput);
        setting.appendChild(settingTextElement);

        setting.addEventListener("change", (e) => {
            updateSettings(e.target as HTMLInputElement);
            applyUiSettings();
        });
    }

    return setting;
};

//todo: improve this
const addClientSettings = (
    settingText: string,
    type: string,
    contentText: string = settingText,
    min: string = "0",
    max: string = "100",
) => {
    const settingsLinks = document.querySelector("#settings-links");
    settingsLinks?.before(createSettingElement(settingText, type, contentText, min, max));
    
    if (type == "slider") {
        const quitButton = document.querySelector("#btn-game-quit");
        quitButton?.before(createSettingElement(settingText, type, contentText, min, max));
    }
};

export const addSettingOptions = () => {
    addClientSettings("opacity", "slider", "Opacity");
    addClientSettings("scale", "slider", "Scale", "70");
    addClientSettings("hideMiniMap", "checkbox", "Hide mini map at start");
};

export const setSettings = () => {
    document.querySelector<HTMLElement>("#ui-game-menu")!.style.height =
        "fit-content";

    initStatusDisplays();
    addSettingOptions();
    initCounters();
    loadSettings();
};

const updateSettings = (triggeredSettingElement: HTMLInputElement) => {
    const settingElements =
        document.querySelectorAll<HTMLInputElement>("[data-setting]");
    for (const settingElement of settingElements) {
        if (
            settingElement.dataset.setting ==
            triggeredSettingElement.dataset.setting
        ) {
            settingElement.value = triggeredSettingElement.value;
        }
    }
    storeSettings(settingElements);
};

//todo: i need objects
const storeSettings = (settingElements: NodeListOf<HTMLInputElement>) => {
    let clientSettings: any = {};

    for (const settingElement of settingElements) {
        clientSettings[settingElement.dataset.setting!] = settingElement.type != "checkbox"? settingElement.value : settingElement.checked;
    }

    localStorage.setItem("client settings", JSON.stringify(clientSettings));
};

const loadSettings = () => {
    const clientSettings = JSON.parse(
        localStorage.getItem("client settings") || "{}",
    );
    const settingElements =
        document.querySelectorAll<HTMLInputElement>("[data-setting]");
    for (const settingElement of settingElements) {
        if (clientSettings[settingElement.dataset.setting!]) {
            if (settingElement.type == "checkbox") {
                settingElement.checked =  clientSettings[settingElement.dataset.setting!];
            } else {
                settingElement.value =
                clientSettings[settingElement.dataset.setting!];
            }
        }
    }
};
