Ractive.DEBUG = false;


if(typeof FSWebChatIn ==='undefined' ){ FSWebChatIn = {}; }
FSWebChatIn._options = {};
FSWebChatIn._options.origin = '';
FSWebChatIn.chatUuid = null;
FSWebChatIn.chatId = null;
FSWebChatIn.sparkId = null;
FSWebChatIn.stringHash = null;
FSWebChatIn.UnsendMsg = {};
FSWebChatIn.fileUpLoad = null;
FSWebChatIn.isMirroring = false;
FSWebChatIn._statusvarofwcview = false;
FSWebChatIn.timeDiffms = 0;
FSWebChatIn._timestamp = +new Date();
FSWebChatIn.sound = new Audio('sounds/chat_sound.mp3');

FSWebChatIn.secondsToUpdateDates = 60;
FSWebChatIn.dialog_indexs = {};
FSWebChatIn.loginFields = [];

FSWebChatIn.fnShowBigAlert = function (type, title, message, icon, timeout, hidePreview) {
    if (hidePreview){ $('.SmallBox').remove(); }
    if(!timeout){timeout=4000;}

    FSWebChatIn.BigAlert.create({
        type: type, title: title, timeout: timeout, body: message, icon: icon
    });
};
FSWebChatIn.inIframe = function () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

FSWebChatIn.extendObject = function (obj, props) {
    for(var prop in props) {
        if(props.hasOwnProperty(prop)) {
            obj[prop] = props[prop];
        }
    }
    return true;
};

FSWebChatIn.storeBrowserPath = function (obj) {
    if(obj.url === FSWebChatIn.storage.get('lasturl') || '' ){
        if(FSWebChatIn.chatUuid!==null && FSWebChatIn.socketController){
            FSWebChatIn.sendBrowserVisitorPath();
        }
        return true;
    }
    FSWebChatIn.storage.add('lasturl',obj.url || '' );
    var array_path = FSWebChatIn.storage.get('path');
    if( array_path === null){
        FSWebChatIn.storage.add('path', JSON.stringify([obj]));
    }else{
        var array_path = JSON.parse(FSWebChatIn.storage.get('path'));
        var array_path_length = array_path.length;
        if(array_path_length>=1){
            array_path[array_path_length - 1].readingtime = obj.readingtime;
        }
        array_path.push(obj);
        FSWebChatIn.storage.add('path', JSON.stringify(array_path));  
    }
    if(FSWebChatIn.chatUuid!==null && FSWebChatIn.socketController){
         FSWebChatIn.sendBrowserVisitorPath();
    }
    
    return true;
};
/**IFRAME COMUNICATION INIT**/
FSWebChatIn.setActiveData = function () {
    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/update-state',
        data: {
            sparkId: FSWebChatIn.sparkId
        }
    });
};
FSWebChatIn.SetStatusVarWCView = function (obj) {
    FSWebChatIn._statusvarofwcview = obj.status || false;
};
FSWebChatIn.GetStatusVarWCView = function (){
    var _msg = {action:"GetStatusVarWCView"};
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};
FSWebChatIn.ResetStatusVarWCView = function (){
    var _msg = {action:"ResetStatusVarWCView"};
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};
FSWebChatIn.SetStatusVarWCInactivity = function (obj) {
    parent.postMessage({action:"SetStatusVarWCInactivity"},FSWebChatIn._options.origin);
};
FSWebChatIn.ResetClientDoInactivity = function () {
    if(FSWebChatIn.Chat !== undefined){
        FSWebChatIn.Chat.clientUnRegister('SetStatusVarWCInactivity');
    }
};

FSWebChatIn.ChangeStyleOfParent = function (_id,_json){
    var _msg = {action:"ChangeStyle",elem:_id||'',params:_json||{}};//JSON.stringify();
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};

FSWebChatIn.RemoveElementOfParent = function (_id){
    var _msg = {action:"RemoveElement",elem:_id||''};//JSON.stringify();
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};
FSWebChatIn.StartMirroring = function (){
    FSWebChatIn.isMirroring = true;
    FSWebChatIn.storage.add('isMirroring', FSWebChatIn.isMirroring);
    var _msg = {action:"StartMirroring"};
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};
FSWebChatIn.StopMirroring = function (){
    FSWebChatIn.isMirroring = false;
    FSWebChatIn.storage.add('isMirroring', FSWebChatIn.isMirroring);
    var _msg = {action:"StopMirroring"};
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};


FSWebChatIn.ShowHideElement = function (_id,_display){
    var _msg = {action:"ShowHideElement",elem:_id||'',display:_display||''};
    parent.postMessage(_msg,FSWebChatIn._options.origin);
};
FSWebChatIn.Mirroring = function (action,data){
    if(action==='send' && FSWebChatIn.socketController._primusmirroring!==undefined){
        FSWebChatIn.socketController._primusmirroring.write({action:'send',data:data});
    }
};
FSWebChatIn.GetClientBrowserURL = function (){
    parent.postMessage({action: 'GetClientBrowserURL'}, FSWebChatIn._options.origin);
};


function FSWebChatInhandleResponse(e) {
    if (e.data.action === 'setOrigin') {
        FSWebChatIn._options.origin = e.origin;
        if (Object.keys(e.data.params).length) {
            FSWebChatIn.extendObject(FSWebChatIn._options, e.data.params)
        }
        FSWebChatIn.init();
        FSWebChatIn.storage = new Storage();
        FSWebChatIn.GetStatusVarWCView();
    } else if (e.data.action === 'sendBrowserPath') {
        FSWebChatIn.storeBrowserPath(e.data.params);
    } else if (e.data.action === 'setActiveData') {
        FSWebChatIn.chatUuid && FSWebChatIn.setActiveData();
    } else if (e.data.action === 'SetStatusVarWCView') {
        FSWebChatIn.SetStatusVarWCView(e.data.params);
    } else if (e.data.action === 'ResetClientDoInactivity') {
        FSWebChatIn.ResetClientDoInactivity();
    } else if (e.data.action === 'Mirroring') {
        FSWebChatIn.Mirroring(e.data.subaction, e.data.params);
    } else if (e.data.action === 'setClientGeolocation') {
        FSWebChatIn.socketController && FSWebChatIn.sendBrowserLocation(e.data.params.data);
    } else if (e.data.action === 'Control:Open') {
        $('#fs-webchat').hasClass('closed') && $('#fs-webchat header').click();
    } else if (e.data.action === 'Control:Close') {
        $('#fs-webchat').hasClass('opened') && $('#fs-webchat header').click();
    } else if (e.data.action === 'Control:StopChat') {
        FSWebChatIn.Chat.clientUnRegister('UNREGISTER-TRIGGERED-BY-OWNER');
    }
}

(function () {
    if (FSWebChatIn.inIframe()) {
        /*window.onload = FSWebChatIn.iframeAjust;*/
    }
    function FSWebChatremoveEventHandler(elem,eventType,handler) {
        if (elem.removeEventListener) 
           elem.removeEventListener (eventType,handler,false);
        if (elem.detachEvent)
           elem.detachEvent ('on'+eventType,handler); 
    }
    function FSWebChataddEvent(elem, event, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(event, fn, false);
        } else {
            elem.attachEvent("on" + event, function() {
                // set the this pointer same as addEventListener when fn is called
                return(fn.call(elem, window.event));   
            });
        }
    }
    
    FSWebChatIn.event = ['message'];
    FSWebChatIn.event.forEach(function (elem, index, array) {
        if(elem==='message'){
            FSWebChatremoveEventHandler(window,elem, FSWebChatInhandleResponse, false);
            FSWebChataddEvent(window, elem, FSWebChatInhandleResponse )
        }
    });
    
}(FSWebChatIn));    
/**IFRAME COMUNICATION FINIT**/

$(document).ready(function () {
    $(window).bind( 'hashchange', function(e) { console.log('Iframe Page location',e); });
});


/**
 * Get webchat configs and start rendering the plugin.
 * 
 * @returns {unresolved}
 */
FSWebChatIn.init = function () {
    return $.getJSON(FSWebChatIn._options._server + '/webchats/configs/' + FSWebChatIn._options._hashkey).done(function (data) {
        for (var _set in data.data) {
            if (data.data[_set] === 'true' || data.data[_set] === 'false') {
                data.data[_set] = data.data[_set] === 'true';
            }
        }

        FSWebChatIn.loginFields = data.data.loginFields;
        FSWebChatIn.renderLoginScreen(FSWebChatIn.loginFields);

        FSWebChatIn._timestamp = +new Date();
        FSWebChatIn.Chat = new Chat(null, data.data);
    });
};

FSWebChatIn.renderLoginScreen = function(loginFields) {

    var loginScreenContainerElement = $('.form-login-message');
    var loginFieldElement           = function (field, label, required, searchable) {
        return  '<div class="form-group loginfields-group">'+
                    '<div class="col-xs-12">'+
                        '<label for="'+field+'"  class="col-xs-12" placeholder="'+label+'">'+label+'</label>'+
                        '<input data-contact-search="'+searchable+'" placeholder="'+label+'" type="text" id="'+field+'" class="form-control _loginfield-required-'+required+'">'+
                    '</div>'+
                '</div>';
    };
    if (loginFields && loginFields.length > 0) {
        loginFields.forEach(function (field) {
            var newField = loginFieldElement(field.field, field.label, field.require, field.searchable);
            loginScreenContainerElement.before(newField);
        });
    }
};

/**
 * Inits webchat socket.
 * 
 * @returns {boolean}
 */
FSWebChatIn.initSocket = function () {
    FSWebChatIn.socketController = new WebChatClienteController({hashkey: FSWebChatIn._options._hashkey, url: FSWebChatIn._options._server});

    return FSWebChatIn.socketController.init().then(function (data) {
        FSWebChatIn.sparkId = data.sparkId;
    });
};

FSWebChatIn.makeWebChatEvents = function(request){
    switch (request.action) {
        case 'FSwebchat:Server:SendMsg':
            FSWebChatIn.serverWebChatMsg(request);
            break;
        case 'FSwebchat:Server:UpdateMsg':
            FSWebChatIn.serverUpdateWebChatMsg(request);
            break;
        case 'FSwebchat:Server:StartMirroring':
            FSWebChatIn.StartMirroring();
            break;
        case 'FSwebchat:Server:StopMirroring':
            FSWebChatIn.StopMirroring();
            break;
        case 'FSwebchat:FileUpload:End':
            FSWebChatIn.Chat.dialog.updateEpisode(request.data.episode, request.data.old_timestamp);
            break;
        case 'FSwebchat:Server:UpdDialogConfig':
            FSWebChatIn.Chat.updateWebchatStatus(request.data.active);
            break;
        case 'FSwebchat:Server:ClientTimeExpire':
            FSWebChatIn.Chat.onTimeExpire(request.data, 60);
            break;
        case 'FSwebchat:Server:ContactChange':
            FSWebChatIn.Chat.onContactChange(request.data.new_contact_id, request.data.new_contact_name);
            break;
        case 'FSwebchat:Server:DialogGroup:Closed':
            FSWebChatIn.handleDialogGroupCloseByClient(request.data.actionDoneBy);
            break;
        case 'FSwebchat:Server:DialogGroup:Spam':
            FSWebChatIn.resetInterface();
            break;
        default:
            break;
    }
};

FSWebChatIn.serverWebChatMsg = function(request){
    if(request.data){
        if(request.data.episode){
            FSWebChatIn.Chat.dialog.pushEpisode(request.data.episode);
            FSWebChatIn.Chat.dialog.applyEpisodeEvt(request.data.episode);
            FSWebChatIn.confirmMsgReading(FSWebChatIn.chatUuid, request.data.episode.uuid);
        }
    }
};
FSWebChatIn.serverUpdateWebChatMsg = function(request){
    if(request.data){
        if(request.data.episode){
            FSWebChatIn.Chat.dialog.updateEpisode(request.data.episode);
        }
    }
};

/**
 * If the sparkId of the client that closed the conversation is different 
 * than the sparkId of this tab, we close the plugin.
 * 
 * @param {string} sparkId
 */
FSWebChatIn.handleDialogGroupCloseByClient = function (sparkId) {
    if (FSWebChatIn.sparkId !== sparkId) {
        FSWebChatIn.resetInterface();
    }
};

/**
 * Reset the interface.
 */
FSWebChatIn.resetInterface = function () {
    FSWebChatIn.Chat.clientUnRegister();
    FSWebChatIn.socketController.logout();
};

/**
 * Mark client dialog as read.
 * 
 * @param {string} dialogGroupUuid
 * @param {string} dialogUuid
 * @returns {jqXHR}
 */
FSWebChatIn.confirmMsgReading = function (dialogGroupUuid, dialogUuid) {
    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + dialogGroupUuid + '/mark-as-read',
        data: {
            dialogUuid: dialogUuid
        }
    });
};

/**
 * Send information to the server about the conversation currently open.
 * 
 * @param {function} callback
 * @returns {undefined}
 */
FSWebChatIn.reconnectedWebChatEvent = function (callback) {
    if (FSWebChatIn.chatUuid === null) {
        return;
    }

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/resume-session',
        data: {
            sparkId: FSWebChatIn.sparkId
        }
    }).done(function (result) {
        callback && callback();

        FSWebChatIn.sendUnsendMsg();
        FSWebChatIn.sendBrowserVisitorPath();
    }).fail(function (error) {
        FSWebChatIn.resetInterface();
    });
};

FSWebChatIn.sendUnsendMsg = function(){
    for( var _id in FSWebChatIn.UnsendMsg){
        FSWebChatIn.Chat.dialog.sendEpisodeServer(FSWebChatIn.UnsendMsg[_id]);
    }

    FSWebChatIn.Chat.dialog.getNewDialogsFromServer();
};

FSWebChatIn.sendBrowserInfo = function(){
    var browser = function () {
        var ua = navigator.userAgent, tem, browser = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(browser[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { "name": "Internet Explorer",  "version": tem[1] || ''};
        }

        if (browser[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) {
                return { "name": "Opera",  "version": tem[1] };
            }
        }
        browser = (browser[2] ? [browser[1], browser[2]] : [navigator.appName, navigator.appVersion, '-?']);

        if ((tem = ua.match(/version\/[(\d+)\.]+/i)) != null) {
            browser.splice(1, 1, tem[1]);
        }
        //Full browser version
        if ((tem = ua.match(new RegExp(browser[0] + "\\/[(\\d+)\\.]+", "i"))) != null) {
            var version = tem[0].split("/")[1];
            browser.splice(1, 1, version)
        }

        return { "name": browser[0],  "version": browser[1] };
    }();

    var browserInfo = {
        appcodename : navigator.appCodeName,
        appname     : browser.name,
        appversion  : browser.version,
        language    : navigator.language,
        platform    : navigator.platform,
        product     : navigator.product,
        useragent   : navigator.userAgent,
        vendor      : navigator.vendor
    };

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/browser-info',
        data: {
            browserInfo: browserInfo
        }
    });
};

FSWebChatIn.requestBrowserLocation = function(){
    parent.postMessage({action: 'getClientGeolocation'}, FSWebChatIn._options.origin);
};

FSWebChatIn.sendBrowserLocation = function(browser_data){
    var data = {};

    function sendLocation() {
        return $.ajax({
            type: 'POST',
            url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/client-location',
            data: {
                clientLocation: data
            }
        });
    }

    function getValue(values, key, name) {
        for (var i = 0, len = values.length; i < len; i++) {
            var value = values[i];
            if (value.types.indexOf(key) > -1) {
                return value[name];
            }
        }
        return '';
    }

    $.getJSON('https://freegeoip.net/json/', function(response) {
        data = {
            ip: response.ip,
            address: '',
            country_code: response.country_code,
            country_name: response.country_name,
            region_code: response.region_code,
            region_name: response.region_name,
            city: response.city,
            zip_code: response.zip_code,
            time_zone: response.time_zone,
            latitude: response.latitude,
            longitude: response.longitude,
            metro_code: 0
        };

        if (browser_data) {
            $.ajax({
                url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + browser_data.latitude + ',' + browser_data.longitude,
                error: function (error) {
                    sendLocation();
                },
                success: function (response) {
                    if (response.status === 'OK') {
                        var results = response.results[0], address = results.address_components;
                        data = $.extend(data, {
                            address: results.formatted_address,
                            city: getValue(address, 'locality', 'long_name'),
                            zip_code: getValue(address, 'postal_code', 'long_name'),
                            latitude: browser_data.latitude,
                            longitude: browser_data.longitude
                        });
                    }
                    sendLocation();
                }
            });
        } else {
            sendLocation();
        }
    });
};

FSWebChatIn.sendBrowserVisitorPath = function () {
    var _path = FSWebChatIn.storage.get('path');

    if (_path === null) {
        return;
    }

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/visitor-path',
        data: {
            visitorPath: JSON.parse(_path)
        }
    }).then(function (response) {
        if (response.error) {
            return FSWebChatIn.storage.add('path', JSON.stringify(_path));
        }

        FSWebChatIn.storage.remove('path');
    });
};

FSWebChatIn.sHash = function() {
    if(FSWebChatIn._options.origin===''){return FSWebChatIn.stringHash=null;}
    if(FSWebChatIn.stringHash){ return FSWebChatIn.stringHash;}
    var hash = 5381, i = FSWebChatIn._options.origin.length;
    while(i){
        hash = (hash * 33) ^ FSWebChatIn._options.origin.charCodeAt(--i)
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed integers. Since we want the results to be always positive, convert the signed int to an unsigned by doing an unsigned bitshift. */
    FSWebChatIn.stringHash = hash >>> 0;
    return FSWebChatIn.stringHash;
}
FSWebChatIn.overdecryptmsg = function (_this){
    var $this = $(_this);
    $this.data('estrelinhas',$this.text());
    $this.text(String.fromCharCode.apply(null, atob(decodeURIComponent($this.data('text'))).split(':')));
};
FSWebChatIn.leavedecryptmsg = function (_this){
    var $this = $(_this);
    $this.text($this.data('estrelinhas'));
};
/******************************************************************************/
var Storage = function () {
    this.setStorage(this.detectStorage());
};

Storage.prototype.get = function (key) {
    return this.storage.getItem('fswebchat.' + FSWebChatIn.sHash() + '.' + key);
};

Storage.prototype.add = function (key, val) {
    this.storage.setItem('fswebchat.' + FSWebChatIn.sHash() + '.' + key, val);
};

Storage.prototype.remove = function () {
    for (var arg in arguments) {
        this.storage.removeItem('fswebchat.' + FSWebChatIn.sHash() + '.' + arguments[arg]);
    }
    FSWebChatIn.stringHash = null;
};

Storage.prototype.clear = function () {
    this.storage.clear();
};

Storage.prototype.detectStorage = function () {
    var a = sessionStorage.getItem('fswebchat.' + FSWebChatIn.sHash() + '.storage');
    var b = localStorage.getItem('fswebchat.' + FSWebChatIn.sHash() + '.storage');
    return a || b || 'local';
};

Storage.prototype.setStorage = function (type) {
    var obj = {};

    if (this.storage) {
        for (var el in this.storage) {
            var k = el.split('fswebchat.' + FSWebChatIn.sHash() + '.')[1];

            if (this.storage.hasOwnProperty(el)) {
                obj[k] = this.storage[el];
            }
        }

        this.clear();
    }

    if (type === 'session') {
        this.storage = sessionStorage;
    } else if (type === 'local') {
        this.storage = localStorage;
    } else {
        throw 'Invalid Storage.';
    }

    for (var el in obj) {
        this.add(el, obj[el]);
    }

    this.add('storage', type);
};

/******************************************************************************/
var Chat = function (options, configs) {
    this.dialog = null;
    this.elements = {};
    this.configs = configs;
    this.isOnline();
    FSWebChatIn.chatUuid = null;
    FSWebChatIn.stringHash = null;
};

Chat.SIZE = Object.freeze({
    "SMALL": "340px",
    "MEDIUM": "400px",
    "LARGE": "500px"
});

Chat.POSITION = Object.freeze({
    "BOTTOM-RIGHT": { "vertical": "bottom", "horizontal": "right"},
    "BOTTOM-LEFT": { "vertical": "bottom", "horizontal": "left"},
    "TOP-RIGHT": { "vertical": "top", "horizontal": "right"},
    "TOP-LEFT": { "vertical": "top", "horizontal": "left"}
});

Chat.prototype.Render = function () {  
    this.applyConfigs();
    this.applyEvents();
    this.checkChatState();

    var lang = FSWebChatIn.storage.get('lang') || this.configs.default_lang || 'en';
    this.loadLanguagesSelect(lang);
};

Chat.prototype.isOnline = function () {
    var that = this;

    return $.getJSON(FSWebChatIn._options._server + '/webchats/schedule/' + FSWebChatIn._options._hashkey).done(function (data) {
        that.online = data.online;
        that.Render();
    });
};

/**
 * Update the interface when the server status changes.
 * 
 * @param {boolean} is_online
 * @param {boolean} connection_lost
 * @returns {undefined}
 */
Chat.prototype.updateWebchatStatus = function (is_online, connection_lost) {
    var lost_element = $('#fs-webchat #infoLostServerConnection').hide();

    $('#fs-webchat .main-dialog').get(0).style.display = '';
    $('#fs-webchat .main-offline').get(0).style.display = '';

    if (is_online === true) {
        return this.goOnline();
    }

    if (is_online === false) {
        connection_lost && lost_element.show();

        return this.goOffline(connection_lost);
    }
};

Chat.prototype.applyConfigs = function () {
    var $webchat = $('#fs-webchat');
    var position = Chat.POSITION[this.configs.position].horizontal;

    $("head").append('<link rel="stylesheet" href="css/webchat-' + (this.configs.theme_name || 'theme-blue') + '.css">');

    if (this.configs.webchat_custom_theme && this.configs.webchat_custom_theme.active === "true") {
            $("head").append('<link rel="stylesheet" href="' + (this.configs.webchat_custom_theme.file.filePath) + '">');
    }

    var _styles = {"position": 'fixed', "bottom": '-410px', "zIndex": '9999999999', "display": 'block', "height": '450px', "transition": 'all linear 0.20s'};

    _styles[position] = '20px';
    _styles['width'] = Chat.SIZE[this.configs.size];

    $webchat.find('header').css('background-color', this.configs.color);
    $webchat.find('header .client-title').html(this.configs.title || 'Chat');

    FSWebChatIn.ChangeStyleOfParent('fs_webchat_container', _styles);
    FSWebChatIn.ChangeStyleOfParent('iframe_webchat_container', {"width": '100%', "height": '100%', "border": 'none', 'border-radius': '10px 10px 0 0', '-webkit-box-shadow': '0 0 10px #555', 'box-shadow': '0 0 10px #555'});
    $webchat.addClass('offline show-off-form');

    if (this.online) {
        $webchat.removeClass('offline').addClass('online neutral');
    } else {
        this.configs.show_chat_offline ? $webchat.addClass('offline show-off-form') : this.changeChatVisibility(this.configs.show_chat_offline)/*this.removeChat()*/;
    }

    var list_options = $('.chat-dialog-box .list-options-box li');
    list_options.filter('[data-action="send-file"]').toggle(this.configs.allow_send_files);
    list_options.filter('[data-action="rate-chat"]').toggle(this.configs.allow_self_rating);
    list_options.filter('[data-action="send-email"]').toggle(this.configs.allow_send_email && this.configs.mailbox_integration_contact_request);
    list_options.filter('[data-action="sound-alert"]').toggle(this.configs.notification_sound);
    list_options.filter('[data-action="chat-id"]').toggle(this.configs.show_chat_id);

    if (FSWebChatIn.storage.detectStorage() === 'session') {
        $('.chat-dialog-box .list-options-box li[data-action="private-mode"] input').click();
    }

    if (FSWebChatIn.storage.get('sound') === 'true') {
        $('.chat-dialog-box .list-options-box li[data-action="sound-alert"] input').click();
    }
};

Chat.prototype.applyEvents = function () {
    var $webchat = $("#fs-webchat");
    $webchat.find('header').on('click', function (e) {
        e.stopPropagation();
        if ($webchat.hasClass('closed')) {
            $webchat.toggleClass('closed opened');
            $webchat.find('.new-messages').html('');
            /*this.elements.main_container.css({bottom: '0'});*/
            FSWebChatIn.ChangeStyleOfParent('fs_webchat_container', {"bottom": '0'});
            $webchat.find('header span[data-when="online"] span').last().hide();
            FSWebChatIn.storage.add('state', 'open');
        }else if ($webchat.hasClass('opened')){
            $('#fs-webchat').toggleClass('closed opened');
            /*this.elements.main_container.css({bottom: '-410px'});*/
            FSWebChatIn.ChangeStyleOfParent('fs_webchat_container', { "bottom": '-410px'});

            FSWebChatIn.Chat.dialog && $webchat.find('header span[data-when="online"] span').last().show();
            FSWebChatIn.storage.add('state', 'close');
        }
    }.bind(this));

    $('.chat-dialog-box .options-box li[data-action="options-list"]').on('click', function () {
        $('.chat-dialog-box .list-options-box').toggleClass('active');
        $('.chat-dialog-box').toggleClass('list-options-box-active');
    });

    $('.chat-dialog-box .dialog-box').on('click', '.btn-request-rate', function () {
        $('.chat-dialog-box .list-options-box .op[data-action="rate-chat"]').click();
    });

    $('#btn-start-dialog, #btn-submit-message').on('click', this.onUserDataSubmit.bind(this));
    $('.chat-dialog-box .list-options-box .op:not(.no-select)').on('click', this.onOptionClick.bind(this));
    $('#file-upload').on('change', this.onFileUpload.bind(this));
    $('.chat-dialog-box .rating-box .stars-box span').on('click', this.onStarClick);
    $('.chat-dialog-box .rating-box .btns button').on('click', this.onRateButtonClick.bind(this));
    $('.chat-dialog-box .change-name-box .btns button').on('click', this.onChangeNameButtonClick.bind(this));
    $('.chat-dialog-box .message-box textarea').on('focus', FSWebChatIn.GetStatusVarWCView);
    $('.chat-dialog-box .message-box textarea').on('keypress', this.onMessageWrite.bind(this));
    $(document).on('dialog-change', this.onDialogChange.bind(this));
    $('.rating-box .stars-box').on('stars-change', this.checkRateInput);
    $('.rating-box .comment-box textarea').on('keyup', this.checkRateInput);
    $('.change-name-box #change-name-new').on('keyup', this.checkNewNameInput);

    $('.chat-dialog-box .list-options-box, .list-options-box .op label input, .list-options-box .op label select').on('click', function (e) {
        e.stopPropagation();
    });

    $('body').on('click', function (e) {
        var opt = $('.chat-dialog-box .options-box li[data-action="options-list"]')[0];
        if (e.target === opt || opt.contains(e.target)) {
            return;
        }

        $('.chat-dialog-box .list-options-box').removeClass('active');
        $('.chat-dialog-box').removeClass('list-options-box-active');
    });
    
    $('.chat-dialog-box .end-actions-box .btns button').on('click', this.onEndActionButtonClick.bind(this));
    
    $('.chat-dialog-box .list-options-box li[data-action="private-mode"] input').on('change', function () {
        $(this).is(":checked") ? FSWebChatIn.storage.setStorage('session') : FSWebChatIn.storage.setStorage('local');
    });
    
    $('.chat-dialog-box .list-options-box li[data-action="sound-alert"] input').on('change', function () {
        FSWebChatIn.storage.add('sound', $(this).is(":checked"));
    });
    
    if(this.configs['start_chat_withoutmsg']!==undefined && this.configs['start_chat_withoutmsg']){
        $('div#WCdivForInitMessage').hide();
    }
};

/**
 * Checks is there is an active chat to recover.
 * 
 * @returns {promise}
 */
Chat.prototype.checkChatState = function () {
    FSWebChatIn.chatUuid = FSWebChatIn.storage.get('uuid');
    FSWebChatIn.chatId = FSWebChatIn.storage.get('chat_id');
    FSWebChatIn.isMirroring = JSON.parse(FSWebChatIn.storage.get('isMirroring')) || false;

    var that = this;
    var chat_dialog = JSON.parse(FSWebChatIn.storage.get('dialog'));

    if (FSWebChatIn.chatUuid && chat_dialog) {

        FSWebChatIn.loading = true;

        return $.when(FSWebChatIn.initSocket()).then(function () {
            FSWebChatIn.reconnectedWebChatEvent(function () {
                FSWebChatIn.loading = false;

                that.reloadComponent(chat_dialog);
            });
        });
    }
};

/**
 * Reloads the component.
 * 
 * @param {object} chat_dialog
 * @returns {undefined}
 */
Chat.prototype.reloadComponent = function (chat_dialog) {
    var state = FSWebChatIn.storage.get('state');
    var on_expire = JSON.parse(FSWebChatIn.storage.get('on-expire')) || false;

    this.updateWebchatStatus(this.online);
    this.setChatID();
    $('#fs-webchat').addClass('loading');

    state === 'open' && $('#fs-webchat header').click();
    state === 'close' && $('header span[data-when="online"] span').last().show();
    $('.main-dialog > div').toggleClass('active');

    this.dialog = new Dialog(chat_dialog.name, chat_dialog.email);
    this.dialog.restoreEpisodes(chat_dialog.episodes);

    setTimeout(function () {
        $('#fs-webchat').removeClass('loading');
        if (FSWebChatIn.isMirroring === true) {
            FSWebChatIn.StartMirroring();
        }
    }, 600);

    if (on_expire) {
        var diff = Math.round((Date.now() - on_expire.timestamp) / 1000);
        var sec = diff < 60 ? 60 - diff : 0;
        FSWebChatIn.Chat.onTimeExpire({expire_reason: on_expire.reason}, sec);
    }
};

Chat.prototype.removeChat = function () {
    FSWebChatIn.RemoveElementOfParent('fs_webchat_container');
};

Chat.prototype.changeChatVisibility = function (display) {
    display=display===true?'block':'none';
    FSWebChatIn.ShowHideElement('fs_webchat_container',display);
};

Chat.prototype.onUserDataSubmit = function (e) {
    var that = this;

    if ($(e.target).hasClass('disabled') || FSWebChatIn.chatUuid) {
        return;
    }

    $(e.target).addClass('disabled');

    var id = $(e.target).attr('id');
    var x = id === 'btn-start-dialog' ? 'on' : 'off';
    var obj = {};

    obj.name = $('#' + x + '-name').val();
    obj.email = $('#' + x + '-email').val();

    if ($('#' + x + '-message').is(':visible')) {
        obj.message = $('#' + x + '-message').val();
    }

    var reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    obj.email = reg.test(obj.email) ? obj.email : '';

    this.validateLoginFields(reg);

    for (var p in obj) {
        $('#' + x + '-' + p).parent().parent().toggleClass('has-error', obj[p] === '');
    }

    if ($('#' + id).parent().parent().find('.has-error').length > 0) {
        return $(e.target).removeClass('disabled');
    }

    if (id === 'btn-start-dialog') {
        return $.when(FSWebChatIn.initSocket()).then(function () {
            if (that.hasLoginFields()) {
                obj = that.buidContactObjFromLoginFields(obj);
            }

            that.initDialog(obj).then(function () {
                $(e.target).removeClass('disabled');
            });
        });
    }

    if (id === 'btn-submit-message') {
        return that.submitOfflineMessage(obj).then(function () {
            $(e.target).removeClass('disabled');
        });
    }
};
/**
 * Build contact to be sent from choosen login fields
 * @param objOrig
 * @returns {{searchable: {param: (*|jQuery), value: (*|jQuery)}, loginFields: (Array|*), message}}
 */
Chat.prototype.buidContactObjFromLoginFields = function(objOrig) {
    for (var key in FSWebChatIn.loginFields) {
        FSWebChatIn.loginFields[key].value =  $('#'+FSWebChatIn.loginFields[key].field).val();
    }

    var obj = {
        searchable: {
            param: $('input[data-contact-search="true"]').val(),
            value: $('input[data-contact-search="true"]').attr('id')
        },
        loginFields: FSWebChatIn.loginFields,
        message: objOrig.message
    };
    return obj;
};

/**
 * Checks if we have login fields setted on html
 * @returns {number|jQuery}
 */
Chat.prototype.hasLoginFields = function () {
    return $(".loginfields-group").length;
};

/**
 * Validate login fields for submission
 * @param reg
 */
Chat.prototype.validateLoginFields = function(reg) {

    $('input').each(function() {
        $(this).parent().toggleClass('has-error', false);
    });

    $('._loginfield-required-true').each(function() {
        var element = $(this);
        if (element.is('#email') && !reg.test(element.val())) {
            return $(this).parent().toggleClass('has-error', true);
        }

        if (element.val() === '') {
            $(this).parent().toggleClass('has-error', true);
        }
    });
};

Chat.prototype.submitOfflineMessage = function (data) {
    var that = this;
    var body = {hashkey: FSWebChatIn._options._hashkey, contact_email: data.email, contact_name: data.name, message: data.message};

    return $.post(FSWebChatIn._options._server + '/dialogs/offline-message', body).done(function (result) {
        var str_obj = that.getLangObj().main;

        if (result.error || (result.data !== undefined && result.data.id === undefined)) {
            return FSWebChatIn.fnShowBigAlert('invalid', str_obj.ticket_title_error, str_obj.ticket_msg_error, null, 4000, true);
        }

        $('#off-name, #off-email, #off-message').val('');
        FSWebChatIn.fnShowBigAlert('valid', str_obj.ticket_title_success, str_obj.ticket_msg_success + result.data.id, null, 10000, true);
    });
};

Chat.prototype.setChatID = function () {
    $('.chat-dialog-box .list-options-box li[data-action="chat-id"] label').html(FSWebChatIn.chatId);
};

Chat.prototype.initDialog = function (data) {
    var that = this;

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/new-dialog-group',
        data: {
            sparkId: FSWebChatIn.sparkId,
            originPath: FSWebChatIn._options.originPath,
            loginFields: data.loginFields
        }
    }).then(function (result) {
        FSWebChatIn.chatUuid = result.dialogGroupUuid;
        FSWebChatIn.chatId = result.dialogGroupId;
        FSWebChatIn.requestBrowserLocation();
        FSWebChatIn.sendBrowserInfo();
        FSWebChatIn.sendBrowserVisitorPath();

        that.setChatID();
        that.startDialog(data);
    }).fail(function (error) {
        if (error.responseJSON.message === 'WEBCHAT_STATUS_OFFLINE') {
            var lang = that.getLangObj().main;

            FSWebChatIn.fnShowBigAlert('invalid', lang.status_offline_title, lang.status_offline_msg, null);
            FSWebChatIn.resetInterface();
        }
    });
};

/**
 * When the server confirms the client JOIN, we send the first message.
 * 
 * @param {object} evt
 * @param {object} data
 * @returns {undefined}
 */
Chat.prototype.onJoinResponse = function (evt, data) {
    if (data.type === 'update-episode' && data.episode.msgtype === 'JOIN' && data.episode.usertype === 'CLIENT') {
        FSWebChatIn.Chat.dialog.newMessage(FSWebChatIn.Chat.newMessage);

        $(document).off('dialog-change', FSWebChatIn.Chat.onJoinResponse);
    }
};

Chat.prototype.startDialog = function (data) {
    $('.main-dialog > div').toggleClass('active');

    if (data.message) {
        this.newMessage = data.message;
        $(document).on('dialog-change', this.onJoinResponse);
    }

    this.dialog = new Dialog(data.name, data.email);
    this.dialog.start();
};

/**
 * Requests an email to client with the conversation.
 * 
 * @returns {jqXHR}
 */
Chat.prototype.sendEmail = function () {
    var dialogGroupUuid = FSWebChatIn.chatUuid;
    var language        = $('.chat-dialog-box .list-options-box li[data-action="change-lang"] select').val();

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + dialogGroupUuid + '/request-email',
        data: {
            language: language
        }
    });
};

Chat.prototype.onOptionClick = function (e) {
    var action = $(e.currentTarget).attr('data-action');

    switch (action) {
        case 'send-email':
            this.sendEmail();
            break;
        case 'send-file':
            $('#file-upload').click();
            break;
        case 'rate-chat':
            $('.rating-box').toggleClass('active');
            $('.rating-box .stars-box span.active').removeClass('active');
            $('.rating-box .comment-box textarea').val('');
            $('#rate-send').addClass('disabled');
            break;
        case 'end-dialog':
            this.dialog.stop();
            $('.end-actions-box').toggleClass('active');
            $('#fs-webchat header, .options-box ul li').addClass('disabled');
            break;
        case 'sound-alert':
            $(e.currentTarget).find('input').click();
            break;
        case 'private-mode':
            $(e.currentTarget).find('input').click();
            break;
        case 'change-name':
            $('.change-name-box').toggleClass('active');
            $('.change-name-box #change-name-current').html(FSWebChatIn.Chat.dialog.name);
            $('.change-name-box #change-name-new').val('');
            $('#change-name-ok').addClass('disabled');
            break;
    }

    $('.chat-dialog-box .list-options-box').removeClass('active');
    $('.chat-dialog-box').removeClass('list-options-box-active');
};

Chat.prototype.isSoundEnabled = function () {
    return $('.chat-dialog-box .list-options-box .op[data-action="sound-alert"] label input').prop('checked');
};

Chat.prototype.onFileUpload = function (e) {
    var file = e.target.files[0];
    var obj = {filename: file.name, size: file.size, mimetype: file.type, url: null, filestatus: null};
    var file_extension = file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2);

    FSWebChatIn.fileUpLoad = null;
    FSWebChatIn.Chat.dialog.newFile(obj);
    $(e.target).val('');
    
    var size_limit = this.configs.allow_send_files_options.size_limit, size_limit_mb = (size_limit / 1024 / 1024).toFixed(1);
    var allowed_extensions = this.configs.allow_send_files_options.allowed_extensions;

    if (file.size > size_limit || allowed_extensions.indexOf(file_extension.toLowerCase()) === -1) {
        var str_obj = this.getLangObj().main, msg = '';

        if (file.size > size_limit) {
            msg = str_obj.file_upload_error_size + ' (' + size_limit_mb + ' MB)';
        } else {
            msg = str_obj.file_upload_error_ext + ' (' + allowed_extensions.join(', ') + ')';
        }

        $('.error-message').addClass('active').find('p').html(msg);

        setTimeout(function () {
            $('.error-message').removeClass('active').find('p').html('');
        }, 5000);

        return;
    }

    FSWebChatIn.fileUpLoad = file;
};

/**
 * Uploads the current selected file.
 * 
 * @param {object} episode
 * @returns {xhr}
 */
Chat.prototype.uploadCurrentFile = function (episode) {
    var formData = new FormData();
    formData.append('file', FSWebChatIn.fileUpLoad);
    formData.append('chat_uuid', FSWebChatIn.chatUuid);
    formData.append('dialog_uuid', episode.uuid);

    return $.ajax({
        type: "POST", url: FSWebChatIn._options._server + '/upload',
        data: formData, cache: false, contentType: false, processData: false
    });
};

Chat.prototype.onStarClick = function () {
    if ($(this).hasClass('active') && !$(this).next().hasClass('active')) {
        $(this).parent().children().removeClass('active');
    } else {
        var rating = +$(this).attr('data-rating');
        $(this).parent().children().each(function (index, el) {
            $(this).toggleClass('active', +$(el).attr('data-rating') <= rating);
        });
    }

    $('.rating-box .stars-box').trigger('stars-change');
};

Chat.prototype.onRateButtonClick = function (e) {
    if ($(e.target).hasClass('disabled')) {
        return;
    }

    if ($(e.target).attr('id') === 'rate-send') {
        var rating = $('.rating-box .stars-box span.active').length;
        var comment = $('.rating-box .comment-box textarea').val().trim();

        rating !== 0 && this.dialog.newRating(rating);
        comment !== '' && this.dialog.newComment(comment);
    }

    $('.rating-box').toggleClass('active');
};

Chat.prototype.onEndActionButtonClick = function (e) {
    if ($(e.target).attr('id') === 'end-actions-resume') {
        this.dialog.start();
    } else if ($(e.target).attr('id') === 'end-actions-close') {
        this.clientUnRegister('MANUAL-UNREGISTER');
        this.closeWebchat();
    }

    $('.end-actions-box').toggleClass('active');
    $('#fs-webchat header , .options-box ul li').removeClass('disabled');    
};

Chat.prototype.checkRateInput = function () {
    var rating = $('.rating-box .stars-box span.active').length;
    var comment = $('.rating-box .comment-box textarea').val().trim();
    $('#rate-send').toggleClass('disabled', rating === 0 && comment === '');
};

Chat.prototype.onChangeNameButtonClick = function (e) {
    if ($(e.target).hasClass('disabled')) {
        return;
    }

    if ($(e.target).attr('id') === 'change-name-ok') {
        var new_name = $('.change-name-box #change-name-new').val().trim();
        new_name !== '' && FSWebChatIn.Chat.dialog.setNewName(FSWebChatIn.chatUuid, new_name);
    }

    $('.change-name-box').toggleClass('active');
};

Chat.prototype.checkNewNameInput = function () {
    var new_name = $(this).val().trim();
    $('#change-name-ok').toggleClass('disabled', new_name === '');
};

Chat.prototype.onMessageWrite = function (e) {
    if (e.which === 13) {
        e.preventDefault();

        var v = $(e.target).val();
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(v));
        v = div.innerHTML;

        if (v.trim() === '') {
            return;
        }

        $(e.target).val('');
        this.dialog.newMessage(v);
    }
};

Chat.prototype.onTimeExpire = function (expire_data, expire_delay) {
    if (FSWebChatIn.expire_int) {
        return;
    }

    var that = this;
    var box = $('.time-expire-box'), options = $('.options-box ul li'), span = box.find('#time-to-close').html(expire_delay);
    var close_btn = box.find('#time-expire-close'), resume_btn = box.find('#time-expire-resume');

    var tim = function () {
        var val = +span.html();
        val === 0 ? close_btn.trigger('click', {mode: 'auto'}) : span.html(--val);
    };

    FSWebChatIn.expire_int = setInterval(tim, 1000);

    if (!FSWebChatIn.storage.get('on-expire')) {
        FSWebChatIn.storage.add('on-expire', JSON.stringify({reason: expire_data.expire_reason, timestamp: Date.now()}));
    }

    box.toggleClass('active');
    options.addClass('disabled');

    resume_btn.off().on('click', function () {
        clearInterval(FSWebChatIn.expire_int);
        FSWebChatIn.expire_int = null;
        box.toggleClass('active');
        options.removeClass('disabled');
        FSWebChatIn.storage.remove('on-expire');

        $.ajax({
            type: 'POST',
            url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/reregister-client'
        }).then(function (result) {
            FSWebChatIn.Chat.dialog.getNewDialogsFromServer();
        });
    });

    close_btn.off().on('click', function (evt, data) {
        clearInterval(FSWebChatIn.expire_int);
        FSWebChatIn.expire_int = null;
        box.toggleClass('active');
        that.clientUnRegister(expire_data.expire_reason);

        if (data && data.mode === 'auto') {
            var bx = $('.user-data-box, .chat-dialog-box, .time-expire-autoclose-box').toggleClass('active');

            $('.time-expire-autoclose-box #time-expire-autoclose-ok').off().on('click', function () {
                bx.toggleClass('active');
                options.removeClass('disabled');
            });
        } else {
            options.removeClass('disabled');
        }
    });
};

Chat.prototype.onDialogChange = function (evt, data) {
    var msgs_box = $('.chat-dialog-box .dialog-box ul');

    if (data.type === 'start' || data.type === 'stop' || data.type === 'update-episode' || data.type === 'new-episode') {
        FSWebChatIn.storage.add('dialog', JSON.stringify(this.dialog.getObject()));
        FSWebChatIn.storage.add('isMirroring', FSWebChatIn.isMirroring);
    }

    switch (data.type) {
        case 'start':
            FSWebChatIn.storage.add('uuid', FSWebChatIn.chatUuid);
            FSWebChatIn.storage.add('chat_id', FSWebChatIn.chatId);
            break;
        case 'stop':
            //this.dialog = null;
            break;
        case 'restore-episodes':
        case 'reset':
            msgs_box.scrollTop(msgs_box[0].scrollHeight);
            break;
        case 'update-episode':
            break;
        case 'new-episode':
            msgs_box.scrollTop(msgs_box[0].scrollHeight);

            if (data.episode.usertype === 'AGENT') {
                this.isSoundEnabled() && FSWebChatIn.sound.play();
                
                if ($('#fs-webchat').hasClass('closed')) {
                    var new_msg = $('#fs-webchat .new-messages').html() || 0;
                    $('#fs-webchat .new-messages').html(++new_msg);
                }
            }
            break;
    }
};

Chat.prototype.clientUnRegister = function (type) {
    if ($('.chat-dialog-box').hasClass('active')) {
        $('.main-dialog > div').toggleClass('active');
    }

    $('.dialog-box ul').empty();

    if (this.dialog) {
        this.dialog.stopTimerUpdateDates();
        this.dialog = null;
        $('header span[data-when="online"] span').last().hide();
    }

    if (type && type !== 'SetStatusVarWCInactivity') {
        $.ajax({
            type: 'POST',
            url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/client-unregister',
            data: {
                closeType: type
            }
        }).then(function (result) {
            FSWebChatIn.socketController = null;
        });

        FSWebChatIn.SetStatusVarWCInactivity();
    }

    FSWebChatIn.storage.remove('dialog', 'uuid', 'chat_id', 'lastpathtime', 'lasturl', 'path', 'isMirroring', 'on-expire');
    $('.loginfields-group input, #on-message, #off-name, #off-email, #off-message').val('');

    FSWebChatIn.ResetStatusVarWCView();

    
    FSWebChatIn.chatUuid = null;
    FSWebChatIn.UnsendMsg = {};
    FSWebChatIn._timestamp = +new Date();

    FSWebChatIn.GetClientBrowserURL();
    this.updateWebchatStatus(this.online);
};

Chat.prototype.closeWebchat = function () {
    $('#fs-webchat header').click();
};

Chat.prototype.goOffline = function (connection_lost) {
    this.online = false;

    if ($('#fs-webchat').find('.main-dialog .dialog-box ul li').length > 0 || connection_lost) {
        $('#fs-webchat .main-dialog').show();
        $('#fs-webchat .main-offline').hide();
        return;
    }

    this.changeChatVisibility(this.configs.show_chat_offline);
};

Chat.prototype.goOnline = function () {
    $('#fs-webchat').removeClass('offline').addClass('neutral');
    this.changeChatVisibility(true);
    this.online = true;
};

Chat.prototype.loadLanguagesSelect = function (lang) {
    var that = this, bool = false;
    var select = $('.chat-dialog-box .list-options-box li[data-action="change-lang"] select');

    for (var l in FSWebChatIn.lang) {
        select.append('<option value="' + l + '">' + FSWebChatIn.lang[l].definition + '</option>');
    }

    select.on('change', function () {
        that.loadLang($(this).val());
        bool && that.notifyLanguageChange(FSWebChatIn.chatUuid, $(this).find('option:selected').html());
        bool = true;
    }).val(lang).change();
};

Chat.prototype.loadLang = function (lang) {
    FSWebChatIn.storage.add('lang', lang);
    moment.locale(lang);

    $('*[data-translate]').each(function (idx, el) {
        var key = $(el).attr('data-translate');
        $(el).html(FSWebChatIn.lang[lang].main[key]);
    });

    $('*[data-translate-placeholder]').each(function (idx, el) {
        var key = $(el).attr('data-translate-placeholder');
        $(el).prop('placeholder', FSWebChatIn.lang[lang].main[key]);
    });

    $('*[data-translate-title]').each(function (idx, el) {
        var key = $(el).attr('data-translate-title');
        $(el).prop('title', FSWebChatIn.lang[lang].main[key]);
    });

    FSWebChatIn.Chat.dialog && FSWebChatIn.Chat.dialog.ractive.set('lang', FSWebChatIn.lang[lang].ractive);
};

Chat.prototype.getLangObj = function () {
    var lang = FSWebChatIn.storage.get('lang');
    return FSWebChatIn.lang[lang];
};

/**
 * Notify the server about language change.
 * 
 * @param {string} dialogGroupUuid
 * @param {string} newLanguage
 * @returns {jqXHR}
 */
Chat.prototype.notifyLanguageChange = function (dialogGroupUuid, newLanguage) {
    return $.ajax({
        type: 'PUT',
        url: FSWebChatIn._options._server + '/dialogs/' + dialogGroupUuid + '/language-change',
        data: {
            newLanguage: newLanguage
        }
    });
};

Chat.prototype.onContactChange = function (new_contact_id, new_contact_name) {
    this.dialog.name = new_contact_name;
};

var Dialog = function (name, email) {
    this.episodes = [];

    this.name = name;
    this.email = email;

    this.ractive = new Ractive({
        el: '.chat-dialog-box > .dialog-box > ul',
        template: '#templates',
        data: {
            lang: FSWebChatIn.Chat.getLangObj().ractive,
            episodes: this.episodes,
            formatSize: this.formatSize,
            formatTimeEllapsed: this.formatTimeEllapsed,
            formatRating: this.formatRating,
            getImage: this.getImage,
            changeImgPrivate:this.changeImgPrivate,
            msgparser: this.msgparser
        }
    });

    this.ractive.observe( 'episodes.*', function ( new_row, old_row, keypath, id ) {
        if(new_row!==undefined && old_row===undefined){/*insert*/
            if(new_row.uuid!==null){
                delete FSWebChatIn.dialog_indexs[new_row.timestamp];
                FSWebChatIn.dialog_indexs[new_row.uuid]=id;
            }else{
                FSWebChatIn.dialog_indexs[new_row.timestamp]=id;
            }
        }else if(new_row===undefined && old_row!==undefined){/*delete*/
            if(old_row.uuid!==null){
                delete FSWebChatIn.dialog_indexs[old_row.uuid];
            }else{
                delete FSWebChatIn.dialog_indexs[old_row.timestamp];
            }
        }else if(new_row!==undefined && old_row!==undefined){
            if(old_row.uuid===null && new_row.uuid!==null){
                delete FSWebChatIn.dialog_indexs[old_row.timestamp];
                FSWebChatIn.dialog_indexs[new_row.uuid]=id;
            }else if(old_row.uuid!==null && new_row.uuid!==null){
                FSWebChatIn.dialog_indexs[new_row.uuid]=id;
            }else{
                delete FSWebChatIn.dialog_indexs[new_row.timestamp];
                FSWebChatIn.dialog_indexs[new_row.timestamp]=id;
            }   
        }
    });

    this.startTimerUpdateDates();
};

Dialog.prototype.start = function () {
    $(document).trigger('dialog-change', [{type: 'start'}]);

    this.pushEpisode({
        usertype: 'CLIENT',
        displayname: this.name,
        msgtype: 'JOIN',
        msg: null,
        options: null,
        optionstype: null,
        rating: null,
        file: null,
        timestamp: Date.now(),
        uuid: null,
        status: null
    });
};

Dialog.prototype.stop = function () {
    this.pushEpisode({
        usertype: 'CLIENT',
        displayname: this.name,
        msgtype: 'LEAVE',
        msg: null,
        options: null,
        optionstype: null,
        rating: null,
        file: null,
        timestamp: Date.now(),
        uuid: null,
        status: null
    });

    $(document).trigger('dialog-change', [{type: 'stop'}]);
};

Dialog.prototype.newMessage = function (message) {
    this.pushEpisode({
        usertype: 'CLIENT',
        displayname: this.name,
        msgtype: 'MSG',
        msg: message,
        options: null,
        optionstype: null,
        rating: null,
        file: null,
        timestamp: Date.now(),
        uuid: null,
        status: null
    });
};

Dialog.prototype.newFile = function (fileObj) {
    this.pushEpisode({
        usertype: 'CLIENT',
        displayname: this.name,
        msgtype: 'FILESEND',
        msg: '',
        options: null,
        optionstype: null,
        rating: null,
        file: fileObj,
        timestamp: Date.now(),
        uuid: null,
        status: null
    });
};

Dialog.prototype.newComment = function (comment) {
    this.pushEpisode({
        usertype: 'CLIENT',
        displayname: this.name,
        msgtype: 'COMMENT',
        msg: comment,
        options: null,
        optionstype: null,
        rating: null,
        file: null,
        timestamp: Date.now(),
        uuid: null,
        status: null
    });
};

Dialog.prototype.newRating = function (rating) {
    this.pushEpisode({
        usertype: 'CLIENT',
        displayname: this.name,
        msgtype: 'RATING',
        msg: null,
        options: null,
        optionstype: null,
        rating: rating,
        file: null,
        timestamp: Date.now(),
        uuid: null,
        status: null
    });
};

Dialog.prototype.newInquest = function (option) {
    this.pushEpisode({
        usertype        : 'CLIENT',
        displayname     : this.name,
        msgtype         : 'MSG',
        msg             : option.msg,
        options         : option.options,
        optionstype     : option.optionstype,
        optionselected  : option.optionselected,
        rating          : null,
        file            : null,
        timestamp       : Date.now(),
        uuid            : option.uuid,
        status          : null
    });
};

Dialog.prototype.applyEpisodeEvt = function(episode){
    var self = this;
    if(episode.msgtype == 'MSG' && episode.optionstype) {
        var inquest = $("input[name=" + episode.uuid + "]:radio, #" + episode.uuid);
        inquest.change(function () {
            var value = $(this).val();
            inquest.prop("disabled", true).off();
            self.newInquest($.extend(episode, {"optionselected": value}))
        })
    }
};

Dialog.prototype.formatSize = function (bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Byte';
    }

    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

/**
 * Ractive filter to show the time ellapsed, in milliseconds, referred by the parameter "timeElapsed" as a relative time
 * (e.g., "a few seconds ago" and "3 minutes ago").
 *
 * @param {number} timeElapsed The time elapsed in milliseconds to be shown as a relative time. A negative value
 *      represents a time in the future and a positive value a time in the past.
 * @returns {string} The "timeElapsed", in milliseconds, represented as a relative time.
 */
Dialog.prototype.formatTimeEllapsed = function (timeElapsed) {
    var currentTimestamp = (new Date()).getTime();
    return moment(currentTimestamp - timeElapsed).fromNow();
};

Dialog.prototype.changeImgPrivate = function (ispublic) {
    return (ispublic!==undefined && ispublic===false)?'private':'public';
};

Dialog.prototype.formatRating = function (rating) {
    var str = '';

    for (var i = 0; i < rating; i++) {
        str += '<span class="fa fa-star-o" style="color: #FF9900"></span>';
    }

    return str;
};

Dialog.prototype.getImage = function (usertype) {
    return " ";
    /*<img src="{{getImage(usertype)}}" class="user_img"/>*/
    var client_image = 'https://www.e-nor.com/wp-content/uploads/images/clients-icon.png';
    var agent_image = 'http://images.all-free-download.com/images/graphiclarge/james_bond_007_81422.jpg';
    return usertype === 'CLIENT' ? client_image : agent_image;
};

/**
 * Starts the process in charge of update the time elapsed shown in front of each message.
 */
Dialog.prototype.startTimerUpdateDates = function () {
    /**
     * Updates the time elapsed associated to each message and trigger the update of the UI in concordance.
     */
    function updateTimeElapsed() {
        var currentTime = (new Date()).getTime();
        if (Array.isArray(this.episodes)) {
            this.episodes.forEach(function (episode) {
                episode.timeElapsed = currentTime - episode.timestamp;
            });
            this.showEpisodes();
        }
    }
    this.intervalDates = setInterval(updateTimeElapsed.bind(this), FSWebChatIn.secondsToUpdateDates * 1000);
};

Dialog.prototype.stopTimerUpdateDates = function () {
    clearInterval(this.intervalDates);
};

Dialog.prototype.msgparser = function (msg) {
    var to_replace = [
                        {from:'onclick',to:'onmouseover'},
                        {from:'GScope_WChatWorkSpace.clickdecryptmsg',to:'FSWebChatIn.overdecryptmsg'},
                        {from:'GScope_WChatWorkSpace.leavedecryptmsg',to:'FSWebChatIn.leavedecryptmsg'}
                    ];
    to_replace.forEach(function (elem, index, array){
        msg = msg.replace( elem.from, elem.to);
    });
    return msg;
};

Dialog.prototype.pushEpisode = function (episode) {
    this.episodes.push(episode);
    this.showEpisodes();
    $(document).trigger('dialog-change', [{type: 'new-episode', episode: episode}]);

    if(episode.uuid===null || episode.optionselected){
        FSWebChatIn.UnsendMsg[episode.timestamp]=episode;
        this.sendEpisodeServer(episode);
    }
};

Dialog.prototype.sendEpisodeServer = function (episode) {
    var that = this;

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/client-message',
        data: {
            episodeObj: episode
        }
    }).then(function (result) {
        delete FSWebChatIn.UnsendMsg[result.data.old_timestamp];
        that.updateEpisode(result.data.episode, result.data.old_timestamp);
    });
};

Dialog.prototype.updateEpisode = function (episode, old_timestamp) {
    if (FSWebChatIn.dialog_indexs[episode.uuid]) {
        this.ractive.set("episodes." + FSWebChatIn.dialog_indexs[episode.uuid], episode);
    } else if (FSWebChatIn.dialog_indexs[old_timestamp]) {
        this.ractive.set("episodes." + FSWebChatIn.dialog_indexs[old_timestamp], episode);
    }
    
    if (FSWebChatIn.fileUpLoad && episode.msgtype === 'FILESEND' && episode.usertype === 'CLIENT') {
        FSWebChatIn.fileUploadEpUUID = episode.uuid;
        episode.file.filestatus === null && FSWebChatIn.Chat.uploadCurrentFile(episode);
    }

    if (episode.msgtype === 'JOIN' && episode.usertype === 'CLIENT' && episode.displayname !== this.name) {
        this.name = episode.displayname;
    }

    $(document).trigger('dialog-change', [{type: 'update-episode', episode: episode}]);
};

Dialog.prototype.showEpisodes = function () {
    this.ractive.set({
        episodes: this.episodes
    });
};

Dialog.prototype.restoreEpisodes = function (episodes) {
    for (var ep in episodes) {
        this.episodes.push(episodes[ep]);
        !episodes[ep].uuid && (FSWebChatIn.UnsendMsg[episodes[ep].timestamp]=episodes[ep]);
    }

    this.showEpisodes();
    $(document).trigger('dialog-change', [{type: 'restore-episodes'}]);
};

Dialog.prototype.getObject = function () {
    return {name: this.name, email: this.email, episodes: this.episodes};
};

Dialog.prototype.getNewDialogsFromServer = function () {
    var that = this;

    return $.ajax({
        type: 'GET',
        url: FSWebChatIn._options._server + '/dialogs/' + FSWebChatIn.chatUuid + '/new-client-messages'
    }).then(function (result) {
        if (result.error) {
            return;
        }

        var new_episodes = result.data;

        that.episodes = that.episodes.concat(new_episodes);
        that.showEpisodes();

        for (var ep in new_episodes) {
            FSWebChatIn.confirmMsgReading(FSWebChatIn.chatUuid, new_episodes[ep].uuid);
        }

        $(document).trigger('dialog-change', [{type: 'new-episode', episode: {}}]);
    });
};

/**
 * Set contact new name.
 * 
 * @param {string} dialogGroupUuid
 * @param {string} newName
 * @returns {jqXHR}
 */
Dialog.prototype.setNewName = function (dialogGroupUuid, newName) {
    this.name = newName;

    return $.ajax({
        type: 'PUT',
        url: FSWebChatIn._options._server + '/contacts/update-name',
        data: {
            dialogGroupUuid: dialogGroupUuid,
            newName: newName
        }
    });
};