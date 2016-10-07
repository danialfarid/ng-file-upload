Package.describe({
  name: "danialf:ng2-file-upload",
  "version": "0.0.1",
  summary: "Lightweight Angular 2 directive to upload files with optional FileAPI shim for cross browser support",
  git: "https://github.com/danialfarid/ng2-file-upload.git"
});

Package.onUse(function (api) {
  api.use('angular2:angular2@2.0.1', 'client');
  api.addFiles('ng2-file-upload-all.js', 'client');
});

