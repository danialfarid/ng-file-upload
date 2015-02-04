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
					src : 'angular-file-upload*.js',
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
					src : 'FileAPI.min.js',
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
					'demo/war/js/angular-file-upload-all.js': 
						['demo/war/js/angular-file-upload.js', 
						'demo/war/js/angular-file-upload-shim.js']
				}
			}
		},
		uglify : {
			options : {
				banner : '/*! <%= pkg.version %> */\n'
			},
			build : {
				files : [ {
					'dist/angular-file-upload.min.js' : 'dist/angular-file-upload.js',
					'dist/angular-file-upload-shim.min.js' : 'dist/angular-file-upload-shim.js',
					'dist/angular-file-upload-all.min.js' : 'dist/angular-file-upload-all.js'
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

	grunt.registerTask('default', [ 'concat:dist', 'copy:build', 'uglify', 'copy:fileapi', 'copy:bower', 'replace:version' ]);

};
