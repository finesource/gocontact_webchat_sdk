Ractive.DEBUG = false;


if(typeof FSWebChatIn ==='undefined' ){ FSWebChatIn = {}; }
FSWebChatIn._options = {};
FSWebChatIn._options.origin = '';
FSWebChatIn.chatUuid = null;
FSWebChatIn.chatId = null;
FSWebChatIn.stringHash = null;
FSWebChatIn.UnsendMsg = {};
FSWebChatIn.fileUpLoad = null;
FSWebChatIn.isMirroring = false;
FSWebChatIn._statusvarofwcview = false;
FSWebChatIn._timestamp = +new Date();
FSWebChatIn.sound = new Audio('sounds/chat_sound.mp3');
FSWebChatIn.secondsToUpdateDates = 60;
FSWebChatIn.dialog_indexs = {};
FSWebChatIn.loginFields = [];

FSWebChatIn.rest_endpoint = null;
FSWebChatIn.accessKey = null;

/**
 * This method shows an error message (on the top of the webchat window) when the client tries to start a conversation
 * and the webchat is out of schedule.
 *
 * @param {string} msg is the error message shown when the webchat is out of schedule
 *                 msg - "Webchat is out of schedule"
 */
FSWebChatIn.showErrorMsg = function (msg) {

    $('#error-message-offline').html(msg);
    $('#error-message-offline').addClass('error');

}

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
        if(FSWebChatIn.chatUuid!==null){
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
    if(FSWebChatIn.chatUuid!==null){
         FSWebChatIn.sendBrowserVisitorPath();
    }
    
    return true;
};

/**IFRAME COMUNICATION INIT**/
FSWebChatIn.SetStatusVarWCView = function (obj) {
    FSWebChatIn._statusvarofwcview = obj.status || false;
};

FSWebChatIn.sendWebChatDialogStatus = function (status){
    var _msg = {action:"WebChatDialogStatus", status: status || ''};
    parent.postMessage(_msg, FSWebChatIn._options.origin);
};

FSWebChatIn.GetStatusVarWCView = function (){
    var _msg = {action:"GetStatusVarWCView"};
    parent.postMessage(_msg, FSWebChatIn._options.origin);
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

FSWebChatIn.Mirroring = function (action, data) {
    if (action !== 'send') {
        return;
    }

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/mirror-screen',
        data: {
            mirrorData: data
        }
    });
};

FSWebChatIn.GetClientBrowserURL = function (){
    parent.postMessage({action: 'GetClientBrowserURL'}, FSWebChatIn._options.origin);
};

FSWebChatIn.isWebchatDialogInit = function(){
    var local_hashkey = FSWebChatIn.storage.get('webchat_init');
    if(local_hashkey && local_hashkey.length > 0) {
        //look for "sha1 key"
        var _pattern = /^[0-9a-f]{40}$/i;
        var _result = _pattern.test(local_hashkey);
        if (_result === true) {
            FSWebChatIn._options._hashkey = local_hashkey;
        }
    }
};


function FSWebChatInhandleResponse(e) {
    if (e.data.action === 'setOrigin') {
        FSWebChatIn._options.origin = e.origin;
        if (Object.keys(e.data.params).length) {
            FSWebChatIn.extendObject(FSWebChatIn._options, e.data.params)
        }

        FSWebChatIn.rest_endpoint = FSWebChatIn._options._server + '/' + FSWebChatIn._options._endpoint_rest;

        FSWebChatIn.storage = new Storage();
        FSWebChatIn.isWebchatDialogInit();
        FSWebChatIn.init();
        FSWebChatIn.GetStatusVarWCView();
    } else if (e.data.action === 'sendBrowserPath') {
        FSWebChatIn.storeBrowserPath(e.data.params);
    } else if (e.data.action === 'SetStatusVarWCView') {
        FSWebChatIn.SetStatusVarWCView(e.data.params);
    } else if (e.data.action === 'ResetClientDoInactivity') {
        FSWebChatIn.ResetClientDoInactivity();
    } else if (e.data.action === 'Mirroring') {
        FSWebChatIn.Mirroring(e.data.subaction, e.data.params);
    } else if (e.data.action === 'setClientGeolocation') {
        FSWebChatIn.sendBrowserLocation(e.data.params.data);
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

/**
 * Get webchat configs and start rendering the plugin.
 * 
 * @returns {unresolved}
 */
FSWebChatIn.init = function () {
    FSWebChatIn.listenSocketEvents();

    return $.getJSON(FSWebChatIn.rest_endpoint + '/webchats/configs/' + 
            FSWebChatIn._options._hashkey + '?domain=' + FSWebChatIn._options._domain).done(function (data) {
        for (var _set in data.data) {
            if (data.data[_set] === 'true' || data.data[_set] === 'false') {
                data.data[_set] = data.data[_set] === 'true';
            }
        }

        FSWebChatIn.domain = data.data.domain;
        FSWebChatIn.geolocation = data.data.allowGeolocation;

        if (!FSWebChatIn._options._domain) {
            FSWebChatIn._options._domain = FSWebChatIn.domain;
        }

        FSWebChatIn.validation = data.validation || null;

        if(FSWebChatIn.storage.get('uuid') === null && FSWebChatIn.validation !== FSWebChatIn.storage.get('validation')){
            FSWebChatIn.storage.clear();
            FSWebChatIn.storage.add('validation', FSWebChatIn.validation);
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
    let baseUrl = FSWebChatIn._options._server;
    let serviceName = FSWebChatIn._options._endpoint_ws;

    const parsedUrl = new URL(baseUrl);

    if (parsedUrl.pathname !== '/') {
        serviceName = parsedUrl.pathname + '/' + serviceName;
    }

    if (serviceName[0] === '/') {
        serviceName = serviceName.substring(1);
    }

    websocketManager.start({
        baseurl: parsedUrl.origin,
        serviceName: serviceName
    }, 30);

    return new Promise(function (resolve, reject) {
        $(document).one('websocket-status', function (evt, data) {
            if (data.online === true) {
                return resolve();
            }

            if (data.online === false || data.error === true) {
                return reject();
            }
        });
    });
};

FSWebChatIn.listenSocketEvents = function () {
    websocketManager.on('all', 'webchat-plugin', FSWebChatIn.handleSocketEvent);

    websocketManager.on('internal', 'internal', function (message) {
        if (message.connectionOpen && message.isFirstSocket === true) {
            return $(document).trigger('websocket-status', [{online: true}]);
        }

        if (message.connectionClosed && message.isLastSocket) {
            return $(document).trigger('websocket-status', [{online: false}]);
        }

        if (message.error && message.error === 'NO_SERVERS_AVAILABLE') {
            return $(document).trigger('websocket-status', [{error: true}]);
        }

        if (message.connectionUpdate && message.killedByReRegister === true) {
            $('#fs-webchat').addClass('on-hold');
        }
    });
};

FSWebChatIn.handleSocketEvent = function(request){
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
        case 'FSwebchat:Server:ContactChange':
            FSWebChatIn.Chat.onContactChange(request.data.new_contact_id, request.data.new_contact_name);
            break;
        case 'FSwebchat:Server:DialogGroup:Closed':
            FSWebChatIn.handleDialogGroupCloseByClient(request.data.actionDoneBy);
            break;
        case 'FSwebchat:Server:DialogGroup:Spam':
            FSWebChatIn.resetInterface();
            break;
        case 'FSwebchat:Server:UnregisterByTrigger':
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
            FSWebChatIn.confirmMsgReading(request.data.episode.uuid);
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
 * Reset the interface.
 */
FSWebChatIn.resetInterface = function () {
    websocketManager.close();

    FSWebChatIn.Chat.clientUnRegister();
};

/**
 * Mark client dialog as read.
 * 
 * @param {string} dialogUuid
 * @returns {jqXHR}
 */
FSWebChatIn.confirmMsgReading = function (dialogUuid) {
    return $.ajax({
        type: 'POST',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/mark-as-read',
        data: {
            dialogUuid: dialogUuid
        }
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
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/browser-info',
        data: {
            browserInfo: browserInfo
        }
    });
};

FSWebChatIn.requestBrowserLocation = function(){
    parent.postMessage({action: 'getClientGeolocation'}, FSWebChatIn._options.origin);
};

FSWebChatIn.sendBrowserLocation = function(browser_data){
    if (FSWebChatIn.geolocation === false) {
        return;
    }

    var data = {};

    function sendLocation() {
        return $.ajax({
            type: 'POST',
            url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/client-location',
            data: {
                clientLocation: data
            }
        });
    }

    if (browser_data) {
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + browser_data.latitude + '&lon=' + browser_data.longitude, function(response) {
            data = {
                ip: '',
                address: response.display_name,
                country_code: response.address.country_code,
                country_name: response.address.country,
                region_name: response.address.state_district,
                city: response.address.town,
                zip_code: response.address.postcode,
                latitude: browser_data.latitude,
                longitude: browser_data.longitude,
                metro_code: 0
            }

            $.getJSON('https://api.ipify.org?format=json', function (ipResponse) {
                data.ip = ipResponse.ip;
                sendLocation()
            }).fail(function (error) {
                sendLocation()
                throw error;
            });
        }).fail(function (error) {
            console.error(error);
        });
    }
};

FSWebChatIn.sendBrowserVisitorPath = function () {
    var _path = FSWebChatIn.storage.get('path');

    if (_path === null) {
        return;
    }

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/visitor-path',
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