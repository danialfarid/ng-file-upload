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

    upload.registerValidators = function (ngModel, attr, scope, later) {
      ngModel.$ngfValidations = ngModel.$ngfValidations || {};

      function setValidities(ngModel) {
        for (var k in ngModel.$ngfValidations) {
          if (ngModel.$ngfValidations.hasOwnProperty(k)) {
            ngModel.$setValidity(k, ngModel.$ngfValidations[k]);
          }
        }
      }

      ngModel.$formatters.push(function (val) {
        if (later) {
          upload.validate(val, ngModel, attr, scope, false, function () {
            setValidities(ngModel);
          });
        } else {
          for (var k in ngModel.$ngfValidations) {
            if (ngModel.$ngfValidations.hasOwnProperty(k)) {
              ngModel.$setValidity(k, ngModel.$ngfValidations[k]);
            }
          }
          setValidities(ngModel);
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
      var attrGetter = function (name, params) {
        return upload.attrGetter(name, attr, scope, params);
      };

      if (later) {
        callback.call(ngModel);
        return;
      }

      function validateSync(name, validatorVal, fn) {
        if (files) {
          var valid = null, dName = 'ngf' + name[0].toUpperCase() + name.substr(1);
          angular.forEach(files.length === undefined ? [files] : files, function (file) {
            var val = attrGetter(dName, {'$file': file});
            if (val == null) {
              val = validatorVal(attrGetter('ngfValidate') || {});
            }
            if (val != null) {
              valid = true;
              if (!fn(file, val)) {
                file.$error = name;
                file.$errorParam = val;
                valid = false;
                return false;
              }
            }
          });
          if (valid != null) {
            ngModel.$ngfValidations[name] = valid;
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

      validateSync('validateFn', function () {return null;}, function (file, r) {
        return r === true || r === null || r === '';
      });

      var pendings = 0;

      function validateASync(name, validatorVal, type, asyncFn, fn) {
        if (files) {
          var thisPendings = 0, hasError = false, dName = 'ngf' + name[0].toUpperCase() + name.substr(1);
          files = files.length === undefined ? [files] : files;
          angular.forEach(files, function (file) {
            if (file.type.search(type) !== 0) {
              return true;
            }
            var val = attrGetter(dName, {'$file': file}) || validatorVal(attrGetter('ngfValidate') || {});
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
                file.$error = name;
                file.$errorParam = val;
                hasError = true;
              }).finally(function () {
                pendings--;
                thisPendings--;
                if (!thisPendings) {
                  ngModel.$ngfValidations[name] = !hasError;
                }
                if (!pendings) {
                  callback.call(ngModel, ngModel.$ngfValidations);
                }
              });
            }
          });
        }
      }

      validateASync('maxHeight', function (cons) {
        return cons.height && cons.height.max;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.height <= val;
      });
      validateASync('minHeight', function (cons) {
        return cons.height && cons.height.min;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.height >= val;
      });
      validateASync('maxWidth', function (cons) {
        return cons.height && cons.width.max;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.width <= val;
      });
      validateASync('minWidth', function (cons) {
        return cons.height && cons.width.min;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.width >= val;
      });
      validateASync('maxDuration', function (cons) {
        return cons.height && cons.duration.max;
      }, /audio|video/, this.mediaDuration, function (d, val) {
        return d <= translateScalars(val);
      });
      validateASync('minDuration', function (cons) {
        return cons.height && cons.duration.min;
      }, /audio|video/, this.mediaDuration, function (d, val) {
        return d >= translateScalars(val);
      });

      validateASync('validateAsyncFn', function () {return null;}, /./, function (file, val) {
        return val;
      }, function (r) {
        return r === true || r === null || r === '';
      });

      if (!pendings) {
        callback.call(ngModel, ngModel.$ngfValidations);
      }
    };

    var dimensionPromises = {}, durationPromises = {};
    upload.imageDimensions = function (file) {
      if (file.width && file.height) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve({width: file.width, height: file.height});
        });
        return d.promise;
      }
      if (dimensionPromises[file]) return dimensionPromises[file];

      var deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('image') !== 0) {
          deferred.reject('not image');
          return;
        }
        upload.dataUrl(file).then(function (dataUrl) {
          var img = angular.element('<img>').attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');
          img.on('load', function () {
            var width = img[0].clientWidth;
            var height = img[0].clientHeight;
            img.remove();
            file.width = width;
            file.height = height;
            deferred.resolve({width: width, height: height});
          });
          img.on('error', function () {
            img.remove();
            deferred.reject('load error');
          });
          angular.element(document.body).append(img);
        }, function () {
          deferred.reject('load error');
        });
      });

      dimensionPromises[file] = deferred.promise;
      dimensionPromises[file].finally(function () {
        delete dimensionPromises[file];
      });
      return dimensionPromises[file];
    };

    upload.mediaDuration = function (file) {
      if (file.duration) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve(file.duration);
        });
        return d.promise;
      }
      if (durationPromises[file]) return durationPromises[file];

      var deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('audio') === 0 || file.type.indexOf('video') === 0) {
          deferred.reject('not image');
          return;
        }
        upload.dataUrl(file).then(function (dataUrl) {
          var el = angular.element(file.type.indexOf('audio') === 0 ? '<audio>' : '<video>')
            .attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');

          el.on('loadedmetadata', function () {
            var duration = el[0].duration;
            file.duration = duration;
            el.remove();
            deferred.resolve(duration);
          });
          el.on('error', function () {
            el.remove();
            deferred.reject('load error');
          });
          angular.element(document.body).append(el);
        }, function () {
          deferred.reject('load error');
        });
      });

      durationPromises[file] = deferred.promise;
      durationPromises[file].finally(function () {
        delete durationPromises[file];
      });
      return durationPromises[file];
    };
    return upload;
  }
  ])
  ;
})
();
