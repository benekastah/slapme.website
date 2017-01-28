(function () {
    'use strict';

    SlapMe.$ = document.querySelector.bind(document);
    SlapMe.$$ = document.querySelectorAll.bind(document);

    SlapMe.autobind = function (obj) {
        for (var attr in obj) {
            var val = obj[attr];
            if (typeof val === 'function') {
                obj[attr] = val.bind(obj);
            }
        }
    };

    function Client() {
        SlapMe.autobind(this);
    }
    SlapMe.Client = Client;

    Client.prototype.eventToMethod = {
        'open': 'socketOpen',
        'close': 'socketClose',
        'message': 'socketMessage',
        'error': 'socketError'
    };

    Client.prototype.createSocket = function (url) {
        this.url = url;
        this.socket = new WebSocket(url);
        for (var event in this.eventToMethod) {
            var eventHandler = this[this.eventToMethod[event]];
            if (eventHandler) {
                this.socket.addEventListener(event, eventHandler.bind(this));
            }
        }
    },

    Client.prototype.socketMessage = function (ev) {
        var data = JSON.parse(ev.data);
        var method = 'on_' + data[0];
        if (method in this) {
            this[method].apply(this, data.slice(1));
        } else {
            console.warn('No method ' + method);
        }
    };

    Client.prototype.socketClose = function (ev) {
        setTimeout(this.createSocket.bind(null, this.url), 500);
    };

    Client.prototype.send = function (data) {
        this.socket.send(JSON.stringify(data));
    };


    var toType = SlapMe.toType = function(obj) {
          return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    };

    SlapMe.toDOM = function () {
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < arguments.length; i++) {
            var tag = arguments[i];
            var el;
            if (toType(tag) === 'string') {
                el = document.createTextNode(tag);
            } else {
                var tagName = tag[0];
                var attrs = tag[1] || {};
                var contents = tag[2];
                var el = document.createElement(tagName);
                for (var attrName in attrs) {
                    var val = attrs[attrName];
                    if (val === false) { continue; }
                    if (toType(val) === 'function') {
                        el[attrName] = val;
                    } else {
                        el.setAttribute(attrName, val === true ? attrName : val);
                    }
                }
                if (contents) {
                    if (toType(contents) === 'string') {
                        contents = [contents];
                    }
                    el.appendChild(SlapMe.toDOM.apply(null, contents));
                }
            }
            fragment.appendChild(el);
        }
        return fragment;
    };

    SlapMe.render = function (parent, child) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        parent.appendChild(child);
    };

})();
