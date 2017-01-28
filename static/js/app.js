(function () {
    'use strict';

    var LEVEL = location.pathname.slice(1);
    var SLAPS = ['frying-pan.wav', 'punch.wav', 'slap.wav'];

    function Game() {
        SlapMe.Client.apply(this, arguments);
        this.damage = 0;
        this.blinking = false;
        this.render();
        this.blink();
        this.notifications = []
        this.createSocket('ws://slapme.website/ws');
        this.clients = {};
    }

    Game.prototype = Object.create(SlapMe.Client.prototype);
    Game.prototype.constructor = Game;

    Game.prototype.notify = function (msg) {
        this.notifications.push(msg);
        var notifications = this.notifications.map(function (msg) {
            return ['li', {}, msg];
        });
        SlapMe.render(SlapMe.$('#status'), SlapMe.toDOM.apply(null, notifications));
    };

    Game.prototype.on_game = function (gameId) {
        this.url = this.url + '/' + gameId;
        this.notify([
            'To slap this stupid face, visit ', ['strong', {}, ['slapme.website/c']],
            ' on a mobile device and enter the phrase ', ['strong', {}, [['code', {}, gameId]]],
            '. ', ['strong', {}, 'Don\'t close this page! '], 'Good for 1+ players.']);
    };

    Game.prototype.on_join = function (clientName) {
        if (!(clientName in this.clients)) {
            this.clients[clientName] = true;
            this.notify([
                ['strong', {}, clientName], ' joined the game!'
            ]);
        }
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
        var face = SlapMe.$('#face');
        face.setAttribute('class', LEVEL);
        face.classList.add('d' + a);
        if (this.blinking) {
            face.classList.add('blinking');
        }
        if (a >= 5) {
            var h1 = SlapMe.$('h1');
            h1.innerHTML = 'ded.';
        }
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        if (LEVEL) {
            SlapMe.$('#face').classList.add(LEVEL);
        }
        var game = new Game();
    });
})();
