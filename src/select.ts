var __ngfGeneratedElems__: Array<any> = [];

export class Select {
    private elem: HTMLElement;
    private fileElem: HTMLInputElement;
    private label: HTMLElement;
    private updateModel: Function;
    private attrGetter: Function;

    constructor(el: HTMLElement, attrGetter: Function) {
        this.elem = el;
        this.attrGetter = attrGetter;

        this.createFileInput();
        this.fileElem.addEventListener('change', this.changeFn);

        if (!this.isInputTypeFile()) {
            this.elem.addEventListener('click', this.clickHandler);
            this.elem.addEventListener('touchstart', this.clickHandler);
            this.elem.addEventListener('touchend', this.clickHandler);
        } else {
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

    private static isDelayedClickSupported(ua) {
        // fix for android native browser < 4.4 and safari windows
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
        if (m && m.length > 2) {
            return parseInt(m[1]) < 4 || (parseInt(m[1]) === 4 && parseInt(m[2]) < 4);
        }

        // safari on windows
        return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*!/.test(ua);
    }

    private isInputTypeFile = () => {
        return this.elem.tagName.toLowerCase() === 'input' &&
            this.elem.getAttribute('type') && this.elem.getAttribute('type').toLowerCase() === 'file';
    };

    changeFn = (evt) => {
        if (this.attrGetter('selectDisabled')) return;
        var fileList = evt.target && evt.target.files, files = [];
        for (var i = 0; i < fileList.length; i++) {
            files.push(fileList[i]);
        }
        this.elem.dispatchEvent(new CustomEvent('fileSelect', {detail: {files: files.length ? files : null, origEvent: evt}}))
    };

    updateId = (val) => {
        this.fileElem.setAttribute('id', 'ngf-' + val);
        this.label.setAttribute('id', 'ngf-label-' + val);
    };

    bindAttrToFileInput() {
        for (var i = 0; i < this.elem.attributes.length; i++) {
            var attribute = this.elem.attributes[i];
            if (attribute.name !== 'type' && attribute.name !== 'class' && attribute.name !== 'style') {
                if (attribute.name === 'id') {
                    this.updateId(attribute.value);
                } else {
                    this.fileElem.setAttribute(attribute.name, (!attribute.value && (attribute.name === 'required' ||
                    attribute.name === 'multiple')) ? attribute.name : attribute.value);
                }
            }
        }
    }

    createFileInput() {
        if (this.isInputTypeFile()) {
            return this.fileElem = <HTMLInputElement>this.elem;
        }

        this.fileElem = document.createElement('input');
        this.fileElem.setAttribute('type', 'file');

        this.label = document.createElement('label');
        this.bindAttrToFileInput();
        this.label.setAttribute('style', 'visibility: hidden;position:absolute;' +
            'overflow:hidden;width:0px;height:0px;border:none;margin:0px;padding:0px');
        this.label.setAttribute('tabindex', '-1');
        __ngfGeneratedElems__.push({el: this.elem, ref: this.label});

        this.label.appendChild(this.fileElem);
        document.body.appendChild(this.label);
    }


    clickHandler = (evt) => {
        if (this.elem.getAttribute('disabled')) return false;
        if (this.attrGetter('ngfSelectDisabled')) return;

        var r = this.detectSwipe(evt);
        // prevent the click if it is a swipe
        if (r != null) return r;

        this.resetModel(evt);

        // fix for md when the element is removed from the DOM and added back #460
        try {
            if (!this.isInputTypeFile() && !document.body.contains(this.fileElem)) {
                __ngfGeneratedElems__.push({el: this.elem, ref: this.fileElem.parentNode});
                document.body.appendChild(this.fileElem.parentNode);
                this.fileElem.addEventListener('change', this.changeFn);
            }
        } catch (e) {/*ignore*/
        }

        if (Select.isDelayedClickSupported(navigator.userAgent)) {
            setTimeout(function (fileElem) {
                fileElem.click();
            }, 0, this.fileElem);
        } else {
            this.fileElem.click();
        }

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

    resetModel = (evt) => {
        if (this.attrGetter('clickDisabled')) return;
        if (this.fileElem.value) {
            this.fileElem.value = null;
            this.elem.dispatchEvent(new CustomEvent('fileSelect', {detail: {files: null, origEvent: evt}}))
        }
    };


    ie10SameFileSelectFix = (evt) => {
        if (this.fileElem && !this.fileElem.getAttribute('__ngf_ie10_Fix_')) {
            if (!this.fileElem.parentNode) {
                this.fileElem = null;
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            var clone = this.fileElem.cloneNode();
            this.fileElem.parentNode.insertBefore(clone, this.fileElem);
            this.fileElem.parentNode.removeChild(this.fileElem);
            this.fileElem = <HTMLInputElement>clone;
            this.fileElem.setAttribute('__ngf_ie10_Fix_', 'true');
            this.fileElem.addEventListener('change', this.changeFn);
            this.fileElem.addEventListener('click', this.ie10SameFileSelectFix);
            this.fileElem.click();
            return false;
        } else {
            this.fileElem.removeAttribute('__ngf_ie10_Fix_');
        }
    };


    destroy() {
        if (!this.isInputTypeFile()) {
            this.fileElem.parentNode.parentNode.removeChild(this.fileElem.parentNode);
        }
    }

    // angular.forEach(unwatches, function (unwatch) {
    //     unwatch();
    // });

}