let websocketManager = (function () {
    let serverSettings;
    let activeInstances = {};
    let subscriptions = {main: [], voice: [], chat: [], tickets: [], webchat: [], 'webchat-plugin': [], internal: []};
    let keepAlive;
    let isFirstSocket;
    
    // [NEW CODE]
    let isReconnecting = false;

    /**
     * Starts the Manager, fetching the online instances and connecting to them.
     * 
     * @param {object} connectionSettings
     * @param {number} keepAliveValue
     * @returns {jqXHR}
     */
    function init(connectionSettings, keepAliveValue) {
        serverSettings = connectionSettings;
        keepAlive = parseInt(keepAliveValue) || 0;
        isFirstSocket = null;

        return startSocket(connectionSettings.baseurl, connectionSettings.serviceName);

// [HIDDEN]
//        return getOnlineServers().done(function (serverList) {
//            for (let i = 0, l = serverList.length; i < l; i++) {
//                startSocket(serverList[i]);
//            }
//        }).fail(function (jqXHR, textStatus, errorThrown) {
//            publishInternalMessage({error: 'NO_SERVERS_AVAILABLE'});
//        });
    }

    /**
     * Closes all opened WebSocket connections.
     * 
     * @returns {undefined}
     */
    function close() {
        for (let instance in activeInstances) {
            activeInstances[instance].closedByUser = true;

            activeInstances[instance].end({closedByUser: true});
        }
    }

    /**
     * Starts a new socket connection to the server provided.
     * We can add a query parameter 'keep-alive' and the number of seconds the server should wait before processing the services logout.
     * 
     * @param {String} baseUrl
     * @param {String} serviceName
     * @returns {undefined}
     */
    function startSocket(baseUrl, serviceName) {
        let keepAliveStr = keepAlive > 0 ? '?keep-alive=' + keepAlive : '';

        let socket = new Primus(baseUrl + keepAliveStr, {
            network: true,
            service_pathname: `/${serviceName}/ws`,
            use_clock_offset: true,
            strategy: ['online', 'timeout']
        });

        socket.on('open', onOpen);
        socket.on('data', onData);
        socket.on('error', handleSocketClose);
        socket.on('close', handleSocketClose);

        // there is no point in having a UUID, the browser will have one connection only
        // just to avoid changing all the logic right now
        socket.instanceUuid = 'some-random-uuid';
        socket.closedByUser = false;
    }

// [HIDDEN]
//    /**
//     * Starts a new socket connection to the server provided.
//     * We can add a query parameter 'keep-alive' and the number of seconds the server should wait before processing the services logout.
//     * 
//     * @param {object} instanceObj
//     * @returns {undefined}
//     */
//    function startSocket(instanceObj) {
//        let keepAliveStr = keepAlive > 0 ? '?keep-alive=' + keepAlive : '';
//
//        let socket = new Primus(serverSettings.baseurl + keepAliveStr, {
//            network: true,
//            service_pathname: '/' + instanceObj.name,
//            use_clock_offset: true,
//            strategy: ['online', 'timeout']
//        });
//
//        socket.on('open', onOpen);
//        socket.on('data', onData);
//        socket.on('error', handleSocketClose);
//        socket.on('close', handleSocketClose);
//
//        socket.instanceUuid = instanceObj.uuid;
//        socket.closedByUser = false;
//    }

    /**
     * Handler for when the Socket connection is open.
     * 
     * @returns {undefined}
     */
    function onOpen() {
        activeInstances[this.instanceUuid] = this;

        isFirstSocket = isFirstSocket === null;

        console.log(`Socket up and running to server [${this.instanceUuid}].`);

        publishInternalMessage({connectionOpen: this.instanceUuid, isFirstSocket: isFirstSocket});

        // [NEW CODE]
        isReconnecting = false;
    }

    /**
     * Handler for when we receive Websocket messages.
     * 
     * @param {object} message
     * @returns {unresolved}
     */
    function onData(message) {
        if (message.internal === true) {
            return handleInternalPayload.call(this, message.payload);
        }

        if (message.internal === false) {
            return handleExternalPayload.call(this, message.payload);
        }

        console.log('Unknown message.');
    }

    /**
     * When a socket is closed, check if we still have some sockets active.
     * If not, log out the user.
     * 
     * @returns {undefined}
     */
    function handleSocketClose() {
        if (this.instanceUuid) {
            delete activeInstances[this.instanceUuid];

            console.log(`Socket to server [${this.instanceUuid}] closed.`);

            let obj = {
                connectionClosed: this.instanceUuid,
                isLastSocket: Object.keys(activeInstances).length === 0,
                closedByUser: this.closedByUser
            };

            publishInternalMessage(obj);

            // [NEW CODE]
            if (!isReconnecting && !this.closedByUser) {
                isReconnecting = true;

                setTimeout(() => {
                    return startSocket(serverSettings.baseurl, serverSettings.serviceName);
                }, 2000);
            }
        }
    }

    /**
     * Handles the messages received related to internal Websocket Manager operations.
     * 
     * @param {object} payload
     * @returns {undefined}
     */
    function handleInternalPayload(payload) {
        if (payload.newInstance === true) {
            return; // [HIDDEN]
            return startSocket(payload);
        }

        if (payload.isSocketReRegister === true) {
            publishInternalMessage({
                connectionUpdate: this.instanceUuid,
                isSocketReRegister: true
            });
        }

        if (payload.killedByReRegister === true) {
            publishInternalMessage({
                connectionUpdate: this.instanceUuid,
                killedByReRegister: true
            });
        }
    }

    /**
     * Delivers the incoming message to the listeners attached.
     * 
     * @param {object} payload
     * @returns {undefined}
     */
    function handleExternalPayload(payload) {
        for (let subscription of subscriptions[payload.owner]) {
            subscription.callback(payload.message);
        }
    }

    /**
     * Delivers the private messages to the listeners attached.
     * 
     * @param {object} message
     * @returns {undefined}
     */
    function publishInternalMessage(message) {
        for (let subscription of subscriptions.internal) {
            subscription.callback(message);
        }
    }

// [HIDDEN]
//    /**
//     * Gets the list of online Websocket Aggregator instances.
//     * 
//     * @returns {jqXHR}
//     */
//    function getOnlineServers() {
//        return $.ajax({
//            dataType: 'json',
//            method: 'GET',
//            url: serverSettings.baseurl + '/' + serverSettings.serviceName + '/servers'
//        });
//    }

    /**
     * Triggers in the backend the delivery of user persisted events.
     * 
     * @returns {jqXHR}
     */
    function triggerPersistedEventsDelivery() {
        return $.ajax({
            dataType: 'json',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            url: serverSettings.baseurl + '/' + serverSettings.serviceName + '/trigger-events'
        });
    }

    /**
     * Subscribes to events emitted by the Websocket Manager related to the message owner provided.
     * The callback function is fired each time we get an event from the back-end.
     * 
     * @param {string} subscriptionName
     * @param {string} messageOwner
     * @param {function} callback
     * @returns {undefined}
     */
    function subscribe(subscriptionName, messageOwner, callback) {
        for (let subscription of subscriptions[messageOwner]) {
            if (subscription.subscriptionName === subscriptionName) {
                throw new Error('Duplicated subscription name: ' + subscriptionName);
            }
        }

        subscriptions[messageOwner].push({subscriptionName: subscriptionName, callback: callback});
    }

    /**
     * Unsubscribes from events emitted by the Websocket Manager.
     * We should provide the subscription name and message owner used to make the subscription.
     * 
     * @param {string} subscriptionName
     * @param {string} messageOwner
     * @returns {undefined}
     */
    function unsubscribe(subscriptionName, messageOwner) {
        subscriptions[messageOwner] = subscriptions[messageOwner].filter(function (subscription) {
            return subscription.subscriptionName !== subscriptionName;
        });
    }

    return {
        start: init,
        close: close,
        on: subscribe,
        off: unsubscribe,
        triggerEvents: triggerPersistedEventsDelivery
    };
})();