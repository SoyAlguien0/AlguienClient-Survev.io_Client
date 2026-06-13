import { TeamPlayer } from "./types/TeamPlayer.js";
import { TeamColors } from "./consts.js";

const oldCall = Function.prototype.call;
let updateManager:any = null;
let gameManager:any = null;
let uiManager:any = null;
let pixi:any = null;
let initialized = false;
let hideMap = true;
let foundUiManager = false;

function getTeamMembersInfo() {
    const teamPlayers:TeamPlayer[] = [];
    let teamMembers = document.querySelectorAll(".ui-team-member");
    for (const teamMember of teamMembers) {
        const teammateText = teamMember.querySelector('.ui-team-member-name')?.textContent;
        if (teammateText == "") break;
        const teammateColor = teamMember.querySelector('.ui-team-member-color')!.classList.item(1)?.split('-')[2].toUpperCase();
        teamPlayers.push({
            textColor: TeamColors[teammateColor! as keyof typeof TeamColors],
            name: teammateText!,
        });
    }
    return teamPlayers;
}


function scanNames(node: any, teamPlayers: TeamPlayer[]) {
    //TODO: optimize
    if (!node) return;

    let found = false;
    teamPlayers.forEach((t) => {
        if (node.text != undefined && node.text == t.name) {
            node.style.fill = t.textColor;
            found = true;
        }
    });

    if (found) return;

    if (node.children) {
        for (const c of node.children) scanNames(c, teamPlayers);
    }
}

function findUiManager(game:any) {
    for (const value of Object.values(game) as any) {
        if (!value || typeof value !== "object") 
            continue;

        if ( value.actionSeq && value.aimLineButton) {
            foundUiManager = true;
            return value;
        }
    }
    return null;
}


const update  = (gameInitialized:boolean, isTeamMode:boolean) => {
    if (!gameInitialized) {
        hideMap = true;
    } else if(gameInitialized && !foundUiManager) {
        uiManager = findUiManager(gameManager);
    }
    
    if (gameInitialized && isTeamMode) {
        const teamPlayers = getTeamMembersInfo();
        scanNames(pixi.stage, teamPlayers);
    }

    if (foundUiManager && hideMap) {
        uiManager.cycleVisibilityMode();
        uiManager.getMinimapSize = ()=>{
            return 128;
        }
        //TODO: consts
        uiManager.getMinimapMargin = ()=>{
            return 128/2;
        }
        hideMap = false;
    }
}

Function.prototype.call = function (...args) {
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