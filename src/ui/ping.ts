import {
    servers,
    serverSelector,
    startMenu,
    teamServerSelector,
} from "../consts.js";
import { updatePingCounter } from "./ui.js";

let socket: any = null;
let sendTime = 0;
let lastPingTime = 0;
let waitingForResponse = false;
let ping = 9999;
let tries = 0;
type Region = keyof typeof servers;

let actualRegion =
    startMenu?.style.display != "none"
        ? (serverSelector!.value as Region)
        : (teamServerSelector!.value as Region);

let reconnectTries = 0;
const openSocket = () => {
    socket = new WebSocket(servers[actualRegion]);
    socket.binaryType = "arraybuffer";
    socket.addEventListener("message", () => {
        if (!waitingForResponse) return;

        const arrivedTime = performance.now();

        ping = arrivedTime - sendTime;
        updatePingCounter(ping);
        waitingForResponse = false;
        reconnectTries = 0;
    });

    socket.addEventListener("error", () => {
        resetSocket();
    });
};

let retrying = false;
export const resetSocket = () => {
    actualRegion =
        startMenu?.style.display != "none"
            ? (serverSelector!.value as Region)
            : (teamServerSelector!.value as Region);

    if (socket && socket.readyState === WebSocket.OPEN) socket.close();

    if (retrying) return;
    retrying = true;

    setTimeout(() => {
        retrying = false;
        openSocket();
        reconnectTries++;
    }, 1000 * reconnectTries);
};

export const resendPing = () => {
    if (socket?.readyState !== WebSocket.OPEN) return;

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
