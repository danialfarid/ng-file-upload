ngFileUpload.service('Upload', ['$parse', '$timeout', '$compile', 'UploadResize', function ($parse, $timeout, $compile, UploadResize) {
  var upload = UploadResize;
  upload.getAttrWithDefaults = function (attr, name) {
    return attr[name] != null ? attr[name] :
      (upload.defaults[name] == null ?
        upload.defaults[name] : upload.defaults[name].toString());
  };

  upload.attrGetter = function (name, attr, scope, params) {
    if (scope) {
      try {
        if (params) {
          return $parse(this.getAttrWithDefaults(attr, name))(scope, params);
        } else {
          return $parse(this.getAttrWithDefaults(attr, name))(scope);
        }
      } catch (e) {
        // hangle string value without single qoute
        if (name.search(/min|max|pattern/i)) {
          return this.getAttrWithDefaults(attr, name);
        } else {
          throw e;
        }
      }
    } else {
      return this.getAttrWithDefaults(attr, name);
    }
  };

  upload.updateModel = function (ngModel, attr, scope, fileChange, files, evt, noDelay) {
    var newFiles = files, dupFiles = [];

    function update() {
      var file = files && files.length ? files[0] : null;
      if (ngModel) {
        var singleModel = !upload.attrGetter('ngfMultiple', attr, scope) && !upload.attrGetter('multiple', attr) && !keep;
        $parse(upload.attrGetter('ngModel', attr)).assign(scope, singleModel ? file : files);
      }
      var ngfModel = upload.attrGetter('ngfModel', attr);
      if (ngfModel) {
        $parse(ngfModel).assign(scope, files);
      }

      if (fileChange) {
        $parse(fileChange)(scope, {
          $files: files,
          $file: file,
          $newFiles: newFiles,
          $duplicateFiles: dupFiles,
          $event: evt
        });
      }
      // scope apply changes
      $timeout(function () {
      });
    }

    var prevFiles = ((ngModel && ngModel.$modelValue) || attr.$$ngfPrevFiles || []).slice(0);

    var keep = upload.attrGetter('ngfKeep', attr, scope);
    if (keep === true) {
      if (!files || !files.length) return;

      var hasNew = false;

      if (upload.attrGetter('ngfKeepDistinct', attr, scope) === true) {
        var len = prevFiles.length;
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
        if (!hasNew) return;
        files = prevFiles;
      } else {
        files = prevFiles.concat(files);
      }
    }

    attr.$$ngfPrevFiles = files;

    function resize(files, callback) {
      var param = upload.attrGetter('ngfResize', attr, scope);
      if (!param || !upload.isResizeSupported()) return callback();
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
        if (!f.$error && f.type.indexOf('image') === 0) {
          upload.resize(f, param.width, param.height, param.quality).then(success(i), error(f));
        } else {
          checkCallback();
        }
      }
    }

    if (noDelay) {
      update();
    } else if (upload.validate(files, ngModel, attr, scope, upload.attrGetter('ngfValidateLater', attr), function () {
        resize(files, function () {
          $timeout(function () {
            update();
          });
        });
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
