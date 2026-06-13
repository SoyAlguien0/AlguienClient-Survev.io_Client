(() => {
  // src/consts.ts
  var TeamColors = /* @__PURE__ */ ((TeamColors2) => {
    TeamColors2["YELLOW"] = "#ff0";
    TeamColors2["BLUE"] = "#00f";
    TeamColors2["RED"] = "#ff0000";
    TeamColors2["PURPLE"] = "#f0f";
    TeamColors2["CYAN"] = "#0ff";
    TeamColors2["ORANGE"] = "#ff5400";
    return TeamColors2;
  })(TeamColors || {});

  // src/AlguienClient.ts
  var oldCall = Function.prototype.call;
  var updateManager = null;
  var gameManager = null;
  var uiManager = null;
  var pixi = null;
  var initialized = false;
  var hideMap = true;
  var foundGameManager = false;
  function getTeamMembersInfo() {
    const teamPlayers = [];
    let teamMembers = document.querySelectorAll(".ui-team-member");
    for (const teamMember of teamMembers) {
      const teammateText = teamMember.querySelector(".ui-team-member-name")?.textContent;
      if (teammateText == "") break;
      const teammateColor = teamMember.querySelector(".ui-team-member-color").classList.item(1)?.split("-")[2].toUpperCase();
      teamPlayers.push({
        textColor: TeamColors[teammateColor],
        name: teammateText
      });
    }
    return teamPlayers;
  }
  function scanNames(node, teamPlayers) {
    if (!node) return;
    let found = false;
    teamPlayers.forEach((t) => {
      if (node.text != void 0 && node.text == t.name) {
        node.style.fill = t.textColor;
        found = true;
      }
    });
    if (found) return;
    if (node.children) {
      for (const c of node.children) scanNames(c, teamPlayers);
    }
  }
  function findUiManager(game) {
    for (const value of Object.values(game)) {
      if (!value || typeof value !== "object")
        continue;
      if (value.actionSeq && value.aimLineButton) {
        foundGameManager = true;
        return value;
      }
    }
    return null;
  }
  var update = (gameInitialized, isTeamMode) => {
    if (!gameInitialized) {
      hideMap = true;
    } else if (gameInitialized && !foundGameManager) {
      uiManager = findUiManager(gameManager);
    }
    if (gameInitialized && isTeamMode) {
      const teamPlayers = getTeamMembersInfo();
      scanNames(pixi.stage, teamPlayers);
    }
    if (foundGameManager && hideMap) {
      uiManager.cycleVisibilityMode();
      uiManager.getMinimapSize = () => {
        return 128;
      };
      uiManager.getMinimapMargin = () => {
        return uiManager.getMinimapSize() / 2;
      };
      hideMap = false;
    }
  };
  Function.prototype.call = function(...args) {
    if (!initialized && args[0]?.pixi && args[0]?.game) {
      updateManager = args[0];
      gameManager = updateManager.game;
      pixi = updateManager.pixi;
      initialized = true;
      console.log("injected Client");
    }
    const isUpdateManager = updateManager == args[0];
    if (isUpdateManager) {
      const isTeamMode = gameManager.teamMode > 1;
      const gameInitialized = initialized && gameManager.initialized;
      update(gameInitialized, isTeamMode);
    }
    return oldCall.apply(this, args);
  };
})();
