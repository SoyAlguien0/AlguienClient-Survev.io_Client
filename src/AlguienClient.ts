type AnimationFrameCallback = (callback: () => void) => number;

class PingTest {
  ptcDataBuf: ArrayBuffer;
  test: {
    region: string;
    url: string;
    ping: number;
    ws: WebSocket | null;
    sendTime: number;
    retryCount: number;
  };

  constructor(selectedServer: { region: string; url: string }) {
    this.ptcDataBuf = new ArrayBuffer(1);
    this.test = {
      region: selectedServer.region,
      url: `wss://${selectedServer.url}/ptc`,
      ping: 9999,
      ws: null,
      sendTime: 0,
      retryCount: 0,
    };
  }

  startPingTest(): void {
    if (!this.test.ws) {
      const ws = new WebSocket(this.test.url);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        this.sendPing();
        this.test.retryCount = 0;
      };

      ws.onmessage = () => {
        const elapsed = (Date.now() - this.test.sendTime) / 1e3;
        this.test.ping = Math.round(elapsed * 1000);
        this.test.retryCount = 0;
        setTimeout(() => this.sendPing(), 200);
      };

      ws.onerror = () => {
        this.test.ping = null;
        this.test.retryCount++;
        if (this.test.retryCount < 5) {
          setTimeout(() => this.startPingTest(), 2000);
        } else {
          try {
            ws.close();
          } catch {}
          this.test.ws = null;
        }
      };

      ws.onclose = () => {
        this.test.ws = null;
      };

      this.test.ws = ws;
    }
  }

  sendPing(): void {
    if (this.test.ws && this.test.ws.readyState === WebSocket.OPEN) {
      this.test.sendTime = Date.now();
      this.test.ws.send(this.ptcDataBuf);
    }
  }

  getPingResult(): { region: string; ping: number } {
    return {
      region: this.test.region,
      ping: this.test.ping,
    };
  }
}

class GameMod {
  kills: number;
  isFpsVisible: boolean;
  isPingVisible: boolean;
  isKillsVisible: boolean;
  isMenuVisible: boolean;
  isClean: boolean;
  isFpsUncapped: boolean;
  animationFrameCallback: AnimationFrameCallback;
  fpsCounter: HTMLDivElement | null = null;
  pingCounter: HTMLDivElement | null = null;
  killsCounter: HTMLDivElement | null = null;
  menu: HTMLDivElement | null = null;
  currentServer: string | null = null;
  pingTest: PingTest | null = null;

  constructor() {
    const settings = this.getSettings();
    this.kills = 0;
    this.isFpsVisible = true;
    this.isPingVisible = true;
    this.isKillsVisible = true;
    this.isMenuVisible = true;
    this.isClean = false;
    this.isFpsUncapped = settings["fps-uncap"] !== undefined ? !!settings["fps-uncap"] : true;
    this.setAnimationFrameCallback();
    this.initCounter("fpsCounter", this.updateFpsVisibility.bind(this));
    this.initCounter("pingCounter", this.updatePingVisibility.bind(this));
    this.initCounter("killsCounter", this.updateKillsVisibility.bind(this));
    this.initMenu();
    this.loadBackgroundFromLocalStorage();
    this.loadLocalStorage();
    this.startUpdateLoop();
    this.setupWeaponBorderHandler();
    this.setupKeyListeners();
  }

  init(): void {
    this.startUpdateLoop();
    this.pingShow();
    this.customUiElements();
  }

  getSettings(): any {
    return JSON.parse(localStorage.getItem("gameSettings") || "{}");
  }

  saveSettings(): void {
    localStorage.setItem("gameSettings", JSON.stringify({ "fps-uncap": this.isFpsUncapped }));
  }

  initCounter(id: "fpsCounter" | "pingCounter" | "killsCounter", updateVisibilityFn: () => void): void {
    const el = document.createElement("div");
    el.id = id;
    Object.assign(el.style, {
      color: "white",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      padding: "5px 10px",
      marginTop: "10px",
      borderRadius: "5px",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      zIndex: "10000",
      pointerEvents: "none",
    } as Partial<CSSStyleDeclaration>);

    const uiTopLeft = document.getElementById("ui-top-left");
    if (uiTopLeft) uiTopLeft.appendChild(el);
    if (id === "fpsCounter") this.fpsCounter = el;
    if (id === "pingCounter") this.pingCounter = el;
    if (id === "killsCounter") this.killsCounter = el;
    updateVisibilityFn();
  }

  updateFpsVisibility(): void {
    this.updateVisibility("fpsCounter", this.isFpsVisible);
  }

  updateFpsToggle(): void {
    this.animationFrameCallback = this.isFpsUncapped
      ? (callback: () => void) => setTimeout(callback, 1) as unknown as number
      : (callback: () => void) => requestAnimationFrame(callback);
  }

  updatePingVisibility(): void {
    this.updateVisibility("pingCounter", this.isPingVisible);
  }

  updateKillsVisibility(): void {
    this.updateVisibility("killsCounter", this.isKillsVisible);
  }

  updateVisibility(id: "fpsCounter" | "pingCounter" | "killsCounter", isVisible: boolean): void {
    const el = this[id as "fpsCounter" | "pingCounter" | "killsCounter"] as HTMLDivElement | null;
    if (el) {
      el.style.display = isVisible ? "block" : "none";
      el.style.backgroundColor = isVisible ? "rgba(0, 0, 0, 0.2)" : "transparent";
    }
  }

  setAnimationFrameCallback(): void {
    this.animationFrameCallback = (callback: () => void) => setTimeout(callback, 1) as unknown as number;
  }

  getKills(): number {
    const killElement = document.querySelector(".ui-player-kills.js-ui-player-kills");
    if (killElement) {
      const kills = Number.parseInt(killElement.textContent || "", 10);
      return Number.isNaN(kills) ? 0 : kills;
    }
    return 0;
  }

  startPingTest(): void {
    const currentUrl = globalThis.location.href;
    const isSpecialUrl = /\/#\w+/.test(currentUrl);
    const teamSelectElement = document.getElementById("team-server-select") as HTMLSelectElement | null;
    const mainSelectElement = document.getElementById("server-select-main") as HTMLSelectElement | null;
    const region = isSpecialUrl && teamSelectElement ? teamSelectElement.value : mainSelectElement ? mainSelectElement.value : null;

    if (region && region !== this.currentServer) {
      this.currentServer = region;
      this.resetPing();
      const servers = [
        { region: "NA", url: "usr.mathsiscoolfun.com:8001" },
        { region: "EU", url: "eur.mathsiscoolfun.com:8001" },
        { region: "Asia", url: "asr.mathsiscoolfun.com:8001" },
        { region: "SA", url: "sa.mathsiscoolfun.com:8001" },
      ];
      const selectedServer = servers.find((server) => region.toUpperCase() === server.region.toUpperCase());
      if (selectedServer) {
        this.pingTest = new PingTest(selectedServer);
        this.pingTest.startPingTest();
      } else {
        this.resetPing();
      }
    }
  }

  resetPing(): void {
    if (this.pingTest?.test.ws) {
      try { this.pingTest.test.ws.close(); } catch {}
      this.pingTest.test.ws = null;
    }
    this.pingTest = null;
  }

  saveBackgroundToLocalStorage(value: string | File): void {
    if (typeof value === "string") {
      localStorage.setItem("lastBackgroundType", "url");
      localStorage.setItem("lastBackgroundValue", value);
    } else {
      localStorage.setItem("lastBackgroundType", "local");
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") localStorage.setItem("lastBackgroundValue", reader.result);
      };
      reader.readAsDataURL(value);
    }
  }

  loadBackgroundFromLocalStorage(): void {
    const backgroundType = localStorage.getItem("lastBackgroundType");
    const backgroundValue = localStorage.getItem("lastBackgroundValue");
    const backgroundElement = document.getElementById("background");
    if (backgroundElement && backgroundType && backgroundValue) {
      backgroundElement.style.backgroundImage = `url(${backgroundValue})`;
    }
  }

  loadLocalStorage(): void {
    try {
      const savedSettings = JSON.parse(localStorage.getItem("userSettings") || "null");
      if (savedSettings) {
        this.isFpsVisible = savedSettings.isFpsVisible ?? this.isFpsVisible;
        this.isPingVisible = savedSettings.isPingVisible ?? this.isPingVisible;
        this.isKillsVisible = savedSettings.isKillsVisible ?? this.isKillsVisible;
        this.isClean = savedSettings.isClean ?? this.isClean;
      }
    } catch {}
    this.updateKillsVisibility();
    this.updateFpsVisibility();
    this.updatePingVisibility();
  }

  updateHealthBars(): void {
    const healthBars = document.querySelectorAll<HTMLElement>("#ui-health-container");
    healthBars.forEach((container) => {
      const bar = container.querySelector<HTMLElement>("#ui-health-actual");
      if (bar) {
        const width = Math.round(Number.parseFloat(bar.style.width || "0"));
        let percentageText = container.querySelector<HTMLElement>(".health-text");
        if (!percentageText) {
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
          } as Partial<CSSStyleDeclaration>);
          container.appendChild(percentageText);
        }
        percentageText.textContent = `${width}%`;
      }
    });
  }

  updateBoostBars(): void {
    const boostCounter = document.querySelector<HTMLElement>("#ui-boost-counter");
    if (!boostCounter) return;
    const boostBars = boostCounter.querySelectorAll<HTMLElement>(".ui-boost-base .ui-bar-inner");
    let totalBoost = 0;
    const weights = [25, 25, 40, 10];
    boostBars.forEach((bar, index) => {
      const width = Number.parseFloat(bar.style.width || "0");
      if (!Number.isNaN(width)) totalBoost += width * (weights[index] / 100);
    });
    const averageBoost = Math.round(totalBoost);
    let boostDisplay = boostCounter.querySelector<HTMLElement>(".boost-display");
    if (!boostDisplay) {
      boostDisplay = document.createElement("div");
      boostDisplay.classList.add("boost-display");
      Object.assign(boostDisplay.style, {
        position: "absolute",
        bottom: "75px",
        right: "335px",
        color: "#FF901A",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        padding: "5px 10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        zIndex: "10",
        textAlign: "center",
      } as Partial<CSSStyleDeclaration>);
      boostCounter.appendChild(boostDisplay);
    }
    boostDisplay.textContent = `AD: ${averageBoost}%`;
  }

  setupWeaponBorderHandler(): void {
    const weaponContainers = Array.from(document.getElementsByClassName("ui-weapon-switch")) as HTMLElement[];
    weaponContainers.forEach((container) => {
      container.style.border = container.id === "ui-weapon-id-4" ? "3px solid #2f4032" : "3px solid #FFFFFF";
    });

    const weaponNames = Array.from(document.getElementsByClassName("ui-weapon-name")) as HTMLElement[];
    weaponNames.forEach((weaponNameElement) => {
      const weaponContainer = weaponNameElement.closest(".ui-weapon-switch") as HTMLElement | null;
      if (!weaponContainer) return;
      const observer = new MutationObserver(() => {
        const weaponName = (weaponNameElement.textContent || "").trim();
        let border = "#FFFFFF";
        switch (weaponName.toUpperCase()) {
          case "CZ-3A1":
          case "G18C":
          case "M9":
          case "M93R":
          case "MAC-10":
          case "MP5":
          case "P30L":
          case "DUAL P30L":
          case "UMP9":
          case "VECTOR":
          case "VSS":
          case "FLAMETHROWER":
            border = "#FFAE00";
            break;
          case "AK-47":
          case "OT-38":
          case "OTS-38":
          case "M39 EMR":
          case "DP-28":
          case "MOSIN-NAGANT":
          case "SCAR-H":
          case "SV-98":
          case "M1 GARAND":
          case "PKP PECHENEG":
          case "AN-94":
          case "BAR M1918":
          case "BLR 81":
          case "SVD-63":
          case "M134":
          case "GROZA":
          case "GROZA-S":
            border = "#007FFF";
            break;
          case "FAMAS":
          case "M416":
          case "M249":
          case "QBB-97":
          case "MK 12 SPR":
          case "M4A1-S":
          case "SCOUT ELITE":
          case "L86A2":
            border = "#0f690d";
            break;
          case "M870":
          case "MP220":
          case "SAIGA-12":
          case "SPAS-12":
          case "USAS-12":
          case "SUPER 90":
          case "LASR GUN":
          case "M1100":
            border = "#FF0000";
            break;
          case "MODEL 94":
          case "PEACEMAKER":
          case "MK45G":
          case "M1911":
          case "M1A1":
            border = "#800080";
            break;
          case "DEAGLE 50":
          case "RAINBOW BLASTER":
            border = "#000000";
            break;
          case "AWM-S":
          case "MK 20 SSR":
            border = "#808000";
            break;
          case "POTATO CANNON":
          case "SPUD GUN":
            border = "#A52A2A";
            break;
          case "FLARE GUN":
            border = "#FF4500";
            break;
          case "M79":
            border = "#008080";
            break;
          case "HEART CANNON":
            border = "#FFC0CB";
            break;
          default:
            break;
        }
        if (weaponContainer.id !== "ui-weapon-id-4") {
          weaponContainer.style.border = `3px solid ${border}`;
        }
      });
      observer.observe(weaponNameElement, { childList: true, characterData: true, subtree: true });
    });
  }

  updateUiElements(): void {
    const currentUrl = globalThis.location.href;
    const isSpecialUrl = /\/#\w+/.test(currentUrl);
    const playerOptions = document.getElementById("player-options");
    if (!playerOptions) return;
    const teamMenuContents = document.getElementById("team-menu-contents");
    const startMenuContainer = document.querySelector("#start-menu .play-button-container");
    if (isSpecialUrl && teamMenuContents && playerOptions.parentNode !== teamMenuContents) {
      teamMenuContents.appendChild(playerOptions);
    } else if (!isSpecialUrl && startMenuContainer && playerOptions.parentNode !== startMenuContainer) {
      const firstChild = startMenuContainer.firstChild;
      startMenuContainer.insertBefore(playerOptions, firstChild);
    }
    const teamMenu = document.getElementById("team-menu");
    if (teamMenu) teamMenu.style.height = "355px";
    const menuBlocks = document.querySelectorAll<HTMLElement>(".menu-block");
    menuBlocks.forEach((block) => { block.style.maxHeight = "355px"; });
  }

  updateCleanMode(): void {
    const leftColumn = document.getElementById("left-column");
    const newsBlock = document.getElementById("news-block");
    if (this.isClean) {
      if (leftColumn) leftColumn.style.display = "none";
      if (newsBlock) newsBlock.style.display = "none";
    } else {
      if (leftColumn) leftColumn.style.display = "block";
      if (newsBlock) newsBlock.style.display = "block";
    }
  }

  setupKeyListeners(): void {
    document.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "p") this.toggleMenuVisibility();
    });
  }

  initMenu(): void {
    const menu = document.createElement("div");
    menu.id = "soyAlguienMenu";
    Object.assign(menu.style, {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: "15px",
      marginLeft: "15px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
      zIndex: "10001",
      width: "250px",
      fontFamily: "Arial, sans-serif",
      color: "#fff",
      maxHeight: "400px",
      overflowY: "auto",
    } as Partial<CSSStyleDeclaration>);

    const title = document.createElement("h2");
    title.textContent = "SoyAlguien Client";
    Object.assign(title.style, {
      margin: "0 0 10px",
      textAlign: "center",
      fontSize: "18px",
      color: "#FFAE00",
    } as Partial<CSSStyleDeclaration>);
    menu.appendChild(title);

    const updateLocalStorage = () => {
      localStorage.setItem("userSettings", JSON.stringify({
        isFpsVisible: this.isFpsVisible,
        isPingVisible: this.isPingVisible,
        isKillsVisible: this.isKillsVisible,
        isClean: this.isClean,
      }));
    };

    this.loadLocalStorage();

    const createToggleButton = (text: string, stateKey: keyof GameMod, onClick: () => void) => {
      const button = document.createElement("button");
      const state = !!(this[stateKey] as unknown as boolean);
      button.textContent = `${text} ${state ? "✅" : "❌"}`;
      Object.assign(button.style, {
        backgroundColor: state ? "#4CAF50" : "#FF0000",
        border: "none",
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        width: "100%",
        marginBottom: "10px",
        fontSize: "14px",
        cursor: "pointer",
      } as Partial<CSSStyleDeclaration>);
      button.onclick = () => {
        (this as any)[stateKey] = !(this as any)[stateKey];
        onClick();
        const newState = !!(this as any)[stateKey];
        button.textContent = `${text} ${newState ? "✅" : "❌"}`;
        button.style.backgroundColor = newState ? "#4CAF50" : "#FF0000";
        updateLocalStorage();
      };
      return button;
    };

    menu.appendChild(createToggleButton("Show FPS", "isFpsVisible", this.updateFpsVisibility.bind(this)));
    menu.appendChild(createToggleButton("Show Ping", "isPingVisible", this.updatePingVisibility.bind(this)));
    menu.appendChild(createToggleButton("Show Kills", "isKillsVisible", this.updateKillsVisibility.bind(this)));
    menu.appendChild(createToggleButton("Clean Menu", "isClean", this.updateCleanMode.bind(this)));

    const hideShowToggle = document.createElement("button");
    hideShowToggle.textContent = `👀 Hide/Show Menu [P]`;
    Object.assign(hideShowToggle.style, {
      backgroundColor: "#6F42C1",
      border: "none",
      color: "#fff",
      padding: "10px",
      borderRadius: "5px",
      width: "100%",
      marginBottom: "10px",
      fontSize: "14px",
      cursor: "pointer",
    } as Partial<CSSStyleDeclaration>);
    hideShowToggle.onclick = () => this.toggleMenuVisibility();
    menu.appendChild(hideShowToggle);

    const backgroundToggle = document.createElement("button");
    backgroundToggle.textContent = `🎨 Change Background`;
    Object.assign(backgroundToggle.style, {
      backgroundColor: "#007BFF",
      border: "none",
      color: "#fff",
      padding: "10px",
      borderRadius: "5px",
      width: "100%",
      marginBottom: "10px",
      fontSize: "14px",
      cursor: "pointer",
    } as Partial<CSSStyleDeclaration>);
    backgroundToggle.onclick = () => {
      const backgroundElement = document.getElementById("background");
      if (!backgroundElement) {
        alert("Element with id 'background' not found.");
        return;
      }
      const choice = prompt("Enter '1' to provide a URL or '2' to upload a local image:");
      if (choice === "1") {
        const newBackgroundUrl = prompt("Enter the URL of the new background image:");
        if (newBackgroundUrl) {
          backgroundElement.style.backgroundImage = `url(${newBackgroundUrl})`;
          this.saveBackgroundToLocalStorage(newBackgroundUrl);
          alert("Background updated successfully!");
        }
      } else if (choice === "2") {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                backgroundElement.style.backgroundImage = `url(${reader.result})`;
                this.saveBackgroundToLocalStorage(file);
                alert("Background updated successfully!");
              }
            };
            reader.readAsDataURL(file);
          }
        };
        fileInput.click();
      }
    };
    menu.appendChild(backgroundToggle);

    const moreSettingsButton = document.createElement("button");
    moreSettingsButton.textContent = "⚙️ More Settings";
    Object.assign(moreSettingsButton.style, {
      backgroundColor: "#1D1616",
      border: "none",
      color: "#fff",
      padding: "10px",
      borderRadius: "5px",
      width: "100%",
      fontSize: "14px",
      cursor: "pointer",
    } as Partial<CSSStyleDeclaration>);
    moreSettingsButton.onclick = () => this.openSubMenu();
    menu.appendChild(moreSettingsButton);

    globalThis.onload = () => {
      const savedBackground = localStorage.getItem("backgroundImage");
      if (savedBackground) {
        const backgroundElement = document.getElementById("background");
        if (backgroundElement) backgroundElement.style.backgroundImage = `url(${savedBackground})`;
      }
    };

    const startRowTop = document.getElementById("start-row-top");
    if (startRowTop) startRowTop.appendChild(menu);
    this.menu = menu;
  }

  openSubMenu(): void {
    const overlay = document.createElement("div");
    const savedOpacity = localStorage.getItem("opacity") ?? "1";
    const savedScale = localStorage.getItem("scale") ?? "0.8";

    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: "10002",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    } as Partial<CSSStyleDeclaration>);

    const subMenu = document.createElement("div");
    Object.assign(subMenu.style, {
      backgroundColor: "#333",
      padding: "20px",
      borderRadius: "15px",
      width: "400px",
      color: "#fff",
      textAlign: "left",
      zIndex: "10003",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
    } as Partial<CSSStyleDeclaration>);

    const createSectionHeader = (text: string) => {
      const header = document.createElement("h3");
      header.textContent = text;
      Object.assign(header.style, {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: "10px",
      } as Partial<CSSStyleDeclaration>);
      return header;
    };

    const createSettingItem = (id: string, label: string, checked: boolean) => {
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        display: "flex",
        alignItems: "center",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
        backgroundColor: "#444",
      } as Partial<CSSStyleDeclaration>);

      const checkbox = document.createElement("input");
      checkbox.id = id;
      checkbox.type = "checkbox";
      checkbox.checked = checked;
      Object.assign(checkbox.style, { marginRight: "10px", cursor: "pointer" } as Partial<CSSStyleDeclaration>);

      const labelText = document.createElement("p");
      labelText.textContent = label;
      Object.assign(labelText.style, { margin: "0", fontSize: "16px", color: "#fff" } as Partial<CSSStyleDeclaration>);

      wrapper.appendChild(checkbox);
      wrapper.appendChild(labelText);
      return wrapper;
    };

    const createCustomSlider = (id: string, min: number, max: number, step: number, value: string, onChange: (v: string) => void) => {
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
      } as Partial<CSSStyleDeclaration>);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.id = id;
      slider.min = String(min);
      (slider).max = String(max);
      (slider).step = String(step);
      (slider).value = value;
      Object.assign(slider.style, { flex: "1", marginRight: "10px" } as Partial<CSSStyleDeclaration>);

      const valueLabel = document.createElement("span");
      valueLabel.textContent = value;
      Object.assign(valueLabel.style, { minWidth: "30px", textAlign: "right", color: "#fff" } as Partial<CSSStyleDeclaration>);

      slider.oninput = () => {
        valueLabel.textContent = (slider).value;
        onChange((slider).value);
      };

      wrapper.appendChild(slider);
      wrapper.appendChild(valueLabel);
      return wrapper;
    };

    const titleClient = document.createElement("h2");
    titleClient.textContent = "Client Settings";
    Object.assign(titleClient.style, {
      margin: "0 0 20px",
      fontSize: "24px",
      fontWeight: "bold",
      color: "#FFAE00",
      textAlign: "center",
    } as Partial<CSSStyleDeclaration>);
    subMenu.appendChild(titleClient);

    subMenu.appendChild(createSectionHeader("FPS Uncap"));
    subMenu.appendChild(createSettingItem("fps-uncap", "Enable/disable FPS uncap", this.isFpsUncapped));

    const titleUI = document.createElement("h2");
    titleUI.textContent = "UI Settings";
    Object.assign(titleUI.style, {
      margin: "20px 0 20px",
      fontSize: "24px",
      fontWeight: "bold",
      color: "#FFAE00",
      textAlign: "center",
    } as Partial<CSSStyleDeclaration>);
    subMenu.appendChild(titleUI);

    subMenu.appendChild(createSectionHeader("Opacity"));
    subMenu.appendChild(createCustomSlider("opacity-slider", 0, 1, 0.01, savedOpacity, (value) => localStorage.setItem("opacity", value)));

    subMenu.appendChild(createSectionHeader("Scale"));
    subMenu.appendChild(createCustomSlider("scale-slider", 0.5, 1, 0.01, savedScale, (value) => localStorage.setItem("scale", value)));

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    Object.assign(closeButton.style, {
      backgroundColor: "#FF4D4D",
      border: "none",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "8px",
      marginTop: "20px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "background-color 0.3s ease",
      width: "100%",
    } as Partial<CSSStyleDeclaration>);
    closeButton.onmouseenter = () => { closeButton.style.backgroundColor = "#FF3333"; };
    closeButton.onmouseleave = () => { closeButton.style.backgroundColor = "#FF4D4D"; };
    closeButton.onclick = () => {
      if (overlay.parentElement) document.body.removeChild(overlay);
    };
    subMenu.appendChild(closeButton);

    overlay.appendChild(subMenu);
    document.body.appendChild(overlay);
    this.attachSettingsEvents();
  }

  customUiElements(): void {
    const scale = parseFloat(localStorage.getItem("scale") || "0.8");
    const opacity = parseFloat(localStorage.getItem("opacity") || "1");

    const healthBoost = document.getElementById("ui-bottom-center-0");
    if (healthBoost) {
      (healthBoost.style as any).transform = `translateX(-50%) scale(${scale})`;
      healthBoost.style.opacity = String(opacity);
      healthBoost.style.bottom = globalThis.innerWidth > 1200 ? `-${(1 - scale) * 20 + 2}px` : "";
    }

    const weapon = document.getElementById("ui-weapon-container");
    if (weapon) {
      (weapon.style as any).scale = String(scale);
      weapon.style.opacity = String(opacity);
      weapon.style.transformOrigin = "right";
    }

    const inventory = document.getElementById("ui-right-center");
    if (inventory) {
      (inventory.style as any).scale = String(scale * 1.1);
      inventory.style.opacity = String(opacity);
      inventory.style.marginTop = `-${(1 - scale) * 100}px`;
    }

    const info = document.getElementById("ui-top-left");
    if (info) {
      info.style.transformOrigin = "top left";
      (info.style as any).scale = String(scale * 1.1);
      info.style.opacity = String(opacity);
    }

    const players = document.getElementById("ui-leaderboard-wrapper");
    if (players) {
      (players.style as any).scale = String(scale);
      players.style.opacity = String(opacity);
      players.style.transformOrigin = "top right";
    }

    const killfeed = document.getElementById("ui-killfeed-wrapper");
    if (killfeed) {
      (killfeed.style as any).scale = String(scale);
      killfeed.style.opacity = String(opacity);
      killfeed.style.transformOrigin = "right";
    }

    const ammo = document.getElementById("ui-equipped-ammo-wrapper");
    if (ammo) {
      ammo.style.opacity = String(opacity);
      ammo.style.transform = `translateX(-50%) scale(${scale})`;
      const bottomValue = 62 - (1 - scale) * 20;
      ammo.style.bottom = `${bottomValue}px`;
    }

    const gears = document.getElementById("ui-bottom-center-right");
    if (gears) {
      gears.style.opacity = String(opacity);
      (gears.style as any).scale = String(scale);
    }

    const scopes = document.getElementById("ui-top-center-scopes");
    if (scopes) {
      scopes.style.opacity = String(opacity);
      (scopes.style as any).scale = String(scale);
    }
  }

  attachSettingsEvents(): void {
    const fpsUncapCheckbox = document.querySelector<HTMLInputElement>("#fps-uncap");
    if (fpsUncapCheckbox) {
      fpsUncapCheckbox.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        this.isFpsUncapped = target.checked;
        this.saveSettings();
      });
    }

    const opacitySlider = document.querySelector<HTMLInputElement>("#opacity-slider");
    if (opacitySlider) {
      opacitySlider.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        localStorage.setItem("opacity", target.value);
        this.customUiElements();
      });
    }

    const scaleSlider = document.querySelector<HTMLInputElement>("#scale-slider");
    if (scaleSlider) {
      scaleSlider.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        localStorage.setItem("scale", target.value);
        this.customUiElements();
      });
    }
  }

  toggleMenuVisibility(): void {
    if (!this.menu) return;
    const isVisible = this.menu.style.display !== "none";
    this.menu.style.display = isVisible ? "none" : "block";
  }

  startUpdateLoop(): void {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 0;

    const loop = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      frameCount++;

      if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta)*2;
        frameCount = 0;
        lastFrameTime = now;
        this.kills = this.getKills();

        if (this.isFpsVisible && this.fpsCounter) {
          this.fpsCounter.textContent = `FPS: ${Math.round(fps / 2)}`;
        }

        if (this.isKillsVisible && this.killsCounter) {
          this.killsCounter.textContent = `Kills: ${this.kills}`;
        }

        if (this.isPingVisible && this.pingCounter && this.pingTest) {
          const result = this.pingTest.getPingResult();
          this.pingCounter.textContent = `PING: ${result.ping} ms`;
        }
      }

      this.startPingTest();
      this.updateFpsToggle();
      this.animationFrameCallback(() => loop());
      this.updateUiElements();
      this.updateCleanMode();
      this.updateBoostBars();
      this.updateHealthBars();
    };

    loop();
  }

  pingShow(): void {
    const serverSelect = document.getElementById("server-select-main") as HTMLSelectElement | null;
    if (!serverSelect) return;

    const updateOptionWithPing = (optionElement: HTMLOptionElement, ping: number) => {
      const pingText = ` (${ping} ms)`;
      const originalText = optionElement.textContent?.replace(/\(\d+ ms\)/g, "").trim() || "";
      optionElement.textContent = `${originalText}${pingText}`;


        if (ping > 300) {
          optionElement.style.color = "red";
        } else if (ping > 200) {
          optionElement.style.color = "orange";
        } else if (ping > 100) {
          optionElement.style.color = "yellow";
        } else {
          optionElement.style.color = "green";
        }
    };

    const servers = [
      { region: "NA", url: "usr.mathsiscoolfun.com:8001" },
      { region: "EU", url: "eur.mathsiscoolfun.com:8001" },
      { region: "Asia", url: "asr.mathsiscoolfun.com:8001" },
      { region: "SA", url: "sa.mathsiscoolfun.com:8001" },
    ];

    servers.forEach((server) => {
      const pingTest = new PingTest(server);
      pingTest.startPingTest();

      const intervalId = globalThis.setInterval(() => {
        const pingResult = pingTest.getPingResult();
        if (pingResult.ping !== 9999 && pingResult.ping !== null) {
          const optionElement = serverSelect.querySelector<HTMLOptionElement>(`option[value="${server.region.toLowerCase()}"]`);
          if (optionElement) {
            updateOptionWithPing(optionElement, pingResult.ping);
          }
          clearInterval(intervalId);
        }
      }, 2000);
    });
  }
}

const gameMod = new GameMod();
