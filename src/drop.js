(function () {
  var getAttr = ngFileUpload.getAttrWithDefaults, uploadService;

  ngFileUpload.directive('ngfDrop', ['$parse', '$timeout', '$location', 'Upload',
    function ($parse, $timeout, $location, Upload) {
      uploadService = Upload;
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
          linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
        }
      };
    }]);

  ngFileUpload.directive('ngfNoFileDrop', function () {
    return function (scope, elem) {
      if (dropAvailable()) elem.css('display', 'none');
    };
  });

  ngFileUpload.directive('ngfDropAvailable', ['$parse', '$timeout', function ($parse, $timeout) {
    return function (scope, elem, attr) {
      if (dropAvailable()) {
        var fn = $parse(getAttr(attr, 'ngfDropAvailable'));
        $timeout(function () {
          fn(scope);
          if (fn.assign) {
            fn.assign(scope, true);
          }
        });
      }
    };
  }]);

  function linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
    var available = dropAvailable();
    if (getAttr(attr, 'dropAvailable')) {
      $timeout(function () {
        if (scope[getAttr(attr, 'dropAvailable')]) {
          scope[getAttr(attr, 'dropAvailable')].value = available;
        } else {
          scope[getAttr(attr, 'dropAvailable')] = available;
        }
      });
    }
    if (!available) {
      if ($parse(getAttr(attr, 'ngfHideOnDropNotAvailable'))(scope) === true) {
        elem.css('display', 'none');
      }
      return;
    }

    var disabled = false;
    if (getAttr(attr, 'ngfDrop').search(/\W+\$files\W+/) === -1) {
      scope.$watch(getAttr(attr, 'ngfDrop'), function (val) {
        disabled = val === false;
      });
    }

    var leaveTimeout = null;
    var stopPropagation = $parse(getAttr(attr, 'ngfStopPropagation'));
    var dragOverDelay = 1;
    var actualDragOverClass;

    elem[0].addEventListener('dragover', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      // handling dragover events from the Chrome download bar
      if (navigator.userAgent.indexOf('Chrome') > -1) {
        var b = evt.dataTransfer.effectAllowed;
        evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
      }
      $timeout.cancel(leaveTimeout);
      if (!actualDragOverClass) {
        actualDragOverClass = 'C';
        calculateDragOverClass(scope, attr, evt, function (clazz) {
          actualDragOverClass = clazz;
          elem.addClass(actualDragOverClass);
        });
      }
    }, false);
    elem[0].addEventListener('dragenter', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
    }, false);
    elem[0].addEventListener('dragleave', function () {
      if (elem.attr('disabled') || disabled) return;
      leaveTimeout = $timeout(function () {
        elem.removeClass(actualDragOverClass);
        actualDragOverClass = null;
      }, dragOverDelay || 1);
    }, false);
    elem[0].addEventListener('drop', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      elem.removeClass(actualDragOverClass);
      actualDragOverClass = null;
      extractFiles(evt, function (files, rejFiles) {
          ngFileUpload.updateModel($parse, $timeout, scope, ngModel, attr,
            getAttr(attr, 'ngfChange') || getAttr(attr, 'ngfDrop'), files, rejFiles, evt);
        }, $parse(getAttr(attr, 'ngfAllowDir'))(scope) !== false,
        getAttr(attr, 'multiple') || $parse(getAttr(attr, 'ngfMultiple'))(scope));
    }, false);
    elem[0].addEventListener('paste', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      var files = [];
      var clipboard = evt.clipboardData || evt.originalEvent.clipboardData;
      if (clipboard && clipboard.items) {
        for (var k = 0; k < clipboard.items.length; k++) {
          if (clipboard.items[k].type.indexOf('image') !== -1) {
            files.push(clipboard.items[k].getAsFile());
          }
        }
        uploadService.validate(scope, $parse, attr, files, evt, function (files, rejFiles) {
          ngFileUpload.updateModel($parse, $timeout, scope, ngModel, attr,
            getAttr(attr, 'ngfChange') || getAttr(attr, 'ngfDrop'), files, rejFiles, evt);
        });
      }
    }, false);

    function calculateDragOverClass(scope, attr, evt, callback) {
      var items = evt.dataTransfer.items, files = [];
      if (items != null) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].kind === 'file' || items[i].kind === '') {
            files.push(items[i]);
          }
        }
      }
      uploadService.validate(scope, $parse, attr, files, evt, function (files, rejFiles) {
        var clazz = $parse(getAttr(attr, 'ngfDragOverClass'))(scope, {$event: evt});
        if (clazz) {
          if (clazz.delay) dragOverDelay = clazz.delay;
          if (clazz.accept) clazz = !rejFiles || !rejFiles.length ? clazz.accept : clazz.reject;
        }
        callback(clazz || getAttr(attr, 'ngfDragOverClass') || 'dragover');
      });
    }

    function extractFiles(evt, callback, allowDir, multiple) {
      var files = [], processing = 0;

      function traverseFileTree(files, entry, path) {
        if (entry != null) {
          if (entry.isDirectory) {
            var filePath = (path || '') + entry.name;
            files.push({name: entry.name, type: 'directory', path: filePath});
            var dirReader = entry.createReader();
            var entries = [];
            processing++;
            var readEntries = function () {
              dirReader.readEntries(function (results) {
                try {
                  if (!results.length) {
                    for (var i = 0; i < entries.length; i++) {
                      traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                    }
                    processing--;
                  } else {
                    entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                    readEntries();
                  }
                } catch (e) {
                  processing--;
                  console.error(e);
                }
              }, function () {
                processing--;
              });
            };
            readEntries();
          } else {
            processing++;
            entry.file(function (file) {
              try {
                processing--;
                file.path = (path ? path : '') + file.name;
                files.push(file);
              } catch (e) {
                processing--;
                console.error(e);
              }
            }, function () {
              processing--;
            });
          }
        }
      }

      var items = evt.dataTransfer.items;

      if (items && items.length > 0 && $location.protocol() !== 'file') {
        for (var i = 0; i < items.length; i++) {
          if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
            var entry = items[i].webkitGetAsEntry();
            if (entry.isDirectory && !allowDir) {
              continue;
            }
            if (entry != null) {
              traverseFileTree(files, entry);
            }
          } else {
            var f = items[i].getAsFile();
            if (f != null) files.push(f);
          }
          if (!multiple && files.length > 0) break;
        }
      } else {
        var fileList = evt.dataTransfer.files;
        if (fileList != null) {
          for (var j = 0; j < fileList.length; j++) {
            files.push(fileList.item(j));
            if (!multiple && files.length > 0) {
              break;
            }
          }
        }
      }
      var delays = 0;
      (function waitForProcess(delay) {
        $timeout(function () {
          if (!processing) {
            if (!multiple && files.length > 1) {
              i = 0;
              while (files[i].type === 'directory') i++;
              files = [files[i]];
            }
            uploadService.validate(scope, $parse, attr, files, evt, function (files, rejFiles) {
              callback(files, rejFiles);
            });
          } else {
            if (delays++ * 10 < 20 * 1000) {
              waitForProcess(10);
            }
          }
        }, delay || 0);
      })();
    }
  }

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
  }

})();
