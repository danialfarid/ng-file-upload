ngFileUpload.service('UploadResize', ['UploadValidate', '$q', function (UploadValidate, $q) {
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

  // Extracted from https://github.com/romelgomez/angular-firebase-image-upload/blob/master/app/scripts/fileUpload.js#L89
  var resize = function (imagen, width, height, quality, type) {
    var deferred = $q.defer();
    var canvasElement = document.createElement('canvas');
    var imageElement = document.createElement('img');

    imageElement.onload = function () {
      try {
        if (!width) {
          width = imageElement.width;
        }
        if (!height) {
          height = imageElement.height;
        }
        var dimensions = calculateAspectRatioFit(imageElement.width, imageElement.height, width, height);
        canvasElement.width = dimensions.width;
        canvasElement.height = dimensions.height;
        var context = canvasElement.getContext('2d');
        context.drawImage(imageElement, 0, 0, dimensions.width, dimensions.height);
        deferred.resolve(canvasElement.toDataURL(type || 'image/WebP', quality || 1.0));
      } catch (e) {
        deferred.reject(e);
      }
    };
    imageElement.onerror = function () {
      deferred.reject();
    };
    imageElement.src = imagen;
    return deferred.promise;
  };

  upload.dataUrltoBlob = function (dataurl, name) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var blob = new Blob([u8arr], {type: mime});
    blob.name = name;
    return blob;
  };

  upload.isResizeSupported = function () {
    var elem = document.createElement('canvas');
    return window.atob && elem.getContext && elem.getContext('2d');
  };

  if (upload.isResizeSupported()) {
    // add name getter to the blob constructor prototype
    Object.defineProperty(Blob.prototype, 'name', {
      get: function () {
        return this.$ngfName;
      },
      set: function (v) {
        this.$ngfName = v;
      },
      configurable: true
    });
  }

  upload.resize = function (file, width, height, quality, type) {
    if (file.type.indexOf('image') !== 0) return upload.emptyPromise(file);

    var deferred = $q.defer();
    upload.dataUrl(file, true).then(function (url) {
      resize(url, width, height, quality, type || file.type).then(function (dataUrl) {
        deferred.resolve(upload.dataUrltoBlob(dataUrl, file.name));
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
