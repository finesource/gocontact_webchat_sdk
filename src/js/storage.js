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