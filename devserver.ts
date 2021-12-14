import Wss from "/dist/index";

const ws = new Wss("ws://localhost:8120")
ws.on("default", (val) => {
    console.log(val);
})

ws.onopen = () => {
    console.log("WebSocket:已连接")
}