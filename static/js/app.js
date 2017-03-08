(function () {
    'use strict';

    var LEVEL = location.pathname.slice(1);
    var SLAPS = ['frying-pan.wav', 'punch.wav', 'slap.wav'];

    function Game() {
        SlapMe.Client.apply(this, arguments);
        this.damage = 0;
        this.blinking = false;
        this.clients = {};
        this.render();
        this.blink();
        this.createSocket('ws://slapme.website/ws');
    }

    Game.prototype = Object.create(SlapMe.Client.prototype);
    Game.prototype.constructor = Game;

    Game.prototype.notify = function (msg) {
        if (!this.notificationId) {
            this.notificationId = 1;
        }
        var id = 'notifictions' + (this.notificationId++);
        $('#notifications').appendChild($.div({id: id, className: 'bubble'}));
        $.render($('#' + id), msg);
        setTimeout(function () {
            $('#' + id).classList.add('dying');
            setTimeout(function () {
                $('#notifications').removeChild($('#' + id));
            }, 1000);
        }, 500);
    };

    Game.prototype.on_game = function (gameId) {
        this.url = this.url + '/' + gameId;
        $.render($('#instructions'), $.fragment(
            $.p('Use your phone to visit ', $.big('slapme.website/c/', gameId)),
            $.p($.strong('Don\'t close this page!'),
                ' Good for 1+ players.')));
    };

    Game.prototype.on_join = function (clientName) {
        if (!(clientName in this.clients)) {
            this.clients[clientName] = {points: 0};
            this.notify($.fragment($.strong(clientName), ' joined the game!'));
        }
        this.render();
    };

    Game.prototype.on_slap = function (player, damage, totalPoints) {
        var sound = new Audio('/audio/' + SLAPS[Math.floor(Math.random() * SLAPS.length)]);
        sound.play();
        var newPoints = totalPoints - this.clients[player].points;
        if (newPoints > 0) {
            this.notify($.fragment('+' + newPoints));
        }
        this.clients[player].points = totalPoints;
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
        face.setAttribute('class', LEVEL);
        face.classList.add('d' + a);
        if (this.blinking) {
            face.classList.add('blinking');
        }
        if (a >= 5) {
            var h1 = $('h1');
            h1.innerHTML = 'ded.';
        }

        $.render($('#players'), Object.keys(this.clients).sort().map(function (player) {
            return $.li({className: 'bubble'}, player, ': +', '' + this.clients[player].points);
        }, this));
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        if (LEVEL) {
            $('#face').classList.add(LEVEL);
        }
        var game = new Game();
    });
})();
