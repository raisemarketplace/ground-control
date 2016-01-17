const execSync = require('child_process').execSync;
const readFileSync = require('fs').readFileSync;
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

function exec(command) {
  execSync(command, { stdio: [0, 1, 2] });
}

exec('npm run build');

console.log( // eslint-disable-line
  '\ngzipped, the UMD build is ' + prettyBytes(
    gzipSize.sync(readFileSync('umd/AsyncNestedRedux.min.js'))
  )
);
