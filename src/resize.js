// source: Source: https://github.com/romelgomez/angular-firebase-image-upload/blob/master/app/scripts/fileUpload.js#L89

ngFileUpload.service('UploadResize', ['UploadValidate', '$q', '$timeout', function (UploadValidate, $q, $timeout) {
  var upload = UploadValidate;

  /**
   * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
   * images to fit into a certain area.
   * Source:  http://stackoverflow.com/a/14731922
   *
   * @param {Number} srcWidth Source area width
   * @param {Number} srcHeight Source area height
   * @param {Number} maxWidth Nestable area maximum available width
   * @param {Number} maxHeight Nestable area maximum available height
   * @return {Object} { width, height }
   */
  var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {width: srcWidth * ratio, height: srcHeight * ratio};
  };

  /**
   Reduce imagen size and quality.
   @param {String} imagen is a base64 string
   @param {Number} width
   @param {Number} height
   @param {Number} quality from 0.1 to 1.0
   @return Promise.<String>
   **/
  var resize = function (imagen, width, height, quality, type) {
    var deferred = $q.defer();
    var canvasElement = document.createElement('canvas');
    var imagenElement = document.createElement('img');
    if (width === 0) {
      width = imagenElement.width;
      height = imagenElement.height;
    }
    imagenElement.onload = function () {
      try {
        var dimensions = calculateAspectRatioFit(imagenElement.width, imagenElement.height, width, height);
        canvasElement.width = dimensions.width;
        canvasElement.height = dimensions.height;
        var context = canvasElement.getContext('2d');
        context.drawImage(imagenElement, 0, 0, dimensions.width, dimensions.height);
        deferred.resolve(canvasElement.toDataURL(type || 'image/WebP', quality || 1.0));
      } catch(e) {
        deferred.reject(e);
      }
    };
    imagenElement.onerror = function () {
      deferred.reject();
    };
    imagenElement.src = imagen;
    return deferred.promise;
  };

  var dataURLtoBlob = function (dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
  };

  upload.isResizeSupported = function() {
    var elem = document.createElement('canvas');
    return window.atob && elem.getContext && elem.getContext('2d');
  };

  upload.resize = function (file, width, height, quality) {
    var deferred = $q.defer();
    if (file.type.indexOf('image') !== 0) {
      $timeout(function() {deferred.resolve('Only images are allowed for resizing!');});
      return deferred.promise;
    }

    upload.dataUrl(file, true).then(function (url) {
      resize(url, width, height, quality, file.type).then(function (dataUrl) {
        var blob= dataURLtoBlob(dataUrl);
        blob.name = file.name;
        deferred.resolve(blob);
      }, function () {
        deferred.reject();
      });
    }, function () {
      deferred.reject();
    });
    return deferred.promise;
  };

  return upload;
}]);
