(function () {
    'use strict';

    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    var IMG_PREFIX = '/imgs/slaps-';
    var SLAPS = ['frying-pan.wav', 'punch.wav', 'slap.wav'];

    function Game() {
        this.damage = 0;
        this.blinking = false;
        this.socket = new WebSocket('ws://slapme.website/ws');
        this.socket.addEventListener('open', function () {
            this.send(['start']);
        }.bind(this));
        this.socket.onmessage = function (ev) {
            var data = JSON.parse(ev.data);
            var method = 'on_' + data[0];
            if (method in this) {
                this[method].apply(this, data.slice(1));
            } else {
                console.error('No method ' + method);
            }
        }.bind(this);
        this.render();
        this.blink();
    }

    Game.prototype.send = function (data) {
        this.socket.send(JSON.stringify(data));
    };

    Game.prototype.notify = function (msg) {
        var status = $('#status');
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(msg));
        status.appendChild(li);
    };

    Game.prototype.on_game = function (gameId) {
        this.notify('To slap this stupid face, visit slapme.website/c on a ' +
                    'mobile device and enter the phrase "' + gameId + '"');
    };

    Game.prototype.on_slap = function (damage) {
        var sound = new Audio('/audio/' + SLAPS[Math.floor(Math.random() * SLAPS.length)]);
        sound.play();
        this.damage += damage;
        this.render();
    };

    Game.prototype.blink = function () {
        setTimeout(function () {
            this.blinking = true;
            this.render();
            setTimeout(function () {
                this.blinking = false;
                this.render();
                this.blink();
            }.bind(this), 100 + (Math.random() * 500));
        }.bind(this), 2000 + (Math.random() * 5000));
    };

    Game.prototype.render = function () {
        var damageLevels = [10, 25, 65, 100, 120, 150];
        var a = damageLevels.length;
        for (var i = 0; i < damageLevels.length; i++) {
            if (this.damage < damageLevels[i]) {
                a = i + 1;
                break;
            }
        }
        var face = $('#face');
        face.setAttribute('class', '');
        face.classList.add('d' + a);
        if (this.blinking) {
            face.classList.add('blinking');
        }
        if (a >= 5) {
            var h1 = $('h1');
            h1.innerHTML = 'ded.';
        }
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        var game = new Game();
    });
})();
