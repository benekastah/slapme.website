(function (self) {

var old$ = self.$;
var $ = self.$ = document.querySelector.bind(document);

$.noConflict = function () {
    self.$ = $.old$;
    return $;
};

var old$$ = self.$$
var $$ = self.$$ = document.querySelectorAll.bind(document);

$$.noConflict = function () {
    self.$$ = $$.old$$;
    return $$;
};

var isNode = function (el) {
    return el && typeof el === 'object' && 'nodeType' in el && el.nodeType > 0;
};

var isDocumentFragment = function (el) {
    return isNode(el) && el.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
};

var appendChildren = function (el, children) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (typeof child === 'string') {
            child = document.createTextNode(child);
        }
        el.appendChild(child);
    }
};

$.tag = function (tagname, attrs) {
    var childIndex = 1;
    var el = document.createElement(tagname);
    if (attrs && typeof attrs === 'object' && !isNode(attrs)) {
        childIndex = 2;
        for (var key in attrs) {
            el[key] = attrs[key];
        }
    }
    appendChildren(el, Array.prototype.slice.call(arguments, childIndex));
    return el;
};

$.fragment = function () {
    var fragment = document.createDocumentFragment();
    appendChildren(fragment, arguments);
    return fragment;
};

$.render = function (el, contents) {
    var children;
    if (contents instanceof Array) {
        children = contents;
    } else if (isDocumentFragment(contents)) {
        children = Array.prototype.slice.call(contents.childNodes, 0);
    } else {
        children = [contents];
    }
    var length = Math.max(el.childNodes.length, children.length);
    for (var i = 0; i < length; i++) {
        var current = el.childNodes[i];
        var next = children[i];
        if (!current) {
            el.appendChild(next);
        } else if (!next) {
            el.removeChild(current);
        } else if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) {
            el.insertBefore(next, current);
            el.removeChild(current);
        } else {
            for (var key in current) {
                var descriptor = Object.getOwnPropertyDescriptor(current, key);
                if (descriptor && descriptor.writable) {
                    current[key] = next[key];
                }
            }
            if (current.nodeType === Node.TEXT_NODE) {
                current.nodeValue = next.nodeValue;
            } else {
                $.render(current, Array.prototype.slice.call(next.childNodes, 0));
            }
        }
    }
};

var supportedTags = [
    'html', 'base', 'head', 'link', 'meta', 'style', 'title', 'address',
    'article', 'aside', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
    'hgroup', 'nav', 'section', 'dd', 'div', 'dl', 'dt', 'figcaption',
    'figure', 'hr', 'li', 'main', 'ol', 'p', 'pre', 'ul', 'a', 'abbr', 'b',
    'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd',
    'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small', 'span',
    'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'area', 'audio', 'img',
    'map', 'track', 'video', 'embed', 'object', 'param', 'source', 'canvas',
    'noscript', 'script', 'del', 'ins', 'caption', 'col', 'colgroup', 'table',
    'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'button', 'datalist',
    'fieldset', 'form', 'input', 'label', 'legend', 'meter', 'optgroup',
    'option', 'output', 'progress', 'select', 'textarea', 'details', 'dialog',
    'menu', 'menuitem', 'summary', 'shadow', 'slot', 'template', 'acronym',
    'applet', 'basefont', 'big', 'blink', 'center', 'command', 'content',
    'dir', 'element', 'font', 'frame', 'frameset', 'isindex', 'keygen',
    'listing', 'marquee', 'multicol', 'nextid', 'noembed', 'plaintext',
    'shadow', 'spacer', 'strike', 'tt', 'xmp'
];

supportedTags.forEach(function (tagname) {
    $[tagname] = $.tag.bind(null, tagname);
});

})(typeof self !== 'undefined' ? self : window);
