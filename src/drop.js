"use strict";
var blob_util_js_1 = require('./blob.util.js');
var uploader_js_1 = require('./uploader.js');
var pattern_1 = require("./pattern");
var Drop = (function () {
    function Drop(elem, attrGetter) {
        var _this = this;
        this.extractFilesFromHtml = function (updateOn, html) {
            if (_this.attrGetter(updateOn + 'Disabled') || typeof html !== 'string') {
                return new Promise(function (resolve, reject) {
                    reject([]);
                });
            }
            var urls = [];
            html.replace(/<(img src|img [^>]* src) *=\"([^\"]*)\"/gi, function (m, n, src) {
                urls.push(src);
                return src;
            });
            var promises = [], files = [];
            for (var i = 0; i < urls.length; i++) {
                var url = urls[i];
                promises.push(blob_util_js_1.BlobUtil.urlToBlob(url).then(function (blob) {
                    files.push(blob);
                }));
            }
            return new Promise(function (resolve) {
                if (!promises.length)
                    resolve(files);
                Promise.all(promises).then(function () {
                    resolve(files);
                }).catch(function () {
                    resolve(files);
                });
            });
        };
        this.isDisabled = function () {
            return _this.elem.getAttribute('disabled') || _this.attrGetter('ngfDropDisabled');
        };
        this.elem = elem;
        this.attrGetter = attrGetter;
        // if (attrGetter('ngfSelect') == null) {
        //   upload.registerModelChangeValidator(ngModel, attr, scope);
        // }
        var leaveTimeout = null;
        var dragOverDelay = 1;
        var actualDragOverClass;
        elem.addEventListener('dragover', function (evt) {
            if (_this.isDisabled() || attrGetter('dropDisabled'))
                return;
            evt.preventDefault();
            if (_this.attrGetter('stopPropagation'))
                evt.stopPropagation();
            // handling dragover events from the Chrome download bar
            if (navigator.userAgent.indexOf('Chrome') > -1) {
                var b = evt.dataTransfer.effectAllowed;
                evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
            }
            clearTimeout(leaveTimeout);
            if (!actualDragOverClass) {
                actualDragOverClass = _this.calculateDragOverClass(evt, _this.attrGetter('ngfDragOverClass', { $event: evt }));
                Drop.addClass(elem, actualDragOverClass);
            }
        }, false);
        elem.addEventListener('dragenter', function (evt) {
            if (_this.isDisabled() || attrGetter('dropDisabled'))
                return;
            evt.preventDefault();
            if (_this.attrGetter('stopPropagation'))
                evt.stopPropagation();
        }, false);
        elem.addEventListener('dragleave', function (evt) {
            if (_this.isDisabled() || attrGetter('dropDisabled'))
                return;
            evt.preventDefault();
            if (_this.attrGetter('stopPropagation'))
                evt.stopPropagation();
            leaveTimeout = function () {
                if (actualDragOverClass)
                    Drop.removeClass(elem, actualDragOverClass);
                actualDragOverClass = null;
            };
            setTimeout(leaveTimeout, dragOverDelay || 100);
        }, false);
        elem.addEventListener('drop', function (evt) {
            if (_this.isDisabled() || attrGetter('dropDisabled'))
                return;
            evt.preventDefault();
            if (attrGetter('stopPropagation'))
                evt.stopPropagation();
            if (actualDragOverClass)
                Drop.removeClass(elem, actualDragOverClass);
            actualDragOverClass = null;
            var items = evt.dataTransfer.items;
            var html;
            try {
                html = evt.dataTransfer && evt.dataTransfer.getData && evt.dataTransfer.getData('text/html');
            }
            catch (e) {
            }
            _this.extractFiles(items, evt.dataTransfer.files, attrGetter('allowDir') !== false, attrGetter('multiple')).then(function (files) {
                if (files.length) {
                    elem.dispatchEvent(new CustomEvent('fileDrop', { detail: { files: files, origEvent: evt } }));
                }
                else {
                    _this.extractFilesFromHtml('dropUrl', html).then(function (files) {
                        elem.dispatchEvent(new CustomEvent('fileDrop', { detail: { files: files, origEvent: evt } }));
                    });
                }
            });
        }, false);
        elem.addEventListener('paste', function (evt) {
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 &&
                attrGetter('enableFirefoxPaste')) {
                evt.preventDefault();
            }
            if (_this.isDisabled() || attrGetter('pasteDisabled'))
                return;
            var files = [];
            var clipboard = evt.clipboardData || evt.originalEvent.clipboardData;
            if (clipboard && clipboard.items) {
                for (var k = 0; k < clipboard.items.length; k++) {
                    if (clipboard.items[k].type.indexOf('image') !== -1) {
                        files.push(clipboard.items[k].getAsFile());
                    }
                }
            }
            if (files.length) {
                elem.dispatchEvent(new CustomEvent('fileDrop', { detail: { files: files, origEvent: evt } }));
            }
            else {
                _this.extractFilesFromHtml('pasteUrl', clipboard).then(function (files) {
                    elem.dispatchEvent(new CustomEvent('fileDrop', { detail: { files: files, origEvent: evt } }));
                });
            }
        }, false);
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 &&
            attrGetter('enableFirefoxPaste')) {
            elem.setAttribute('contenteditable', 'true');
            elem.addEventListener('keypress', function (e) {
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                }
            });
        }
    }
    Drop.prototype.calculateDragOverClass = function (evt, obj) {
        var dClass = 'dragover';
        if (typeof obj === 'string') {
            dClass = obj;
        }
        else if (obj) {
            if (obj.accept || obj.reject) {
                var items = evt.dataTransfer.items;
                if (items == null || !items.length) {
                    dClass = obj.accept;
                }
                else {
                    var pattern = obj.pattern || this.attrGetter('ngfPattern', { $event: evt });
                    var len = items.length;
                    while (len--) {
                        if (!pattern_1.Pattern.validatePattern(items[len], pattern)) {
                            dClass = obj.reject;
                            break;
                        }
                        else {
                            dClass = obj.accept;
                        }
                    }
                }
            }
        }
        return dClass;
    };
    Drop.prototype.extractFiles = function (items, fileList, allowDir, multiple) {
        var maxFiles = this.attrGetter('maxFiles');
        if (maxFiles == null) {
            maxFiles = Number.MAX_VALUE;
        }
        var maxTotalSize = this.attrGetter('maxTotalSize');
        if (maxTotalSize == null) {
            maxTotalSize = Number.MAX_VALUE;
        }
        var includeDir = this.attrGetter('ngfIncludeDir');
        var files = [], totalSize = 0;
        function traverseFileTree(entry, path) {
            return new Promise(function (resolve, reject) {
                if (entry != null) {
                    if (entry.isDirectory) {
                        var promises = [];
                        if (includeDir) {
                            var file = { type: 'directory' };
                            file.name = file.path = (path || '') + entry.name;
                            files.push(file);
                        }
                        var dirReader = entry.createReader();
                        var entries = [];
                        var readEntries = function () {
                            dirReader.readEntries(function (results) {
                                try {
                                    if (!results.length) {
                                        var allEntries = entries.slice(0);
                                        for (var i = 0; i < allEntries.length; i++) {
                                            var e = allEntries[i];
                                            if (files.length <= maxFiles && totalSize <= maxTotalSize) {
                                                promises.push(traverseFileTree(e, (path ? path : '') + entry.name + '/'));
                                            }
                                        }
                                        if (!promises.length)
                                            resolve();
                                        Promise.all(promises).then(function () {
                                            resolve();
                                        }, function (e) {
                                            reject(e);
                                        });
                                    }
                                    else {
                                        entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                                        readEntries();
                                    }
                                }
                                catch (e) {
                                    reject(e);
                                }
                            }, function (e) {
                                reject(e);
                            });
                        };
                        readEntries();
                    }
                    else {
                        entry.file(function (file) {
                            try {
                                file.path = (path ? path : '') + file.name;
                                if (includeDir) {
                                    file = uploader_js_1.Uploader.rename(file, file.path);
                                }
                                files.push(file);
                                totalSize += file.size;
                                resolve();
                            }
                            catch (e) {
                                reject(e);
                            }
                        }, function (e) {
                            reject(e);
                        });
                    }
                }
            });
        }
        var promises = [new Promise(function (resolve) { resolve(); })];
        if (items && items.length > 0 && window.location.protocol !== 'file:') {
            for (var i = 0; i < items.length; i++) {
                if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
                    var entry = items[i].webkitGetAsEntry();
                    if (entry.isDirectory && !allowDir) {
                        continue;
                    }
                    if (entry != null) {
                        promises.push(traverseFileTree(entry, undefined));
                    }
                }
                else {
                    var f = items[i].getAsFile();
                    if (f != null) {
                        files.push(f);
                        totalSize += f.size;
                    }
                }
                if (files.length > maxFiles || totalSize > maxTotalSize ||
                    (!multiple && files.length > 0))
                    break;
            }
        }
        else {
            if (fileList != null) {
                for (var j = 0; j < fileList.length; j++) {
                    var file = fileList.item(j);
                    if (file.type || file.size > 0) {
                        files.push(file);
                        totalSize += file.size;
                    }
                    if (files.length > maxFiles || totalSize > maxTotalSize ||
                        (!multiple && files.length > 0))
                        break;
                }
            }
        }
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function () {
                if (!multiple && !includeDir && files.length) {
                    var i = 0;
                    while (files[i] && files[i].type === 'directory')
                        i++;
                    resolve([files[i]]);
                }
                else {
                    resolve(files);
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    Drop.dropAvailable = function () {
        var div = document.createElement('div');
        return ('draggable' in div) && ('ondrop' in div) && !/Edge\/12./i.test(navigator.userAgent);
    };
    Drop.addClass = function (elem, c) {
        if (!elem.className.match(new RegExp('(\\s|^)' + c + '(\\s|$)'))) {
            elem.className += ' ' + c;
        }
    };
    Drop.removeClass = function (elem, c) {
        var regexp = new RegExp('(\\s|^)' + c + '(\\s|$)');
        if (elem.className.match(regexp)) {
            elem.className += elem.className.replace(regexp, ' ');
        }
    };
    return Drop;
}());
exports.Drop = Drop;
//# sourceMappingURL=drop.js.map