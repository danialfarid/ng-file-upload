(function () {

  ngFileUpload.directive('ngfSelect', ['$parse', '$timeout', '$compile', 'Upload',
    function ($parse, $timeout, $compile, Upload) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
          linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile, Upload);
        }
      };
    }]);

  function linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile, upload) {
    /** @namespace attr.ngfSelect */
    /** @namespace attr.ngfChange */
    /** @namespace attr.ngModel */
    /** @namespace attr.ngModelRejected */
    /** @namespace attr.ngfModel */
    /** @namespace attr.ngfMultiple */
    /** @namespace attr.ngfCapture */
    /** @namespace attr.ngfAccept */
    /** @namespace attr.ngfValidate */
    /** @namespace attr.ngfDuration*/
    /** @namespace attr.ngfWidth*/
    /** @namespace attr.ngfHeight*/
    /** @namespace attr.ngfResetOnClick */
    /** @namespace attr.ngfResetModelOnClick */
    /** @namespace attr.ngfKeep */
    /** @namespace attr.ngfKeepDistinct */
    upload.registerValidators(ngModel, attr, scope);

    if (elem.attr('__ngf_gen__')) {
      return;
    }

    var attrGetter = function (name, scope) {
      return upload.attrGetter(name, attr, scope);
    };

    scope.$on('$destroy', function () {
      if (elem.$$ngfRefElem) elem.$$ngfRefElem.remove();
    });

    var disabled = false;

    attr.$observe('ngfSelect', function (value) {
      if (value === false) elem.attr('disabled', 'disabled');
      else if (value === true) elem.removeAttr('disabled');
    });

    function isInputTypeFile() {
      return elem[0].tagName.toLowerCase() === 'input' && attr.type && attr.type.toLowerCase() === 'file';
    }

    function fileChangeAttr() {
      return attrGetter('ngfChange') || attrGetter('ngfSelect');
    }

    function changeFn(evt) {
      var files = evt.__files_ || (evt.target && evt.target.files);
      elem.attr('__ngf_has_val_', true);
      //uploadService.validate(scope, $parse, attr, fileList, evt, function(files, rejFiles) {
      upload.updateModel(ngModel,  attr, scope, fileChangeAttr(), files, evt);
      if (files.length === 0) evt.target.value = files;
//                if (evt.target && evt.target.getAttribute('__ngf_gen__')) {
//                    angular.element(evt.target).remove();
//                }
//      });
    }

    function bindAttrToFileInput(fileElem) {
      if (attrGetter('ngfMultiple')) fileElem.attr('multiple', $parse(attrGetter('ngfMultiple'))(scope));
      if (attrGetter('ngfCapture')) fileElem.attr('capture', $parse(attrGetter('ngfCapture'))(scope));
      if (attrGetter('accept')) fileElem.attr('accept', attrGetter('accept'));
      for (var i = 0; i < elem[0].attributes.length; i++) {
        var attribute = elem[0].attributes[i];
        if ((isInputTypeFile() && attribute.name !== 'type') ||
          (attribute.name !== 'type' && attribute.name !== 'class' &&
          attribute.name !== 'id' && attribute.name !== 'style')) {
          if (attribute.value == null || attribute.value === '') {
            if (attribute.name === 'required') attribute.value = 'required';
            if (attribute.name === 'multiple') attribute.value = 'multiple';
          }
          fileElem.attr(attribute.name, attribute.value);
        }
      }
    }

    function createFileInput(evt, resetOnClick) {
      if (!resetOnClick && (evt || isInputTypeFile())) return elem.$$ngfRefElem || elem;
      if (elem.$$ngfProgramClick) return elem;

      var fileElem = angular.element('<input type="file">');
      bindAttrToFileInput(fileElem);

      if (isInputTypeFile()) {
        elem.replaceWith(fileElem);
        elem = fileElem;
        fileElem.attr('__ngf_gen__', true);
        $compile(elem)(scope);
      } else {
        fileElem.css('visibility', 'hidden').css('position', 'absolute').css('overflow', 'hidden')
          .css('width', '0px').css('height', '0px').css('border', 'none')
          .css('margin', '0px').css('padding', '0px').attr('tabindex', '-1');
        if (elem.$$ngfRefElem) {
          elem.$$ngfRefElem.remove();
        }
        elem.$$ngfRefElem = fileElem;
        document.body.appendChild(fileElem[0]);
      }

      return fileElem;
    }

    function resetModel(evt) {
      if (elem.attr('__ngf_has_val_')) {
        upload.updateModel(ngModel,  attr, scope, fileChangeAttr(), [], evt, true);
        elem.removeAttr('__ngf_has_val_');
      }
    }

    var initialTouchStartY = 0;

    function clickHandler(evt) {
      if (elem.attr('disabled') || disabled) return false;

      if (evt != null) {
        var touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
        if (evt.type === 'touchstart') {
          initialTouchStartY = touches ? touches[0].clientY : 0;
          return true; // don't block event default
        } else {
          evt.stopPropagation();
          evt.preventDefault();

          // prevent scroll from triggering event
          if (evt.type === 'touchend') {
            var currentLocation = touches ? touches[0].clientY : 0;
            if (Math.abs(currentLocation - initialTouchStartY) > 20) return false;
          }
        }
      }

      var resetOnClick = attrGetter('ngfResetOnClick', scope) !== false;
      var fileElem = createFileInput(evt, resetOnClick);

      function clickAndAssign(evt) {
        if (evt && !elem.$$ngfProgramClick) {
          elem.$$ngfProgramClick = true;
          fileElem[0].click();
          $timeout(function () {
            delete elem.$$ngfProgramClick;
          }, 500);
        }
        if ((isInputTypeFile() || !evt) && resetOnClick) {
          elem.bind('click touchstart touchend', clickHandler);
        }
      }

      if (fileElem) {
        if (!evt || resetOnClick) fileElem.bind('change', changeFn);
        if (evt && resetOnClick && attrGetter('ngfResetModelOnClick', scope) !== false) {
          resetModel(evt);
        }

        // fix for android native browser < 4.4
        if (shouldClickLater(navigator.userAgent)) {
          setTimeout(function () {
            clickAndAssign(evt);
          }, 0);
        } else {
          clickAndAssign(evt);
        }
      }

      return false;
    }

    if (window.FileAPI && window.FileAPI.ngfFixIE) {
      window.FileAPI.ngfFixIE(elem, createFileInput, bindAttrToFileInput, changeFn);
    } else {
      clickHandler();
      //if (!isInputTypeFile()) {
      //  elem.bind('click touchend', clickHandler);
      //}
    }

    function shouldClickLater(ua) {
      // android below 4.4
      var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
      if (m && m.length > 2) {
        var v = upload.defaults.androidFixMinorVersion || 4;
        return parseInt(m[1]) < 4 || (parseInt(m[1]) === v && parseInt(m[2]) < v);
      }

      // safari on windows
      return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*/.test(ua);
    }
  }


})();
