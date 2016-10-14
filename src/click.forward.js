"use strict";
var ClickForward = (function () {
    function ClickForward(el, target) {
        var _this = this;
        this.clickHandler = function (evt) {
            if (evt.target && evt.target.getAttribute('disabled') || evt.target != _this.elem)
                return false;
            var r = _this.detectSwipe(evt);
            // prevent the click if it is a swipe
            if (r != null)
                return r;
            // if (ClickForward.isDelayedClickSupported(navigator.userAgent)) {
            setTimeout(function (el) {
                el.click();
            }, 0, _this.target);
            // } else {
            //     this.target.click();
            // }
            if (_this.elem.contains(_this.target))
                evt.stopPropagation();
            return false;
        };
        this.initialTouchStartY = 0;
        this.initialTouchStartX = 0;
        this.detectSwipe = function (evt) {
            var touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
            if (touches) {
                if (evt.type === 'touchstart') {
                    _this.initialTouchStartX = touches[0].clientX;
                    _this.initialTouchStartY = touches[0].clientY;
                    return true; // don't block event default
                }
                else {
                    // prevent scroll from triggering event
                    if (evt.type === 'touchend') {
                        var currentX = touches[0].clientX;
                        var currentY = touches[0].clientY;
                        if ((Math.abs(currentX - _this.initialTouchStartX) > 20) ||
                            (Math.abs(currentY - _this.initialTouchStartY) > 20)) {
                            evt.stopPropagation();
                            evt.preventDefault();
                            return false;
                        }
                    }
                    return true;
                }
            }
        };
        this.target = target;
        this.elem = el;
        el.addEventListener('click', this.clickHandler, false);
        el.addEventListener('touchstart', this.clickHandler, false);
        el.addEventListener('touchend', this.clickHandler, false);
    }
    ClickForward.isDelayedClickSupported = function (ua) {
        // fix for android native browser < 4.4 and safari windows
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
        if (m && m.length > 2) {
            return parseInt(m[1]) < 4 || (parseInt(m[1]) === 4 && parseInt(m[2]) < 4);
        }
        // safari on windows
        return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*!/.test(ua);
    };
    ClickForward.prototype.destroy = function () {
        this.elem.removeEventListener('click', this.clickHandler);
        this.elem.removeEventListener('touchstart', this.clickHandler);
        this.elem.removeEventListener('touchend', this.clickHandler);
    };
    return ClickForward;
}());
exports.ClickForward = ClickForward;
//# sourceMappingURL=click.forward.js.map