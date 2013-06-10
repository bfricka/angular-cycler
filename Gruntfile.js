module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-copy");

  var jsGlobals = Object.keys(grunt.file.readJSON('./.jshintrc').globals);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

    , meta: {
      banner: [
          '/** <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.homepage %>'
        , '  * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>. All rights reserved.'
        , '  * Licensed <%= _.pluck(pkg.licenses, "type")[0] %> - <%= _.pluck(pkg.licenses, "url")[0] %>'
        , '  */'
        , ''
      ].join('\n')
    }

    , paths: {
        js        : './dist/js'
      , lib       : './lib'
      , css       : './dist/css'
      , less      : './styles'
      , templates : './templates'
    }

    , copy: {
      app: {
        files: [
            { expand: false, src: ['<%= paths.lib %>/cycler.js'], dest: '<%= paths.js %>/cycler.js' }
          , { expand: false, src: ['<%= paths.less %>/app/cycler.less'], dest: '<%= paths.css %>/less/cycler.less' }
        ]
      }
    }

    , watch: {
      js: {
          files: [ '<%= paths.lib %>/**/*.js' ]
        , tasks: [ 'jshint' ]
      }
      , less: {
          files: [ '<%= paths.less %>/**/*.less' ]
        , tasks: [ 'less:development' ]
      }
    }

    , jshint: {
      options: {
        jshintrc: './.jshintrc'
      }
      , all: [ '<%= paths.lib %>/**/*.js' ]
    }

    , uglify: {
      app: {
        options: {
          report: 'gzip'
          , compress: {
              loops        : true
            , unused       : true
            , unsafe       : true
            , cascade      : true
            , warnings     : true
            , booleans     : true
            , evaluate     : true
            , dead_code    : true
            , join_vars    : true
            , if_return    : true
            , sequences    : true
            , hoist_vars   : false
            , hoist_funs   : true
            , properties   : true
            , comparisons  : true
            , conditionals : true
          }
          , mangle: { except: jsGlobals }
        }
        , files: {
          "<%= paths.js %>/cycler.min.js": ["<%= paths.js %>/cycler.js", "<banner:meta.banner>"]
        }
      }
    }

    , less: {
      development: {
        options: {
            compress: false
          , yuicompress: false
          , dumpLineNumbers: true
        }
        , files: { '<%= paths.css %>/style.css' : '<%= paths.less %>/style.less' }
      }

      , production: {
        options: {
            compress: false
          , yuicompress: true
          , dumpLineNumbers: false
        }
        , files: { '<%= paths.css %>/style.css' : '<%= paths.less %>/style.less' }
      }
    }
  });

  grunt.registerTask('default', [ 'copy', 'jshint', 'uglify', 'less:production' ]);
};