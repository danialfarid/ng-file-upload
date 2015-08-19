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
    var attrGetter = function (name, scope) {
      return upload.attrGetter(name, attr, scope);
    };

    upload.registerValidators(ngModel, attr, scope);

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
      var fileList = evt.__files_ || (evt.target && evt.target.files), files = [];
      for (var i = 0; i < fileList.length; i++) {
        files.push(fileList[i]);
      }
      upload.updateModel(ngModel, attr, scope, fileChangeAttr(), files.length ? files : null, evt);
      //if (files.length === 0) evt.target.value = files;
//                if (evt.target && evt.target.getAttribute('__ngf_gen__')) {
//                    angular.element(evt.target).remove();
//                }
    }

    function bindAttrToFileInput(fileElem) {
      if (attrGetter('ngfMultiple')) fileElem.attr('multiple', $parse(attrGetter('ngfMultiple'))(scope));
      if (attrGetter('ngfCapture')) fileElem.attr('capture', $parse(attrGetter('ngfCapture'))(scope));
      if (attrGetter('accept')) fileElem.attr('accept', attrGetter('accept'));
      if (elem !== fileElem) {
        for (var i = 0; i < elem[0].attributes.length; i++) {
          var attribute = elem[0].attributes[i];
          if (attribute.name !== 'type' && attribute.name !== 'class' &&
            attribute.name !== 'id' && attribute.name !== 'style') {
            if (attribute.value == null || attribute.value === '') {
              if (attribute.name === 'required') attribute.value = 'required';
              if (attribute.name === 'multiple') attribute.value = 'multiple';
            }
            fileElem.attr(attribute.name, attribute.value);
          }
        }
      }
    }

    function createFileInput() {
      if (isInputTypeFile()) {
        return elem;
      }

      var fileElem = angular.element('<input type="file">');
      bindAttrToFileInput(fileElem);

      fileElem.css('visibility', 'hidden').css('position', 'absolute').css('overflow', 'hidden')
        .css('width', '0px').css('height', '0px').css('border', 'none')
        .css('margin', '0px').css('padding', '0px').attr('tabindex', '-1');
      if (elem.$$ngfRefElem) {
        elem.$$ngfRefElem.remove();
      }
      elem.$$ngfRefElem = fileElem;
      document.body.appendChild(fileElem[0]);

      return fileElem;
    }

    var initialTouchStartY = 0;

    function clickHandler(evt) {
      if (elem.attr('disabled') || disabled) return false;

      var r = handleTouch(evt);
      if (r != null) return r;

      // fix for android native browser < 4.4
      if (shouldClickLater(navigator.userAgent)) {
        setTimeout(function () {
          fileElem[0].click();
        }, 0);
      } else {
        fileElem[0].click();
      }

      return false;
    }

    function handleTouch(evt) {
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

    var fileElem = elem;

    function resetModel(evt) {
      if (fileElem.val()) {
        fileElem.val(null);
        upload.updateModel(ngModel, attr, scope, fileChangeAttr(), null, evt, true);
      }
    }

    if (!isInputTypeFile()) {
      fileElem = createFileInput();
    }
    fileElem.bind('change', changeFn);

    if (!isInputTypeFile()) {
      elem.bind('click touchstart touchend', clickHandler);
    }

    if (navigator.userAgent.indexOf('Chrome') === -1) {
      elem.bind('click', function (e) {
        resetModel(e);
      });
    }

    function ie10SameFileSelectFix(evt) {
      if (fileElem && !fileElem.attr('__ngf_ie10_Fix_')) {
        if (!fileElem[0].parentNode) {
          fileElem = null;
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        fileElem.unbind('click');
        var clone = fileElem.clone();
        fileElem.replaceWith(clone);
        fileElem = clone;
        fileElem.attr('__ngf_ie10_Fix_', 'true');
        fileElem.bind('change', changeFn);
        fileElem.bind('click', ie10SameFileSelectFix);
        fileElem[0].click();
        return false;
      } else {
        fileElem.removeAttr('__ngf_ie10_Fix_');
      }
    }

    if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
      fileElem.bind('click', ie10SameFileSelectFix);
    }

    scope.$on('$destroy', function () {
      if (!isInputTypeFile()) fileElem.remove();
    });

    if (window.FileAPI && window.FileAPI.ngfFixIE) {
      window.FileAPI.ngfFixIE(elem, fileElem, changeFn);
    }
  }
})();
