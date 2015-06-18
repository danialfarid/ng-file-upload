(function () {
    ngFileUpload.directive('ngfSelect', ['$parse', '$timeout', '$compile',
        function ($parse, $timeout, $compile) {
            return {
                restrict: 'AEC',
                require: '?ngModel',
                link: function (scope, elem, attr, ngModel) {
                    linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
                }
            };
        }]);

    function linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
        /** @namespace attr.ngfSelect */
        /** @namespace attr.ngfChange */
        /** @namespace attr.ngModel */
        /** @namespace attr.ngModelRejected */
        /** @namespace attr.ngfMultiple */
        /** @namespace attr.ngfCapture */
        /** @namespace attr.ngfAccept */
        /** @namespace attr.ngfMaxSize */
        /** @namespace attr.ngfMinSize */
        /** @namespace attr.ngfResetOnClick */
        /** @namespace attr.ngfResetModelOnClick */
        /** @namespace attr.ngfKeep */
        /** @namespace attr.ngfKeepDistinct */

        if (elem.attr('__ngf_gen__')) {
            return;
        }

        scope.$on('$destroy', function () {
            if (elem.$$ngfRefElem) elem.$$ngfRefElem.remove();
        });

        var disabled = false;
        if (attr.ngfSelect.search(/\W+$files\W+/) === -1) {
            scope.$watch(attr.ngfSelect, function (val) {
                disabled = val === false;
            });
        }
        function isInputTypeFile() {
            return elem[0].tagName.toLowerCase() === 'input' && attr.type && attr.type.toLowerCase() === 'file';
        }

        var isUpdating = false;

        function changeFn(evt) {
            if (!isUpdating) {
                isUpdating = true;
                try {
                    var fileList = evt.__files_ || (evt.target && evt.target.files);
                    var files = [], rejFiles = [];

                    for (var i = 0; i < fileList.length; i++) {
                        var file = fileList.item(i);
                        if (validate(scope, $parse, attr, file, evt)) {
                            files.push(file);
                        } else {
                            rejFiles.push(file);
                        }
                    }
                    updateModel($parse, $timeout, scope, ngModel, attr, attr.ngfChange || attr.ngfSelect, files, rejFiles, evt);
                    if (files.length === 0) evt.target.value = files;
//                if (evt.target && evt.target.getAttribute('__ngf_gen__')) {
//                    angular.element(evt.target).remove();
//                }
                } finally {
                    isUpdating = false;
                }
            }
        }

        function bindAttrToFileInput(fileElem) {
            if (attr.ngfMultiple) fileElem.attr('multiple', $parse(attr.ngfMultiple)(scope));
            if (attr.ngfCapture) fileElem.attr('capture', $parse(attr.ngfCapture)(scope));
            if (attr.accept) fileElem.attr('accept', attr.accept);
            for (var i = 0; i < elem[0].attributes.length; i++) {
                var attribute = elem[0].attributes[i];
                if ((isInputTypeFile() && attribute.name !== 'type') ||
                    (attribute.name !== 'type' && attribute.name !== 'class' &&
                    attribute.name !== 'id' && attribute.name !== 'style')) {
                    fileElem.attr(attribute.name, attribute.value);
                }
            }
        }

        function createFileInput(evt, resetOnClick) {
            if (!resetOnClick && (evt || isInputTypeFile())) return elem.$$ngfRefElem || elem;

            var fileElem = angular.element('<input type="file">');
            bindAttrToFileInput(fileElem);

            if (isInputTypeFile()) {
                elem.replaceWith(fileElem);
                elem = fileElem;
                fileElem.attr('__ngf_gen__', true);
                $compile(elem)(scope);
            } else {
                fileElem.css('visibility', 'hidden').css('position', 'absolute').css('overflow', 'hidden')
                    .css('width', '0px').css('height', '0px').css('z-index', '-100000').css('border', 'none')
                    .css('margin', '0px').css('padding', '0px').attr('tabindex', '-1');
                if (elem.$$ngfRefElem) {
                    elem.$$ngfRefElem.remove();
                }
                elem.$$ngfRefElem = fileElem;
                document.body.appendChild(fileElem[0]);
            }

            return fileElem;
        }

        function resetModel(evt) {
            updateModel($parse, $timeout, scope, ngModel, attr, attr.ngfChange || attr.ngfSelect, [], [], evt, true);
        }

        function clickHandler(evt) {
            if (elem.attr('disabled') || disabled) return false;
            if (evt != null) {
                evt.preventDefault();
                evt.stopPropagation();
            }
            var resetOnClick = $parse(attr.ngfResetOnClick)(scope) !== false;
            var fileElem = createFileInput(evt, resetOnClick);

            function clickAndAssign(evt) {
                if (evt) {
                    fileElem[0].click();
                }
                if (isInputTypeFile() || !evt) {
                    elem.bind('click touchend', clickHandler);
                }
            }

            if (fileElem) {
                if (!evt || resetOnClick) fileElem.bind('change', changeFn);
                if (evt && resetOnClick && $parse(attr.ngfResetModelOnClick)(scope) !== false) resetModel(evt);

                // fix for android native browser < 4.4
                if (shouldClickLater(navigator.userAgent)) {
                    setTimeout(function () {
                        clickAndAssign(evt);
                    }, 0);
                } else {
                    clickAndAssign(evt);
                }
            }
            return false;
        }

        if (window.FileAPI && window.FileAPI.ngfFixIE) {
            window.FileAPI.ngfFixIE(elem, createFileInput, bindAttrToFileInput, changeFn);
        } else {
            clickHandler();
            //if (!isInputTypeFile()) {
            //  elem.bind('click touchend', clickHandler);
            //}
        }
    }

    function shouldClickLater(ua) {
        // android below 4.4
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
        if (m && m.length > 2) {
            return parseInt(m[1]) < 4 || (parseInt(m[1]) === 4 && parseInt(m[2]) < 4);
        }

        // safari on windows
        return /.*Windows.*Safari.*/.test(ua);
    }

    ngFileUpload.validate = function (scope, $parse, attr, file, evt) {
        function globStringToRegex(str) {
            if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
                return str.substring(1, str.length - 1);
            }
            var split = str.split(','), result = '';
            if (split.length > 1) {
                for (var i = 0; i < split.length; i++) {
                    result += '(' + globStringToRegex(split[i]) + ')';
                    if (i < split.length - 1) {
                        result += '|';
                    }
                }
            } else {
                if (str.indexOf('.') === 0) {
                    str = '*' + str;
                }
                result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
                result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
            }
            return result;
        }

        var accept = $parse(attr.ngfAccept)(scope, {$file: file, $event: evt});
        var fileSizeMax = $parse(attr.ngfMaxSize)(scope, {$file: file, $event: evt}) || 9007199254740991;
        var fileSizeMin = $parse(attr.ngfMinSize)(scope, {$file: file, $event: evt}) || -1;
        if (accept != null && angular.isString(accept)) {
            var regexp = new RegExp(globStringToRegex(accept), 'gi');
            accept = (file.type != null && regexp.test(file.type.toLowerCase())) ||
                (file.name != null && regexp.test(file.name.toLowerCase()));
        }
        return (accept == null || accept) && (file.size == null || (file.size < fileSizeMax && file.size > fileSizeMin));
    };

    ngFileUpload.updateModel = function ($parse, $timeout, scope, ngModel, attr, fileChange,
                                         files, rejFiles, evt, noDelay) {
        function update() {
            if ($parse(attr.ngfKeep)(scope) === true) {
                var prevFiles = (ngModel.$modelValue || []).slice(0);
                if (!files || !files.length) {
                    files = prevFiles;
                } else if ($parse(attr.ngfKeepDistinct)(scope) === true) {
                    var len = prevFiles.length;
                    for (var i = 0; i < files.length; i++) {
                        for (var j = 0; j < len; j++) {
                            if (files[i].name === prevFiles[j].name) break;
                        }
                        if (j === len) {
                            prevFiles.push(files[i]);
                        }
                    }
                    files = prevFiles;
                } else {
                    files = prevFiles.concat(files);
                }
            }
            if (ngModel) {
                $parse(attr.ngModel).assign(scope, files);
                $timeout(function () {
                    if (ngModel) {
                        ngModel.$setViewValue(files != null && files.length === 0 ? null : files);
                    }
                });
            }
            if (attr.ngModelRejected) {
                $parse(attr.ngModelRejected).assign(scope, rejFiles);
            }
            if (fileChange) {
                $parse(fileChange)(scope, {
                    $files: files,
                    $rejectedFiles: rejFiles,
                    $event: evt
                });
            }
        }

        if (noDelay) {
            update();
        } else {
            $timeout(function () {
                update();
            });
        }
    };

    var validate = ngFileUpload.validate;
    var updateModel = ngFileUpload.updateModel;

})();
