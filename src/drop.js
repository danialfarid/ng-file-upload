(function () {
  var validate = ngFileUpload.validate;
  var updateModel = ngFileUpload.updateModel;

  ngFileUpload.directive('ngfDrop', ['$parse', '$timeout', '$location', function ($parse, $timeout, $location) {
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
        var fn = $parse(attr.ngfDropAvailable);
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
    if (attr.dropAvailable) {
      $timeout(function () {
        if (scope[attr.dropAvailable]) {
          scope[attr.dropAvailable].value = available;
        } else {
          scope[attr.dropAvailable] = available;
        }
      });
    }
    if (!available) {
      if ($parse(attr.ngfHideOnDropNotAvailable)(scope) === true) {
        elem.css('display', 'none');
      }
      return;
    }

    var disabled = false;
    if (attr.ngfDrop.search(/\W+$files\W+/) === -1) {
      scope.$watch(attr.ngfDrop, function(val) {
        disabled = val === false;
      });
    }

    var leaveTimeout = null;
    var stopPropagation = $parse(attr.ngfStopPropagation);
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
      if (!scope.actualDragOverClass) {
        actualDragOverClass = calculateDragOverClass(scope, attr, evt);
      }
      elem.addClass(actualDragOverClass);
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
        updateModel($parse, $timeout, scope, ngModel, attr,
          attr.ngfChange || attr.ngfDrop, files, rejFiles, evt);
      }, $parse(attr.ngfAllowDir)(scope) !== false, attr.multiple || $parse(attr.ngfMultiple)(scope));
    }, false);

    function calculateDragOverClass(scope, attr, evt) {
      var accepted = true;
      var items = evt.dataTransfer.items;
      if (items != null) {
        for (var i = 0; i < items.length && accepted; i++) {
          accepted = accepted &&
            (items[i].kind === 'file' || items[i].kind === '') &&
            validate(scope, $parse, attr, items[i], evt);
        }
      }
      var clazz = $parse(attr.ngfDragOverClass)(scope, {$event: evt});
      if (clazz) {
        if (clazz.delay) dragOverDelay = clazz.delay;
        if (clazz.accept) clazz = accepted ? clazz.accept : clazz.reject;
      }
      return clazz || attr.ngfDragOverClass || 'dragover';
    }

    function extractFiles(evt, callback, allowDir, multiple) {
      var files = [], rejFiles = [], items = evt.dataTransfer.items, processing = 0;

      function addFile(file) {
        if (validate(scope, $parse, attr, file, evt)) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }

      function traverseFileTree(files, entry, path) {
        if (entry != null) {
          if (entry.isDirectory) {
            var filePath = (path || '') + entry.name;
            addFile({name: entry.name, type: 'directory', path: filePath});
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
                addFile(file);
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
            if (f != null) addFile(f);
          }
          if (!multiple && files.length > 0) break;
        }
      } else {
        var fileList = evt.dataTransfer.files;
        if (fileList != null) {
          for (var j = 0; j < fileList.length; j++) {
            addFile(fileList.item(j));
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
            callback(files, rejFiles);
          } else {
            if (delays++ * 10 < 20 * 1000) {
              waitForProcess(10);
            }
          }
        }, delay || 0);
      })();
    }
  }

  ngFileUpload.directive('ngfSrc', ['$parse', '$timeout', function ($parse, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        if (window.FileReader) {
          scope.$watch(attr.ngfSrc, function (file) {
            if (file &&
              validate(scope, $parse, attr, file, null) &&
              (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
              (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)) {
              $timeout(function () {
                //prefer URL.createObjectURL for handling refrences to files of all sizes
                //since it doesn´t build a large string in memory
                var URL = window.URL || window.webkitURL;
                if (URL && URL.createObjectURL) {
                  elem.attr('src', URL.createObjectURL(file));
                } else {
                  var fileReader = new FileReader();
                  fileReader.readAsDataURL(file);
                  fileReader.onload = function (e) {
                    $timeout(function () {
                      elem.attr('src', e.target.result);
                    });
                  };
                }
              });
            } else {
              elem.attr('src', attr.ngfDefaultSrc || '');
            }
          });
        }
      }
    };
  }]);

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
  }

})();
