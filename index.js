const ws = new WebSocket("ws://localhost:8120")

ws.onopen = () => {
    console.log("连接服务器成功");
    ws.send("message1")
    console.log(ws.readyState);
}
ws.onclose = () => {
    console.log("连接服务器失败了");
}
ws.onmessage = (msg) => {
    console.log("接受到服务器发来的消息了");
    console.log(JSON.parse(msg.data));
    console.log(ws.readyState);
}