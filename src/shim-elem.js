(function () {
  /** @namespace FileAPI.forceLoad */
  /** @namespace window.FileAPI.jsUrl */
  /** @namespace window.FileAPI.jsPath */

  function isInputTypeFile(elem) {
    return elem[0].tagName.toLowerCase() === 'input' && elem.attr('type') && elem.attr('type').toLowerCase() === 'file';
  }

  function hasFlash() {
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) return true;
    } catch (e) {
      if (navigator.mimeTypes['application/x-shockwave-flash'] !== undefined) return true;
    }
    return false;
  }

  function getOffset(obj) {
    var left = 0, top = 0;

    if (window.jQuery) {
      return jQuery(obj).offset();
    }

    if (obj.offsetParent) {
      do {
        left += (obj.offsetLeft - obj.scrollLeft);
        top += (obj.offsetTop - obj.scrollTop);
        obj = obj.offsetParent;
      } while (obj);
    }
    return {
      left: left,
      top: top
    };
  }

  if (FileAPI.shouldLoad) {

    //load FileAPI
    if (FileAPI.forceLoad) {
      FileAPI.html5 = false;
    }

    if (!FileAPI.upload) {
      var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
      if (window.FileAPI.jsUrl) {
        jsUrl = window.FileAPI.jsUrl;
      } else if (window.FileAPI.jsPath) {
        basePath = window.FileAPI.jsPath;
      } else {
        for (i = 0; i < allScripts.length; i++) {
          src = allScripts[i].src;
          index = src.search(/\/ng\-file\-upload[\-a-zA-z0-9\.]*\.js/);
          if (index > -1) {
            basePath = src.substring(0, index + 1);
            break;
          }
        }
      }

      if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
      script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
      document.getElementsByTagName('head')[0].appendChild(script);

      FileAPI.hasFlash = hasFlash();
    }

    FileAPI.ngfFixIE = function (elem, createFileElemFn, bindAttr, changeFn) {
      if (!hasFlash()) {
        throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
      }
      var makeFlashInput = function () {
        if (elem.attr('disabled')) {
          elem.$$ngfRefElem.removeClass('js-fileapi-wrapper');
        } else {
          var fileElem = elem.$$ngfRefElem;
          if (!fileElem) {
            fileElem = elem.$$ngfRefElem = createFileElemFn();
            fileElem.addClass('js-fileapi-wrapper');
            if (!isInputTypeFile(elem)) {
//						if (fileElem.parent().css('position') === '' || fileElem.parent().css('position') === 'static') {
//							fileElem.parent().css('position', 'relative');
//						}
//						elem.parent()[0].insertBefore(fileElem[0], elem[0]);
//						elem.css('overflow', 'hidden');
            }
            setTimeout(function () {
              fileElem.bind('mouseenter', makeFlashInput);
            }, 10);
            fileElem.bind('change', function (evt) {
              fileApiChangeFn.apply(this, [evt]);
              changeFn.apply(this, [evt]);
//						alert('change' +  evt);
            });
          } else {
            bindAttr(elem.$$ngfRefElem);
          }
          if (!isInputTypeFile(elem)) {
            fileElem.css('position', 'absolute')
              .css('top', getOffset(elem[0]).top + 'px').css('left', getOffset(elem[0]).left + 'px')
              .css('width', elem[0].offsetWidth + 'px').css('height', elem[0].offsetHeight + 'px')
              .css('filter', 'alpha(opacity=0)').css('display', elem.css('display'))
              .css('overflow', 'hidden').css('z-index', '900000')
              .css('visibility', 'visible');
          }
        }
      };

      elem.bind('mouseenter', makeFlashInput);

      var fileApiChangeFn = function (evt) {
        var files = FileAPI.getFiles(evt);
        //just a double check for #233
        for (var i = 0; i < files.length; i++) {
          if (files[i].size === undefined) files[i].size = 0;
          if (files[i].name === undefined) files[i].name = 'file';
          if (files[i].type === undefined) files[i].type = 'undefined';
        }
        if (!evt.target) {
          evt.target = {};
        }
        evt.target.files = files;
        // if evt.target.files is not writable use helper field
        if (evt.target.files !== files) {
          evt.__files_ = files;
        }
        (evt.__files_ || evt.target.files).item = function (i) {
          return (evt.__files_ || evt.target.files)[i] || null;
        };
      };
    };

    FileAPI.disableFileInput = function (elem, disable) {
      if (disable) {
        elem.removeClass('js-fileapi-wrapper');
      } else {
        elem.addClass('js-fileapi-wrapper');
      }
    };
  }
})();
