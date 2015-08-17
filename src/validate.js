(function () {
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

  function translateScalars(str) {
    if (angular.isString(str)) {
      if (str.search(/kb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1000);
      } else if (str.search(/mb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1000000);
      } else if (str.search(/gb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1000000000);
      } else if (str.search(/b/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1));
      } else if (str.search(/s/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1));
      } else if (str.search(/m/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1) * 60);
      } else if (str.search(/h/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1) * 3600);
      }
    }
    return str;
  }

  ngFileUpload.service('Upload', ['UploadDataUrl', '$q', '$timeout', function (UploadDataUrl, $q, $timeout) {
    UploadDataUrl.registerValidators = function (ngModel, scope, attrGetter) {
      var cons = attrGetter('ngfValidate') || {};

      function registerSync(name, validatorVal, fn) {
        var val = attrGetter('ngf' + name[0].toUpperCase() + name.substr(1)) || validatorVal;
        if (val) {
          ngModel.$validators[name] = function (files) {
            var valid = true;
            if (files) {
              angular.forEach(files.length ? files : [files], function (file) {
                if (!fn(file, val)) {
                  file.$error = name;
                  file.$errorParam = val;
                  valid = false;
                  return false;
                }
              });
            }
            return valid;
          };
        }
      }

      registerSync('pattern', cons.pattern, function (file, val) {
        var regexp = new RegExp(globStringToRegex(val), 'gi');
        return (file.type != null && regexp.test(file.type.toLowerCase())) ||
          (file.name != null && regexp.test(file.name.toLowerCase()));
      });
      registerSync('minSize', cons.size && cons.size.min, function (file, val) {
        return file.size >= translateScalars(val);
      });
      registerSync('maxSize', cons.size && cons.size.max, function (file, val) {
        return file.size <= translateScalars(val);
      });

      function registerAsync(name, validatorVal, asyncFn, fn) {
        var val = attrGetter('ngf' + name[0].toUpperCase() + name.substr(1)) || validatorVal;
        if (val) {
          ngModel.$asyncValidators[name] = function (files) {
            if (files) {
              var deferred = $q.defer(), validated = 0, hasError = false;
              angular.forEach(files.length ? files : [files], function (file) {
                asyncFn(file).then(function (d) {
                  if (!fn(d, val)) {
                    file.$error = name;
                    file.$errorParam = val;
                    hasError = true;
                  }
                }, function () {
                  file.$error = name;
                  file.$errorParam = val;
                  hasError = true;
                }).finally(function () {
                  validated++;
                  if (validated === files.length) {
                    if (hasError) deferred.reject(); else deferred.resolve();
                  }
                });
              });
            }
          };
        }
      }

      registerAsync('maxHeight', cons.height && cons.height.max, this.imageDimensions, function (d, val) {
        return d.height <= val;
      });
      registerAsync('minHeight', cons.height && cons.height.min, this.imageDimensions, function (d, val) {
        return d.height >= val;
      });
      registerAsync('maxWidth', cons.height && cons.width.max, this.imageDimensions, function (d, val) {
        return d.width <= val;
      });
      registerAsync('minWidth', cons.height && cons.width.min, this.imageDimensions, function (d, val) {
        return d.width >= val;
      });
      registerAsync('maxDuration', cons.height && cons.duration.max, this.mediaDuration, function (d, val) {
        return d <= translateScalars(val);
      });
      registerAsync('minDuration', cons.height && cons.duration.min, this.mediaDuration, function (d, val) {
        return d >= translateScalars(val);
      });
    };

    UploadDataUrl.imageDimensions = function (file) {
      var deferred;
      if (file.width && file.height) {
        deferred = $q.defer();
        $timeout(function () {
          deferred.resolve({width: file.width, height: file.height});
        });
        return deferred.promise;
      }
      if (file.$ngfDimensionsPromise) return file.$ngfDimensionsPromise;

      deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('image') !== 0) {
          deferred.reject('not image');
          return;
        }
        UploadDataUrl.dataUrl(file).then(function (dataUrl) {
          var img = angular.element('<img>').attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');
          img.on('load', function () {
            var width = img[0].clientWidth;
            var height = img[0].clientHeight;
            img.remove();
            file.width = width;
            file.height = height;
            delete file.$ngfDimensionsPromise;
            deferred.resolve({width: width, height: height});
          });
          img.on('error', function () {
            img.remove();
            delete file.$ngfDimensionsPromise;
            deferred.reject('load error');
          });
          angular.element(document.body).append(img);
        }, function () {
          delete file.$ngfDimensionsPromise;
          deferred.reject('load error');
        });
      });

      file.$ngfDimensionsPromise = deferred.promise;
      return file.$ngfDimensionsPromise;
    };

    UploadDataUrl.mediaDuration = function (file) {
      var deferred;
      if (file.duration) {
        deferred = $q.defer();
        $timeout(function () {
          deferred.resolve(file.duration);
        });
        return deferred.promise;
      }
      if (file.$ngfDurationsPromise) return file.$ngfDurationsPromise;

      deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('audio') === 0 || file.type.indexOf('video') === 0) {
          deferred.reject('not image');
          return;
        }
        UploadDataUrl.dataUrl(file).then(function (dataUrl) {
          var el = angular.element(file.type.indexOf('audio') === 0 ? '<audio>' : '<video>')
            .attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');

          el.on('loadedmetadata', function () {
            var duration = el[0].duration;
            file.duration = duration;
            delete file.$ngfDurationsPromise;
            el.remove();
            deferred.resolve(duration);
          });
          el.on('error', function () {
            el.remove();
            delete file.$ngfDurationsPromise;
            deferred.reject('load error');
          });
          angular.element(document.body).append(el);
        }, function () {
          delete file.$ngfDurationsPromise;
          deferred.reject('load error');
        });
      });

      file.$ngfDurationsPromise = deferred.promise;
      return file.$ngfDurationsPromise;
    };
    return UploadDataUrl;
  }]);
})();
