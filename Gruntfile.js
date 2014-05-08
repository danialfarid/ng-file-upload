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
					src : '<%= pkg.name %>*.js',
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
		uglify : {
			options : {
				banner : '/*! <%= pkg.version %> */\n'
			},
			build : {
				files : [ {
					'dist/<%= pkg.name %>.min.js' : 'dist/<%= pkg.name %>.js',
					'dist/<%= pkg.name %>-shim.min.js' : 'dist/<%= pkg.name %>-shim.js',
					'dist/<%= pkg.name %>-html5-shim.min.js' : 'dist/<%= pkg.name %>-html5-shim.js'
				} ]
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', [ 'copy:build', 'uglify', 'copy:fileapi', 'copy:bower' ]);

};
