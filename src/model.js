ngFileUpload.service('Upload', ['$parse', '$timeout', '$compile', 'UploadResize', function ($parse, $timeout, $compile, UploadResize) {
  var upload = UploadResize;
  upload.getAttrWithDefaults = function (attr, name) {
    if (attr[name] != null) return attr[name];
    var def = upload.defaults[name];
    return (def == null ? def : (angular.isString(def) ? def : JSON.stringify(def)));
  };

  upload.attrGetter = function (name, attr, scope, params) {
    var attrVal = this.getAttrWithDefaults(attr, name);
    if (scope) {
      try {
        if (params) {
          return $parse(attrVal)(scope, params);
        } else {
          return $parse(attrVal)(scope);
        }
      } catch (e) {
        // hangle string value without single qoute
        if (name.search(/min|max|pattern/i)) {
          return attrVal;
        } else {
          throw e;
        }
      }
    } else {
      return attrVal;
    }
  };

  upload.shouldUpdateOn = function (type, attr, scope) {
    var modelOptions = upload.attrGetter('ngModelOptions', attr, scope);
    if (modelOptions && modelOptions.updateOn) {
      return modelOptions.updateOn.split(' ').indexOf(type) > -1;
    }
    return true;
  };

  function resize(files, attr, scope, callback) {
    var param = upload.attrGetter('ngfResize', attr, scope);
    if (!param || !upload.isResizeSupported() || !files.length) return callback();
    if (!param.width || !param.height) throw 'width and height are mandatory for ngf-resize';
    var count = files.length;
    var checkCallback = function () {
      count--;
      if (count === 0) callback();
    };
    var success = function (index) {
      return function (resizedFile) {
        files.splice(index, 1, resizedFile);
        checkCallback();
      };
    };
    var error = function (f) {
      return function (e) {
        checkCallback();
        f.$error = 'resize';
        f.$errorParam = (e ? (e.message ? e.message : e) + ': ' : '') + (f && f.name);
      };
    };
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.type.indexOf('image') === 0) {
        upload.resize(f, param.width, param.height, param.quality).then(success(i), error(f));
      } else {
        checkCallback();
      }
    }
  }

  function handleKeep(files, prevFiles, attr, scope) {
    var dupFiles = [];
    var keep = upload.attrGetter('ngfKeep', attr, scope);
    if (keep) {
      var hasNew = false;

      if (keep === 'distinct' || upload.attrGetter('ngfKeepDistinct', attr, scope) === true) {
        var len = prevFiles.length;
        if (files) {
          for (var i = 0; i < files.length; i++) {
            for (var j = 0; j < len; j++) {
              if (files[i].name === prevFiles[j].name) {
                dupFiles.push(files[i]);
                break;
              }
            }
            if (j === len) {
              prevFiles.push(files[i]);
              hasNew = true;
            }
          }
        }
        files = prevFiles;
      } else {
        files = prevFiles.concat(files || []);
      }
    }
    return {files: files, dupFiles: dupFiles, keep: keep};
  }

  upload.updateModel = function (ngModel, attr, scope, fileChange, files, evt, noDelay) {
    function update(files, invalidFiles, newFiles, dupFiles, isSingleModel) {
      var file = files && files.length ? files[0] : null;

      if (ngModel) {
        upload.applyModelValidation(ngModel, files);
        ngModel.$ngfModelChange = true;
        ngModel.$setViewValue(isSingleModel ? file : files);
      }

      if (fileChange) {
        $parse(fileChange)(scope, {
          $files: files,
          $file: file,
          $newFiles: newFiles,
          $duplicateFiles: dupFiles,
          $invalidFiles: invalidFiles,
          $event: evt
        });
      }

      var invalidModel = upload.attrGetter('ngfModelInvalid', attr);
      if (invalidModel) {
        $timeout(function () {
          $parse(invalidModel).assign(scope, invalidFiles);
        });
      }
      $timeout(function () {
        // scope apply changes
      });
    }

    var newFiles = files;
    var prevFiles = ((ngModel && ngModel.$modelValue) || attr.$$ngfPrevFiles || []).slice(0);
    var keepResult = handleKeep(files, prevFiles, attr, scope);
    files = keepResult.files;
    var dupFiles = keepResult.dupFiles;
    var isSingleModel = !upload.attrGetter('ngfMultiple', attr, scope) && !upload.attrGetter('multiple', attr) && !keepResult.keep;

    attr.$$ngfPrevFiles = files;

    if (keepResult.keep && (!newFiles || !newFiles.length)) return;

    if (upload.validate(newFiles, ngModel, attr, scope, function () {
        if (noDelay) {
          update(files, [], newFiles, dupFiles, isSingleModel);
        } else {
          var options = upload.attrGetter('ngModelOptions', attr, scope);
          if (!options || !options.allowInvalid) {
            var valids = [], invalids = [];
            angular.forEach(files, function (file) {
              if (file.$error) {
                invalids.push(file);
              } else {
                valids.push(file);
              }
            });
            files = valids;
          }
          resize(files, attr, scope, function () {
            $timeout(function () {
              update(files, invalids, newFiles, dupFiles, isSingleModel);
            }, options && options.debounce ? options.debounce.change || options.debounce : 0);
          });
        }
      }));

    // cleaning object url memories
    var l = prevFiles.length;
    while (l--) {
      var prevFile = prevFiles[l];
      if (window.URL && prevFile.blobUrl) {
        URL.revokeObjectURL(prevFile.blobUrl);
        delete prevFile.blobUrl;
      }
    }
  };

  return upload;
}]);
