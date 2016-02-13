/**
 * Created by izwel on 16/2/13.
 */
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/tem.html', 'utf8');
console.log(html);