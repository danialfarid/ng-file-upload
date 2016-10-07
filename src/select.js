"use strict";
var __ngfGeneratedElems__ = [];
var Select = (function () {
    function Select(el, attrGetter) {
        var _this = this;
        this.isInputTypeFile = function () {
            return _this.elem.tagName.toLowerCase() === 'input' &&
                _this.elem.getAttribute('type') && _this.elem.getAttribute('type').toLowerCase() === 'file';
        };
        this.changeFn = function (evt) {
            if (_this.attrGetter('selectDisabled'))
                return;
            var fileList = evt.target && evt.target.files, files = [];
            for (var i = 0; i < fileList.length; i++) {
                files.push(fileList[i]);
            }
            _this.elem.dispatchEvent(new CustomEvent('fileSelect', { detail: { files: files.length ? files : null, origEvent: evt } }));
        };
        this.updateId = function (val) {
            _this.fileElem.setAttribute('id', 'ngf-' + val);
            _this.label.setAttribute('id', 'ngf-label-' + val);
        };
        this.clickHandler = function (evt) {
            if (_this.elem.getAttribute('disabled'))
                return false;
            if (_this.attrGetter('ngfSelectDisabled'))
                return;
            var r = _this.detectSwipe(evt);
            // prevent the click if it is a swipe
            if (r != null)
                return r;
            _this.resetModel(evt);
            // fix for md when the element is removed from the DOM and added back #460
            try {
                if (!_this.isInputTypeFile() && !document.body.contains(_this.fileElem)) {
                    __ngfGeneratedElems__.push({ el: _this.elem, ref: _this.fileElem.parentNode });
                    document.body.appendChild(_this.fileElem.parentNode);
                    _this.fileElem.addEventListener('change', _this.changeFn);
                }
            }
            catch (e) {
            }
            if (Select.isDelayedClickSupported(navigator.userAgent)) {
                setTimeout(function (fileElem) {
                    fileElem.click();
                }, 0, _this.fileElem);
            }
            else {
                _this.fileElem.click();
            }
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
        this.resetModel = function (evt) {
            if (_this.attrGetter('clickDisabled'))
                return;
            if (_this.fileElem.value) {
                _this.fileElem.value = null;
                _this.elem.dispatchEvent(new CustomEvent('fileSelect', { detail: { files: null, origEvent: evt } }));
            }
        };
        this.ie10SameFileSelectFix = function (evt) {
            if (_this.fileElem && !_this.fileElem.getAttribute('__ngf_ie10_Fix_')) {
                if (!_this.fileElem.parentNode) {
                    _this.fileElem = null;
                    return;
                }
                evt.preventDefault();
                evt.stopPropagation();
                var clone = _this.fileElem.cloneNode();
                _this.fileElem.parentNode.insertBefore(clone, _this.fileElem);
                _this.fileElem.parentNode.removeChild(_this.fileElem);
                _this.fileElem = clone;
                _this.fileElem.setAttribute('__ngf_ie10_Fix_', 'true');
                _this.fileElem.addEventListener('change', _this.changeFn);
                _this.fileElem.addEventListener('click', _this.ie10SameFileSelectFix);
                _this.fileElem.click();
                return false;
            }
            else {
                _this.fileElem.removeAttribute('__ngf_ie10_Fix_');
            }
        };
        this.elem = el;
        this.attrGetter = attrGetter;
        this.createFileInput();
        this.fileElem.addEventListener('change', this.changeFn);
        if (!this.isInputTypeFile()) {
            this.elem.addEventListener('click', this.clickHandler);
            this.elem.addEventListener('touchstart', this.clickHandler);
            this.elem.addEventListener('touchend', this.clickHandler);
        }
        else {
            this.elem.addEventListener('click', this.resetModel);
        }
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.fileElem.addEventListener('click', this.ie10SameFileSelectFix);
        }
        setTimeout(function () {
            for (var i = 0; i < __ngfGeneratedElems__.length; i++) {
                var g = __ngfGeneratedElems__[i];
                if (!document.body.contains(g.el)) {
                    __ngfGeneratedElems__.splice(i, 1);
                    g.ref.parentNode.removeChild(g.ref);
                }
            }
        }, 0);
        // if (ngModel) ngModel.$formatters.push(function (val) {
        //     if (val == null || val.length === 0) {
        //         if (fileElem.val()) {
        //             fileElem.val(null);
        //         }
        //     }
        //     return val;
        // });
        // upload.registerModelChangeValidator(ngModel, attr, scope);
        // unwatches.push(attr.$observe('id', this.updateId));
    }
    Select.isDelayedClickSupported = function (ua) {
        // fix for android native browser < 4.4 and safari windows
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
        if (m && m.length > 2) {
            return parseInt(m[1]) < 4 || (parseInt(m[1]) === 4 && parseInt(m[2]) < 4);
        }
        // safari on windows
        return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*!/.test(ua);
    };
    Select.prototype.bindAttrToFileInput = function () {
        for (var i = 0; i < this.elem.attributes.length; i++) {
            var attribute = this.elem.attributes[i];
            if (attribute.name !== 'type' && attribute.name !== 'class' && attribute.name !== 'style') {
                if (attribute.name === 'id') {
                    this.updateId(attribute.value);
                }
                else {
                    this.fileElem.setAttribute(attribute.name, (!attribute.value && (attribute.name === 'required' ||
                        attribute.name === 'multiple')) ? attribute.name : attribute.value);
                }
            }
        }
    };
    Select.prototype.createFileInput = function () {
        if (this.isInputTypeFile()) {
            return this.fileElem = this.elem;
        }
        this.fileElem = document.createElement('input');
        this.fileElem.setAttribute('type', 'file');
        this.label = document.createElement('label');
        this.bindAttrToFileInput();
        this.label.setAttribute('style', 'visibility: hidden;position:absolute;' +
            'overflow:hidden;width:0px;height:0px;border:none;margin:0px;padding:0px');
        this.label.setAttribute('tabindex', '-1');
        __ngfGeneratedElems__.push({ el: this.elem, ref: this.label });
        this.label.appendChild(this.fileElem);
        document.body.appendChild(this.label);
    };
    Select.prototype.destroy = function () {
        if (!this.isInputTypeFile()) {
            this.fileElem.parentNode.parentNode.removeChild(this.fileElem.parentNode);
        }
    };
    return Select;
}());
exports.Select = Select;
//# sourceMappingURL=select.js.map