export class Pattern {
    public static validatePattern(file, str) {
        if (!str) return true;
        var excludes = [], regExpStr;
        // remove excludes
        regExpStr = str.replace(/ *!(.*?)(,|$)/g, (m, p) => {
            excludes.push(p);
            return ''
        }).replace(/ *, *$/, '');
        // global to regexp
        regExpStr = regExpStr.replace(', *', '$|').replace('.', '\.').replace('\*', '.*');
        if (!regExpStr) regExpStr = '.*';
        var regexp = new RegExp(regExpStr + '$');
        return (file.type.match(regexp) || file.name.match(regexp)) && !Pattern.matchesAny(file, excludes);
    }

    private static matchesAny(file: any, patterns) {
        for (var i = 0; i < patterns.length; i++) {
            if (Pattern.validatePattern(file, patterns[i])) return true;
        }
        return false;
    }
}