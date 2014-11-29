(function () {
    'use strict';

    angular
        .module('app')
        .controller('UploadCtrl', UploadCtrl);

    UploadCtrl.$inject = ['$location', '$upload'];

    function UploadCtrl($location, $upload) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'UploadCtrl';

        vm.onFileSelect = function ($files, user) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.upload = $upload.upload({
                    url: 'Uploads/UploadHandler.ashx',
                    data: { name: user.Name },
                    file: file, // or list of files ($files) for html5 only
                }).progress(function (evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    alert('Uploaded successfully ' + file.name);
                }).error(function (err) {
                    alert('Error occured during upload');
                });
            }
        };
       
    }
})();
