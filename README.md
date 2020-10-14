# GoContact Client Webchat Interface SDK

This repository is the base SDK for the Webchat Client in GoContact

The base configuration for the startup of the module is:

```javascript
    window.FSWebChat || (function(d, s) {
        var fs = FSWebChat = function() {};
        fs._s = d.createElement(s);
        fs._h = d.getElementsByTagName(s)[0];
        fs._domain = 'f3274b18-6a93-43e4-9829-95318717a4a0';
        fs._hashkey = '07bde72f04518c47ac508d4c98fd791cfd9d1e1d';
        fs._subfolder = '';
        fs._server = '213.58.153.217:50002';
        fs._endpoint_rest = 'new-webchat-service';
        fs._endpoint_ws = 'ws-service-webchat';
        fs._timestamp = +new Date;
        fs._s.setAttribute("charset", "utf-8");
        fs._s.src = fs._server + '/' + fs._endpoint_rest + '/startup/' + fs._domain + '/' + fs._hashkey;
        fs._s.type = 'text/javascript';
        fs._s.async = true;
        fs._h.parentNode.insertBefore(fs._s, fs._h);
    })(document, "script");
```

The following parameters change by configuration:

    fs._domain = 'f3274b18-6a93-43e4-9829-95318717a4a0';
    fs._hashkey = '07bde72f04518c47ac508d4c98fd791cfd9d1e1d';
    fs._server = '213.58.153.217:50002';

The _domain parameter represents the account instance that you are connecting to

The _hashkey parameter represents the specific Webchat Instance (or channel) that you want to use 

The _server parameter is the specific GoContact backend that is running that Webchat Instance.

# What this repo is for

You can use this code as documentation for building your own GoContact Webchat Interface
If this is your goal then you need to start by looking at ```init.js``` and build your version of it.

After that we sugest you look into ```js/webchat.js```

# What this repo is not for

You should not try to commit here so that it gets included in GoContact.

No beer for you!
