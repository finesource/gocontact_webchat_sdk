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

Chat.prototype.Render = function (isChatOnline) {  
    this.applyConfigs(isChatOnline);
    this.applyEvents(isChatOnline);
    this.checkChatState(isChatOnline);

    var lang = FSWebChatIn.storage.get('lang') || this.configs.default_lang || 'en';
    this.loadLanguagesSelect(lang);
};

Chat.prototype.isOnline = function () {
    var that = this;

    return $.getJSON(FSWebChatIn.rest_endpoint + '/webchats/schedule/' + FSWebChatIn.domain + '/' + FSWebChatIn._options._hashkey).done(function (data) {
        that.online = data.online;
        that.Render(data.online);
    });
};

/**
 * Update the interface when the server status changes.
 * 
 * @param {boolean} is_online
 * @returns {undefined}
 */
Chat.prototype.updateWebchatStatus = function (is_online) {
    $('#fs-webchat .main-dialog').get(0).style.display = '';
    $('#fs-webchat .main-offline').get(0).style.display = '';

    if (is_online === true) {
        return this.goOnline();
    }

    if (is_online === false) {
        return this.goOffline();
    }
};

Chat.prototype.applyConfigs = function (isChatOnline) {
    if (!isChatOnline && !this.configs.show_chat_offline) {
        return;
    }
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

Chat.prototype.applyEvents = function (isChatOnline) {
    if (!isChatOnline && !this.configs.show_chat_offline) {
        return;
    }
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
    $('#resume-from-hold').on('click', this.onResumeHold);
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
 * @param {boolean} isChatOnline
 * @returns {Promise}
 */
Chat.prototype.checkChatState = function (isChatOnline) {
    if (!isChatOnline && !this.configs.show_chat_offline) {
        return;
    }

    FSWebChatIn.chatUuid = FSWebChatIn.storage.get('uuid');
    FSWebChatIn.chatId = FSWebChatIn.storage.get('chat_id');
    FSWebChatIn.accessKey = FSWebChatIn.storage.get('accessKey');
    FSWebChatIn.isMirroring = JSON.parse(FSWebChatIn.storage.get('isMirroring')) || false;

    var that = this;
    var chat_dialog = JSON.parse(FSWebChatIn.storage.get('dialog'));

    const shouldResume = FSWebChatIn.accessKey && FSWebChatIn.chatUuid && chat_dialog && isChatOnline;

    if (!shouldResume) {
        return;
    }

    FSWebChatIn.loading = true;

    return this.resumeSession().then(function () {
        return FSWebChatIn.initSocket();
    }).then(function () {
        that.reloadComponent(chat_dialog);
    }).then(function () {
        FSWebChatIn.sendUnsendMsg();
        FSWebChatIn.sendBrowserVisitorPath();
    }).then(function () {
        FSWebChatIn.loading = false;
    }).catch(function (err) {
        FSWebChatIn.resetInterface();
    });
};

Chat.prototype.resumeSession = function () {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'POST',
            url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/resume-session',
            xhrFields: {
                withCredentials: true
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                resolve(data);
            }
        });
    });
};

/**
 * Reloads the component.
 * 
 * @param {object} chat_dialog
 * @returns {undefined}
 */
Chat.prototype.reloadComponent = function (chat_dialog) {
    var state = FSWebChatIn.storage.get('state');

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

    if ($(e.target).hasClass('disabled')) {
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
        return that.acquireAccessKey(FSWebChatIn._options._domain, FSWebChatIn._options._hashkey).then(function (result) {
            FSWebChatIn.accessKey = result.accessKey;

            return FSWebChatIn.initSocket();
        }).then(function () {
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
    var body = {
        hashkey: FSWebChatIn._options._hashkey,
        domainUuid: FSWebChatIn._options._domain,
        contact_email: data.email,
        contact_name: data.name,
        message: data.message
    };

    const messagesCtn = $('.main-offline .messages');

    messagesCtn.children('div').addClass('hidden');

    return $.post(FSWebChatIn.rest_endpoint + '/dialogs/offline-message', body).done(function (result) {
        if (result.error || (result.data !== undefined && result.data.id === undefined)) {
            messagesCtn.find('.error').removeClass('hidden');
            return;
        }

        $('#off-name, #off-email, #off-message').val('');

        messagesCtn.find('.success').removeClass('hidden');
        messagesCtn.find('.success b').html(result.data.id);
    });
};

Chat.prototype.setChatID = function () {
    $('.chat-dialog-box .list-options-box li[data-action="chat-id"] label').html(FSWebChatIn.chatId);
};

Chat.prototype.initDialog = function (data) {
    var that = this;

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/new-dialog-group',
        data: {
            originPath: FSWebChatIn._options.originPath,
            loginFields: data.loginFields
        }
    }).then(function (result) {
        FSWebChatIn.chatUuid = result.dialogGroupUuid;
        FSWebChatIn.chatId = result.dialogGroupId;
        if (FSWebChatIn.geolocation) {
            FSWebChatIn.requestBrowserLocation();
        }
        FSWebChatIn.sendBrowserInfo();
        FSWebChatIn.sendBrowserVisitorPath();

        FSWebChatIn.storage.add('webchat_init', FSWebChatIn._options._hashkey);
        FSWebChatIn.storage.add('accessKey', FSWebChatIn.accessKey);
        FSWebChatIn.sendWebChatDialogStatus(FSWebChatIn.chatUuid);

        that.setChatID();
        that.startDialog(data);
    }).fail(function (error) {
        if (error.responseJSON.message === 'WEBCHAT_STATUS_OFFLINE') {
            var lang = that.getLangObj().main;

            FSWebChatIn.showErrorMsg(lang.status_offline_msg);
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
    const language = $('.chat-dialog-box .list-options-box li[data-action="change-lang"] select').val();

    return $.ajax({
        type: 'POST',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/request-email',
        data: {
            language: language
        }
    });
};

Chat.prototype.onOptionClick = function (e) {
    var that = this;
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

            function onLeave(evt, data) {
                if (data.type === 'update-episode' && data.episode.usertype === 'CLIENT' && data.episode.msgtype === 'LEAVE') {
                    that.clientUnRegister('MANUAL-UNREGISTER');
                    that.closeWebchat();

                    $(document).off('dialog-change', onLeave);
                }
            }

            $(document).on('dialog-change', onLeave);
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
    formData.append('domain', FSWebChatIn.domain);

    return $.ajax({
        type: "POST",
        url: FSWebChatIn.rest_endpoint + '/upload',
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
        new_name !== '' && FSWebChatIn.Chat.dialog.setNewName(new_name);
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
            url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/client-unregister',
            data: {
                closeType: type
            }
        }).then(function () {
            websocketManager.close();
        });

        FSWebChatIn.SetStatusVarWCInactivity();
    }

    FSWebChatIn.storage.remove('validation','webchat_init', 'accessKey', 'dialog', 'uuid', 'chat_id', 'lastpathtime', 'lasturl', 'path', 'isMirroring');
    FSWebChatIn.sendWebChatDialogStatus('');
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

Chat.prototype.goOffline = function () {
    this.online = false;

    if ($('#fs-webchat').find('.main-dialog .dialog-box ul li').length > 0) {
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
        bool && that.notifyLanguageChange($(this).find('option:selected').html());
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
 * @param {string} newLanguage
 * @returns {jqXHR}
 */
Chat.prototype.notifyLanguageChange = function (newLanguage) {
    return $.ajax({
        type: 'PUT',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/language-change',
        data: {
            newLanguage: newLanguage
        }
    });
};

Chat.prototype.onContactChange = function (new_contact_id, new_contact_name) {
    this.dialog.name = new_contact_name;
};

Chat.prototype.acquireAccessKey = function (domainUuid, hashKey) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'POST',
            url: FSWebChatIn.rest_endpoint + '/plugin/access-key',
            data: {
                domainUuid: domainUuid,
                hashKey: hashKey
            },
            xhrFields: {
                withCredentials: true
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(errorThrown);
            },
            success: function (data, textStatus, jqXHR) {
                resolve(data);
            }
        });
    });
};

Chat.prototype.onResumeHold = function () {
    window.location.reload();
};