module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'), 

		copy : {
			build : {
				options : {
					processContent : function(content, srcpath) {
						return grunt.template.process(content);
					}
				},
				files : [ {
					expand : true,
					cwd : 'demo/war/js/',
					src : 'ng-file-upload*.js',
					dest : 'dist/',
					flatten : true,
					filter : 'isFile'
				}]
			},
			fileapi: {
				files: [{
					expand : true,
					cwd : 'demo/war/js/',
					src : 'FileAPI.flash.swf',
					dest : 'dist/',
					flatten : true,
					filter : 'isFile'
				}, {
					expand : true,
					cwd : 'demo/war/js/',
					src : 'FileAPI.js',
					dest : 'dist/',
					flatten : true,
					filter : 'isFile'
				} ]
			},
			bower : {
				files : [ {
					expand : true,
					cwd : 'dist/',
					src : '*',
					dest : '../angular-file-upload-bower/',
					flatten : true,
					filter : 'isFile'
				}, {
					expand : true,
					cwd : 'dist/',
					src : '*',
					dest : '../angular-file-upload-shim-bower/',
					flatten : true,
					filter : 'isFile'
				} ]
			}
		},
		concat: {
			dist: {
				options: {
					process: function(content, srcpath) {
						return grunt.template.process(content);
					}
				},
				files: {
					'demo/war/js/ng-file-upload-all.js': 
						['demo/war/js/ng-file-upload.js', 
						'demo/war/js/ng-file-upload-shim.js']
				}
			}
		},
		uglify : {
			options : {
				banner : '/*! <%= pkg.version %> */\n'
			},
			build : {
				files : [ {
					'dist/ng-file-upload.min.js' : 'dist/ng-file-upload.js',
					'dist/ng-file-upload-shim.min.js' : 'dist/ng-file-upload-shim.js',
					'dist/ng-file-upload-all.min.js' : 'dist/ng-file-upload-all.js',
					'dist/FileAPI.min.js' : 'dist/FileAPI.js',
					'demo/war/js/FileAPI.min.js' : 'demo/war/js/FileAPI.js'
				} ]
			}
		},
		replace : {
			version : {
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
		}	
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', [ 'concat:dist', 'copy:build', 'copy:fileapi', 'uglify', 'copy:bower', 'replace:version' ]);

};
