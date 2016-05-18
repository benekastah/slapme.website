(function () {
    'use strict';

    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    var IMG_PREFIX = '/static/imgs/slaps-';

    var game = {
        damage: 0,
        blinking: false,
        socket: new WebSocket('ws://localhost:8765')
    };

    document.addEventListener('DOMContentLoaded', function(event) {
        render();
        blink();
    });

    var slap = function (impact) {
        var maxImpact = Math.max.apply(Math, impact) / 130;
        if (maxImpact < 1) {
            return;
        }
        game.damage += maxImpact;
        render();
    };

    var blink = function () {
        setTimeout(function () {
            game.blinking = true;
            render();
            setTimeout(function () {
                game.blinking = false;
                render();
                blink();
            }, 100 + (Math.random() * 500));
        }, 2000 + (Math.random() * 5000));
    };

    var render = function () {
        var img = $('#stupid-face');
        var damageLevels = [10, 25, 65, 100, 120, 150];
        var a = damageLevels.length;
        for (var i = 0; i < damageLevels.length; i++) {
            if (game.damage < damageLevels[i]) {
                a = i + 1;
                break;
            }
        }
        var src = a;
        if (a <= 4) {
            src = [src, Number(game.blinking) + 1].join('-');
        }
        img.setAttribute('src', IMG_PREFIX + src + '.jpg');
        if (a >= 5) {
            var h1 = $('h1');
            h1.innerHTML = 'ded.';
        }
    };
})();
