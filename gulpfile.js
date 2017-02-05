process.env.DISABLE_NOTIFIER = true;

var elixir = require('laravel-elixir');

require("laravel-elixir-webpack-official");
require('laravel-elixir-vue');

elixir.config.sourcemaps = true;

var
    // Source assets root path
    assetsPath = 'resources/assets/',
    // Compiled & published assets root path
    assetsPublicPath = 'public/',
    // Libs root path
    bowerPath = './vendor/bower_components/';

/**
 * Run elixir!
 */
elixir(function(mix) {

    // Copy all static files to public static directory
    mix.copy(
        [
            assetsPath + 'static/**'
        ],
        assetsPublicPath + 'static'
    );

    // Pack CSS to app.css
    mix.styles(
        [
            bowerPath + 'bootstrap/dist/css/bootstrap.css',
            bowerPath + 'font-awesome/css/font-awesome.css'
        ],
        assetsPublicPath + 'css/app.css'
    );

    // Pack custom CSS to lib.css
    mix.styles(
        [
            assetsPath + 'css/**'
        ],
        assetsPublicPath + 'css/lib.css'
    );

    // Copy all fonts to public fonts directory
    mix.copy(
        [
            // Twitter Bootstrap
            bowerPath + 'bootstrap/dist/fonts/**',
            // Font awesome
            bowerPath + 'font-awesome/fonts/**'
        ],
        assetsPublicPath + 'fonts'
    );

    // Pack specified libs to lib.js
    mix.scripts(
        [
            bowerPath + 'jquery/dist/jquery.js',
            bowerPath + 'bootstrap/dist/js/bootstrap.js',
            // Vue.js
            bowerPath + 'vue/dist/vue.js'
        ],
        assetsPublicPath + 'js/lib.js'
    );

    // Pack all js files to ES6 app.js
    mix.webpack(
        [
            assetsPath + 'js/**/**/*.js',
            assetsPath + 'js/**/**/*.vue'
        ],
        assetsPublicPath + 'js/app.js'
    );
});