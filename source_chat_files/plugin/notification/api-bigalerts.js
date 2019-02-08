if(typeof FSWebChatIn ==='undefined' ){ FSWebChatIn = {}; }
FSWebChatIn.BigAlert = (function () {
    var BoxColor, BoxSound, BoxIcon, BoxTimeout, BoxColorTime, BoxColors, BoxAnimate, BoxIdBox, BoxNumber, BoxTitle;
    var BoxContent = '';

    function fnCreate(params) {
        if (params.type !== undefined) {
            switch (params.type) {
                case "info":
                    fnBigNotificationInfo(params);
                    bigNotification(params);
                    break;
                case "warning":
                    fnBigNotificationWarning(params);
                    bigNotification(params);
                    break;
                case "invalid":
                    fnBigNotificationInvalid(params);
                    bigNotification(params);
                    break;
                case "valid":
                    fnBigNotificationValid(params);
                    bigNotification(params);
                    break;
                default :
                    params.type('Type not defined!');
            }
        }
        else {
            fnBigNotificationDefault(params);
            bigNotification(params);
        }

    }

    // bigNotification
    function bigNotification(params) {
        $.bigNotification({
            idbigbox: BoxIdBox,
            title: BoxTitle,
            content: BoxContent,
            color: BoxColor,
            sound: BoxSound,
            animate: BoxAnimate,
            number: BoxNumber,
            icon: BoxIcon,
            timeout: BoxTimeout,
            colortime: BoxColorTime,
            colors: BoxColors,
            newbuttons: fnBigBoxContentCreation(params.btnconfig)
        });
    }

    // BigNotification default caso não ter o type(mBigAlert.create({}))
    function fnBigNotificationDefault(params) {
        BoxColor = "#3276B1";
        BoxSound = true;
        BoxIcon = "fa fa-wrench animated";
        BoxAnimate = params.animate;
        BoxTimeout = "6000";

        if (!_.isUndefined(params.title))
            BoxTitle = params.title;

        if (!_.isUndefined(params.body))
            params.body = BoxContent;

    }

    // criar uma Big Notification Info e validação
    function fnBigNotificationInfo(params) {
        BoxIdBox = params.idbigbox;
        BoxColor = "#3276B1";
        BoxSound = true;
        BoxIcon = params.icon;
        BoxAnimate = params.animate;
        BoxNumber = params.number;
        BoxTimeout = 3000;
        BoxColorTime = 1500;
        BoxTitle = params.title;
        BoxContent = params.body;

        if (!_.isUndefined(params.title))
            BoxTitle = params.title;
        else
            BoxTitle = params.body;

        if (!_.isUndefined(params.number))
            BoxNumber = params.number;
         else
            BoxNumber = "";


        if (!_.isUndefined(params.body))
            BoxContent = params.body;
        else
            BoxContent = "";

        if (!_.isUndefined(params.timeout))
            BoxTimeout = params.timeout;
         else
            BoxTimeout = undefined;


        if (!_.isUndefined(params.idbigbox))
            BoxIdBox = params.idbigbox;
         else
            BoxIdBox = "undefined";


        if (!_.isUndefined(params.animate))
            BoxAnimate = params.animate + ' animated';
         else
            BoxAnimate = "";


        if (!_.isUndefined(params.icon))
            BoxIcon = params.icon + ' ' + BoxAnimate;
         else
            BoxIcon = "";


        if (!_.isUndefined(params.sound))
            BoxSound = params.sound;
         else
            BoxSound = true;

    }

    // criar uma Big Notification Warning e validação
    function fnBigNotificationWarning(params) {
        BoxIdBox = params.idbigbox;
        BoxColor = "#C29816";
        BoxSound = false;
        BoxIcon = params.icon;
        BoxAnimate = params.animate;
        BoxTimeout = 3000;
        BoxColorTime = 1500;
        BoxNumber = params.number;
        BoxTitle = params.title;
        BoxContent = params.body;

        if (!_.isUndefined (params.title))
            BoxTitle = params.title;
        else
            BoxTitle = "";

        if (!_.isUndefined(params.body))
            BoxContent = params.body;
        else
            BoxContent = "";

        if (!_.isUndefined(params.idbigbox))
            BoxIdBox = params.idbigbox;


        if (!_.isUndefined(params.sound))
            BoxSound = params.sound;
         else
            BoxSound = false;


        if (!_.isUndefined(params.icon))
            BoxIcon = params.icon + ' ' + BoxAnimate;
         else
            BoxIcon = "fa fa-exclamation-triangle animated";


        if (!_.isUndefined (params.timeout))
            BoxTimeout = params.timeout;
         else
            BoxTimeout = undefined;


        if (!_.isUndefined(params.number))
            BoxNumber = params.number;
         else
            BoxNumber = "";

    }

    // criar uma Big Notification Invalid e validação
    function fnBigNotificationInvalid(params) {
        BoxIdBox = params.idbigbox;
        BoxColor = "#a90329";
        BoxSound = false;
        BoxIcon = params.icon;
        BoxAnimate = params.animate;
        BoxTimeout = undefined;
        BoxColorTime = 1500;
        BoxNumber = params.number;
        BoxTitle = params.title;
        BoxContent = params.body;

        if (!_.isUndefined(params.title))
            BoxTitle = params.title;
        else
            BoxTitle = "";

        if (!_.isUndefined(params.body))
            BoxContent = params.body;
        else
            BoxContent = "";


        if (!_.isUndefined(params.sound))
            BoxSound = params.sound;
         else
            BoxSound = false;


        if (!_.isUndefined(params.idbigbox))
            BoxIdBox = params.idbigbox;
         else
            BoxIdBox = "undefined";


        if (!_.isUndefined(params.icon))
            BoxIcon = params.icon + ' ' + BoxAnimate;
         else
            BoxIcon = 'fa fa-ban animated';


        if (!_.isUndefined(params.timeout))
            BoxTimeout = params.timeout;
         else
            BoxTimeout = undefined;


        if (!_.isUndefined(params.number))
            BoxNumber = params.number;
        else
            BoxNumber = "";

    }

    function fnBigNotificationValid(params) {
        BoxIdBox = params.idbigbox;
        BoxColor = "#659265";
        BoxSound = false;
        BoxIcon = params.icon;
        BoxAnimate = params.animate;
        BoxTimeout = 3000;
        BoxColorTime = 1500;
        BoxNumber = params.number;
        BoxTitle = params.title;
        BoxContent = params.body;

        if (!_.isUndefined(params.title))
            BoxTitle = "<b>" + params.title + "</b>";
        else
            BoxTitle = "";


        if (!_.isUndefined(params.body))
            BoxContent = params.body;
        else
            BoxContent = "";


        if (!_.isUndefined(params.sound))
            BoxSound = params.sound;
        else
            BoxSound = false;


        if (!_.isUndefined(params.idbigbox))
            BoxIdBox = params.idbigbox;
        else
            BoxIdBox = "undefined";


        if (!_.isUndefined(params.icon))
            BoxIcon = params.icon + ' ' + BoxAnimate;
        else
            BoxIcon = 'fa fa-check animated';


        if (!_.isUndefined(params.timeout))
            BoxTimeout = params.timeout;
        else
            BoxTimeout = 3000;


        if (!_.isUndefined(params.number))
            BoxNumber = params.number;
        else
            BoxNumber = "";

    }

    function fnBigBoxContentCreation(buttons) {
        var finalcontent;
        finalcontent = fnButtonCreation(buttons);
        return finalcontent;

    }

//criação de butoes
    function fnButtonCreation(aButtons) {
        var btnconfig = '';
        var positionRight = 20;

        if (_.isArray(aButtons)) {
            aButtons.forEach(function (btn) {
                btnconfig += "<button " + btn.otherinfo + "  id='" + btn.buttonid + "' class='" + btn.typebutton + "' onclick='" + btn.onclickaction + "' style='position:static; float:right !important; bottom:5px; right:" + positionRight + 'px' + ';' + " margin-top: 5px; margin-right:10px; background-color:" + btn.pickcolor + "'><i class='" + btn.icontype + "'></i>" + ' ' + btn.textinfo + "</button>";
            });
        } else
            btnconfig = '';

        return btnconfig;
    }

    return {
        create: fnCreate
    }
})();
