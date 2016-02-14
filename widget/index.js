/**
 * Created by taox on 16-2-14.
 */
var Widget = require('./widget.js');
var w = Widget();
w.on('append', function (target) {
  console.log('appended to: ' + target.outerHTML);
});
w.appendTo('#container');
w.setName('WIDGET');
w.setMessage('MESSAGE');