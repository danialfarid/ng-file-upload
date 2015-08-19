(function () {

  ngFileUpload.service('UploadDataUrl', ['UploadBase', '$timeout', '$q', function (UploadBase, $timeout, $q) {
    var promises = {}, upload = UploadBase;
    upload.dataUrl = function (file, disallowObjectUrl) {
      if (file.dataUrl) {
        var d = $q.defer();
        $timeout(function() {d.resolve(file.dataUrl);});
        return d.promise;
      }
      if (promises[file]) return promises[file];

      var deferred = $q.defer();
      $timeout(function () {
        if (window.FileReader && file &&
          (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
          (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)) {
          //prefer URL.createObjectURL for handling refrences to files of all sizes
          //since it doesn´t build a large string in memory
          var URL = window.URL || window.webkitURL;
          if (URL && URL.createObjectURL && !disallowObjectUrl) {
            var url;
            try {
              url = URL.createObjectURL(file);
            } catch (e) {
              deferred.reject();
              return;
            }
            file.dataUrl = url;
            if (url) deferred.resolve(url);
          } else {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
              $timeout(function () {
                file.dataUrl = e.target.result;
                deferred.resolve(e.target.result);
              });
            };
            fileReader.onerror = function() {
              $timeout(function () {
                file.dataUrl = '';
                deferred.reject();
              });
            };
            fileReader.readAsDataURL(file);
          }
        } else {
          file.dataUrl = '';
          deferred.reject();
        }
      });

      promises[file] = deferred.promise;
      promises[file].finally(function() {
        delete promises[file];
      });
      return promises[file];
    };
    return upload;
  }]);

  /** @namespace attr.ngfSrc */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfSrc', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function () {
          elem.attr('src', '{{(' + attr.ngfSrc + ') | ngfDataUrl' +
            ($parse(attr.ngfNoObjectUrl)(scope) === true ? ':true' : '') + '}}');
          attr.$set('ngfSrc', null);
          $compile(elem)(scope);
        });
      }
    };
  }]);

  /** @namespace attr.ngfBackground */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfBackground', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function () {
          elem.attr('style', elem.attr('style') + ';background-image:url(\'{{(' + attr.ngfBackground + ') | ngfDataUrl' +
            ($parse(attr.ngfNoObjectUrl)(scope) === true ? ':true' : '') + '}}\')');
          attr.$set('ngfBackground', null);
          $compile(elem)(scope);
        });
      }
    };
  }]);

  ngFileUpload.config(['$compileProvider', function ($compileProvider) {
    if ($compileProvider.imgSrcSanitizationWhitelist) $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|local|file|data|blob):/);
    if ($compileProvider.aHrefSanitizationWhitelist) $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|local|file|data|blob):/);
  }]);

  ngFileUpload.filter('ngfDataUrl', ['UploadDataUrl', '$sce', function (UploadDataUrl, $sce) {
    return function (file, disallowObjectUrl) {
      if (angular.isString(file)) {
        return $sce.trustAsResourceUrl(file);
      }
      if (file && !file.dataUrl) {
        if (file.dataUrl === undefined && angular.isObject(file)) {
          file.dataUrl = null;
          UploadDataUrl.dataUrl(file, disallowObjectUrl).then(function (url) {
            file.dataUrl = url;
          }, function() {
            file.dataUrl = '';
          });
        }
        return '';
      }
      return (file && file.dataUrl ? $sce.trustAsResourceUrl(file.dataUrl) : file) || '';
    };
  }]);

})();
