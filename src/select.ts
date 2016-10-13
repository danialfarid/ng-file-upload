export class Select {
    private elem: HTMLInputElement;
    private resetOnClick: boolean;

    constructor(el: HTMLInputElement, resetOnClick: boolean) {
        this.elem = el;
        this.resetOnClick = resetOnClick;
        this.init();
    }

    resetModel = (evt) => {
        if (!this.resetOnClick) return;
        if (this.elem.value) {
            this.elem.value = null;
            this.elem.dispatchEvent(new CustomEvent('change', {detail: {files: null, origEvent: evt}}))
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
            this.elem.addEventListener('click', this.ie10SameFileSelectFix);
            this.elem.click();
            return false;
        } else {
            this.elem.removeAttribute('__ngf_ie10_Fix_');
        }
    };

    init() {
        this.elem.addEventListener('click', this.resetModel);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.addEventListener('click', this.ie10SameFileSelectFix);
        }
    }

    destroy() {
        this.elem.removeEventListener('click', this.resetModel);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
            this.elem.removeEventListener('click', this.ie10SameFileSelectFix);
        }
    }
}