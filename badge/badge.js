/**
 * Created by izwel on 16/2/13.
 */
var fs = require('fs');
var domify = require('domify');
var insertCss = require('insert-css');

var css = fs.readFileSync(__dirname + '/number.css', 'utf8');
insertCss(css);

var html = fs.readFileSync(__dirname + '/tem.html', 'utf8');

module.exports = Badge;

function Badge(opts) {
  if (!(this instanceof Badge)) return new Badge(opts);
  this.element = domify(html);
  if (opts.number) {
    this.setNumber(opts.number);
  }
}

Badge.prototype.setNumber = function (number) {
  this.element.querySelector('.number').textContent = number;
}

Badge.prototype.appendTo = function (target) {
  if (typeof target === 'string') target = document.querySelector(target);
  target.appendChild(this.element);
};