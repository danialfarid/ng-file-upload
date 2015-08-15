(function () {

  ngFileUpload.service('UploadDataUrl', ['UploadBase', '$timeout', function(UploadBase, $timeout) {
    UploadBase.dataUrl = function (file, callback, disallowObjectUrl) {
      if (window.FileReader && file &&
        (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
        (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)) {
        $timeout(function () {
          //prefer URL.createObjectURL for handling refrences to files of all sizes
          //since it doesn´t build a large string in memory
          var URL = window.URL || window.webkitURL;
          if (URL && URL.createObjectURL && !disallowObjectUrl) {
            var url;
            try {
              url = URL.createObjectURL(file);
            } catch(e) {
              callback('', file);
            }
            if (url) callback(url, file);
          } else {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
              $timeout(function () {
                callback(e.target.result, file);
              });
            };
          }
        });
      } else {
        callback(null, file);
      }
    };
    return UploadBase;
  }]);

  /** @namespace attr.ngfSrc */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfSrc', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function() {
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
        $timeout(function() {
          elem.attr('style', elem.attr('style') + ';background-image:url(\'{{(' + attr.ngfBackground + ') | ngfDataUrl' +
            ($parse(attr.ngfNoObjectUrl)(scope) === true ? ':true' : '') + '}}\')');
          attr.$set('ngfBackground', null);
          $compile(elem)(scope);
        });
      }
    };
  }]);

  ngFileUpload.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|local|file|data|blob):/);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|local|file|data|blob):/);
  }]);

  ngFileUpload.filter('ngfDataUrl', ['UploadDataUrl', '$sce', function (UploadDataUrl, $sce) {
    return function (file, disallowObjectUrl) {
      if (angular.isString(file)) {
        return $sce.trustAsResourceUrl(file);
      }
      if (file && !file.dataUrl) {
        if (file.dataUrl === undefined && angular.isObject(file)) {
          file.dataUrl = null;
          UploadDataUrl.dataUrl(file, function (url, file) {
            file.dataUrl = url;
          }, disallowObjectUrl);
        }
        return '';
      }
      return (file && file.dataUrl ? $sce.trustAsResourceUrl(file.dataUrl) : file) || '';
    };
  }]);

})();
