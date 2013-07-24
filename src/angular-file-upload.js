/**!
 * AngularJS file upload directive and http post
 * @author  Danial  <danial.farid@gmail.com>
 */
var angularFileUpload = angular.module('angularFileUpload', []);

(function loadFileAPI() {
    if (typeof jQuery === 'undefined') {
        var script = document.createElement('script');
        script.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    if (typeof FormData === 'undefined') {
        var script = document.createElement('script');
        var base = FileAPI.scriptBase || '';
        var allScripts = document.getElementsByTagName('script');
        for(var i = 0; i < allScripts.length; i++) {
            var index = allScripts[i].src.indexOf('angular-file-upload.js')
            if (index > -1) {
                base = allScripts[i].src.substring(0, index);
            }
        }

        script.setAttribute('src', base + 'FileAPI.min.js');
        document.getElementsByTagName('head')[0].appendChild(script);
    }
})()

angularFileUpload.directive('ngFileSelect', [ '$parse', '$http', function($parse, $http) {
    if ($http.uploadFile === undefined) {
        $http.uploadFile = function(config) {
            if (typeof FormData === 'undefined') {
                var params = {
                    url: config.url,
                    complete: function (err, xhr) {
                        var JSON_START = /^\s*(\[|\{[^\{])/,
                              JSON_END = /[\}\]]\s*$/,
                              PROTECTION_PREFIX = /^\)\]\}',?\n/;
                        var data = xhr.responseText;
                        if (typeof data == 'string') {
                                // strip json vulnerability protection prefix
                                data = data.replace(PROTECTION_PREFIX, '');
                                if (JSON_START.test(data) && JSON_END.test(data))
                                  data = (typeof data == 'string')
                                               ? JSON.parse(data)
                                               : data;
                        }
                        if (params.promiseThen != null) params.promiseThen(data, xhr.status, null, config);
                        if (params.promiseError != null) params.promiseError(data, xhr.status, null, config);
                        if (params.promiseSuccess != null) params.promiseSuccess(data, xhr.status, null, config);
                    }
                }
                if (config.file != null) {
                    params.files = {
                        file: config.file
                    }
                }
                if (config.files != null) {
                    params.files = {
                        files: config.files
                    }
                }
                var xhr = FileAPI.upload(params);
                return {
                    then: function(func) {
                        params.promiseThen = func;
                    },
                    success: function(func) {
                        params.promiseSuccess = func;
                    },
                    error: function(func) {
                        params.promiseError = func;
                    }
                };
            } else {
                return $http({
                    method: 'POST',
                    url: config.url,
                    headers: { 'Content-Type': false },
                    transformRequest: function (data) {
                        var formData = new FormData();
                        if (config.files != null) {
                            for (var i = 0; i < config.files; i++) {
                                //add each file to the form data and iteratively name them
                                formData.append('file' + i, config.files[i]);
                            }
                        } else {
                            formData.append('file', config.file);
                        }
                        return formData;
                    }
                });
            }
        };
    }

    return function(scope, elem, attr) {
        if (typeof FormData === 'undefined') {
            elem.wrap('<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden">');
        }
        var fn = $parse(attr['ngFileSelect']);
		elem.bind('change', function(evt) {
		    var files = [];
            if (typeof FormData !== 'undefined') {
                files = evt.target.files;
            } else {
                files = FileAPI.getFiles(evt);
            }
            scope.$apply(function() {
                fn(scope, {
                    $files: files,
                    $event : evt
                });
            });
		});
    };
} ]);
