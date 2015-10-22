ngFileUpload.service('Upload', ['$parse', '$timeout', '$compile', '$q', 'UploadExif', function ($parse, $timeout, $compile, $q, UploadExif) {
  var upload = UploadExif;
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

  upload.emptyPromise = function () {
    var d = $q.defer();
    var args = arguments;
    $timeout(function () {
      d.resolve.apply(d, args);
    });
    return d.promise;
  };

  upload.happyPromise = function (promise, data) {
    var d = $q.defer();
    promise.then(function (result) {
      d.resolve(result);
    }, function (error) {
      $timeout(function () {
        throw error;
      });
      d.resolve(data);
    });
    return d.promise;
  };

  function applyExifRotations(files) {
    var promises = [upload.emptyPromise()];
    angular.forEach(files, function (f, i) {
      if (f.type.indexOf('image/jpeg') === 0) {
        promises.push(upload.happyPromise(upload.applyExifRotation(f), f).then(function (fixedFile) {
          files.splice(i, 1, fixedFile);
        }));
      }
    });
    return $q.all(promises);
  }

  function resize(files, attr, scope) {
    var param = upload.attrGetter('ngfResize', attr, scope);
    if (!param || !upload.isResizeSupported() || !files.length) return upload.emptyPromise();
    if (!param.width || !param.height) throw 'width and height are mandatory for ngf-resize';
    var promises = [upload.emptyPromise()];
    angular.forEach(files, function (f, i) {
      if (f.type.indexOf('image') === 0) {
        var promise = upload.resize(f, param.width, param.height, param.quality);
        promises.push(promise);
        promise.then(function (resizedFile) {
          files.splice(i, 1, resizedFile);
        }, function (e) {
          f.$error = 'resize';
          f.$errorParam = (e ? (e.message ? e.message : e) + ': ' : '') + (f && f.name);
        });
      }
    });
    return $q.all(promises);
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

    upload.validate(newFiles, ngModel, attr, scope).then(function () {
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
        var fixOrientation = upload.emptyPromise(files);
        if (upload.attrGetter('ngfFixOrientation', attr, scope) !== false && upload.isExifSupported()) {
          fixOrientation = applyExifRotations(files);
        }
        fixOrientation.then(function () {
          resize(files, attr, scope).then(function () {
            $timeout(function () {
              update(files, invalids, newFiles, dupFiles, isSingleModel);
            }, options && options.debounce ? options.debounce.change || options.debounce : 0);
          }, function (e) {
            throw 'Could not resize files ' + e;
          });
        });
      }
    });

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
