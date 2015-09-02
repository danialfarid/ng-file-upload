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

  ngFileUpload.service('UploadValidate', ['UploadDataUrl', '$q', '$timeout', function (UploadDataUrl, $q, $timeout) {
    var upload = UploadDataUrl;

    upload.registerValidators = function (ngModel, elem, attr, scope) {
      if (!ngModel) return;

      ngModel.$ngfValidations = [];
      function setValidities(ngModel) {
        angular.forEach(ngModel.$ngfValidations, function (validation) {
          ngModel.$setValidity(validation.name, validation.valid);
        });
      }

      ngModel.$formatters.push(function (val) {
        if (upload.attrGetter('ngfValidateLater', attr, scope) || !ngModel.$$ngfValidated) {
          upload.validate(val, ngModel, attr, scope, false, function () {
            setValidities(ngModel);
            ngModel.$$ngfValidated = false;
          });
          if (val && val.length === 0) {
            val = null;
          }
          if (elem && (val == null || val.length === 0)) {
            if (elem.val()) {
              elem.val(null);
            }
          }
        } else {
          setValidities(ngModel);
          ngModel.$$ngfValidated = false;
        }
        return val;
      });
    };

    upload.validatePattern = function (file, val) {
      if (!val) {
        return true;
      }
      var regexp = new RegExp(globStringToRegex(val), 'gi');
      return (file.type != null && regexp.test(file.type.toLowerCase())) ||
        (file.name != null && regexp.test(file.name.toLowerCase()));
    };

    upload.validate = function (files, ngModel, attr, scope, later, callback) {
      ngModel = ngModel || {};
      ngModel.$ngfValidations = ngModel.$ngfValidations || [];

      angular.forEach(ngModel.$ngfValidations, function (v) {
        v.valid = true;
      });

      var attrGetter = function (name, params) {
        return upload.attrGetter(name, attr, scope, params);
      };

      if (later) {
        callback.call(ngModel);
        return;
      }
      ngModel.$$ngfValidated = true;

      if (files == null || files.length === 0) {
        callback.call(ngModel);
        return;
      }

      files = files.length === undefined ? [files] : files.slice(0);

      function validateSync(name, validatorVal, fn) {
        if (files) {
          var dName = 'ngf' + name[0].toUpperCase() + name.substr(1);
          var i = files.length, valid = null;

          while (i--) {
            var file = files[i];
            var val = attrGetter(dName, {'$file': file});
            if (val == null) {
              val = validatorVal(attrGetter('ngfValidate') || {});
              valid = valid == null ? true : valid;
            }
            if (val != null) {
              if (!fn(file, val)) {
                file.$error = name;
                file.$errorParam = val;
                files.splice(i, 1);
                valid = false;
              }
            }
          }
          if (valid !== null) {
            ngModel.$ngfValidations.push({name: name, valid: valid});
          }
        }
      }

      validateSync('pattern', function (cons) {
        return cons.pattern;
      }, upload.validatePattern);
      validateSync('minSize', function (cons) {
        return cons.size && cons.size.min;
      }, function (file, val) {
        return file.size >= translateScalars(val);
      });
      validateSync('maxSize', function (cons) {
        return cons.size && cons.size.max;
      }, function (file, val) {
        return file.size <= translateScalars(val);
      });

      validateSync('validateFn', function () {
        return null;
      }, function (file, r) {
        return r === true || r === null || r === '';
      });

      if (!files.length) {
        callback.call(ngModel, ngModel.$ngfValidations);
        return;
      }

      var pendings = 0;

      function validateAsync(name, validatorVal, type, asyncFn, fn) {
        if (files) {
          var thisPendings = 0, hasError = false, dName = 'ngf' + name[0].toUpperCase() + name.substr(1);
          files = files.length === undefined ? [files] : files;
          angular.forEach(files, function (file) {
            if (file.type.search(type) !== 0) {
              return true;
            }
            var val = attrGetter(dName, {'$file': file}) || validatorVal(attrGetter('ngfValidate', {'$file': file}) || {});
            if (val) {
              pendings++;
              thisPendings++;
              asyncFn(file, val).then(function (d) {
                if (!fn(d, val)) {
                  file.$error = name;
                  file.$errorParam = val;
                  hasError = true;
                }
              }, function () {
                if (attrGetter('ngfValidateForce', {'$file': file})) {
                  file.$error = name;
                  file.$errorParam = val;
                  hasError = true;
                }
              })['finally'](function () {
                pendings--;
                thisPendings--;
                if (!thisPendings) {
                  ngModel.$ngfValidations.push({name: name, valid: !hasError});
                }
                if (!pendings) {
                  callback.call(ngModel, ngModel.$ngfValidations);
                }
              });
            }
          });
        }
      }

      validateAsync('maxHeight', function (cons) {
        return cons.height && cons.height.max;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.height <= val;
      });
      validateAsync('minHeight', function (cons) {
        return cons.height && cons.height.min;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.height >= val;
      });
      validateAsync('maxWidth', function (cons) {
        return cons.width && cons.width.max;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.width <= val;
      });
      validateAsync('minWidth', function (cons) {
        return cons.width && cons.width.min;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.width >= val;
      });
      validateAsync('ratio', function (cons) {
        return cons.ratio;
      }, /image/, this.imageDimensions, function (d, val) {
        var split = val.toString().split(','), valid = false;

        for (var i = 0; i < split.length; i++) {
          var r = split[i], xIndex = r.search(/x/i);
          if (xIndex > -1) {
            r = parseFloat(r.substring(0, xIndex)) / parseFloat(r.substring(xIndex + 1));
          } else {
            r = parseFloat(r);
          }
          if (Math.abs((d.width / d.height) - r) < 0.0001) {
            valid = true;
          }
        }
        return valid;
      });
      validateAsync('maxDuration', function (cons) {
        return cons.duration && cons.duration.max;
      }, /audio|video/, this.mediaDuration, function (d, val) {
        return d <= translateScalars(val);
      });
      validateAsync('minDuration', function (cons) {
        return cons.duration && cons.duration.min;
      }, /audio|video/, this.mediaDuration, function (d, val) {
        return d >= translateScalars(val);
      });

      validateAsync('validateAsyncFn', function () {
        return null;
      }, /./, function (file, val) {
        return val;
      }, function (r) {
        return r === true || r === null || r === '';
      });

      if (!pendings) {
        callback.call(ngModel, ngModel.$ngfValidations);
      }
    };

    upload.imageDimensions = function (file) {
      if (file.width && file.height) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve({width: file.width, height: file.height});
        });
        return d.promise;
      }
      if (file.$ngfDimensionPromise) return file.$ngfDimensionPromise;

      var deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('image') !== 0) {
          deferred.reject('not image');
          return;
        }
        upload.dataUrl(file).then(function (dataUrl) {
          var img = angular.element('<img>').attr('src', dataUrl).css('visibility', 'hidden').css('position', 'fixed');

          function success() {
            var width = img[0].clientWidth;
            var height = img[0].clientHeight;
            img.remove();
            file.width = width;
            file.height = height;
            deferred.resolve({width: width, height: height});
          }

          function error() {
            img.remove();
            deferred.reject('load error');
          }

          img.on('load', success);
          img.on('error', error);
          var count = 0;

          function checkLoadError() {
            $timeout(function () {
              if (img[0].parentNode) {
                if (img[0].clientWidth) {
                  success();
                } else if (count > 10) {
                  error();
                } else {
                  checkLoadError();
                }
              }
            }, 1000);
          }

          checkLoadError();

          angular.element(document.getElementsByTagName('body')[0]).append(img);
        }, function () {
          deferred.reject('load error');
        });
      });

      file.$ngfDimensionPromise = deferred.promise;
      file.$ngfDimensionPromise['finally'](function () {
        delete file.$ngfDimensionPromise;
      });
      return file.$ngfDimensionPromise;
    };

    upload.mediaDuration = function (file) {
      if (file.duration) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve(file.duration);
        });
        return d.promise;
      }
      if (file.$ngfDurationPromise) return file.$ngfDurationPromise;

      var deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('audio') !== 0 && file.type.indexOf('video') !== 0) {
          deferred.reject('not media');
          return;
        }
        upload.dataUrl(file).then(function (dataUrl) {
          var el = angular.element(file.type.indexOf('audio') === 0 ? '<audio>' : '<video>')
            .attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');

          function success() {
            var duration = el[0].duration;
            file.duration = duration;
            el.remove();
            deferred.resolve(duration);
          }

          function error() {
            el.remove();
            deferred.reject('load error');
          }

          el.on('loadedmetadata', success);
          el.on('error', error);
          var count = 0;

          function checkLoadError() {
            $timeout(function () {
              if (el[0].parentNode) {
                if (el[0].duration) {
                  success();
                } else if (count > 10) {
                  error();
                } else {
                  checkLoadError();
                }
              }
            }, 1000);
          }

          checkLoadError();

          angular.element(document.body).append(el);
        }, function () {
          deferred.reject('load error');
        });
      });

      file.$ngfDurationPromise = deferred.promise;
      file.$ngfDurationPromise['finally'](function () {
        delete file.$ngfDurationPromise;
      });
      return file.$ngfDurationPromise;
    };
    return upload;
  }
  ]);

})();
