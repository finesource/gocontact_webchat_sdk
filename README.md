# GoContact Client Webchat Interface SDK

This repository is the base SDK for the Webchat Client in GoContact.
It is compatible with 2021.2+ GoContact CCaaS releases. 

The base configuration for the startup of the module is (this is just an example):

```javascript
<script id="script_of_FSWebChat" type="text/javascript">
    window.FSWebChat || (function(d, s) {
        var fs = FSWebChat = function() {};
        fs._s = d.createElement(s);
        fs._h = d.getElementsByTagName(s)[0];
        fs._domain = 'f3274b18-6a93-43e4-9829-95318717a4a0';
        fs._hashkey = '033d341c4b3eae401cf55e0f9cdda7d8809b776b';
        fs._subfolder = '';
        fs._server = 'https://<hostname>:443/poll';
        fs._service = '/new-webchat-service';
        fs._timestamp = +new Date;
        fs._s.setAttribute("charset", "utf-8");
        fs._s.src = fs._server + fs._service + "/startup/" + fs._domain + "/" + fs._hashkey;
        fs._s.type = 'text/javascript';
        fs._s.async = true;
        fs._h.parentNode.insertBefore(fs._s, fs._h);
    })(document, "script");
</script>
```

The following parameters are changed by configuration:

        fs._domain = 'f3274b18-6a93-43e4-9829-95318717a4a0';
        fs._hashkey = '033d341c4b3eae401cf55e0f9cdda7d8809b776b';
        fs._server = 'https://<hostname>:443/poll';

The _domain parameter represents the account instance that you are connecting to (Domain UUID)

The _hashkey parameter represents the specific Webchat Instance (or channel) that you want to use 

The _server parameter is the specific GoContact backend that is running that Webchat Instance.

# What this repo is for

You can use this code as documentation for building your own GoContact Webchat Interface
If this is your goal then you need to start by looking at ```init.js``` and build your version of it.

After that we sugest you look into ```js/webchat.js```

# What this repo is not for

You should not try to commit here so that it gets included in GoContact.

No beer for you!
