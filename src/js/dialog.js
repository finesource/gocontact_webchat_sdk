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
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/client-message',
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
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/new-client-messages'
    }).then(function (result) {
        if (result.error) {
            return;
        }

        var new_episodes = result.data;

        that.episodes = that.episodes.concat(new_episodes);
        that.showEpisodes();

        for (var ep in new_episodes) {
            FSWebChatIn.confirmMsgReading(new_episodes[ep].uuid);
        }

        $(document).trigger('dialog-change', [{type: 'new-episode', episode: {}}]);
    });
};

/**
 * Set contact new name.
 * 
 * @param {string} newName
 * @returns {jqXHR}
 */
Dialog.prototype.setNewName = function (newName) {
    this.name = newName;

    return $.ajax({
        type: 'PUT',
        url: FSWebChatIn.rest_endpoint + '/plugin/' + FSWebChatIn.accessKey + '/update-name',
        data: {
            newName: newName
        }
    });
};