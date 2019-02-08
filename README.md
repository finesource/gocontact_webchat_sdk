# GoContact Client Webchat Interface SDK

This repository is the base SDK for the Webchat Client in GoContact

The base configuration for the startup of the module is:

```javascript
    window.FSWebChat || (function(d, s) {
        var fs = FSWebChat = function() {};
        fs._s = d.createElement(s);
        fs._h = d.getElementsByTagName(s)[0];
        fs._hashkey = '07bde72f04518c47ac508d4c98fd791cfd9d1e1d';
        fs._subfolder = '';
        fs._server = '213.58.153.217:50005';
        fs._timestamp = +new Date;
        fs._s.setAttribute("charset", "utf-8");
        fs._s.src = fs._server+"/"+fs._hashkey;
        fs._s.type = 'text/javascript';
        fs._s.async = true;
        fs._h.parentNode.insertBefore(fs._s, fs._h);
    })(document, "script");
```

The following parameters change by configuration:

    fs._hashkey = '07bde72f04518c47ac508d4c98fd791cfd9d1e1d';
    fs._server = '213.58.153.217:50005';
    
The _hashkey parameter represents the specific Webchat Instance (or channel) that you want to use 

The _server parameter is the specific GoContact backend that is running that Webchat Instance.

# What this repo is for

You can use this code as documentation for building your own GoContact Webchat Interface
If this is your goal then you need to start by looking at ```source_init/init.js``` and build your version of it.

After that we sugest you look into ```WebChatClienteController.prototype._openWsConnection``` and then ```source_chat_files/js/webchat.js```

# What this repo is not for

You should not try to commit here so that it gets included in GoContact.

No beer for you!
