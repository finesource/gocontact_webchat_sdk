(function ($) {
    $.horizontalNotification = function (settings, callback) {

        var SmartMSG, Content;
        settings = $.extend({
            title: "",
            content: "",
            NormalButton: undefined,
            ActiveButton: undefined,
            buttons: undefined,
            input: undefined,
            placeholder: "",
            options: undefined,
            voiceLogin: false,
            sipPhoneReconnect: false,
            sipPhoneExtension: false,
            mainSocketReconnect: false
        }, settings);
        var PlaySound = 0;
        PlaySound = 1;
        //Messagebox Sound
        // SmallBox Sound
        if (isIE8orlower() == 0) {
            var audioElement = document.createElement('audio');
            audioElement.setAttribute('src', 'sound/messagebox.mp3');

            audioElement.addEventListener("load", function () {
                audioElement.play();
            }, true);
            audioElement.pause();
            audioElement.play();
        }


        SmartMSGboxCount = SmartMSGboxCount + 1;
        if (ExistMsg == 0) {
            ExistMsg = 1;
            SmartMSG = "<div class='divMessageBox animated fadeIn fast' id='MsgBoxBack'></div>";
            $("body").append(SmartMSG);
            if (isIE8orlower() == 1) {
                $("#MsgBoxBack").addClass("MessageIE");
            }
        }
        var InputType = "";
        var HasInput = 0;
        if (settings.input != undefined) {
            HasInput = 1;
            settings.input = settings.input.toLowerCase();
            switch (settings.input) {
                case "text":
                    InputType = "<input class='form-control' type='" + settings.input + "' id='txt" + SmartMSGboxCount + "' placeholder='" + settings.placeholder + "'/><br/><br/>";
                    break;
                case "password":
                    InputType = "<input class='form-control' type='" + settings.input + "' id='txt" + SmartMSGboxCount + "' placeholder='" + settings.placeholder + "'/><br/><br/>";
                    break;
                case "select":
                    if (settings.options == undefined) {
                        alert("For this type of input, the options parameter is required.");
                    } else {
                        InputType = "<select class='form-control' id='txt" + SmartMSGboxCount + "'>";
                        for (var i = 0; i <= settings.options.length - 1; i++) {
                            if (settings.options[i] == "[") {
                                Name = "";
                            } else {
                                if (settings.options[i] == "]") {
                                    NumBottons = NumBottons + 1;
                                    Name = "<option>" + Name + "</option>";
                                    InputType += Name;
                                } else {
                                    Name += settings.options[i];
                                }
                            }
                        }

                        InputType += "</select>"
                    }
                    break;
                default:
                    alert("That type of input is not handled yet");
            }
        }
        Content = "<div class='MessageBoxContainer animated fadeIn fast' id='Msg" + SmartMSGboxCount + "'>";
        Content += "<div class='MessageBoxMiddle'>";
        Content += "<span class='MsgTitle'>" + settings.title + "</span class='MsgTitle'>";
        Content += "<p class='pText'>" + settings.content + "</p><form autocomplete='off'>";
        Content += InputType;
        Content += "<div class='MessageBoxButtonSection'>";
        if (settings.buttons == undefined) {
            settings.buttons = "[Accept]";
        }
        settings.buttons = $.trim(settings.buttons);
        settings.buttons = settings.buttons.split('');
        var Name = "";
        var NumBottons = 0;
        if (settings.NormalButton == undefined) {
            settings.NormalButton = "#232323";
        }
        if (settings.ActiveButton == undefined) {
            settings.ActiveButton = "#ed145b";
        }
        for (var i = 0; i <= settings.buttons.length - 1; i++) {
            if (settings.buttons[i] == "[") {
                Name = "";
            } else {
                if (settings.buttons[i] == "]") {
                    NumBottons = NumBottons + 1;
                    Name = "<button id='bot" + NumBottons + "-Msg" + SmartMSGboxCount + "' class='btn btn-default btn-sm botTempo'> " + Name + "</button>";
                    Content += Name;
                } else {
                    Name += settings.buttons[i];
                }
            }
        }

        Content += "</div>";
        //MessageBoxButtonSection
        Content += "</div>";
        //MessageBoxMiddle
        Content += "</div></form>";
        //MessageBoxContainer
        // alert(SmartMSGboxCount);
        if (SmartMSGboxCount > 1) {
            $(".MessageBoxContainer")
                .hide()
                .css("z-index", 99999);
        }
        $(".divMessageBox").append(Content);
        if (HasInput == 1) {
            $("#txt" + SmartMSGboxCount).focus();
        }
        if (settings.voiceLogin) {
            $('#bot1-Msg' + SmartMSGboxCount).removeClass('botTempo').attr('id', 'voice-login-submit').attr('type', 'submit');
            $('#bot2-Msg' + SmartMSGboxCount).attr('id', 'voice-login-cancel');
            $('#bot3-Msg' + SmartMSGboxCount).addClass('hidden');
            $('#txt' + SmartMSGboxCount).attr('id', 'voice-login-extension').mask('?999999999', {
                placeholder: ""
            });
            $('.MessageBoxButtonSection').append('<div id="voice-login-msg"></div>');
        }
        if (settings.sipPhoneReconnect) {
            $('#bot1-Msg' + SmartMSGboxCount).removeClass('botTempo').attr('id', 'reValidateSipPhone').attr('type', 'submit').addClass('hidden');
            $('#bot2-Msg' + SmartMSGboxCount).removeClass('botTempo').attr('id', 'cancelreValidateSipPhone');
            $('#bot3-Msg' + SmartMSGboxCount).addClass('hidden')
            $('#txt' + SmartMSGboxCount).attr('id', 'reValidateSipPhoneInput').val(settings.sipPhoneExtension).attr('disabled', true);
            $('.MessageBoxButtonSection').append('<div id="validateSipPhoneError"></div>');
        }
        if (settings.mainSocketReconnect) {
            $('.MessageBoxButtonSection').append('<div id="">Attempting to reconnect. <br> Retry <span id="main-smartmsgbox-reconnect-attempts">1</span> of <span class="txt-color-orangeDark"><strong><span id="main-smartmsgbox-reconnect-max-attempts">5</span></strong></span> </div>');
        }
        // Focus
        $('.botTempo')
            .hover(function () {
                var ThisID = $(this).attr('id');
            }, function () {
                var ThisID = $(this).attr('id');
            })
            .click(function (e) {
                e.preventDefault();
                // Closing Method
                var ThisID = $(this).attr('id');
                var MsgBoxID = ThisID.substr(ThisID.indexOf("-") + 1);
                var Press = $.trim($(this).text());
                if (HasInput == 1) {
                    if (typeof callback == "function") {
                        var IDNumber = MsgBoxID.replace("Msg", "");
                        var Value = $("#txt" + IDNumber).val();
                        if (callback)
                            callback(Press, Value);
                    }
                } else {
                    if (typeof callback == "function") {
                        if (callback)
                            callback(Press);
                    }
                }
                $("#" + MsgBoxID).addClass("animated fadeOut fast");
                SmartMSGboxCount = SmartMSGboxCount - 1;
                if (SmartMSGboxCount < 0) {
                    SmartMSGboxCount = 0;
                }
                if (SmartMSGboxCount == 0) {
                    $("#MsgBoxBack").removeClass("fadeIn").addClass("fadeOut").delay(300).queue(function () {
                        ExistMsg = 0;
                        $(this).remove();
                    });
                }
            });
    }
})(jQuery);

var SmallBoxes = 0, SmallCount = 0, SmallBoxesAnchos = 0;
(function ($) {
    $.smallNotification = function (settings, callback) {
        var BoxSmall, content;
        settings = $.extend({
            title: "",
            content: "",
            icon: undefined,
            iconSmall: undefined,
            sound: false,
            color: undefined,
            timeout: undefined,
            colortime: 1500,
            colors: undefined,
            noHide: false
        }, settings);
        // SmallBox Sound
        if (settings.sound === true) {
            if (isIE8orlower() == 0) {
                var audioElement = document.createElement('audio');
                if (navigator.userAgent.match('Firefox/'))
                    audioElement.setAttribute('src', $.sound_path + 'smallbox.ogg');
                else
                    audioElement.setAttribute('src', $.sound_path + 'smallbox.mp3');

                audioElement.addEventListener("load", function () {
                    audioElement.play();
                }, true);
                audioElement.pause();
                audioElement.play();
            }
        }
        SmallBoxes = SmallBoxes + 1;
        BoxSmall = "";
        var IconSection = "", CurrentIDSmallbox = "smallbox" + SmallBoxes;
        if (settings.iconSmall == undefined) {
            IconSection = "<div class='miniIcono'></div>";
        } else {
            IconSection = "<div class='miniIcono'><i class='miniPic " + settings.iconSmall + "'></i></div>";
        }
        if (settings.icon == undefined) {
            BoxSmall = "<div id='smallbox" + SmallBoxes + "' class='SmallBox animated fadeInRight fast'><div class='textoFull'><span>" + settings.title + "</span><p>" + settings.content + "</p></div>" + IconSection + "</div>";
        } else {
            BoxSmall = "<div id='smallbox" + SmallBoxes + "' class='SmallBox animated fadeInRight fast'><div class='foto'><i class='" + settings.icon + "'></i></div><div class='textoFoto'><span>" + settings.title + "</span><p>" + settings.content + "</p></div>" + IconSection + "</div>";
        }
        if (SmallBoxes == 1) {
            $("#divSmallBoxes").append(BoxSmall);
            SmallBoxesAnchos = $("#smallbox" + SmallBoxes).height() + 40;
        } else {
            var SmartExist = $(".SmallBox").size();
            if (SmartExist == 0) {
                $("#divSmallBoxes").append(BoxSmall);
                SmallBoxesAnchos = $("#smallbox" + SmallBoxes).height() + 40;
            } else {
                $("#divSmallBoxes").append(BoxSmall);
                $("#smallbox" + SmallBoxes).css("top", SmallBoxesAnchos);
                SmallBoxesAnchos = SmallBoxesAnchos + $("#smallbox" + SmallBoxes).height() + 20;
                $(".SmallBox").each(function (index) {
                    if (index == 0) {
                        $(this).css("top", 20);
                        heightPrev = $(this).height() + 40;
                        SmallBoxesAnchos = $(this).height() + 40;
                    } else {
                        $(this).css("top", heightPrev);
                        heightPrev = heightPrev + $(this).height() + 20;
                        SmallBoxesAnchos = SmallBoxesAnchos + $(this).height() + 20;
                    }
                });
            }
        }
        var ThisSmallBox = $("#smallbox" + SmallBoxes);
        // IE fix
        // if($.browser.msie) {
        //     // alert($("#"+CurrentIDSmallbox).css("height"));
        // }
        if (settings.color == undefined) {
            ThisSmallBox.css("background-color", "#004d60");
        } else {
            ThisSmallBox.css("background-color", settings.color);
        }
        var ColorTimeInterval;
        if (settings.colors != undefined && settings.colors.length > 0) {
            ThisSmallBox.attr("colorcount", "0");
            ColorTimeInterval = setInterval(function () {
                var ColorIndex = ThisSmallBox.attr("colorcount");
                ThisSmallBox.animate({
                    backgroundColor: settings.colors[ColorIndex].color
                });
                if (ColorIndex < settings.colors.length - 1) {
                    ThisSmallBox.attr("colorcount", ((ColorIndex * 1) + 1));
                } else {
                    ThisSmallBox.attr("colorcount", 0);
                }
            }, settings.colortime);
        }
        if (settings.timeout != undefined) {
            setTimeout(function () {
                clearInterval(ColorTimeInterval);
                var ThisHeight = $(this).height() + 20;
                var ID = CurrentIDSmallbox;
                var ThisTop = $("#" + CurrentIDSmallbox).css('top');
                // SmallBoxesAnchos = SmallBoxesAnchos - ThisHeight;
                // $("#"+CurrentIDSmallbox).remove();
                if ($("#" + CurrentIDSmallbox + ":hover").length != 0) {
                    //Mouse Over the element
                    $("#" + CurrentIDSmallbox).on("mouseleave", function () {
                        SmallBoxesAnchos = SmallBoxesAnchos - ThisHeight;
                        $("#" + CurrentIDSmallbox).remove();
                        if (typeof callback == "function") {
                            if (callback)
                                callback();
                        }
                        var Primero = 1;
                        var heightPrev = 0;
                        $(".SmallBox").each(function (index) {
                            if (index == 0) {
                                $(this).animate({
                                    top: 20
                                }, 300);
                                heightPrev = $(this).height() + 40;
                                SmallBoxesAnchos = $(this).height() + 40;
                            } else {
                                $(this).animate({
                                    top: heightPrev
                                }, 350);
                                heightPrev = heightPrev + $(this).height() + 20;
                                SmallBoxesAnchos = SmallBoxesAnchos + $(this).height() + 20;
                            }
                        });
                    });
                } else {
                    clearInterval(ColorTimeInterval);
                    SmallBoxesAnchos = SmallBoxesAnchos - ThisHeight;
                    if (typeof callback == "function") {
                        if (callback)
                            callback();
                    }
                    $("#" + CurrentIDSmallbox).removeClass().addClass("SmallBox").animate({
                        opacity: 0
                    }, 300, function () {
                        $(this).remove();
                        var Primero = 1;
                        var heightPrev = 0;
                        $(".SmallBox").each(function (index) {
                            if (index == 0) {
                                $(this).animate({
                                    top: 20
                                }, 300);
                                heightPrev = $(this).height() + 40;
                                SmallBoxesAnchos = $(this).height() + 40;
                            } else {
                                $(this).animate({
                                    top: heightPrev
                                });
                                heightPrev = heightPrev + $(this).height() + 20;
                                SmallBoxesAnchos = SmallBoxesAnchos + $(this).height() + 20;
                            }
                        });
                    })
                }
            }, settings.timeout);
        }
        // Click Closing
        if (!settings.noHide) {
            $("#smallbox" + SmallBoxes).bind('click', function () {
                clearInterval(ColorTimeInterval);
                if (typeof callback == "function") {
                    if (callback)
                        callback();
                }
                var ThisHeight = $(this).height() + 20;
                var ID = $(this).attr('id');
                var ThisTop = $(this).css('top');
                SmallBoxesAnchos = SmallBoxesAnchos - ThisHeight;
                $(this).removeClass().addClass("SmallBox").animate({
                    opacity: 0
                }, 300, function () {
                    $(this).remove();
                    var Primero = 1;
                    var heightPrev = 0;
                    $(".SmallBox").each(function (index) {
                        if (index == 0) {
                            $(this).animate({
                                top: 20
                            }, 300);
                            heightPrev = $(this).height() + 40;
                            SmallBoxesAnchos = $(this).height() + 40;
                        } else {
                            $(this).animate({
                                top: heightPrev
                            }, 350);
                            heightPrev = heightPrev + $(this).height() + 20;
                            SmallBoxesAnchos = SmallBoxesAnchos + $(this).height() + 20;
                        }
                    });
                })
            });
        } else {
            $('.SmallBox').on('click', '.smallbox-close', function () {


                var Split = $(this).closest('.SmallBox').attr('id').split('smallbox');
                var newID = Split[1];
                var jqSB = $("#smallbox" + newID);

                clearInterval(ColorTimeInterval);
                if (typeof callback == "function") {
                    if (callback)
                        callback();
                }
                var ThisHeight = jqSB.height() + 20;
                var ID = jqSB.attr('id');
                var ThisTop = jqSB.css('top');
                SmallBoxesAnchos = SmallBoxesAnchos - ThisHeight;
                jqSB
                    .removeClass()
                    .addClass("SmallBox")
                    .animate({
                        opacity: 0
                    }, 300, function () {
                        $("#smallbox" + newID).remove();
                        var Primero = 1;
                        var heightPrev = 0;
                        $(".SmallBox").each(function (index) {
                            if (index == 0) {
                                jqSB.animate({
                                    top: 20
                                }, 300);
                                heightPrev = jqSB.height() + 40;
                                SmallBoxesAnchos = jqSB.height() + 40;
                            } else {
                                jqSB.animate({
                                    top: heightPrev
                                }, 350);
                                heightPrev = heightPrev + jqSB.height() + 20;
                                SmallBoxesAnchos = SmallBoxesAnchos + jqSB.height() + 20;
                            }
                        });
                    })
            })
        }
    }
})(jQuery);


var BigBoxes = 0;

(function ($) {
    $.bigNotification = function (settings, callback) {
        var $_height='30px';
        var BigBoxid = settings.idbigbox;
        var boxBig, content;
        settings = $.extend({
            title: "",
            content: "",
            icon: undefined,
            number: undefined,
            color: undefined,
            sound: false,
            timeout: undefined,
            colortime: 1500,
            colors: undefined,
            newbuttons: "",
            idbigbox: settings.idbigbox
        }, settings);

        // bigbox Sound
        if (settings.sound === true) {
            if (isIE8orlower() == 0) {
                var audioElement = document.createElement('audio');

                if (navigator.userAgent.match('Firefox/'))
                    audioElement.setAttribute('src', $.sound_path + 'bigbox.ogg');
                else
                    audioElement.setAttribute('src', $.sound_path + 'bigbox.mp3');

                audioElement.addEventListener("load", function () {
                    audioElement.play();
                }, true);

                audioElement.pause();
                audioElement.play();
            }
        }
        if (settings.idbigbox == 'undefined') {
            settings.idbigbox = 'BigboxID' + BigBoxes;
            BigBoxid = settings.idbigbox;
        }
        else {
            BigBoxid = settings.idbigbox;
        }

        BigBoxes = BigBoxes + 1;

        boxBig = "<div id=" + settings.idbigbox + " class='bigBox animated fadeIn fast' style='background: " + settings.color + "'><div id='bigBoxColor" + BigBoxes + "'>";

        boxBig += "<div id='newTitlediv'>";
        boxBig += "<i class='botClose fa fa-times' id='botClose" + BigBoxes + "'></i>";
        boxBig += "<span>" + settings.title + "</span>";
        boxBig += "</div>";
        boxBig += "<div id='newContentdiv' style='width: auto; height: "+$_height+"; overflow:hidden !important'>";
        boxBig += "<p>" + settings.content + "</p>";
        boxBig += "</div>";
        boxBig += "<div id='bigboxIconButons' class='bigboxicon col-sm-12'>";
        /* if (settings.icon == undefined) {
         settings.icon = "fa fa-cloud";
         }*/
        boxBig += "<i class='" + settings.icon + "'></i>" + settings.newbuttons;
        boxBig += "</div>";
        boxBig += "<div class='bigboxnumber'>";
        if (settings.number != undefined) {
            boxBig += settings.number;
        }
        boxBig += "</div></div>";
        boxBig += "</div>";

        // stacking method
        $("#divbigBoxes").append(boxBig);

        $("#newContentdiv").slimScroll({
            position: 'right',
            height: $_height,
            railVisible: false,
            alwaysVisible: false,
            allowPageScroll: false
        });

        $(".slimScrollDiv").css({
            "position": "relative",
            "width": "auto",
            "height": $_height,
            "overflow": "hidden !important"
        });

        $("#divMiniIcons").append("<div id='miniIcon-" + BigBoxes +
            "' class='cajita animated fadeIn' style='position:static !important; margin-top: 0px; margin-bottom: auto !important; background-color: " + settings.color +
            ";'><i class='" + settings.icon + "'/></i></div>");

        //Click Mini Icon
        $(function () {
            $("#miniIcon-" + BigBoxes).bind('click', function () {
                num = $("#msshiniIcon-" + BigBoxes).index(this);
                $('#divbigBoxes .bigBox').hide().eq(num).show();
                $("#" + BigBoxid).css("background-color", settings.color);
            })
        });
        var ThisBigBoxCloseCross = $("#botClose" + BigBoxes);
        var ThisBigBox = $("#" + BigBoxid);
        var ThisMiniIcon = $("#miniIcon-" + BigBoxes);
        // Color Functionality
        var ColorTimeInterval;
        if (settings.colors != undefined && settings.colors.length > 0) {
            ThisBigBoxCloseCross.attr("colorcount", "0");

            ColorTimeInterval = setInterval(function () {

                var ColorIndex = ThisBigBoxCloseCross.attr("colorcount");

                ThisBigBoxCloseCross.animate({
                    backgroundColor: settings.colors[ColorIndex].color
                });

                ThisBigBox.animate({
                    backgroundColor: settings.colors[ColorIndex].color
                });

                ThisMiniIcon.animate({
                    backgroundColor: settings.colors[ColorIndex].color
                });

                if (ColorIndex < settings.colors.length - 1) {
                    ThisBigBoxCloseCross.attr("colorcount", ((ColorIndex * 1) + 1));
                } else {
                    ThisBigBoxCloseCross.attr("colorcount", 0);
                }

            }, settings.colortime);
        }


        //Close Cross

        $("#newTitlediv .botClose").bind('click', function () {
            $("#" + BigBoxid).remove();
            $("#divMiniIcons div").last().remove();

        });

        if (1==2 && settings.timeout != undefined) {
            
            var TimedID = BigBoxes;
            setTimeout(function () {
                clearInterval(ColorTimeInterval);
                $("#" + BigBoxid)
                    .removeClass("fadeIn fast")
                    .addClass("fadeOut fast").delay(300).queue(function () {
                        $(this).clearQueue();
                        $(this).remove();
                    });

                $("#miniIcon-" + TimedID)
                    .removeClass("fadeIn fast")
                    .addClass("fadeOut fast").delay(300).queue(function () {
                        $(this).clearQueue();
                        $(this).remove();
                    });
            }, settings.timeout);
        }
    }
})(jQuery);
