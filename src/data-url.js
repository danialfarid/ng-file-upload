(function () {

  ngFileUpload.service('UploadDataUrl', ['UploadBase', '$timeout', '$q', function (UploadBase, $timeout, $q) {
    var upload = UploadBase;
    upload.dataUrl = function (file, disallowObjectUrl) {
      if (file.dataUrl) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve(file.dataUrl);
        });
        return d.promise;
      }
      if (file.$ngfDataUrlPromise) return file.$ngfDataUrlPromise;

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
            fileReader.onerror = function () {
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

      file.$ngfDataUrlPromise = deferred.promise;
      file.$ngfDataUrlPromise['finally'](function () {
        delete file.$ngfDataUrlPromise;
      });
      return file.$ngfDataUrlPromise;
    };
    return upload;
  }]);

  function getTagType(el) {
    if (el.tagName.toLowerCase() === 'img') return 'image';
    if (el.tagName.toLowerCase() === 'audio') return 'audio';
    if (el.tagName.toLowerCase() === 'video') return 'video';
    return /\./;
  }

  var style = document.createElement('style');
  style.innerHTML = '.ngf-hide{display:none !important}';
  document.getElementsByTagName('head')[0].appendChild(style);

  /** @namespace attr.ngfSrc */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfSrc', ['$compile', '$timeout', 'Upload', function ($compile, $timeout, Upload) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function () {
          scope.$watch(attr.ngfSrc, function (file) {
            if (file && file.type.indexOf(getTagType(elem[0])) === 0) {
              Upload.dataUrl(file, Upload.attrGetter('ngfNoObjectUrl', attr, scope))['finally'](function () {
                $timeout(function () {
                  if (file.dataUrl) {
                    elem.removeClass('ngf-hide');
                    elem.attr('src', file.dataUrl);
                  }
                });
              });
            } else {
              elem.addClass('ngf-hide');
            }
          });
        });
      }
    };
  }]);

  /** @namespace attr.ngfBackground */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfBackground', ['Upload', '$compile', '$timeout', function (Upload, $compile, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function () {
          scope.$watch(attr.ngfBackground, function (file) {
            console.log(elem[0], elem.css('display'),
              elem.css('visibility'), elem[0].parentNode);
            if (file && file.type.indexOf('image') === 0) {
              Upload.dataUrl(file, Upload.attrGetter('ngfNoObjectUrl', attr, scope))['finally'](function () {
                $timeout(function () {
                  if (file.dataUrl) elem.attr('style', elem.attr('style') +
                    ';background-image:url(\'' + file.dataUrl + '\')');
                });
              });
            }
          });
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
          }, function () {
            file.dataUrl = '';
          });
        }
        return '';
      }
      return (file && file.dataUrl ? $sce.trustAsResourceUrl(file.dataUrl) : file) || '';
    };
  }]);

})();
