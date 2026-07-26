(() => {
  // src/ui.ts
  var uiElements = document.querySelectorAll("#ui-bottom-center-0,#ui-weapon-container,#ui-right-center,#ui-top-left,#ui-leaderboard-wrapper,#ui-killfeed-wrapper,#ui-equipped-ammo-wrapper,#ui-bottom-center-right,#ui-top-center-scopes, #ui-kill-leader-wrapper, #ui-map-expand-desktop, #ui-map-minimize, #ui-map-info, #ui-spec-counter");
  var applyUiSettings = () => {
    const opacityValue = document.querySelector(".slider-oppacity > input")?.value;
    const scaleValue = document.querySelector(".slider-scale > input")?.value;
    for (const uiElement of uiElements) {
      uiElement.style.scale = scaleValue + "%";
      uiElement.style.opacity = opacityValue + "%";
    }
  };
  var setSettings = () => {
    document.querySelector("#ui-game-menu").style.height = "fit-content";
    addSettingOptions();
  };
  var addSettingOptions = () => {
    createSetting("Oppacity");
    createSetting("Scale", "70");
  };
  var createSettingElement = (settingText, min, max) => {
    const setting = document.createElement("div");
    setting.classList.add("modal-settings-item", "slider-container", "slider-" + settingText.toLowerCase());
    const settingTextElement = document.createElement("p");
    settingTextElement.classList.add("modal-slider-text");
    settingTextElement.textContent = settingText;
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
      updateSettings(e.target);
      applyUiSettings();
    });
    return setting;
  };
  var createSetting = (settingText, min = "0", max = "100") => {
    const settingsLinks = document.querySelector("#settings-links");
    settingsLinks?.before(createSettingElement(settingText, min, max));
    const quitButton = document.querySelector("#btn-game-quit");
    quitButton?.before(createSettingElement(settingText, min, max));
  };
  var updateSettings = (inputElementEvent) => {
    const inputElements = document.querySelectorAll(".slider-oppacity > input, .slider-scale > input");
    for (const inputElement of inputElements) {
      if (inputElement.dataset.setting == inputElementEvent.dataset.setting) {
        inputElement.value = inputElementEvent.value;
      }
    }
  };

  // src/AlguienClient.ts
  var oldCall = Function.prototype.call;
  var updateManager = null;
  var gameManager = null;
  var uiManager = null;
  var playerManager = null;
  var activePlayerId = 0;
  var groupSize = 0;
  var initialized = false;
  var hideMap = true;
  var gameInitialized = false;
  var getTeamMembersInfo = () => {
    const teamPlayers2 = [];
    activePlayerId = getActiveId(gameManager);
    groupSize = getGroupSize();
    if (!playerManager.getPlayerInfo(activePlayerId)) return;
    let groupId = playerManager.getPlayerInfo(activePlayerId).groupId;
    if (!playerManager.getGroupInfo(groupId)) return;
    const teamMembersId = playerManager.getGroupInfo(groupId).playerIds;
    for (const id of teamMembersId) {
      const teammateName = playerManager.getPlayerInfo(id).name;
      const teammateColor = playerManager.getGroupColor(id);
      teamPlayers2.push({
        id,
        name: teammateName,
        textColor: teammateColor
      });
    }
    return teamPlayers2;
  };
  var getGroupSize = () => {
    activePlayerId = getActiveId(gameManager);
    if (!playerManager.getPlayerInfo(activePlayerId)) return;
    let groupId = playerManager.getPlayerInfo(activePlayerId).groupId;
    if (!playerManager.getGroupInfo(groupId)) return;
    return playerManager.getGroupInfo(groupId).playerIds.length;
  };
  var updateTextStyleNames = (playersArray2) => {
    for (const player of playersArray2) {
      for (const teamPlayerInfo of teamPlayers) {
        if (teamPlayerInfo.id != player.__id) continue;
        player.nameText.style.fill = teamPlayerInfo.textColor;
      }
    }
  };
  var updateTextStyleNamesDead = (deadBodiesArray2) => {
    for (const deadBody of deadBodiesArray2) {
      const player = teamPlayers.find(
        (p) => p.id === deadBody.playerId
      );
      deadBody.nameText.style.fill = player?.textColor ?? 12237498;
    }
  };
  function findObject(gameManager2, object, anonymousObject) {
    if (!anonymousObject) {
      for (const value of Object.values(gameManager2)) {
        if (!value || typeof value !== "object") continue;
        if (value[object]) {
          return value[object];
        }
      }
      return null;
    } else {
      for (const value of Object.values(gameManager2)) {
        if (!value || typeof value !== "object") continue;
        if (value[object]) {
          return value;
        }
      }
      return null;
    }
  }
  var playersArray = null;
  var findPlayersArray = (gameManager2) => {
    const playerPool = findObject(gameManager2, "playerPool", false);
    for (const value of Object.values(playerPool)) {
      if (value && typeof value === "object" && Array.isArray(value)) return value;
    }
    return null;
  };
  var deadBodiesArray = null;
  var findDeadBodiesArray = (gameManager2) => {
    const playerPool = findObject(gameManager2, "deadBodyPool", false);
    for (const value of Object.values(playerPool)) {
      if (value && typeof value === "object" && Array.isArray(value)) return value;
    }
    return null;
  };
  var getActiveId = (gameManager2) => {
    const values = Object.values(gameManager2);
    for (const value of values) {
      if (!value || typeof value !== "object") continue;
      if (value.active && value.__id) return value.__id;
    }
    return null;
  };
  var teamPlayers = null;
  var update = (gameInitialized2, isTeamMode) => {
    if (gameInitialized2 && isTeamMode) {
      if (getGroupSize() != groupSize || getActiveId(gameManager) != activePlayerId) {
        teamPlayers = getTeamMembersInfo();
      }
      const players = playersArray ? playersArray : findPlayersArray(gameManager);
      if (teamPlayers && players.length > 1) {
        updateTextStyleNames(players);
      }
      const deadBodies = deadBodiesArray ? deadBodiesArray : findDeadBodiesArray(gameManager);
      if (teamPlayers && deadBodies.length > 0) {
        updateTextStyleNamesDead(deadBodies);
      }
    }
    if (gameInitialized2 && hideMap) {
      uiManager.cycleVisibilityMode();
      uiManager.getMinimapSize = () => {
        return 128;
      };
      uiManager.getMinimapMargin = () => {
        return 128 / 2;
      };
      hideMap = false;
    }
  };
  var init = (gameInitialized2, isTeamMode) => {
    uiManager = findObject(gameManager, "killLeaderCount", true);
    applyUiSettings();
    if (gameInitialized2 && isTeamMode) {
      playerManager = findObject(gameManager, "teamInfo", true);
      teamPlayers = getTeamMembersInfo();
    }
    if (!gameInitialized2) {
      activePlayerId = 0;
      groupSize = 0;
      teamPlayers = null;
      hideMap = true;
      playersArray = null;
      deadBodiesArray = null;
    }
  };
  Function.prototype.call = function(...args) {
    if (!initialized && args[0]?.pixi && args[0]?.game) {
      updateManager = args[0];
      gameManager = updateManager.game;
      initialized = true;
      console.log("Client Injected");
    }
    const isUpdateManager = updateManager == args[0];
    if (isUpdateManager && initialized) {
      const gameStateChanged = gameInitialized != gameManager.initialized;
      const isTeamMode = gameManager.teamMode > 1;
      if (gameStateChanged) {
        gameInitialized = gameManager.initialized;
        init(gameInitialized, isTeamMode);
      }
      update(gameInitialized, isTeamMode);
    }
    return oldCall.apply(this, args);
  };
  setSettings();
})();
