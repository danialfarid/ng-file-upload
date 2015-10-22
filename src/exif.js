// customized version of https://github.com/exif-js/exif-js
ngFileUpload.service('UploadExif', ['UploadResize', '$q', function (UploadResize, $q) {
  var upload = UploadResize;

  function findEXIFinJPEG(file) {
    var dataView = new DataView(file);

    if ((dataView.getUint8(0) !== 0xFF) || (dataView.getUint8(1) !== 0xD8)) {
      return 'Not a valid JPEG';
    }

    var offset = 2,
      length = file.byteLength,
      marker;

    while (offset < length) {
      if (dataView.getUint8(offset) !== 0xFF) {
        return 'Not a valid marker at offset ' + offset + ', found: ' + dataView.getUint8(offset);
      }

      marker = dataView.getUint8(offset + 1);
      if (marker === 225) {
        return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);
      } else {
        offset += 2 + dataView.getUint16(offset + 2);
      }
    }
  }

  function readOrientation(file, tiffStart, dirStart, bigEnd) {
    var entries = file.getUint16(dirStart, !bigEnd),
      entryOffset, i;

    for (i = 0; i < entries; i++) {
      entryOffset = dirStart + i * 12 + 2;
      var val = file.getUint16(entryOffset, !bigEnd);
      if (0x0112 === val) {
        return readTagValue(file, entryOffset, tiffStart, bigEnd);
      }
    }
    return null;
  }

  function readTagValue(file, entryOffset, tiffStart, bigEnd) {
    var numValues = file.getUint32(entryOffset + 4, !bigEnd),
      valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart, offset, vals, n;

    if (numValues === 1) {
      return file.getUint16(entryOffset + 8, !bigEnd);
    } else {
      offset = numValues > 2 ? valueOffset : (entryOffset + 8);
      vals = [];
      for (n = 0; n < numValues; n++) {
        vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
      }
      return vals;
    }
  }

  function getStringFromDB(buffer, start, length) {
    var outstr = '';
    for (var n = start; n < start + length; n++) {
      outstr += String.fromCharCode(buffer.getUint8(n));
    }
    return outstr;
  }

  function readEXIFData(file, start) {
    if (getStringFromDB(file, start, 4) !== 'Exif') {
      return 'Not valid EXIF data! ' + getStringFromDB(file, start, 4);
    }

    var bigEnd,
      tiffOffset = start + 6;

    // test for TIFF validity and endianness
    if (file.getUint16(tiffOffset) === 0x4949) {
      bigEnd = false;
    } else if (file.getUint16(tiffOffset) === 0x4D4D) {
      bigEnd = true;
    } else {
      return 'Not valid TIFF data! (no 0x4949 or 0x4D4D)';
    }

    if (file.getUint16(tiffOffset + 2, !bigEnd) !== 0x002A) {
      return 'Not valid TIFF data! (no 0x002A)';
    }

    var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);

    if (firstIFDOffset < 0x00000008) {
      return 'Not valid TIFF data! (First offset less than 8)', file.getUint32(tiffOffset + 4, !bigEnd);
    }

    return readOrientation(file, tiffOffset, tiffOffset + firstIFDOffset, bigEnd);

  }

  upload.isExifSupported = function() {
    return window.FileReader && new FileReader().readAsArrayBuffer && upload.isResizeSupported();
  };

  upload.orientation = function (file) {
    if (file.$ngfOrientation != null) {
      return upload.emptyPromise(file.$ngfOrientation);
    }
    var defer = $q.defer();
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
      var orientation = findEXIFinJPEG(e.target.result);
      if (angular.isString(orientation)) {
        defer.reject(orientation);
      } else {
        file.$ngfOrientation = orientation;
        defer.resolve(orientation);
      }
    };
    fileReader.onerror = function (e) {
      defer.reject(e);
    };

    fileReader.readAsArrayBuffer(file);
    return defer.promise;
  };


  function applyTransform(ctx, orientation, width, height) {
    switch (orientation) {
      case 1:
        return ctx.transform(1, 0, 0, 1, 0, 0);
      case 2:
        return ctx.transform(-1, 0, 0, 1, width, 0);
      case 3:
        return ctx.transform(-1, 0, 0, -1, width, height);
      case 4:
        return ctx.transform(1, 0, 0, -1, 0, height);
      case 5:
        return ctx.transform(0, 1, 1, 0, 0, 0);
      case 6:
        return ctx.transform(0, 1, -1, 0, height, 0);
      case 7:
        return ctx.transform(0, -1, -1, 0, height, width);
      case 8:
        return ctx.transform(0, -1, 1, 0, 0, width);
    }
  }

  upload.applyExifRotation = function (file) {
    if (file.type.indexOf('image/jpeg') !== 0) {
      return upload.emptyPromise(file);
    }

    var deferred = $q.defer();
    upload.orientation(file).then(function (orientation) {
      if (!orientation || orientation > 8) {
        deferred.resolve(file);
      }
      upload.dataUrl(file, true).then(function (url) {
        var canvas = document.createElement('canvas');
        var img = document.createElement('img');

        img.onload = function () {
          try {
            canvas.width = orientation > 4 ? img.height : img.width;
            canvas.height = orientation > 4 ? img.width : img.height;
            var ctx = canvas.getContext('2d');
            applyTransform(ctx, orientation, img.width, img.height);
            ctx.drawImage(img, 0, 0);
            var dataUrl = canvas.toDataURL(file.type || 'image/WebP', 1.0);
            var blob = upload.dataUrltoBlob(dataUrl, file.name);
            deferred.resolve(blob);
          } catch (e) {
            deferred.reject(e);
          }
        };
        img.onerror = function () {
          deferred.reject();
        };
        img.src = url;
      }, function (e) {
        deferred.reject(e);
      });
    }, function (e) {
      deferred.reject(e);
    });
    return deferred.promise;
  };

  return upload;
}]);

