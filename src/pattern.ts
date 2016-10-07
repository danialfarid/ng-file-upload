export class Pattern {
    private static globStringToRegex(str) {
        var regexp = '', excludes = [];
        if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
            regexp = str.substring(1, str.length - 1);
        } else {
            var split = str.split(',');
            if (split.length > 1) {
                for (var i = 0; i < split.length; i++) {
                    var r = this.globStringToRegex(split[i]);
                    if (r.regexp) {
                        regexp += '(' + r.regexp + ')';
                        if (i < split.length - 1) {
                            regexp += '|';
                        }
                    } else {
                        excludes = excludes.concat(r.excludes);
                    }
                }
            } else {
                if (str.indexOf('!') === 0) {
                    excludes.push('^((?!' + this.globStringToRegex(str.substring(1)).regexp + ').)*$');
                } else {
                    if (str.indexOf('.') === 0) {
                        str = '*' + str;
                    }
                    regexp = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&') + '$';
                    regexp = regexp.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
                }
            }
        }
        return {regexp: regexp, excludes: excludes};
    }

    public static validatePattern(file, val) {
        if (!val) {
            return true;
        }
        var pattern = this.globStringToRegex(val), valid = true;
        if (pattern.regexp && pattern.regexp.length) {
            var regexp = new RegExp(pattern.regexp, 'i');
            valid = (file.type != null && regexp.test(file.type)) ||
                (file.name != null && regexp.test(file.name));
        }
        var len = pattern.excludes.length;
        while (len--) {
            var exclude = new RegExp(pattern.excludes[len], 'i');
            valid = valid && (file.type == null || exclude.test(file.type)) &&
                (file.name == null || exclude.test(file.name));
        }
        return valid;
    }
}