var gulp = require('gulp');
var addsrc= require('gulp-add-src');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var lint = require('gulp-jshint');
var autoprefixer = require('gulp-autoprefixer');
var bowerFiles = require('main-bower-files');
var argv = require('yargs').argv
var runSequence = require('run-sequence');
var gulpInject = require('gulp-inject');
var rename = require('gulp-rename');
var gulpFilter = require('gulp-filter');
var angularFilesort = require('gulp-angular-filesort');
var zip = require('gulp-zip');
var sort = require('gulp-sort');
var babel = require('gulp-babel');
var merge = require('gulp-merge-json');
var insert = require('gulp-insert');

var releaseDir = "build/release";
var releaseOutDir = releaseDir+"/";
var debugDir = "build/debug";
var debugOutDir = debugDir+"/";

var srcPaths = {
    bowerFolder: 'bower_components',
    mainJs: 'src/js/init.js',
    controllersJs: 'src/js/controllers/**/*.js',
    directivesJs: 'src/js/directives/**/*.js',
    servicesJs: 'src/js/services/**/*.js',
    utilsJs: 'src/js/utils/**/*.js',
    translationsJs: 'src/res/translations/**/*.js',
    partials: 'src/res/partials/**/*.html',
    imgSvg: 'src/res/img/svg/**/*.svg',
    imgPng: 'src/res/img/png/**/*.png',
    pages: 'src/pages/*.html',
    styles: 'src/res/styles/**/*.css',
    manifest: 'src/manifest.json',
    backgroundJs: 'src/background.js',
    cfgFolder: 'cfg'
};

var outPaths = {
    appBower: "bower_components",
    appCryptoJs: 'cryptojs',
    appSrc: "",
    appJs: "js",
    appControllers: "js/controllers",
    appDirectives: "js/directives",
    appServices: "js/services",
    appUtils: "js/utils",
    appMain: "js/main",
    appStyles: "res/styles",
    appTranslations: "res/translations",
    appSvg: "res/img/svg",
    appPng: "res/img/png",
    appPartials: "res/partials",
    appTempPages: "temppages",
    appPages: "pages",
    appCfg: "cfg",
    appManifest: "",
    appBackground: ""
};

function getBuildDir() {
    if(argv.out !== undefined) {
        return argv.out
    }
    else if(argv.release !== undefined) {
        return releaseDir;
    }
    else {
        return debugDir;
    }
}

function getOutDir() {
    if(argv.out !== undefined) {
        return argv.out+"/"
    }
    else if(argv.release !== undefined) {
        return releaseOutDir;
    }
    else {
        return debugOutDir;
    }
}

function getCfgFilename() {
    if(argv.variant !== undefined) {
        return srcPaths.cfgFolder+"/"+argv.variant+"Cfg.json";
    } else {
        return null;
    }
}

function isRelease() {
    if(argv.release !== undefined)
        return true;
    else
        return false;
}

gulp.task('default',['build'],function() {

});

gulp.task('package',['build'],function() {
    var archiveName = "cataraqui-";
    if(isRelease()) {
        archiveName += "release.zip";
    }
    else {
        archiveName += "debug.zip";
    }

    return gulp.src(getOutDir()+"**")
    .pipe(zip(archiveName))
    .pipe(gulp.dest(getOutDir()));
});

gulp.task('watch',function() {
    gulp.watch([srcPaths.mainJs,
                srcPaths.controllersJs,
                srcPaths.directivesJs,
                srcPaths.servicesJs,
                srcPaths.utilsJs,
                srcPaths.partials,
                srcPaths.styles,
                srcPaths.manifest,
                srcPaths.backgroundJs,
                srcPaths.pages,
                srcPaths.bowerFolder+"/**/*.js",
                srcPaths.bowerFolder+"/**/*.css"],
               ["build"]);
});

gulp.task('watchlint',function() {
    gulp.watch([srcPaths.mainJs,
                srcPaths.controllersJs,
                srcPaths.directivesJs,
                srcPaths.servicesJs,
                srcPaths.backgroundJs,
                srcPaths.utilsJs],
               ["lint"]);
});

gulp.task('lint',function() {
    return gulp.src('src/**/*.js')
    .pipe(lint({esversion: 6}))
    .pipe(lint.reporter("default"))
    .pipe(lint.reporter("fail"));
});

gulp.task('build', function(callback) {
    runSequence(['lint','clean'],
                'compile',
                'link',
                callback);
});

gulp.task('clean',function() {
    return del([getBuildDir()]);
});

gulp.task("link",function(callback) {
    runSequence('copy-pages','link-pages','remove-tmp-pages',callback);
});

gulp.task("copy-pages",function() {
    return gulp.src(srcPaths.pages)
    .pipe(gulp.dest(getOutDir()+outPaths.appTempPages));
});

gulp.task("remove-tmp-pages",function() {
    return del([getOutDir()+outPaths.appTmpPages]);
});

gulp.task('link-pages',function() {
    var opath = getOutDir();
    var linkedOutput = getOutDir()+outPaths.appPages;
    var linkingTargets = getOutDir()+outPaths.appTempPages+"/*.html";

    var controllerDir = opath+outPaths.appControllers+"/**/*.js";
    var directiveDir = opath+outPaths.appDirectives+"/**/*.js";
    var utilsDir = opath+outPaths.appUtils+"/**/*.js";
    var mainDir = opath+outPaths.appMain+"/**/*.js";
    var cssDir = opath+outPaths.appStyles+"/**/*.css";
    var translationDir = opath+outPaths.appTranslations+"/**/*.js";
    var serviceDir = opath+outPaths.appServices+"/**/*.js";
    var cfgDir = opath+outPaths.appCfg+"/**/*.js";
    
    return gulp.src(linkingTargets)
    .pipe(
            gulpInject(
                gulp.src(cfgDir,{read:false}),{"name":"cfg","relative":true}))
    .pipe(
        gulpInject(
            gulp.src(directiveDir,{read:false}),{"name":"directives","relative":true}))
    .pipe(
        gulpInject(
            gulp.src(controllerDir,{read:false})
                .pipe(sort({
                    comparator: function(f1, f2) {
                        if(f1.path.indexOf('MainController') > -1) {
                            return 1;
                        }
                        else if (f2.path.indexOf('MainController') > -1) {
                            return -1;
                        }
                        else {
                            return f1.path.localeCompare(f2.path);
                        }
                    }
                })),{"name":"controllers","relative":true}))
    .pipe(
        gulpInject(
            gulp.src(utilsDir,{read:false}),{"name":"utils","relative":true}))
    .pipe(
        gulpInject(
            gulp.src(mainDir,{read:false}),{"name":"main","relative":true}))
    .pipe(
        gulpInject(
            gulp.src(cssDir,{read:false}),{"relative":true}))
    .pipe(
        gulpInject(
            gulp.src(translationDir,{read:false}),{"name":"translations","relative":true}))
    .pipe(
        gulpInject(
            gulp.src(serviceDir,{read:false}),{"name":"services","relative":true}))
    .pipe(gulpInject(
        gulp.src(
            bowerFiles({
                paths: opath
            }),{"read":false}),
        {"name":"bower",
         "relative": true}))
    .pipe(gulp.dest(linkedOutput));
});


gulp.task('compile',['compile-cfg','compile-js','compile-html','compile-css','compile-img','compile-bower','compile-translations','compile-manifest']);

gulp.task('compile-js',['compile-controllers','compile-services','compile-utils','compile-mainjs','compile-background','compile-directives']);
gulp.task('compile-html',['compile-partials','compile-pages']);
gulp.task('compile-css',['compile-styles']);
gulp.task('compile-img',['compile-svg', 'compile-png']);

gulp.task('compile-cfg',function() {
    var cfg = getCfgFilename();
    var linkedOutput = getOutDir()+outPaths.appPages;
    var linkingTargets = getOutDir()+outPaths.appTempPages+"/*.html";
    var pipe = gulp.src(srcPaths.cfgFolder+"/mainCfg.json");
    if(cfg !== null) {
        pipe = pipe.pipe(addsrc(cfg))
                .pipe(merge("cfg.json"));
    }

    return pipe
        .pipe(insert.wrap("var BuildConfig = ",";"))
        .pipe(rename("cfg.js"))
        .pipe(gulp.dest(getOutDir()+outPaths.appCfg));
});

gulp.task('compile-translations', function() {
    if(isRelease()) {
        return gulp.src(srcPaths.translationsJs)
        .pipe(babel({presets: ['es2015']}))
        .pipe(uglify().on('error',function(e){
            console.log(e);
        }))
        .pipe(concat('translations.min.js'))
        .pipe(gulp.dest(getOutDir()+outPaths.appTranslations));
    }
    else {
        return gulp.src(srcPaths.translationsJs)
        .pipe(gulp.dest(getOutDir()+outPaths.appTranslations));
    }

});

gulp.task('compile-svg',function() {
    return gulp.src(srcPaths.imgSvg)
    .pipe(gulp.dest(getOutDir()+outPaths.appSvg));
});

gulp.task('compile-png',function() {
    return gulp.src(srcPaths.imgPng)
    .pipe(gulp.dest(getOutDir()+outPaths.appPng));
});

gulp.task('copy-bower-json',function() {
    return gulp.src('bower.json')
    .pipe(gulp.dest(getOutDir()));
});

gulp.task('copy-bower-json',function() {
    return gulp.src('bower.json')
    .pipe(gulp.dest(getOutDir()));
});

gulp.task('copy-bower-folder',function() {
    return gulp.src(srcPaths.bowerFolder+"/**/*")
    .pipe(gulp.dest(getOutDir()+outPaths.appBower));
});

gulp.task('compile-bower',['copy-bower-json','copy-bower-folder']);

gulp.task('compile-mainjs',function() {
    if(isRelease()) {
        return gulp.src(srcPaths.mainJs)
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('main.min.js'))
        .pipe(uglify().on('error',function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(getOutDir()+outPaths.appMain));
    }
    else {
        return gulp.src(srcPaths.mainJs)
        .pipe(gulp.dest(getOutDir()+outPaths.appMain));
    }
});

gulp.task('compile-controllers',function() {
    if(isRelease()) {
        return gulp.src(srcPaths.controllersJs)
        .pipe(sort({
            comparator: function(f1, f2) {
                if(f1.path.indexOf('MainController') > -1) {
                    return 1;
                }
                else {
                    return f1.path.localeCompare(f2.path);
                }
            }
        }))
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('controllers.min.js'))
        .pipe(gulp.dest(getOutDir()+outPaths.appControllers));
    }
    else {
        return gulp.src(srcPaths.controllersJs)
        .pipe(gulp.dest(getOutDir()+outPaths.appControllers));
    }
});

gulp.task('compile-directives',function() {
    if(isRelease()) {
        return gulp.src(srcPaths.directivesJs)
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('directives.min.js'))
        .pipe(uglify().on('error',function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(getOutDir()+outPaths.appDirectives));
    }
    else {
        return gulp.src(srcPaths.directivesJs)
        .pipe(gulp.dest(getOutDir()+outPaths.appDirectives));
    }
});

gulp.task('compile-services',function() {
    if(isRelease()) {
        return gulp.src(srcPaths.servicesJs)
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('services.min.js'))
        .pipe(uglify().on('error',function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(getOutDir()+outPaths.appServices));
    }
    else {
        return gulp.src(srcPaths.servicesJs)
        .pipe(gulp.dest(getOutDir()+outPaths.appServices));
    }
});

gulp.task('compile-utils',function() {
    if(isRelease()) {
        return gulp.src(srcPaths.utilsJs)
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('utils.min.js'))
        .pipe(uglify().on('error',function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(getOutDir()+outPaths.appUtils));
    }
    else {
        return gulp.src(srcPaths.utilsJs)
        .pipe(gulp.dest(getOutDir()+outPaths.appUtils));
    }
});


gulp.task('compile-partials',function() {
    var inputDir = srcPaths.partials;
    var outputDir = getOutDir()+outPaths.appPartials;

    return gulp.src(inputDir)
    .pipe(gulp.dest(outputDir));
});

gulp.task('compile-manifest',function() {
    var inputDir = srcPaths.manifest;
    var outputDir = getOutDir()+outPaths.appManifest;

    return gulp.src(inputDir)
    .pipe(gulp.dest(outputDir));
});

gulp.task('compile-background',function() {
    var inputDir = srcPaths.backgroundJs;
    var outputDir = getOutDir()+outPaths.appBackground;

    return gulp.src(inputDir)
    .pipe(gulp.dest(outputDir));
});

gulp.task('compile-pages',function() {
    var inputDir = srcPaths.pages;
    var outputDir = getOutDir()+outPaths.appPages;

    return gulp.src(inputDir)
    .pipe(gulp.dest(outputDir));
});

gulp.task('compile-styles',function() {
    if(isRelease()) {
        return gulp.src(srcPaths.styles)
        .pipe(autoprefixer('last 2 version'))
        .pipe(cleancss())
        .pipe(gulp.dest(getOutDir()+outPaths.appStyles));
    }
    else {
        return gulp.src(srcPaths.styles)
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(getOutDir()+outPaths.appStyles));
    }
});

