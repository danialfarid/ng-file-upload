export class ClickForward {
    public target: HTMLElement;
    private elem;

    constructor(el: HTMLElement, target: HTMLElement) {
        this.target = target;
        this.elem = el;
        el.addEventListener('click', this.clickHandler);
        el.addEventListener('touchstart', this.clickHandler);
        el.addEventListener('touchend', this.clickHandler);
    }

    private static isDelayedClickSupported(ua) {
        // fix for android native browser < 4.4 and safari windows
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
        if (m && m.length > 2) {
            return parseInt(m[1]) < 4 || (parseInt(m[1]) === 4 && parseInt(m[2]) < 4);
        }

        // safari on windows
        return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*!/.test(ua);
    }

    clickHandler = (evt) => {
        if (evt.target && evt.target.getAttribute('disabled') || evt.target != this.elem) return false;
        var r = this.detectSwipe(evt);
        // prevent the click if it is a swipe
        if (r != null) return r;

        if (ClickForward.isDelayedClickSupported(navigator.userAgent)) {
            setTimeout(function (el) {
                el.click();
            }, 0, this.target);
        } else {
            this.target.click();
        }
        if (this.elem.contains(this.target)) evt.stopPropagation();
        return false;
    };

    private initialTouchStartY = 0;
    private initialTouchStartX = 0;

    detectSwipe = (evt) => {
        var touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
        if (touches) {
            if (evt.type === 'touchstart') {
                this.initialTouchStartX = touches[0].clientX;
                this.initialTouchStartY = touches[0].clientY;
                return true; // don't block event default
            } else {
                // prevent scroll from triggering event
                if (evt.type === 'touchend') {
                    var currentX = touches[0].clientX;
                    var currentY = touches[0].clientY;
                    if ((Math.abs(currentX - this.initialTouchStartX) > 20) ||
                        (Math.abs(currentY - this.initialTouchStartY) > 20)) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        return false;
                    }
                }
                return true;
            }
        }
    };

    destroy() {
        this.elem.removeEventListener('click', this.clickHandler);
        this.elem.removeEventListener('touchstart', this.clickHandler);
        this.elem.removeEventListener('touchend', this.clickHandler);
    }
}