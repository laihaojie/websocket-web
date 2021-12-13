import Wss from "./websocketService";

const ws = new Wss()
ws.on("default", (val) => {
    console.log(val);
})

ws.onopen = () => {
    console.log("WebSocket:已连接")
}