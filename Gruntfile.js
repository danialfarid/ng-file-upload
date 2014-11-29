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
		concat: {
			dist: {
				options: {
					process: function(content, srcpath) {
						return grunt.template.process(content);
					}
				},
				files: {
					'demo/war/js/<%= pkg.name %>-all.js': 
						['demo/war/js/<%= pkg.name %>.js', 
						'demo/war/js/<%= pkg.name %>-shim.js']
				}
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
					'dist/<%= pkg.name %>-all.min.js' : 'dist/<%= pkg.name %>-all.js'
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
