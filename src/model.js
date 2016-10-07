"use strict";
var Model = (function () {
    function Model() {
    }
    return Model;
}());
exports.Model = Model;
//
//   public static applyExifRotations(files, ngfFixOrientation) {
//     var promises = [Model.emptyPromise()];
//       for (var i = 0; i < files.length; i++) {
//           var f = files[i];
//       if (f.type.indexOf('image/jpeg') === 0)) {
//         promises.push(upload.happyPromise(upload.applyExifRotation(f), f).then(function (fixedFile) {
//           files.splice(i, 1, fixedFile);
//         }));
//       }
//     });
//     return $q.all(promises);
//   }
//
//   function resize(files, attr, scope) {
//     var resizeVal = upload.attrGetter('ngfResize', attr, scope);
//     if (!resizeVal || !upload.isResizeSupported() || !files.length) return upload.emptyPromise();
//     if (resizeVal instanceof Function) {
//       var defer = $q.defer();
//       resizeVal(files).then(function (p) {
//         resizeWithParams(p, files, attr, scope).then(function (r) {
//           defer.resolve(r);
//         }, function (e) {
//           defer.reject(e);
//         });
//       }, function (e) {
//         defer.reject(e);
//       });
//     } else {
//       return resizeWithParams(resizeVal, files, attr, scope);
//     }
//   }
//
//   function resizeWithParams(param, files, attr, scope) {
//     var promises = [upload.emptyPromise()];
//
//     function handleFile(f, i) {
//       if (f.type.indexOf('image') === 0) {
//         if (param.pattern && !upload.validatePattern(f, param.pattern)) return;
//         var promise = upload.resize(f, param.width, param.height, param.quality,
//           param.type, param.ratio, param.centerCrop, function (width, height) {
//             return upload.attrGetter('ngfResizeIf', attr, scope,
//               {$width: width, $height: height, $file: f});
//           }, param.restoreExif !== false);
//         promises.push(promise);
//         promise.then(function (resizedFile) {
//           files.splice(i, 1, resizedFile);
//         }, function (e) {
//           f.$error = 'resize';
//           f.$errorParam = (e ? (e.message ? e.message : e) + ': ' : '') + (f && f.name);
//         });
//       }
//     }
//
//     for (var i = 0; i < files.length; i++) {
//       handleFile(files[i], i);
//     }
//     return $q.all(promises);
//   }
//
//   upload.updateModel = function (ngModel, attr, scope, fileChange, files, evt, noDelay) {
//     function update(files, invalidFiles, newFiles, dupFiles, isSingleModel) {
//       attr.$$ngfPrevValidFiles = files;
//       attr.$$ngfPrevInvalidFiles = invalidFiles;
//       var file = files && files.length ? files[0] : null;
//       var invalidFile = invalidFiles && invalidFiles.length ? invalidFiles[0] : null;
//
//       if (ngModel) {
//         upload.applyModelValidation(ngModel, files);
//         ngModel.$setViewValue(isSingleModel ? file : files);
//       }
//
//       if (fileChange) {
//         $parse(fileChange)(scope, {
//           $files: files,
//           $file: file,
//           $newFiles: newFiles,
//           $duplicateFiles: dupFiles,
//           $invalidFiles: invalidFiles,
//           $invalidFile: invalidFile,
//           $event: evt
//         });
//       }
//
//       var invalidModel = upload.attrGetter('ngfModelInvalid', attr);
//       if (invalidModel) {
//         $timeout(function () {
//           $parse(invalidModel).assign(scope, isSingleModel ? invalidFile : invalidFiles);
//         });
//       }
//       $timeout(function () {
//         // scope apply changes
//       });
//     }
//
//     var allNewFiles, dupFiles = [], prevValidFiles, prevInvalidFiles,
//       invalids = [], valids = [];
//
//     function removeDuplicates() {
//       function equals(f1, f2) {
//         return f1.name === f2.name && (f1.$ngfOrigSize || f1.size) === (f2.$ngfOrigSize || f2.size) &&
//           f1.type === f2.type;
//       }
//
//       function isInPrevFiles(f) {
//         var j;
//         for (j = 0; j < prevValidFiles.length; j++) {
//           if (equals(f, prevValidFiles[j])) {
//             return true;
//           }
//         }
//         for (j = 0; j < prevInvalidFiles.length; j++) {
//           if (equals(f, prevInvalidFiles[j])) {
//             return true;
//           }
//         }
//         return false;
//       }
//
//       if (files) {
//         allNewFiles = [];
//         dupFiles = [];
//         for (var i = 0; i < files.length; i++) {
//           if (isInPrevFiles(files[i])) {
//             dupFiles.push(files[i]);
//           } else {
//             allNewFiles.push(files[i]);
//           }
//         }
//       }
//     }
//
//     function toArray(v) {
//       return angular.isArray(v) ? v : [v];
//     }
//
//     function separateInvalids() {
//       valids = [];
//       invalids = [];
//       angular.forEach(allNewFiles, function (file) {
//         if (file.$error) {
//           invalids.push(file);
//         } else {
//           valids.push(file);
//         }
//       });
//     }
//
//     function resizeAndUpdate() {
//       function updateModel() {
//         $timeout(function () {
//           update(keep ? prevValidFiles.concat(valids) : valids,
//             keep ? prevInvalidFiles.concat(invalids) : invalids,
//             files, dupFiles, isSingleModel);
//         }, options && options.debounce ? options.debounce.change || options.debounce : 0);
//       }
//
//       resize(validateAfterResize ? allNewFiles : valids, attr, scope).then(function () {
//         if (validateAfterResize) {
//           upload.validate(allNewFiles, prevValidFiles.length, ngModel, attr, scope).then(function () {
//             separateInvalids();
//             updateModel();
//           });
//         } else {
//           updateModel();
//         }
//       }, function (e) {
//         throw 'Could not resize files ' + e;
//       });
//     }
//
//     prevValidFiles = attr.$$ngfPrevValidFiles || [];
//     prevInvalidFiles = attr.$$ngfPrevInvalidFiles || [];
//     if (ngModel && ngModel.$modelValue) {
//       prevValidFiles = toArray(ngModel.$modelValue);
//     }
//
//     var keep = upload.attrGetter('ngfKeep', attr, scope);
//     allNewFiles = (files || []).slice(0);
//     if (keep === 'distinct' || upload.attrGetter('ngfKeepDistinct', attr, scope) === true) {
//       removeDuplicates(attr, scope);
//     }
//
//     var isSingleModel = !keep && !upload.attrGetter('ngfMultiple', attr, scope) && !upload.attrGetter('multiple', attr);
//
//     if (keep && !allNewFiles.length) return;
//
//     upload.attrGetter('ngfBeforeModelChange', attr, scope, {
//       $files: files,
//       $file: files && files.length ? files[0] : null,
//       $newFiles: allNewFiles,
//       $duplicateFiles: dupFiles,
//       $event: evt
//     });
//
//     var validateAfterResize = upload.attrGetter('ngfValidateAfterResize', attr, scope);
//
//     var options = upload.attrGetter('ngModelOptions', attr, scope);
//     upload.validate(allNewFiles, prevValidFiles.length, ngModel, attr, scope).then(function () {
//       if (noDelay) {
//         update(allNewFiles, [], files, dupFiles, isSingleModel);
//       } else {
//         if ((!options || !options.allowInvalid) && !validateAfterResize) {
//           separateInvalids();
//         } else {
//           valids = allNewFiles;
//         }
//         if (upload.attrGetter('ngfFixOrientation', attr, scope) && upload.isExifSupported()) {
//           applyExifRotations(valids, attr, scope).then(function () {
//             resizeAndUpdate();
//           });
//         } else {
//           resizeAndUpdate();
//         }
//       }
//     });
//   };
//
//   return upload;
// }]);
//# sourceMappingURL=model.js.map