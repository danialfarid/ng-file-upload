(function () {

  function fileToSrc(Upload, scope, $parse, attr, name, defaultName, callback) {
      scope.$watch(name, function (file) {
        if (window.FileReader && ngFileUpload.validate(scope, $parse, attr, file, null)) {
        Upload.dataUrl(file, function(url) {
          if (callback) {
            callback(url);
          } else {
            file.dataUrl = url || $parse(defaultName)(scope);
          }
        }, $parse(attr.ngfNoObjectUrl)(scope));
      }
      });
  }

  /** @namespace attr.ngfSrc */
  /** @namespace attr.ngfDefaultSrc */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfSrc', ['$parse', 'Upload', function ($parse, Upload) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        fileToSrc(Upload, scope, $parse, attr, attr.ngfSrc, attr.ngfDefaultSrc, function (url) {
          elem.attr('src', url);
        });
      }
    };
  }]);

  /** @namespace attr.ngfBackground */
  /** @namespace attr.ngfDefaultBackground */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfBackground', ['$parse', 'Upload', function ($parse, Upload) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        fileToSrc(Upload, scope, $parse, attr, attr.ngfBackground, attr.ngfDefaultBackground, function (url) {
          elem.css('background-image', 'url(' + url + ')');
        });
      }
    };
  }]);

  /** @namespace attr.ngfDataUrl */
  /** @namespace attr.ngfDefaultDataUrl */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfDataUrl', ['$parse', 'Upload', function ($parse, Upload) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {

        fileToSrc(Upload, scope, $parse, attr, attr.ngfDataUrl, attr.ngfDefaultDataUrl);
      }
    };
  }]);
})();
