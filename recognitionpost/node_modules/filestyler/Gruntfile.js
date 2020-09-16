module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: "/**\n" +
            " * FileStyler Legacy\n" +
            " * @see https://github.com/paulzi/<%= pkg.name %>\n" +
            " * @license MIT (https://github.com/paulzi/<%= pkg.name %>/blob/master/LICENSE)\n" +
            " * @version <%= pkg.version %>\n" +
            " */\n"
        },
        sass: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/sass',
                    src: ['*.scss'],
                    dest: 'dist',
                    ext: '.css'
                }]
            }
        },
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 2 versions', 'IE >= 7', 'Safari >= 5.1', 'Opera >= 15', 'Android >= 4', 'iOS >= 5.1']
                    })
                ]
            },
            build: {
                src: 'dist/*.css'
            }
        },
        cssmin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist',
                    ext: '.min.css'
                }]
            }
        },
        concat: {
            banner: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src:  'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        eslint: {
            build: {
                src: ['src/js/**/*.js']
            }
        },
        jsBuild: {
            build: {
                src: 'src/js',
                dest: 'dist'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['*.js', '!*.min.js'],
                    dest: 'dist',
                    ext: '.min.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-js-build');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build:js', ['eslint:build', 'jsBuild:build', 'concat:banner']);
    grunt.registerTask('build:css', ['sass:build', 'postcss:build']);

    grunt.registerTask('default', ['build:css', 'cssmin:build', 'build:js', 'uglify:build']);
};