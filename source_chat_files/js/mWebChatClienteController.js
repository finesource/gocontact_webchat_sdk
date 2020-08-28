(function ($, Primus, window) {
    'use strict';

    if (typeof FSWebChatIn === undefined) {
        FSWebChatIn = {};
    }

    var RECONNECT_SETTINGS = {
        max: 10000, min: 500, retries: 10
    };

    var WebChatClienteController = function (options) {
        this._options = {};
	    this._options.hashkey = options.hashkey || null;
        this._options.url = options.url;
        this._options.wss = options.wss;
    };

    WebChatClienteController.prototype.isOnline = function () {
        return this._online || false;
    };

    WebChatClienteController.prototype._openWsConnection = function (onConnectionOpen) {
        var that = this;
        var socket_options = {reconnect: RECONNECT_SETTINGS, network: true, use_clock_offset: true, service_pathname: this._options.wss};

        var primus = new Primus(this._options.url + '/?userType=CLIENT&hashkey=' + this._options.hashkey, socket_options);

        primus.on('data', function (data) {
            if (data.action === 'FSwebchat:Server:Connected') {
                FSWebChatIn.Chat.updateWebchatStatus(true);

                if (that._isReconnecting) {
                    that._isReconnecting = false;
                    FSWebChatIn.sparkId = data.sparkId;
                    return FSWebChatIn.reconnectedWebChatEvent();
                }

                return onConnectionOpen(data);
            }

            if (data.action !== 'FSwebchat:Server:streamId') {
                return FSWebChatIn.makeWebChatEvents(data);
            }

            if (data.type === 'primusmirroring') {
                var primusmirroring = primus.substream(data.streamId);
                return that._primusmirroring = primusmirroring;
            }
        });

        primus.on('end', function () {
            that._online = false;
        });

        primus.on('outgoing::url', function (url) {
            url.query = url.query + '&browserTime=' + +new Date();
        });

        primus.on('reconnect', function () {
            that._isReconnecting = true;
        });

        primus.on('open', function () {
            that._online = true;
            that._closeByUser = false;
        });

        this._socket = primus;
    };

    WebChatClienteController.prototype.init = function () {
        var def = jQuery.Deferred();

        this._openWsConnection(function (result) {
            def.resolve(result);
        });

        return def.promise();
    };
	
    WebChatClienteController.prototype.logout = function()  {
        this._closeByUser = true;
        this._socket.end();
        this._primusmirroring.end();
    };

    window.WebChatClienteController = WebChatClienteController;
    
}(window.jQuery, window.Primus, window));