import Wss from "/dist/index";



function test() {

    const ws = new Wss("ws://localhost:8120")

    const btn = document.querySelector("#btn")
    btn.addEventListener("click", () => {
        ws.send("test")
    })
    ws.on("default", (val) => {
        console.log(val, ws);
    })
    ws.on("test", (data) => {
        console.log(data);

        var msg = new SpeechSynthesisUtterance();
        msg.text = data;
        msg.lang = 'zh'; //汉语
        msg.volume = 50; // 声音的音量
        msg.rate = 0.5; //语速，数值，默认值是1，范围是0.1到10
        msg.pitch = 2; // 表示说话的音高，数值，范围从0（最小）到2（最大）。默认值为1

        speechSynthesis.speak(msg);
    })

    ws.onopen = () => {
        console.log("WebSocket:已连接")
    }

}
test()
test()