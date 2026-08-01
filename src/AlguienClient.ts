import { TeamPlayer } from "./types/TeamPlayer.js";
import {
    applyUiSettings,
    setSettings,
    updateUi,
    hideMiniMap,
} from "./ui/ui.js";
import { resetSocket } from "./ui/ping.js";

//todo: separate, objects

const oldCall = Function.prototype.call;
let updateManager: any = null;
let gameManager: any = null;
let uiManager: any = null;
let playerManager: any = null;
let activePlayerId = 0;
let groupSize = 0;
let initialized = false;
let gameInitialized = false;

const getTeamMembersInfo = () => {
    const teamPlayers: TeamPlayer[] = [];
    activePlayerId = getActiveId(gameManager);
    groupSize = getGroupSize();

    if (!playerManager.getPlayerInfo(activePlayerId)) return;
    let groupId = playerManager.getPlayerInfo(activePlayerId).groupId;

    if (!playerManager.getGroupInfo(groupId)) return;
    const teamMembersId = playerManager.getGroupInfo(groupId).playerIds;

    for (const id of teamMembersId) {
        const teammateName = playerManager.getPlayerInfo(id).name;
        const teammateColor = playerManager.getGroupColor(id);
        teamPlayers.push({
            id: id,
            name: teammateName,
            textColor: teammateColor,
        });
    }
    return teamPlayers;
};

const getGroupSize = () => {
    activePlayerId = getActiveId(gameManager);
    if (!playerManager.getPlayerInfo(activePlayerId)) return;
    let groupId = playerManager.getPlayerInfo(activePlayerId).groupId;

    if (!playerManager.getGroupInfo(groupId)) return;
    return playerManager.getGroupInfo(groupId).playerIds.length;
};

const updateTextStyleNames = (playersArray: any) => {
    for (const player of playersArray) {
        for (const teamPlayerInfo of teamPlayers) {
            if (teamPlayerInfo.id != player.__id) continue;
            player.nameText.style.fill = teamPlayerInfo.textColor;
        }
    }
};

const updateTextStyleNamesDead = (deadBodiesArray: any) => {
    for (const deadBody of deadBodiesArray) {
        const player = teamPlayers.find((p: any) => p.id === deadBody.playerId);

        deadBody.nameText.style.fill = player?.textColor ?? 12237498;
    }
};

function findObject(
    gameManager: any,
    object: string,
    anonymousObject: boolean,
) {
    if (!anonymousObject) {
        for (const value of Object.values(gameManager) as any) {
            if (!value || typeof value !== "object") continue;

            if (value[object]) {
                return value[object];
            }
        }
        return null;
    } else {
        for (const value of Object.values(gameManager) as any) {
            if (!value || typeof value !== "object") continue;

            if (value[object]) {
                return value;
            }
        }
        return null;
    }
}

let playersArray: any = null;
const findPlayersArray = (gameManager: any) => {
    const playerPool = findObject(gameManager, "playerPool", false);
    for (const value of Object.values(playerPool) as any) {
        if (value && typeof value === "object" && Array.isArray(value))
            return value;
    }
    return null;
};

let deadBodiesArray: any = null;
const findDeadBodiesArray = (gameManager: any) => {
    const playerPool = findObject(gameManager, "deadBodyPool", false);
    for (const value of Object.values(playerPool) as any) {
        if (value && typeof value === "object" && Array.isArray(value))
            return value;
    }
    return null;
};

const getActiveId = (gameManager: any) => {
    const values = Object.values(gameManager) as any;
    for (const value of values) {
        if (!value || typeof value !== "object") continue;

        if (value.active && value.__id) return value.__id;
    }

    return null;
};

let teamPlayers: any = null;
const update = (gameInitialized: boolean, isTeamMode: boolean) => {
    if (gameInitialized && isTeamMode) {
        if (
            getGroupSize() != groupSize ||
            getActiveId(gameManager) != activePlayerId
        ) {
            teamPlayers = getTeamMembersInfo();
        }
        const players = playersArray
            ? playersArray
            : findPlayersArray(gameManager);

        if (teamPlayers && players!.length > 1) {
            //1 to not count active player
            updateTextStyleNames(players);
        }

        const deadBodies = deadBodiesArray
            ? deadBodiesArray
            : findDeadBodiesArray(gameManager);
        if (teamPlayers && deadBodies!.length > 0) {
            updateTextStyleNamesDead(deadBodies);
        }
    }

    if (gameInitialized) {
        updateUi();
    }
};

const init = (gameInitialized: boolean, isTeamMode: boolean) => {
    uiManager = findObject(gameManager, "killLeaderCount", true);
    applyUiSettings();

    if (gameInitialized && isTeamMode) {
        playerManager = findObject(gameManager, "teamInfo", true);
        teamPlayers = getTeamMembersInfo();
    }

    if (gameInitialized && hideMiniMap) {
        uiManager.cycleVisibilityMode();
    }

    if (gameInitialized) {
        resetSocket();
    }

    if (!gameInitialized) {
        activePlayerId = 0;
        groupSize = 0;
        teamPlayers = null;
        playersArray = null;
        deadBodiesArray = null;
    }
};

Function.prototype.call = function (...args) {
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
