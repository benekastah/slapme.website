(function () {
    "use strict";

    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    var socket = new WebSocket('ws://localhost:8765');

    document.addEventListener("DOMContentLoaded", function(event) {
        render();
        blink();
    });

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function () {
            slap([event.beta, event.gamma]);
        }, true);
    } else if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', function () {
            slap([event.acceleration.x * 2, event.acceleration.y * 2]);
        }, true);
    } else {
        window.addEventListener("MozOrientation", function () {
            slap([orientation.x * 50, orientation.y * 50]);
        }, true);
    }

    var slap = function (impact) {
        var damage = Math.max.apply(Math, impact) / 130;
        if (damage < 1) {
            return;
        }
    };
})();
