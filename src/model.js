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
        function update() {
          var keep = upload.attrGetter('ngfKeep', attr, scope);
          if (keep === true) {
            if (!files || !files.length) {
              return;
            } else {
              var prevFiles = ((ngModel && ngModel.$modelValue) || attr.$$ngfPrevFiles || []).slice(0),
                hasNew = false;
              if (upload.attrGetter('ngfKeepDistinct', attr, scope) === true) {
                var len = prevFiles.length;
                for (var i = 0; i < files.length; i++) {
                  for (var j = 0; j < len; j++) {
                    if (files[i].name === prevFiles[j].name) break;
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
          }

          attr.$$ngfPrevFiles = files;
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
              $event: evt
            });
          }
        }

        if (noDelay) {
          update();
        } else if (upload.validate(files, ngModel, attr, scope, upload.attrGetter('ngfValidateLater', attr), function () {
            if (upload.attrGetter('ngfResize', attr, scope)) {
              var img = angular.element('<img>');
              img.attr('src', files[0].dataUrl || files[0].blobUrl);
              img.bind('load', function() {
                upload.resize(img[0], 100, 100).then(function(rimg) {
                  console.log(rimg);
                  document.body.appendChild(rimg);
                });
              });
              document.body.appendChild(img[0]);
            }

            $timeout(function () {
              update();
            });
          }));
      };

      return upload;
    }]);
})();
