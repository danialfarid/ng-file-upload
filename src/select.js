"use strict";
var Select = (function () {
    function Select(el, resetOnClick) {
        var _this = this;
        this.resetModel = function (evt) {
            if (!_this.resetOnClick)
                return;
            if (_this.elem.value) {
                _this.elem.value = null;
                _this.elem.dispatchEvent(new CustomEvent('change', { detail: { files: null, origEvent: evt } }));
            }
        };
        this.ie10SameFileSelectFix = function (evt) {
            if (_this.elem && !_this.elem.getAttribute('__ngf_ie10_Fix_')) {
                if (!_this.elem.parentNode) {
                    _this.elem = null;
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                var clone = _this.elem.cloneNode();
                _this.elem.parentNode.insertBefore(clone, _this.elem);
                _this.elem.parentNode.removeChild(_this.elem);
                _this.elem = clone;
                _this.elem.setAttribute('__ngf_ie10_Fix_', 'true');
                _this.elem.addEventListener('click', _this.ie10SameFileSelectFix);
                _this.elem.click();
                return false;
            }
            else {
                _this.elem.removeAttribute('__ngf_ie10_Fix_');
            }
        };
        this.elem = el;
        this.resetOnClick = resetOnClick;
        this.init();
    }
    Select.prototype.init = function () {
        this.elem.addEventListener('click', this.resetModel);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.addEventListener('click', this.ie10SameFileSelectFix);
        }
    };
    Select.prototype.destroy = function () {
        this.elem.removeEventListener('click', this.resetModel);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.removeEventListener('click', this.ie10SameFileSelectFix);
        }
    };
    return Select;
}());
exports.Select = Select;
//# sourceMappingURL=select.js.map