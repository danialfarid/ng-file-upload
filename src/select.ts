/**
 * Extends the input type file element functionality to be able to select and reset the input.
 */
export class Select {
    constructor(private elem: HTMLElement, private fileElem: HTMLInputElement, private attrGetter) {
        this.init();
    }

    resetModel = (e) => {
        if (!this.attrGetter('resetOnClick')) return;
        if (this.fileElem.value) {
            this.fileElem.value = null;
            this.elem.dispatchEvent(
                new CustomEvent('change', {detail: {files: null, origEvent: e}}));
        }
    };


    ie10SameFileSelectFix = (evt) => {
        if (this.elem && !this.elem.getAttribute('__ngf_ie10_Fix_')) {
            if (!this.elem.parentNode) {
                this.elem = null;
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            var clone = this.elem.cloneNode();
            this.elem.parentNode.insertBefore(clone, this.elem);
            this.elem.parentNode.removeChild(this.elem);
            this.elem = <HTMLInputElement>clone;
            this.elem.setAttribute('__ngf_ie10_Fix_', 'true');
            this.elem.addEventListener('click', this.ie10SameFileSelectFix, false);
            this.elem.click();
            return false;
        } else {
            this.elem.removeAttribute('__ngf_ie10_Fix_');
        }
    };

    init() {
        this.elem.addEventListener('click', this.resetModel, false);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.addEventListener('click', this.ie10SameFileSelectFix, false);
        }
    }

    destroy() {
        this.elem.removeEventListener('click', this.resetModel);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.removeEventListener('click', this.ie10SameFileSelectFix);
        }
    }
}