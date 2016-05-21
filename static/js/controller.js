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
            this.notifications.push([
                ['p', {}, ['Welcome, ', ['strong', {}, this.name], '!']],
                ['p', {}, ['To slap that face, swing your phone around in the air. ',
                           'The harder you slap, the more damage you do!']]]);
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

    Controller.prototype.slap = function (impact) {
        var thisDamage = Math.max.apply(Math, impact) / 50;
        if (thisDamage < 1 || Date.now() - this.slappedAt < 500) {
            return;
        }
        this.send(['slap', thisDamage]);
        this.slappedAt = Date.now();
        this.points += thisDamage;
        this.render();
    };

    Controller.prototype.join = function (ev) {
        ev.preventDefault();
        this.createSocket('ws://slapme.website/ws/' + ev.target.elements.gameId.value);
    };

    Controller.prototype.render = function () {
        var fragment;
        if (!this.joined) {
            fragment = SlapMe.toDOM(['form', {onsubmit: this.join}, [
                ['p', {}, [['label', {}, [
                    ['input', {type: 'text', name: 'gameId', autofocus: true}]]]]],
                ['button', {type: 'submit'}, 'OK']
            ]]);
        } else {
            fragment = SlapMe.toDOM(
                ['p', {}, ['' + Math.round(this.points * 100), ' points']],
                ['ul', {}, this.notifications.map(function (note) {
                    return ['li', {}, note];
                })]);
        }
        SlapMe.render(document.body, fragment);
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        var controller = new Controller();
        controller.render();
    });
})();
