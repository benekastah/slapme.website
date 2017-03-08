(function () {
    "use strict";

    function Controller() {
        SlapMe.Client.apply(this, arguments);
        this.slappedAt = 0;
        this.joined = false;
        this.notifications = [];
        this.name = SlapMe.getSillyName();
        this.points = 0;
    }

    Controller.prototype = Object.create(SlapMe.Client.prototype);
    Controller.prototype.constructor = Controller;

    Controller.prototype.socketOpen = function () {
        this.send(['join', this.name]);
        if (!this.joined) {
            this.joined = true;
            this.notifications.push(function () {
                return $.fragment(
                    $.p('Welcome ', $.strong(this.name), '!'),
                    $.p('To slap that face, swing your phone around in the air. ',
                        'The harder you slap, the more damage you do!'));
            }.bind(this));
            this.render();
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', function () {
                    this.slap([event.acceleration.x * 2, event.acceleration.y * 2]);
                }.bind(this), true);
            } else if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", function () {
                    this.slap([event.beta, event.gamma]);
                }.bind(this), true);
            } else {
                window.addEventListener("MozOrientation", function () {
                    this.slap([orientation.x * 50, orientation.y * 50]);
                }.bind(this), true);
            }
        }
    };

    Controller.prototype.socketError = function (ev) {
        document.body.innerHTML = 'ERROR!';
    };

    Controller.prototype.on_game = function (gameId) {
        this.notifications = [function () {
            return $.big('This game doesn\'t exist! Please check the URL again.');
        }];
        this.joined = false;
        this.render();
    };

    Controller.prototype.slap = function (impact) {
        var thisDamage = Math.max.apply(Math, impact) / 50;
        if (thisDamage < 1 || Date.now() - this.slappedAt < 500) {
            return;
        }
        this.points += Math.round(thisDamage * 100);
        this.send(['slap', this.name, thisDamage, this.points]);
        this.slappedAt = Date.now();
        this.render();
    };

    Controller.prototype.join = function () {
        var gameId = location.pathname.split('/')[2];
        if (!gameId) {
            this.notifications.push(function () {
                return $.big('Incorrect URL. Please ensure you entered it correctly!');
            });
            this.render();
            return;
        }
        this.createSocket('ws://slapme.website/ws/' + gameId);
    };

    Controller.prototype.render = function () {
        $.render(document.body, $.fragment(
            this.joined ? $.big('+' + this.points) : '',
            $.ul.apply($, this.notifications.map(function (render) {
                return $.li(render());
            }))
        ));
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        var controller = new Controller();
        controller.join();
        controller.render();
    });
})();
