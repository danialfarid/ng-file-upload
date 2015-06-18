'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      all: {
        options: {
          process: function (content) {
            return grunt.template.process(content);
          }
        },
        files: {
          'dist/ng-file-upload.js': ['src/upload.js', 'src/select.js', 'src/drop.js'],
          'dist/ng-file-upload-shim.js': ['src/shim-upload.js', 'src/shim-elem.js', 'src/shim-filereader.js'],
          'dist/ng-file-upload-all.js': ['dist/ng-file-upload-shim.js', 'dist/ng-file-upload.js']
        }
      }
    },
    uglify: {
      options: {
        preserveComments: 'some',
        banner: '/*! <%= pkg.version %> */\n'
      },

      build: {
        files: [{
          'dist/ng-file-upload.min.js': 'dist/ng-file-upload.js',
          'dist/ng-file-upload-shim.min.js': 'dist/ng-file-upload-shim.js',
          'dist/ng-file-upload-all.min.js': 'dist/ng-file-upload-all.js',
          'dist/FileAPI.min.js': 'dist/FileAPI.js'
        }]
      }
    },
    copy: {
      build: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '*',
          dest: 'demo/src/main/webapp/js/',
          flatten: true,
          filter: 'isFile'
        }]
      },
      fileapi: {
        files: {
          'dist/FileAPI.flash.swf': 'src/FileAPI.flash.swf',
          'dist/FileAPI.js': 'src/FileAPI.js'
        }
      },
      bower: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '*',
          dest: '../angular-file-upload-bower/',
          flatten: true,
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'dist/',
          src: '*',
          dest: '../angular-file-upload-shim-bower/',
          flatten: true,
          filter: 'isFile'
        }]
      }
    },
    serve: {
      options: {
        port: 9000
      },
      'path': 'demo/src/main/webapp'
    },
    watch: {
      js: {
        files: ['src/{,*/}*.js'],
        tasks: ['jshint:all', 'concat:all', 'uglify', 'copy:build']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'src/{,*/}*.js',
        '!src/FileAPI*.*',
        'test/spec/{,*/}*.js'
      ]
    },
    replace: {
      version: {
        src: ['nuget/Package.nuspec', '../angular-file-upload-bower/bower.json',
          '../angular-file-upload-shim-bower/bower.json'
        ],
        overwrite: true,
        replacements: [{
          from: /"version" *: *".*"/g,
          to: '"version": "<%= pkg.version %>"'
        }, {
          from: /<version>.*<\/version>/g,
          to: '<version><%= pkg.version %></version>'
        }]
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'dist',
            '!dist/.git*'
          ]
        }]
      }
    }
  });

  grunt.registerTask('dev', ['jshint:all', 'concat:all', 'uglify', 'copy:build', 'watch']);
  grunt.registerTask('default', ['jshint:all', 'clean:dist', 'concat:all',
    'copy:fileapi', 'uglify', 'copy:build', 'copy:bower', 'replace:version']);

};
