(function () {

  ngFileUpload.service('Upload', ['$parse', '$timeout', '$compile', 'UploadValidate',
    function ($parse, $timeout, $compile, UploadValidate) {
      var upload = UploadValidate;
      upload.getAttrWithDefaults = function (attr, name) {
        return attr[name] != null ? attr[name] :
          (upload.defaults[name] == null ?
            upload.defaults[name] : upload.defaults[name].toString());
      };

      upload.attrGetter = function (name, attr, scope, params) {
        if (scope) {
          if (params) {
            return $parse(this.getAttrWithDefaults(attr, name))(scope, params);
          } else {
            return $parse(this.getAttrWithDefaults(attr, name))(scope);
          }
        } else {
          return this.getAttrWithDefaults(attr, name);
        }
      };

      upload.updateModel = function (ngModel, attr, scope, fileChange, files, evt, noDelay) {
        function update() {
          var keep = upload.attrGetter('ngfKeep', attr, scope);
          if (keep === true) {
            var prevFiles = (ngModel.$modelValue || []).slice(0);
            if (!files || !files.length) {
              files = prevFiles;
            } else if (upload.attrGetter('ngfKeepDistinct', attr, scope) === true) {
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

          var file = files && files.length  ? files[0] : null;
          if (ngModel) {
            var singleModel = !upload.attrGetter('ngfMultiple', attr, scope) && !upload.attrGetter('multiple', attr) && !keep;
            $timeout(function () {
              $parse(upload.attrGetter('ngModel', attr)).assign(scope, singleModel ? file : files);
            });
          }
          var ngfModel = upload.attrGetter('ngfModel', attr);
          if (ngfModel) {
            $parse(ngfModel).assign(scope, files);
          }

          if (fileChange) {
            $parse(fileChange)(scope, {
              $files: files,
              $file: file,
              $event: evt
            });
          }
        }

        if (upload.validate(files, ngModel, attr, scope, upload.attrGetter('ngfValidateLater', attr),
            function () {
              if (noDelay) {
                update();
              } else {
                $timeout(function () {
                  update();
                });
              }
            }));
      };

      return upload;
    }]);
})();
