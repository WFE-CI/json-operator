/**
 * @Author: erwin
 * @Date:   2018-08-30 20-08-98
 * @Last modified by:   Erwin
 * @Last modified time: 2018-08-30 20-08-49
 */

const jsonOperator = require('./index.js');

jsonOperator('../package.json', ['version'], '0.2.0').then(function(info) {
  console.log(info);
}, function(err) {
  console.log(err);
})