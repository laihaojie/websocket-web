export default class Wss {
    websocket
    //避免重复连接
    lockReconnect = false
    tt
    // 心跳间隔时间
    timeout = 60000
    timeoutObj = null
    serverTimeoutObj = null
    callbackStack = {}

    constructor() {
        this.createWebSocket()
    }
    createWebSocket() {
        try {
            if ('WebSocket' in window) {
                this.websocket = new WebSocket("ws://localhost:8120")
            } else if ('MozWebSocket' in window) {
                this.websocket = new MozWebSocket("ws://localhost:8120");
            } else {
                this.websocket = new SockJS("ws://localhost:8120");
            }
            this.init();
        } catch (e) {
            console.log('catch' + e);
            this.reconnect();
        }
    }
    init() {


        //连接成功建立的回调方法
        this.websocket.onopen = (event) => {
            this.onopen && this.onopen()
            //心跳检测重置
            this.reset().start();
        };

        //接收到消息的回调方法
        this.websocket.onmessage = (event) => {
            // console.log("WebSocket:收到一条消息", event.data);
            const result = JSON.parse(event.data)
            // 如果指定了action 就出发对应的依赖
            if (result.action) {
                this.trigger(result)
            }

            this.reset().start();
        };

        //连接发生错误的回调方法
        this.websocket.onerror = (event) => {
            console.log("WebSocket:发生错误");
            this.reconnect();
        };

        //连接关闭的回调方法
        this.websocket.onclose = (event) => {
            console.log("WebSocket:已关闭");
            this.reset(); //心跳检测
            this.reconnect();
        };

        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = () => {
            this.websocket.close();
        };


    }

    /**
     * 
     * @param {string} action 回调事件名称
     * @param {Function} callback 回调函数
     */
    on(action, callback) {
        if (this.callbackStack[action] == undefined) {
            this.callbackStack[action] = new Set
        }
        this.callbackStack[action].add(callback)
    }
    /**
     * 
     * @param {string} action 
     */
    trigger(result) {
        const effects = this.callbackStack[result.action]
        if (effects && effects.size) {
            effects.forEach(effect => {
                effect(result.data)
            })
        }
    }
    //发送消息
    send(message) {
        this.websocket.send(message);
    }
    /**
     * websocket重连
     */
    reconnect() {

        if (this.lockReconnect) return;
        this.lockReconnect = true;
        this.tt && clearTimeout(this.tt);
        this.tt = setTimeout(() => {
            console.log('重连中...');
            this.lockReconnect = false;
            this.createWebSocket();
        }, 0);
    }
    reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    }
    start() {
        this.timeoutObj && clearTimeout(this.timeoutObj);
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
        this.timeoutObj = setTimeout(() => {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            this.websocket.send("ping");
            // console.log('ping');
            this.serverTimeoutObj = setTimeout(() => { // 如果超过一定时间还没重置，说明后端主动断开了
                console.log('关闭服务');
                this.websocket.close(); //如果onclose会执行reconnect，我们执行 websocket.close()就行了.如果直接执行 reconnect 会触发onclose导致重连两次
            }, this.timeout)
        }, this.timeout)
    }
    //关闭连接
    closeWebSocket() {
        this.websocket.close();
    }
}