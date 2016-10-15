"use strict";
var Select = (function () {
    function Select(elem, fileElem, attrGetter) {
        var _this = this;
        this.elem = elem;
        this.fileElem = fileElem;
        this.attrGetter = attrGetter;
        this.resetModel = function (e) {
            if (!_this.attrGetter('resetOnClick'))
                return;
            if (_this.fileElem.value) {
                _this.fileElem.value = null;
                _this.elem.dispatchEvent(new CustomEvent('change', { detail: { files: null, origEvent: e } }));
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
                _this.elem.addEventListener('click', _this.ie10SameFileSelectFix, false);
                _this.elem.click();
                return false;
            }
            else {
                _this.elem.removeAttribute('__ngf_ie10_Fix_');
            }
        };
        this.init();
    }
    Select.prototype.init = function () {
        this.elem.addEventListener('click', this.resetModel, false);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.addEventListener('click', this.ie10SameFileSelectFix, false);
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