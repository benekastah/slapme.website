(function () {
    "use strict";

    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    var socket = new WebSocket('ws://slapme.website/ws');

    socket.onmessage = function (ev) {
        if (ev.data === '["joined"]') {
            document.body.innerHTML = 'Joined!';
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', function () {
                    slap([event.acceleration.x * 2, event.acceleration.y * 2]);
                }, true);
            } else if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", function () {
                    slap([event.beta, event.gamma]);
                }, true);
            } else {
                window.addEventListener("MozOrientation", function () {
                    slap([orientation.x * 50, orientation.y * 50]);
                }, true);
            }
        }
    };

    var slappedAt = 0;
    var slap = function (impact) {
        var thisDamage = Math.max.apply(Math, impact) / 50;
        if (thisDamage < 1 || Date.now() - slappedAt < 500) {
            return;
        }
        socket.send(JSON.stringify(['slap', thisDamage]));
        slappedAt = Date.now();
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        var gameForm = $('#game-form');
        gameForm.addEventListener('submit', function (ev) {
            ev.preventDefault();
            socket.send(JSON.stringify([
                'join', ev.target.elements.gameId.value, ev.target.elements.name.value]));
        });
    });
})();
