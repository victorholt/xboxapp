// Grunt project setup.
module.exports = function(grunt) {
  grunt.initConfig({
    // Sass configuration
    // ---
    sass: {
      dist: {
        files: {
          './../public/css/styles.css': './site/sass/base.scss'
        }
      }
    },

    // Concat configuration
    // ---
    concat: {
      // Concat our main application.
      app: {
        src: ['./site/core/*.js', './site/build-files/*.js', './site/app.js',
              '!./site/core/serviceWorker.js'],
        dest: './../public/js/xbox-app.js'
      },

      workers: {
        src: ['./site/core/utils.js', './site/core/serviceWorker.js'],
        dest: './../public/js/serviceWorker.js'
      }
    },

    // Uglify configuration
    // ---
    uglify: {
      scripts: {
        files: {
          './../public/js/xbox-app.min.js': './../public/js/xbox-app.js',
        }
      },

      workers: {
        files: {
          './../public/js/serviceWorker.min.js': './../public/js/serviceWorker.js'
        }
      }
    },

    // ReactJS configuration
    // ---
    react: {
      all: {
        files: [{
          './site/build-files/xbox-app.js': [
            './site/components/*.jsx',
            './site/templates/*.jsx'
          ],
          ext: '.js'
        }]
      }
    },

    // Watch files configuration
    // ---
    watch: {
      // Javascript files.
      scripts: {
        files: ['./site/**/*.jsx', './site/**/*.js'],
        tasks: ['react', 'concat', 'uglify'],
        options: {
          spawn: false,
          interrupt: true
        },
      },

      // CSS files.
      css: {
        files: ['./site/sass/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
          interrupt: true
        },
      }
    },
  });

  // Load up the grunt tasks.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');

  // Setup the builds.
  grunt.registerTask('build-watch', ['sass', 'react', 'concat', 'uglify', 'watch']);
  grunt.registerTask('default', ['sass', 'react', 'concat', 'uglify']);
}
