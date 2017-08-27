import {Defaults} from "../defaults";

export class AttrDirective {
    attrGetter = (name) => {
        var n = 'ngf' + name.charAt(0).toUpperCase() + name.substring(1);
        return this[n] || this[name] || Defaults.defaults[n] || Defaults.defaults[name];
    };
}
