var gulp =       require('gulp');
var gutil =      require('gulp-util');
var uglify =     require('gulp-uglify');
var rename =     require('gulp-rename');
var coffee =     require('gulp-coffee');
var concat =     require('gulp-concat');
var header =     require('gulp-header');
var git =        require('gulp-git');
var runSeq =     require('run-sequence');
var fs =         require('fs');
var replace =    require('gulp-replace');
var exec =       require('child_process').exec;
var path =       require('path');

var config = {
  chains: ['common'],
  tasks: [ 'clone-ds', 'copy-ds'],
  tasksClone: [],
  tasksCopy: [],
  branch: 'master'
};
var isWin = /^win/.test(process.platform);

// get the current branch name
gulp.task('current-branch', function(cb) {
  return git.exec({ args: 'branch' }, function(err, stdout) {
    if (err) throw err;
    config.branch = stdout.replace('* ', '').replace(/\s*$/gi, '');
    cb();
  });
});

function createCopyTask(chain) {
  var srcFile = 'git_components/ds-' + chain + '/asset/' + chain;
  var destFile = 'asset/' + chain;


  gulp.task('copy-ds-' + chain, function(cb) {
    var exec = require('child_process').exec,
      child,
      cmd = "rsync -avxq '" + path.resolve(srcFile) + "' '" + path.resolve(destFile.replace('/' + chain, '')) + "'";

    if (isWin) {
      cmd = 'xcopy "' + path.resolve(srcFile) + '" "' + path.resolve(destFile) + '" /E /S /R /D /C /Y /I /Q';
    }

    console.log(cmd);
    return child = exec(cmd,
      function (error, stdout, stderr) {
        cb();
        if (error !== null) {
          console.log(chain + ' exec error: ' + error);
        }
    });
  });
  
  config.tasksCopy.push('copy-ds-' + chain);
}

gulp.task('clean', function(cb) {
  del(['./git_components/**'], cb);
});

function createChainTask(chain) {
  // create clone tasks
  gulp.task('clone-ds-' + chain, function(cb) {
    if (!fs.existsSync('./git_components/ds-' + chain )) {
      var arg = 'clone -b ' + config.branch + ' https://github.com/gsn/ds-' + chain + '.git git_components/ds-' + chain;
      // console.log(arg)
      return git.exec({args:arg }, function (err, stdout) {
        if (err) throw err;
        createCopyTask(chain);
        cb();
      })
    }
    else {
      var arg = 'git fetch && git merge --ff-only origin/' + config.branch;
      exec(arg, { cwd: process.cwd() + '/git_components/ds-' + chain },
          function (error, stdout, stderr) {
            if (stdout.indexOf('up-to-date') < 0 || !fs.existsSync('./asset/' + chain)) {
              createCopyTask(chain);
            }
            cb();
        });
    }
  });
  config.tasksClone.push('clone-ds-' + chain);
}

// build task off current branch name
for(var c in config.chains) {
  var chain = config.chains[c];
  createChainTask(chain);
};

gulp.task('build-copy', function(cb){
  if (config.tasksCopy.length > 0)
    runSeq(config.tasksCopy, cb);
  else cb();
});

gulp.task('ds-common-config-for-local-cdn', function(){
  return gulp.src(['./git_components/ds-common/asset/config.json'])
    .pipe(replace('http://cdn-staging.gsngrocers.com', ''))
    .pipe(gulp.dest('./asset'));
});

// run tasks in sequential order
gulp.task('default', function(cb) {
  runSeq('current-branch', config.tasksClone, 'build-copy', 'ds-common-config-for-local-cdn', cb);
});
