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

  ngFileUpload.service('Upload', ['UploadDataUrl', function (UploadDataUrl) {
    var getAttr = ngFileUpload.getAttrWithDefaults;
    UploadDataUrl.validate = function (scope, $parse, attr, files, evt, callback) {
      if (getAttr(attr, 'ngfValidate') == null && getAttr(attr, 'ngfAccept') == null) {
        return callback(files);
      }

      var accFiles = [], rejFiles = [];

      function fileCallback(file, accepted) {
        if (accepted) {
          accFiles.push(file);
        } else {
          rejFiles.push(file);
        }
        validated++;
        if (validated === files.length) {
          callback(accFiles, rejFiles);
        }
      }

      var accept = $parse(getAttr(attr, 'ngfAccept'))(scope, {$event: evt});
      var validated = 0;
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var validator = $parse(getAttr(attr, 'ngfValidate'))(scope, {$file: file, $event: evt});
        if (validator != null && (validator === false || angular.isString(validator))) {
          file.$error = 'validate';
          file.$errorParam = validator;
          fileCallback(file, false);
        } else if (validator != null || accept != null) {
          validator = validator || {};
          if (accept != null) validator.accept = accept;
          this.validateFile(file, validator, fileCallback);
        } else {
          fileCallback(file, true);
        }
      }
    };

    UploadDataUrl.validateFile = function (file, constraints, callback) {
      if (file == null) {
        return callback(file, false);
      }

      var accept = constraints.accept;
      if (constraints.accept != null && angular.isString(constraints.accept)) {
        var regexp = new RegExp(globStringToRegex(constraints.accept), 'gi');
        accept = (file.type != null && regexp.test(file.type.toLowerCase())) ||
          (file.name != null && regexp.test(file.name.toLowerCase()));
        if (!accept) {
          file.$error = 'accept';
          return callback(file, false);
        }
      } else {
        if (accept === false) {
          file.$error = 'accept';
          return callback(file, false);
        }
      }
      if (file.size != null && constraints.size && (constraints.size.max || constraints.size.min)) {
        if (file.size > translateScalars(constraints.size.max)) {
          file.$error = 'size.max';
          file.$errorParam = constraints.size.max;
          return callback(file, false);
        }
        if (file.size < translateScalars(constraints.size.min)) {
          file.$error = 'size.min';
          file.$errorParam = constraints.size.min;
          return callback(file, false);
        }
      }

      if ((constraints.width || constraints.height) && file.type.indexOf('image') === 0) {
        this.imageDimensions(file, function (width, height) {
          file.width = width;
          file.height = height;
          if (constraints.width && (constraints.width.min || constraints.width.max)) {
            if (constraints.width.max && width > translateScalars(constraints.width.max)) {
              file.$error = 'width.max';
              file.$errorParam = constraints.width.max;
            }
            if (constraints.width.min && width < translateScalars(constraints.width.min)) {
              file.$error = 'width.min';
              file.$errorParam = constraints.width.min;
            }
            if (!width && !constraints.width.soft) {
              file.$error = constraints.width.min ? 'width.min' : 'width.max';
              file.$errorParam = constraints.width.min || constraints.width.max;
            }
          }
          if (constraints.height && (constraints.height.min || constraints.height.max)) {
            if (constraints.height.max && height > translateScalars(constraints.height.max)) {
              file.$error = 'height.max';
              file.$errorParam = constraints.height.max;
            }
            if (constraints.height.min && height < translateScalars(constraints.height.min)) {
              file.$error = 'height.min';
              file.$errorParam = constraints.height.min;
            }
            if (!height && !constraints.height.soft) {
              file.$error = constraints.height.min ? 'height.min' : 'height.max';
              file.$errorParam = constraints.height.min || constraints.height.max;
            }
            callback(file, !file.$error);
          }
        });
        if ((constraints.width && (constraints.width.min || constraints.width.max)) ||
          (constraints.height && (constraints.height.min || constraints.height.max))) return;
      }
      if ((constraints.duration) &&
        (file.type.indexOf('audio') === 0 || file.type.indexOf('video') === 0)) {
        this.mediaDuration(file, function (duration) {
          file.duration = duration;
          if (constraints.duration.min || constraints.duration.max) {
            if (constraints.duration.max && duration > translateScalars(constraints.duration.max)) {
              file.$error = 'duration.max';
              file.$errorParam = constraints.duration.max;
            }
            if (constraints.duration.min && duration < translateScalars(constraints.duration.min)) {
              file.$error = 'duration.min';
              file.$errorParam = constraints.duration.min;
            }
            if (!duration && !constraints.duration.soft) {
              file.$error = constraints.duration.min ? 'duration.min' : 'duration.max';
              file.$errorParam = constraints.duration.min || constraints.duration.max;
            }
            callback(file, !file.$error);
          }
        });
        if (constraints.duration.min || constraints.duration.max) return;
      }

      return callback(file, true);
    };

    UploadDataUrl.imageDimensions = function (file, callback) {
      if (file.type.indexOf('image') === 0) {
        UploadDataUrl.dataUrl(file, function (dataUrl) {
          var img = angular.element('<img>').attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');
          img.on('load error', function () {
            var width = img[0].clientWidth;
            var height = img[0].clientHeight;
            img.remove();
            callback(width, height, file);
          });
          angular.element(document.body).append(img);
        }, true);
      } else {
        return false;
      }
    };
    UploadDataUrl.mediaDuration = function (file, callback) {
      if (file.type.indexOf('audio') === 0 || file.type.indexOf('video') === 0) {
        UploadDataUrl.dataUrl(file, function (dataUrl) {
          var el = angular.element(file.type.indexOf('audio') === 0 ? '<audio>' : '<video>')
            .attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');

          el.on('loadedmetadata error', function () {
            var duration = el[0].duration;
            el.remove();
            callback(duration, file);
          });
          angular.element(document.body).append(el);
        });
      } else {
        return false;
      }
    };
    return UploadDataUrl;
  }]);
})();
