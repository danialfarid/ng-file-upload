/**
 * File pattern for validation in the wild card format.
 * The pattern will be matched against file's name and type.
 * You can also exclude types or name using `!` symbol.
 * @example
 * .jpg,.png,.gif  //image of type jpg, png, or gif
 * image/*,application/pdf  //image or pdf
 * audio/*,video/*  //all audio and videos
 * image/*,!.gif,!.tiff     //all images except gif and tiff
 * @typedef {string} FilePattern
 */
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