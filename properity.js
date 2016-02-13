/**
 * Created by izwel on 16/2/13.
 */
var config = require('./config');
var through = require('through2');

module.exports = function(file){
  return through(function(buf,enc,next){
    var re = /\$\{(.*?)\}/;
    var content = buf.toString('utf8');
    while(match = re.exec(content)) {
      content = content.replace(match[0], config[match[1]]);
    }
    this.push(content);
    //console.log(content+' Hello');
    next();
  });
}