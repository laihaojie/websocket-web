// let ws = null;

// ws = new WebSocket("ws://localhost:8120")



// ws.onopen = () => {
//     console.log("连接服务器成功");
//     ws.send("message1")
//     console.log(ws.readyState);
// }


// ws.onclose = () => {
//     console.log("连接服务器失败了");
//     ws = null
// }
// ws.onmessage = (msg) => {
//     console.log("接受到服务器发来的消息了");
//     console.log(JSON.parse(msg.data));

// }



var websocket;
createWebSocket();

/**
 * websocket启动
 */
function createWebSocket() {
    try {
        if ('WebSocket' in window) {
            websocket = new WebSocket("ws://localhost:8120")
        } else if ('MozWebSocket' in window) {
            websocket = new MozWebSocket("ws://localhost:8120");
        } else {
            websocket = new SockJS("ws://localhost:8120");
        }
        init();
    } catch (e) {
        console.log('catch' + e);
        reconnect();
    }

}

function init() {
    //连接成功建立的回调方法
    websocket.onopen = function(event) {
        console.log("WebSocket:已连接");
        //心跳检测重置
        heartCheck.reset().start();
    };

    //接收到消息的回调方法
    websocket.onmessage = function(event) {
        console.log("WebSocket:收到一条消息", event.data);
        heartCheck.reset().start();
    };

    //连接发生错误的回调方法
    websocket.onerror = function(event) {
        console.log("WebSocket:发生错误");
        reconnect();
    };

    //连接关闭的回调方法
    websocket.onclose = function(event) {
        console.log("WebSocket:已关闭");
        heartCheck.reset(); //心跳检测
        reconnect();
    };

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function() {
        websocket.close();
    };

    //关闭连接
    function closeWebSocket() {
        websocket.close();
    }

    //发送消息
    function send(message) {
        websocket.send(message);
    }
}

//避免重复连接
var lockReconnect = false,
    tt;

/**
 * websocket重连
 */
function reconnect() {
    if (lockReconnect) {
        return;
    }
    lockReconnect = true;
    tt && clearTimeout(tt);
    tt = setTimeout(function() {
        console.log('重连中...');
        lockReconnect = false;
        createWebSocket();
    }, 0);
}

/**
 * websocket心跳检测
 */
var heartCheck = {
    timeout: 5000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start() {
        this.timeoutObj && clearTimeout(this.timeoutObj);
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
        this.timeoutObj = setTimeout(() => {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            websocket.send("ping");
            console.log('ping');
            this.serverTimeoutObj = setTimeout(() => { // 如果超过一定时间还没重置，说明后端主动断开了
                console.log('关闭服务');
                websocket.close(); //如果onclose会执行reconnect，我们执行 websocket.close()就行了.如果直接执行 reconnect 会触发onclose导致重连两次
            }, this.timeout)
        }, this.timeout)
    }
};