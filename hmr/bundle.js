(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
_hmr["websocket:null"].initModule("../../software/node-v4.1.1-linux-x64/lib/node_modules/watchify/node_modules/browserify/node_modules/browser-resolve/empty.js", module);
(function(){

}).apply(this, arguments);

},{}],3:[function(require,module,exports){
_hmr["websocket:null"].initModule("hmr/browser.js", module);
(function(){
/**
 * Created by taox on 16-2-14.
 */
document.body.textContent = require('./msg.js');

if (module.hot) module.hot.accept()
}).apply(this, arguments);

},{"./msg.js":4}],4:[function(require,module,exports){
_hmr["websocket:null"].initModule("hmr/msg.js", module);
(function(){
/**
 * Created by taox on 16-2-14.
 */
var foo = require('foo');
var bar = require('bar');
module.exports = 'hey,xu tao，你好啊！'+foo(5)+':'+bar('A');
}).apply(this, arguments);

},{"bar":5,"foo":6}],5:[function(require,module,exports){
_hmr["websocket:null"].initModule("hmr/node_modules/bar/main.js", module);
(function(){

var src = "A B C";
//console.log(src);
module.exports = function (x) { return src.replace(x, 'zzz') };
}).apply(this, arguments);

},{}],6:[function(require,module,exports){
_hmr["websocket:null"].initModule("hmr/node_modules/foo/browser.js", module);
(function(){
/**
 * Created by taox on 16-2-14.
 */
module.exports = function (n) { return n * 222+'browser 1' }
}).apply(this, arguments);

},{}],7:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/inc/index.js", module);
(function(){
(function (global){
'use strict';

var has = require('../lib/has');
var StrSet = require('../lib/str-set');
var forEach = require('lodash/collection/forEach');
var some = require('lodash/collection/some');
var map = require('lodash/collection/map');
var filter = require('lodash/collection/filter');
var zipObject = require('lodash/array/zipObject');
var forOwn = require('lodash/object/forOwn');
var mapValues = require('lodash/object/mapValues');
var assign = require('lodash/object/assign');

function emitError(err) {
  setTimeout(function() {
    throw err;
  }, 0);
}

function makeModuleIndexesToNames(moduleMeta) {
  var moduleIndexesToNames = {};
  forOwn(moduleMeta, function(value, name) {
    moduleIndexesToNames[value.index] = name;
  });
  return moduleIndexesToNames;
}

var console = global.console ? global.console : {
  error: function(){}, log: function() {}
};

function main(
  moduleDefs, cachedModules, moduleMeta, updateUrl,
  updateMode, supportModes, ignoreUnaccepted, updateCacheBust, bundleKey,
  socketio,
  bundle__filename, bundle__dirname
) {
  var moduleIndexesToNames = makeModuleIndexesToNames(moduleMeta);

  var socket;
  var name, i, len;

  if (!global._hmr[bundleKey].setStatus) {
    var runtimeModuleInfo = {};
    var createInfoEntry = function(name) {
      runtimeModuleInfo[name] = {
        index: moduleMeta[name].index,
        hash: moduleMeta[name].hash,
        parents: new StrSet(moduleMeta[name].parents),
        module: null,
        disposeData: null,
        accepters: new StrSet(),
        accepting: new StrSet(),
        decliners: new StrSet(),
        declining: new StrSet(),
        selfAcceptCbs: [], // may contain null. nonzero length means module is self-accepting
        disposeHandlers: []
      };
    };
    for (name in moduleMeta) {
      if (has(moduleMeta, name)) {
        createInfoEntry(name);
      }
    }

    // loaders take a callback(err, data). They may give null for data if they
    // know there hasn't been an update.
    var fileReloaders = {
      fs: function(cb) {
        var fs;
        try {
          fs = require('f'+'s');
        } catch(e) {
          cb(e);
          return;
        }
        fs.readFile(localHmr.updateUrl || bundle__filename, 'utf8', cb);
      },
      ajax: function(cb) {
        var xhr;
        try {
          xhr = new XMLHttpRequest();
        } catch(e) {
          cb(e);
          return;
        }
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              cb(null, xhr.responseText);
            } else {
              cb(new Error("Request had response "+xhr.status));
            }
          }
        };
        var url = localHmr.updateUrl + (updateCacheBust?'?_v='+(+new Date()):'');
        xhr.open('GET', url, true);
        xhr.send();
      }
    };

    var lastScriptData = null;

    // cb(err, expectUpdate)
    var reloadAndRunScript = function(cb) {
      if (!has(fileReloaders, localHmr.updateMode)) {
        cb(new Error("updateMode "+localHmr.updateMode+" not implemented"));
        return;
      }
      var reloader = fileReloaders[localHmr.updateMode];
      reloader(function(err, data) {
        if (err || !data || lastScriptData === data) {
          cb(err, false);
          return;
        }
        lastScriptData = data;
        localHmr.newLoad = null;
        try {
          //jshint evil:true
          if (bundle__filename || bundle__dirname) {
            new Function('require', '__filename', '__dirname', data)(require, bundle__filename, bundle__dirname);
          } else {
            new Function('require', data)(require);
          }
          // running the file sets _hmr.newLoad
        } catch (err2) {
          localHmr.newLoad = null;
          cb(err2);
          return;
        }
        if (!localHmr.newLoad) {
          cb(new Error("Reloaded script did not set hot module reload data"));
          return;
        }
        cb(null, true);
      });
    };

    var getOutdatedModules = function() {
      var outdated = [];
      var name;
      // add changed and deleted modules
      for (name in runtimeModuleInfo) {
        if (has(runtimeModuleInfo, name)) {
          if (
            !has(localHmr.newLoad.moduleMeta, name) ||
            runtimeModuleInfo[name].hash !== localHmr.newLoad.moduleMeta[name].hash
          ) {
            outdated.push(name);
          }
        }
      }
      // add brand new modules
      for (name in localHmr.newLoad.moduleMeta) {
        if (has(localHmr.newLoad.moduleMeta, name)) {
          if (!has(runtimeModuleInfo, name)) {
            outdated.push(name);
          }
        }
      }
      // add modules that are non-accepting/declining parents of outdated modules.
      // important: if outdated has new elements added during the loop,
      // then we iterate over them too.
      for (var i=0; i<outdated.length; i++) {
        name = outdated[i];
        //jshint -W083
        if (has(runtimeModuleInfo, name)) {
          runtimeModuleInfo[name].parents.forEach(function(parentName) {
            if (
              runtimeModuleInfo[name].selfAcceptCbs.length === 0 &&
              !runtimeModuleInfo[name].accepters.has(parentName) &&
              !runtimeModuleInfo[name].decliners.has(parentName) &&
              outdated.indexOf(parentName) === -1
            ) {
              outdated.push(parentName);
            }
          });
        }
      }
      return outdated;
    };

    var moduleHotCheck = function(autoApply, cb) {
      if (typeof autoApply === 'function') {
        cb = autoApply;
        autoApply = false;
      }
      if (!cb) {
        throw new Error("module.hot.check callback parameter required");
      }
      if (localHmr.status !== 'idle') {
        cb(new Error("module.hot.check can only be called while status is idle"));
        return;
      }
      if (updateMode === 'websocket') {
        cb(new Error("module.hot.check can't be used when update mode is websocket"));
        return;
      }

      localHmr.setStatus('check');
      reloadAndRunScript(function(err, expectUpdate) {
        if (err || !expectUpdate) {
          localHmr.setStatus('idle');
          cb(err, null);
          return;
        }
        var outdatedModules = getOutdatedModules();
        if (outdatedModules.length === 0) {
          localHmr.setStatus('idle');
          cb(null, null);
        } else {
          localHmr.setStatus('ready');
          if (autoApply) {
            moduleHotApply(autoApply, cb);
          } else {
            cb(null, outdatedModules);
          }
        }
      });
    };

    var moduleHotApply = function(options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      if (!cb) {
        throw new Error("module.hot.apply callback parameter required");
      }
      var ignoreUnaccepted = !!(options && options.ignoreUnaccepted);
      if (localHmr.status !== 'ready') {
        cb(new Error("module.hot.apply can only be called while status is ready"));
        return;
      }

      var outdatedModules = getOutdatedModules();
      var isValueNotInOutdatedModules = function(value) {
        return outdatedModules.indexOf(value) === -1;
      };
      var i, len;
      var acceptedUpdates = filter(outdatedModules, function(name) {
        if (has(runtimeModuleInfo, name)) {
          if (
            runtimeModuleInfo[name].decliners.some(isValueNotInOutdatedModules) ||
            (
              runtimeModuleInfo[name].accepters.size() === 0 &&
              runtimeModuleInfo[name].selfAcceptCbs.length === 0 &&
              runtimeModuleInfo[name].parents.some(isValueNotInOutdatedModules)
            )
          ) {
            return false;
          }
        }
        return true;
      });
      if (!ignoreUnaccepted && outdatedModules.length !== acceptedUpdates.length) {
        localHmr.setStatus('idle');
        cb(new Error("Some updates were declined"));
        return;
      }
      var an;
      for (i=0, len=acceptedUpdates.length; i<len; i++) {
        an = acceptedUpdates[i];
        if (has(runtimeModuleInfo, an)) {
          runtimeModuleInfo[an].disposeData = {};
          for (var j=0; j<runtimeModuleInfo[an].disposeHandlers.length; j++) {
            try {
              runtimeModuleInfo[an].disposeHandlers[j].call(null, runtimeModuleInfo[an].disposeData);
            } catch(e) {
              localHmr.setStatus('idle');
              cb(e || new Error("Unknown dispose callback error"));
              return;
            }
          }
        }
      }
      var selfAccepters = [];
      for (i=0, len=acceptedUpdates.length; i<len; i++) {
        an = acceptedUpdates[i];
        //jshint -W083
        if (!has(runtimeModuleInfo, an)) {
          // new modules
          runtimeModuleInfo[an] = {
            index: an,
            hash: localHmr.newLoad.moduleMeta[an].hash,
            parents: new StrSet(localHmr.newLoad.moduleMeta[an].parents),
            module: null,
            disposeData: null,
            accepters: new StrSet(),
            accepting: new StrSet(),
            decliners: new StrSet(),
            declining: new StrSet(),
            selfAcceptCbs: [],
            disposeHandlers: []
          };
        } else if (!has(localHmr.newLoad.moduleMeta, an)) {
          // removed modules
          delete cachedModules[runtimeModuleInfo[an].index];
          delete runtimeModuleInfo[an];
          continue;
        } else {
          // updated modules
          runtimeModuleInfo[an].hash = localHmr.newLoad.moduleMeta[an].hash;
          runtimeModuleInfo[an].parents = new StrSet(localHmr.newLoad.moduleMeta[an].parents);
          runtimeModuleInfo[an].module = null;
          runtimeModuleInfo[an].accepting.forEach(function(accepted) {
            runtimeModuleInfo[accepted].accepters.del(an);
          });
          runtimeModuleInfo[an].accepting = new StrSet();
          runtimeModuleInfo[an].declining.forEach(function(accepted) {
            runtimeModuleInfo[accepted].decliners.del(an);
          });
          runtimeModuleInfo[an].declining = new StrSet();
          forEach(runtimeModuleInfo[an].selfAcceptCbs, function(cb) {
            selfAccepters.push({name: an, cb: cb});
          });
          runtimeModuleInfo[an].selfAcceptCbs = [];
          runtimeModuleInfo[an].disposeHandlers = [];
        }

        moduleDefs[runtimeModuleInfo[an].index] = [
          // module function
          localHmr.newLoad.moduleDefs[localHmr.newLoad.moduleMeta[an].index][0],
          // module deps
          mapValues(localHmr.newLoad.moduleDefs[localHmr.newLoad.moduleMeta[an].index][1], function(depIndex, depRef) {
            var depName = localHmr.newLoad.moduleIndexesToNames[depIndex];
            if (has(localHmr.runtimeModuleInfo, depName)) {
              return localHmr.runtimeModuleInfo[depName].index;
            } else {
              return depName;
            }
          })
        ];
        cachedModules[runtimeModuleInfo[an].index] = null;
      }

      // Update the accept handlers list and call the right ones
      var errCanWait = null;
      var updatedNames = new StrSet(acceptedUpdates);
      var oldUpdateHandlers = localHmr.updateHandlers;
      var relevantUpdateHandlers = [];
      var newUpdateHandlers = [];
      for (i=0, len=oldUpdateHandlers.length; i<len; i++) {
        if (!updatedNames.has(oldUpdateHandlers[i].accepter)) {
          newUpdateHandlers.push(oldUpdateHandlers[i]);
        }
        if (updatedNames.hasIntersection(oldUpdateHandlers[i].deps)) {
          relevantUpdateHandlers.push(oldUpdateHandlers[i]);
        }
      }
      localHmr.updateHandlers = newUpdateHandlers;
      for (i=0, len=relevantUpdateHandlers.length; i<len; i++) {
        try {
          relevantUpdateHandlers[i].cb.call(null, acceptedUpdates);
        } catch(e) {
          if (errCanWait) emitError(errCanWait);
          errCanWait = e;
        }
      }

      // Call the self-accepting modules
      forEach(selfAccepters, function(obj) {
        try {
          require(runtimeModuleInfo[obj.name].index);
        } catch(e) {
          if (obj.cb) {
            obj.cb.call(null, e);
          } else {
            if (errCanWait) emitError(errCanWait);
            errCanWait = e;
          }
        }
      });

      localHmr.setStatus('idle');
      cb(errCanWait, acceptedUpdates);
    };

    var moduleHotSetUpdateMode = function(mode, options) {
      options = options || {};

      if (supportModes.indexOf(mode) === -1) {
        throw new Error("Mode "+mode+" not in supportModes. Please check the Browserify-HMR plugin options.");
      }
      if (mode === 'ajax' && !options.url) {
        throw new Error("url required for ajax update mode");
      }
      if (localHmr.status !== 'idle') {
        throw new Error("module.hot.setUpdateMode can only be called while status is idle");
      }

      localHmr.newLoad = null;
      localHmr.updateMode = updateMode = mode;
      localHmr.updateUrl = updateUrl = options.url;
      updateCacheBust = options.cacheBust;
      ignoreUnaccepted = has(options, 'ignoreUnaccepted') ? options.ignoreUnaccepted : true;

      if (socket) {
        socket.disconnect();
        socket = null;
      }
      if (mode === 'websocket') {
        socket = setupSocket();
      }
    };

    var setupSocket = function() {
      var url = updateUrl || 'http://localhost:3123';
      var socket = socketio(url, {'force new connection': true});
      console.log('[HMR] Attempting websocket connection to', url);

      var isAcceptingMessages = false;
      socket.on('connect', function() {
        isAcceptingMessages = false;
        var syncMsg = mapValues(runtimeModuleInfo, function(value, name) {
          return {
            hash: value.hash
          };
        });
        socket.emit('sync', syncMsg);
      });
      var isUpdating = false;
      var queuedUpdateMessages = [];
      socket.on('sync confirm', function() {
        console.log('[HMR] Websocket connection successful.');
        isAcceptingMessages = true;
        queuedUpdateMessages = [];
      });
      socket.on('disconnect', function() {
        console.log('[HMR] Websocket connection lost.');
      });
      var acceptNewModules = function(msg) {
        // Make sure we don't accept new modules before we've synced ourselves.
        if (!isAcceptingMessages) return;
        if (isUpdating) {
          queuedUpdateMessages.push(msg);
          return;
        }
        // Take the message and create a localHmr.newLoad value as if the
        // bundle had been re-executed, then call moduleHotApply.
        isUpdating = true;

        // random id so we can make the normally unnamed args have random names
        var rid = String(Math.random()).replace(/[^0-9]/g, '');

        var newModuleDefs = localHmr.newLoad ? localHmr.newLoad.moduleDefs : assign({}, moduleDefs);
        var newModuleMeta = localHmr.newLoad ?
          localHmr.newLoad.moduleMeta : mapValues(runtimeModuleInfo, function(value, key) {
            return {
              index: value.index,
              hash: value.hash,
              parents: value.parents.toArray()
            };
          });
        forOwn(msg.newModuleData, function(value, key) {
          newModuleMeta[key] = {
            index: value.index,
            hash: value.hash,
            parents: value.parents
          };
        });
        forEach(msg.removedModules, function(removedName) {
          delete newModuleDefs[runtimeModuleInfo[removedName].index];
          delete newModuleMeta[removedName];
        });
        var newModuleIndexesToNames = makeModuleIndexesToNames(newModuleMeta);
        forOwn(msg.newModuleData, function(value, key) {
          // this part needs to run after newModuleMeta and
          // newModuleIndexesToNames are populated.
          var newModuleFunction = (function() {
            var fn;
            //jshint evil:true
            if (bundle__filename || bundle__dirname) {
              fn = new Function('require', 'module', 'exports', '_u1'+rid, '_u2'+rid, '__u3'+rid, '__u4'+rid, '__filename', '__dirname', value.source);
              return function(require, module, exports, _u1, _u2, _u3, _u4) {
                global._hmr[bundleKey].initModule(key, module);
                fn.call(this, require, module, exports, _u1, _u2, _u3, _u4, bundle__filename, bundle__dirname);
              };
            } else {
              fn = new Function('require', 'module', 'exports',  '_u1'+rid, '_u2'+rid, '__u3'+rid, '__u4'+rid, value.source);
              return function(require, module, exports, _u1, _u2, _u3, _u4) {
                global._hmr[bundleKey].initModule(key, module);
                fn.call(this, require, module, exports, _u1, _u2, _u3, _u4);
              };
            }
          })();

          newModuleDefs[newModuleMeta[key].index] = [
            // module function
            newModuleFunction,
            // module deps
            mapValues(value.deps, function(depIndex, depRef) {
              var depName = newModuleIndexesToNames[depIndex];
              if (has(newModuleMeta, depName)) {
                return newModuleMeta[depName].index;
              } else {
                return depName;
              }
            })
          ];
        });
        localHmr.newLoad = {
          moduleDefs: newModuleDefs,
          moduleMeta: newModuleMeta,
          moduleIndexesToNames: newModuleIndexesToNames
        };
        localHmr.setStatus('ready');
        var outdatedModules = getOutdatedModules();
        moduleHotApply({ignoreUnaccepted: ignoreUnaccepted}, function(err, updatedNames) {
          if (err) {
            console.error('[HMR] Error applying update', err);
          }
          if (updatedNames) {
            console.log('[HMR] Updated modules', updatedNames);
            if (outdatedModules.length !== updatedNames.length) {
              var notUpdatedNames = filter(outdatedModules, function(name) {
                return updatedNames.indexOf(name) === -1;
              });
              console.log('[HMR] Some modules were not updated', notUpdatedNames);
            }
          }
          isUpdating = false;
          var queuedMsg;
          while ((queuedMsg = queuedUpdateMessages.shift())) {
            acceptNewModules(queuedMsg);
          }
        });
      };
      socket.on('new modules', acceptNewModules);
      return socket;
    };

    var localHmr = {
      updateUrl: updateUrl,
      updateMode: updateMode,
      runtimeModuleInfo: runtimeModuleInfo,

      status: "idle",
      setStatus: function(status) {
        this.status = status;
        var statusHandlers = this.statusHandlers.slice();
        for (var i=0, len=statusHandlers.length; i<len; i++) {
          statusHandlers[i].call(null, status);
        }
      },
      statusHandlers: [],
      updateHandlers: [],

      // during a reload this is set to an object with moduleDefs,
      // moduleMeta, and moduleIndexesToNames properties
      newLoad: null,

      initModule: function(name, module) {
        runtimeModuleInfo[name].module = module;
        module.hot = {
          accept: function(deps, cb) {
            if (!cb && (!deps || typeof deps === 'function')) { // self
              cb = deps;
              deps = null;
              runtimeModuleInfo[name].selfAcceptCbs.push(cb);
            } else {
              if (typeof deps === 'string') {
                deps = [deps];
              }
              var depNames = new StrSet();
              for (var i=0, depsLen=deps.length; i<depsLen; i++) {
                var depIndex = moduleDefs[runtimeModuleInfo[name].index][1][deps[i]];
                if (depIndex === undefined || !has(moduleIndexesToNames, depIndex)) {
                  throw new Error("File does not use dependency: "+deps[i]);
                }
                depNames.add(moduleIndexesToNames[depIndex]);
              }
              deps = null;
              depNames.forEach(function(depName) {
                runtimeModuleInfo[depName].accepters.add(name);
                runtimeModuleInfo[name].accepting.add(depName);
              });
              if (cb) {
                localHmr.updateHandlers.push({
                  accepter: name,
                  deps: depNames,
                  cb: cb
                });
              }
            }
          },
          decline: function(deps) {
            if (!deps) { // self
              runtimeModuleInfo[name].decliners.add(name);
              runtimeModuleInfo[name].declining.add(name);
            } else {
              if (typeof deps === 'string') {
                deps = [deps];
              }
              for (var i=0, depsLen=deps.length; i<depsLen; i++) {
                var depIndex = moduleDefs[runtimeModuleInfo[name].index][1][deps[i]];
                if (depIndex === undefined || !has(moduleIndexesToNames, depIndex)) {
                  throw new Error("File does not use dependency: "+deps[i]);
                }
                var depName = moduleIndexesToNames[depIndex];
                runtimeModuleInfo[depName].decliners.add(name);
                runtimeModuleInfo[name].declining.add(depName);
              }
            }
          },
          data: runtimeModuleInfo[name].disposeData,
          dispose: function(cb) {
            return this.addDisposeHandler(cb);
          },
          addDisposeHandler: function(cb) {
            runtimeModuleInfo[name].disposeHandlers.push(cb);
          },
          removeDisposeHandler: function(cb) {
            var ix = runtimeModuleInfo[name].disposeHandlers.indexOf(cb);
            if (ix !== -1) {
              runtimeModuleInfo[name].disposeHandlers.splice(ix, 1);
            }
          },

          // Management
          check: moduleHotCheck,
          apply: moduleHotApply,
          status: function(cb) {
            if (cb) {
              return this.addStatusHandler(cb);
            }
            return localHmr.status;
          },
          addStatusHandler: function(cb) {
            localHmr.statusHandlers.push(cb);
          },
          removeStatusHandler: function(cb) {
            var ix = localHmr.statusHandlers.indexOf(cb);
            if (ix !== -1) {
              localHmr.statusHandlers.splice(ix, 1);
            }
          },
          setUpdateMode: moduleHotSetUpdateMode
        };
      }
    };
    global._hmr[bundleKey] = localHmr;

    if (updateMode === 'websocket') {
      socket = setupSocket();
    }
    return true;
  } else { // We're in a reload!
    global._hmr[bundleKey].newLoad = {
      moduleDefs: moduleDefs,
      moduleMeta: moduleMeta,
      moduleIndexesToNames: moduleIndexesToNames
    };
    return false;
  }
}

module.exports = main;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"../lib/has":8,"../lib/str-set":9,"lodash/array/zipObject":11,"lodash/collection/filter":12,"lodash/collection/forEach":13,"lodash/collection/map":14,"lodash/collection/some":15,"lodash/object/assign":70,"lodash/object/forOwn":71,"lodash/object/mapValues":74}],8:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/lib/has.js", module);
(function(){
'use strict';

function has(object, propName) {
  return Object.prototype.hasOwnProperty.call(object, propName);
}
module.exports = has;

}).apply(this, arguments);

},{}],9:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/lib/str-set.js", module);
(function(){
'use strict';

var has = require('./has');

function StrSet(other) {
  this._map = {};
  this._size = 0;
  if (other) {
    for (var i=0,len=other.length; i<len; i++) {
      this.add(other[i]);
    }
  }
}
StrSet.prototype.add = function(value) {
  if (!this.has(value)) {
    this._map[value] = true;
    this._size++;
  }
};
StrSet.prototype.has = function(value) {
  return has(this._map, value);
};
StrSet.prototype.del = function(value) {
  if (this.has(value)) {
    delete this._map[value];
    this._size--;
  }
};
StrSet.prototype.size = function() {
  return this._size;
};
StrSet.prototype.forEach = function(cb) {
  for (var value in this._map) {
    if (has(this._map, value)) {
      cb(value);
    }
  }
};
StrSet.prototype.some = function(cb) {
  for (var value in this._map) {
    if (has(this._map, value)) {
      if (cb(value)) {
        return true;
      }
    }
  }
  return false;
};
StrSet.prototype.every = function(cb) {
  return !this.some(function(x) {
    return !cb(x);
  });
};
StrSet.prototype.hasIntersection = function(otherStrSet) {
  var value;
  if (this._size < otherStrSet._size) {
    return this.some(function(value) {
      return otherStrSet.has(value);
    });
  } else {
    var self = this;
    return otherStrSet.some(function(value) {
      return self.has(value);
    });
  }
};
StrSet.prototype.toArray = function() {
  var arr = [];
  this.forEach(function(value) {
    arr.push(value);
  });
  return arr;
};

module.exports = StrSet;

}).apply(this, arguments);

},{"./has":8}],10:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/array/last.js", module);
(function(){
/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}

module.exports = last;

}).apply(this, arguments);

},{}],11:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/array/zipObject.js", module);
(function(){
var isArray = require('../lang/isArray');

/**
 * The inverse of `_.pairs`; this method returns an object composed from arrays
 * of property names and values. Provide either a single two dimensional array,
 * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
 * and one of corresponding values.
 *
 * @static
 * @memberOf _
 * @alias object
 * @category Array
 * @param {Array} props The property names.
 * @param {Array} [values=[]] The property values.
 * @returns {Object} Returns the new object.
 * @example
 *
 * _.zipObject([['fred', 30], ['barney', 40]]);
 * // => { 'fred': 30, 'barney': 40 }
 *
 * _.zipObject(['fred', 'barney'], [30, 40]);
 * // => { 'fred': 30, 'barney': 40 }
 */
function zipObject(props, values) {
  var index = -1,
      length = props ? props.length : 0,
      result = {};

  if (length && !values && !isArray(props[0])) {
    values = [];
  }
  while (++index < length) {
    var key = props[index];
    if (values) {
      result[key] = values[index];
    } else if (key) {
      result[key[0]] = key[1];
    }
  }
  return result;
}

module.exports = zipObject;

}).apply(this, arguments);

},{"../lang/isArray":65}],12:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/collection/filter.js", module);
(function(){
var arrayFilter = require('../internal/arrayFilter'),
    baseCallback = require('../internal/baseCallback'),
    baseFilter = require('../internal/baseFilter'),
    isArray = require('../lang/isArray');

/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is bound to `thisArg` and
 * invoked with three arguments: (value, index|key, collection).
 *
 * If a property name is provided for `predicate` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `predicate` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @alias select
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [predicate=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {Array} Returns the new filtered array.
 * @example
 *
 * _.filter([4, 5, 6], function(n) {
 *   return n % 2 == 0;
 * });
 * // => [4, 6]
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * // using the `_.matches` callback shorthand
 * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
 * // => ['barney']
 *
 * // using the `_.matchesProperty` callback shorthand
 * _.pluck(_.filter(users, 'active', false), 'user');
 * // => ['fred']
 *
 * // using the `_.property` callback shorthand
 * _.pluck(_.filter(users, 'active'), 'user');
 * // => ['barney']
 */
function filter(collection, predicate, thisArg) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  predicate = baseCallback(predicate, thisArg, 3);
  return func(collection, predicate);
}

module.exports = filter;

}).apply(this, arguments);

},{"../internal/arrayFilter":18,"../internal/baseCallback":23,"../internal/baseFilter":26,"../lang/isArray":65}],13:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/collection/forEach.js", module);
(function(){
var arrayEach = require('../internal/arrayEach'),
    baseEach = require('../internal/baseEach'),
    createForEach = require('../internal/createForEach');

/**
 * Iterates over elements of `collection` invoking `iteratee` for each element.
 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
 * (value, index|key, collection). Iteratee functions may exit iteration early
 * by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length" property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2]).forEach(function(n) {
 *   console.log(n);
 * }).value();
 * // => logs each value from left to right and returns the array
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
 *   console.log(n, key);
 * });
 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
 */
var forEach = createForEach(arrayEach, baseEach);

module.exports = forEach;

}).apply(this, arguments);

},{"../internal/arrayEach":17,"../internal/baseEach":25,"../internal/createForEach":45}],14:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/collection/map.js", module);
(function(){
var arrayMap = require('../internal/arrayMap'),
    baseCallback = require('../internal/baseCallback'),
    baseMap = require('../internal/baseMap'),
    isArray = require('../lang/isArray');

/**
 * Creates an array of values by running each element in `collection` through
 * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
 * arguments: (value, index|key, collection).
 *
 * If a property name is provided for `iteratee` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `iteratee` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
 * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
 * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
 * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
 * `sum`, `uniq`, and `words`
 *
 * @static
 * @memberOf _
 * @alias collect
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function timesThree(n) {
 *   return n * 3;
 * }
 *
 * _.map([1, 2], timesThree);
 * // => [3, 6]
 *
 * _.map({ 'a': 1, 'b': 2 }, timesThree);
 * // => [3, 6] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // using the `_.property` callback shorthand
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee, thisArg) {
  var func = isArray(collection) ? arrayMap : baseMap;
  iteratee = baseCallback(iteratee, thisArg, 3);
  return func(collection, iteratee);
}

module.exports = map;

}).apply(this, arguments);

},{"../internal/arrayMap":19,"../internal/baseCallback":23,"../internal/baseMap":33,"../lang/isArray":65}],15:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/collection/some.js", module);
(function(){
var arraySome = require('../internal/arraySome'),
    baseCallback = require('../internal/baseCallback'),
    baseSome = require('../internal/baseSome'),
    isArray = require('../lang/isArray'),
    isIterateeCall = require('../internal/isIterateeCall');

/**
 * Checks if `predicate` returns truthy for **any** element of `collection`.
 * The function returns as soon as it finds a passing value and does not iterate
 * over the entire collection. The predicate is bound to `thisArg` and invoked
 * with three arguments: (value, index|key, collection).
 *
 * If a property name is provided for `predicate` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `predicate` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @alias any
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [predicate=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `predicate`.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 * @example
 *
 * _.some([null, 0, 'yes', false], Boolean);
 * // => true
 *
 * var users = [
 *   { 'user': 'barney', 'active': true },
 *   { 'user': 'fred',   'active': false }
 * ];
 *
 * // using the `_.matches` callback shorthand
 * _.some(users, { 'user': 'barney', 'active': false });
 * // => false
 *
 * // using the `_.matchesProperty` callback shorthand
 * _.some(users, 'active', false);
 * // => true
 *
 * // using the `_.property` callback shorthand
 * _.some(users, 'active');
 * // => true
 */
function some(collection, predicate, thisArg) {
  var func = isArray(collection) ? arraySome : baseSome;
  if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
    predicate = undefined;
  }
  if (typeof predicate != 'function' || thisArg !== undefined) {
    predicate = baseCallback(predicate, thisArg, 3);
  }
  return func(collection, predicate);
}

module.exports = some;

}).apply(this, arguments);

},{"../internal/arraySome":20,"../internal/baseCallback":23,"../internal/baseSome":39,"../internal/isIterateeCall":56,"../lang/isArray":65}],16:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/function/restParam.js", module);
(function(){
/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

}).apply(this, arguments);

},{}],17:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/arrayEach.js", module);
(function(){
/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

}).apply(this, arguments);

},{}],18:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/arrayFilter.js", module);
(function(){
/**
 * A specialized version of `_.filter` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array.length,
      resIndex = -1,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[++resIndex] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;

}).apply(this, arguments);

},{}],19:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/arrayMap.js", module);
(function(){
/**
 * A specialized version of `_.map` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

}).apply(this, arguments);

},{}],20:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/arraySome.js", module);
(function(){
/**
 * A specialized version of `_.some` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;

}).apply(this, arguments);

},{}],21:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/assignWith.js", module);
(function(){
var keys = require('../object/keys');

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (value === undefined && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

module.exports = assignWith;

}).apply(this, arguments);

},{"../object/keys":72}],22:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseAssign.js", module);
(function(){
var baseCopy = require('./baseCopy'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

}).apply(this, arguments);

},{"../object/keys":72,"./baseCopy":24}],23:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js", module);
(function(){
var baseMatches = require('./baseMatches'),
    baseMatchesProperty = require('./baseMatchesProperty'),
    bindCallback = require('./bindCallback'),
    identity = require('../utility/identity'),
    property = require('../utility/property');

/**
 * The base implementation of `_.callback` which supports specifying the
 * number of arguments to provide to `func`.
 *
 * @private
 * @param {*} [func=_.identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function baseCallback(func, thisArg, argCount) {
  var type = typeof func;
  if (type == 'function') {
    return thisArg === undefined
      ? func
      : bindCallback(func, thisArg, argCount);
  }
  if (func == null) {
    return identity;
  }
  if (type == 'object') {
    return baseMatches(func);
  }
  return thisArg === undefined
    ? property(func)
    : baseMatchesProperty(func, thisArg);
}

module.exports = baseCallback;

}).apply(this, arguments);

},{"../utility/identity":76,"../utility/property":77,"./baseMatches":34,"./baseMatchesProperty":35,"./bindCallback":41}],24:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseCopy.js", module);
(function(){
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

}).apply(this, arguments);

},{}],25:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseEach.js", module);
(function(){
var baseForOwn = require('./baseForOwn'),
    createBaseEach = require('./createBaseEach');

/**
 * The base implementation of `_.forEach` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object|string} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;

}).apply(this, arguments);

},{"./baseForOwn":28,"./createBaseEach":43}],26:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseFilter.js", module);
(function(){
var baseEach = require('./baseEach');

/**
 * The base implementation of `_.filter` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

module.exports = baseFilter;

}).apply(this, arguments);

},{"./baseEach":25}],27:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseFor.js", module);
(function(){
var createBaseFor = require('./createBaseFor');

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

}).apply(this, arguments);

},{"./createBaseFor":44}],28:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseForOwn.js", module);
(function(){
var baseFor = require('./baseFor'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

}).apply(this, arguments);

},{"../object/keys":72,"./baseFor":27}],29:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseGet.js", module);
(function(){
var toObject = require('./toObject');

/**
 * The base implementation of `get` without support for string paths
 * and default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path of the property to get.
 * @param {string} [pathKey] The key representation of path.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path, pathKey) {
  if (object == null) {
    return;
  }
  if (pathKey !== undefined && pathKey in toObject(object)) {
    path = [pathKey];
  }
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;

}).apply(this, arguments);

},{"./toObject":62}],30:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqual.js", module);
(function(){
var baseIsEqualDeep = require('./baseIsEqualDeep'),
    isObject = require('../lang/isObject'),
    isObjectLike = require('./isObjectLike');

/**
 * The base implementation of `_.isEqual` without support for `this` binding
 * `customizer` functions.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
}

module.exports = baseIsEqual;

}).apply(this, arguments);

},{"../lang/isObject":68,"./baseIsEqualDeep":31,"./isObjectLike":59}],31:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js", module);
(function(){
var equalArrays = require('./equalArrays'),
    equalByTag = require('./equalByTag'),
    equalObjects = require('./equalObjects'),
    isArray = require('../lang/isArray'),
    isTypedArray = require('../lang/isTypedArray');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = objToString.call(object);
    if (objTag == argsTag) {
      objTag = objectTag;
    } else if (objTag != objectTag) {
      objIsArr = isTypedArray(object);
    }
  }
  if (!othIsArr) {
    othTag = objToString.call(other);
    if (othTag == argsTag) {
      othTag = objectTag;
    } else if (othTag != objectTag) {
      othIsArr = isTypedArray(other);
    }
  }
  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && !(objIsArr || objIsObj)) {
    return equalByTag(object, other, objTag);
  }
  if (!isLoose) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
    }
  }
  if (!isSameTag) {
    return false;
  }
  // Assume cyclic values are equal.
  // For more information on detecting circular references see https://es5.github.io/#JO.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == object) {
      return stackB[length] == other;
    }
  }
  // Add `object` and `other` to the stack of traversed objects.
  stackA.push(object);
  stackB.push(other);

  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

  stackA.pop();
  stackB.pop();

  return result;
}

module.exports = baseIsEqualDeep;

}).apply(this, arguments);

},{"../lang/isArray":65,"../lang/isTypedArray":69,"./equalArrays":48,"./equalByTag":49,"./equalObjects":50}],32:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseIsMatch.js", module);
(function(){
var baseIsEqual = require('./baseIsEqual'),
    toObject = require('./toObject');

/**
 * The base implementation of `_.isMatch` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Array} matchData The propery names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = toObject(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;

}).apply(this, arguments);

},{"./baseIsEqual":30,"./toObject":62}],33:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseMap.js", module);
(function(){
var baseEach = require('./baseEach'),
    isArrayLike = require('./isArrayLike');

/**
 * The base implementation of `_.map` without support for callback shorthands
 * and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

module.exports = baseMap;

}).apply(this, arguments);

},{"./baseEach":25,"./isArrayLike":54}],34:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseMatches.js", module);
(function(){
var baseIsMatch = require('./baseIsMatch'),
    getMatchData = require('./getMatchData'),
    toObject = require('./toObject');

/**
 * The base implementation of `_.matches` which does not clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    var key = matchData[0][0],
        value = matchData[0][1];

    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === value && (value !== undefined || (key in toObject(object)));
    };
  }
  return function(object) {
    return baseIsMatch(object, matchData);
  };
}

module.exports = baseMatches;

}).apply(this, arguments);

},{"./baseIsMatch":32,"./getMatchData":52,"./toObject":62}],35:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js", module);
(function(){
var baseGet = require('./baseGet'),
    baseIsEqual = require('./baseIsEqual'),
    baseSlice = require('./baseSlice'),
    isArray = require('../lang/isArray'),
    isKey = require('./isKey'),
    isStrictComparable = require('./isStrictComparable'),
    last = require('../array/last'),
    toObject = require('./toObject'),
    toPath = require('./toPath');

/**
 * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to compare.
 * @returns {Function} Returns the new function.
 */
function baseMatchesProperty(path, srcValue) {
  var isArr = isArray(path),
      isCommon = isKey(path) && isStrictComparable(srcValue),
      pathKey = (path + '');

  path = toPath(path);
  return function(object) {
    if (object == null) {
      return false;
    }
    var key = pathKey;
    object = toObject(object);
    if ((isArr || !isCommon) && !(key in object)) {
      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
      if (object == null) {
        return false;
      }
      key = last(path);
      object = toObject(object);
    }
    return object[key] === srcValue
      ? (srcValue !== undefined || (key in object))
      : baseIsEqual(srcValue, object[key], undefined, true);
  };
}

module.exports = baseMatchesProperty;

}).apply(this, arguments);

},{"../array/last":10,"../lang/isArray":65,"./baseGet":29,"./baseIsEqual":30,"./baseSlice":38,"./isKey":57,"./isStrictComparable":60,"./toObject":62,"./toPath":63}],36:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseProperty.js", module);
(function(){
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

}).apply(this, arguments);

},{}],37:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/basePropertyDeep.js", module);
(function(){
var baseGet = require('./baseGet'),
    toPath = require('./toPath');

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new function.
 */
function basePropertyDeep(path) {
  var pathKey = (path + '');
  path = toPath(path);
  return function(object) {
    return baseGet(object, path, pathKey);
  };
}

module.exports = basePropertyDeep;

}).apply(this, arguments);

},{"./baseGet":29,"./toPath":63}],38:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseSlice.js", module);
(function(){
/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  start = start == null ? 0 : (+start || 0);
  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = (end === undefined || end > length) ? length : (+end || 0);
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;

}).apply(this, arguments);

},{}],39:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseSome.js", module);
(function(){
var baseEach = require('./baseEach');

/**
 * The base implementation of `_.some` without support for callback shorthands
 * and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function baseSome(collection, predicate) {
  var result;

  baseEach(collection, function(value, index, collection) {
    result = predicate(value, index, collection);
    return !result;
  });
  return !!result;
}

module.exports = baseSome;

}).apply(this, arguments);

},{"./baseEach":25}],40:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/baseToString.js", module);
(function(){
/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  return value == null ? '' : (value + '');
}

module.exports = baseToString;

}).apply(this, arguments);

},{}],41:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/bindCallback.js", module);
(function(){
var identity = require('../utility/identity');

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

module.exports = bindCallback;

}).apply(this, arguments);

},{"../utility/identity":76}],42:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/createAssigner.js", module);
(function(){
var bindCallback = require('./bindCallback'),
    isIterateeCall = require('./isIterateeCall'),
    restParam = require('../function/restParam');

/**
 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

}).apply(this, arguments);

},{"../function/restParam":16,"./bindCallback":41,"./isIterateeCall":56}],43:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/createBaseEach.js", module);
(function(){
var getLength = require('./getLength'),
    isLength = require('./isLength'),
    toObject = require('./toObject');

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    var length = collection ? getLength(collection) : 0;
    if (!isLength(length)) {
      return eachFunc(collection, iteratee);
    }
    var index = fromRight ? length : -1,
        iterable = toObject(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;

}).apply(this, arguments);

},{"./getLength":51,"./isLength":58,"./toObject":62}],44:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/createBaseFor.js", module);
(function(){
var toObject = require('./toObject');

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

}).apply(this, arguments);

},{"./toObject":62}],45:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/createForEach.js", module);
(function(){
var bindCallback = require('./bindCallback'),
    isArray = require('../lang/isArray');

/**
 * Creates a function for `_.forEach` or `_.forEachRight`.
 *
 * @private
 * @param {Function} arrayFunc The function to iterate over an array.
 * @param {Function} eachFunc The function to iterate over a collection.
 * @returns {Function} Returns the new each function.
 */
function createForEach(arrayFunc, eachFunc) {
  return function(collection, iteratee, thisArg) {
    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
      ? arrayFunc(collection, iteratee)
      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
  };
}

module.exports = createForEach;

}).apply(this, arguments);

},{"../lang/isArray":65,"./bindCallback":41}],46:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/createForOwn.js", module);
(function(){
var bindCallback = require('./bindCallback');

/**
 * Creates a function for `_.forOwn` or `_.forOwnRight`.
 *
 * @private
 * @param {Function} objectFunc The function to iterate over an object.
 * @returns {Function} Returns the new each function.
 */
function createForOwn(objectFunc) {
  return function(object, iteratee, thisArg) {
    if (typeof iteratee != 'function' || thisArg !== undefined) {
      iteratee = bindCallback(iteratee, thisArg, 3);
    }
    return objectFunc(object, iteratee);
  };
}

module.exports = createForOwn;

}).apply(this, arguments);

},{"./bindCallback":41}],47:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/createObjectMapper.js", module);
(function(){
var baseCallback = require('./baseCallback'),
    baseForOwn = require('./baseForOwn');

/**
 * Creates a function for `_.mapKeys` or `_.mapValues`.
 *
 * @private
 * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
 * @returns {Function} Returns the new map function.
 */
function createObjectMapper(isMapKeys) {
  return function(object, iteratee, thisArg) {
    var result = {};
    iteratee = baseCallback(iteratee, thisArg, 3);

    baseForOwn(object, function(value, key, object) {
      var mapped = iteratee(value, key, object);
      key = isMapKeys ? mapped : key;
      value = isMapKeys ? value : mapped;
      result[key] = value;
    });
    return result;
  };
}

module.exports = createObjectMapper;

}).apply(this, arguments);

},{"./baseCallback":23,"./baseForOwn":28}],48:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/equalArrays.js", module);
(function(){
var arraySome = require('./arraySome');

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing arrays.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var index = -1,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
    return false;
  }
  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index],
        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

    if (result !== undefined) {
      if (result) {
        continue;
      }
      return false;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (isLoose) {
      if (!arraySome(other, function(othValue) {
            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
          })) {
        return false;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
      return false;
    }
  }
  return true;
}

module.exports = equalArrays;

}).apply(this, arguments);

},{"./arraySome":20}],49:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/equalByTag.js", module);
(function(){
/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    stringTag = '[object String]';

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag) {
  switch (tag) {
    case boolTag:
    case dateTag:
      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
      return +object == +other;

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case numberTag:
      // Treat `NaN` vs. `NaN` as equal.
      return (object != +object)
        ? other != +other
        : object == +other;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings primitives and string
      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
      return object == (other + '');
  }
  return false;
}

module.exports = equalByTag;

}).apply(this, arguments);

},{}],50:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/equalObjects.js", module);
(function(){
var keys = require('../object/keys');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isLoose) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  var skipCtor = isLoose;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key],
        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

    // Recursively compare objects (susceptible to call stack limits).
    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
      return false;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (!skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      return false;
    }
  }
  return true;
}

module.exports = equalObjects;

}).apply(this, arguments);

},{"../object/keys":72}],51:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/getLength.js", module);
(function(){
var baseProperty = require('./baseProperty');

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

module.exports = getLength;

}).apply(this, arguments);

},{"./baseProperty":36}],52:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/getMatchData.js", module);
(function(){
var isStrictComparable = require('./isStrictComparable'),
    pairs = require('../object/pairs');

/**
 * Gets the propery names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = pairs(object),
      length = result.length;

  while (length--) {
    result[length][2] = isStrictComparable(result[length][1]);
  }
  return result;
}

module.exports = getMatchData;

}).apply(this, arguments);

},{"../object/pairs":75,"./isStrictComparable":60}],53:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/getNative.js", module);
(function(){
var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

}).apply(this, arguments);

},{"../lang/isNative":67}],54:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isArrayLike.js", module);
(function(){
var getLength = require('./getLength'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

module.exports = isArrayLike;

}).apply(this, arguments);

},{"./getLength":51,"./isLength":58}],55:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isIndex.js", module);
(function(){
/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

}).apply(this, arguments);

},{}],56:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isIterateeCall.js", module);
(function(){
var isArrayLike = require('./isArrayLike'),
    isIndex = require('./isIndex'),
    isObject = require('../lang/isObject');

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

module.exports = isIterateeCall;

}).apply(this, arguments);

},{"../lang/isObject":68,"./isArrayLike":54,"./isIndex":55}],57:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isKey.js", module);
(function(){
var isArray = require('../lang/isArray'),
    toObject = require('./toObject');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  var type = typeof value;
  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
    return true;
  }
  if (isArray(value)) {
    return false;
  }
  var result = !reIsDeepProp.test(value);
  return result || (object != null && value in toObject(object));
}

module.exports = isKey;

}).apply(this, arguments);

},{"../lang/isArray":65,"./toObject":62}],58:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isLength.js", module);
(function(){
/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

}).apply(this, arguments);

},{}],59:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isObjectLike.js", module);
(function(){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

}).apply(this, arguments);

},{}],60:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/isStrictComparable.js", module);
(function(){
var isObject = require('../lang/isObject');

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;

}).apply(this, arguments);

},{"../lang/isObject":68}],61:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js", module);
(function(){
var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('./isIndex'),
    isLength = require('./isLength'),
    keysIn = require('../object/keysIn');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = shimKeys;

}).apply(this, arguments);

},{"../lang/isArguments":64,"../lang/isArray":65,"../object/keysIn":73,"./isIndex":55,"./isLength":58}],62:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/toObject.js", module);
(function(){
var isObject = require('../lang/isObject');

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

module.exports = toObject;

}).apply(this, arguments);

},{"../lang/isObject":68}],63:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/internal/toPath.js", module);
(function(){
var baseToString = require('./baseToString'),
    isArray = require('../lang/isArray');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `value` to property path array if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Array} Returns the property path array.
 */
function toPath(value) {
  if (isArray(value)) {
    return value;
  }
  var result = [];
  baseToString(value).replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
}

module.exports = toPath;

}).apply(this, arguments);

},{"../lang/isArray":65,"./baseToString":40}],64:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/lang/isArguments.js", module);
(function(){
var isArrayLike = require('../internal/isArrayLike'),
    isObjectLike = require('../internal/isObjectLike');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && isArrayLike(value) &&
    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
}

module.exports = isArguments;

}).apply(this, arguments);

},{"../internal/isArrayLike":54,"../internal/isObjectLike":59}],65:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/lang/isArray.js", module);
(function(){
var getNative = require('../internal/getNative'),
    isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var arrayTag = '[object Array]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

module.exports = isArray;

}).apply(this, arguments);

},{"../internal/getNative":53,"../internal/isLength":58,"../internal/isObjectLike":59}],66:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/lang/isFunction.js", module);
(function(){
var isObject = require('./isObject');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 which returns 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

module.exports = isFunction;

}).apply(this, arguments);

},{"./isObject":68}],67:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/lang/isNative.js", module);
(function(){
var isFunction = require('./isFunction'),
    isObjectLike = require('../internal/isObjectLike');

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

}).apply(this, arguments);

},{"../internal/isObjectLike":59,"./isFunction":66}],68:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/lang/isObject.js", module);
(function(){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

}).apply(this, arguments);

},{}],69:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/lang/isTypedArray.js", module);
(function(){
var isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
}

module.exports = isTypedArray;

}).apply(this, arguments);

},{"../internal/isLength":58,"../internal/isObjectLike":59}],70:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/object/assign.js", module);
(function(){
var assignWith = require('../internal/assignWith'),
    baseAssign = require('../internal/baseAssign'),
    createAssigner = require('../internal/createAssigner');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it's invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function(object, source, customizer) {
  return customizer
    ? assignWith(object, source, customizer)
    : baseAssign(object, source);
});

module.exports = assign;

}).apply(this, arguments);

},{"../internal/assignWith":21,"../internal/baseAssign":22,"../internal/createAssigner":42}],71:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/object/forOwn.js", module);
(function(){
var baseForOwn = require('../internal/baseForOwn'),
    createForOwn = require('../internal/createForOwn');

/**
 * Iterates over own enumerable properties of an object invoking `iteratee`
 * for each property. The `iteratee` is bound to `thisArg` and invoked with
 * three arguments: (value, key, object). Iteratee functions may exit iteration
 * early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forOwn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => logs 'a' and 'b' (iteration order is not guaranteed)
 */
var forOwn = createForOwn(baseForOwn);

module.exports = forOwn;

}).apply(this, arguments);

},{"../internal/baseForOwn":28,"../internal/createForOwn":46}],72:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/object/keys.js", module);
(function(){
var getNative = require('../internal/getNative'),
    isArrayLike = require('../internal/isArrayLike'),
    isObject = require('../lang/isObject'),
    shimKeys = require('../internal/shimKeys');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

module.exports = keys;

}).apply(this, arguments);

},{"../internal/getNative":53,"../internal/isArrayLike":54,"../internal/shimKeys":61,"../lang/isObject":68}],73:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js", module);
(function(){
var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('../internal/isIndex'),
    isLength = require('../internal/isLength'),
    isObject = require('../lang/isObject');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

}).apply(this, arguments);

},{"../internal/isIndex":55,"../internal/isLength":58,"../lang/isArguments":64,"../lang/isArray":65,"../lang/isObject":68}],74:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/object/mapValues.js", module);
(function(){
var createObjectMapper = require('../internal/createObjectMapper');

/**
 * Creates an object with the same keys as `object` and values generated by
 * running each own enumerable property of `object` through `iteratee`. The
 * iteratee function is bound to `thisArg` and invoked with three arguments:
 * (value, key, object).
 *
 * If a property name is provided for `iteratee` the created `_.property`
 * style callback returns the property value of the given element.
 *
 * If a value is also provided for `thisArg` the created `_.matchesProperty`
 * style callback returns `true` for elements that have a matching property
 * value, else `false`.
 *
 * If an object is provided for `iteratee` the created `_.matches` style
 * callback returns `true` for elements that have the properties of the given
 * object, else `false`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
 *  per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Object} Returns the new mapped object.
 * @example
 *
 * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
 *   return n * 3;
 * });
 * // => { 'a': 3, 'b': 6 }
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * // using the `_.property` callback shorthand
 * _.mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
var mapValues = createObjectMapper();

module.exports = mapValues;

}).apply(this, arguments);

},{"../internal/createObjectMapper":47}],75:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/object/pairs.js", module);
(function(){
var keys = require('./keys'),
    toObject = require('../internal/toObject');

/**
 * Creates a two dimensional array of the key-value pairs for `object`,
 * e.g. `[[key1, value1], [key2, value2]]`.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the new array of key-value pairs.
 * @example
 *
 * _.pairs({ 'barney': 36, 'fred': 40 });
 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
 */
function pairs(object) {
  object = toObject(object);

  var index = -1,
      props = keys(object),
      length = props.length,
      result = Array(length);

  while (++index < length) {
    var key = props[index];
    result[index] = [key, object[key]];
  }
  return result;
}

module.exports = pairs;

}).apply(this, arguments);

},{"../internal/toObject":62,"./keys":72}],76:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/utility/identity.js", module);
(function(){
/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

}).apply(this, arguments);

},{}],77:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/lodash/utility/property.js", module);
(function(){
var baseProperty = require('../internal/baseProperty'),
    basePropertyDeep = require('../internal/basePropertyDeep'),
    isKey = require('../internal/isKey');

/**
 * Creates a function that returns the property value at `path` on a
 * given object.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': { 'c': 2 } } },
 *   { 'a': { 'b': { 'c': 1 } } }
 * ];
 *
 * _.map(objects, _.property('a.b.c'));
 * // => [2, 1]
 *
 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
}

module.exports = property;

}).apply(this, arguments);

},{"../internal/baseProperty":36,"../internal/basePropertyDeep":37,"../internal/isKey":57}],78:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js", module);
(function(){

/**
 * Module dependencies.
 */

var url = require('./url');
var parser = require('socket.io-parser');
var Manager = require('./manager');
var debug = require('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = require('./manager');
exports.Socket = require('./socket');

}).apply(this, arguments);

},{"./manager":79,"./socket":81,"./url":82,"debug":86,"socket.io-parser":119}],79:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js", module);
(function(){

/**
 * Module dependencies.
 */

var eio = require('engine.io-client');
var Socket = require('./socket');
var Emitter = require('component-emitter');
var parser = require('socket.io-parser');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:manager');
var indexOf = require('indexof');
var Backoff = require('backo2');

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' == typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function() {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function(){
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function(v){
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function(){
  this.lastPing = new Date;
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function(){
  this.emitAll('pong', new Date - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function(){
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting() {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  debug('cleanup');

  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' == this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

}).apply(this, arguments);

},{"./on":80,"./socket":81,"backo2":83,"component-bind":84,"component-emitter":85,"debug":86,"engine.io-client":89,"indexof":116,"socket.io-parser":119}],80:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/lib/on.js", module);
(function(){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

}).apply(this, arguments);

},{}],81:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js", module);
(function(){

/**
 * Module dependencies.
 */

var parser = require('socket.io-parser');
var Emitter = require('component-emitter');
var toArray = require('to-array');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:socket');
var hasBin = require('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function() {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  var ack = this.acks[packet.id];
  if ('function' == typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function(compress){
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};

}).apply(this, arguments);

},{"./on":80,"component-bind":84,"component-emitter":85,"debug":86,"has-binary":114,"socket.io-parser":119,"to-array":124}],82:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/lib/url.js", module);
(function(){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = require('parseuri');
var debug = require('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('/' == uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    }
    else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"debug":86,"parseuri":117}],83:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/backo2/index.js", module);
(function(){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


}).apply(this, arguments);

},{}],84:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/component-bind/index.js", module);
(function(){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

}).apply(this, arguments);

},{}],85:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/component-emitter/index.js", module);
(function(){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}).apply(this, arguments);

},{}],86:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/browser.js", module);
(function(){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

}).apply(this, arguments);

},{"./debug":87}],87:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/debug.js", module);
(function(){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

}).apply(this, arguments);

},{"ms":88}],88:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/node_modules/ms/index.js", module);
(function(){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

}).apply(this, arguments);

},{}],89:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/index.js", module);
(function(){

module.exports =  require('./lib/');

}).apply(this, arguments);

},{"./lib/":90}],90:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/index.js", module);
(function(){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

}).apply(this, arguments);

},{"./socket":91,"engine.io-parser":101}],91:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js", module);
(function(){
(function (global){
/**
 * Module dependencies.
 */

var transports = require('./transports');
var Emitter = require('component-emitter');
var debug = require('debug')('engine.io-client:socket');
var index = require('indexof');
var parser = require('engine.io-parser');
var parseuri = require('parseuri');
var parsejson = require('parsejson');
var parseqs = require('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;

  // other options for Node.js client
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }
  }

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.transports = require('./transports');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function() {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if  ('closed' == this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function(){
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if('function' == typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' == typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' == this.readyState || 'closed' == this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function() {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close() {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose() {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade() {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"./transport":92,"./transports":93,"component-emitter":99,"debug":86,"engine.io-parser":101,"indexof":116,"parsejson":111,"parseqs":112,"parseuri":117}],92:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transport.js", module);
(function(){
/**
 * Module dependencies.
 */

var parser = require('engine.io-parser');
var Emitter = require('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function(data){
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

}).apply(this, arguments);

},{"component-emitter":99,"engine.io-parser":101}],93:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/index.js", module);
(function(){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var XHR = require('./polling-xhr');
var JSONP = require('./polling-jsonp');
var websocket = require('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling(opts){
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    xs = opts.secure != isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"./polling-jsonp":94,"./polling-xhr":95,"./websocket":97,"xmlhttprequest-ssl":98}],94:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-jsonp.js", module);
(function(){
(function (global){

/**
 * Module requirements.
 */

var Polling = require('./polling');
var inherit = require('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  }
  else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"./polling":96,"component-inherit":100}],95:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js", module);
(function(){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var Polling = require('./polling');
var Emitter = require('component-emitter');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
    this.xs = opts.secure != isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.hasXDR()) {
      xhr.onload = function(){
        self.onLoad();
      };
      xhr.onerror = function(){
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function(){
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(fromError){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch(e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function(){
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function(){
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"./polling":96,"component-emitter":99,"component-inherit":100,"debug":86,"xmlhttprequest-ssl":98}],96:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js", module);
(function(){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parseqs = require('parseqs');
var parser = require('engine.io-parser');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = require('xmlhttprequest-ssl');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

}).apply(this, arguments);

},{"../transport":92,"component-inherit":100,"debug":86,"engine.io-parser":101,"parseqs":112,"xmlhttprequest-ssl":98,"yeast":113}],97:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js", module);
(function(){
(function (global){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  try {
    WebSocket = require('ws');
  } catch (e) { }
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }

  this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'buffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function(packet) {
      parser.encodePacket(packet, self.supportsBinary, function(data) {
        if (!BrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' == typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        //Sometimes the websocket has already been closed but the browser didn't
        //have a chance of informing us about it yet, in that case send will
        //throw an error
        try {
          if (BrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e){
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done(){
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function(){
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"../transport":92,"component-inherit":100,"debug":86,"engine.io-parser":101,"parseqs":112,"ws":1,"yeast":113}],98:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/xmlhttprequest.js", module);
(function(){
// browser shim for xmlhttprequest module
var hasCORS = require('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

}).apply(this, arguments);

},{"has-cors":110}],99:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/component-emitter/index.js", module);
(function(){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}).apply(this, arguments);

},{}],100:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/component-inherit/index.js", module);
(function(){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
}).apply(this, arguments);

},{}],101:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js", module);
(function(){
(function (global){
/**
 * Module dependencies.
 */

var keys = require('./keys');
var hasBinary = require('has-binary');
var sliceBuffer = require('arraybuffer.slice');
var base64encoder = require('base64-arraybuffer');
var after = require('after');
var utf8 = require('utf8');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = require('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      try {
        data = utf8.decode(data);
      } catch (e) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"./keys":102,"after":103,"arraybuffer.slice":104,"base64-arraybuffer":105,"blob":106,"has-binary":107,"utf8":109}],102:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/keys.js", module);
(function(){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

}).apply(this, arguments);

},{}],103:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/after/index.js", module);
(function(){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

}).apply(this, arguments);

},{}],104:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/arraybuffer.slice/index.js", module);
(function(){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

}).apply(this, arguments);

},{}],105:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js", module);
(function(){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

}).apply(this, arguments);

},{}],106:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/blob/index.js", module);
(function(){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{}],107:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/has-binary/index.js", module);
(function(){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"isarray":108}],108:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/has-binary/node_modules/isarray/index.js", module);
(function(){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

}).apply(this, arguments);

},{}],109:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/utf8/utf8.js", module);
(function(){
(function (global){
/*! https://mths.be/utf8js v2.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	function checkScalarValue(codePoint) {
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
			throw Error(
				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
				' is not a scalar value'
			);
		}
	}
	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			checkScalarValue(codePoint);
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				checkScalarValue(codePoint);
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return utf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{}],110:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/has-cors/index.js", module);
(function(){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

}).apply(this, arguments);

},{}],111:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/parsejson/index.js", module);
(function(){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{}],112:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/parseqs/index.js", module);
(function(){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

}).apply(this, arguments);

},{}],113:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/yeast/index.js", module);
(function(){
'use strict';

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;

}).apply(this, arguments);

},{}],114:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/has-binary/index.js", module);
(function(){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"isarray":115}],115:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/has-binary/node_modules/isarray/index.js", module);
(function(){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

}).apply(this, arguments);

},{}],116:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/indexof/index.js", module);
(function(){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}).apply(this, arguments);

},{}],117:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/parseuri/index.js", module);
(function(){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

}).apply(this, arguments);

},{}],118:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/binary.js", module);
(function(){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = require('isarray');
var isBuf = require('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{"./is-buffer":120,"isarray":122}],119:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js", module);
(function(){

/**
 * Module dependencies.
 */

var debug = require('debug')('socket.io-parser');
var json = require('json3');
var isArray = require('isarray');
var Emitter = require('component-emitter');
var binary = require('./binary');
var isBuf = require('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

}).apply(this, arguments);

},{"./binary":118,"./is-buffer":120,"component-emitter":121,"debug":86,"isarray":122,"json3":123}],120:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/is-buffer.js", module);
(function(){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{}],121:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/node_modules/component-emitter/index.js", module);
(function(){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}).apply(this, arguments);

},{}],122:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/node_modules/isarray/index.js", module);
(function(){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

}).apply(this, arguments);

},{}],123:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/node_modules/json3/lib/json3.js", module);
(function(){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

}).apply(this, arguments);

},{}],124:[function(require,module,exports){
_hmr["websocket:null"].initModule("node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/to-array/index.js", module);
(function(){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

}).apply(this, arguments);

},{}],2:[function(require,module,exports){
(function(global, _main, moduleDefs, cachedModules, _entries) {
  'use strict';

  var moduleMeta = {"node_modules/browserify-hmr/lib/has.js":{"index":8,"hash":"Hky4QYVrU1+kFHIEuxPy","parents":["node_modules/browserify-hmr/lib/str-set.js","node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/lib/str-set.js":{"index":9,"hash":"lcrDmQK4uaqOqN+FV4/9","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/lib/on.js":{"index":80,"hash":"y5MOoFpTKKBHwE8q8jae","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js"]},"hmr/node_modules/foo/browser.js":{"index":6,"hash":"GZajYZsB6ZrjRCchd2dX","parents":["hmr/msg.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/component-emitter/index.js":{"index":85,"hash":"asxNeKKEYmnxnAxICTS6","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/parseuri/index.js":{"index":117,"hash":"c/c7XftSI6ClFc9h2jOh","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/url.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/lib/url.js":{"index":82,"hash":"eqhuYpmEqY1ld8f2WBYH","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/browser.js":{"index":86,"hash":"S76q28f1VPJIcCtJn1eq","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/url.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/is-buffer.js":{"index":120,"hash":"TgmAiS1M6dQe04zksDv4","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/binary.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/component-bind/index.js":{"index":84,"hash":"4yIcVw+afwUsnTQyI0a3","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/indexof/index.js":{"index":116,"hash":"8zMGV0j0ID5bUIeT7r+M","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/backo2/index.js":{"index":83,"hash":"L5ry3mfVEw1wgmx9Sa+q","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/to-array/index.js":{"index":124,"hash":"2EoggafxX+GLXkXiaGjm","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/lodash/array/zipObject.js":{"index":11,"hash":"fKfSwIzPo5SUx9d0DkgN","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/lang/isArray.js":{"index":65,"hash":"rpMiE1Z199/XZCjno4KN","parents":["node_modules/browserify-hmr/node_modules/lodash/array/zipObject.js","node_modules/browserify-hmr/node_modules/lodash/collection/map.js","node_modules/browserify-hmr/node_modules/lodash/collection/filter.js","node_modules/browserify-hmr/node_modules/lodash/internal/createForEach.js","node_modules/browserify-hmr/node_modules/lodash/internal/isKey.js","node_modules/browserify-hmr/node_modules/lodash/internal/toPath.js","node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js","node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js","node_modules/browserify-hmr/node_modules/lodash/collection/some.js"]},"hmr/node_modules/bar/main.js":{"index":5,"hash":"3G0vx4ybhjO0eYi3RqUP","parents":["hmr/msg.js"]},"hmr/msg.js":{"index":4,"hash":"hEZ4WNBLDLQAPHf44wL/","parents":["hmr/browser.js"]},"hmr/browser.js":{"index":3,"hash":"h01MPSTwx/xIR5G3Z45V","parents":[]},"node_modules/browserify-hmr/node_modules/lodash/internal/arrayEach.js":{"index":17,"hash":"eLxUBVsb8vpFbu0VN4KL","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/forEach.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/arraySome.js":{"index":20,"hash":"GxeJPxJj2jUg5TzV5gLv","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/equalArrays.js","node_modules/browserify-hmr/node_modules/lodash/collection/some.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/arrayMap.js":{"index":19,"hash":"xdr8c0JsUFapIHTuM5VE","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/map.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/arrayFilter.js":{"index":18,"hash":"BGunz0w1QzJXyqQSOdZb","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/filter.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/node_modules/isarray/index.js":{"index":122,"hash":"dKtews1S4sHvaZhZ+ceq","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/binary.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/node_modules/component-emitter/index.js":{"index":121,"hash":"0uL1LSa/mOj+Llu+HTZ7","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/node_modules/json3/lib/json3.js":{"index":123,"hash":"goq2b3BH90T1aswAsB3r","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseSome.js":{"index":39,"hash":"lCW5AtHn9X2vSuPgS8pk","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/some.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseEach.js":{"index":25,"hash":"Ji7NLCJhdzSBlpDI+qC3","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseSome.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMap.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseFilter.js","node_modules/browserify-hmr/node_modules/lodash/collection/forEach.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseMap.js":{"index":33,"hash":"ofv2jCE5QlahpynG4rkN","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/map.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isArrayLike.js":{"index":54,"hash":"76Awthz8ChTgjGk0JZ6Y","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseMap.js","node_modules/browserify-hmr/node_modules/lodash/internal/isIterateeCall.js","node_modules/browserify-hmr/node_modules/lodash/lang/isArguments.js","node_modules/browserify-hmr/node_modules/lodash/object/keys.js"]},"node_modules/browserify-hmr/node_modules/lodash/collection/map.js":{"index":14,"hash":"63n5x8GTiWPuxiZzm9TM","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js":{"index":23,"hash":"FDEmxoh1cXY/hddgPNGW","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/map.js","node_modules/browserify-hmr/node_modules/lodash/collection/filter.js","node_modules/browserify-hmr/node_modules/lodash/internal/createObjectMapper.js","node_modules/browserify-hmr/node_modules/lodash/collection/some.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseFilter.js":{"index":26,"hash":"yyvQag4hw8sItBFf3/9T","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/filter.js"]},"node_modules/browserify-hmr/node_modules/lodash/collection/filter.js":{"index":12,"hash":"XtU5zjCqSDlYcwOLUC13","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/createForOwn.js":{"index":46,"hash":"KJqijjvJO7d1nU17Sz3c","parents":["node_modules/browserify-hmr/node_modules/lodash/object/forOwn.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/bindCallback.js":{"index":41,"hash":"S6iy1I+53IEzDLSGuW0j","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/createForOwn.js","node_modules/browserify-hmr/node_modules/lodash/internal/createAssigner.js","node_modules/browserify-hmr/node_modules/lodash/internal/createForEach.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/createObjectMapper.js":{"index":47,"hash":"cp8s+Z6khiKdK5QCQ+Ms","parents":["node_modules/browserify-hmr/node_modules/lodash/object/mapValues.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseForOwn.js":{"index":28,"hash":"sOLmHH2OosmeW92YaLK/","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/createObjectMapper.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseEach.js","node_modules/browserify-hmr/node_modules/lodash/object/forOwn.js"]},"node_modules/browserify-hmr/node_modules/lodash/object/mapValues.js":{"index":74,"hash":"2HfAmVuaVGfc8pd5zIaC","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/assignWith.js":{"index":21,"hash":"aKBKyfIKqZsNOHAbJTAI","parents":["node_modules/browserify-hmr/node_modules/lodash/object/assign.js"]},"node_modules/browserify-hmr/node_modules/lodash/object/keys.js":{"index":72,"hash":"BbXGNIcfatSp32uWOBAV","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/assignWith.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseAssign.js","node_modules/browserify-hmr/node_modules/lodash/object/pairs.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseForOwn.js","node_modules/browserify-hmr/node_modules/lodash/internal/equalObjects.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/binary.js":{"index":118,"hash":"J0VrqJrphEcluGf0z9Pa","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/socket.io-parser/index.js":{"index":119,"hash":"7PrgORY9faIa3QvXeHjU","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/utility/identity.js":{"index":76,"hash":"A/cz5O4nnho2x2e5KIWS","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/bindCallback.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isLength.js":{"index":58,"hash":"DFIKI121VzeE+pBbx1Oa","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/isArrayLike.js","node_modules/browserify-hmr/node_modules/lodash/internal/createBaseEach.js","node_modules/browserify-hmr/node_modules/lodash/lang/isArray.js","node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js","node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js","node_modules/browserify-hmr/node_modules/lodash/lang/isTypedArray.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isObjectLike.js":{"index":59,"hash":"qEGnAWJNoAetOIJ7YKiV","parents":["node_modules/browserify-hmr/node_modules/lodash/lang/isNative.js","node_modules/browserify-hmr/node_modules/lodash/lang/isArray.js","node_modules/browserify-hmr/node_modules/lodash/lang/isArguments.js","node_modules/browserify-hmr/node_modules/lodash/lang/isTypedArray.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqual.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isIndex.js":{"index":55,"hash":"I8y5AsjL/lwDlORDOqqM","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/isIterateeCall.js","node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js","node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js"]},"node_modules/browserify-hmr/node_modules/lodash/lang/isObject.js":{"index":68,"hash":"Go+dTLFqO1KJN+uQLb8s","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/isIterateeCall.js","node_modules/browserify-hmr/node_modules/lodash/internal/toObject.js","node_modules/browserify-hmr/node_modules/lodash/internal/isStrictComparable.js","node_modules/browserify-hmr/node_modules/lodash/lang/isFunction.js","node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js","node_modules/browserify-hmr/node_modules/lodash/object/keys.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqual.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseCopy.js":{"index":24,"hash":"WvGi8IywM6u7ZNXvztwg","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseAssign.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseAssign.js":{"index":22,"hash":"6VX87YoeNgDvMUyiAc/7","parents":["node_modules/browserify-hmr/node_modules/lodash/object/assign.js"]},"node_modules/browserify-hmr/node_modules/lodash/function/restParam.js":{"index":16,"hash":"/RRH9MCtjArr1p3Qeh63","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/createAssigner.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/createAssigner.js":{"index":42,"hash":"X8R81jvRCofY1BnG+A/L","parents":["node_modules/browserify-hmr/node_modules/lodash/object/assign.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isIterateeCall.js":{"index":56,"hash":"dXMnNRevAizOBisKCEes","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/createAssigner.js","node_modules/browserify-hmr/node_modules/lodash/collection/some.js"]},"node_modules/browserify-hmr/node_modules/lodash/object/assign.js":{"index":70,"hash":"9WOhJBREl8AO9Hs6Cr+Q","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/node_modules/ms/index.js":{"index":88,"hash":"HanVKm5AkV6MOdHRAMCT","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/debug.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/debug.js":{"index":87,"hash":"yqdR7nJc7wxIHzFDNzG+","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/debug/browser.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/has-binary/node_modules/isarray/index.js":{"index":115,"hash":"dKtews1S4sHvaZhZ+ceq","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/has-binary/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/has-binary/index.js":{"index":114,"hash":"hp2NGHCJIje12xPX/FMJ","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/lib/socket.js":{"index":81,"hash":"dZhwrF36uFIGbDZMhss6","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js","node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/createForEach.js":{"index":45,"hash":"iJtWBCzx+bzzSLwlaaRv","parents":["node_modules/browserify-hmr/node_modules/lodash/collection/forEach.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/getLength.js":{"index":51,"hash":"UiZ6F0+nXZ0fiKckTqnM","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/isArrayLike.js","node_modules/browserify-hmr/node_modules/lodash/internal/createBaseEach.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseSlice.js":{"index":38,"hash":"OLgw9XVic1W0AKjehzHB","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/array/last.js":{"index":10,"hash":"3oXXa2idWbKySVLcq3os","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseProperty.js":{"index":36,"hash":"Yuk2tpof21q0Xl2sQg89","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/getLength.js","node_modules/browserify-hmr/node_modules/lodash/utility/property.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/toObject.js":{"index":62,"hash":"8f3eulB97DddBRdcU+7v","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/createBaseEach.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseIsMatch.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseGet.js","node_modules/browserify-hmr/node_modules/lodash/internal/isKey.js","node_modules/browserify-hmr/node_modules/lodash/internal/createBaseFor.js","node_modules/browserify-hmr/node_modules/lodash/object/pairs.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatches.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/createBaseEach.js":{"index":43,"hash":"+5X3Ztm78NNPr9vQZ7fB","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseEach.js"]},"node_modules/browserify-hmr/node_modules/lodash/collection/forEach.js":{"index":13,"hash":"0Lo1RNt18PMo/HAKbHEu","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseIsMatch.js":{"index":32,"hash":"EpuJzlg204aR35T4QKcS","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseMatches.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqual.js":{"index":30,"hash":"dBgoFXnhj9KH6oX3dQwa","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseIsMatch.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseGet.js":{"index":29,"hash":"H9EiMd3ullQpRkvooLgz","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/basePropertyDeep.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isKey.js":{"index":57,"hash":"lDpw5crcRmTRExTLVTKc","parents":["node_modules/browserify-hmr/node_modules/lodash/utility/property.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/isStrictComparable.js":{"index":60,"hash":"ofNP4/nFrz5Rkb3kGOhn","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/getMatchData.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/basePropertyDeep.js":{"index":37,"hash":"mqX1OyYdndJ183lyl/sn","parents":["node_modules/browserify-hmr/node_modules/lodash/utility/property.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/toPath.js":{"index":63,"hash":"faVQvsb+LSLI4uaMgtrQ","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/basePropertyDeep.js","node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js"]},"node_modules/browserify-hmr/node_modules/lodash/utility/property.js":{"index":77,"hash":"7IoOI/uGZCxbcY23uQDK","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/createBaseFor.js":{"index":44,"hash":"9RWlFaBOuelvwgkhYgPG","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseFor.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseFor.js":{"index":27,"hash":"NGxcZ0n01+w2G1PzyBlY","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseForOwn.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseToString.js":{"index":40,"hash":"ABFQFf14pRECi3sw8oKV","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/toPath.js"]},"node_modules/browserify-hmr/node_modules/lodash/object/pairs.js":{"index":75,"hash":"x6Ilwx8encvg/BW5API2","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/getMatchData.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/getMatchData.js":{"index":52,"hash":"n0PHWhNs6YZ+DzgYMHPx","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseMatches.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseMatches.js":{"index":34,"hash":"Cwj5GSiQv9/E8nSFBoX2","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js"]},"node_modules/browserify-hmr/node_modules/lodash/lang/isFunction.js":{"index":66,"hash":"xkfzrZNZPGGOIf0kE8Y9","parents":["node_modules/browserify-hmr/node_modules/lodash/lang/isNative.js"]},"node_modules/browserify-hmr/node_modules/lodash/lang/isNative.js":{"index":67,"hash":"2rstaALy1DW0JSDdijps","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/getNative.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/getNative.js":{"index":53,"hash":"7GRZ7115BSuoc/1bdaBK","parents":["node_modules/browserify-hmr/node_modules/lodash/lang/isArray.js","node_modules/browserify-hmr/node_modules/lodash/object/keys.js"]},"node_modules/browserify-hmr/node_modules/lodash/lang/isArguments.js":{"index":64,"hash":"xQ4mqbsKQMCmtsPbfQc6","parents":["node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js","node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js"]},"node_modules/browserify-hmr/node_modules/lodash/object/keysIn.js":{"index":73,"hash":"8POZiGR1fRHso579G46Z","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/shimKeys.js":{"index":61,"hash":"oO4aKopmxRfPxyKgRX9F","parents":["node_modules/browserify-hmr/node_modules/lodash/object/keys.js"]},"node_modules/browserify-hmr/node_modules/lodash/object/forOwn.js":{"index":71,"hash":"LZ77PzuJW/wlgVPdvlGc","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/component-emitter/index.js":{"index":99,"hash":"0uL1LSa/mOj+Llu+HTZ7","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transport.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/equalByTag.js":{"index":49,"hash":"+y++gesJpPvyM+2E8aNB","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/parsejson/index.js":{"index":111,"hash":"U4Hij6X0PLgh6NWAowAj","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/parseqs/index.js":{"index":112,"hash":"FI4tRELwI5Itz+ckwR+m","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/keys.js":{"index":102,"hash":"oFyKNTA0twlyQVhVzp9n","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/equalArrays.js":{"index":48,"hash":"OBJL6vuaOotu5flUeCnv","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/equalObjects.js":{"index":50,"hash":"44Iy49kDcaAZsykEdaH3","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js"]},"node_modules/browserify-hmr/node_modules/lodash/lang/isTypedArray.js":{"index":69,"hash":"aVeZyIFGadrEh7EsaDRu","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqualDeep.js":{"index":31,"hash":"ltZZaMHmzp6d9jBltV3Y","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseIsEqual.js"]},"node_modules/browserify-hmr/node_modules/lodash/internal/baseMatchesProperty.js":{"index":35,"hash":"OudnSoeq2A4ql5lg51kc","parents":["node_modules/browserify-hmr/node_modules/lodash/internal/baseCallback.js"]},"node_modules/browserify-hmr/node_modules/lodash/collection/some.js":{"index":15,"hash":"9JyJFfdCx56pmR6fwM9q","parents":["node_modules/browserify-hmr/inc/index.js"]},"node_modules/browserify-hmr/inc/index.js":{"index":7,"hash":"azyGnExX2uVlPI7oM92b","parents":[]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transport.js":{"index":92,"hash":"qAS1jC8gVTG4yb/AanoB","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js":{"index":101,"hash":"EM3gYOYvdJIfmifDteQr","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transport.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/utf8/utf8.js":{"index":109,"hash":"6nsqanfBwcbxn70os/89","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/arraybuffer.slice/index.js":{"index":104,"hash":"RSb5Zx9CgX3adjzbvf/k","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/after/index.js":{"index":103,"hash":"NzPfXWECmM8rW/6fdkcj","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/blob/index.js":{"index":106,"hash":"ke/U4WsBcVbHUHyisAju","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js":{"index":105,"hash":"dW6cnktjBIyZ6bv9vRp2","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"../../software/node-v4.1.1-linux-x64/lib/node_modules/watchify/node_modules/browserify/node_modules/browser-resolve/empty.js":{"index":1,"hash":"47DEQpj8HBSa+/TImW+5","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/has-cors/index.js":{"index":110,"hash":"HwTb4UF/S089ZYA8hrRl","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/xmlhttprequest.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/xmlhttprequest.js":{"index":98,"hash":"us0FsN5s7hiT3hqVV5lx","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/has-binary/node_modules/isarray/index.js":{"index":108,"hash":"dKtews1S4sHvaZhZ+ceq","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/has-binary/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/node_modules/has-binary/index.js":{"index":107,"hash":"ExAMjX15DoBnR3NdUCdy","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/engine.io-parser/lib/browser.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-jsonp.js":{"index":94,"hash":"Cv+hXI/nrusYLIPHy7R0","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js":{"index":96,"hash":"vdgStJPJzZrXTQesqN8z","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-jsonp.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/component-inherit/index.js":{"index":100,"hash":"T0Fqch4d4akvlr8bh7lc","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-jsonp.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/node_modules/yeast/index.js":{"index":113,"hash":"ZM3+5w4l/D2f6x7svySF","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js","node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/websocket.js":{"index":97,"hash":"PQcD28J1FMiKrNz6oIV4","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/polling-xhr.js":{"index":95,"hash":"/FAmk2MLTFJ87VrSzPfb","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/transports/index.js":{"index":93,"hash":"PQYkA60+4pmT9I796Swj","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/socket.js":{"index":91,"hash":"2zIsIgGgjV3axN0b19I+","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/lib/index.js":{"index":90,"hash":"G6QYuSNu0EcS+G5tR9NE","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/node_modules/engine.io-client/index.js":{"index":89,"hash":"HQau4MkD4lAynB9tt0Wl","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/lib/manager.js":{"index":79,"hash":"ycazfyz0LQGPtd/P1Ih9","parents":["node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js"]},"node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js":{"index":78,"hash":"6O21Z/SJToLoAyfVkS1+","parents":[]}};
  var originalEntries = ["/home/taox/workspace/browserify-practice/hmr"];
  var updateUrl = null;
  var updateMode = "websocket";
  var supportModes = ["none","websocket"];
  var ignoreUnaccepted = true;
  var updateCacheBust = false;
  var bundleKey = "websocket:null";
  var sioPath = "./node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js";
  var incPath = "./node_modules/browserify-hmr/inc/index.js";

  if (!global._hmr) {
    try {
      Object.defineProperty(global, '_hmr', {value: {}});
    } catch(e) {
      global._hmr = {};
    }
  }

  if (!Object.prototype.hasOwnProperty.call(global._hmr, bundleKey)) {
    // Temporary hack so requiring modules works before the _hmr values are
    // correctly initialized.
    global._hmr[bundleKey] = {initModule: function(){}};
  }

  var main = require(incPath);
  var isFirstRun = main(
    moduleDefs, cachedModules, moduleMeta, updateUrl,
    updateMode, supportModes, ignoreUnaccepted, updateCacheBust, bundleKey,
    sioPath ? require(sioPath) : null,
    typeof __filename !== 'undefined' && __filename,
    typeof __dirname !== 'undefined' && __dirname
  );
  if (isFirstRun) {
    for (var i=0, len=originalEntries.length; i<len; i++) {
      require(originalEntries[i]);
    }
  }
}).call(
  this,
  typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},
  arguments[3], arguments[4], arguments[5], arguments[6]
);

},{"./node_modules/browserify-hmr/inc/index.js":7,"./node_modules/browserify-hmr/node_modules/socket.io-client/lib/index.js":78,"/home/taox/workspace/browserify-practice/hmr":3}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NvZnR3YXJlL25vZGUtdjQuMS4xLWxpbnV4LXg2NC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9zb2Z0d2FyZS9ub2RlLXY0LjEuMS1saW51eC14NjQvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwiaG1yL2Jyb3dzZXIuanMiLCJobXIvbXNnLmpzIiwiaG1yL25vZGVfbW9kdWxlcy9iYXIvbWFpbi5qcyIsImhtci9ub2RlX21vZHVsZXMvZm9vL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvaW5jL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL2xpYi9oYXMuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbGliL3N0ci1zZXQuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9hcnJheS9sYXN0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvYXJyYXkvemlwT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9maWx0ZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL2ZvckVhY2guanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL21hcC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vc29tZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2Z1bmN0aW9uL3Jlc3RQYXJhbS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2FycmF5RWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2FycmF5RmlsdGVyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYXJyYXlNYXAuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9hcnJheVNvbWUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9hc3NpZ25XaXRoLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VDYWxsYmFjay5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VDb3B5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUVhY2guanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlRmlsdGVyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUZvci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VGb3JPd24uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlR2V0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNFcXVhbERlZXAuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNNYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXAuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlcy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXRjaGVzUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlUHJvcGVydHlEZWVwLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVNsaWNlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVNvbWUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlVG9TdHJpbmcuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iaW5kQ2FsbGJhY2suanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVBc3NpZ25lci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUJhc2VFYWNoLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQmFzZUZvci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUZvckVhY2guanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVGb3JPd24uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVPYmplY3RNYXBwZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9lcXVhbEFycmF5cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2VxdWFsQnlUYWcuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9lcXVhbE9iamVjdHMuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXRMZW5ndGguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXRNYXRjaERhdGEuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXROYXRpdmUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0FycmF5TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzSW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzS2V5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNMZW5ndGguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc09iamVjdExpa2UuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc1N0cmljdENvbXBhcmFibGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9zaGltS2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL3RvT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvdG9QYXRoLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc0FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNGdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNOYXRpdmUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc1R5cGVkQXJyYXkuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2Zvck93bi5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2tleXNJbi5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9tYXBWYWx1ZXMuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvcGFpcnMuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC91dGlsaXR5L2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvdXRpbGl0eS9wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL29uLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9zb2NrZXQuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL3VybC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvYmFja28yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtYmluZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2RlYnVnL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2RlYnVnL2RlYnVnLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9kZWJ1Zy9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi9zb2NrZXQuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9wb2xsaW5nLWpzb25wLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3BvbGxpbmcteGhyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3BvbGxpbmcuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvd2Vic29ja2V0LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi94bWxodHRwcmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1pbmhlcml0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9hZnRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLXBhcnNlci9ub2RlX21vZHVsZXMvYXJyYXlidWZmZXIuc2xpY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1wYXJzZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1hcnJheWJ1ZmZlci9saWIvYmFzZTY0LWFycmF5YnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9ibG9iL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9oYXMtYmluYXJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9oYXMtYmluYXJ5L25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy91dGY4L3V0ZjguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2hhcy1jb3JzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9wYXJzZWpzb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3BhcnNlcXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3llYXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9oYXMtYmluYXJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9oYXMtYmluYXJ5L25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9pbmRleG9mL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9wYXJzZXVyaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvc29ja2V0LmlvLXBhcnNlci9iaW5hcnkuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvaXMtYnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvc29ja2V0LmlvLXBhcnNlci9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvc29ja2V0LmlvLXBhcnNlci9ub2RlX21vZHVsZXMvanNvbjMvbGliL2pzb24zLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy90by1hcnJheS9pbmRleC5qcyIsIl9faG1yX21hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DOzs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUQ7Ozs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBLCtEOzs7Ozs7QUNIQTtBQUNBO0FBQ0E7QUFDQSw0RDs7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDbHBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzVpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzVIQTtBQUNBOzs7Ozs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3h0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDNVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2xsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDMURBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDM0RBO0FBQ0E7QUFDQTs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEU7Ozs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQy9ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNuS0E7QUFDQTtBQUNBOzs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN0NEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiX2htcltcIndlYnNvY2tldDpudWxsXCJdLmluaXRNb2R1bGUoXCIuLi8uLi9zb2Z0d2FyZS9ub2RlLXY0LjEuMS1saW51eC14NjQvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzXCIsIG1vZHVsZSk7XG4oZnVuY3Rpb24oKXtcblxufSkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJYWDA9IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHRhb3ggb24gMTYtMi0xNC5cbiAqL1xuZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCA9IHJlcXVpcmUoJy4vbXNnLmpzJyk7XG5cbmlmIChtb2R1bGUuaG90KSBtb2R1bGUuaG90LmFjY2VwdCgpIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHRhb3ggb24gMTYtMi0xNC5cbiAqL1xudmFyIGZvbyA9IHJlcXVpcmUoJ2ZvbycpO1xudmFyIGJhciA9IHJlcXVpcmUoJ2JhcicpO1xubW9kdWxlLmV4cG9ydHMgPSAnaGV5LHh1IHRhb++8jOS9oOWlveWViu+8gScrZm9vKDUpKyc6JytiYXIoJ0EnKTsiLCJcbnZhciBzcmMgPSBcIkEgQiBDXCI7XG4vL2NvbnNvbGUubG9nKHNyYyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7IHJldHVybiBzcmMucmVwbGFjZSh4LCAnenp6JykgfTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgdGFveCBvbiAxNi0yLTE0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuKSB7IHJldHVybiBuICogMjIyKydicm93c2VyIDEnIH0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXMgPSByZXF1aXJlKCcuLi9saWIvaGFzJyk7XG52YXIgU3RyU2V0ID0gcmVxdWlyZSgnLi4vbGliL3N0ci1zZXQnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnbG9kYXNoL2NvbGxlY3Rpb24vZm9yRWFjaCcpO1xudmFyIHNvbWUgPSByZXF1aXJlKCdsb2Rhc2gvY29sbGVjdGlvbi9zb21lJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnbG9kYXNoL2NvbGxlY3Rpb24vbWFwJyk7XG52YXIgZmlsdGVyID0gcmVxdWlyZSgnbG9kYXNoL2NvbGxlY3Rpb24vZmlsdGVyJyk7XG52YXIgemlwT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2FycmF5L3ppcE9iamVjdCcpO1xudmFyIGZvck93biA9IHJlcXVpcmUoJ2xvZGFzaC9vYmplY3QvZm9yT3duJyk7XG52YXIgbWFwVmFsdWVzID0gcmVxdWlyZSgnbG9kYXNoL29iamVjdC9tYXBWYWx1ZXMnKTtcbnZhciBhc3NpZ24gPSByZXF1aXJlKCdsb2Rhc2gvb2JqZWN0L2Fzc2lnbicpO1xuXG5mdW5jdGlvbiBlbWl0RXJyb3IoZXJyKSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgZXJyO1xuICB9LCAwKTtcbn1cblxuZnVuY3Rpb24gbWFrZU1vZHVsZUluZGV4ZXNUb05hbWVzKG1vZHVsZU1ldGEpIHtcbiAgdmFyIG1vZHVsZUluZGV4ZXNUb05hbWVzID0ge307XG4gIGZvck93bihtb2R1bGVNZXRhLCBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgIG1vZHVsZUluZGV4ZXNUb05hbWVzW3ZhbHVlLmluZGV4XSA9IG5hbWU7XG4gIH0pO1xuICByZXR1cm4gbW9kdWxlSW5kZXhlc1RvTmFtZXM7XG59XG5cbnZhciBjb25zb2xlID0gZ2xvYmFsLmNvbnNvbGUgPyBnbG9iYWwuY29uc29sZSA6IHtcbiAgZXJyb3I6IGZ1bmN0aW9uKCl7fSwgbG9nOiBmdW5jdGlvbigpIHt9XG59O1xuXG5mdW5jdGlvbiBtYWluKFxuICBtb2R1bGVEZWZzLCBjYWNoZWRNb2R1bGVzLCBtb2R1bGVNZXRhLCB1cGRhdGVVcmwsXG4gIHVwZGF0ZU1vZGUsIHN1cHBvcnRNb2RlcywgaWdub3JlVW5hY2NlcHRlZCwgdXBkYXRlQ2FjaGVCdXN0LCBidW5kbGVLZXksXG4gIHNvY2tldGlvLFxuICBidW5kbGVfX2ZpbGVuYW1lLCBidW5kbGVfX2Rpcm5hbWVcbikge1xuICB2YXIgbW9kdWxlSW5kZXhlc1RvTmFtZXMgPSBtYWtlTW9kdWxlSW5kZXhlc1RvTmFtZXMobW9kdWxlTWV0YSk7XG5cbiAgdmFyIHNvY2tldDtcbiAgdmFyIG5hbWUsIGksIGxlbjtcblxuICBpZiAoIWdsb2JhbC5faG1yW2J1bmRsZUtleV0uc2V0U3RhdHVzKSB7XG4gICAgdmFyIHJ1bnRpbWVNb2R1bGVJbmZvID0ge307XG4gICAgdmFyIGNyZWF0ZUluZm9FbnRyeSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdID0ge1xuICAgICAgICBpbmRleDogbW9kdWxlTWV0YVtuYW1lXS5pbmRleCxcbiAgICAgICAgaGFzaDogbW9kdWxlTWV0YVtuYW1lXS5oYXNoLFxuICAgICAgICBwYXJlbnRzOiBuZXcgU3RyU2V0KG1vZHVsZU1ldGFbbmFtZV0ucGFyZW50cyksXG4gICAgICAgIG1vZHVsZTogbnVsbCxcbiAgICAgICAgZGlzcG9zZURhdGE6IG51bGwsXG4gICAgICAgIGFjY2VwdGVyczogbmV3IFN0clNldCgpLFxuICAgICAgICBhY2NlcHRpbmc6IG5ldyBTdHJTZXQoKSxcbiAgICAgICAgZGVjbGluZXJzOiBuZXcgU3RyU2V0KCksXG4gICAgICAgIGRlY2xpbmluZzogbmV3IFN0clNldCgpLFxuICAgICAgICBzZWxmQWNjZXB0Q2JzOiBbXSwgLy8gbWF5IGNvbnRhaW4gbnVsbC4gbm9uemVybyBsZW5ndGggbWVhbnMgbW9kdWxlIGlzIHNlbGYtYWNjZXB0aW5nXG4gICAgICAgIGRpc3Bvc2VIYW5kbGVyczogW11cbiAgICAgIH07XG4gICAgfTtcbiAgICBmb3IgKG5hbWUgaW4gbW9kdWxlTWV0YSkge1xuICAgICAgaWYgKGhhcyhtb2R1bGVNZXRhLCBuYW1lKSkge1xuICAgICAgICBjcmVhdGVJbmZvRW50cnkobmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9hZGVycyB0YWtlIGEgY2FsbGJhY2soZXJyLCBkYXRhKS4gVGhleSBtYXkgZ2l2ZSBudWxsIGZvciBkYXRhIGlmIHRoZXlcbiAgICAvLyBrbm93IHRoZXJlIGhhc24ndCBiZWVuIGFuIHVwZGF0ZS5cbiAgICB2YXIgZmlsZVJlbG9hZGVycyA9IHtcbiAgICAgIGZzOiBmdW5jdGlvbihjYikge1xuICAgICAgICB2YXIgZnM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZnMgPSByZXF1aXJlKCdmJysncycpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBjYihlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZnMucmVhZEZpbGUobG9jYWxIbXIudXBkYXRlVXJsIHx8IGJ1bmRsZV9fZmlsZW5hbWUsICd1dGY4JywgY2IpO1xuICAgICAgfSxcbiAgICAgIGFqYXg6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgIHZhciB4aHI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgIGNiKGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIGNiKG51bGwsIHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2IobmV3IEVycm9yKFwiUmVxdWVzdCBoYWQgcmVzcG9uc2UgXCIreGhyLnN0YXR1cykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHVybCA9IGxvY2FsSG1yLnVwZGF0ZVVybCArICh1cGRhdGVDYWNoZUJ1c3Q/Jz9fdj0nKygrbmV3IERhdGUoKSk6JycpO1xuICAgICAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGxhc3RTY3JpcHREYXRhID0gbnVsbDtcblxuICAgIC8vIGNiKGVyciwgZXhwZWN0VXBkYXRlKVxuICAgIHZhciByZWxvYWRBbmRSdW5TY3JpcHQgPSBmdW5jdGlvbihjYikge1xuICAgICAgaWYgKCFoYXMoZmlsZVJlbG9hZGVycywgbG9jYWxIbXIudXBkYXRlTW9kZSkpIHtcbiAgICAgICAgY2IobmV3IEVycm9yKFwidXBkYXRlTW9kZSBcIitsb2NhbEhtci51cGRhdGVNb2RlK1wiIG5vdCBpbXBsZW1lbnRlZFwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciByZWxvYWRlciA9IGZpbGVSZWxvYWRlcnNbbG9jYWxIbXIudXBkYXRlTW9kZV07XG4gICAgICByZWxvYWRlcihmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhZGF0YSB8fCBsYXN0U2NyaXB0RGF0YSA9PT0gZGF0YSkge1xuICAgICAgICAgIGNiKGVyciwgZmFsc2UpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsYXN0U2NyaXB0RGF0YSA9IGRhdGE7XG4gICAgICAgIGxvY2FsSG1yLm5ld0xvYWQgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vanNoaW50IGV2aWw6dHJ1ZVxuICAgICAgICAgIGlmIChidW5kbGVfX2ZpbGVuYW1lIHx8IGJ1bmRsZV9fZGlybmFtZSkge1xuICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKCdyZXF1aXJlJywgJ19fZmlsZW5hbWUnLCAnX19kaXJuYW1lJywgZGF0YSkocmVxdWlyZSwgYnVuZGxlX19maWxlbmFtZSwgYnVuZGxlX19kaXJuYW1lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKCdyZXF1aXJlJywgZGF0YSkocmVxdWlyZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHJ1bm5pbmcgdGhlIGZpbGUgc2V0cyBfaG1yLm5ld0xvYWRcbiAgICAgICAgfSBjYXRjaCAoZXJyMikge1xuICAgICAgICAgIGxvY2FsSG1yLm5ld0xvYWQgPSBudWxsO1xuICAgICAgICAgIGNiKGVycjIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvY2FsSG1yLm5ld0xvYWQpIHtcbiAgICAgICAgICBjYihuZXcgRXJyb3IoXCJSZWxvYWRlZCBzY3JpcHQgZGlkIG5vdCBzZXQgaG90IG1vZHVsZSByZWxvYWQgZGF0YVwiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNiKG51bGwsIHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBnZXRPdXRkYXRlZE1vZHVsZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvdXRkYXRlZCA9IFtdO1xuICAgICAgdmFyIG5hbWU7XG4gICAgICAvLyBhZGQgY2hhbmdlZCBhbmQgZGVsZXRlZCBtb2R1bGVzXG4gICAgICBmb3IgKG5hbWUgaW4gcnVudGltZU1vZHVsZUluZm8pIHtcbiAgICAgICAgaWYgKGhhcyhydW50aW1lTW9kdWxlSW5mbywgbmFtZSkpIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhaGFzKGxvY2FsSG1yLm5ld0xvYWQubW9kdWxlTWV0YSwgbmFtZSkgfHxcbiAgICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmhhc2ggIT09IGxvY2FsSG1yLm5ld0xvYWQubW9kdWxlTWV0YVtuYW1lXS5oYXNoXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBvdXRkYXRlZC5wdXNoKG5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYWRkIGJyYW5kIG5ldyBtb2R1bGVzXG4gICAgICBmb3IgKG5hbWUgaW4gbG9jYWxIbXIubmV3TG9hZC5tb2R1bGVNZXRhKSB7XG4gICAgICAgIGlmIChoYXMobG9jYWxIbXIubmV3TG9hZC5tb2R1bGVNZXRhLCBuYW1lKSkge1xuICAgICAgICAgIGlmICghaGFzKHJ1bnRpbWVNb2R1bGVJbmZvLCBuYW1lKSkge1xuICAgICAgICAgICAgb3V0ZGF0ZWQucHVzaChuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFkZCBtb2R1bGVzIHRoYXQgYXJlIG5vbi1hY2NlcHRpbmcvZGVjbGluaW5nIHBhcmVudHMgb2Ygb3V0ZGF0ZWQgbW9kdWxlcy5cbiAgICAgIC8vIGltcG9ydGFudDogaWYgb3V0ZGF0ZWQgaGFzIG5ldyBlbGVtZW50cyBhZGRlZCBkdXJpbmcgdGhlIGxvb3AsXG4gICAgICAvLyB0aGVuIHdlIGl0ZXJhdGUgb3ZlciB0aGVtIHRvby5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxvdXRkYXRlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICBuYW1lID0gb3V0ZGF0ZWRbaV07XG4gICAgICAgIC8vanNoaW50IC1XMDgzXG4gICAgICAgIGlmIChoYXMocnVudGltZU1vZHVsZUluZm8sIG5hbWUpKSB7XG4gICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bbmFtZV0ucGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcmVudE5hbWUpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bbmFtZV0uc2VsZkFjY2VwdENicy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAgICAgIXJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmFjY2VwdGVycy5oYXMocGFyZW50TmFtZSkgJiZcbiAgICAgICAgICAgICAgIXJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmRlY2xpbmVycy5oYXMocGFyZW50TmFtZSkgJiZcbiAgICAgICAgICAgICAgb3V0ZGF0ZWQuaW5kZXhPZihwYXJlbnROYW1lKSA9PT0gLTFcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBvdXRkYXRlZC5wdXNoKHBhcmVudE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0ZGF0ZWQ7XG4gICAgfTtcblxuICAgIHZhciBtb2R1bGVIb3RDaGVjayA9IGZ1bmN0aW9uKGF1dG9BcHBseSwgY2IpIHtcbiAgICAgIGlmICh0eXBlb2YgYXV0b0FwcGx5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNiID0gYXV0b0FwcGx5O1xuICAgICAgICBhdXRvQXBwbHkgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghY2IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibW9kdWxlLmhvdC5jaGVjayBjYWxsYmFjayBwYXJhbWV0ZXIgcmVxdWlyZWRcIik7XG4gICAgICB9XG4gICAgICBpZiAobG9jYWxIbXIuc3RhdHVzICE9PSAnaWRsZScpIHtcbiAgICAgICAgY2IobmV3IEVycm9yKFwibW9kdWxlLmhvdC5jaGVjayBjYW4gb25seSBiZSBjYWxsZWQgd2hpbGUgc3RhdHVzIGlzIGlkbGVcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodXBkYXRlTW9kZSA9PT0gJ3dlYnNvY2tldCcpIHtcbiAgICAgICAgY2IobmV3IEVycm9yKFwibW9kdWxlLmhvdC5jaGVjayBjYW4ndCBiZSB1c2VkIHdoZW4gdXBkYXRlIG1vZGUgaXMgd2Vic29ja2V0XCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2NhbEhtci5zZXRTdGF0dXMoJ2NoZWNrJyk7XG4gICAgICByZWxvYWRBbmRSdW5TY3JpcHQoZnVuY3Rpb24oZXJyLCBleHBlY3RVcGRhdGUpIHtcbiAgICAgICAgaWYgKGVyciB8fCAhZXhwZWN0VXBkYXRlKSB7XG4gICAgICAgICAgbG9jYWxIbXIuc2V0U3RhdHVzKCdpZGxlJyk7XG4gICAgICAgICAgY2IoZXJyLCBudWxsKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG91dGRhdGVkTW9kdWxlcyA9IGdldE91dGRhdGVkTW9kdWxlcygpO1xuICAgICAgICBpZiAob3V0ZGF0ZWRNb2R1bGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGxvY2FsSG1yLnNldFN0YXR1cygnaWRsZScpO1xuICAgICAgICAgIGNiKG51bGwsIG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2FsSG1yLnNldFN0YXR1cygncmVhZHknKTtcbiAgICAgICAgICBpZiAoYXV0b0FwcGx5KSB7XG4gICAgICAgICAgICBtb2R1bGVIb3RBcHBseShhdXRvQXBwbHksIGNiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2IobnVsbCwgb3V0ZGF0ZWRNb2R1bGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgbW9kdWxlSG90QXBwbHkgPSBmdW5jdGlvbihvcHRpb25zLCBjYikge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNiID0gb3B0aW9ucztcbiAgICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoIWNiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm1vZHVsZS5ob3QuYXBwbHkgY2FsbGJhY2sgcGFyYW1ldGVyIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuICAgICAgdmFyIGlnbm9yZVVuYWNjZXB0ZWQgPSAhIShvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlVW5hY2NlcHRlZCk7XG4gICAgICBpZiAobG9jYWxIbXIuc3RhdHVzICE9PSAncmVhZHknKSB7XG4gICAgICAgIGNiKG5ldyBFcnJvcihcIm1vZHVsZS5ob3QuYXBwbHkgY2FuIG9ubHkgYmUgY2FsbGVkIHdoaWxlIHN0YXR1cyBpcyByZWFkeVwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dGRhdGVkTW9kdWxlcyA9IGdldE91dGRhdGVkTW9kdWxlcygpO1xuICAgICAgdmFyIGlzVmFsdWVOb3RJbk91dGRhdGVkTW9kdWxlcyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBvdXRkYXRlZE1vZHVsZXMuaW5kZXhPZih2YWx1ZSkgPT09IC0xO1xuICAgICAgfTtcbiAgICAgIHZhciBpLCBsZW47XG4gICAgICB2YXIgYWNjZXB0ZWRVcGRhdGVzID0gZmlsdGVyKG91dGRhdGVkTW9kdWxlcywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZiAoaGFzKHJ1bnRpbWVNb2R1bGVJbmZvLCBuYW1lKSkge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmRlY2xpbmVycy5zb21lKGlzVmFsdWVOb3RJbk91dGRhdGVkTW9kdWxlcykgfHxcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bbmFtZV0uYWNjZXB0ZXJzLnNpemUoKSA9PT0gMCAmJlxuICAgICAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1tuYW1lXS5zZWxmQWNjZXB0Q2JzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1tuYW1lXS5wYXJlbnRzLnNvbWUoaXNWYWx1ZU5vdEluT3V0ZGF0ZWRNb2R1bGVzKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgaWYgKCFpZ25vcmVVbmFjY2VwdGVkICYmIG91dGRhdGVkTW9kdWxlcy5sZW5ndGggIT09IGFjY2VwdGVkVXBkYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgbG9jYWxIbXIuc2V0U3RhdHVzKCdpZGxlJyk7XG4gICAgICAgIGNiKG5ldyBFcnJvcihcIlNvbWUgdXBkYXRlcyB3ZXJlIGRlY2xpbmVkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGFuO1xuICAgICAgZm9yIChpPTAsIGxlbj1hY2NlcHRlZFVwZGF0ZXMubGVuZ3RoOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgIGFuID0gYWNjZXB0ZWRVcGRhdGVzW2ldO1xuICAgICAgICBpZiAoaGFzKHJ1bnRpbWVNb2R1bGVJbmZvLCBhbikpIHtcbiAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1thbl0uZGlzcG9zZURhdGEgPSB7fTtcbiAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8cnVudGltZU1vZHVsZUluZm9bYW5dLmRpc3Bvc2VIYW5kbGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bYW5dLmRpc3Bvc2VIYW5kbGVyc1tqXS5jYWxsKG51bGwsIHJ1bnRpbWVNb2R1bGVJbmZvW2FuXS5kaXNwb3NlRGF0YSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgbG9jYWxIbXIuc2V0U3RhdHVzKCdpZGxlJyk7XG4gICAgICAgICAgICAgIGNiKGUgfHwgbmV3IEVycm9yKFwiVW5rbm93biBkaXNwb3NlIGNhbGxiYWNrIGVycm9yXCIpKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHNlbGZBY2NlcHRlcnMgPSBbXTtcbiAgICAgIGZvciAoaT0wLCBsZW49YWNjZXB0ZWRVcGRhdGVzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgICBhbiA9IGFjY2VwdGVkVXBkYXRlc1tpXTtcbiAgICAgICAgLy9qc2hpbnQgLVcwODNcbiAgICAgICAgaWYgKCFoYXMocnVudGltZU1vZHVsZUluZm8sIGFuKSkge1xuICAgICAgICAgIC8vIG5ldyBtb2R1bGVzXG4gICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bYW5dID0ge1xuICAgICAgICAgICAgaW5kZXg6IGFuLFxuICAgICAgICAgICAgaGFzaDogbG9jYWxIbXIubmV3TG9hZC5tb2R1bGVNZXRhW2FuXS5oYXNoLFxuICAgICAgICAgICAgcGFyZW50czogbmV3IFN0clNldChsb2NhbEhtci5uZXdMb2FkLm1vZHVsZU1ldGFbYW5dLnBhcmVudHMpLFxuICAgICAgICAgICAgbW9kdWxlOiBudWxsLFxuICAgICAgICAgICAgZGlzcG9zZURhdGE6IG51bGwsXG4gICAgICAgICAgICBhY2NlcHRlcnM6IG5ldyBTdHJTZXQoKSxcbiAgICAgICAgICAgIGFjY2VwdGluZzogbmV3IFN0clNldCgpLFxuICAgICAgICAgICAgZGVjbGluZXJzOiBuZXcgU3RyU2V0KCksXG4gICAgICAgICAgICBkZWNsaW5pbmc6IG5ldyBTdHJTZXQoKSxcbiAgICAgICAgICAgIHNlbGZBY2NlcHRDYnM6IFtdLFxuICAgICAgICAgICAgZGlzcG9zZUhhbmRsZXJzOiBbXVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoIWhhcyhsb2NhbEhtci5uZXdMb2FkLm1vZHVsZU1ldGEsIGFuKSkge1xuICAgICAgICAgIC8vIHJlbW92ZWQgbW9kdWxlc1xuICAgICAgICAgIGRlbGV0ZSBjYWNoZWRNb2R1bGVzW3J1bnRpbWVNb2R1bGVJbmZvW2FuXS5pbmRleF07XG4gICAgICAgICAgZGVsZXRlIHJ1bnRpbWVNb2R1bGVJbmZvW2FuXTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB1cGRhdGVkIG1vZHVsZXNcbiAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1thbl0uaGFzaCA9IGxvY2FsSG1yLm5ld0xvYWQubW9kdWxlTWV0YVthbl0uaGFzaDtcbiAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1thbl0ucGFyZW50cyA9IG5ldyBTdHJTZXQobG9jYWxIbXIubmV3TG9hZC5tb2R1bGVNZXRhW2FuXS5wYXJlbnRzKTtcbiAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1thbl0ubW9kdWxlID0gbnVsbDtcbiAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1thbl0uYWNjZXB0aW5nLmZvckVhY2goZnVuY3Rpb24oYWNjZXB0ZWQpIHtcbiAgICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW2FjY2VwdGVkXS5hY2NlcHRlcnMuZGVsKGFuKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1thbl0uYWNjZXB0aW5nID0gbmV3IFN0clNldCgpO1xuICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW2FuXS5kZWNsaW5pbmcuZm9yRWFjaChmdW5jdGlvbihhY2NlcHRlZCkge1xuICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bYWNjZXB0ZWRdLmRlY2xpbmVycy5kZWwoYW4pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW2FuXS5kZWNsaW5pbmcgPSBuZXcgU3RyU2V0KCk7XG4gICAgICAgICAgZm9yRWFjaChydW50aW1lTW9kdWxlSW5mb1thbl0uc2VsZkFjY2VwdENicywgZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgICAgIHNlbGZBY2NlcHRlcnMucHVzaCh7bmFtZTogYW4sIGNiOiBjYn0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW2FuXS5zZWxmQWNjZXB0Q2JzID0gW107XG4gICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bYW5dLmRpc3Bvc2VIYW5kbGVycyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgbW9kdWxlRGVmc1tydW50aW1lTW9kdWxlSW5mb1thbl0uaW5kZXhdID0gW1xuICAgICAgICAgIC8vIG1vZHVsZSBmdW5jdGlvblxuICAgICAgICAgIGxvY2FsSG1yLm5ld0xvYWQubW9kdWxlRGVmc1tsb2NhbEhtci5uZXdMb2FkLm1vZHVsZU1ldGFbYW5dLmluZGV4XVswXSxcbiAgICAgICAgICAvLyBtb2R1bGUgZGVwc1xuICAgICAgICAgIG1hcFZhbHVlcyhsb2NhbEhtci5uZXdMb2FkLm1vZHVsZURlZnNbbG9jYWxIbXIubmV3TG9hZC5tb2R1bGVNZXRhW2FuXS5pbmRleF1bMV0sIGZ1bmN0aW9uKGRlcEluZGV4LCBkZXBSZWYpIHtcbiAgICAgICAgICAgIHZhciBkZXBOYW1lID0gbG9jYWxIbXIubmV3TG9hZC5tb2R1bGVJbmRleGVzVG9OYW1lc1tkZXBJbmRleF07XG4gICAgICAgICAgICBpZiAoaGFzKGxvY2FsSG1yLnJ1bnRpbWVNb2R1bGVJbmZvLCBkZXBOYW1lKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbG9jYWxIbXIucnVudGltZU1vZHVsZUluZm9bZGVwTmFtZV0uaW5kZXg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gZGVwTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICBdO1xuICAgICAgICBjYWNoZWRNb2R1bGVzW3J1bnRpbWVNb2R1bGVJbmZvW2FuXS5pbmRleF0gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIGFjY2VwdCBoYW5kbGVycyBsaXN0IGFuZCBjYWxsIHRoZSByaWdodCBvbmVzXG4gICAgICB2YXIgZXJyQ2FuV2FpdCA9IG51bGw7XG4gICAgICB2YXIgdXBkYXRlZE5hbWVzID0gbmV3IFN0clNldChhY2NlcHRlZFVwZGF0ZXMpO1xuICAgICAgdmFyIG9sZFVwZGF0ZUhhbmRsZXJzID0gbG9jYWxIbXIudXBkYXRlSGFuZGxlcnM7XG4gICAgICB2YXIgcmVsZXZhbnRVcGRhdGVIYW5kbGVycyA9IFtdO1xuICAgICAgdmFyIG5ld1VwZGF0ZUhhbmRsZXJzID0gW107XG4gICAgICBmb3IgKGk9MCwgbGVuPW9sZFVwZGF0ZUhhbmRsZXJzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgICBpZiAoIXVwZGF0ZWROYW1lcy5oYXMob2xkVXBkYXRlSGFuZGxlcnNbaV0uYWNjZXB0ZXIpKSB7XG4gICAgICAgICAgbmV3VXBkYXRlSGFuZGxlcnMucHVzaChvbGRVcGRhdGVIYW5kbGVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWROYW1lcy5oYXNJbnRlcnNlY3Rpb24ob2xkVXBkYXRlSGFuZGxlcnNbaV0uZGVwcykpIHtcbiAgICAgICAgICByZWxldmFudFVwZGF0ZUhhbmRsZXJzLnB1c2gob2xkVXBkYXRlSGFuZGxlcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsb2NhbEhtci51cGRhdGVIYW5kbGVycyA9IG5ld1VwZGF0ZUhhbmRsZXJzO1xuICAgICAgZm9yIChpPTAsIGxlbj1yZWxldmFudFVwZGF0ZUhhbmRsZXJzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlbGV2YW50VXBkYXRlSGFuZGxlcnNbaV0uY2IuY2FsbChudWxsLCBhY2NlcHRlZFVwZGF0ZXMpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBpZiAoZXJyQ2FuV2FpdCkgZW1pdEVycm9yKGVyckNhbldhaXQpO1xuICAgICAgICAgIGVyckNhbldhaXQgPSBlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGwgdGhlIHNlbGYtYWNjZXB0aW5nIG1vZHVsZXNcbiAgICAgIGZvckVhY2goc2VsZkFjY2VwdGVycywgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVxdWlyZShydW50aW1lTW9kdWxlSW5mb1tvYmoubmFtZV0uaW5kZXgpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBpZiAob2JqLmNiKSB7XG4gICAgICAgICAgICBvYmouY2IuY2FsbChudWxsLCBlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGVyckNhbldhaXQpIGVtaXRFcnJvcihlcnJDYW5XYWl0KTtcbiAgICAgICAgICAgIGVyckNhbldhaXQgPSBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGxvY2FsSG1yLnNldFN0YXR1cygnaWRsZScpO1xuICAgICAgY2IoZXJyQ2FuV2FpdCwgYWNjZXB0ZWRVcGRhdGVzKTtcbiAgICB9O1xuXG4gICAgdmFyIG1vZHVsZUhvdFNldFVwZGF0ZU1vZGUgPSBmdW5jdGlvbihtb2RlLCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgaWYgKHN1cHBvcnRNb2Rlcy5pbmRleE9mKG1vZGUpID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNb2RlIFwiK21vZGUrXCIgbm90IGluIHN1cHBvcnRNb2Rlcy4gUGxlYXNlIGNoZWNrIHRoZSBCcm93c2VyaWZ5LUhNUiBwbHVnaW4gb3B0aW9ucy5cIik7XG4gICAgICB9XG4gICAgICBpZiAobW9kZSA9PT0gJ2FqYXgnICYmICFvcHRpb25zLnVybCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1cmwgcmVxdWlyZWQgZm9yIGFqYXggdXBkYXRlIG1vZGVcIik7XG4gICAgICB9XG4gICAgICBpZiAobG9jYWxIbXIuc3RhdHVzICE9PSAnaWRsZScpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibW9kdWxlLmhvdC5zZXRVcGRhdGVNb2RlIGNhbiBvbmx5IGJlIGNhbGxlZCB3aGlsZSBzdGF0dXMgaXMgaWRsZVwiKTtcbiAgICAgIH1cblxuICAgICAgbG9jYWxIbXIubmV3TG9hZCA9IG51bGw7XG4gICAgICBsb2NhbEhtci51cGRhdGVNb2RlID0gdXBkYXRlTW9kZSA9IG1vZGU7XG4gICAgICBsb2NhbEhtci51cGRhdGVVcmwgPSB1cGRhdGVVcmwgPSBvcHRpb25zLnVybDtcbiAgICAgIHVwZGF0ZUNhY2hlQnVzdCA9IG9wdGlvbnMuY2FjaGVCdXN0O1xuICAgICAgaWdub3JlVW5hY2NlcHRlZCA9IGhhcyhvcHRpb25zLCAnaWdub3JlVW5hY2NlcHRlZCcpID8gb3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkIDogdHJ1ZTtcblxuICAgICAgaWYgKHNvY2tldCkge1xuICAgICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgICAgICBzb2NrZXQgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKG1vZGUgPT09ICd3ZWJzb2NrZXQnKSB7XG4gICAgICAgIHNvY2tldCA9IHNldHVwU29ja2V0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHVybCA9IHVwZGF0ZVVybCB8fCAnaHR0cDovL2xvY2FsaG9zdDozMTIzJztcbiAgICAgIHZhciBzb2NrZXQgPSBzb2NrZXRpbyh1cmwsIHsnZm9yY2UgbmV3IGNvbm5lY3Rpb24nOiB0cnVlfSk7XG4gICAgICBjb25zb2xlLmxvZygnW0hNUl0gQXR0ZW1wdGluZyB3ZWJzb2NrZXQgY29ubmVjdGlvbiB0bycsIHVybCk7XG5cbiAgICAgIHZhciBpc0FjY2VwdGluZ01lc3NhZ2VzID0gZmFsc2U7XG4gICAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaXNBY2NlcHRpbmdNZXNzYWdlcyA9IGZhbHNlO1xuICAgICAgICB2YXIgc3luY01zZyA9IG1hcFZhbHVlcyhydW50aW1lTW9kdWxlSW5mbywgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGFzaDogdmFsdWUuaGFzaFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICBzb2NrZXQuZW1pdCgnc3luYycsIHN5bmNNc2cpO1xuICAgICAgfSk7XG4gICAgICB2YXIgaXNVcGRhdGluZyA9IGZhbHNlO1xuICAgICAgdmFyIHF1ZXVlZFVwZGF0ZU1lc3NhZ2VzID0gW107XG4gICAgICBzb2NrZXQub24oJ3N5bmMgY29uZmlybScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0hNUl0gV2Vic29ja2V0IGNvbm5lY3Rpb24gc3VjY2Vzc2Z1bC4nKTtcbiAgICAgICAgaXNBY2NlcHRpbmdNZXNzYWdlcyA9IHRydWU7XG4gICAgICAgIHF1ZXVlZFVwZGF0ZU1lc3NhZ2VzID0gW107XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbignZGlzY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0hNUl0gV2Vic29ja2V0IGNvbm5lY3Rpb24gbG9zdC4nKTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGFjY2VwdE5ld01vZHVsZXMgPSBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IGFjY2VwdCBuZXcgbW9kdWxlcyBiZWZvcmUgd2UndmUgc3luY2VkIG91cnNlbHZlcy5cbiAgICAgICAgaWYgKCFpc0FjY2VwdGluZ01lc3NhZ2VzKSByZXR1cm47XG4gICAgICAgIGlmIChpc1VwZGF0aW5nKSB7XG4gICAgICAgICAgcXVldWVkVXBkYXRlTWVzc2FnZXMucHVzaChtc2cpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUYWtlIHRoZSBtZXNzYWdlIGFuZCBjcmVhdGUgYSBsb2NhbEhtci5uZXdMb2FkIHZhbHVlIGFzIGlmIHRoZVxuICAgICAgICAvLyBidW5kbGUgaGFkIGJlZW4gcmUtZXhlY3V0ZWQsIHRoZW4gY2FsbCBtb2R1bGVIb3RBcHBseS5cbiAgICAgICAgaXNVcGRhdGluZyA9IHRydWU7XG5cbiAgICAgICAgLy8gcmFuZG9tIGlkIHNvIHdlIGNhbiBtYWtlIHRoZSBub3JtYWxseSB1bm5hbWVkIGFyZ3MgaGF2ZSByYW5kb20gbmFtZXNcbiAgICAgICAgdmFyIHJpZCA9IFN0cmluZyhNYXRoLnJhbmRvbSgpKS5yZXBsYWNlKC9bXjAtOV0vZywgJycpO1xuXG4gICAgICAgIHZhciBuZXdNb2R1bGVEZWZzID0gbG9jYWxIbXIubmV3TG9hZCA/IGxvY2FsSG1yLm5ld0xvYWQubW9kdWxlRGVmcyA6IGFzc2lnbih7fSwgbW9kdWxlRGVmcyk7XG4gICAgICAgIHZhciBuZXdNb2R1bGVNZXRhID0gbG9jYWxIbXIubmV3TG9hZCA/XG4gICAgICAgICAgbG9jYWxIbXIubmV3TG9hZC5tb2R1bGVNZXRhIDogbWFwVmFsdWVzKHJ1bnRpbWVNb2R1bGVJbmZvLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbmRleDogdmFsdWUuaW5kZXgsXG4gICAgICAgICAgICAgIGhhc2g6IHZhbHVlLmhhc2gsXG4gICAgICAgICAgICAgIHBhcmVudHM6IHZhbHVlLnBhcmVudHMudG9BcnJheSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICBmb3JPd24obXNnLm5ld01vZHVsZURhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICBuZXdNb2R1bGVNZXRhW2tleV0gPSB7XG4gICAgICAgICAgICBpbmRleDogdmFsdWUuaW5kZXgsXG4gICAgICAgICAgICBoYXNoOiB2YWx1ZS5oYXNoLFxuICAgICAgICAgICAgcGFyZW50czogdmFsdWUucGFyZW50c1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICBmb3JFYWNoKG1zZy5yZW1vdmVkTW9kdWxlcywgZnVuY3Rpb24ocmVtb3ZlZE5hbWUpIHtcbiAgICAgICAgICBkZWxldGUgbmV3TW9kdWxlRGVmc1tydW50aW1lTW9kdWxlSW5mb1tyZW1vdmVkTmFtZV0uaW5kZXhdO1xuICAgICAgICAgIGRlbGV0ZSBuZXdNb2R1bGVNZXRhW3JlbW92ZWROYW1lXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBuZXdNb2R1bGVJbmRleGVzVG9OYW1lcyA9IG1ha2VNb2R1bGVJbmRleGVzVG9OYW1lcyhuZXdNb2R1bGVNZXRhKTtcbiAgICAgICAgZm9yT3duKG1zZy5uZXdNb2R1bGVEYXRhLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgLy8gdGhpcyBwYXJ0IG5lZWRzIHRvIHJ1biBhZnRlciBuZXdNb2R1bGVNZXRhIGFuZFxuICAgICAgICAgIC8vIG5ld01vZHVsZUluZGV4ZXNUb05hbWVzIGFyZSBwb3B1bGF0ZWQuXG4gICAgICAgICAgdmFyIG5ld01vZHVsZUZ1bmN0aW9uID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGZuO1xuICAgICAgICAgICAgLy9qc2hpbnQgZXZpbDp0cnVlXG4gICAgICAgICAgICBpZiAoYnVuZGxlX19maWxlbmFtZSB8fCBidW5kbGVfX2Rpcm5hbWUpIHtcbiAgICAgICAgICAgICAgZm4gPSBuZXcgRnVuY3Rpb24oJ3JlcXVpcmUnLCAnbW9kdWxlJywgJ2V4cG9ydHMnLCAnX3UxJytyaWQsICdfdTInK3JpZCwgJ19fdTMnK3JpZCwgJ19fdTQnK3JpZCwgJ19fZmlsZW5hbWUnLCAnX19kaXJuYW1lJywgdmFsdWUuc291cmNlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVpcmUsIG1vZHVsZSwgZXhwb3J0cywgX3UxLCBfdTIsIF91MywgX3U0KSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsLl9obXJbYnVuZGxlS2V5XS5pbml0TW9kdWxlKGtleSwgbW9kdWxlKTtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKHRoaXMsIHJlcXVpcmUsIG1vZHVsZSwgZXhwb3J0cywgX3UxLCBfdTIsIF91MywgX3U0LCBidW5kbGVfX2ZpbGVuYW1lLCBidW5kbGVfX2Rpcm5hbWUpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZm4gPSBuZXcgRnVuY3Rpb24oJ3JlcXVpcmUnLCAnbW9kdWxlJywgJ2V4cG9ydHMnLCAgJ191MScrcmlkLCAnX3UyJytyaWQsICdfX3UzJytyaWQsICdfX3U0JytyaWQsIHZhbHVlLnNvdXJjZSk7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihyZXF1aXJlLCBtb2R1bGUsIGV4cG9ydHMsIF91MSwgX3UyLCBfdTMsIF91NCkge1xuICAgICAgICAgICAgICAgIGdsb2JhbC5faG1yW2J1bmRsZUtleV0uaW5pdE1vZHVsZShrZXksIG1vZHVsZSk7XG4gICAgICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCByZXF1aXJlLCBtb2R1bGUsIGV4cG9ydHMsIF91MSwgX3UyLCBfdTMsIF91NCk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkoKTtcblxuICAgICAgICAgIG5ld01vZHVsZURlZnNbbmV3TW9kdWxlTWV0YVtrZXldLmluZGV4XSA9IFtcbiAgICAgICAgICAgIC8vIG1vZHVsZSBmdW5jdGlvblxuICAgICAgICAgICAgbmV3TW9kdWxlRnVuY3Rpb24sXG4gICAgICAgICAgICAvLyBtb2R1bGUgZGVwc1xuICAgICAgICAgICAgbWFwVmFsdWVzKHZhbHVlLmRlcHMsIGZ1bmN0aW9uKGRlcEluZGV4LCBkZXBSZWYpIHtcbiAgICAgICAgICAgICAgdmFyIGRlcE5hbWUgPSBuZXdNb2R1bGVJbmRleGVzVG9OYW1lc1tkZXBJbmRleF07XG4gICAgICAgICAgICAgIGlmIChoYXMobmV3TW9kdWxlTWV0YSwgZGVwTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3TW9kdWxlTWV0YVtkZXBOYW1lXS5pbmRleDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVwTmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdO1xuICAgICAgICB9KTtcbiAgICAgICAgbG9jYWxIbXIubmV3TG9hZCA9IHtcbiAgICAgICAgICBtb2R1bGVEZWZzOiBuZXdNb2R1bGVEZWZzLFxuICAgICAgICAgIG1vZHVsZU1ldGE6IG5ld01vZHVsZU1ldGEsXG4gICAgICAgICAgbW9kdWxlSW5kZXhlc1RvTmFtZXM6IG5ld01vZHVsZUluZGV4ZXNUb05hbWVzXG4gICAgICAgIH07XG4gICAgICAgIGxvY2FsSG1yLnNldFN0YXR1cygncmVhZHknKTtcbiAgICAgICAgdmFyIG91dGRhdGVkTW9kdWxlcyA9IGdldE91dGRhdGVkTW9kdWxlcygpO1xuICAgICAgICBtb2R1bGVIb3RBcHBseSh7aWdub3JlVW5hY2NlcHRlZDogaWdub3JlVW5hY2NlcHRlZH0sIGZ1bmN0aW9uKGVyciwgdXBkYXRlZE5hbWVzKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0hNUl0gRXJyb3IgYXBwbHlpbmcgdXBkYXRlJywgZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHVwZGF0ZWROYW1lcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tITVJdIFVwZGF0ZWQgbW9kdWxlcycsIHVwZGF0ZWROYW1lcyk7XG4gICAgICAgICAgICBpZiAob3V0ZGF0ZWRNb2R1bGVzLmxlbmd0aCAhPT0gdXBkYXRlZE5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICB2YXIgbm90VXBkYXRlZE5hbWVzID0gZmlsdGVyKG91dGRhdGVkTW9kdWxlcywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVkTmFtZXMuaW5kZXhPZihuYW1lKSA9PT0gLTE7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0hNUl0gU29tZSBtb2R1bGVzIHdlcmUgbm90IHVwZGF0ZWQnLCBub3RVcGRhdGVkTmFtZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpc1VwZGF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgdmFyIHF1ZXVlZE1zZztcbiAgICAgICAgICB3aGlsZSAoKHF1ZXVlZE1zZyA9IHF1ZXVlZFVwZGF0ZU1lc3NhZ2VzLnNoaWZ0KCkpKSB7XG4gICAgICAgICAgICBhY2NlcHROZXdNb2R1bGVzKHF1ZXVlZE1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBzb2NrZXQub24oJ25ldyBtb2R1bGVzJywgYWNjZXB0TmV3TW9kdWxlcyk7XG4gICAgICByZXR1cm4gc29ja2V0O1xuICAgIH07XG5cbiAgICB2YXIgbG9jYWxIbXIgPSB7XG4gICAgICB1cGRhdGVVcmw6IHVwZGF0ZVVybCxcbiAgICAgIHVwZGF0ZU1vZGU6IHVwZGF0ZU1vZGUsXG4gICAgICBydW50aW1lTW9kdWxlSW5mbzogcnVudGltZU1vZHVsZUluZm8sXG5cbiAgICAgIHN0YXR1czogXCJpZGxlXCIsXG4gICAgICBzZXRTdGF0dXM6IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdmFyIHN0YXR1c0hhbmRsZXJzID0gdGhpcy5zdGF0dXNIYW5kbGVycy5zbGljZSgpO1xuICAgICAgICBmb3IgKHZhciBpPTAsIGxlbj1zdGF0dXNIYW5kbGVycy5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICBzdGF0dXNIYW5kbGVyc1tpXS5jYWxsKG51bGwsIHN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzdGF0dXNIYW5kbGVyczogW10sXG4gICAgICB1cGRhdGVIYW5kbGVyczogW10sXG5cbiAgICAgIC8vIGR1cmluZyBhIHJlbG9hZCB0aGlzIGlzIHNldCB0byBhbiBvYmplY3Qgd2l0aCBtb2R1bGVEZWZzLFxuICAgICAgLy8gbW9kdWxlTWV0YSwgYW5kIG1vZHVsZUluZGV4ZXNUb05hbWVzIHByb3BlcnRpZXNcbiAgICAgIG5ld0xvYWQ6IG51bGwsXG5cbiAgICAgIGluaXRNb2R1bGU6IGZ1bmN0aW9uKG5hbWUsIG1vZHVsZSkge1xuICAgICAgICBydW50aW1lTW9kdWxlSW5mb1tuYW1lXS5tb2R1bGUgPSBtb2R1bGU7XG4gICAgICAgIG1vZHVsZS5ob3QgPSB7XG4gICAgICAgICAgYWNjZXB0OiBmdW5jdGlvbihkZXBzLCBjYikge1xuICAgICAgICAgICAgaWYgKCFjYiAmJiAoIWRlcHMgfHwgdHlwZW9mIGRlcHMgPT09ICdmdW5jdGlvbicpKSB7IC8vIHNlbGZcbiAgICAgICAgICAgICAgY2IgPSBkZXBzO1xuICAgICAgICAgICAgICBkZXBzID0gbnVsbDtcbiAgICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bbmFtZV0uc2VsZkFjY2VwdENicy5wdXNoKGNiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgZGVwcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBkZXBzID0gW2RlcHNdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhciBkZXBOYW1lcyA9IG5ldyBTdHJTZXQoKTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaT0wLCBkZXBzTGVuPWRlcHMubGVuZ3RoOyBpPGRlcHNMZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBkZXBJbmRleCA9IG1vZHVsZURlZnNbcnVudGltZU1vZHVsZUluZm9bbmFtZV0uaW5kZXhdWzFdW2RlcHNbaV1dO1xuICAgICAgICAgICAgICAgIGlmIChkZXBJbmRleCA9PT0gdW5kZWZpbmVkIHx8ICFoYXMobW9kdWxlSW5kZXhlc1RvTmFtZXMsIGRlcEluZGV4KSkge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmlsZSBkb2VzIG5vdCB1c2UgZGVwZW5kZW5jeTogXCIrZGVwc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlcE5hbWVzLmFkZChtb2R1bGVJbmRleGVzVG9OYW1lc1tkZXBJbmRleF0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGRlcHMgPSBudWxsO1xuICAgICAgICAgICAgICBkZXBOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGRlcE5hbWUpIHtcbiAgICAgICAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1tkZXBOYW1lXS5hY2NlcHRlcnMuYWRkKG5hbWUpO1xuICAgICAgICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmFjY2VwdGluZy5hZGQoZGVwTmFtZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgICBsb2NhbEhtci51cGRhdGVIYW5kbGVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGFjY2VwdGVyOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgZGVwczogZGVwTmFtZXMsXG4gICAgICAgICAgICAgICAgICBjYjogY2JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGVjbGluZTogZnVuY3Rpb24oZGVwcykge1xuICAgICAgICAgICAgaWYgKCFkZXBzKSB7IC8vIHNlbGZcbiAgICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bbmFtZV0uZGVjbGluZXJzLmFkZChuYW1lKTtcbiAgICAgICAgICAgICAgcnVudGltZU1vZHVsZUluZm9bbmFtZV0uZGVjbGluaW5nLmFkZChuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgZGVwcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBkZXBzID0gW2RlcHNdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGZvciAodmFyIGk9MCwgZGVwc0xlbj1kZXBzLmxlbmd0aDsgaTxkZXBzTGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVwSW5kZXggPSBtb2R1bGVEZWZzW3J1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmluZGV4XVsxXVtkZXBzW2ldXTtcbiAgICAgICAgICAgICAgICBpZiAoZGVwSW5kZXggPT09IHVuZGVmaW5lZCB8fCAhaGFzKG1vZHVsZUluZGV4ZXNUb05hbWVzLCBkZXBJbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZpbGUgZG9lcyBub3QgdXNlIGRlcGVuZGVuY3k6IFwiK2RlcHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZGVwTmFtZSA9IG1vZHVsZUluZGV4ZXNUb05hbWVzW2RlcEluZGV4XTtcbiAgICAgICAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1tkZXBOYW1lXS5kZWNsaW5lcnMuYWRkKG5hbWUpO1xuICAgICAgICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmRlY2xpbmluZy5hZGQoZGVwTmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGRhdGE6IHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmRpc3Bvc2VEYXRhLFxuICAgICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGREaXNwb3NlSGFuZGxlcihjYik7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhZGREaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgICAgIHJ1bnRpbWVNb2R1bGVJbmZvW25hbWVdLmRpc3Bvc2VIYW5kbGVycy5wdXNoKGNiKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbW92ZURpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYikge1xuICAgICAgICAgICAgdmFyIGl4ID0gcnVudGltZU1vZHVsZUluZm9bbmFtZV0uZGlzcG9zZUhhbmRsZXJzLmluZGV4T2YoY2IpO1xuICAgICAgICAgICAgaWYgKGl4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBydW50aW1lTW9kdWxlSW5mb1tuYW1lXS5kaXNwb3NlSGFuZGxlcnMuc3BsaWNlKGl4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLy8gTWFuYWdlbWVudFxuICAgICAgICAgIGNoZWNrOiBtb2R1bGVIb3RDaGVjayxcbiAgICAgICAgICBhcHBseTogbW9kdWxlSG90QXBwbHksXG4gICAgICAgICAgc3RhdHVzOiBmdW5jdGlvbihjYikge1xuICAgICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZFN0YXR1c0hhbmRsZXIoY2IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsSG1yLnN0YXR1cztcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFkZFN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgICAgICBsb2NhbEhtci5zdGF0dXNIYW5kbGVycy5wdXNoKGNiKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbW92ZVN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgICAgICB2YXIgaXggPSBsb2NhbEhtci5zdGF0dXNIYW5kbGVycy5pbmRleE9mKGNiKTtcbiAgICAgICAgICAgIGlmIChpeCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgbG9jYWxIbXIuc3RhdHVzSGFuZGxlcnMuc3BsaWNlKGl4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldFVwZGF0ZU1vZGU6IG1vZHVsZUhvdFNldFVwZGF0ZU1vZGVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGdsb2JhbC5faG1yW2J1bmRsZUtleV0gPSBsb2NhbEhtcjtcblxuICAgIGlmICh1cGRhdGVNb2RlID09PSAnd2Vic29ja2V0Jykge1xuICAgICAgc29ja2V0ID0gc2V0dXBTb2NrZXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7IC8vIFdlJ3JlIGluIGEgcmVsb2FkIVxuICAgIGdsb2JhbC5faG1yW2J1bmRsZUtleV0ubmV3TG9hZCA9IHtcbiAgICAgIG1vZHVsZURlZnM6IG1vZHVsZURlZnMsXG4gICAgICBtb2R1bGVNZXRhOiBtb2R1bGVNZXRhLFxuICAgICAgbW9kdWxlSW5kZXhlc1RvTmFtZXM6IG1vZHVsZUluZGV4ZXNUb05hbWVzXG4gICAgfTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYWluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBoYXMob2JqZWN0LCBwcm9wTmFtZSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcE5hbWUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBoYXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXMgPSByZXF1aXJlKCcuL2hhcycpO1xuXG5mdW5jdGlvbiBTdHJTZXQob3RoZXIpIHtcbiAgdGhpcy5fbWFwID0ge307XG4gIHRoaXMuX3NpemUgPSAwO1xuICBpZiAob3RoZXIpIHtcbiAgICBmb3IgKHZhciBpPTAsbGVuPW90aGVyLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgdGhpcy5hZGQob3RoZXJbaV0pO1xuICAgIH1cbiAgfVxufVxuU3RyU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIXRoaXMuaGFzKHZhbHVlKSkge1xuICAgIHRoaXMuX21hcFt2YWx1ZV0gPSB0cnVlO1xuICAgIHRoaXMuX3NpemUrKztcbiAgfVxufTtcblN0clNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGhhcyh0aGlzLl9tYXAsIHZhbHVlKTtcbn07XG5TdHJTZXQucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh0aGlzLmhhcyh2YWx1ZSkpIHtcbiAgICBkZWxldGUgdGhpcy5fbWFwW3ZhbHVlXTtcbiAgICB0aGlzLl9zaXplLS07XG4gIH1cbn07XG5TdHJTZXQucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3NpemU7XG59O1xuU3RyU2V0LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2IpIHtcbiAgZm9yICh2YXIgdmFsdWUgaW4gdGhpcy5fbWFwKSB7XG4gICAgaWYgKGhhcyh0aGlzLl9tYXAsIHZhbHVlKSkge1xuICAgICAgY2IodmFsdWUpO1xuICAgIH1cbiAgfVxufTtcblN0clNldC5wcm90b3R5cGUuc29tZSA9IGZ1bmN0aW9uKGNiKSB7XG4gIGZvciAodmFyIHZhbHVlIGluIHRoaXMuX21hcCkge1xuICAgIGlmIChoYXModGhpcy5fbWFwLCB2YWx1ZSkpIHtcbiAgICAgIGlmIChjYih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5TdHJTZXQucHJvdG90eXBlLmV2ZXJ5ID0gZnVuY3Rpb24oY2IpIHtcbiAgcmV0dXJuICF0aGlzLnNvbWUoZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAhY2IoeCk7XG4gIH0pO1xufTtcblN0clNldC5wcm90b3R5cGUuaGFzSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24ob3RoZXJTdHJTZXQpIHtcbiAgdmFyIHZhbHVlO1xuICBpZiAodGhpcy5fc2l6ZSA8IG90aGVyU3RyU2V0Ll9zaXplKSB7XG4gICAgcmV0dXJuIHRoaXMuc29tZShmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIG90aGVyU3RyU2V0Lmhhcyh2YWx1ZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBvdGhlclN0clNldC5zb21lKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gc2VsZi5oYXModmFsdWUpO1xuICAgIH0pO1xuICB9XG59O1xuU3RyU2V0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhcnIgPSBbXTtcbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgYXJyLnB1c2godmFsdWUpO1xuICB9KTtcbiAgcmV0dXJuIGFycjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RyU2V0O1xuIiwiLyoqXG4gKiBHZXRzIHRoZSBsYXN0IGVsZW1lbnQgb2YgYGFycmF5YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEFycmF5XG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbGFzdCBlbGVtZW50IG9mIGBhcnJheWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8ubGFzdChbMSwgMiwgM10pO1xuICogLy8gPT4gM1xuICovXG5mdW5jdGlvbiBsYXN0KGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG4gIHJldHVybiBsZW5ndGggPyBhcnJheVtsZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsYXN0O1xuIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKTtcblxuLyoqXG4gKiBUaGUgaW52ZXJzZSBvZiBgXy5wYWlyc2A7IHRoaXMgbWV0aG9kIHJldHVybnMgYW4gb2JqZWN0IGNvbXBvc2VkIGZyb20gYXJyYXlzXG4gKiBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgdmFsdWVzLiBQcm92aWRlIGVpdGhlciBhIHNpbmdsZSB0d28gZGltZW5zaW9uYWwgYXJyYXksXG4gKiBlLmcuIGBbW2tleTEsIHZhbHVlMV0sIFtrZXkyLCB2YWx1ZTJdXWAgb3IgdHdvIGFycmF5cywgb25lIG9mIHByb3BlcnR5IG5hbWVzXG4gKiBhbmQgb25lIG9mIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAYWxpYXMgb2JqZWN0XG4gKiBAY2F0ZWdvcnkgQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXM9W11dIFRoZSBwcm9wZXJ0eSB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnppcE9iamVjdChbWydmcmVkJywgMzBdLCBbJ2Jhcm5leScsIDQwXV0pO1xuICogLy8gPT4geyAnZnJlZCc6IDMwLCAnYmFybmV5JzogNDAgfVxuICpcbiAqIF8uemlwT2JqZWN0KFsnZnJlZCcsICdiYXJuZXknXSwgWzMwLCA0MF0pO1xuICogLy8gPT4geyAnZnJlZCc6IDMwLCAnYmFybmV5JzogNDAgfVxuICovXG5mdW5jdGlvbiB6aXBPYmplY3QocHJvcHMsIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzID8gcHJvcHMubGVuZ3RoIDogMCxcbiAgICAgIHJlc3VsdCA9IHt9O1xuXG4gIGlmIChsZW5ndGggJiYgIXZhbHVlcyAmJiAhaXNBcnJheShwcm9wc1swXSkpIHtcbiAgICB2YWx1ZXMgPSBbXTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgaWYgKHZhbHVlcykge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZXNbaW5kZXhdO1xuICAgIH0gZWxzZSBpZiAoa2V5KSB7XG4gICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB6aXBPYmplY3Q7XG4iLCJ2YXIgYXJyYXlGaWx0ZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9hcnJheUZpbHRlcicpLFxuICAgIGJhc2VDYWxsYmFjayA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VDYWxsYmFjaycpLFxuICAgIGJhc2VGaWx0ZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlRmlsdGVyJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgYWxsIGVsZW1lbnRzXG4gKiBgcHJlZGljYXRlYCByZXR1cm5zIHRydXRoeSBmb3IuIFRoZSBwcmVkaWNhdGUgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZFxuICogaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICpcbiAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYHByZWRpY2F0ZWAgdGhlIGNyZWF0ZWQgYF8ucHJvcGVydHlgXG4gKiBzdHlsZSBjYWxsYmFjayByZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBJZiBhIHZhbHVlIGlzIGFsc28gcHJvdmlkZWQgZm9yIGB0aGlzQXJnYCB0aGUgY3JlYXRlZCBgXy5tYXRjaGVzUHJvcGVydHlgXG4gKiBzdHlsZSBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIGEgbWF0Y2hpbmcgcHJvcGVydHlcbiAqIHZhbHVlLCBlbHNlIGBmYWxzZWAuXG4gKlxuICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgcHJlZGljYXRlYCB0aGUgY3JlYXRlZCBgXy5tYXRjaGVzYCBzdHlsZVxuICogY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW5cbiAqIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAYWxpYXMgc2VsZWN0XG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW3ByZWRpY2F0ZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZFxuICogIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYHByZWRpY2F0ZWAuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmaWx0ZXJlZCBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5maWx0ZXIoWzQsIDUsIDZdLCBmdW5jdGlvbihuKSB7XG4gKiAgIHJldHVybiBuICUgMiA9PSAwO1xuICogfSk7XG4gKiAvLyA9PiBbNCwgNl1cbiAqXG4gKiB2YXIgdXNlcnMgPSBbXG4gKiAgIHsgJ3VzZXInOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYWN0aXZlJzogdHJ1ZSB9LFxuICogICB7ICd1c2VyJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCwgJ2FjdGl2ZSc6IGZhbHNlIH1cbiAqIF07XG4gKlxuICogLy8gdXNpbmcgdGhlIGBfLm1hdGNoZXNgIGNhbGxiYWNrIHNob3J0aGFuZFxuICogXy5wbHVjayhfLmZpbHRlcih1c2VycywgeyAnYWdlJzogMzYsICdhY3RpdmUnOiB0cnVlIH0pLCAndXNlcicpO1xuICogLy8gPT4gWydiYXJuZXknXVxuICpcbiAqIC8vIHVzaW5nIHRoZSBgXy5tYXRjaGVzUHJvcGVydHlgIGNhbGxiYWNrIHNob3J0aGFuZFxuICogXy5wbHVjayhfLmZpbHRlcih1c2VycywgJ2FjdGl2ZScsIGZhbHNlKSwgJ3VzZXInKTtcbiAqIC8vID0+IFsnZnJlZCddXG4gKlxuICogLy8gdXNpbmcgdGhlIGBfLnByb3BlcnR5YCBjYWxsYmFjayBzaG9ydGhhbmRcbiAqIF8ucGx1Y2soXy5maWx0ZXIodXNlcnMsICdhY3RpdmUnKSwgJ3VzZXInKTtcbiAqIC8vID0+IFsnYmFybmV5J11cbiAqL1xuZnVuY3Rpb24gZmlsdGVyKGNvbGxlY3Rpb24sIHByZWRpY2F0ZSwgdGhpc0FyZykge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUZpbHRlciA6IGJhc2VGaWx0ZXI7XG4gIHByZWRpY2F0ZSA9IGJhc2VDYWxsYmFjayhwcmVkaWNhdGUsIHRoaXNBcmcsIDMpO1xuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBwcmVkaWNhdGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbHRlcjtcbiIsInZhciBhcnJheUVhY2ggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9hcnJheUVhY2gnKSxcbiAgICBiYXNlRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VFYWNoJyksXG4gICAgY3JlYXRlRm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2NyZWF0ZUZvckVhY2gnKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBpbnZva2luZyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBUaGUgYGl0ZXJhdGVlYCBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHlcbiAqIGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogKipOb3RlOioqIEFzIHdpdGggb3RoZXIgXCJDb2xsZWN0aW9uc1wiIG1ldGhvZHMsIG9iamVjdHMgd2l0aCBhIFwibGVuZ3RoXCIgcHJvcGVydHlcbiAqIGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciBgXy5mb3JJbmAgb3IgYF8uZm9yT3duYFxuICogbWF5IGJlIHVzZWQgZm9yIG9iamVjdCBpdGVyYXRpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBhbGlhcyBlYWNoXG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBpdGVyYXRlZWAuXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fHN0cmluZ30gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8oWzEsIDJdKS5mb3JFYWNoKGZ1bmN0aW9uKG4pIHtcbiAqICAgY29uc29sZS5sb2cobik7XG4gKiB9KS52YWx1ZSgpO1xuICogLy8gPT4gbG9ncyBlYWNoIHZhbHVlIGZyb20gbGVmdCB0byByaWdodCBhbmQgcmV0dXJucyB0aGUgYXJyYXlcbiAqXG4gKiBfLmZvckVhY2goeyAnYSc6IDEsICdiJzogMiB9LCBmdW5jdGlvbihuLCBrZXkpIHtcbiAqICAgY29uc29sZS5sb2cobiwga2V5KTtcbiAqIH0pO1xuICogLy8gPT4gbG9ncyBlYWNoIHZhbHVlLWtleSBwYWlyIGFuZCByZXR1cm5zIHRoZSBvYmplY3QgKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xudmFyIGZvckVhY2ggPSBjcmVhdGVGb3JFYWNoKGFycmF5RWFjaCwgYmFzZUVhY2gpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2g7XG4iLCJ2YXIgYXJyYXlNYXAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9hcnJheU1hcCcpLFxuICAgIGJhc2VDYWxsYmFjayA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VDYWxsYmFjaycpLFxuICAgIGJhc2VNYXAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlTWFwJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdmFsdWVzIGJ5IHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIGBjb2xsZWN0aW9uYCB0aHJvdWdoXG4gKiBgaXRlcmF0ZWVgLiBUaGUgYGl0ZXJhdGVlYCBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICogYXJndW1lbnRzOiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gKlxuICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgaXRlcmF0ZWVgIHRoZSBjcmVhdGVkIGBfLnByb3BlcnR5YFxuICogc3R5bGUgY2FsbGJhY2sgcmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gKlxuICogSWYgYSB2YWx1ZSBpcyBhbHNvIHByb3ZpZGVkIGZvciBgdGhpc0FyZ2AgdGhlIGNyZWF0ZWQgYF8ubWF0Y2hlc1Byb3BlcnR5YFxuICogc3R5bGUgY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSBhIG1hdGNoaW5nIHByb3BlcnR5XG4gKiB2YWx1ZSwgZWxzZSBgZmFsc2VgLlxuICpcbiAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGl0ZXJhdGVlYCB0aGUgY3JlYXRlZCBgXy5tYXRjaGVzYCBzdHlsZVxuICogY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW5cbiAqIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICpcbiAqIE1hbnkgbG9kYXNoIG1ldGhvZHMgYXJlIGd1YXJkZWQgdG8gd29yayBhcyBpdGVyYXRlZXMgZm9yIG1ldGhvZHMgbGlrZVxuICogYF8uZXZlcnlgLCBgXy5maWx0ZXJgLCBgXy5tYXBgLCBgXy5tYXBWYWx1ZXNgLCBgXy5yZWplY3RgLCBhbmQgYF8uc29tZWAuXG4gKlxuICogVGhlIGd1YXJkZWQgbWV0aG9kcyBhcmU6XG4gKiBgYXJ5YCwgYGNhbGxiYWNrYCwgYGNodW5rYCwgYGNsb25lYCwgYGNyZWF0ZWAsIGBjdXJyeWAsIGBjdXJyeVJpZ2h0YCxcbiAqIGBkcm9wYCwgYGRyb3BSaWdodGAsIGBldmVyeWAsIGBmaWxsYCwgYGZsYXR0ZW5gLCBgaW52ZXJ0YCwgYG1heGAsIGBtaW5gLFxuICogYHBhcnNlSW50YCwgYHNsaWNlYCwgYHNvcnRCeWAsIGB0YWtlYCwgYHRha2VSaWdodGAsIGB0ZW1wbGF0ZWAsIGB0cmltYCxcbiAqIGB0cmltTGVmdGAsIGB0cmltUmlnaHRgLCBgdHJ1bmNgLCBgcmFuZG9tYCwgYHJhbmdlYCwgYHNhbXBsZWAsIGBzb21lYCxcbiAqIGBzdW1gLCBgdW5pcWAsIGFuZCBgd29yZHNgXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBhbGlhcyBjb2xsZWN0XG4gKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkXG4gKiAgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgaXRlcmF0ZWVgLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiB0aW1lc1RocmVlKG4pIHtcbiAqICAgcmV0dXJuIG4gKiAzO1xuICogfVxuICpcbiAqIF8ubWFwKFsxLCAyXSwgdGltZXNUaHJlZSk7XG4gKiAvLyA9PiBbMywgNl1cbiAqXG4gKiBfLm1hcCh7ICdhJzogMSwgJ2InOiAyIH0sIHRpbWVzVGhyZWUpO1xuICogLy8gPT4gWzMsIDZdIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogdmFyIHVzZXJzID0gW1xuICogICB7ICd1c2VyJzogJ2Jhcm5leScgfSxcbiAqICAgeyAndXNlcic6ICdmcmVkJyB9XG4gKiBdO1xuICpcbiAqIC8vIHVzaW5nIHRoZSBgXy5wcm9wZXJ0eWAgY2FsbGJhY2sgc2hvcnRoYW5kXG4gKiBfLm1hcCh1c2VycywgJ3VzZXInKTtcbiAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICovXG5mdW5jdGlvbiBtYXAoY29sbGVjdGlvbiwgaXRlcmF0ZWUsIHRoaXNBcmcpIHtcbiAgdmFyIGZ1bmMgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gYXJyYXlNYXAgOiBiYXNlTWFwO1xuICBpdGVyYXRlZSA9IGJhc2VDYWxsYmFjayhpdGVyYXRlZSwgdGhpc0FyZywgMyk7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXA7XG4iLCJ2YXIgYXJyYXlTb21lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYXJyYXlTb21lJyksXG4gICAgYmFzZUNhbGxiYWNrID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYmFzZUNhbGxiYWNrJyksXG4gICAgYmFzZVNvbWUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlU29tZScpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICBpc0l0ZXJhdGVlQ2FsbCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzSXRlcmF0ZWVDYWxsJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBwcmVkaWNhdGVgIHJldHVybnMgdHJ1dGh5IGZvciAqKmFueSoqIGVsZW1lbnQgb2YgYGNvbGxlY3Rpb25gLlxuICogVGhlIGZ1bmN0aW9uIHJldHVybnMgYXMgc29vbiBhcyBpdCBmaW5kcyBhIHBhc3NpbmcgdmFsdWUgYW5kIGRvZXMgbm90IGl0ZXJhdGVcbiAqIG92ZXIgdGhlIGVudGlyZSBjb2xsZWN0aW9uLiBUaGUgcHJlZGljYXRlIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZFxuICogd2l0aCB0aHJlZSBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqXG4gKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBwcmVkaWNhdGVgIHRoZSBjcmVhdGVkIGBfLnByb3BlcnR5YFxuICogc3R5bGUgY2FsbGJhY2sgcmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gKlxuICogSWYgYSB2YWx1ZSBpcyBhbHNvIHByb3ZpZGVkIGZvciBgdGhpc0FyZ2AgdGhlIGNyZWF0ZWQgYF8ubWF0Y2hlc1Byb3BlcnR5YFxuICogc3R5bGUgY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSBhIG1hdGNoaW5nIHByb3BlcnR5XG4gKiB2YWx1ZSwgZWxzZSBgZmFsc2VgLlxuICpcbiAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYHByZWRpY2F0ZWAgdGhlIGNyZWF0ZWQgYF8ubWF0Y2hlc2Agc3R5bGVcbiAqIGNhbGxiYWNrIHJldHVybnMgYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuXG4gKiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGFsaWFzIGFueVxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtwcmVkaWNhdGU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWRcbiAqICBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBwcmVkaWNhdGVgLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlcyB0aGUgcHJlZGljYXRlIGNoZWNrLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5zb21lKFtudWxsLCAwLCAneWVzJywgZmFsc2VdLCBCb29sZWFuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiB2YXIgdXNlcnMgPSBbXG4gKiAgIHsgJ3VzZXInOiAnYmFybmV5JywgJ2FjdGl2ZSc6IHRydWUgfSxcbiAqICAgeyAndXNlcic6ICdmcmVkJywgICAnYWN0aXZlJzogZmFsc2UgfVxuICogXTtcbiAqXG4gKiAvLyB1c2luZyB0aGUgYF8ubWF0Y2hlc2AgY2FsbGJhY2sgc2hvcnRoYW5kXG4gKiBfLnNvbWUodXNlcnMsIHsgJ3VzZXInOiAnYmFybmV5JywgJ2FjdGl2ZSc6IGZhbHNlIH0pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiAvLyB1c2luZyB0aGUgYF8ubWF0Y2hlc1Byb3BlcnR5YCBjYWxsYmFjayBzaG9ydGhhbmRcbiAqIF8uc29tZSh1c2VycywgJ2FjdGl2ZScsIGZhbHNlKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiAvLyB1c2luZyB0aGUgYF8ucHJvcGVydHlgIGNhbGxiYWNrIHNob3J0aGFuZFxuICogXy5zb21lKHVzZXJzLCAnYWN0aXZlJyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIHNvbWUoY29sbGVjdGlvbiwgcHJlZGljYXRlLCB0aGlzQXJnKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5U29tZSA6IGJhc2VTb21lO1xuICBpZiAodGhpc0FyZyAmJiBpc0l0ZXJhdGVlQ2FsbChjb2xsZWN0aW9uLCBwcmVkaWNhdGUsIHRoaXNBcmcpKSB7XG4gICAgcHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICB9XG4gIGlmICh0eXBlb2YgcHJlZGljYXRlICE9ICdmdW5jdGlvbicgfHwgdGhpc0FyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHJlZGljYXRlID0gYmFzZUNhbGxiYWNrKHByZWRpY2F0ZSwgdGhpc0FyZywgMyk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgcHJlZGljYXRlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzb21lO1xuIiwiLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlXG4gKiBjcmVhdGVkIGZ1bmN0aW9uIGFuZCBhcmd1bWVudHMgZnJvbSBgc3RhcnRgIGFuZCBiZXlvbmQgcHJvdmlkZWQgYXMgYW4gYXJyYXkuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGJhc2VkIG9uIHRoZSBbcmVzdCBwYXJhbWV0ZXJdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9GdW5jdGlvbnMvcmVzdF9wYXJhbWV0ZXJzKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBzYXkgPSBfLnJlc3RQYXJhbShmdW5jdGlvbih3aGF0LCBuYW1lcykge1xuICogICByZXR1cm4gd2hhdCArICcgJyArIF8uaW5pdGlhbChuYW1lcykuam9pbignLCAnKSArXG4gKiAgICAgKF8uc2l6ZShuYW1lcykgPiAxID8gJywgJiAnIDogJycpICsgXy5sYXN0KG5hbWVzKTtcbiAqIH0pO1xuICpcbiAqIHNheSgnaGVsbG8nLCAnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcycpO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQsIGJhcm5leSwgJiBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiByZXN0UGFyYW0oZnVuYywgc3RhcnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogKCtzdGFydCB8fCAwKSwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICByZXN0W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIHN3aXRjaCAoc3RhcnQpIHtcbiAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCByZXN0KTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCBhcmdzWzFdLCByZXN0KTtcbiAgICB9XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgaW5kZXggPSAtMTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSByZXN0O1xuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzdFBhcmFtO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RWFjaDtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICByZXNJbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgcmVzdWx0WysrcmVzSW5kZXhdID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlGaWx0ZXI7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tYXBgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFja1xuICogc2hvcnRoYW5kcyBhbmQgYHRoaXNgIGJpbmRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheU1hcChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TWFwO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uc29tZWAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlcyB0aGUgcHJlZGljYXRlIGNoZWNrLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlTb21lKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAocHJlZGljYXRlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVNvbWU7XG4iLCJ2YXIga2V5cyA9IHJlcXVpcmUoJy4uL29iamVjdC9rZXlzJyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmFzc2lnbmAgZm9yIGN1c3RvbWl6aW5nIGFzc2lnbmVkIHZhbHVlcyB3aXRob3V0XG4gKiBzdXBwb3J0IGZvciBhcmd1bWVudCBqdWdnbGluZywgbXVsdGlwbGUgc291cmNlcywgYW5kIGB0aGlzYCBiaW5kaW5nIGBjdXN0b21pemVyYFxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGFzc2lnbldpdGgob2JqZWN0LCBzb3VyY2UsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBwcm9wcyA9IGtleXMoc291cmNlKSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF0sXG4gICAgICAgIHZhbHVlID0gb2JqZWN0W2tleV0sXG4gICAgICAgIHJlc3VsdCA9IGN1c3RvbWl6ZXIodmFsdWUsIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKTtcblxuICAgIGlmICgocmVzdWx0ID09PSByZXN1bHQgPyAocmVzdWx0ICE9PSB2YWx1ZSkgOiAodmFsdWUgPT09IHZhbHVlKSkgfHxcbiAgICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICAgIG9iamVjdFtrZXldID0gcmVzdWx0O1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbldpdGg7XG4iLCJ2YXIgYmFzZUNvcHkgPSByZXF1aXJlKCcuL2Jhc2VDb3B5JyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4uL29iamVjdC9rZXlzJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFyZ3VtZW50IGp1Z2dsaW5nLFxuICogbXVsdGlwbGUgc291cmNlcywgYW5kIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBzb3VyY2UgPT0gbnVsbFxuICAgID8gb2JqZWN0XG4gICAgOiBiYXNlQ29weShzb3VyY2UsIGtleXMoc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduO1xuIiwidmFyIGJhc2VNYXRjaGVzID0gcmVxdWlyZSgnLi9iYXNlTWF0Y2hlcycpLFxuICAgIGJhc2VNYXRjaGVzUHJvcGVydHkgPSByZXF1aXJlKCcuL2Jhc2VNYXRjaGVzUHJvcGVydHknKSxcbiAgICBiaW5kQ2FsbGJhY2sgPSByZXF1aXJlKCcuL2JpbmRDYWxsYmFjaycpLFxuICAgIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vdXRpbGl0eS9pZGVudGl0eScpLFxuICAgIHByb3BlcnR5ID0gcmVxdWlyZSgnLi4vdXRpbGl0eS9wcm9wZXJ0eScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNhbGxiYWNrYCB3aGljaCBzdXBwb3J0cyBzcGVjaWZ5aW5nIHRoZVxuICogbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBbZnVuYz1fLmlkZW50aXR5XSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBhIGNhbGxiYWNrLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHByb3ZpZGUgdG8gYGZ1bmNgLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYmFzZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIGZ1bmM7XG4gIGlmICh0eXBlID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdGhpc0FyZyA9PT0gdW5kZWZpbmVkXG4gICAgICA/IGZ1bmNcbiAgICAgIDogYmluZENhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KTtcbiAgfVxuICBpZiAoZnVuYyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5O1xuICB9XG4gIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGJhc2VNYXRjaGVzKGZ1bmMpO1xuICB9XG4gIHJldHVybiB0aGlzQXJnID09PSB1bmRlZmluZWRcbiAgICA/IHByb3BlcnR5KGZ1bmMpXG4gICAgOiBiYXNlTWF0Y2hlc1Byb3BlcnR5KGZ1bmMsIHRoaXNBcmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDYWxsYmFjaztcbiIsIi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUNvcHkoc291cmNlLCBwcm9wcywgb2JqZWN0KSB7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICBvYmplY3Rba2V5XSA9IHNvdXJjZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNvcHk7XG4iLCJ2YXIgYmFzZUZvck93biA9IHJlcXVpcmUoJy4vYmFzZUZvck93bicpLFxuICAgIGNyZWF0ZUJhc2VFYWNoID0gcmVxdWlyZSgnLi9jcmVhdGVCYXNlRWFjaCcpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY2FsbGJhY2tcbiAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8c3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xudmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUVhY2g7XG4iLCJ2YXIgYmFzZUVhY2ggPSByZXF1aXJlKCcuL2Jhc2VFYWNoJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZmlsdGVyYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGaWx0ZXIoY29sbGVjdGlvbiwgcHJlZGljYXRlKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgYmFzZUVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRmlsdGVyO1xuIiwidmFyIGNyZWF0ZUJhc2VGb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUJhc2VGb3InKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvckluYCBhbmQgYGJhc2VGb3JPd25gIHdoaWNoIGl0ZXJhdGVzXG4gKiBvdmVyIGBvYmplY3RgIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBpbnZva2luZyBgaXRlcmF0ZWVgIGZvclxuICogZWFjaCBwcm9wZXJ0eS4gSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5XG4gKiByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xudmFyIGJhc2VGb3IgPSBjcmVhdGVCYXNlRm9yKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZvcjtcbiIsInZhciBiYXNlRm9yID0gcmVxdWlyZSgnLi9iYXNlRm9yJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4uL29iamVjdC9rZXlzJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9yT3duYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlRm9yT3duKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZvck93bjtcbiIsInZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0cmluZyBwYXRoc1xuICogYW5kIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcGFyYW0ge3N0cmluZ30gW3BhdGhLZXldIFRoZSBrZXkgcmVwcmVzZW50YXRpb24gb2YgcGF0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldChvYmplY3QsIHBhdGgsIHBhdGhLZXkpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChwYXRoS2V5ICE9PSB1bmRlZmluZWQgJiYgcGF0aEtleSBpbiB0b09iamVjdChvYmplY3QpKSB7XG4gICAgcGF0aCA9IFtwYXRoS2V5XTtcbiAgfVxuICB2YXIgaW5kZXggPSAwLFxuICAgICAgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG5cbiAgd2hpbGUgKG9iamVjdCAhPSBudWxsICYmIGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0W3BhdGhbaW5kZXgrK11dO1xuICB9XG4gIHJldHVybiAoaW5kZXggJiYgaW5kZXggPT0gbGVuZ3RoKSA/IG9iamVjdCA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0O1xuIiwidmFyIGJhc2VJc0VxdWFsRGVlcCA9IHJlcXVpcmUoJy4vYmFzZUlzRXF1YWxEZWVwJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9sYW5nL2lzT2JqZWN0JyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0VxdWFsYCB3aXRob3V0IHN1cHBvcnQgZm9yIGB0aGlzYCBiaW5kaW5nXG4gKiBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmluZyB2YWx1ZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0xvb3NlXSBTcGVjaWZ5IHBlcmZvcm1pbmcgcGFydGlhbCBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0FdIFRyYWNrcyB0cmF2ZXJzZWQgYHZhbHVlYCBvYmplY3RzLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQl0gVHJhY2tzIHRyYXZlcnNlZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNFcXVhbCh2YWx1ZSwgb3RoZXIsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKSB7XG4gIGlmICh2YWx1ZSA9PT0gb3RoZXIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT0gbnVsbCB8fCBvdGhlciA9PSBudWxsIHx8ICghaXNPYmplY3QodmFsdWUpICYmICFpc09iamVjdExpa2Uob3RoZXIpKSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyO1xuICB9XG4gIHJldHVybiBiYXNlSXNFcXVhbERlZXAodmFsdWUsIG90aGVyLCBiYXNlSXNFcXVhbCwgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsO1xuIiwidmFyIGVxdWFsQXJyYXlzID0gcmVxdWlyZSgnLi9lcXVhbEFycmF5cycpLFxuICAgIGVxdWFsQnlUYWcgPSByZXF1aXJlKCcuL2VxdWFsQnlUYWcnKSxcbiAgICBlcXVhbE9iamVjdHMgPSByZXF1aXJlKCcuL2VxdWFsT2JqZWN0cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9ialRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbGAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBjb21wYXJpc29ucyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBjb21wYXJlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIG9iamVjdHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0xvb3NlXSBTcGVjaWZ5IHBlcmZvcm1pbmcgcGFydGlhbCBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgYHZhbHVlYCBvYmplY3RzLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gVHJhY2tzIHRyYXZlcnNlZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzRXF1YWxEZWVwKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIHtcbiAgdmFyIG9iaklzQXJyID0gaXNBcnJheShvYmplY3QpLFxuICAgICAgb3RoSXNBcnIgPSBpc0FycmF5KG90aGVyKSxcbiAgICAgIG9ialRhZyA9IGFycmF5VGFnLFxuICAgICAgb3RoVGFnID0gYXJyYXlUYWc7XG5cbiAgaWYgKCFvYmpJc0Fycikge1xuICAgIG9ialRhZyA9IG9ialRvU3RyaW5nLmNhbGwob2JqZWN0KTtcbiAgICBpZiAob2JqVGFnID09IGFyZ3NUYWcpIHtcbiAgICAgIG9ialRhZyA9IG9iamVjdFRhZztcbiAgICB9IGVsc2UgaWYgKG9ialRhZyAhPSBvYmplY3RUYWcpIHtcbiAgICAgIG9iaklzQXJyID0gaXNUeXBlZEFycmF5KG9iamVjdCk7XG4gICAgfVxuICB9XG4gIGlmICghb3RoSXNBcnIpIHtcbiAgICBvdGhUYWcgPSBvYmpUb1N0cmluZy5jYWxsKG90aGVyKTtcbiAgICBpZiAob3RoVGFnID09IGFyZ3NUYWcpIHtcbiAgICAgIG90aFRhZyA9IG9iamVjdFRhZztcbiAgICB9IGVsc2UgaWYgKG90aFRhZyAhPSBvYmplY3RUYWcpIHtcbiAgICAgIG90aElzQXJyID0gaXNUeXBlZEFycmF5KG90aGVyKTtcbiAgICB9XG4gIH1cbiAgdmFyIG9iaklzT2JqID0gb2JqVGFnID09IG9iamVjdFRhZyxcbiAgICAgIG90aElzT2JqID0gb3RoVGFnID09IG9iamVjdFRhZyxcbiAgICAgIGlzU2FtZVRhZyA9IG9ialRhZyA9PSBvdGhUYWc7XG5cbiAgaWYgKGlzU2FtZVRhZyAmJiAhKG9iaklzQXJyIHx8IG9iaklzT2JqKSkge1xuICAgIHJldHVybiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIG9ialRhZyk7XG4gIH1cbiAgaWYgKCFpc0xvb3NlKSB7XG4gICAgdmFyIG9iaklzV3JhcHBlZCA9IG9iaklzT2JqICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnX193cmFwcGVkX18nKSxcbiAgICAgICAgb3RoSXNXcmFwcGVkID0gb3RoSXNPYmogJiYgaGFzT3duUHJvcGVydHkuY2FsbChvdGhlciwgJ19fd3JhcHBlZF9fJyk7XG5cbiAgICBpZiAob2JqSXNXcmFwcGVkIHx8IG90aElzV3JhcHBlZCkge1xuICAgICAgcmV0dXJuIGVxdWFsRnVuYyhvYmpJc1dyYXBwZWQgPyBvYmplY3QudmFsdWUoKSA6IG9iamVjdCwgb3RoSXNXcmFwcGVkID8gb3RoZXIudmFsdWUoKSA6IG90aGVyLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgfVxuICB9XG4gIGlmICghaXNTYW1lVGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIEFzc3VtZSBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gZGV0ZWN0aW5nIGNpcmN1bGFyIHJlZmVyZW5jZXMgc2VlIGh0dHBzOi8vZXM1LmdpdGh1Yi5pby8jSk8uXG4gIHN0YWNrQSB8fCAoc3RhY2tBID0gW10pO1xuICBzdGFja0IgfHwgKHN0YWNrQiA9IFtdKTtcblxuICB2YXIgbGVuZ3RoID0gc3RhY2tBLmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKHN0YWNrQVtsZW5ndGhdID09IG9iamVjdCkge1xuICAgICAgcmV0dXJuIHN0YWNrQltsZW5ndGhdID09IG90aGVyO1xuICAgIH1cbiAgfVxuICAvLyBBZGQgYG9iamVjdGAgYW5kIGBvdGhlcmAgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICBzdGFja0EucHVzaChvYmplY3QpO1xuICBzdGFja0IucHVzaChvdGhlcik7XG5cbiAgdmFyIHJlc3VsdCA9IChvYmpJc0FyciA/IGVxdWFsQXJyYXlzIDogZXF1YWxPYmplY3RzKShvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGlzTG9vc2UsIHN0YWNrQSwgc3RhY2tCKTtcblxuICBzdGFja0EucG9wKCk7XG4gIHN0YWNrQi5wb3AoKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsRGVlcDtcbiIsInZhciBiYXNlSXNFcXVhbCA9IHJlcXVpcmUoJy4vYmFzZUlzRXF1YWwnKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc01hdGNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge0FycmF5fSBtYXRjaERhdGEgVGhlIHByb3BlcnkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3MgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgb2JqZWN0YCBpcyBhIG1hdGNoLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc01hdGNoKG9iamVjdCwgbWF0Y2hEYXRhLCBjdXN0b21pemVyKSB7XG4gIHZhciBpbmRleCA9IG1hdGNoRGF0YS5sZW5ndGgsXG4gICAgICBsZW5ndGggPSBpbmRleCxcbiAgICAgIG5vQ3VzdG9taXplciA9ICFjdXN0b21pemVyO1xuXG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiAhbGVuZ3RoO1xuICB9XG4gIG9iamVjdCA9IHRvT2JqZWN0KG9iamVjdCk7XG4gIHdoaWxlIChpbmRleC0tKSB7XG4gICAgdmFyIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgIGlmICgobm9DdXN0b21pemVyICYmIGRhdGFbMl0pXG4gICAgICAgICAgPyBkYXRhWzFdICE9PSBvYmplY3RbZGF0YVswXV1cbiAgICAgICAgICA6ICEoZGF0YVswXSBpbiBvYmplY3QpXG4gICAgICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgIHZhciBrZXkgPSBkYXRhWzBdLFxuICAgICAgICBvYmpWYWx1ZSA9IG9iamVjdFtrZXldLFxuICAgICAgICBzcmNWYWx1ZSA9IGRhdGFbMV07XG5cbiAgICBpZiAobm9DdXN0b21pemVyICYmIGRhdGFbMl0pIHtcbiAgICAgIGlmIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzdWx0ID0gY3VzdG9taXplciA/IGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXkpIDogdW5kZWZpbmVkO1xuICAgICAgaWYgKCEocmVzdWx0ID09PSB1bmRlZmluZWQgPyBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIGN1c3RvbWl6ZXIsIHRydWUpIDogcmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc01hdGNoO1xuIiwidmFyIGJhc2VFYWNoID0gcmVxdWlyZSgnLi9iYXNlRWFjaCcpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hcGAgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFjayBzaG9ydGhhbmRzXG4gKiBhbmQgYHRoaXNgIGJpbmRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBiYXNlTWFwKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gaXNBcnJheUxpa2UoY29sbGVjdGlvbikgPyBBcnJheShjb2xsZWN0aW9uLmxlbmd0aCkgOiBbXTtcblxuICBiYXNlRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gaXRlcmF0ZWUodmFsdWUsIGtleSwgY29sbGVjdGlvbik7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VNYXA7XG4iLCJ2YXIgYmFzZUlzTWF0Y2ggPSByZXF1aXJlKCcuL2Jhc2VJc01hdGNoJyksXG4gICAgZ2V0TWF0Y2hEYXRhID0gcmVxdWlyZSgnLi9nZXRNYXRjaERhdGEnKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXRjaGVzYCB3aGljaCBkb2VzIG5vdCBjbG9uZSBgc291cmNlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBtYXRjaC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlcyhzb3VyY2UpIHtcbiAgdmFyIG1hdGNoRGF0YSA9IGdldE1hdGNoRGF0YShzb3VyY2UpO1xuICBpZiAobWF0Y2hEYXRhLmxlbmd0aCA9PSAxICYmIG1hdGNoRGF0YVswXVsyXSkge1xuICAgIHZhciBrZXkgPSBtYXRjaERhdGFbMF1bMF0sXG4gICAgICAgIHZhbHVlID0gbWF0Y2hEYXRhWzBdWzFdO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmplY3Rba2V5XSA9PT0gdmFsdWUgJiYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwgKGtleSBpbiB0b09iamVjdChvYmplY3QpKSk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIGJhc2VJc01hdGNoKG9iamVjdCwgbWF0Y2hEYXRhKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWF0Y2hlcztcbiIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9iYXNlR2V0JyksXG4gICAgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCcuL2Jhc2VJc0VxdWFsJyksXG4gICAgYmFzZVNsaWNlID0gcmVxdWlyZSgnLi9iYXNlU2xpY2UnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5JyksXG4gICAgaXNLZXkgPSByZXF1aXJlKCcuL2lzS2V5JyksXG4gICAgaXNTdHJpY3RDb21wYXJhYmxlID0gcmVxdWlyZSgnLi9pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBsYXN0ID0gcmVxdWlyZSgnLi4vYXJyYXkvbGFzdCcpLFxuICAgIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi90b09iamVjdCcpLFxuICAgIHRvUGF0aCA9IHJlcXVpcmUoJy4vdG9QYXRoJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWF0Y2hlc1Byb3BlcnR5YCB3aGljaCBkb2VzIG5vdCBjbG9uZSBgc3JjVmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlc1Byb3BlcnR5KHBhdGgsIHNyY1ZhbHVlKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkocGF0aCksXG4gICAgICBpc0NvbW1vbiA9IGlzS2V5KHBhdGgpICYmIGlzU3RyaWN0Q29tcGFyYWJsZShzcmNWYWx1ZSksXG4gICAgICBwYXRoS2V5ID0gKHBhdGggKyAnJyk7XG5cbiAgcGF0aCA9IHRvUGF0aChwYXRoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIga2V5ID0gcGF0aEtleTtcbiAgICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuICAgIGlmICgoaXNBcnIgfHwgIWlzQ29tbW9uKSAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG4gICAgICBvYmplY3QgPSBwYXRoLmxlbmd0aCA9PSAxID8gb2JqZWN0IDogYmFzZUdldChvYmplY3QsIGJhc2VTbGljZShwYXRoLCAwLCAtMSkpO1xuICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGtleSA9IGxhc3QocGF0aCk7XG4gICAgICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0W2tleV0gPT09IHNyY1ZhbHVlXG4gICAgICA/IChzcmNWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8IChrZXkgaW4gb2JqZWN0KSlcbiAgICAgIDogYmFzZUlzRXF1YWwoc3JjVmFsdWUsIG9iamVjdFtrZXldLCB1bmRlZmluZWQsIHRydWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VNYXRjaGVzUHJvcGVydHk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eShrZXkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VQcm9wZXJ0eTtcbiIsInZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9iYXNlR2V0JyksXG4gICAgdG9QYXRoID0gcmVxdWlyZSgnLi90b1BhdGgnKTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VQcm9wZXJ0eWAgd2hpY2ggc3VwcG9ydHMgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUHJvcGVydHlEZWVwKHBhdGgpIHtcbiAgdmFyIHBhdGhLZXkgPSAocGF0aCArICcnKTtcbiAgcGF0aCA9IHRvUGF0aChwYXRoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBiYXNlR2V0KG9iamVjdCwgcGF0aCwgcGF0aEtleSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVByb3BlcnR5RGVlcDtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uc2xpY2VgIHdpdGhvdXQgYW4gaXRlcmF0ZWUgY2FsbCBndWFyZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNsaWNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD0wXSBUaGUgc3RhcnQgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gW2VuZD1hcnJheS5sZW5ndGhdIFRoZSBlbmQgcG9zaXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHNsaWNlIG9mIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VTbGljZShhcnJheSwgc3RhcnQsIGVuZCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICBzdGFydCA9IHN0YXJ0ID09IG51bGwgPyAwIDogKCtzdGFydCB8fCAwKTtcbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gLXN0YXJ0ID4gbGVuZ3RoID8gMCA6IChsZW5ndGggKyBzdGFydCk7XG4gIH1cbiAgZW5kID0gKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IGxlbmd0aCkgPyBsZW5ndGggOiAoK2VuZCB8fCAwKTtcbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuZ3RoO1xuICB9XG4gIGxlbmd0aCA9IHN0YXJ0ID4gZW5kID8gMCA6ICgoZW5kIC0gc3RhcnQpID4+PiAwKTtcbiAgc3RhcnQgPj4+PSAwO1xuXG4gIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtpbmRleCArIHN0YXJ0XTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTbGljZTtcbiIsInZhciBiYXNlRWFjaCA9IHJlcXVpcmUoJy4vYmFzZUVhY2gnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5zb21lYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrIHNob3J0aGFuZHNcbiAqIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlcyB0aGUgcHJlZGljYXRlIGNoZWNrLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZVNvbWUoY29sbGVjdGlvbiwgcHJlZGljYXRlKSB7XG4gIHZhciByZXN1bHQ7XG5cbiAgYmFzZUVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgcmVzdWx0ID0gcHJlZGljYXRlKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgcmV0dXJuICFyZXN1bHQ7XG4gIH0pO1xuICByZXR1cm4gISFyZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVNvbWU7XG4iLCIvKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgaWYgaXQncyBub3Qgb25lLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWRcbiAqIGZvciBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6ICh2YWx1ZSArICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVG9TdHJpbmc7XG4iLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi91dGlsaXR5L2lkZW50aXR5Jyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlQ2FsbGJhY2tgIHdoaWNoIG9ubHkgc3VwcG9ydHMgYHRoaXNgIGJpbmRpbmdcbiAqIGFuZCBzcGVjaWZ5aW5nIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHByb3ZpZGUgdG8gYGZ1bmNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGJpbmRDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICBpZiAodGhpc0FyZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH1cbiAgc3dpdGNoIChhcmdDb3VudCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICAgIGNhc2UgNTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlciwga2V5LCBvYmplY3QsIHNvdXJjZSkge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgb3RoZXIsIGtleSwgb2JqZWN0LCBzb3VyY2UpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmluZENhbGxiYWNrO1xuIiwidmFyIGJpbmRDYWxsYmFjayA9IHJlcXVpcmUoJy4vYmluZENhbGxiYWNrJyksXG4gICAgaXNJdGVyYXRlZUNhbGwgPSByZXF1aXJlKCcuL2lzSXRlcmF0ZWVDYWxsJyksXG4gICAgcmVzdFBhcmFtID0gcmVxdWlyZSgnLi4vZnVuY3Rpb24vcmVzdFBhcmFtJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBfLmFzc2lnbmAsIGBfLmRlZmF1bHRzYCwgb3IgYF8ubWVyZ2VgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhc3NpZ25lciBUaGUgZnVuY3Rpb24gdG8gYXNzaWduIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFzc2lnbmVyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVBc3NpZ25lcihhc3NpZ25lcikge1xuICByZXR1cm4gcmVzdFBhcmFtKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBvYmplY3QgPT0gbnVsbCA/IDAgOiBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzW2xlbmd0aCAtIDJdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkLFxuICAgICAgICB0aGlzQXJnID0gbGVuZ3RoID4gMSA/IHNvdXJjZXNbbGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAodHlwZW9mIGN1c3RvbWl6ZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY3VzdG9taXplciA9IGJpbmRDYWxsYmFjayhjdXN0b21pemVyLCB0aGlzQXJnLCA1KTtcbiAgICAgIGxlbmd0aCAtPSAyO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXN0b21pemVyID0gdHlwZW9mIHRoaXNBcmcgPT0gJ2Z1bmN0aW9uJyA/IHRoaXNBcmcgOiB1bmRlZmluZWQ7XG4gICAgICBsZW5ndGggLT0gKGN1c3RvbWl6ZXIgPyAxIDogMCk7XG4gICAgfVxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQXNzaWduZXI7XG4iLCJ2YXIgZ2V0TGVuZ3RoID0gcmVxdWlyZSgnLi9nZXRMZW5ndGgnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uID8gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pIDogMDtcbiAgICBpZiAoIWlzTGVuZ3RoKGxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBlYWNoRnVuYyhjb2xsZWN0aW9uLCBpdGVyYXRlZSk7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IHRvT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVCYXNlRWFjaDtcbiIsInZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vdG9PYmplY3QnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgYmFzZSBmdW5jdGlvbiBmb3IgYF8uZm9ySW5gIG9yIGBfLmZvckluUmlnaHRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VGb3IoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgIHZhciBpdGVyYWJsZSA9IHRvT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGZyb21SaWdodCA/IGxlbmd0aCA6IC0xO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhc2VGb3I7XG4iLCJ2YXIgYmluZENhbGxiYWNrID0gcmVxdWlyZSgnLi9iaW5kQ2FsbGJhY2snKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGZvciBgXy5mb3JFYWNoYCBvciBgXy5mb3JFYWNoUmlnaHRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhcnJheUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciBhbiBhcnJheS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZWFjaCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRm9yRWFjaChhcnJheUZ1bmMsIGVhY2hGdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSwgdGhpc0FyZykge1xuICAgIHJldHVybiAodHlwZW9mIGl0ZXJhdGVlID09ICdmdW5jdGlvbicgJiYgdGhpc0FyZyA9PT0gdW5kZWZpbmVkICYmIGlzQXJyYXkoY29sbGVjdGlvbikpXG4gICAgICA/IGFycmF5RnVuYyhjb2xsZWN0aW9uLCBpdGVyYXRlZSlcbiAgICAgIDogZWFjaEZ1bmMoY29sbGVjdGlvbiwgYmluZENhbGxiYWNrKGl0ZXJhdGVlLCB0aGlzQXJnLCAzKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRm9yRWFjaDtcbiIsInZhciBiaW5kQ2FsbGJhY2sgPSByZXF1aXJlKCcuL2JpbmRDYWxsYmFjaycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBmb3IgYF8uZm9yT3duYCBvciBgXy5mb3JPd25SaWdodGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9iamVjdEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciBhbiBvYmplY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBlYWNoIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVGb3JPd24ob2JqZWN0RnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwgdGhpc0FyZykge1xuICAgIGlmICh0eXBlb2YgaXRlcmF0ZWUgIT0gJ2Z1bmN0aW9uJyB8fCB0aGlzQXJnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVlID0gYmluZENhbGxiYWNrKGl0ZXJhdGVlLCB0aGlzQXJnLCAzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdEZ1bmMob2JqZWN0LCBpdGVyYXRlZSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRm9yT3duO1xuIiwidmFyIGJhc2VDYWxsYmFjayA9IHJlcXVpcmUoJy4vYmFzZUNhbGxiYWNrJyksXG4gICAgYmFzZUZvck93biA9IHJlcXVpcmUoJy4vYmFzZUZvck93bicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBmb3IgYF8ubWFwS2V5c2Agb3IgYF8ubWFwVmFsdWVzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbaXNNYXBLZXlzXSBTcGVjaWZ5IG1hcHBpbmcga2V5cyBpbnN0ZWFkIG9mIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IG1hcCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT2JqZWN0TWFwcGVyKGlzTWFwS2V5cykge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwgdGhpc0FyZykge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBpdGVyYXRlZSA9IGJhc2VDYWxsYmFjayhpdGVyYXRlZSwgdGhpc0FyZywgMyk7XG5cbiAgICBiYXNlRm9yT3duKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICB2YXIgbWFwcGVkID0gaXRlcmF0ZWUodmFsdWUsIGtleSwgb2JqZWN0KTtcbiAgICAgIGtleSA9IGlzTWFwS2V5cyA/IG1hcHBlZCA6IGtleTtcbiAgICAgIHZhbHVlID0gaXNNYXBLZXlzID8gdmFsdWUgOiBtYXBwZWQ7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlT2JqZWN0TWFwcGVyO1xuIiwidmFyIGFycmF5U29tZSA9IHJlcXVpcmUoJy4vYXJyYXlTb21lJyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBhcnJheXMgd2l0aCBzdXBwb3J0IGZvclxuICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7QXJyYXl9IG90aGVyIFRoZSBvdGhlciBhcnJheSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIGFycmF5cy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzTG9vc2VdIFNwZWNpZnkgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQV0gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIG9iamVjdHMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCXSBUcmFja3MgdHJhdmVyc2VkIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsQXJyYXlzKGFycmF5LCBvdGhlciwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQikge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGFyckxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIG90aExlbmd0aCA9IG90aGVyLmxlbmd0aDtcblxuICBpZiAoYXJyTGVuZ3RoICE9IG90aExlbmd0aCAmJiAhKGlzTG9vc2UgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBJZ25vcmUgbm9uLWluZGV4IHByb3BlcnRpZXMuXG4gIHdoaWxlICgrK2luZGV4IDwgYXJyTGVuZ3RoKSB7XG4gICAgdmFyIGFyclZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2luZGV4XSxcbiAgICAgICAgcmVzdWx0ID0gY3VzdG9taXplciA/IGN1c3RvbWl6ZXIoaXNMb29zZSA/IG90aFZhbHVlIDogYXJyVmFsdWUsIGlzTG9vc2UgPyBhcnJWYWx1ZSA6IG90aFZhbHVlLCBpbmRleCkgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgaWYgKGlzTG9vc2UpIHtcbiAgICAgIGlmICghYXJyYXlTb21lKG90aGVyLCBmdW5jdGlvbihvdGhWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFyclZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHwgZXF1YWxGdW5jKGFyclZhbHVlLCBvdGhWYWx1ZSwgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbEFycmF5cztcbiIsIi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3IgY29tcGFyaW5nIG9iamVjdHMgb2ZcbiAqIHRoZSBzYW1lIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjb21wYXJpbmcgdmFsdWVzIHdpdGggdGFncyBvZlxuICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGB0b1N0cmluZ1RhZ2Agb2YgdGhlIG9iamVjdHMgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIHRhZykge1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgYm9vbFRhZzpcbiAgICBjYXNlIGRhdGVUYWc6XG4gICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWJlcnMsIGRhdGVzIHRvIG1pbGxpc2Vjb25kcyBhbmQgYm9vbGVhbnNcbiAgICAgIC8vIHRvIGAxYCBvciBgMGAgdHJlYXRpbmcgaW52YWxpZCBkYXRlcyBjb2VyY2VkIHRvIGBOYU5gIGFzIG5vdCBlcXVhbC5cbiAgICAgIHJldHVybiArb2JqZWN0ID09ICtvdGhlcjtcblxuICAgIGNhc2UgZXJyb3JUYWc6XG4gICAgICByZXR1cm4gb2JqZWN0Lm5hbWUgPT0gb3RoZXIubmFtZSAmJiBvYmplY3QubWVzc2FnZSA9PSBvdGhlci5tZXNzYWdlO1xuXG4gICAgY2FzZSBudW1iZXJUYWc6XG4gICAgICAvLyBUcmVhdCBgTmFOYCB2cy4gYE5hTmAgYXMgZXF1YWwuXG4gICAgICByZXR1cm4gKG9iamVjdCAhPSArb2JqZWN0KVxuICAgICAgICA/IG90aGVyICE9ICtvdGhlclxuICAgICAgICA6IG9iamVjdCA9PSArb3RoZXI7XG5cbiAgICBjYXNlIHJlZ2V4cFRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIC8vIENvZXJjZSByZWdleGVzIHRvIHN0cmluZ3MgYW5kIHRyZWF0IHN0cmluZ3MgcHJpbWl0aXZlcyBhbmQgc3RyaW5nXG4gICAgICAvLyBvYmplY3RzIGFzIGVxdWFsLiBTZWUgaHR0cHM6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMTAuNi40IGZvciBtb3JlIGRldGFpbHMuXG4gICAgICByZXR1cm4gb2JqZWN0ID09IChvdGhlciArICcnKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxCeVRhZztcbiIsInZhciBrZXlzID0gcmVxdWlyZSgnLi4vb2JqZWN0L2tleXMnKTtcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBvYmplY3RzIHdpdGggc3VwcG9ydCBmb3JcbiAqIHBhcnRpYWwgZGVlcCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzTG9vc2VdIFNwZWNpZnkgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQV0gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIG9iamVjdHMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCXSBUcmFja3MgdHJhdmVyc2VkIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBlcXVhbE9iamVjdHMob2JqZWN0LCBvdGhlciwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBpc0xvb3NlLCBzdGFja0EsIHN0YWNrQikge1xuICB2YXIgb2JqUHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICBvYmpMZW5ndGggPSBvYmpQcm9wcy5sZW5ndGgsXG4gICAgICBvdGhQcm9wcyA9IGtleXMob3RoZXIpLFxuICAgICAgb3RoTGVuZ3RoID0gb3RoUHJvcHMubGVuZ3RoO1xuXG4gIGlmIChvYmpMZW5ndGggIT0gb3RoTGVuZ3RoICYmICFpc0xvb3NlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBpbmRleCA9IG9iakxlbmd0aDtcbiAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICB2YXIga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuICAgIGlmICghKGlzTG9vc2UgPyBrZXkgaW4gb3RoZXIgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG90aGVyLCBrZXkpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICB2YXIgc2tpcEN0b3IgPSBpc0xvb3NlO1xuICB3aGlsZSAoKytpbmRleCA8IG9iakxlbmd0aCkge1xuICAgIGtleSA9IG9ialByb3BzW2luZGV4XTtcbiAgICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgb3RoVmFsdWUgPSBvdGhlcltrZXldLFxuICAgICAgICByZXN1bHQgPSBjdXN0b21pemVyID8gY3VzdG9taXplcihpc0xvb3NlID8gb3RoVmFsdWUgOiBvYmpWYWx1ZSwgaXNMb29zZT8gb2JqVmFsdWUgOiBvdGhWYWx1ZSwga2V5KSA6IHVuZGVmaW5lZDtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIGlmICghKHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gZXF1YWxGdW5jKG9ialZhbHVlLCBvdGhWYWx1ZSwgY3VzdG9taXplciwgaXNMb29zZSwgc3RhY2tBLCBzdGFja0IpIDogcmVzdWx0KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBza2lwQ3RvciB8fCAoc2tpcEN0b3IgPSBrZXkgPT0gJ2NvbnN0cnVjdG9yJyk7XG4gIH1cbiAgaWYgKCFza2lwQ3Rvcikge1xuICAgIHZhciBvYmpDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yLFxuICAgICAgICBvdGhDdG9yID0gb3RoZXIuY29uc3RydWN0b3I7XG5cbiAgICAvLyBOb24gYE9iamVjdGAgb2JqZWN0IGluc3RhbmNlcyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVhbC5cbiAgICBpZiAob2JqQ3RvciAhPSBvdGhDdG9yICYmXG4gICAgICAgICgnY29uc3RydWN0b3InIGluIG9iamVjdCAmJiAnY29uc3RydWN0b3InIGluIG90aGVyKSAmJlxuICAgICAgICAhKHR5cGVvZiBvYmpDdG9yID09ICdmdW5jdGlvbicgJiYgb2JqQ3RvciBpbnN0YW5jZW9mIG9iakN0b3IgJiZcbiAgICAgICAgICB0eXBlb2Ygb3RoQ3RvciA9PSAnZnVuY3Rpb24nICYmIG90aEN0b3IgaW5zdGFuY2VvZiBvdGhDdG9yKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcXVhbE9iamVjdHM7XG4iLCJ2YXIgYmFzZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9iYXNlUHJvcGVydHknKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBcImxlbmd0aFwiIHByb3BlcnR5IHZhbHVlIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXZvaWQgYSBbSklUIGJ1Z10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE0Mjc5MilcbiAqIHRoYXQgYWZmZWN0cyBTYWZhcmkgb24gYXQgbGVhc3QgaU9TIDguMS04LjMgQVJNNjQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIHZhbHVlLlxuICovXG52YXIgZ2V0TGVuZ3RoID0gYmFzZVByb3BlcnR5KCdsZW5ndGgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRMZW5ndGg7XG4iLCJ2YXIgaXNTdHJpY3RDb21wYXJhYmxlID0gcmVxdWlyZSgnLi9pc1N0cmljdENvbXBhcmFibGUnKSxcbiAgICBwYWlycyA9IHJlcXVpcmUoJy4uL29iamVjdC9wYWlycycpO1xuXG4vKipcbiAqIEdldHMgdGhlIHByb3BlcnkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3Mgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbWF0Y2ggZGF0YSBvZiBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF0Y2hEYXRhKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gcGFpcnMob2JqZWN0KSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgcmVzdWx0W2xlbmd0aF1bMl0gPSBpc1N0cmljdENvbXBhcmFibGUocmVzdWx0W2xlbmd0aF1bMV0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWF0Y2hEYXRhO1xuIiwidmFyIGlzTmF0aXZlID0gcmVxdWlyZSgnLi4vbGFuZy9pc05hdGl2ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgcmV0dXJuIGlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcbiIsInZhciBnZXRMZW5ndGggPSByZXF1aXJlKCcuL2dldExlbmd0aCcpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aChnZXRMZW5ndGgodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5TGlrZTtcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eXFxkKyQvO1xuXG4vKipcbiAqIFVzZWQgYXMgdGhlIFttYXhpbXVtIGxlbmd0aF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtbnVtYmVyLm1heF9zYWZlX2ludGVnZXIpXG4gKiBvZiBhbiBhcnJheS1saWtlIHZhbHVlLlxuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIHZhbHVlID0gKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgPyArdmFsdWUgOiAtMTtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuICByZXR1cm4gdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0luZGV4O1xuIiwidmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL2lzSW5kZXgnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIHByb3ZpZGVkIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdCkpIHtcbiAgICB2YXIgb3RoZXIgPSBvYmplY3RbaW5kZXhdO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdmFsdWUgPyAodmFsdWUgPT09IG90aGVyKSA6IChvdGhlciAhPT0gb3RoZXIpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0l0ZXJhdGVlQ2FsbDtcbiIsInZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5JyksXG4gICAgdG9PYmplY3QgPSByZXF1aXJlKCcuL3RvT2JqZWN0Jyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIHdpdGhpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZUlzRGVlcFByb3AgPSAvXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXG5cXFxcXXxcXFxcLikqP1xcMSlcXF0vLFxuICAgIHJlSXNQbGFpblByb3AgPSAvXlxcdyokLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHByb3BlcnR5IG5hbWUgYW5kIG5vdCBhIHByb3BlcnR5IHBhdGguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkga2V5cyBvbi5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleSh2YWx1ZSwgb2JqZWN0KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBpZiAoKHR5cGUgPT0gJ3N0cmluZycgJiYgcmVJc1BsYWluUHJvcC50ZXN0KHZhbHVlKSkgfHwgdHlwZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gIXJlSXNEZWVwUHJvcC50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIHJlc3VsdCB8fCAob2JqZWN0ICE9IG51bGwgJiYgdmFsdWUgaW4gdG9PYmplY3Qob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXk7XG4iLCIvKipcbiAqIFVzZWQgYXMgdGhlIFttYXhpbXVtIGxlbmd0aF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtbnVtYmVyLm1heF9zYWZlX2ludGVnZXIpXG4gKiBvZiBhbiBhcnJheS1saWtlIHZhbHVlLlxuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyBiYXNlZCBvbiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiYgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlmIHN1aXRhYmxlIGZvciBzdHJpY3RcbiAqICBlcXVhbGl0eSBjb21wYXJpc29ucywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSAmJiAhaXNPYmplY3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaWN0Q29tcGFyYWJsZTtcbiIsInZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5JyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vaXNJbmRleCcpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4uL29iamVjdC9rZXlzSW4nKTtcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIGNyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlXG4gKiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gc2hpbUtleXMob2JqZWN0KSB7XG4gIHZhciBwcm9wcyA9IGtleXNJbihvYmplY3QpLFxuICAgICAgcHJvcHNMZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICBsZW5ndGggPSBwcm9wc0xlbmd0aCAmJiBvYmplY3QubGVuZ3RoO1xuXG4gIHZhciBhbGxvd0luZGV4ZXMgPSAhIWxlbmd0aCAmJiBpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgcHJvcHNMZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgIGlmICgoYWxsb3dJbmRleGVzICYmIGlzSW5kZXgoa2V5LCBsZW5ndGgpKSB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaGltS2V5cztcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGFuIG9iamVjdCBpZiBpdCdzIG5vdCBvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHRvT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWx1ZSkgPyB2YWx1ZSA6IE9iamVjdCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9PYmplY3Q7XG4iLCJ2YXIgYmFzZVRvU3RyaW5nID0gcmVxdWlyZSgnLi9iYXNlVG9TdHJpbmcnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIHdpdGhpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZVByb3BOYW1lID0gL1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggYmFja3NsYXNoZXMgaW4gcHJvcGVydHkgcGF0aHMuICovXG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBwcm9wZXJ0eSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gdG9QYXRoKHZhbHVlKSB7XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGJhc2VUb1N0cmluZyh2YWx1ZSkucmVwbGFjZShyZVByb3BOYW1lLCBmdW5jdGlvbihtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3RyaW5nKSB7XG4gICAgcmVzdWx0LnB1c2gocXVvdGUgPyBzdHJpbmcucmVwbGFjZShyZUVzY2FwZUNoYXIsICckMScpIDogKG51bWJlciB8fCBtYXRjaCkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1BhdGg7XG4iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0FycmF5TGlrZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzQXJyYXlMaWtlKHZhbHVlKSAmJlxuICAgIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJiAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJndW1lbnRzO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2dldE5hdGl2ZScpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9ialRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNBcnJheSA9IGdldE5hdGl2ZShBcnJheSwgJ2lzQXJyYXknKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcnJheVRhZztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqVG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmkgd2hpY2ggcmV0dXJuICdmdW5jdGlvbicgZm9yIHJlZ2V4ZXNcbiAgLy8gYW5kIFNhZmFyaSA4IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5IGNvbnN0cnVjdG9ycy5cbiAgcmV0dXJuIGlzT2JqZWN0KHZhbHVlKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBmdW5jVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSA+IDUpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZm5Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZuVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZSgvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2csICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNOYXRpdmUoQXJyYXkucHJvdG90eXBlLnB1c2gpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNOYXRpdmUoXyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICByZXR1cm4gcmVJc05hdGl2ZS50ZXN0KGZuVG9TdHJpbmcuY2FsbCh2YWx1ZSkpO1xuICB9XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIHJlSXNIb3N0Q3Rvci50ZXN0KHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05hdGl2ZTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlIFtsYW5ndWFnZSB0eXBlXShodHRwczovL2VzNS5naXRodWIuaW8vI3g4KSBvZiBgT2JqZWN0YC5cbiAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoMSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAvLyBBdm9pZCBhIFY4IEpJVCBidWcgaW4gQ2hyb21lIDE5LTIwLlxuICAvLyBTZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTIyOTEgZm9yIG1vcmUgZGV0YWlscy5cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCJ2YXIgaXNMZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9XG50eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9IHR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3Nbb2JqVG9TdHJpbmcuY2FsbCh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcbiIsInZhciBhc3NpZ25XaXRoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYXNzaWduV2l0aCcpLFxuICAgIGJhc2VBc3NpZ24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9iYXNlQXNzaWduJyksXG4gICAgY3JlYXRlQXNzaWduZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9jcmVhdGVBc3NpZ25lcicpO1xuXG4vKipcbiAqIEFzc2lnbnMgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBzb3VyY2Ugb2JqZWN0KHMpIHRvIHRoZSBkZXN0aW5hdGlvblxuICogb2JqZWN0LiBTdWJzZXF1ZW50IHNvdXJjZXMgb3ZlcndyaXRlIHByb3BlcnR5IGFzc2lnbm1lbnRzIG9mIHByZXZpb3VzIHNvdXJjZXMuXG4gKiBJZiBgY3VzdG9taXplcmAgaXMgcHJvdmlkZWQgaXQncyBpbnZva2VkIHRvIHByb2R1Y2UgdGhlIGFzc2lnbmVkIHZhbHVlcy5cbiAqIFRoZSBgY3VzdG9taXplcmAgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggZml2ZSBhcmd1bWVudHM6XG4gKiAob2JqZWN0VmFsdWUsIHNvdXJjZVZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YCBhbmQgaXMgYmFzZWQgb25cbiAqIFtgT2JqZWN0LmFzc2lnbmBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5hc3NpZ24pLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAYWxpYXMgZXh0ZW5kXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZXNdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY3VzdG9taXplcmAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmFzc2lnbih7ICd1c2VyJzogJ2Jhcm5leScgfSwgeyAnYWdlJzogNDAgfSwgeyAndXNlcic6ICdmcmVkJyB9KTtcbiAqIC8vID0+IHsgJ3VzZXInOiAnZnJlZCcsICdhZ2UnOiA0MCB9XG4gKlxuICogLy8gdXNpbmcgYSBjdXN0b21pemVyIGNhbGxiYWNrXG4gKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbiwgZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gKiAgIHJldHVybiBfLmlzVW5kZWZpbmVkKHZhbHVlKSA/IG90aGVyIDogdmFsdWU7XG4gKiB9KTtcbiAqXG4gKiBkZWZhdWx0cyh7ICd1c2VyJzogJ2Jhcm5leScgfSwgeyAnYWdlJzogMzYgfSwgeyAndXNlcic6ICdmcmVkJyB9KTtcbiAqIC8vID0+IHsgJ3VzZXInOiAnYmFybmV5JywgJ2FnZSc6IDM2IH1cbiAqL1xudmFyIGFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBjdXN0b21pemVyKSB7XG4gIHJldHVybiBjdXN0b21pemVyXG4gICAgPyBhc3NpZ25XaXRoKG9iamVjdCwgc291cmNlLCBjdXN0b21pemVyKVxuICAgIDogYmFzZUFzc2lnbihvYmplY3QsIHNvdXJjZSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhc3NpZ247XG4iLCJ2YXIgYmFzZUZvck93biA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VGb3JPd24nKSxcbiAgICBjcmVhdGVGb3JPd24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9jcmVhdGVGb3JPd24nKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0IGludm9raW5nIGBpdGVyYXRlZWBcbiAqIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgYGl0ZXJhdGVlYCBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aFxuICogdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIGtleSwgb2JqZWN0KS4gSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvblxuICogZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBpdGVyYXRlZWAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmZvck93bihuZXcgRm9vLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IGxvZ3MgJ2EnIGFuZCAnYicgKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xudmFyIGZvck93biA9IGNyZWF0ZUZvck93bihiYXNlRm9yT3duKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JPd247XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvZ2V0TmF0aXZlJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0FycmF5TGlrZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9pc09iamVjdCcpLFxuICAgIHNoaW1LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvc2hpbUtleXMnKTtcblxuLyogTmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2tleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xudmFyIGtleXMgPSAhbmF0aXZlS2V5cyA/IHNoaW1LZXlzIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBDdG9yID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3QuY29uc3RydWN0b3I7XG4gIGlmICgodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSA9PT0gb2JqZWN0KSB8fFxuICAgICAgKHR5cGVvZiBvYmplY3QgIT0gJ2Z1bmN0aW9uJyAmJiBpc0FycmF5TGlrZShvYmplY3QpKSkge1xuICAgIHJldHVybiBzaGltS2V5cyhvYmplY3QpO1xuICB9XG4gIHJldHVybiBpc09iamVjdChvYmplY3QpID8gbmF0aXZlS2V5cyhvYmplY3QpIDogW107XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG4iLCJ2YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0luZGV4JyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9pc09iamVjdCcpO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgfVxuICB2YXIgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDtcbiAgbGVuZ3RoID0gKGxlbmd0aCAmJiBpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKSAmJiBsZW5ndGgpIHx8IDA7XG5cbiAgdmFyIEN0b3IgPSBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICBpbmRleCA9IC0xLFxuICAgICAgaXNQcm90byA9IHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUgPT09IG9iamVjdCxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCksXG4gICAgICBza2lwSW5kZXhlcyA9IGxlbmd0aCA+IDA7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICByZXN1bHRbaW5kZXhdID0gKGluZGV4ICsgJycpO1xuICB9XG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShza2lwSW5kZXhlcyAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSkgJiZcbiAgICAgICAgIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzSW47XG4iLCJ2YXIgY3JlYXRlT2JqZWN0TWFwcGVyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvY3JlYXRlT2JqZWN0TWFwcGVyJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBrZXlzIGFzIGBvYmplY3RgIGFuZCB2YWx1ZXMgZ2VuZXJhdGVkIGJ5XG4gKiBydW5uaW5nIGVhY2ggb3duIGVudW1lcmFibGUgcHJvcGVydHkgb2YgYG9iamVjdGAgdGhyb3VnaCBgaXRlcmF0ZWVgLiBUaGVcbiAqIGl0ZXJhdGVlIGZ1bmN0aW9uIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICh2YWx1ZSwga2V5LCBvYmplY3QpLlxuICpcbiAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGl0ZXJhdGVlYCB0aGUgY3JlYXRlZCBgXy5wcm9wZXJ0eWBcbiAqIHN0eWxlIGNhbGxiYWNrIHJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICpcbiAqIElmIGEgdmFsdWUgaXMgYWxzbyBwcm92aWRlZCBmb3IgYHRoaXNBcmdgIHRoZSBjcmVhdGVkIGBfLm1hdGNoZXNQcm9wZXJ0eWBcbiAqIHN0eWxlIGNhbGxiYWNrIHJldHVybnMgYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgYSBtYXRjaGluZyBwcm9wZXJ0eVxuICogdmFsdWUsIGVsc2UgYGZhbHNlYC5cbiAqXG4gKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBpdGVyYXRlZWAgdGhlIGNyZWF0ZWQgYF8ubWF0Y2hlc2Agc3R5bGVcbiAqIGNhbGxiYWNrIHJldHVybnMgYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuXG4gKiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkXG4gKiAgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgaXRlcmF0ZWVgLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG1hcHBlZCBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8ubWFwVmFsdWVzKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24obikge1xuICogICByZXR1cm4gbiAqIDM7XG4gKiB9KTtcbiAqIC8vID0+IHsgJ2EnOiAzLCAnYic6IDYgfVxuICpcbiAqIHZhciB1c2VycyA9IHtcbiAqICAgJ2ZyZWQnOiAgICB7ICd1c2VyJzogJ2ZyZWQnLCAgICAnYWdlJzogNDAgfSxcbiAqICAgJ3BlYmJsZXMnOiB7ICd1c2VyJzogJ3BlYmJsZXMnLCAnYWdlJzogMSB9XG4gKiB9O1xuICpcbiAqIC8vIHVzaW5nIHRoZSBgXy5wcm9wZXJ0eWAgY2FsbGJhY2sgc2hvcnRoYW5kXG4gKiBfLm1hcFZhbHVlcyh1c2VycywgJ2FnZScpO1xuICogLy8gPT4geyAnZnJlZCc6IDQwLCAncGViYmxlcyc6IDEgfSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG52YXIgbWFwVmFsdWVzID0gY3JlYXRlT2JqZWN0TWFwcGVyKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwVmFsdWVzO1xuIiwidmFyIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKSxcbiAgICB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL3RvT2JqZWN0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHR3byBkaW1lbnNpb25hbCBhcnJheSBvZiB0aGUga2V5LXZhbHVlIHBhaXJzIGZvciBgb2JqZWN0YCxcbiAqIGUuZy4gYFtba2V5MSwgdmFsdWUxXSwgW2tleTIsIHZhbHVlMl1dYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnBhaXJzKHsgJ2Jhcm5leSc6IDM2LCAnZnJlZCc6IDQwIH0pO1xuICogLy8gPT4gW1snYmFybmV5JywgMzZdLCBbJ2ZyZWQnLCA0MF1dIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIHBhaXJzKG9iamVjdCkge1xuICBvYmplY3QgPSB0b09iamVjdChvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICByZXN1bHRbaW5kZXhdID0gW2tleSwgb2JqZWN0W2tleV1dO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFpcnM7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IHByb3ZpZGVkIHRvIGl0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0eVxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAndXNlcic6ICdmcmVkJyB9O1xuICpcbiAqIF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0O1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaWRlbnRpdHk7XG4iLCJ2YXIgYmFzZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYmFzZVByb3BlcnR5JyksXG4gICAgYmFzZVByb3BlcnR5RGVlcCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VQcm9wZXJ0eURlZXAnKSxcbiAgICBpc0tleSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzS2V5Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUgYXQgYHBhdGhgIG9uIGFcbiAqIGdpdmVuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdHlcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbXG4gKiAgIHsgJ2EnOiB7ICdiJzogeyAnYyc6IDIgfSB9IH0sXG4gKiAgIHsgJ2EnOiB7ICdiJzogeyAnYyc6IDEgfSB9IH1cbiAqIF07XG4gKlxuICogXy5tYXAob2JqZWN0cywgXy5wcm9wZXJ0eSgnYS5iLmMnKSk7XG4gKiAvLyA9PiBbMiwgMV1cbiAqXG4gKiBfLnBsdWNrKF8uc29ydEJ5KG9iamVjdHMsIF8ucHJvcGVydHkoWydhJywgJ2InLCAnYyddKSksICdhLmIuYycpO1xuICogLy8gPT4gWzEsIDJdXG4gKi9cbmZ1bmN0aW9uIHByb3BlcnR5KHBhdGgpIHtcbiAgcmV0dXJuIGlzS2V5KHBhdGgpID8gYmFzZVByb3BlcnR5KHBhdGgpIDogYmFzZVByb3BlcnR5RGVlcChwYXRoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wZXJ0eTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB1cmwgPSByZXF1aXJlKCcuL3VybCcpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJ3NvY2tldC5pby1wYXJzZXInKTtcbnZhciBNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NrZXQuaW8tY2xpZW50Jyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gbG9va3VwO1xuXG4vKipcbiAqIE1hbmFnZXJzIGNhY2hlLlxuICovXG5cbnZhciBjYWNoZSA9IGV4cG9ydHMubWFuYWdlcnMgPSB7fTtcblxuLyoqXG4gKiBMb29rcyB1cCBhbiBleGlzdGluZyBgTWFuYWdlcmAgZm9yIG11bHRpcGxleGluZy5cbiAqIElmIHRoZSB1c2VyIHN1bW1vbnM6XG4gKlxuICogICBgaW8oJ2h0dHA6Ly9sb2NhbGhvc3QvYScpO2BcbiAqICAgYGlvKCdodHRwOi8vbG9jYWxob3N0L2InKTtgXG4gKlxuICogV2UgcmV1c2UgdGhlIGV4aXN0aW5nIGluc3RhbmNlIGJhc2VkIG9uIHNhbWUgc2NoZW1lL3BvcnQvaG9zdCxcbiAqIGFuZCB3ZSBpbml0aWFsaXplIHNvY2tldHMgZm9yIGVhY2ggbmFtZXNwYWNlLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9va3VwKHVyaSwgb3B0cykge1xuICBpZiAodHlwZW9mIHVyaSA9PSAnb2JqZWN0Jykge1xuICAgIG9wdHMgPSB1cmk7XG4gICAgdXJpID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgdmFyIHBhcnNlZCA9IHVybCh1cmkpO1xuICB2YXIgc291cmNlID0gcGFyc2VkLnNvdXJjZTtcbiAgdmFyIGlkID0gcGFyc2VkLmlkO1xuICB2YXIgcGF0aCA9IHBhcnNlZC5wYXRoO1xuICB2YXIgc2FtZU5hbWVzcGFjZSA9IGNhY2hlW2lkXSAmJiBwYXRoIGluIGNhY2hlW2lkXS5uc3BzO1xuICB2YXIgbmV3Q29ubmVjdGlvbiA9IG9wdHMuZm9yY2VOZXcgfHwgb3B0c1snZm9yY2UgbmV3IGNvbm5lY3Rpb24nXSB8fFxuICAgICAgICAgICAgICAgICAgICAgIGZhbHNlID09PSBvcHRzLm11bHRpcGxleCB8fCBzYW1lTmFtZXNwYWNlO1xuXG4gIHZhciBpbztcblxuICBpZiAobmV3Q29ubmVjdGlvbikge1xuICAgIGRlYnVnKCdpZ25vcmluZyBzb2NrZXQgY2FjaGUgZm9yICVzJywgc291cmNlKTtcbiAgICBpbyA9IE1hbmFnZXIoc291cmNlLCBvcHRzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWNhY2hlW2lkXSkge1xuICAgICAgZGVidWcoJ25ldyBpbyBpbnN0YW5jZSBmb3IgJXMnLCBzb3VyY2UpO1xuICAgICAgY2FjaGVbaWRdID0gTWFuYWdlcihzb3VyY2UsIG9wdHMpO1xuICAgIH1cbiAgICBpbyA9IGNhY2hlW2lkXTtcbiAgfVxuXG4gIHJldHVybiBpby5zb2NrZXQocGFyc2VkLnBhdGgpO1xufVxuXG4vKipcbiAqIFByb3RvY29sIHZlcnNpb24uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnByb3RvY29sID0gcGFyc2VyLnByb3RvY29sO1xuXG4vKipcbiAqIGBjb25uZWN0YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJpXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuY29ubmVjdCA9IGxvb2t1cDtcblxuLyoqXG4gKiBFeHBvc2UgY29uc3RydWN0b3JzIGZvciBzdGFuZGFsb25lIGJ1aWxkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5NYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyJyk7XG5leHBvcnRzLlNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0Jyk7XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgZWlvID0gcmVxdWlyZSgnZW5naW5lLmlvLWNsaWVudCcpO1xudmFyIFNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0Jyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnc29ja2V0LmlvLXBhcnNlcicpO1xudmFyIG9uID0gcmVxdWlyZSgnLi9vbicpO1xudmFyIGJpbmQgPSByZXF1aXJlKCdjb21wb25lbnQtYmluZCcpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2V0LmlvLWNsaWVudDptYW5hZ2VyJyk7XG52YXIgaW5kZXhPZiA9IHJlcXVpcmUoJ2luZGV4b2YnKTtcbnZhciBCYWNrb2ZmID0gcmVxdWlyZSgnYmFja28yJyk7XG5cbi8qKlxuICogSUU2KyBoYXNPd25Qcm9wZXJ0eVxuICovXG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBNYW5hZ2VyO1xuXG4vKipcbiAqIGBNYW5hZ2VyYCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZW5naW5lIGluc3RhbmNlIG9yIGVuZ2luZSB1cmkvb3B0c1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gTWFuYWdlcih1cmksIG9wdHMpe1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTWFuYWdlcikpIHJldHVybiBuZXcgTWFuYWdlcih1cmksIG9wdHMpO1xuICBpZiAodXJpICYmICgnb2JqZWN0JyA9PSB0eXBlb2YgdXJpKSkge1xuICAgIG9wdHMgPSB1cmk7XG4gICAgdXJpID0gdW5kZWZpbmVkO1xuICB9XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gIG9wdHMucGF0aCA9IG9wdHMucGF0aCB8fCAnL3NvY2tldC5pbyc7XG4gIHRoaXMubnNwcyA9IHt9O1xuICB0aGlzLnN1YnMgPSBbXTtcbiAgdGhpcy5vcHRzID0gb3B0cztcbiAgdGhpcy5yZWNvbm5lY3Rpb24ob3B0cy5yZWNvbm5lY3Rpb24gIT09IGZhbHNlKTtcbiAgdGhpcy5yZWNvbm5lY3Rpb25BdHRlbXB0cyhvcHRzLnJlY29ubmVjdGlvbkF0dGVtcHRzIHx8IEluZmluaXR5KTtcbiAgdGhpcy5yZWNvbm5lY3Rpb25EZWxheShvcHRzLnJlY29ubmVjdGlvbkRlbGF5IHx8IDEwMDApO1xuICB0aGlzLnJlY29ubmVjdGlvbkRlbGF5TWF4KG9wdHMucmVjb25uZWN0aW9uRGVsYXlNYXggfHwgNTAwMCk7XG4gIHRoaXMucmFuZG9taXphdGlvbkZhY3RvcihvcHRzLnJhbmRvbWl6YXRpb25GYWN0b3IgfHwgMC41KTtcbiAgdGhpcy5iYWNrb2ZmID0gbmV3IEJhY2tvZmYoe1xuICAgIG1pbjogdGhpcy5yZWNvbm5lY3Rpb25EZWxheSgpLFxuICAgIG1heDogdGhpcy5yZWNvbm5lY3Rpb25EZWxheU1heCgpLFxuICAgIGppdHRlcjogdGhpcy5yYW5kb21pemF0aW9uRmFjdG9yKClcbiAgfSk7XG4gIHRoaXMudGltZW91dChudWxsID09IG9wdHMudGltZW91dCA/IDIwMDAwIDogb3B0cy50aW1lb3V0KTtcbiAgdGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7XG4gIHRoaXMudXJpID0gdXJpO1xuICB0aGlzLmNvbm5lY3RpbmcgPSBbXTtcbiAgdGhpcy5sYXN0UGluZyA9IG51bGw7XG4gIHRoaXMuZW5jb2RpbmcgPSBmYWxzZTtcbiAgdGhpcy5wYWNrZXRCdWZmZXIgPSBbXTtcbiAgdGhpcy5lbmNvZGVyID0gbmV3IHBhcnNlci5FbmNvZGVyKCk7XG4gIHRoaXMuZGVjb2RlciA9IG5ldyBwYXJzZXIuRGVjb2RlcigpO1xuICB0aGlzLmF1dG9Db25uZWN0ID0gb3B0cy5hdXRvQ29ubmVjdCAhPT0gZmFsc2U7XG4gIGlmICh0aGlzLmF1dG9Db25uZWN0KSB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBQcm9wYWdhdGUgZ2l2ZW4gZXZlbnQgdG8gc29ja2V0cyBhbmQgZW1pdCBvbiBgdGhpc2BcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5NYW5hZ2VyLnByb3RvdHlwZS5lbWl0QWxsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICBmb3IgKHZhciBuc3AgaW4gdGhpcy5uc3BzKSB7XG4gICAgaWYgKGhhcy5jYWxsKHRoaXMubnNwcywgbnNwKSkge1xuICAgICAgdGhpcy5uc3BzW25zcF0uZW1pdC5hcHBseSh0aGlzLm5zcHNbbnNwXSwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogVXBkYXRlIGBzb2NrZXQuaWRgIG9mIGFsbCBzb2NrZXRzXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUudXBkYXRlU29ja2V0SWRzID0gZnVuY3Rpb24oKXtcbiAgZm9yICh2YXIgbnNwIGluIHRoaXMubnNwcykge1xuICAgIGlmIChoYXMuY2FsbCh0aGlzLm5zcHMsIG5zcCkpIHtcbiAgICAgIHRoaXMubnNwc1tuc3BdLmlkID0gdGhpcy5lbmdpbmUuaWQ7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE1peCBpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihNYW5hZ2VyLnByb3RvdHlwZSk7XG5cbi8qKlxuICogU2V0cyB0aGUgYHJlY29ubmVjdGlvbmAgY29uZmlnLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdHJ1ZS9mYWxzZSBpZiBpdCBzaG91bGQgYXV0b21hdGljYWxseSByZWNvbm5lY3RcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGYgb3IgdmFsdWVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUucmVjb25uZWN0aW9uID0gZnVuY3Rpb24odil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbjtcbiAgdGhpcy5fcmVjb25uZWN0aW9uID0gISF2O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgcmVjb25uZWN0aW9uIGF0dGVtcHRzIGNvbmZpZy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyBiZWZvcmUgZ2l2aW5nIHVwXG4gKiBAcmV0dXJuIHtNYW5hZ2VyfSBzZWxmIG9yIHZhbHVlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbkF0dGVtcHRzID0gZnVuY3Rpb24odil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbkF0dGVtcHRzO1xuICB0aGlzLl9yZWNvbm5lY3Rpb25BdHRlbXB0cyA9IHY7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBkZWxheSBiZXR3ZWVuIHJlY29ubmVjdGlvbnMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5XG4gKiBAcmV0dXJuIHtNYW5hZ2VyfSBzZWxmIG9yIHZhbHVlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbkRlbGF5ID0gZnVuY3Rpb24odil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbkRlbGF5O1xuICB0aGlzLl9yZWNvbm5lY3Rpb25EZWxheSA9IHY7XG4gIHRoaXMuYmFja29mZiAmJiB0aGlzLmJhY2tvZmYuc2V0TWluKHYpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbk1hbmFnZXIucHJvdG90eXBlLnJhbmRvbWl6YXRpb25GYWN0b3IgPSBmdW5jdGlvbih2KXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5fcmFuZG9taXphdGlvbkZhY3RvcjtcbiAgdGhpcy5fcmFuZG9taXphdGlvbkZhY3RvciA9IHY7XG4gIHRoaXMuYmFja29mZiAmJiB0aGlzLmJhY2tvZmYuc2V0Sml0dGVyKHYpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgbWF4aW11bSBkZWxheSBiZXR3ZWVuIHJlY29ubmVjdGlvbnMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5XG4gKiBAcmV0dXJuIHtNYW5hZ2VyfSBzZWxmIG9yIHZhbHVlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbkRlbGF5TWF4ID0gZnVuY3Rpb24odil7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbkRlbGF5TWF4O1xuICB0aGlzLl9yZWNvbm5lY3Rpb25EZWxheU1heCA9IHY7XG4gIHRoaXMuYmFja29mZiAmJiB0aGlzLmJhY2tvZmYuc2V0TWF4KHYpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgY29ubmVjdGlvbiB0aW1lb3V0LiBgZmFsc2VgIHRvIGRpc2FibGVcbiAqXG4gKiBAcmV0dXJuIHtNYW5hZ2VyfSBzZWxmIG9yIHZhbHVlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbih2KXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5fdGltZW91dDtcbiAgdGhpcy5fdGltZW91dCA9IHY7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdHJ5aW5nIHRvIHJlY29ubmVjdCBpZiByZWNvbm5lY3Rpb24gaXMgZW5hYmxlZCBhbmQgd2UgaGF2ZSBub3RcbiAqIHN0YXJ0ZWQgcmVjb25uZWN0aW5nIHlldFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLm1heWJlUmVjb25uZWN0T25PcGVuID0gZnVuY3Rpb24oKSB7XG4gIC8vIE9ubHkgdHJ5IHRvIHJlY29ubmVjdCBpZiBpdCdzIHRoZSBmaXJzdCB0aW1lIHdlJ3JlIGNvbm5lY3RpbmdcbiAgaWYgKCF0aGlzLnJlY29ubmVjdGluZyAmJiB0aGlzLl9yZWNvbm5lY3Rpb24gJiYgdGhpcy5iYWNrb2ZmLmF0dGVtcHRzID09PSAwKSB7XG4gICAgLy8ga2VlcHMgcmVjb25uZWN0aW9uIGZyb20gZmlyaW5nIHR3aWNlIGZvciB0aGUgc2FtZSByZWNvbm5lY3Rpb24gbG9vcFxuICAgIHRoaXMucmVjb25uZWN0KCk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50IHRyYW5zcG9ydCBgc29ja2V0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25hbCwgY2FsbGJhY2tcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUub3BlbiA9XG5NYW5hZ2VyLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oZm4pe1xuICBkZWJ1ZygncmVhZHlTdGF0ZSAlcycsIHRoaXMucmVhZHlTdGF0ZSk7XG4gIGlmICh+dGhpcy5yZWFkeVN0YXRlLmluZGV4T2YoJ29wZW4nKSkgcmV0dXJuIHRoaXM7XG5cbiAgZGVidWcoJ29wZW5pbmcgJXMnLCB0aGlzLnVyaSk7XG4gIHRoaXMuZW5naW5lID0gZWlvKHRoaXMudXJpLCB0aGlzLm9wdHMpO1xuICB2YXIgc29ja2V0ID0gdGhpcy5lbmdpbmU7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5yZWFkeVN0YXRlID0gJ29wZW5pbmcnO1xuICB0aGlzLnNraXBSZWNvbm5lY3QgPSBmYWxzZTtcblxuICAvLyBlbWl0IGBvcGVuYFxuICB2YXIgb3BlblN1YiA9IG9uKHNvY2tldCwgJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICBzZWxmLm9ub3BlbigpO1xuICAgIGZuICYmIGZuKCk7XG4gIH0pO1xuXG4gIC8vIGVtaXQgYGNvbm5lY3RfZXJyb3JgXG4gIHZhciBlcnJvclN1YiA9IG9uKHNvY2tldCwgJ2Vycm9yJywgZnVuY3Rpb24oZGF0YSl7XG4gICAgZGVidWcoJ2Nvbm5lY3RfZXJyb3InKTtcbiAgICBzZWxmLmNsZWFudXAoKTtcbiAgICBzZWxmLnJlYWR5U3RhdGUgPSAnY2xvc2VkJztcbiAgICBzZWxmLmVtaXRBbGwoJ2Nvbm5lY3RfZXJyb3InLCBkYXRhKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gZXJyb3InKTtcbiAgICAgIGVyci5kYXRhID0gZGF0YTtcbiAgICAgIGZuKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE9ubHkgZG8gdGhpcyBpZiB0aGVyZSBpcyBubyBmbiB0byBoYW5kbGUgdGhlIGVycm9yXG4gICAgICBzZWxmLm1heWJlUmVjb25uZWN0T25PcGVuKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBlbWl0IGBjb25uZWN0X3RpbWVvdXRgXG4gIGlmIChmYWxzZSAhPT0gdGhpcy5fdGltZW91dCkge1xuICAgIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgICBkZWJ1ZygnY29ubmVjdCBhdHRlbXB0IHdpbGwgdGltZW91dCBhZnRlciAlZCcsIHRpbWVvdXQpO1xuXG4gICAgLy8gc2V0IHRpbWVyXG4gICAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgZGVidWcoJ2Nvbm5lY3QgYXR0ZW1wdCB0aW1lZCBvdXQgYWZ0ZXIgJWQnLCB0aW1lb3V0KTtcbiAgICAgIG9wZW5TdWIuZGVzdHJveSgpO1xuICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICBzb2NrZXQuZW1pdCgnZXJyb3InLCAndGltZW91dCcpO1xuICAgICAgc2VsZi5lbWl0QWxsKCdjb25uZWN0X3RpbWVvdXQnLCB0aW1lb3V0KTtcbiAgICB9LCB0aW1lb3V0KTtcblxuICAgIHRoaXMuc3Vicy5wdXNoKHtcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLnN1YnMucHVzaChvcGVuU3ViKTtcbiAgdGhpcy5zdWJzLnB1c2goZXJyb3JTdWIpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiB0cmFuc3BvcnQgb3Blbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5NYW5hZ2VyLnByb3RvdHlwZS5vbm9wZW4gPSBmdW5jdGlvbigpe1xuICBkZWJ1Zygnb3BlbicpO1xuXG4gIC8vIGNsZWFyIG9sZCBzdWJzXG4gIHRoaXMuY2xlYW51cCgpO1xuXG4gIC8vIG1hcmsgYXMgb3BlblxuICB0aGlzLnJlYWR5U3RhdGUgPSAnb3Blbic7XG4gIHRoaXMuZW1pdCgnb3BlbicpO1xuXG4gIC8vIGFkZCBuZXcgc3Vic1xuICB2YXIgc29ja2V0ID0gdGhpcy5lbmdpbmU7XG4gIHRoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwgJ2RhdGEnLCBiaW5kKHRoaXMsICdvbmRhdGEnKSkpO1xuICB0aGlzLnN1YnMucHVzaChvbihzb2NrZXQsICdwaW5nJywgYmluZCh0aGlzLCAnb25waW5nJykpKTtcbiAgdGhpcy5zdWJzLnB1c2gob24oc29ja2V0LCAncG9uZycsIGJpbmQodGhpcywgJ29ucG9uZycpKSk7XG4gIHRoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwgJ2Vycm9yJywgYmluZCh0aGlzLCAnb25lcnJvcicpKSk7XG4gIHRoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwgJ2Nsb3NlJywgYmluZCh0aGlzLCAnb25jbG9zZScpKSk7XG4gIHRoaXMuc3Vicy5wdXNoKG9uKHRoaXMuZGVjb2RlciwgJ2RlY29kZWQnLCBiaW5kKHRoaXMsICdvbmRlY29kZWQnKSkpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHBpbmcuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUub25waW5nID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5sYXN0UGluZyA9IG5ldyBEYXRlO1xuICB0aGlzLmVtaXRBbGwoJ3BpbmcnKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gYSBwYWNrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUub25wb25nID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5lbWl0QWxsKCdwb25nJywgbmV3IERhdGUgLSB0aGlzLmxhc3RQaW5nKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdpdGggZGF0YS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5NYW5hZ2VyLnByb3RvdHlwZS5vbmRhdGEgPSBmdW5jdGlvbihkYXRhKXtcbiAgdGhpcy5kZWNvZGVyLmFkZChkYXRhKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdoZW4gcGFyc2VyIGZ1bGx5IGRlY29kZXMgYSBwYWNrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUub25kZWNvZGVkID0gZnVuY3Rpb24ocGFja2V0KSB7XG4gIHRoaXMuZW1pdCgncGFja2V0JywgcGFja2V0KTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gc29ja2V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbihlcnIpe1xuICBkZWJ1ZygnZXJyb3InLCBlcnIpO1xuICB0aGlzLmVtaXRBbGwoJ2Vycm9yJywgZXJyKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBzb2NrZXQgZm9yIHRoZSBnaXZlbiBgbnNwYC5cbiAqXG4gKiBAcmV0dXJuIHtTb2NrZXR9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLnNvY2tldCA9IGZ1bmN0aW9uKG5zcCl7XG4gIHZhciBzb2NrZXQgPSB0aGlzLm5zcHNbbnNwXTtcbiAgaWYgKCFzb2NrZXQpIHtcbiAgICBzb2NrZXQgPSBuZXcgU29ja2V0KHRoaXMsIG5zcCk7XG4gICAgdGhpcy5uc3BzW25zcF0gPSBzb2NrZXQ7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNvY2tldC5vbignY29ubmVjdGluZycsIG9uQ29ubmVjdGluZyk7XG4gICAgc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oKXtcbiAgICAgIHNvY2tldC5pZCA9IHNlbGYuZW5naW5lLmlkO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuYXV0b0Nvbm5lY3QpIHtcbiAgICAgIC8vIG1hbnVhbGx5IGNhbGwgaGVyZSBzaW5jZSBjb25uZWN0aW5nIGV2bmV0IGlzIGZpcmVkIGJlZm9yZSBsaXN0ZW5pbmdcbiAgICAgIG9uQ29ubmVjdGluZygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ29ubmVjdGluZygpIHtcbiAgICBpZiAoIX5pbmRleE9mKHNlbGYuY29ubmVjdGluZywgc29ja2V0KSkge1xuICAgICAgc2VsZi5jb25uZWN0aW5nLnB1c2goc29ja2V0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29ja2V0O1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHNvY2tldCBjbG9zZS5cbiAqXG4gKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0XG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKHNvY2tldCl7XG4gIHZhciBpbmRleCA9IGluZGV4T2YodGhpcy5jb25uZWN0aW5nLCBzb2NrZXQpO1xuICBpZiAofmluZGV4KSB0aGlzLmNvbm5lY3Rpbmcuc3BsaWNlKGluZGV4LCAxKTtcbiAgaWYgKHRoaXMuY29ubmVjdGluZy5sZW5ndGgpIHJldHVybjtcblxuICB0aGlzLmNsb3NlKCk7XG59O1xuXG4vKipcbiAqIFdyaXRlcyBhIHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5NYW5hZ2VyLnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe1xuICBkZWJ1Zygnd3JpdGluZyBwYWNrZXQgJWonLCBwYWNrZXQpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCFzZWxmLmVuY29kaW5nKSB7XG4gICAgLy8gZW5jb2RlLCB0aGVuIHdyaXRlIHRvIGVuZ2luZSB3aXRoIHJlc3VsdFxuICAgIHNlbGYuZW5jb2RpbmcgPSB0cnVlO1xuICAgIHRoaXMuZW5jb2Rlci5lbmNvZGUocGFja2V0LCBmdW5jdGlvbihlbmNvZGVkUGFja2V0cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmNvZGVkUGFja2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzZWxmLmVuZ2luZS53cml0ZShlbmNvZGVkUGFja2V0c1tpXSwgcGFja2V0Lm9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgc2VsZi5lbmNvZGluZyA9IGZhbHNlO1xuICAgICAgc2VsZi5wcm9jZXNzUGFja2V0UXVldWUoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHsgLy8gYWRkIHBhY2tldCB0byB0aGUgcXVldWVcbiAgICBzZWxmLnBhY2tldEJ1ZmZlci5wdXNoKHBhY2tldCk7XG4gIH1cbn07XG5cbi8qKlxuICogSWYgcGFja2V0IGJ1ZmZlciBpcyBub24tZW1wdHksIGJlZ2lucyBlbmNvZGluZyB0aGVcbiAqIG5leHQgcGFja2V0IGluIGxpbmUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUucHJvY2Vzc1BhY2tldFF1ZXVlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLnBhY2tldEJ1ZmZlci5sZW5ndGggPiAwICYmICF0aGlzLmVuY29kaW5nKSB7XG4gICAgdmFyIHBhY2sgPSB0aGlzLnBhY2tldEJ1ZmZlci5zaGlmdCgpO1xuICAgIHRoaXMucGFja2V0KHBhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIENsZWFuIHVwIHRyYW5zcG9ydCBzdWJzY3JpcHRpb25zIGFuZCBwYWNrZXQgYnVmZmVyLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbigpe1xuICBkZWJ1ZygnY2xlYW51cCcpO1xuXG4gIHZhciBzdWI7XG4gIHdoaWxlIChzdWIgPSB0aGlzLnN1YnMuc2hpZnQoKSkgc3ViLmRlc3Ryb3koKTtcblxuICB0aGlzLnBhY2tldEJ1ZmZlciA9IFtdO1xuICB0aGlzLmVuY29kaW5nID0gZmFsc2U7XG4gIHRoaXMubGFzdFBpbmcgPSBudWxsO1xuXG4gIHRoaXMuZGVjb2Rlci5kZXN0cm95KCk7XG59O1xuXG4vKipcbiAqIENsb3NlIHRoZSBjdXJyZW50IHNvY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5NYW5hZ2VyLnByb3RvdHlwZS5jbG9zZSA9XG5NYW5hZ2VyLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcbiAgZGVidWcoJ2Rpc2Nvbm5lY3QnKTtcbiAgdGhpcy5za2lwUmVjb25uZWN0ID0gdHJ1ZTtcbiAgdGhpcy5yZWNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgaWYgKCdvcGVuaW5nJyA9PSB0aGlzLnJlYWR5U3RhdGUpIHtcbiAgICAvLyBgb25jbG9zZWAgd2lsbCBub3QgZmlyZSBiZWNhdXNlXG4gICAgLy8gYW4gb3BlbiBldmVudCBuZXZlciBoYXBwZW5lZFxuICAgIHRoaXMuY2xlYW51cCgpO1xuICB9XG4gIHRoaXMuYmFja29mZi5yZXNldCgpO1xuICB0aGlzLnJlYWR5U3RhdGUgPSAnY2xvc2VkJztcbiAgaWYgKHRoaXMuZW5naW5lKSB0aGlzLmVuZ2luZS5jbG9zZSgpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBlbmdpbmUgY2xvc2UuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuTWFuYWdlci5wcm90b3R5cGUub25jbG9zZSA9IGZ1bmN0aW9uKHJlYXNvbil7XG4gIGRlYnVnKCdvbmNsb3NlJyk7XG5cbiAgdGhpcy5jbGVhbnVwKCk7XG4gIHRoaXMuYmFja29mZi5yZXNldCgpO1xuICB0aGlzLnJlYWR5U3RhdGUgPSAnY2xvc2VkJztcbiAgdGhpcy5lbWl0KCdjbG9zZScsIHJlYXNvbik7XG5cbiAgaWYgKHRoaXMuX3JlY29ubmVjdGlvbiAmJiAhdGhpcy5za2lwUmVjb25uZWN0KSB7XG4gICAgdGhpcy5yZWNvbm5lY3QoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBdHRlbXB0IGEgcmVjb25uZWN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLnJlY29ubmVjdGluZyB8fCB0aGlzLnNraXBSZWNvbm5lY3QpIHJldHVybiB0aGlzO1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAodGhpcy5iYWNrb2ZmLmF0dGVtcHRzID49IHRoaXMuX3JlY29ubmVjdGlvbkF0dGVtcHRzKSB7XG4gICAgZGVidWcoJ3JlY29ubmVjdCBmYWlsZWQnKTtcbiAgICB0aGlzLmJhY2tvZmYucmVzZXQoKTtcbiAgICB0aGlzLmVtaXRBbGwoJ3JlY29ubmVjdF9mYWlsZWQnKTtcbiAgICB0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHZhciBkZWxheSA9IHRoaXMuYmFja29mZi5kdXJhdGlvbigpO1xuICAgIGRlYnVnKCd3aWxsIHdhaXQgJWRtcyBiZWZvcmUgcmVjb25uZWN0IGF0dGVtcHQnLCBkZWxheSk7XG5cbiAgICB0aGlzLnJlY29ubmVjdGluZyA9IHRydWU7XG4gICAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYgKHNlbGYuc2tpcFJlY29ubmVjdCkgcmV0dXJuO1xuXG4gICAgICBkZWJ1ZygnYXR0ZW1wdGluZyByZWNvbm5lY3QnKTtcbiAgICAgIHNlbGYuZW1pdEFsbCgncmVjb25uZWN0X2F0dGVtcHQnLCBzZWxmLmJhY2tvZmYuYXR0ZW1wdHMpO1xuICAgICAgc2VsZi5lbWl0QWxsKCdyZWNvbm5lY3RpbmcnLCBzZWxmLmJhY2tvZmYuYXR0ZW1wdHMpO1xuXG4gICAgICAvLyBjaGVjayBhZ2FpbiBmb3IgdGhlIGNhc2Ugc29ja2V0IGNsb3NlZCBpbiBhYm92ZSBldmVudHNcbiAgICAgIGlmIChzZWxmLnNraXBSZWNvbm5lY3QpIHJldHVybjtcblxuICAgICAgc2VsZi5vcGVuKGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBkZWJ1ZygncmVjb25uZWN0IGF0dGVtcHQgZXJyb3InKTtcbiAgICAgICAgICBzZWxmLnJlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICAgIHNlbGYucmVjb25uZWN0KCk7XG4gICAgICAgICAgc2VsZi5lbWl0QWxsKCdyZWNvbm5lY3RfZXJyb3InLCBlcnIuZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVidWcoJ3JlY29ubmVjdCBzdWNjZXNzJyk7XG4gICAgICAgICAgc2VsZi5vbnJlY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCBkZWxheSk7XG5cbiAgICB0aGlzLnN1YnMucHVzaCh7XG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIHN1Y2Nlc3NmdWwgcmVjb25uZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk1hbmFnZXIucHJvdG90eXBlLm9ucmVjb25uZWN0ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGF0dGVtcHQgPSB0aGlzLmJhY2tvZmYuYXR0ZW1wdHM7XG4gIHRoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7XG4gIHRoaXMuYmFja29mZi5yZXNldCgpO1xuICB0aGlzLnVwZGF0ZVNvY2tldElkcygpO1xuICB0aGlzLmVtaXRBbGwoJ3JlY29ubmVjdCcsIGF0dGVtcHQpO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9uO1xuXG4vKipcbiAqIEhlbHBlciBmb3Igc3Vic2NyaXB0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxFdmVudEVtaXR0ZXJ9IG9iaiB3aXRoIGBFbWl0dGVyYCBtaXhpbiBvciBgRXZlbnRFbWl0dGVyYFxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IG5hbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIG9uKG9iaiwgZXYsIGZuKSB7XG4gIG9iai5vbihldiwgZm4pO1xuICByZXR1cm4ge1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICBvYmoucmVtb3ZlTGlzdGVuZXIoZXYsIGZuKTtcbiAgICB9XG4gIH07XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgcGFyc2VyID0gcmVxdWlyZSgnc29ja2V0LmlvLXBhcnNlcicpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdjb21wb25lbnQtZW1pdHRlcicpO1xudmFyIHRvQXJyYXkgPSByZXF1aXJlKCd0by1hcnJheScpO1xudmFyIG9uID0gcmVxdWlyZSgnLi9vbicpO1xudmFyIGJpbmQgPSByZXF1aXJlKCdjb21wb25lbnQtYmluZCcpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2V0LmlvLWNsaWVudDpzb2NrZXQnKTtcbnZhciBoYXNCaW4gPSByZXF1aXJlKCdoYXMtYmluYXJ5Jyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU29ja2V0O1xuXG4vKipcbiAqIEludGVybmFsIGV2ZW50cyAoYmxhY2tsaXN0ZWQpLlxuICogVGhlc2UgZXZlbnRzIGNhbid0IGJlIGVtaXR0ZWQgYnkgdGhlIHVzZXIuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGV2ZW50cyA9IHtcbiAgY29ubmVjdDogMSxcbiAgY29ubmVjdF9lcnJvcjogMSxcbiAgY29ubmVjdF90aW1lb3V0OiAxLFxuICBjb25uZWN0aW5nOiAxLFxuICBkaXNjb25uZWN0OiAxLFxuICBlcnJvcjogMSxcbiAgcmVjb25uZWN0OiAxLFxuICByZWNvbm5lY3RfYXR0ZW1wdDogMSxcbiAgcmVjb25uZWN0X2ZhaWxlZDogMSxcbiAgcmVjb25uZWN0X2Vycm9yOiAxLFxuICByZWNvbm5lY3Rpbmc6IDEsXG4gIHBpbmc6IDEsXG4gIHBvbmc6IDFcbn07XG5cbi8qKlxuICogU2hvcnRjdXQgdG8gYEVtaXR0ZXIjZW1pdGAuXG4gKi9cblxudmFyIGVtaXQgPSBFbWl0dGVyLnByb3RvdHlwZS5lbWl0O1xuXG4vKipcbiAqIGBTb2NrZXRgIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gU29ja2V0KGlvLCBuc3Ape1xuICB0aGlzLmlvID0gaW87XG4gIHRoaXMubnNwID0gbnNwO1xuICB0aGlzLmpzb24gPSB0aGlzOyAvLyBjb21wYXRcbiAgdGhpcy5pZHMgPSAwO1xuICB0aGlzLmFja3MgPSB7fTtcbiAgdGhpcy5yZWNlaXZlQnVmZmVyID0gW107XG4gIHRoaXMuc2VuZEJ1ZmZlciA9IFtdO1xuICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICB0aGlzLmRpc2Nvbm5lY3RlZCA9IHRydWU7XG4gIGlmICh0aGlzLmlvLmF1dG9Db25uZWN0KSB0aGlzLm9wZW4oKTtcbn1cblxuLyoqXG4gKiBNaXggaW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoU29ja2V0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIG9wZW4sIGNsb3NlIGFuZCBwYWNrZXQgZXZlbnRzXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5zdWJFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuc3VicykgcmV0dXJuO1xuXG4gIHZhciBpbyA9IHRoaXMuaW87XG4gIHRoaXMuc3VicyA9IFtcbiAgICBvbihpbywgJ29wZW4nLCBiaW5kKHRoaXMsICdvbm9wZW4nKSksXG4gICAgb24oaW8sICdwYWNrZXQnLCBiaW5kKHRoaXMsICdvbnBhY2tldCcpKSxcbiAgICBvbihpbywgJ2Nsb3NlJywgYmluZCh0aGlzLCAnb25jbG9zZScpKVxuICBdO1xufTtcblxuLyoqXG4gKiBcIk9wZW5zXCIgdGhlIHNvY2tldC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNvY2tldC5wcm90b3R5cGUub3BlbiA9XG5Tb2NrZXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5jb25uZWN0ZWQpIHJldHVybiB0aGlzO1xuXG4gIHRoaXMuc3ViRXZlbnRzKCk7XG4gIHRoaXMuaW8ub3BlbigpOyAvLyBlbnN1cmUgb3BlblxuICBpZiAoJ29wZW4nID09IHRoaXMuaW8ucmVhZHlTdGF0ZSkgdGhpcy5vbm9wZW4oKTtcbiAgdGhpcy5lbWl0KCdjb25uZWN0aW5nJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kcyBhIGBtZXNzYWdlYCBldmVudC5cbiAqXG4gKiBAcmV0dXJuIHtTb2NrZXR9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oKXtcbiAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cyk7XG4gIGFyZ3MudW5zaGlmdCgnbWVzc2FnZScpO1xuICB0aGlzLmVtaXQuYXBwbHkodGhpcywgYXJncyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBgZW1pdGAuXG4gKiBJZiB0aGUgZXZlbnQgaXMgaW4gYGV2ZW50c2AsIGl0J3MgZW1pdHRlZCBub3JtYWxseS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgbmFtZVxuICogQHJldHVybiB7U29ja2V0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNvY2tldC5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2KXtcbiAgaWYgKGV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldikpIHtcbiAgICBlbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzKTtcbiAgdmFyIHBhcnNlclR5cGUgPSBwYXJzZXIuRVZFTlQ7IC8vIGRlZmF1bHRcbiAgaWYgKGhhc0JpbihhcmdzKSkgeyBwYXJzZXJUeXBlID0gcGFyc2VyLkJJTkFSWV9FVkVOVDsgfSAvLyBiaW5hcnlcbiAgdmFyIHBhY2tldCA9IHsgdHlwZTogcGFyc2VyVHlwZSwgZGF0YTogYXJncyB9O1xuXG4gIHBhY2tldC5vcHRpb25zID0ge307XG4gIHBhY2tldC5vcHRpb25zLmNvbXByZXNzID0gIXRoaXMuZmxhZ3MgfHwgZmFsc2UgIT09IHRoaXMuZmxhZ3MuY29tcHJlc3M7XG5cbiAgLy8gZXZlbnQgYWNrIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pIHtcbiAgICBkZWJ1ZygnZW1pdHRpbmcgcGFja2V0IHdpdGggYWNrIGlkICVkJywgdGhpcy5pZHMpO1xuICAgIHRoaXMuYWNrc1t0aGlzLmlkc10gPSBhcmdzLnBvcCgpO1xuICAgIHBhY2tldC5pZCA9IHRoaXMuaWRzKys7XG4gIH1cblxuICBpZiAodGhpcy5jb25uZWN0ZWQpIHtcbiAgICB0aGlzLnBhY2tldChwYWNrZXQpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc2VuZEJ1ZmZlci5wdXNoKHBhY2tldCk7XG4gIH1cblxuICBkZWxldGUgdGhpcy5mbGFncztcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZHMgYSBwYWNrZXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe1xuICBwYWNrZXQubnNwID0gdGhpcy5uc3A7XG4gIHRoaXMuaW8ucGFja2V0KHBhY2tldCk7XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIGVuZ2luZSBgb3BlbmAuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5vbm9wZW4gPSBmdW5jdGlvbigpe1xuICBkZWJ1ZygndHJhbnNwb3J0IGlzIG9wZW4gLSBjb25uZWN0aW5nJyk7XG5cbiAgLy8gd3JpdGUgY29ubmVjdCBwYWNrZXQgaWYgbmVjZXNzYXJ5XG4gIGlmICgnLycgIT0gdGhpcy5uc3ApIHtcbiAgICB0aGlzLnBhY2tldCh7IHR5cGU6IHBhcnNlci5DT05ORUNUIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIGVuZ2luZSBgY2xvc2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZWFzb25cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblNvY2tldC5wcm90b3R5cGUub25jbG9zZSA9IGZ1bmN0aW9uKHJlYXNvbil7XG4gIGRlYnVnKCdjbG9zZSAoJXMpJywgcmVhc29uKTtcbiAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNjb25uZWN0ZWQgPSB0cnVlO1xuICBkZWxldGUgdGhpcy5pZDtcbiAgdGhpcy5lbWl0KCdkaXNjb25uZWN0JywgcmVhc29uKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdpdGggc29ja2V0IHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLm9ucGFja2V0ID0gZnVuY3Rpb24ocGFja2V0KXtcbiAgaWYgKHBhY2tldC5uc3AgIT0gdGhpcy5uc3ApIHJldHVybjtcblxuICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgY2FzZSBwYXJzZXIuQ09OTkVDVDpcbiAgICAgIHRoaXMub25jb25uZWN0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcGFyc2VyLkVWRU5UOlxuICAgICAgdGhpcy5vbmV2ZW50KHBhY2tldCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcGFyc2VyLkJJTkFSWV9FVkVOVDpcbiAgICAgIHRoaXMub25ldmVudChwYWNrZXQpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIHBhcnNlci5BQ0s6XG4gICAgICB0aGlzLm9uYWNrKHBhY2tldCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcGFyc2VyLkJJTkFSWV9BQ0s6XG4gICAgICB0aGlzLm9uYWNrKHBhY2tldCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcGFyc2VyLkRJU0NPTk5FQ1Q6XG4gICAgICB0aGlzLm9uZGlzY29ubmVjdCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIHBhcnNlci5FUlJPUjpcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBwYWNrZXQuZGF0YSk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHNlcnZlciBldmVudC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLm9uZXZlbnQgPSBmdW5jdGlvbihwYWNrZXQpe1xuICB2YXIgYXJncyA9IHBhY2tldC5kYXRhIHx8IFtdO1xuICBkZWJ1ZygnZW1pdHRpbmcgZXZlbnQgJWonLCBhcmdzKTtcblxuICBpZiAobnVsbCAhPSBwYWNrZXQuaWQpIHtcbiAgICBkZWJ1ZygnYXR0YWNoaW5nIGFjayBjYWxsYmFjayB0byBldmVudCcpO1xuICAgIGFyZ3MucHVzaCh0aGlzLmFjayhwYWNrZXQuaWQpKTtcbiAgfVxuXG4gIGlmICh0aGlzLmNvbm5lY3RlZCkge1xuICAgIGVtaXQuYXBwbHkodGhpcywgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5yZWNlaXZlQnVmZmVyLnB1c2goYXJncyk7XG4gIH1cbn07XG5cbi8qKlxuICogUHJvZHVjZXMgYW4gYWNrIGNhbGxiYWNrIHRvIGVtaXQgd2l0aCBhbiBldmVudC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLmFjayA9IGZ1bmN0aW9uKGlkKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgc2VudCA9IGZhbHNlO1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAvLyBwcmV2ZW50IGRvdWJsZSBjYWxsYmFja3NcbiAgICBpZiAoc2VudCkgcmV0dXJuO1xuICAgIHNlbnQgPSB0cnVlO1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgIGRlYnVnKCdzZW5kaW5nIGFjayAlaicsIGFyZ3MpO1xuXG4gICAgdmFyIHR5cGUgPSBoYXNCaW4oYXJncykgPyBwYXJzZXIuQklOQVJZX0FDSyA6IHBhcnNlci5BQ0s7XG4gICAgc2VsZi5wYWNrZXQoe1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlkOiBpZCxcbiAgICAgIGRhdGE6IGFyZ3NcbiAgICB9KTtcbiAgfTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gYSBzZXJ2ZXIgYWNrbm93bGVnZW1lbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5vbmFjayA9IGZ1bmN0aW9uKHBhY2tldCl7XG4gIHZhciBhY2sgPSB0aGlzLmFja3NbcGFja2V0LmlkXTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGFjaykge1xuICAgIGRlYnVnKCdjYWxsaW5nIGFjayAlcyB3aXRoICVqJywgcGFja2V0LmlkLCBwYWNrZXQuZGF0YSk7XG4gICAgYWNrLmFwcGx5KHRoaXMsIHBhY2tldC5kYXRhKTtcbiAgICBkZWxldGUgdGhpcy5hY2tzW3BhY2tldC5pZF07XG4gIH0gZWxzZSB7XG4gICAgZGVidWcoJ2JhZCBhY2sgJXMnLCBwYWNrZXQuaWQpO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIHNlcnZlciBjb25uZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblNvY2tldC5wcm90b3R5cGUub25jb25uZWN0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xuICB0aGlzLmRpc2Nvbm5lY3RlZCA9IGZhbHNlO1xuICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgdGhpcy5lbWl0QnVmZmVyZWQoKTtcbn07XG5cbi8qKlxuICogRW1pdCBidWZmZXJlZCBldmVudHMgKHJlY2VpdmVkIGFuZCBlbWl0dGVkKS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLmVtaXRCdWZmZXJlZCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5yZWNlaXZlQnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgZW1pdC5hcHBseSh0aGlzLCB0aGlzLnJlY2VpdmVCdWZmZXJbaV0pO1xuICB9XG4gIHRoaXMucmVjZWl2ZUJ1ZmZlciA9IFtdO1xuXG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNlbmRCdWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnBhY2tldCh0aGlzLnNlbmRCdWZmZXJbaV0pO1xuICB9XG4gIHRoaXMuc2VuZEJ1ZmZlciA9IFtdO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBzZXJ2ZXIgZGlzY29ubmVjdC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG4gIGRlYnVnKCdzZXJ2ZXIgZGlzY29ubmVjdCAoJXMpJywgdGhpcy5uc3ApO1xuICB0aGlzLmRlc3Ryb3koKTtcbiAgdGhpcy5vbmNsb3NlKCdpbyBzZXJ2ZXIgZGlzY29ubmVjdCcpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBmb3JjZWQgY2xpZW50L3NlcnZlciBzaWRlIGRpc2Nvbm5lY3Rpb25zLFxuICogdGhpcyBtZXRob2QgZW5zdXJlcyB0aGUgbWFuYWdlciBzdG9wcyB0cmFja2luZyB1cyBhbmRcbiAqIHRoYXQgcmVjb25uZWN0aW9ucyBkb24ndCBnZXQgdHJpZ2dlcmVkIGZvciB0aGlzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZS5cbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5zdWJzKSB7XG4gICAgLy8gY2xlYW4gc3Vic2NyaXB0aW9ucyB0byBhdm9pZCByZWNvbm5lY3Rpb25zXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuc3Vic1tpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuc3VicyA9IG51bGw7XG4gIH1cblxuICB0aGlzLmlvLmRlc3Ryb3kodGhpcyk7XG59O1xuXG4vKipcbiAqIERpc2Nvbm5lY3RzIHRoZSBzb2NrZXQgbWFudWFsbHkuXG4gKlxuICogQHJldHVybiB7U29ja2V0fSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNvY2tldC5wcm90b3R5cGUuY2xvc2UgPVxuU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuY29ubmVjdGVkKSB7XG4gICAgZGVidWcoJ3BlcmZvcm1pbmcgZGlzY29ubmVjdCAoJXMpJywgdGhpcy5uc3ApO1xuICAgIHRoaXMucGFja2V0KHsgdHlwZTogcGFyc2VyLkRJU0NPTk5FQ1QgfSk7XG4gIH1cblxuICAvLyByZW1vdmUgc29ja2V0IGZyb20gcG9vbFxuICB0aGlzLmRlc3Ryb3koKTtcblxuICBpZiAodGhpcy5jb25uZWN0ZWQpIHtcbiAgICAvLyBmaXJlIGV2ZW50c1xuICAgIHRoaXMub25jbG9zZSgnaW8gY2xpZW50IGRpc2Nvbm5lY3QnKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgY29tcHJlc3MgZmxhZy5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlmIGB0cnVlYCwgY29tcHJlc3NlcyB0aGUgc2VuZGluZyBkYXRhXG4gKiBAcmV0dXJuIHtTb2NrZXR9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5jb21wcmVzcyA9IGZ1bmN0aW9uKGNvbXByZXNzKXtcbiAgdGhpcy5mbGFncyA9IHRoaXMuZmxhZ3MgfHwge307XG4gIHRoaXMuZmxhZ3MuY29tcHJlc3MgPSBjb21wcmVzcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHBhcnNldXJpID0gcmVxdWlyZSgncGFyc2V1cmknKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NvY2tldC5pby1jbGllbnQ6dXJsJyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB1cmw7XG5cbi8qKlxuICogVVJMIHBhcnNlci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge09iamVjdH0gQW4gb2JqZWN0IG1lYW50IHRvIG1pbWljIHdpbmRvdy5sb2NhdGlvbi5cbiAqICAgICAgICAgICAgICAgICBEZWZhdWx0cyB0byB3aW5kb3cubG9jYXRpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHVybCh1cmksIGxvYyl7XG4gIHZhciBvYmogPSB1cmk7XG5cbiAgLy8gZGVmYXVsdCB0byB3aW5kb3cubG9jYXRpb25cbiAgdmFyIGxvYyA9IGxvYyB8fCBnbG9iYWwubG9jYXRpb247XG4gIGlmIChudWxsID09IHVyaSkgdXJpID0gbG9jLnByb3RvY29sICsgJy8vJyArIGxvYy5ob3N0O1xuXG4gIC8vIHJlbGF0aXZlIHBhdGggc3VwcG9ydFxuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHVyaSkge1xuICAgIGlmICgnLycgPT0gdXJpLmNoYXJBdCgwKSkge1xuICAgICAgaWYgKCcvJyA9PSB1cmkuY2hhckF0KDEpKSB7XG4gICAgICAgIHVyaSA9IGxvYy5wcm90b2NvbCArIHVyaTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVyaSA9IGxvYy5ob3N0ICsgdXJpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghL14oaHR0cHM/fHdzcz8pOlxcL1xcLy8udGVzdCh1cmkpKSB7XG4gICAgICBkZWJ1ZygncHJvdG9jb2wtbGVzcyB1cmwgJXMnLCB1cmkpO1xuICAgICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBsb2MpIHtcbiAgICAgICAgdXJpID0gbG9jLnByb3RvY29sICsgJy8vJyArIHVyaTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVyaSA9ICdodHRwczovLycgKyB1cmk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcGFyc2VcbiAgICBkZWJ1ZygncGFyc2UgJXMnLCB1cmkpO1xuICAgIG9iaiA9IHBhcnNldXJpKHVyaSk7XG4gIH1cblxuICAvLyBtYWtlIHN1cmUgd2UgdHJlYXQgYGxvY2FsaG9zdDo4MGAgYW5kIGBsb2NhbGhvc3RgIGVxdWFsbHlcbiAgaWYgKCFvYmoucG9ydCkge1xuICAgIGlmICgvXihodHRwfHdzKSQvLnRlc3Qob2JqLnByb3RvY29sKSkge1xuICAgICAgb2JqLnBvcnQgPSAnODAnO1xuICAgIH1cbiAgICBlbHNlIGlmICgvXihodHRwfHdzKXMkLy50ZXN0KG9iai5wcm90b2NvbCkpIHtcbiAgICAgIG9iai5wb3J0ID0gJzQ0Myc7XG4gICAgfVxuICB9XG5cbiAgb2JqLnBhdGggPSBvYmoucGF0aCB8fCAnLyc7XG5cbiAgdmFyIGlwdjYgPSBvYmouaG9zdC5pbmRleE9mKCc6JykgIT09IC0xO1xuICB2YXIgaG9zdCA9IGlwdjYgPyAnWycgKyBvYmouaG9zdCArICddJyA6IG9iai5ob3N0O1xuXG4gIC8vIGRlZmluZSB1bmlxdWUgaWRcbiAgb2JqLmlkID0gb2JqLnByb3RvY29sICsgJzovLycgKyBob3N0ICsgJzonICsgb2JqLnBvcnQ7XG4gIC8vIGRlZmluZSBocmVmXG4gIG9iai5ocmVmID0gb2JqLnByb3RvY29sICsgJzovLycgKyBob3N0ICsgKGxvYyAmJiBsb2MucG9ydCA9PSBvYmoucG9ydCA/ICcnIDogKCc6JyArIG9iai5wb3J0KSk7XG5cbiAgcmV0dXJuIG9iajtcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEJhY2tvZmZgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja29mZjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGJhY2tvZmYgdGltZXIgd2l0aCBgb3B0c2AuXG4gKlxuICogLSBgbWluYCBpbml0aWFsIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIFsxMDBdXG4gKiAtIGBtYXhgIG1heCB0aW1lb3V0IFsxMDAwMF1cbiAqIC0gYGppdHRlcmAgWzBdXG4gKiAtIGBmYWN0b3JgIFsyXVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEJhY2tvZmYob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdGhpcy5tcyA9IG9wdHMubWluIHx8IDEwMDtcbiAgdGhpcy5tYXggPSBvcHRzLm1heCB8fCAxMDAwMDtcbiAgdGhpcy5mYWN0b3IgPSBvcHRzLmZhY3RvciB8fCAyO1xuICB0aGlzLmppdHRlciA9IG9wdHMuaml0dGVyID4gMCAmJiBvcHRzLmppdHRlciA8PSAxID8gb3B0cy5qaXR0ZXIgOiAwO1xuICB0aGlzLmF0dGVtcHRzID0gMDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGJhY2tvZmYgZHVyYXRpb24uXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5CYWNrb2ZmLnByb3RvdHlwZS5kdXJhdGlvbiA9IGZ1bmN0aW9uKCl7XG4gIHZhciBtcyA9IHRoaXMubXMgKiBNYXRoLnBvdyh0aGlzLmZhY3RvciwgdGhpcy5hdHRlbXB0cysrKTtcbiAgaWYgKHRoaXMuaml0dGVyKSB7XG4gICAgdmFyIHJhbmQgPSAgTWF0aC5yYW5kb20oKTtcbiAgICB2YXIgZGV2aWF0aW9uID0gTWF0aC5mbG9vcihyYW5kICogdGhpcy5qaXR0ZXIgKiBtcyk7XG4gICAgbXMgPSAoTWF0aC5mbG9vcihyYW5kICogMTApICYgMSkgPT0gMCAgPyBtcyAtIGRldmlhdGlvbiA6IG1zICsgZGV2aWF0aW9uO1xuICB9XG4gIHJldHVybiBNYXRoLm1pbihtcywgdGhpcy5tYXgpIHwgMDtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIG51bWJlciBvZiBhdHRlbXB0cy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkJhY2tvZmYucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5hdHRlbXB0cyA9IDA7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgbWluaW11bSBkdXJhdGlvblxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQmFja29mZi5wcm90b3R5cGUuc2V0TWluID0gZnVuY3Rpb24obWluKXtcbiAgdGhpcy5tcyA9IG1pbjtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBtYXhpbXVtIGR1cmF0aW9uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5CYWNrb2ZmLnByb3RvdHlwZS5zZXRNYXggPSBmdW5jdGlvbihtYXgpe1xuICB0aGlzLm1heCA9IG1heDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBqaXR0ZXJcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkJhY2tvZmYucHJvdG90eXBlLnNldEppdHRlciA9IGZ1bmN0aW9uKGppdHRlcil7XG4gIHRoaXMuaml0dGVyID0gaml0dGVyO1xufTtcblxuIiwiLyoqXG4gKiBTbGljZSByZWZlcmVuY2UuXG4gKi9cblxudmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbi8qKlxuICogQmluZCBgb2JqYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBzdHJpbmdcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgZm4pe1xuICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGZuKSBmbiA9IG9ialtmbl07XG4gIGlmICgnZnVuY3Rpb24nICE9IHR5cGVvZiBmbikgdGhyb3cgbmV3IEVycm9yKCdiaW5kKCkgcmVxdWlyZXMgYSBmdW5jdGlvbicpO1xuICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KG9iaiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gIH1cbn07XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICBmdW5jdGlvbiBvbigpIHtcbiAgICB0aGlzLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIHJldHVybiAoJ1dlYmtpdEFwcGVhcmFuY2UnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSkgfHxcbiAgICAvLyBpcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG4gICAgKHdpbmRvdy5jb25zb2xlICYmIChjb25zb2xlLmZpcmVidWcgfHwgKGNvbnNvbGUuZXhjZXB0aW9uICYmIGNvbnNvbGUudGFibGUpKSkgfHxcbiAgICAvLyBpcyBmaXJlZm94ID49IHYzMT9cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1Rvb2xzL1dlYl9Db25zb2xlI1N0eWxpbmdfbWVzc2FnZXNcbiAgICAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoKSB7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm4gYXJncztcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3MgPSBbYXJnc1swXSwgYywgJ2NvbG9yOiBpbmhlcml0J10uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MsIDEpKTtcblxuICAvLyB0aGUgZmluYWwgXCIlY1wiIGlzIHNvbWV3aGF0IHRyaWNreSwgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvdGhlclxuICAvLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG4gIC8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGFzdEMgPSAwO1xuICBhcmdzWzBdLnJlcGxhY2UoLyVbYS16JV0vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICBpZiAoJyUlJyA9PT0gbWF0Y2gpIHJldHVybjtcbiAgICBpbmRleCsrO1xuICAgIGlmICgnJWMnID09PSBtYXRjaCkge1xuICAgICAgLy8gd2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4gICAgICAvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuICAgICAgbGFzdEMgPSBpbmRleDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyZ3Muc3BsaWNlKGxhc3RDLCAwLCBjKTtcbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdmFyIHI7XG4gIHRyeSB7XG4gICAgciA9IGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuICByZXR1cm4gcjtcbn1cblxuLyoqXG4gKiBFbmFibGUgbmFtZXNwYWNlcyBsaXN0ZWQgaW4gYGxvY2FsU3RvcmFnZS5kZWJ1Z2AgaW5pdGlhbGx5LlxuICovXG5cbmV4cG9ydHMuZW5hYmxlKGxvYWQoKSk7XG5cbi8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9jYWxzdG9yYWdlKCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyY2FzZWQgbGV0dGVyLCBpLmUuIFwiblwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi9cblxudmFyIHByZXZDb2xvciA9IDA7XG5cbi8qKlxuICogUHJldmlvdXMgbG9nIHRpbWVzdGFtcC5cbiAqL1xuXG52YXIgcHJldlRpbWU7XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IoKSB7XG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1twcmV2Q29sb3IrKyAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWVzcGFjZSkge1xuXG4gIC8vIGRlZmluZSB0aGUgYGRpc2FibGVkYCB2ZXJzaW9uXG4gIGZ1bmN0aW9uIGRpc2FibGVkKCkge1xuICB9XG4gIGRpc2FibGVkLmVuYWJsZWQgPSBmYWxzZTtcblxuICAvLyBkZWZpbmUgdGhlIGBlbmFibGVkYCB2ZXJzaW9uXG4gIGZ1bmN0aW9uIGVuYWJsZWQoKSB7XG5cbiAgICB2YXIgc2VsZiA9IGVuYWJsZWQ7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIGFkZCB0aGUgYGNvbG9yYCBpZiBub3Qgc2V0XG4gICAgaWYgKG51bGwgPT0gc2VsZi51c2VDb2xvcnMpIHNlbGYudXNlQ29sb3JzID0gZXhwb3J0cy51c2VDb2xvcnMoKTtcbiAgICBpZiAobnVsbCA9PSBzZWxmLmNvbG9yICYmIHNlbGYudXNlQ29sb3JzKSBzZWxmLmNvbG9yID0gc2VsZWN0Q29sb3IoKTtcblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVvXG4gICAgICBhcmdzID0gWyclbyddLmNvbmNhdChhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16JV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmZvcm1hdEFyZ3MpIHtcbiAgICAgIGFyZ3MgPSBleHBvcnRzLmZvcm1hdEFyZ3MuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfVxuICAgIHZhciBsb2dGbiA9IGVuYWJsZWQubG9nIHx8IGV4cG9ydHMubG9nIHx8IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG4gICAgbG9nRm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbiAgZW5hYmxlZC5lbmFibGVkID0gdHJ1ZTtcblxuICB2YXIgZm4gPSBleHBvcnRzLmVuYWJsZWQobmFtZXNwYWNlKSA/IGVuYWJsZWQgOiBkaXNhYmxlZDtcblxuICBmbi5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG5cbiAgcmV0dXJuIGZuO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIHZhciBzcGxpdCA9IChuYW1lc3BhY2VzIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pO1xuICB2YXIgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoIXNwbGl0W2ldKSBjb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3NcbiAgICBuYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csICcuKj8nKTtcbiAgICBpZiAobmFtZXNwYWNlc1swXSA9PT0gJy0nKSB7XG4gICAgICBleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkaXNhYmxlKCkge1xuICBleHBvcnRzLmVuYWJsZSgnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGVkKG5hbWUpIHtcbiAgdmFyIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogSGVscGVycy5cbiAqL1xuXG52YXIgcyA9IDEwMDA7XG52YXIgbSA9IHMgKiA2MDtcbnZhciBoID0gbSAqIDYwO1xudmFyIGQgPSBoICogMjQ7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwsIG9wdGlvbnMpe1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2YWwpIHJldHVybiBwYXJzZSh2YWwpO1xuICByZXR1cm4gb3B0aW9ucy5sb25nXG4gICAgPyBsb25nKHZhbClcbiAgICA6IHNob3J0KHZhbCk7XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgc3RyID0gJycgKyBzdHI7XG4gIGlmIChzdHIubGVuZ3RoID4gMTAwMDApIHJldHVybjtcbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpO1xuICBpZiAoIW1hdGNoKSByZXR1cm47XG4gIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeTtcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkO1xuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaDtcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG07XG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzO1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gbjtcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNob3J0KG1zKSB7XG4gIGlmIChtcyA+PSBkKSByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICBpZiAobXMgPj0gaCkgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgaWYgKG1zID49IG0pIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzKSByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9uZyhtcykge1xuICByZXR1cm4gcGx1cmFsKG1zLCBkLCAnZGF5JylcbiAgICB8fCBwbHVyYWwobXMsIGgsICdob3VyJylcbiAgICB8fCBwbHVyYWwobXMsIG0sICdtaW51dGUnKVxuICAgIHx8IHBsdXJhbChtcywgcywgJ3NlY29uZCcpXG4gICAgfHwgbXMgKyAnIG1zJztcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG4sIG5hbWUpIHtcbiAgaWYgKG1zIDwgbikgcmV0dXJuO1xuICBpZiAobXMgPCBuICogMS41KSByZXR1cm4gTWF0aC5mbG9vcihtcyAvIG4pICsgJyAnICsgbmFtZTtcbiAgcmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJztcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSAgcmVxdWlyZSgnLi9saWIvJyk7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9zb2NrZXQnKTtcblxuLyoqXG4gKiBFeHBvcnRzIHBhcnNlclxuICpcbiAqIEBhcGkgcHVibGljXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cy5wYXJzZXIgPSByZXF1aXJlKCdlbmdpbmUuaW8tcGFyc2VyJyk7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHRyYW5zcG9ydHMgPSByZXF1aXJlKCcuL3RyYW5zcG9ydHMnKTtcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnY29tcG9uZW50LWVtaXR0ZXInKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2VuZ2luZS5pby1jbGllbnQ6c29ja2V0Jyk7XG52YXIgaW5kZXggPSByZXF1aXJlKCdpbmRleG9mJyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnZW5naW5lLmlvLXBhcnNlcicpO1xudmFyIHBhcnNldXJpID0gcmVxdWlyZSgncGFyc2V1cmknKTtcbnZhciBwYXJzZWpzb24gPSByZXF1aXJlKCdwYXJzZWpzb24nKTtcbnZhciBwYXJzZXFzID0gcmVxdWlyZSgncGFyc2VxcycpO1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gU29ja2V0O1xuXG4vKipcbiAqIE5vb3AgZnVuY3Rpb24uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe31cblxuLyoqXG4gKiBTb2NrZXQgY29uc3RydWN0b3IuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB1cmkgb3Igb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gU29ja2V0KHVyaSwgb3B0cyl7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTb2NrZXQpKSByZXR1cm4gbmV3IFNvY2tldCh1cmksIG9wdHMpO1xuXG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gIGlmICh1cmkgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHVyaSkge1xuICAgIG9wdHMgPSB1cmk7XG4gICAgdXJpID0gbnVsbDtcbiAgfVxuXG4gIGlmICh1cmkpIHtcbiAgICB1cmkgPSBwYXJzZXVyaSh1cmkpO1xuICAgIG9wdHMuaG9zdG5hbWUgPSB1cmkuaG9zdDtcbiAgICBvcHRzLnNlY3VyZSA9IHVyaS5wcm90b2NvbCA9PSAnaHR0cHMnIHx8IHVyaS5wcm90b2NvbCA9PSAnd3NzJztcbiAgICBvcHRzLnBvcnQgPSB1cmkucG9ydDtcbiAgICBpZiAodXJpLnF1ZXJ5KSBvcHRzLnF1ZXJ5ID0gdXJpLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKG9wdHMuaG9zdCkge1xuICAgIG9wdHMuaG9zdG5hbWUgPSBwYXJzZXVyaShvcHRzLmhvc3QpLmhvc3Q7XG4gIH1cblxuICB0aGlzLnNlY3VyZSA9IG51bGwgIT0gb3B0cy5zZWN1cmUgPyBvcHRzLnNlY3VyZSA6XG4gICAgKGdsb2JhbC5sb2NhdGlvbiAmJiAnaHR0cHM6JyA9PSBsb2NhdGlvbi5wcm90b2NvbCk7XG5cbiAgaWYgKG9wdHMuaG9zdG5hbWUgJiYgIW9wdHMucG9ydCkge1xuICAgIC8vIGlmIG5vIHBvcnQgaXMgc3BlY2lmaWVkIG1hbnVhbGx5LCB1c2UgdGhlIHByb3RvY29sIGRlZmF1bHRcbiAgICBvcHRzLnBvcnQgPSB0aGlzLnNlY3VyZSA/ICc0NDMnIDogJzgwJztcbiAgfVxuXG4gIHRoaXMuYWdlbnQgPSBvcHRzLmFnZW50IHx8IGZhbHNlO1xuICB0aGlzLmhvc3RuYW1lID0gb3B0cy5ob3N0bmFtZSB8fFxuICAgIChnbG9iYWwubG9jYXRpb24gPyBsb2NhdGlvbi5ob3N0bmFtZSA6ICdsb2NhbGhvc3QnKTtcbiAgdGhpcy5wb3J0ID0gb3B0cy5wb3J0IHx8IChnbG9iYWwubG9jYXRpb24gJiYgbG9jYXRpb24ucG9ydCA/XG4gICAgICAgbG9jYXRpb24ucG9ydCA6XG4gICAgICAgKHRoaXMuc2VjdXJlID8gNDQzIDogODApKTtcbiAgdGhpcy5xdWVyeSA9IG9wdHMucXVlcnkgfHwge307XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgdGhpcy5xdWVyeSkgdGhpcy5xdWVyeSA9IHBhcnNlcXMuZGVjb2RlKHRoaXMucXVlcnkpO1xuICB0aGlzLnVwZ3JhZGUgPSBmYWxzZSAhPT0gb3B0cy51cGdyYWRlO1xuICB0aGlzLnBhdGggPSAob3B0cy5wYXRoIHx8ICcvZW5naW5lLmlvJykucmVwbGFjZSgvXFwvJC8sICcnKSArICcvJztcbiAgdGhpcy5mb3JjZUpTT05QID0gISFvcHRzLmZvcmNlSlNPTlA7XG4gIHRoaXMuanNvbnAgPSBmYWxzZSAhPT0gb3B0cy5qc29ucDtcbiAgdGhpcy5mb3JjZUJhc2U2NCA9ICEhb3B0cy5mb3JjZUJhc2U2NDtcbiAgdGhpcy5lbmFibGVzWERSID0gISFvcHRzLmVuYWJsZXNYRFI7XG4gIHRoaXMudGltZXN0YW1wUGFyYW0gPSBvcHRzLnRpbWVzdGFtcFBhcmFtIHx8ICd0JztcbiAgdGhpcy50aW1lc3RhbXBSZXF1ZXN0cyA9IG9wdHMudGltZXN0YW1wUmVxdWVzdHM7XG4gIHRoaXMudHJhbnNwb3J0cyA9IG9wdHMudHJhbnNwb3J0cyB8fCBbJ3BvbGxpbmcnLCAnd2Vic29ja2V0J107XG4gIHRoaXMucmVhZHlTdGF0ZSA9ICcnO1xuICB0aGlzLndyaXRlQnVmZmVyID0gW107XG4gIHRoaXMucG9saWN5UG9ydCA9IG9wdHMucG9saWN5UG9ydCB8fCA4NDM7XG4gIHRoaXMucmVtZW1iZXJVcGdyYWRlID0gb3B0cy5yZW1lbWJlclVwZ3JhZGUgfHwgZmFsc2U7XG4gIHRoaXMuYmluYXJ5VHlwZSA9IG51bGw7XG4gIHRoaXMub25seUJpbmFyeVVwZ3JhZGVzID0gb3B0cy5vbmx5QmluYXJ5VXBncmFkZXM7XG4gIHRoaXMucGVyTWVzc2FnZURlZmxhdGUgPSBmYWxzZSAhPT0gb3B0cy5wZXJNZXNzYWdlRGVmbGF0ZSA/IChvcHRzLnBlck1lc3NhZ2VEZWZsYXRlIHx8IHt9KSA6IGZhbHNlO1xuXG4gIGlmICh0cnVlID09PSB0aGlzLnBlck1lc3NhZ2VEZWZsYXRlKSB0aGlzLnBlck1lc3NhZ2VEZWZsYXRlID0ge307XG4gIGlmICh0aGlzLnBlck1lc3NhZ2VEZWZsYXRlICYmIG51bGwgPT0gdGhpcy5wZXJNZXNzYWdlRGVmbGF0ZS50aHJlc2hvbGQpIHtcbiAgICB0aGlzLnBlck1lc3NhZ2VEZWZsYXRlLnRocmVzaG9sZCA9IDEwMjQ7XG4gIH1cblxuICAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbiAgdGhpcy5wZnggPSBvcHRzLnBmeCB8fCBudWxsO1xuICB0aGlzLmtleSA9IG9wdHMua2V5IHx8IG51bGw7XG4gIHRoaXMucGFzc3BocmFzZSA9IG9wdHMucGFzc3BocmFzZSB8fCBudWxsO1xuICB0aGlzLmNlcnQgPSBvcHRzLmNlcnQgfHwgbnVsbDtcbiAgdGhpcy5jYSA9IG9wdHMuY2EgfHwgbnVsbDtcbiAgdGhpcy5jaXBoZXJzID0gb3B0cy5jaXBoZXJzIHx8IG51bGw7XG4gIHRoaXMucmVqZWN0VW5hdXRob3JpemVkID0gb3B0cy5yZWplY3RVbmF1dGhvcml6ZWQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvcHRzLnJlamVjdFVuYXV0aG9yaXplZDtcblxuICAvLyBvdGhlciBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxuICB2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuICBpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwpIHtcbiAgICBpZiAob3B0cy5leHRyYUhlYWRlcnMgJiYgT2JqZWN0LmtleXMob3B0cy5leHRyYUhlYWRlcnMpLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZXh0cmFIZWFkZXJzID0gb3B0cy5leHRyYUhlYWRlcnM7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5vcGVuKCk7XG59XG5cblNvY2tldC5wcmlvcldlYnNvY2tldFN1Y2Nlc3MgPSBmYWxzZTtcblxuLyoqXG4gKiBNaXggaW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoU29ja2V0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogUHJvdG9jb2wgdmVyc2lvbi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNvY2tldC5wcm90b2NvbCA9IHBhcnNlci5wcm90b2NvbDsgLy8gdGhpcyBpcyBhbiBpbnRcblxuLyoqXG4gKiBFeHBvc2UgZGVwcyBmb3IgbGVnYWN5IGNvbXBhdGliaWxpdHlcbiAqIGFuZCBzdGFuZGFsb25lIGJyb3dzZXIgYWNjZXNzLlxuICovXG5cblNvY2tldC5Tb2NrZXQgPSBTb2NrZXQ7XG5Tb2NrZXQuVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi90cmFuc3BvcnQnKTtcblNvY2tldC50cmFuc3BvcnRzID0gcmVxdWlyZSgnLi90cmFuc3BvcnRzJyk7XG5Tb2NrZXQucGFyc2VyID0gcmVxdWlyZSgnZW5naW5lLmlvLXBhcnNlcicpO1xuXG4vKipcbiAqIENyZWF0ZXMgdHJhbnNwb3J0IG9mIHRoZSBnaXZlbiB0eXBlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0cmFuc3BvcnQgbmFtZVxuICogQHJldHVybiB7VHJhbnNwb3J0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5jcmVhdGVUcmFuc3BvcnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICBkZWJ1ZygnY3JlYXRpbmcgdHJhbnNwb3J0IFwiJXNcIicsIG5hbWUpO1xuICB2YXIgcXVlcnkgPSBjbG9uZSh0aGlzLnF1ZXJ5KTtcblxuICAvLyBhcHBlbmQgZW5naW5lLmlvIHByb3RvY29sIGlkZW50aWZpZXJcbiAgcXVlcnkuRUlPID0gcGFyc2VyLnByb3RvY29sO1xuXG4gIC8vIHRyYW5zcG9ydCBuYW1lXG4gIHF1ZXJ5LnRyYW5zcG9ydCA9IG5hbWU7XG5cbiAgLy8gc2Vzc2lvbiBpZCBpZiB3ZSBhbHJlYWR5IGhhdmUgb25lXG4gIGlmICh0aGlzLmlkKSBxdWVyeS5zaWQgPSB0aGlzLmlkO1xuXG4gIHZhciB0cmFuc3BvcnQgPSBuZXcgdHJhbnNwb3J0c1tuYW1lXSh7XG4gICAgYWdlbnQ6IHRoaXMuYWdlbnQsXG4gICAgaG9zdG5hbWU6IHRoaXMuaG9zdG5hbWUsXG4gICAgcG9ydDogdGhpcy5wb3J0LFxuICAgIHNlY3VyZTogdGhpcy5zZWN1cmUsXG4gICAgcGF0aDogdGhpcy5wYXRoLFxuICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICBmb3JjZUpTT05QOiB0aGlzLmZvcmNlSlNPTlAsXG4gICAganNvbnA6IHRoaXMuanNvbnAsXG4gICAgZm9yY2VCYXNlNjQ6IHRoaXMuZm9yY2VCYXNlNjQsXG4gICAgZW5hYmxlc1hEUjogdGhpcy5lbmFibGVzWERSLFxuICAgIHRpbWVzdGFtcFJlcXVlc3RzOiB0aGlzLnRpbWVzdGFtcFJlcXVlc3RzLFxuICAgIHRpbWVzdGFtcFBhcmFtOiB0aGlzLnRpbWVzdGFtcFBhcmFtLFxuICAgIHBvbGljeVBvcnQ6IHRoaXMucG9saWN5UG9ydCxcbiAgICBzb2NrZXQ6IHRoaXMsXG4gICAgcGZ4OiB0aGlzLnBmeCxcbiAgICBrZXk6IHRoaXMua2V5LFxuICAgIHBhc3NwaHJhc2U6IHRoaXMucGFzc3BocmFzZSxcbiAgICBjZXJ0OiB0aGlzLmNlcnQsXG4gICAgY2E6IHRoaXMuY2EsXG4gICAgY2lwaGVyczogdGhpcy5jaXBoZXJzLFxuICAgIHJlamVjdFVuYXV0aG9yaXplZDogdGhpcy5yZWplY3RVbmF1dGhvcml6ZWQsXG4gICAgcGVyTWVzc2FnZURlZmxhdGU6IHRoaXMucGVyTWVzc2FnZURlZmxhdGUsXG4gICAgZXh0cmFIZWFkZXJzOiB0aGlzLmV4dHJhSGVhZGVyc1xuICB9KTtcblxuICByZXR1cm4gdHJhbnNwb3J0O1xufTtcblxuZnVuY3Rpb24gY2xvbmUgKG9iaikge1xuICB2YXIgbyA9IHt9O1xuICBmb3IgKHZhciBpIGluIG9iaikge1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgIG9baV0gPSBvYmpbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBvO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemVzIHRyYW5zcG9ydCB0byB1c2UgYW5kIHN0YXJ0cyBwcm9iZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuU29ja2V0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdHJhbnNwb3J0O1xuICBpZiAodGhpcy5yZW1lbWJlclVwZ3JhZGUgJiYgU29ja2V0LnByaW9yV2Vic29ja2V0U3VjY2VzcyAmJiB0aGlzLnRyYW5zcG9ydHMuaW5kZXhPZignd2Vic29ja2V0JykgIT0gLTEpIHtcbiAgICB0cmFuc3BvcnQgPSAnd2Vic29ja2V0JztcbiAgfSBlbHNlIGlmICgwID09PSB0aGlzLnRyYW5zcG9ydHMubGVuZ3RoKSB7XG4gICAgLy8gRW1pdCBlcnJvciBvbiBuZXh0IHRpY2sgc28gaXQgY2FuIGJlIGxpc3RlbmVkIHRvXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLmVtaXQoJ2Vycm9yJywgJ05vIHRyYW5zcG9ydHMgYXZhaWxhYmxlJyk7XG4gICAgfSwgMCk7XG4gICAgcmV0dXJuO1xuICB9IGVsc2Uge1xuICAgIHRyYW5zcG9ydCA9IHRoaXMudHJhbnNwb3J0c1swXTtcbiAgfVxuICB0aGlzLnJlYWR5U3RhdGUgPSAnb3BlbmluZyc7XG5cbiAgLy8gUmV0cnkgd2l0aCB0aGUgbmV4dCB0cmFuc3BvcnQgaWYgdGhlIHRyYW5zcG9ydCBpcyBkaXNhYmxlZCAoanNvbnA6IGZhbHNlKVxuICB0cnkge1xuICAgIHRyYW5zcG9ydCA9IHRoaXMuY3JlYXRlVHJhbnNwb3J0KHRyYW5zcG9ydCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aGlzLnRyYW5zcG9ydHMuc2hpZnQoKTtcbiAgICB0aGlzLm9wZW4oKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cmFuc3BvcnQub3BlbigpO1xuICB0aGlzLnNldFRyYW5zcG9ydCh0cmFuc3BvcnQpO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50IHRyYW5zcG9ydC4gRGlzYWJsZXMgdGhlIGV4aXN0aW5nIG9uZSAoaWYgYW55KS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLnNldFRyYW5zcG9ydCA9IGZ1bmN0aW9uKHRyYW5zcG9ydCl7XG4gIGRlYnVnKCdzZXR0aW5nIHRyYW5zcG9ydCAlcycsIHRyYW5zcG9ydC5uYW1lKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICh0aGlzLnRyYW5zcG9ydCkge1xuICAgIGRlYnVnKCdjbGVhcmluZyBleGlzdGluZyB0cmFuc3BvcnQgJXMnLCB0aGlzLnRyYW5zcG9ydC5uYW1lKTtcbiAgICB0aGlzLnRyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIC8vIHNldCB1cCB0cmFuc3BvcnRcbiAgdGhpcy50cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgLy8gc2V0IHVwIHRyYW5zcG9ydCBsaXN0ZW5lcnNcbiAgdHJhbnNwb3J0XG4gIC5vbignZHJhaW4nLCBmdW5jdGlvbigpe1xuICAgIHNlbGYub25EcmFpbigpO1xuICB9KVxuICAub24oJ3BhY2tldCcsIGZ1bmN0aW9uKHBhY2tldCl7XG4gICAgc2VsZi5vblBhY2tldChwYWNrZXQpO1xuICB9KVxuICAub24oJ2Vycm9yJywgZnVuY3Rpb24oZSl7XG4gICAgc2VsZi5vbkVycm9yKGUpO1xuICB9KVxuICAub24oJ2Nsb3NlJywgZnVuY3Rpb24oKXtcbiAgICBzZWxmLm9uQ2xvc2UoJ3RyYW5zcG9ydCBjbG9zZScpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUHJvYmVzIGEgdHJhbnNwb3J0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0cmFuc3BvcnQgbmFtZVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5wcm9iZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIGRlYnVnKCdwcm9iaW5nIHRyYW5zcG9ydCBcIiVzXCInLCBuYW1lKTtcbiAgdmFyIHRyYW5zcG9ydCA9IHRoaXMuY3JlYXRlVHJhbnNwb3J0KG5hbWUsIHsgcHJvYmU6IDEgfSlcbiAgICAsIGZhaWxlZCA9IGZhbHNlXG4gICAgLCBzZWxmID0gdGhpcztcblxuICBTb2NrZXQucHJpb3JXZWJzb2NrZXRTdWNjZXNzID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25UcmFuc3BvcnRPcGVuKCl7XG4gICAgaWYgKHNlbGYub25seUJpbmFyeVVwZ3JhZGVzKSB7XG4gICAgICB2YXIgdXBncmFkZUxvc2VzQmluYXJ5ID0gIXRoaXMuc3VwcG9ydHNCaW5hcnkgJiYgc2VsZi50cmFuc3BvcnQuc3VwcG9ydHNCaW5hcnk7XG4gICAgICBmYWlsZWQgPSBmYWlsZWQgfHwgdXBncmFkZUxvc2VzQmluYXJ5O1xuICAgIH1cbiAgICBpZiAoZmFpbGVkKSByZXR1cm47XG5cbiAgICBkZWJ1ZygncHJvYmUgdHJhbnNwb3J0IFwiJXNcIiBvcGVuZWQnLCBuYW1lKTtcbiAgICB0cmFuc3BvcnQuc2VuZChbeyB0eXBlOiAncGluZycsIGRhdGE6ICdwcm9iZScgfV0pO1xuICAgIHRyYW5zcG9ydC5vbmNlKCdwYWNrZXQnLCBmdW5jdGlvbiAobXNnKSB7XG4gICAgICBpZiAoZmFpbGVkKSByZXR1cm47XG4gICAgICBpZiAoJ3BvbmcnID09IG1zZy50eXBlICYmICdwcm9iZScgPT0gbXNnLmRhdGEpIHtcbiAgICAgICAgZGVidWcoJ3Byb2JlIHRyYW5zcG9ydCBcIiVzXCIgcG9uZycsIG5hbWUpO1xuICAgICAgICBzZWxmLnVwZ3JhZGluZyA9IHRydWU7XG4gICAgICAgIHNlbGYuZW1pdCgndXBncmFkaW5nJywgdHJhbnNwb3J0KTtcbiAgICAgICAgaWYgKCF0cmFuc3BvcnQpIHJldHVybjtcbiAgICAgICAgU29ja2V0LnByaW9yV2Vic29ja2V0U3VjY2VzcyA9ICd3ZWJzb2NrZXQnID09IHRyYW5zcG9ydC5uYW1lO1xuXG4gICAgICAgIGRlYnVnKCdwYXVzaW5nIGN1cnJlbnQgdHJhbnNwb3J0IFwiJXNcIicsIHNlbGYudHJhbnNwb3J0Lm5hbWUpO1xuICAgICAgICBzZWxmLnRyYW5zcG9ydC5wYXVzZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGZhaWxlZCkgcmV0dXJuO1xuICAgICAgICAgIGlmICgnY2xvc2VkJyA9PSBzZWxmLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgICAgICAgICBkZWJ1ZygnY2hhbmdpbmcgdHJhbnNwb3J0IGFuZCBzZW5kaW5nIHVwZ3JhZGUgcGFja2V0Jyk7XG5cbiAgICAgICAgICBjbGVhbnVwKCk7XG5cbiAgICAgICAgICBzZWxmLnNldFRyYW5zcG9ydCh0cmFuc3BvcnQpO1xuICAgICAgICAgIHRyYW5zcG9ydC5zZW5kKFt7IHR5cGU6ICd1cGdyYWRlJyB9XSk7XG4gICAgICAgICAgc2VsZi5lbWl0KCd1cGdyYWRlJywgdHJhbnNwb3J0KTtcbiAgICAgICAgICB0cmFuc3BvcnQgPSBudWxsO1xuICAgICAgICAgIHNlbGYudXBncmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgc2VsZi5mbHVzaCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCdwcm9iZSB0cmFuc3BvcnQgXCIlc1wiIGZhaWxlZCcsIG5hbWUpO1xuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdwcm9iZSBlcnJvcicpO1xuICAgICAgICBlcnIudHJhbnNwb3J0ID0gdHJhbnNwb3J0Lm5hbWU7XG4gICAgICAgIHNlbGYuZW1pdCgndXBncmFkZUVycm9yJywgZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZyZWV6ZVRyYW5zcG9ydCgpIHtcbiAgICBpZiAoZmFpbGVkKSByZXR1cm47XG5cbiAgICAvLyBBbnkgY2FsbGJhY2sgY2FsbGVkIGJ5IHRyYW5zcG9ydCBzaG91bGQgYmUgaWdub3JlZCBzaW5jZSBub3dcbiAgICBmYWlsZWQgPSB0cnVlO1xuXG4gICAgY2xlYW51cCgpO1xuXG4gICAgdHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxuXG4gIC8vSGFuZGxlIGFueSBlcnJvciB0aGF0IGhhcHBlbnMgd2hpbGUgcHJvYmluZ1xuICBmdW5jdGlvbiBvbmVycm9yKGVycikge1xuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcigncHJvYmUgZXJyb3I6ICcgKyBlcnIpO1xuICAgIGVycm9yLnRyYW5zcG9ydCA9IHRyYW5zcG9ydC5uYW1lO1xuXG4gICAgZnJlZXplVHJhbnNwb3J0KCk7XG5cbiAgICBkZWJ1ZygncHJvYmUgdHJhbnNwb3J0IFwiJXNcIiBmYWlsZWQgYmVjYXVzZSBvZiBlcnJvcjogJXMnLCBuYW1lLCBlcnIpO1xuXG4gICAgc2VsZi5lbWl0KCd1cGdyYWRlRXJyb3InLCBlcnJvcik7XG4gIH1cblxuICBmdW5jdGlvbiBvblRyYW5zcG9ydENsb3NlKCl7XG4gICAgb25lcnJvcihcInRyYW5zcG9ydCBjbG9zZWRcIik7XG4gIH1cblxuICAvL1doZW4gdGhlIHNvY2tldCBpcyBjbG9zZWQgd2hpbGUgd2UncmUgcHJvYmluZ1xuICBmdW5jdGlvbiBvbmNsb3NlKCl7XG4gICAgb25lcnJvcihcInNvY2tldCBjbG9zZWRcIik7XG4gIH1cblxuICAvL1doZW4gdGhlIHNvY2tldCBpcyB1cGdyYWRlZCB3aGlsZSB3ZSdyZSBwcm9iaW5nXG4gIGZ1bmN0aW9uIG9udXBncmFkZSh0byl7XG4gICAgaWYgKHRyYW5zcG9ydCAmJiB0by5uYW1lICE9IHRyYW5zcG9ydC5uYW1lKSB7XG4gICAgICBkZWJ1ZygnXCIlc1wiIHdvcmtzIC0gYWJvcnRpbmcgXCIlc1wiJywgdG8ubmFtZSwgdHJhbnNwb3J0Lm5hbWUpO1xuICAgICAgZnJlZXplVHJhbnNwb3J0KCk7XG4gICAgfVxuICB9XG5cbiAgLy9SZW1vdmUgYWxsIGxpc3RlbmVycyBvbiB0aGUgdHJhbnNwb3J0IGFuZCBvbiBzZWxmXG4gIGZ1bmN0aW9uIGNsZWFudXAoKXtcbiAgICB0cmFuc3BvcnQucmVtb3ZlTGlzdGVuZXIoJ29wZW4nLCBvblRyYW5zcG9ydE9wZW4pO1xuICAgIHRyYW5zcG9ydC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICB0cmFuc3BvcnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgb25UcmFuc3BvcnRDbG9zZSk7XG4gICAgc2VsZi5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvbmNsb3NlKTtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCd1cGdyYWRpbmcnLCBvbnVwZ3JhZGUpO1xuICB9XG5cbiAgdHJhbnNwb3J0Lm9uY2UoJ29wZW4nLCBvblRyYW5zcG9ydE9wZW4pO1xuICB0cmFuc3BvcnQub25jZSgnZXJyb3InLCBvbmVycm9yKTtcbiAgdHJhbnNwb3J0Lm9uY2UoJ2Nsb3NlJywgb25UcmFuc3BvcnRDbG9zZSk7XG5cbiAgdGhpcy5vbmNlKCdjbG9zZScsIG9uY2xvc2UpO1xuICB0aGlzLm9uY2UoJ3VwZ3JhZGluZycsIG9udXBncmFkZSk7XG5cbiAgdHJhbnNwb3J0Lm9wZW4oKTtcblxufTtcblxuLyoqXG4gKiBDYWxsZWQgd2hlbiBjb25uZWN0aW9uIGlzIGRlZW1lZCBvcGVuLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuU29ja2V0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gIGRlYnVnKCdzb2NrZXQgb3BlbicpO1xuICB0aGlzLnJlYWR5U3RhdGUgPSAnb3Blbic7XG4gIFNvY2tldC5wcmlvcldlYnNvY2tldFN1Y2Nlc3MgPSAnd2Vic29ja2V0JyA9PSB0aGlzLnRyYW5zcG9ydC5uYW1lO1xuICB0aGlzLmVtaXQoJ29wZW4nKTtcbiAgdGhpcy5mbHVzaCgpO1xuXG4gIC8vIHdlIGNoZWNrIGZvciBgcmVhZHlTdGF0ZWAgaW4gY2FzZSBhbiBgb3BlbmBcbiAgLy8gbGlzdGVuZXIgYWxyZWFkeSBjbG9zZWQgdGhlIHNvY2tldFxuICBpZiAoJ29wZW4nID09IHRoaXMucmVhZHlTdGF0ZSAmJiB0aGlzLnVwZ3JhZGUgJiYgdGhpcy50cmFuc3BvcnQucGF1c2UpIHtcbiAgICBkZWJ1Zygnc3RhcnRpbmcgdXBncmFkZSBwcm9iZXMnKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMudXBncmFkZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLnByb2JlKHRoaXMudXBncmFkZXNbaV0pO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGEgcGFja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblNvY2tldC5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gIGlmICgnb3BlbmluZycgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpIHtcbiAgICBkZWJ1Zygnc29ja2V0IHJlY2VpdmU6IHR5cGUgXCIlc1wiLCBkYXRhIFwiJXNcIicsIHBhY2tldC50eXBlLCBwYWNrZXQuZGF0YSk7XG5cbiAgICB0aGlzLmVtaXQoJ3BhY2tldCcsIHBhY2tldCk7XG5cbiAgICAvLyBTb2NrZXQgaXMgbGl2ZSAtIGFueSBwYWNrZXQgY291bnRzXG4gICAgdGhpcy5lbWl0KCdoZWFydGJlYXQnKTtcblxuICAgIHN3aXRjaCAocGFja2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICB0aGlzLm9uSGFuZHNoYWtlKHBhcnNlanNvbihwYWNrZXQuZGF0YSkpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncG9uZyc6XG4gICAgICAgIHRoaXMuc2V0UGluZygpO1xuICAgICAgICB0aGlzLmVtaXQoJ3BvbmcnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc2VydmVyIGVycm9yJyk7XG4gICAgICAgIGVyci5jb2RlID0gcGFja2V0LmRhdGE7XG4gICAgICAgIHRoaXMub25FcnJvcihlcnIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICAgIHRoaXMuZW1pdCgnZGF0YScsIHBhY2tldC5kYXRhKTtcbiAgICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgcGFja2V0LmRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZGVidWcoJ3BhY2tldCByZWNlaXZlZCB3aXRoIHNvY2tldCByZWFkeVN0YXRlIFwiJXNcIicsIHRoaXMucmVhZHlTdGF0ZSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gaGFuZHNoYWtlIGNvbXBsZXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhhbmRzaGFrZSBvYmpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblNvY2tldC5wcm90b3R5cGUub25IYW5kc2hha2UgPSBmdW5jdGlvbiAoZGF0YSkge1xuICB0aGlzLmVtaXQoJ2hhbmRzaGFrZScsIGRhdGEpO1xuICB0aGlzLmlkID0gZGF0YS5zaWQ7XG4gIHRoaXMudHJhbnNwb3J0LnF1ZXJ5LnNpZCA9IGRhdGEuc2lkO1xuICB0aGlzLnVwZ3JhZGVzID0gdGhpcy5maWx0ZXJVcGdyYWRlcyhkYXRhLnVwZ3JhZGVzKTtcbiAgdGhpcy5waW5nSW50ZXJ2YWwgPSBkYXRhLnBpbmdJbnRlcnZhbDtcbiAgdGhpcy5waW5nVGltZW91dCA9IGRhdGEucGluZ1RpbWVvdXQ7XG4gIHRoaXMub25PcGVuKCk7XG4gIC8vIEluIGNhc2Ugb3BlbiBoYW5kbGVyIGNsb3NlcyBzb2NrZXRcbiAgaWYgICgnY2xvc2VkJyA9PSB0aGlzLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgdGhpcy5zZXRQaW5nKCk7XG5cbiAgLy8gUHJvbG9uZyBsaXZlbmVzcyBvZiBzb2NrZXQgb24gaGVhcnRiZWF0XG4gIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2hlYXJ0YmVhdCcsIHRoaXMub25IZWFydGJlYXQpO1xuICB0aGlzLm9uKCdoZWFydGJlYXQnLCB0aGlzLm9uSGVhcnRiZWF0KTtcbn07XG5cbi8qKlxuICogUmVzZXRzIHBpbmcgdGltZW91dC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLm9uSGVhcnRiZWF0ID0gZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgY2xlYXJUaW1lb3V0KHRoaXMucGluZ1RpbWVvdXRUaW1lcik7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5waW5nVGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCdjbG9zZWQnID09IHNlbGYucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgIHNlbGYub25DbG9zZSgncGluZyB0aW1lb3V0Jyk7XG4gIH0sIHRpbWVvdXQgfHwgKHNlbGYucGluZ0ludGVydmFsICsgc2VsZi5waW5nVGltZW91dCkpO1xufTtcblxuLyoqXG4gKiBQaW5ncyBzZXJ2ZXIgZXZlcnkgYHRoaXMucGluZ0ludGVydmFsYCBhbmQgZXhwZWN0cyByZXNwb25zZVxuICogd2l0aGluIGB0aGlzLnBpbmdUaW1lb3V0YCBvciBjbG9zZXMgY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLnNldFBpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgY2xlYXJUaW1lb3V0KHNlbGYucGluZ0ludGVydmFsVGltZXIpO1xuICBzZWxmLnBpbmdJbnRlcnZhbFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgZGVidWcoJ3dyaXRpbmcgcGluZyBwYWNrZXQgLSBleHBlY3RpbmcgcG9uZyB3aXRoaW4gJXNtcycsIHNlbGYucGluZ1RpbWVvdXQpO1xuICAgIHNlbGYucGluZygpO1xuICAgIHNlbGYub25IZWFydGJlYXQoc2VsZi5waW5nVGltZW91dCk7XG4gIH0sIHNlbGYucGluZ0ludGVydmFsKTtcbn07XG5cbi8qKlxuKiBTZW5kcyBhIHBpbmcgcGFja2V0LlxuKlxuKiBAYXBpIHByaXZhdGVcbiovXG5cblNvY2tldC5wcm90b3R5cGUucGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLnNlbmRQYWNrZXQoJ3BpbmcnLCBmdW5jdGlvbigpe1xuICAgIHNlbGYuZW1pdCgncGluZycpO1xuICB9KTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIG9uIGBkcmFpbmAgZXZlbnRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLm9uRHJhaW4gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy53cml0ZUJ1ZmZlci5zcGxpY2UoMCwgdGhpcy5wcmV2QnVmZmVyTGVuKTtcblxuICAvLyBzZXR0aW5nIHByZXZCdWZmZXJMZW4gPSAwIGlzIHZlcnkgaW1wb3J0YW50XG4gIC8vIGZvciBleGFtcGxlLCB3aGVuIHVwZ3JhZGluZywgdXBncmFkZSBwYWNrZXQgaXMgc2VudCBvdmVyLFxuICAvLyBhbmQgYSBub256ZXJvIHByZXZCdWZmZXJMZW4gY291bGQgY2F1c2UgcHJvYmxlbXMgb24gYGRyYWluYFxuICB0aGlzLnByZXZCdWZmZXJMZW4gPSAwO1xuXG4gIGlmICgwID09PSB0aGlzLndyaXRlQnVmZmVyLmxlbmd0aCkge1xuICAgIHRoaXMuZW1pdCgnZHJhaW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmZsdXNoKCk7XG4gIH1cbn07XG5cbi8qKlxuICogRmx1c2ggd3JpdGUgYnVmZmVycy5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICBpZiAoJ2Nsb3NlZCcgIT0gdGhpcy5yZWFkeVN0YXRlICYmIHRoaXMudHJhbnNwb3J0LndyaXRhYmxlICYmXG4gICAgIXRoaXMudXBncmFkaW5nICYmIHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoKSB7XG4gICAgZGVidWcoJ2ZsdXNoaW5nICVkIHBhY2tldHMgaW4gc29ja2V0JywgdGhpcy53cml0ZUJ1ZmZlci5sZW5ndGgpO1xuICAgIHRoaXMudHJhbnNwb3J0LnNlbmQodGhpcy53cml0ZUJ1ZmZlcik7XG4gICAgLy8ga2VlcCB0cmFjayBvZiBjdXJyZW50IGxlbmd0aCBvZiB3cml0ZUJ1ZmZlclxuICAgIC8vIHNwbGljZSB3cml0ZUJ1ZmZlciBhbmQgY2FsbGJhY2tCdWZmZXIgb24gYGRyYWluYFxuICAgIHRoaXMucHJldkJ1ZmZlckxlbiA9IHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoO1xuICAgIHRoaXMuZW1pdCgnZmx1c2gnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZW5kcyBhIG1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICogQHJldHVybiB7U29ja2V0fSBmb3IgY2hhaW5pbmcuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNvY2tldC5wcm90b3R5cGUud3JpdGUgPVxuU29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKG1zZywgb3B0aW9ucywgZm4pIHtcbiAgdGhpcy5zZW5kUGFja2V0KCdtZXNzYWdlJywgbXNnLCBvcHRpb25zLCBmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kcyBhIHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFja2V0IHR5cGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLnNlbmRQYWNrZXQgPSBmdW5jdGlvbiAodHlwZSwgZGF0YSwgb3B0aW9ucywgZm4pIHtcbiAgaWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIG9wdGlvbnMpIHtcbiAgICBmbiA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IG51bGw7XG4gIH1cblxuICBpZiAoJ2Nsb3NpbmcnID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnY2xvc2VkJyA9PSB0aGlzLnJlYWR5U3RhdGUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgb3B0aW9ucy5jb21wcmVzcyA9IGZhbHNlICE9PSBvcHRpb25zLmNvbXByZXNzO1xuXG4gIHZhciBwYWNrZXQgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgfTtcbiAgdGhpcy5lbWl0KCdwYWNrZXRDcmVhdGUnLCBwYWNrZXQpO1xuICB0aGlzLndyaXRlQnVmZmVyLnB1c2gocGFja2V0KTtcbiAgaWYgKGZuKSB0aGlzLm9uY2UoJ2ZsdXNoJywgZm4pO1xuICB0aGlzLmZsdXNoKCk7XG59O1xuXG4vKipcbiAqIENsb3NlcyB0aGUgY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoJ29wZW5pbmcnID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKSB7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NpbmcnO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzLm9uY2UoJ2RyYWluJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZ3JhZGluZykge1xuICAgICAgICAgIHdhaXRGb3JVcGdyYWRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnVwZ3JhZGluZykge1xuICAgICAgd2FpdEZvclVwZ3JhZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICBzZWxmLm9uQ2xvc2UoJ2ZvcmNlZCBjbG9zZScpO1xuICAgIGRlYnVnKCdzb2NrZXQgY2xvc2luZyAtIHRlbGxpbmcgdHJhbnNwb3J0IHRvIGNsb3NlJyk7XG4gICAgc2VsZi50cmFuc3BvcnQuY2xvc2UoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFudXBBbmRDbG9zZSgpIHtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCd1cGdyYWRlJywgY2xlYW51cEFuZENsb3NlKTtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCd1cGdyYWRlRXJyb3InLCBjbGVhbnVwQW5kQ2xvc2UpO1xuICAgIGNsb3NlKCk7XG4gIH1cblxuICBmdW5jdGlvbiB3YWl0Rm9yVXBncmFkZSgpIHtcbiAgICAvLyB3YWl0IGZvciB1cGdyYWRlIHRvIGZpbmlzaCBzaW5jZSB3ZSBjYW4ndCBzZW5kIHBhY2tldHMgd2hpbGUgcGF1c2luZyBhIHRyYW5zcG9ydFxuICAgIHNlbGYub25jZSgndXBncmFkZScsIGNsZWFudXBBbmRDbG9zZSk7XG4gICAgc2VsZi5vbmNlKCd1cGdyYWRlRXJyb3InLCBjbGVhbnVwQW5kQ2xvc2UpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIHRyYW5zcG9ydCBlcnJvclxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblNvY2tldC5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgZGVidWcoJ3NvY2tldCBlcnJvciAlaicsIGVycik7XG4gIFNvY2tldC5wcmlvcldlYnNvY2tldFN1Y2Nlc3MgPSBmYWxzZTtcbiAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIHRoaXMub25DbG9zZSgndHJhbnNwb3J0IGVycm9yJywgZXJyKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gdHJhbnNwb3J0IGNsb3NlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblNvY2tldC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uIChyZWFzb24sIGRlc2MpIHtcbiAgaWYgKCdvcGVuaW5nJyA9PSB0aGlzLnJlYWR5U3RhdGUgfHwgJ29wZW4nID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnY2xvc2luZycgPT0gdGhpcy5yZWFkeVN0YXRlKSB7XG4gICAgZGVidWcoJ3NvY2tldCBjbG9zZSB3aXRoIHJlYXNvbjogXCIlc1wiJywgcmVhc29uKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBjbGVhciB0aW1lcnNcbiAgICBjbGVhclRpbWVvdXQodGhpcy5waW5nSW50ZXJ2YWxUaW1lcik7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucGluZ1RpbWVvdXRUaW1lcik7XG5cbiAgICAvLyBzdG9wIGV2ZW50IGZyb20gZmlyaW5nIGFnYWluIGZvciB0cmFuc3BvcnRcbiAgICB0aGlzLnRyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2Nsb3NlJyk7XG5cbiAgICAvLyBlbnN1cmUgdHJhbnNwb3J0IHdvbid0IHN0YXkgb3BlblxuICAgIHRoaXMudHJhbnNwb3J0LmNsb3NlKCk7XG5cbiAgICAvLyBpZ25vcmUgZnVydGhlciB0cmFuc3BvcnQgY29tbXVuaWNhdGlvblxuICAgIHRoaXMudHJhbnNwb3J0LnJlbW92ZUFsbExpc3RlbmVycygpO1xuXG4gICAgLy8gc2V0IHJlYWR5IHN0YXRlXG4gICAgdGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7XG5cbiAgICAvLyBjbGVhciBzZXNzaW9uIGlkXG4gICAgdGhpcy5pZCA9IG51bGw7XG5cbiAgICAvLyBlbWl0IGNsb3NlIGV2ZW50XG4gICAgdGhpcy5lbWl0KCdjbG9zZScsIHJlYXNvbiwgZGVzYyk7XG5cbiAgICAvLyBjbGVhbiBidWZmZXJzIGFmdGVyLCBzbyB1c2VycyBjYW4gc3RpbGxcbiAgICAvLyBncmFiIHRoZSBidWZmZXJzIG9uIGBjbG9zZWAgZXZlbnRcbiAgICBzZWxmLndyaXRlQnVmZmVyID0gW107XG4gICAgc2VsZi5wcmV2QnVmZmVyTGVuID0gMDtcbiAgfVxufTtcblxuLyoqXG4gKiBGaWx0ZXJzIHVwZ3JhZGVzLCByZXR1cm5pbmcgb25seSB0aG9zZSBtYXRjaGluZyBjbGllbnQgdHJhbnNwb3J0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzZXJ2ZXIgdXBncmFkZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICpcbiAqL1xuXG5Tb2NrZXQucHJvdG90eXBlLmZpbHRlclVwZ3JhZGVzID0gZnVuY3Rpb24gKHVwZ3JhZGVzKSB7XG4gIHZhciBmaWx0ZXJlZFVwZ3JhZGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBqID0gdXBncmFkZXMubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgIGlmICh+aW5kZXgodGhpcy50cmFuc3BvcnRzLCB1cGdyYWRlc1tpXSkpIGZpbHRlcmVkVXBncmFkZXMucHVzaCh1cGdyYWRlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGZpbHRlcmVkVXBncmFkZXM7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBwYXJzZXIgPSByZXF1aXJlKCdlbmdpbmUuaW8tcGFyc2VyJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc3BvcnQ7XG5cbi8qKlxuICogVHJhbnNwb3J0IGFic3RyYWN0IGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNwb3J0IChvcHRzKSB7XG4gIHRoaXMucGF0aCA9IG9wdHMucGF0aDtcbiAgdGhpcy5ob3N0bmFtZSA9IG9wdHMuaG9zdG5hbWU7XG4gIHRoaXMucG9ydCA9IG9wdHMucG9ydDtcbiAgdGhpcy5zZWN1cmUgPSBvcHRzLnNlY3VyZTtcbiAgdGhpcy5xdWVyeSA9IG9wdHMucXVlcnk7XG4gIHRoaXMudGltZXN0YW1wUGFyYW0gPSBvcHRzLnRpbWVzdGFtcFBhcmFtO1xuICB0aGlzLnRpbWVzdGFtcFJlcXVlc3RzID0gb3B0cy50aW1lc3RhbXBSZXF1ZXN0cztcbiAgdGhpcy5yZWFkeVN0YXRlID0gJyc7XG4gIHRoaXMuYWdlbnQgPSBvcHRzLmFnZW50IHx8IGZhbHNlO1xuICB0aGlzLnNvY2tldCA9IG9wdHMuc29ja2V0O1xuICB0aGlzLmVuYWJsZXNYRFIgPSBvcHRzLmVuYWJsZXNYRFI7XG5cbiAgLy8gU1NMIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG4gIHRoaXMucGZ4ID0gb3B0cy5wZng7XG4gIHRoaXMua2V5ID0gb3B0cy5rZXk7XG4gIHRoaXMucGFzc3BocmFzZSA9IG9wdHMucGFzc3BocmFzZTtcbiAgdGhpcy5jZXJ0ID0gb3B0cy5jZXJ0O1xuICB0aGlzLmNhID0gb3B0cy5jYTtcbiAgdGhpcy5jaXBoZXJzID0gb3B0cy5jaXBoZXJzO1xuICB0aGlzLnJlamVjdFVuYXV0aG9yaXplZCA9IG9wdHMucmVqZWN0VW5hdXRob3JpemVkO1xuXG4gIC8vIG90aGVyIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG4gIHRoaXMuZXh0cmFIZWFkZXJzID0gb3B0cy5leHRyYUhlYWRlcnM7XG59XG5cbi8qKlxuICogTWl4IGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFRyYW5zcG9ydC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEVtaXRzIGFuIGVycm9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1RyYW5zcG9ydH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblRyYW5zcG9ydC5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChtc2csIGRlc2MpIHtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIudHlwZSA9ICdUcmFuc3BvcnRFcnJvcic7XG4gIGVyci5kZXNjcmlwdGlvbiA9IGRlc2M7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT3BlbnMgdGhlIHRyYW5zcG9ydC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblRyYW5zcG9ydC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCdjbG9zZWQnID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnJyA9PSB0aGlzLnJlYWR5U3RhdGUpIHtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSAnb3BlbmluZyc7XG4gICAgdGhpcy5kb09wZW4oKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbG9zZXMgdGhlIHRyYW5zcG9ydC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5UcmFuc3BvcnQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoJ29wZW5pbmcnID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKSB7XG4gICAgdGhpcy5kb0Nsb3NlKCk7XG4gICAgdGhpcy5vbkNsb3NlKCk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZHMgbXVsdGlwbGUgcGFja2V0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWNrZXRzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5UcmFuc3BvcnQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihwYWNrZXRzKXtcbiAgaWYgKCdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpIHtcbiAgICB0aGlzLndyaXRlKHBhY2tldHMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVHJhbnNwb3J0IG5vdCBvcGVuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gb3BlblxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblRyYW5zcG9ydC5wcm90b3R5cGUub25PcGVuID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJlYWR5U3RhdGUgPSAnb3Blbic7XG4gIHRoaXMud3JpdGFibGUgPSB0cnVlO1xuICB0aGlzLmVtaXQoJ29wZW4nKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdpdGggZGF0YS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIHBhY2tldCA9IHBhcnNlci5kZWNvZGVQYWNrZXQoZGF0YSwgdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSk7XG4gIHRoaXMub25QYWNrZXQocGFja2V0KTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdpdGggYSBkZWNvZGVkIHBhY2tldC5cbiAqL1xuXG5UcmFuc3BvcnQucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICB0aGlzLmVtaXQoJ3BhY2tldCcsIHBhY2tldCk7XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIGNsb3NlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblRyYW5zcG9ydC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7XG4gIHRoaXMuZW1pdCgnY2xvc2UnKTtcbn07XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgWE1MSHR0cFJlcXVlc3QgPSByZXF1aXJlKCd4bWxodHRwcmVxdWVzdC1zc2wnKTtcbnZhciBYSFIgPSByZXF1aXJlKCcuL3BvbGxpbmcteGhyJyk7XG52YXIgSlNPTlAgPSByZXF1aXJlKCcuL3BvbGxpbmctanNvbnAnKTtcbnZhciB3ZWJzb2NrZXQgPSByZXF1aXJlKCcuL3dlYnNvY2tldCcpO1xuXG4vKipcbiAqIEV4cG9ydCB0cmFuc3BvcnRzLlxuICovXG5cbmV4cG9ydHMucG9sbGluZyA9IHBvbGxpbmc7XG5leHBvcnRzLndlYnNvY2tldCA9IHdlYnNvY2tldDtcblxuLyoqXG4gKiBQb2xsaW5nIHRyYW5zcG9ydCBwb2x5bW9ycGhpYyBjb25zdHJ1Y3Rvci5cbiAqIERlY2lkZXMgb24geGhyIHZzIGpzb25wIGJhc2VkIG9uIGZlYXR1cmUgZGV0ZWN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBvbGxpbmcob3B0cyl7XG4gIHZhciB4aHI7XG4gIHZhciB4ZCA9IGZhbHNlO1xuICB2YXIgeHMgPSBmYWxzZTtcbiAgdmFyIGpzb25wID0gZmFsc2UgIT09IG9wdHMuanNvbnA7XG5cbiAgaWYgKGdsb2JhbC5sb2NhdGlvbikge1xuICAgIHZhciBpc1NTTCA9ICdodHRwczonID09IGxvY2F0aW9uLnByb3RvY29sO1xuICAgIHZhciBwb3J0ID0gbG9jYXRpb24ucG9ydDtcblxuICAgIC8vIHNvbWUgdXNlciBhZ2VudHMgaGF2ZSBlbXB0eSBgbG9jYXRpb24ucG9ydGBcbiAgICBpZiAoIXBvcnQpIHtcbiAgICAgIHBvcnQgPSBpc1NTTCA/IDQ0MyA6IDgwO1xuICAgIH1cblxuICAgIHhkID0gb3B0cy5ob3N0bmFtZSAhPSBsb2NhdGlvbi5ob3N0bmFtZSB8fCBwb3J0ICE9IG9wdHMucG9ydDtcbiAgICB4cyA9IG9wdHMuc2VjdXJlICE9IGlzU1NMO1xuICB9XG5cbiAgb3B0cy54ZG9tYWluID0geGQ7XG4gIG9wdHMueHNjaGVtZSA9IHhzO1xuICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Qob3B0cyk7XG5cbiAgaWYgKCdvcGVuJyBpbiB4aHIgJiYgIW9wdHMuZm9yY2VKU09OUCkge1xuICAgIHJldHVybiBuZXcgWEhSKG9wdHMpO1xuICB9IGVsc2Uge1xuICAgIGlmICghanNvbnApIHRocm93IG5ldyBFcnJvcignSlNPTlAgZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gbmV3IEpTT05QKG9wdHMpO1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIHJlcXVpcmVtZW50cy5cbiAqL1xuXG52YXIgUG9sbGluZyA9IHJlcXVpcmUoJy4vcG9sbGluZycpO1xudmFyIGluaGVyaXQgPSByZXF1aXJlKCdjb21wb25lbnQtaW5oZXJpdCcpO1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gSlNPTlBQb2xsaW5nO1xuXG4vKipcbiAqIENhY2hlZCByZWd1bGFyIGV4cHJlc3Npb25zLlxuICovXG5cbnZhciByTmV3bGluZSA9IC9cXG4vZztcbnZhciByRXNjYXBlZE5ld2xpbmUgPSAvXFxcXG4vZztcblxuLyoqXG4gKiBHbG9iYWwgSlNPTlAgY2FsbGJhY2tzLlxuICovXG5cbnZhciBjYWxsYmFja3M7XG5cbi8qKlxuICogQ2FsbGJhY2tzIGNvdW50LlxuICovXG5cbnZhciBpbmRleCA9IDA7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBlbXB0eSAoKSB7IH1cblxuLyoqXG4gKiBKU09OUCBQb2xsaW5nIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBKU09OUFBvbGxpbmcgKG9wdHMpIHtcbiAgUG9sbGluZy5jYWxsKHRoaXMsIG9wdHMpO1xuXG4gIHRoaXMucXVlcnkgPSB0aGlzLnF1ZXJ5IHx8IHt9O1xuXG4gIC8vIGRlZmluZSBnbG9iYWwgY2FsbGJhY2tzIGFycmF5IGlmIG5vdCBwcmVzZW50XG4gIC8vIHdlIGRvIHRoaXMgaGVyZSAobGF6aWx5KSB0byBhdm9pZCB1bm5lZWRlZCBnbG9iYWwgcG9sbHV0aW9uXG4gIGlmICghY2FsbGJhY2tzKSB7XG4gICAgLy8gd2UgbmVlZCB0byBjb25zaWRlciBtdWx0aXBsZSBlbmdpbmVzIGluIHRoZSBzYW1lIHBhZ2VcbiAgICBpZiAoIWdsb2JhbC5fX19laW8pIGdsb2JhbC5fX19laW8gPSBbXTtcbiAgICBjYWxsYmFja3MgPSBnbG9iYWwuX19fZWlvO1xuICB9XG5cbiAgLy8gY2FsbGJhY2sgaWRlbnRpZmllclxuICB0aGlzLmluZGV4ID0gY2FsbGJhY2tzLmxlbmd0aDtcblxuICAvLyBhZGQgY2FsbGJhY2sgdG8ganNvbnAgZ2xvYmFsXG4gIHZhciBzZWxmID0gdGhpcztcbiAgY2FsbGJhY2tzLnB1c2goZnVuY3Rpb24gKG1zZykge1xuICAgIHNlbGYub25EYXRhKG1zZyk7XG4gIH0pO1xuXG4gIC8vIGFwcGVuZCB0byBxdWVyeSBzdHJpbmdcbiAgdGhpcy5xdWVyeS5qID0gdGhpcy5pbmRleDtcblxuICAvLyBwcmV2ZW50IHNwdXJpb3VzIGVycm9ycyBmcm9tIGJlaW5nIGVtaXR0ZWQgd2hlbiB0aGUgd2luZG93IGlzIHVubG9hZGVkXG4gIGlmIChnbG9iYWwuZG9jdW1lbnQgJiYgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuc2NyaXB0KSBzZWxmLnNjcmlwdC5vbmVycm9yID0gZW1wdHk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG59XG5cbi8qKlxuICogSW5oZXJpdHMgZnJvbSBQb2xsaW5nLlxuICovXG5cbmluaGVyaXQoSlNPTlBQb2xsaW5nLCBQb2xsaW5nKTtcblxuLypcbiAqIEpTT05QIG9ubHkgc3VwcG9ydHMgYmluYXJ5IGFzIGJhc2U2NCBlbmNvZGVkIHN0cmluZ3NcbiAqL1xuXG5KU09OUFBvbGxpbmcucHJvdG90eXBlLnN1cHBvcnRzQmluYXJ5ID0gZmFsc2U7XG5cbi8qKlxuICogQ2xvc2VzIHRoZSBzb2NrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5kb0Nsb3NlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5zY3JpcHQpIHtcbiAgICB0aGlzLnNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuc2NyaXB0KTtcbiAgICB0aGlzLnNjcmlwdCA9IG51bGw7XG4gIH1cblxuICBpZiAodGhpcy5mb3JtKSB7XG4gICAgdGhpcy5mb3JtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5mb3JtKTtcbiAgICB0aGlzLmZvcm0gPSBudWxsO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxuXG4gIFBvbGxpbmcucHJvdG90eXBlLmRvQ2xvc2UuY2FsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogU3RhcnRzIGEgcG9sbCBjeWNsZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5KU09OUFBvbGxpbmcucHJvdG90eXBlLmRvUG9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgaWYgKHRoaXMuc2NyaXB0KSB7XG4gICAgdGhpcy5zY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnNjcmlwdCk7XG4gICAgdGhpcy5zY3JpcHQgPSBudWxsO1xuICB9XG5cbiAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgc2NyaXB0LnNyYyA9IHRoaXMudXJpKCk7XG4gIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgc2VsZi5vbkVycm9yKCdqc29ucCBwb2xsIGVycm9yJyxlKTtcbiAgfTtcblxuICB2YXIgaW5zZXJ0QXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gIGlmIChpbnNlcnRBdCkge1xuICAgIGluc2VydEF0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaW5zZXJ0QXQpO1xuICB9XG4gIGVsc2Uge1xuICAgIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmJvZHkpLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH1cbiAgdGhpcy5zY3JpcHQgPSBzY3JpcHQ7XG5cbiAgdmFyIGlzVUFnZWNrbyA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBuYXZpZ2F0b3IgJiYgL2dlY2tvL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgXG4gIGlmIChpc1VBZ2Vja28pIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgICB9LCAxMDApO1xuICB9XG59O1xuXG4vKipcbiAqIFdyaXRlcyB3aXRoIGEgaGlkZGVuIGlmcmFtZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YSB0byBzZW5kXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsZWQgdXBvbiBmbHVzaC5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkpTT05QUG9sbGluZy5wcm90b3R5cGUuZG9Xcml0ZSA9IGZ1bmN0aW9uIChkYXRhLCBmbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCF0aGlzLmZvcm0pIHtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgICB2YXIgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgdmFyIGlkID0gdGhpcy5pZnJhbWVJZCA9ICdlaW9faWZyYW1lXycgKyB0aGlzLmluZGV4O1xuICAgIHZhciBpZnJhbWU7XG5cbiAgICBmb3JtLmNsYXNzTmFtZSA9ICdzb2NrZXRpbyc7XG4gICAgZm9ybS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgZm9ybS5zdHlsZS50b3AgPSAnLTEwMDBweCc7XG4gICAgZm9ybS5zdHlsZS5sZWZ0ID0gJy0xMDAwcHgnO1xuICAgIGZvcm0udGFyZ2V0ID0gaWQ7XG4gICAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ2FjY2VwdC1jaGFyc2V0JywgJ3V0Zi04Jyk7XG4gICAgYXJlYS5uYW1lID0gJ2QnO1xuICAgIGZvcm0uYXBwZW5kQ2hpbGQoYXJlYSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIHRoaXMuZm9ybSA9IGZvcm07XG4gICAgdGhpcy5hcmVhID0gYXJlYTtcbiAgfVxuXG4gIHRoaXMuZm9ybS5hY3Rpb24gPSB0aGlzLnVyaSgpO1xuXG4gIGZ1bmN0aW9uIGNvbXBsZXRlICgpIHtcbiAgICBpbml0SWZyYW1lKCk7XG4gICAgZm4oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRJZnJhbWUgKCkge1xuICAgIGlmIChzZWxmLmlmcmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2VsZi5mb3JtLnJlbW92ZUNoaWxkKHNlbGYuaWZyYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2VsZi5vbkVycm9yKCdqc29ucCBwb2xsaW5nIGlmcmFtZSByZW1vdmFsIGVycm9yJywgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIGllNiBkeW5hbWljIGlmcmFtZXMgd2l0aCB0YXJnZXQ9XCJcIiBzdXBwb3J0ICh0aGFua3MgQ2hyaXMgTGFtYmFjaGVyKVxuICAgICAgdmFyIGh0bWwgPSAnPGlmcmFtZSBzcmM9XCJqYXZhc2NyaXB0OjBcIiBuYW1lPVwiJysgc2VsZi5pZnJhbWVJZCArJ1wiPic7XG4gICAgICBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGh0bWwpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgaWZyYW1lLm5hbWUgPSBzZWxmLmlmcmFtZUlkO1xuICAgICAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0OjAnO1xuICAgIH1cblxuICAgIGlmcmFtZS5pZCA9IHNlbGYuaWZyYW1lSWQ7XG5cbiAgICBzZWxmLmZvcm0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICBzZWxmLmlmcmFtZSA9IGlmcmFtZTtcbiAgfVxuXG4gIGluaXRJZnJhbWUoKTtcblxuICAvLyBlc2NhcGUgXFxuIHRvIHByZXZlbnQgaXQgZnJvbSBiZWluZyBjb252ZXJ0ZWQgaW50byBcXHJcXG4gYnkgc29tZSBVQXNcbiAgLy8gZG91YmxlIGVzY2FwaW5nIGlzIHJlcXVpcmVkIGZvciBlc2NhcGVkIG5ldyBsaW5lcyBiZWNhdXNlIHVuZXNjYXBpbmcgb2YgbmV3IGxpbmVzIGNhbiBiZSBkb25lIHNhZmVseSBvbiBzZXJ2ZXItc2lkZVxuICBkYXRhID0gZGF0YS5yZXBsYWNlKHJFc2NhcGVkTmV3bGluZSwgJ1xcXFxcXG4nKTtcbiAgdGhpcy5hcmVhLnZhbHVlID0gZGF0YS5yZXBsYWNlKHJOZXdsaW5lLCAnXFxcXG4nKTtcblxuICB0cnkge1xuICAgIHRoaXMuZm9ybS5zdWJtaXQoKTtcbiAgfSBjYXRjaChlKSB7fVxuXG4gIGlmICh0aGlzLmlmcmFtZS5hdHRhY2hFdmVudCkge1xuICAgIHRoaXMuaWZyYW1lLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoc2VsZi5pZnJhbWUucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSB7XG4gICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmlmcmFtZS5vbmxvYWQgPSBjb21wbGV0ZTtcbiAgfVxufTtcbiIsIi8qKlxuICogTW9kdWxlIHJlcXVpcmVtZW50cy5cbiAqL1xuXG52YXIgWE1MSHR0cFJlcXVlc3QgPSByZXF1aXJlKCd4bWxodHRwcmVxdWVzdC1zc2wnKTtcbnZhciBQb2xsaW5nID0gcmVxdWlyZSgnLi9wb2xsaW5nJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJ2NvbXBvbmVudC1pbmhlcml0Jyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdlbmdpbmUuaW8tY2xpZW50OnBvbGxpbmcteGhyJyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBYSFI7XG5tb2R1bGUuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBFbXB0eSBmdW5jdGlvblxuICovXG5cbmZ1bmN0aW9uIGVtcHR5KCl7fVxuXG4vKipcbiAqIFhIUiBQb2xsaW5nIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFhIUihvcHRzKXtcbiAgUG9sbGluZy5jYWxsKHRoaXMsIG9wdHMpO1xuXG4gIGlmIChnbG9iYWwubG9jYXRpb24pIHtcbiAgICB2YXIgaXNTU0wgPSAnaHR0cHM6JyA9PSBsb2NhdGlvbi5wcm90b2NvbDtcbiAgICB2YXIgcG9ydCA9IGxvY2F0aW9uLnBvcnQ7XG5cbiAgICAvLyBzb21lIHVzZXIgYWdlbnRzIGhhdmUgZW1wdHkgYGxvY2F0aW9uLnBvcnRgXG4gICAgaWYgKCFwb3J0KSB7XG4gICAgICBwb3J0ID0gaXNTU0wgPyA0NDMgOiA4MDtcbiAgICB9XG5cbiAgICB0aGlzLnhkID0gb3B0cy5ob3N0bmFtZSAhPSBnbG9iYWwubG9jYXRpb24uaG9zdG5hbWUgfHxcbiAgICAgIHBvcnQgIT0gb3B0cy5wb3J0O1xuICAgIHRoaXMueHMgPSBvcHRzLnNlY3VyZSAhPSBpc1NTTDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmV4dHJhSGVhZGVycyA9IG9wdHMuZXh0cmFIZWFkZXJzO1xuICB9XG59XG5cbi8qKlxuICogSW5oZXJpdHMgZnJvbSBQb2xsaW5nLlxuICovXG5cbmluaGVyaXQoWEhSLCBQb2xsaW5nKTtcblxuLyoqXG4gKiBYSFIgc3VwcG9ydHMgYmluYXJ5XG4gKi9cblxuWEhSLnByb3RvdHlwZS5zdXBwb3J0c0JpbmFyeSA9IHRydWU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuWEhSLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ob3B0cyl7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICBvcHRzLnVyaSA9IHRoaXMudXJpKCk7XG4gIG9wdHMueGQgPSB0aGlzLnhkO1xuICBvcHRzLnhzID0gdGhpcy54cztcbiAgb3B0cy5hZ2VudCA9IHRoaXMuYWdlbnQgfHwgZmFsc2U7XG4gIG9wdHMuc3VwcG9ydHNCaW5hcnkgPSB0aGlzLnN1cHBvcnRzQmluYXJ5O1xuICBvcHRzLmVuYWJsZXNYRFIgPSB0aGlzLmVuYWJsZXNYRFI7XG5cbiAgLy8gU1NMIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG4gIG9wdHMucGZ4ID0gdGhpcy5wZng7XG4gIG9wdHMua2V5ID0gdGhpcy5rZXk7XG4gIG9wdHMucGFzc3BocmFzZSA9IHRoaXMucGFzc3BocmFzZTtcbiAgb3B0cy5jZXJ0ID0gdGhpcy5jZXJ0O1xuICBvcHRzLmNhID0gdGhpcy5jYTtcbiAgb3B0cy5jaXBoZXJzID0gdGhpcy5jaXBoZXJzO1xuICBvcHRzLnJlamVjdFVuYXV0aG9yaXplZCA9IHRoaXMucmVqZWN0VW5hdXRob3JpemVkO1xuXG4gIC8vIG90aGVyIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG4gIG9wdHMuZXh0cmFIZWFkZXJzID0gdGhpcy5leHRyYUhlYWRlcnM7XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG9wdHMpO1xufTtcblxuLyoqXG4gKiBTZW5kcyBkYXRhLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIHRvIHNlbmQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsZWQgdXBvbiBmbHVzaC5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblhIUi5wcm90b3R5cGUuZG9Xcml0ZSA9IGZ1bmN0aW9uKGRhdGEsIGZuKXtcbiAgdmFyIGlzQmluYXJ5ID0gdHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnICYmIGRhdGEgIT09IHVuZGVmaW5lZDtcbiAgdmFyIHJlcSA9IHRoaXMucmVxdWVzdCh7IG1ldGhvZDogJ1BPU1QnLCBkYXRhOiBkYXRhLCBpc0JpbmFyeTogaXNCaW5hcnkgfSk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmVxLm9uKCdzdWNjZXNzJywgZm4pO1xuICByZXEub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKXtcbiAgICBzZWxmLm9uRXJyb3IoJ3hociBwb3N0IGVycm9yJywgZXJyKTtcbiAgfSk7XG4gIHRoaXMuc2VuZFhociA9IHJlcTtcbn07XG5cbi8qKlxuICogU3RhcnRzIGEgcG9sbCBjeWNsZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5YSFIucHJvdG90eXBlLmRvUG9sbCA9IGZ1bmN0aW9uKCl7XG4gIGRlYnVnKCd4aHIgcG9sbCcpO1xuICB2YXIgcmVxID0gdGhpcy5yZXF1ZXN0KCk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmVxLm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSl7XG4gICAgc2VsZi5vbkRhdGEoZGF0YSk7XG4gIH0pO1xuICByZXEub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKXtcbiAgICBzZWxmLm9uRXJyb3IoJ3hociBwb2xsIGVycm9yJywgZXJyKTtcbiAgfSk7XG4gIHRoaXMucG9sbFhociA9IHJlcTtcbn07XG5cbi8qKlxuICogUmVxdWVzdCBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3Qob3B0cyl7XG4gIHRoaXMubWV0aG9kID0gb3B0cy5tZXRob2QgfHwgJ0dFVCc7XG4gIHRoaXMudXJpID0gb3B0cy51cmk7XG4gIHRoaXMueGQgPSAhIW9wdHMueGQ7XG4gIHRoaXMueHMgPSAhIW9wdHMueHM7XG4gIHRoaXMuYXN5bmMgPSBmYWxzZSAhPT0gb3B0cy5hc3luYztcbiAgdGhpcy5kYXRhID0gdW5kZWZpbmVkICE9IG9wdHMuZGF0YSA/IG9wdHMuZGF0YSA6IG51bGw7XG4gIHRoaXMuYWdlbnQgPSBvcHRzLmFnZW50O1xuICB0aGlzLmlzQmluYXJ5ID0gb3B0cy5pc0JpbmFyeTtcbiAgdGhpcy5zdXBwb3J0c0JpbmFyeSA9IG9wdHMuc3VwcG9ydHNCaW5hcnk7XG4gIHRoaXMuZW5hYmxlc1hEUiA9IG9wdHMuZW5hYmxlc1hEUjtcblxuICAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbiAgdGhpcy5wZnggPSBvcHRzLnBmeDtcbiAgdGhpcy5rZXkgPSBvcHRzLmtleTtcbiAgdGhpcy5wYXNzcGhyYXNlID0gb3B0cy5wYXNzcGhyYXNlO1xuICB0aGlzLmNlcnQgPSBvcHRzLmNlcnQ7XG4gIHRoaXMuY2EgPSBvcHRzLmNhO1xuICB0aGlzLmNpcGhlcnMgPSBvcHRzLmNpcGhlcnM7XG4gIHRoaXMucmVqZWN0VW5hdXRob3JpemVkID0gb3B0cy5yZWplY3RVbmF1dGhvcml6ZWQ7XG5cbiAgLy8gb3RoZXIgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbiAgdGhpcy5leHRyYUhlYWRlcnMgPSBvcHRzLmV4dHJhSGVhZGVycztcblxuICB0aGlzLmNyZWF0ZSgpO1xufVxuXG4vKipcbiAqIE1peCBpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgWEhSIG9iamVjdCBhbmQgc2VuZHMgdGhlIHJlcXVlc3QuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKXtcbiAgdmFyIG9wdHMgPSB7IGFnZW50OiB0aGlzLmFnZW50LCB4ZG9tYWluOiB0aGlzLnhkLCB4c2NoZW1lOiB0aGlzLnhzLCBlbmFibGVzWERSOiB0aGlzLmVuYWJsZXNYRFIgfTtcblxuICAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbiAgb3B0cy5wZnggPSB0aGlzLnBmeDtcbiAgb3B0cy5rZXkgPSB0aGlzLmtleTtcbiAgb3B0cy5wYXNzcGhyYXNlID0gdGhpcy5wYXNzcGhyYXNlO1xuICBvcHRzLmNlcnQgPSB0aGlzLmNlcnQ7XG4gIG9wdHMuY2EgPSB0aGlzLmNhO1xuICBvcHRzLmNpcGhlcnMgPSB0aGlzLmNpcGhlcnM7XG4gIG9wdHMucmVqZWN0VW5hdXRob3JpemVkID0gdGhpcy5yZWplY3RVbmF1dGhvcml6ZWQ7XG5cbiAgdmFyIHhociA9IHRoaXMueGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KG9wdHMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdHJ5IHtcbiAgICBkZWJ1ZygneGhyIG9wZW4gJXM6ICVzJywgdGhpcy5tZXRob2QsIHRoaXMudXJpKTtcbiAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmksIHRoaXMuYXN5bmMpO1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5leHRyYUhlYWRlcnMpIHtcbiAgICAgICAgeGhyLnNldERpc2FibGVIZWFkZXJDaGVjayh0cnVlKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLmV4dHJhSGVhZGVycykge1xuICAgICAgICAgIGlmICh0aGlzLmV4dHJhSGVhZGVycy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaSwgdGhpcy5leHRyYUhlYWRlcnNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNCaW5hcnkpIHtcbiAgICAgIC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgYWZ0ZXIgb3BlbiBiZWNhdXNlIEZpcmVmb3ggaXMgc3R1cGlkXG4gICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzMjE2OTAzL2dldC1iaW5hcnktZGF0YS13aXRoLXhtbGh0dHByZXF1ZXN0LWluLWEtZmlyZWZveC1leHRlbnNpb25cbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIH1cblxuICAgIGlmICgnUE9TVCcgPT0gdGhpcy5tZXRob2QpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh0aGlzLmlzQmluYXJ5KSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIC8vIGllNiBjaGVja1xuICAgIGlmICgnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHIpIHtcbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc1hEUigpKSB7XG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc2VsZi5vbkxvYWQoKTtcbiAgICAgIH07XG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHNlbGYub25FcnJvcih4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgICAgICBpZiAoMjAwID09IHhoci5zdGF0dXMgfHwgMTIyMyA9PSB4aHIuc3RhdHVzKSB7XG4gICAgICAgICAgc2VsZi5vbkxvYWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGBlcnJvcmAgZXZlbnQgaGFuZGxlciB0aGF0J3MgdXNlci1zZXRcbiAgICAgICAgICAvLyBkb2VzIG5vdCB0aHJvdyBpbiB0aGUgc2FtZSB0aWNrIGFuZCBnZXRzIGNhdWdodCBoZXJlXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2VsZi5vbkVycm9yKHhoci5zdGF0dXMpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGRlYnVnKCd4aHIgZGF0YSAlcycsIHRoaXMuZGF0YSk7XG4gICAgeGhyLnNlbmQodGhpcy5kYXRhKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIE5lZWQgdG8gZGVmZXIgc2luY2UgLmNyZWF0ZSgpIGlzIGNhbGxlZCBkaXJlY3RseSBmaHJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAvLyBhbmQgdGh1cyB0aGUgJ2Vycm9yJyBldmVudCBjYW4gb25seSBiZSBvbmx5IGJvdW5kICphZnRlciogdGhpcyBleGNlcHRpb25cbiAgICAvLyBvY2N1cnMuICBUaGVyZWZvcmUsIGFsc28sIHdlIGNhbm5vdCB0aHJvdyBoZXJlIGF0IGFsbC5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5vbkVycm9yKGUpO1xuICAgIH0sIDApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChnbG9iYWwuZG9jdW1lbnQpIHtcbiAgICB0aGlzLmluZGV4ID0gUmVxdWVzdC5yZXF1ZXN0c0NvdW50Kys7XG4gICAgUmVxdWVzdC5yZXF1ZXN0c1t0aGlzLmluZGV4XSA9IHRoaXM7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gc3VjY2Vzc2Z1bCByZXNwb25zZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5vblN1Y2Nlc3MgPSBmdW5jdGlvbigpe1xuICB0aGlzLmVtaXQoJ3N1Y2Nlc3MnKTtcbiAgdGhpcy5jbGVhbnVwKCk7XG59O1xuXG4vKipcbiAqIENhbGxlZCBpZiB3ZSBoYXZlIGRhdGEuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24oZGF0YSl7XG4gIHRoaXMuZW1pdCgnZGF0YScsIGRhdGEpO1xuICB0aGlzLm9uU3VjY2VzcygpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgdXBvbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24oZXJyKXtcbiAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIHRoaXMuY2xlYW51cCh0cnVlKTtcbn07XG5cbi8qKlxuICogQ2xlYW5zIHVwIGhvdXNlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbihmcm9tRXJyb3Ipe1xuICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHRoaXMueGhyIHx8IG51bGwgPT09IHRoaXMueGhyKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHhtbGh0dHByZXF1ZXN0XG4gIGlmICh0aGlzLmhhc1hEUigpKSB7XG4gICAgdGhpcy54aHIub25sb2FkID0gdGhpcy54aHIub25lcnJvciA9IGVtcHR5O1xuICB9IGVsc2Uge1xuICAgIHRoaXMueGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGVtcHR5O1xuICB9XG5cbiAgaWYgKGZyb21FcnJvcikge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmIChnbG9iYWwuZG9jdW1lbnQpIHtcbiAgICBkZWxldGUgUmVxdWVzdC5yZXF1ZXN0c1t0aGlzLmluZGV4XTtcbiAgfVxuXG4gIHRoaXMueGhyID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHVwb24gbG9hZC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbigpe1xuICB2YXIgZGF0YTtcbiAgdHJ5IHtcbiAgICB2YXIgY29udGVudFR5cGU7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnRlbnRUeXBlID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpLnNwbGl0KCc7JylbMF07XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICBpZiAoY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nKSB7XG4gICAgICBkYXRhID0gdGhpcy54aHIucmVzcG9uc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0c0JpbmFyeSkge1xuICAgICAgICBkYXRhID0gdGhpcy54aHIucmVzcG9uc2VUZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkYXRhID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheSh0aGlzLnhoci5yZXNwb25zZSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdmFyIHVpOEFyciA9IG5ldyBVaW50OEFycmF5KHRoaXMueGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB2YXIgZGF0YUFycmF5ID0gW107XG4gICAgICAgICAgZm9yICh2YXIgaWR4ID0gMCwgbGVuZ3RoID0gdWk4QXJyLmxlbmd0aDsgaWR4IDwgbGVuZ3RoOyBpZHgrKykge1xuICAgICAgICAgICAgZGF0YUFycmF5LnB1c2godWk4QXJyW2lkeF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRhdGEgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGRhdGFBcnJheSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aGlzLm9uRXJyb3IoZSk7XG4gIH1cbiAgaWYgKG51bGwgIT0gZGF0YSkge1xuICAgIHRoaXMub25EYXRhKGRhdGEpO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGl0IGhhcyBYRG9tYWluUmVxdWVzdC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5oYXNYRFIgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBnbG9iYWwuWERvbWFpblJlcXVlc3QgJiYgIXRoaXMueHMgJiYgdGhpcy5lbmFibGVzWERSO1xufTtcblxuLyoqXG4gKiBBYm9ydHMgdGhlIHJlcXVlc3QuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuY2xlYW51cCgpO1xufTtcblxuLyoqXG4gKiBBYm9ydHMgcGVuZGluZyByZXF1ZXN0cyB3aGVuIHVubG9hZGluZyB0aGUgd2luZG93LiBUaGlzIGlzIG5lZWRlZCB0byBwcmV2ZW50XG4gKiBtZW1vcnkgbGVha3MgKGUuZy4gd2hlbiB1c2luZyBJRSkgYW5kIHRvIGVuc3VyZSB0aGF0IG5vIHNwdXJpb3VzIGVycm9yIGlzXG4gKiBlbWl0dGVkLlxuICovXG5cbmlmIChnbG9iYWwuZG9jdW1lbnQpIHtcbiAgUmVxdWVzdC5yZXF1ZXN0c0NvdW50ID0gMDtcbiAgUmVxdWVzdC5yZXF1ZXN0cyA9IHt9O1xuICBpZiAoZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XG4gICAgZ2xvYmFsLmF0dGFjaEV2ZW50KCdvbnVubG9hZCcsIHVubG9hZEhhbmRsZXIpO1xuICB9IGVsc2UgaWYgKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHVubG9hZEhhbmRsZXIsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bmxvYWRIYW5kbGVyKCkge1xuICBmb3IgKHZhciBpIGluIFJlcXVlc3QucmVxdWVzdHMpIHtcbiAgICBpZiAoUmVxdWVzdC5yZXF1ZXN0cy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgUmVxdWVzdC5yZXF1ZXN0c1tpXS5hYm9ydCgpO1xuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBUcmFuc3BvcnQgPSByZXF1aXJlKCcuLi90cmFuc3BvcnQnKTtcbnZhciBwYXJzZXFzID0gcmVxdWlyZSgncGFyc2VxcycpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJ2VuZ2luZS5pby1wYXJzZXInKTtcbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnY29tcG9uZW50LWluaGVyaXQnKTtcbnZhciB5ZWFzdCA9IHJlcXVpcmUoJ3llYXN0Jyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdlbmdpbmUuaW8tY2xpZW50OnBvbGxpbmcnKTtcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvbGxpbmc7XG5cbi8qKlxuICogSXMgWEhSMiBzdXBwb3J0ZWQ/XG4gKi9cblxudmFyIGhhc1hIUjIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBYTUxIdHRwUmVxdWVzdCA9IHJlcXVpcmUoJ3htbGh0dHByZXF1ZXN0LXNzbCcpO1xuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KHsgeGRvbWFpbjogZmFsc2UgfSk7XG4gIHJldHVybiBudWxsICE9IHhoci5yZXNwb25zZVR5cGU7XG59KSgpO1xuXG4vKipcbiAqIFBvbGxpbmcgaW50ZXJmYWNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBQb2xsaW5nKG9wdHMpe1xuICB2YXIgZm9yY2VCYXNlNjQgPSAob3B0cyAmJiBvcHRzLmZvcmNlQmFzZTY0KTtcbiAgaWYgKCFoYXNYSFIyIHx8IGZvcmNlQmFzZTY0KSB7XG4gICAgdGhpcy5zdXBwb3J0c0JpbmFyeSA9IGZhbHNlO1xuICB9XG4gIFRyYW5zcG9ydC5jYWxsKHRoaXMsIG9wdHMpO1xufVxuXG4vKipcbiAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICovXG5cbmluaGVyaXQoUG9sbGluZywgVHJhbnNwb3J0KTtcblxuLyoqXG4gKiBUcmFuc3BvcnQgbmFtZS5cbiAqL1xuXG5Qb2xsaW5nLnByb3RvdHlwZS5uYW1lID0gJ3BvbGxpbmcnO1xuXG4vKipcbiAqIE9wZW5zIHRoZSBzb2NrZXQgKHRyaWdnZXJzIHBvbGxpbmcpLiBXZSB3cml0ZSBhIFBJTkcgbWVzc2FnZSB0byBkZXRlcm1pbmVcbiAqIHdoZW4gdGhlIHRyYW5zcG9ydCBpcyBvcGVuLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblBvbGxpbmcucHJvdG90eXBlLmRvT3BlbiA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMucG9sbCgpO1xufTtcblxuLyoqXG4gKiBQYXVzZXMgcG9sbGluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB1cG9uIGJ1ZmZlcnMgYXJlIGZsdXNoZWQgYW5kIHRyYW5zcG9ydCBpcyBwYXVzZWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblBvbGxpbmcucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24ob25QYXVzZSl7XG4gIHZhciBwZW5kaW5nID0gMDtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHRoaXMucmVhZHlTdGF0ZSA9ICdwYXVzaW5nJztcblxuICBmdW5jdGlvbiBwYXVzZSgpe1xuICAgIGRlYnVnKCdwYXVzZWQnKTtcbiAgICBzZWxmLnJlYWR5U3RhdGUgPSAncGF1c2VkJztcbiAgICBvblBhdXNlKCk7XG4gIH1cblxuICBpZiAodGhpcy5wb2xsaW5nIHx8ICF0aGlzLndyaXRhYmxlKSB7XG4gICAgdmFyIHRvdGFsID0gMDtcblxuICAgIGlmICh0aGlzLnBvbGxpbmcpIHtcbiAgICAgIGRlYnVnKCd3ZSBhcmUgY3VycmVudGx5IHBvbGxpbmcgLSB3YWl0aW5nIHRvIHBhdXNlJyk7XG4gICAgICB0b3RhbCsrO1xuICAgICAgdGhpcy5vbmNlKCdwb2xsQ29tcGxldGUnLCBmdW5jdGlvbigpe1xuICAgICAgICBkZWJ1ZygncHJlLXBhdXNlIHBvbGxpbmcgY29tcGxldGUnKTtcbiAgICAgICAgLS10b3RhbCB8fCBwYXVzZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLndyaXRhYmxlKSB7XG4gICAgICBkZWJ1Zygnd2UgYXJlIGN1cnJlbnRseSB3cml0aW5nIC0gd2FpdGluZyB0byBwYXVzZScpO1xuICAgICAgdG90YWwrKztcbiAgICAgIHRoaXMub25jZSgnZHJhaW4nLCBmdW5jdGlvbigpe1xuICAgICAgICBkZWJ1ZygncHJlLXBhdXNlIHdyaXRpbmcgY29tcGxldGUnKTtcbiAgICAgICAgLS10b3RhbCB8fCBwYXVzZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhdXNlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogU3RhcnRzIHBvbGxpbmcgY3ljbGUuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5Qb2xsaW5nLnByb3RvdHlwZS5wb2xsID0gZnVuY3Rpb24oKXtcbiAgZGVidWcoJ3BvbGxpbmcnKTtcbiAgdGhpcy5wb2xsaW5nID0gdHJ1ZTtcbiAgdGhpcy5kb1BvbGwoKTtcbiAgdGhpcy5lbWl0KCdwb2xsJyk7XG59O1xuXG4vKipcbiAqIE92ZXJsb2FkcyBvbkRhdGEgdG8gZGV0ZWN0IHBheWxvYWRzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblBvbGxpbmcucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGRlYnVnKCdwb2xsaW5nIGdvdCBkYXRhICVzJywgZGF0YSk7XG4gIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHBhY2tldCwgaW5kZXgsIHRvdGFsKSB7XG4gICAgLy8gaWYgaXRzIHRoZSBmaXJzdCBtZXNzYWdlIHdlIGNvbnNpZGVyIHRoZSB0cmFuc3BvcnQgb3BlblxuICAgIGlmICgnb3BlbmluZycgPT0gc2VsZi5yZWFkeVN0YXRlKSB7XG4gICAgICBzZWxmLm9uT3BlbigpO1xuICAgIH1cblxuICAgIC8vIGlmIGl0cyBhIGNsb3NlIHBhY2tldCwgd2UgY2xvc2UgdGhlIG9uZ29pbmcgcmVxdWVzdHNcbiAgICBpZiAoJ2Nsb3NlJyA9PSBwYWNrZXQudHlwZSkge1xuICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gb3RoZXJ3aXNlIGJ5cGFzcyBvbkRhdGEgYW5kIGhhbmRsZSB0aGUgbWVzc2FnZVxuICAgIHNlbGYub25QYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvLyBkZWNvZGUgcGF5bG9hZFxuICBwYXJzZXIuZGVjb2RlUGF5bG9hZChkYXRhLCB0aGlzLnNvY2tldC5iaW5hcnlUeXBlLCBjYWxsYmFjayk7XG5cbiAgLy8gaWYgYW4gZXZlbnQgZGlkIG5vdCB0cmlnZ2VyIGNsb3NpbmdcbiAgaWYgKCdjbG9zZWQnICE9IHRoaXMucmVhZHlTdGF0ZSkge1xuICAgIC8vIGlmIHdlIGdvdCBkYXRhIHdlJ3JlIG5vdCBwb2xsaW5nXG4gICAgdGhpcy5wb2xsaW5nID0gZmFsc2U7XG4gICAgdGhpcy5lbWl0KCdwb2xsQ29tcGxldGUnKTtcblxuICAgIGlmICgnb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKSB7XG4gICAgICB0aGlzLnBvbGwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ2lnbm9yaW5nIHBvbGwgLSB0cmFuc3BvcnQgc3RhdGUgXCIlc1wiJywgdGhpcy5yZWFkeVN0YXRlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRm9yIHBvbGxpbmcsIHNlbmQgYSBjbG9zZSBwYWNrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUG9sbGluZy5wcm90b3R5cGUuZG9DbG9zZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBmdW5jdGlvbiBjbG9zZSgpe1xuICAgIGRlYnVnKCd3cml0aW5nIGNsb3NlIHBhY2tldCcpO1xuICAgIHNlbGYud3JpdGUoW3sgdHlwZTogJ2Nsb3NlJyB9XSk7XG4gIH1cblxuICBpZiAoJ29wZW4nID09IHRoaXMucmVhZHlTdGF0ZSkge1xuICAgIGRlYnVnKCd0cmFuc3BvcnQgb3BlbiAtIGNsb3NpbmcnKTtcbiAgICBjbG9zZSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGluIGNhc2Ugd2UncmUgdHJ5aW5nIHRvIGNsb3NlIHdoaWxlXG4gICAgLy8gaGFuZHNoYWtpbmcgaXMgaW4gcHJvZ3Jlc3MgKEdILTE2NClcbiAgICBkZWJ1ZygndHJhbnNwb3J0IG5vdCBvcGVuIC0gZGVmZXJyaW5nIGNsb3NlJyk7XG4gICAgdGhpcy5vbmNlKCdvcGVuJywgY2xvc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFdyaXRlcyBhIHBhY2tldHMgcGF5bG9hZC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBkYXRhIHBhY2tldHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRyYWluIGNhbGxiYWNrXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Qb2xsaW5nLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKHBhY2tldHMpe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMud3JpdGFibGUgPSBmYWxzZTtcbiAgdmFyIGNhbGxiYWNrZm4gPSBmdW5jdGlvbigpIHtcbiAgICBzZWxmLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBzZWxmLmVtaXQoJ2RyYWluJyk7XG4gIH07XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBwYXJzZXIuZW5jb2RlUGF5bG9hZChwYWNrZXRzLCB0aGlzLnN1cHBvcnRzQmluYXJ5LCBmdW5jdGlvbihkYXRhKSB7XG4gICAgc2VsZi5kb1dyaXRlKGRhdGEsIGNhbGxiYWNrZm4pO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHVyaSBmb3IgY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5Qb2xsaW5nLnByb3RvdHlwZS51cmkgPSBmdW5jdGlvbigpe1xuICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJ5IHx8IHt9O1xuICB2YXIgc2NoZW1hID0gdGhpcy5zZWN1cmUgPyAnaHR0cHMnIDogJ2h0dHAnO1xuICB2YXIgcG9ydCA9ICcnO1xuXG4gIC8vIGNhY2hlIGJ1c3RpbmcgaXMgZm9yY2VkXG4gIGlmIChmYWxzZSAhPT0gdGhpcy50aW1lc3RhbXBSZXF1ZXN0cykge1xuICAgIHF1ZXJ5W3RoaXMudGltZXN0YW1wUGFyYW1dID0geWVhc3QoKTtcbiAgfVxuXG4gIGlmICghdGhpcy5zdXBwb3J0c0JpbmFyeSAmJiAhcXVlcnkuc2lkKSB7XG4gICAgcXVlcnkuYjY0ID0gMTtcbiAgfVxuXG4gIHF1ZXJ5ID0gcGFyc2Vxcy5lbmNvZGUocXVlcnkpO1xuXG4gIC8vIGF2b2lkIHBvcnQgaWYgZGVmYXVsdCBmb3Igc2NoZW1hXG4gIGlmICh0aGlzLnBvcnQgJiYgKCgnaHR0cHMnID09IHNjaGVtYSAmJiB0aGlzLnBvcnQgIT0gNDQzKSB8fFxuICAgICAoJ2h0dHAnID09IHNjaGVtYSAmJiB0aGlzLnBvcnQgIT0gODApKSkge1xuICAgIHBvcnQgPSAnOicgKyB0aGlzLnBvcnQ7XG4gIH1cblxuICAvLyBwcmVwZW5kID8gdG8gcXVlcnlcbiAgaWYgKHF1ZXJ5Lmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gJz8nICsgcXVlcnk7XG4gIH1cblxuICB2YXIgaXB2NiA9IHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpICE9PSAtMTtcbiAgcmV0dXJuIHNjaGVtYSArICc6Ly8nICsgKGlwdjYgPyAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nIDogdGhpcy5ob3N0bmFtZSkgKyBwb3J0ICsgdGhpcy5wYXRoICsgcXVlcnk7XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBUcmFuc3BvcnQgPSByZXF1aXJlKCcuLi90cmFuc3BvcnQnKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCdlbmdpbmUuaW8tcGFyc2VyJyk7XG52YXIgcGFyc2VxcyA9IHJlcXVpcmUoJ3BhcnNlcXMnKTtcbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnY29tcG9uZW50LWluaGVyaXQnKTtcbnZhciB5ZWFzdCA9IHJlcXVpcmUoJ3llYXN0Jyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdlbmdpbmUuaW8tY2xpZW50OndlYnNvY2tldCcpO1xudmFyIEJyb3dzZXJXZWJTb2NrZXQgPSBnbG9iYWwuV2ViU29ja2V0IHx8IGdsb2JhbC5Nb3pXZWJTb2NrZXQ7XG5cbi8qKlxuICogR2V0IGVpdGhlciB0aGUgYFdlYlNvY2tldGAgb3IgYE1veldlYlNvY2tldGAgZ2xvYmFsc1xuICogaW4gdGhlIGJyb3dzZXIgb3IgdHJ5IHRvIHJlc29sdmUgV2ViU29ja2V0LWNvbXBhdGlibGVcbiAqIGludGVyZmFjZSBleHBvc2VkIGJ5IGB3c2AgZm9yIE5vZGUtbGlrZSBlbnZpcm9ubWVudC5cbiAqL1xuXG52YXIgV2ViU29ja2V0ID0gQnJvd3NlcldlYlNvY2tldDtcbmlmICghV2ViU29ja2V0ICYmIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRyeSB7XG4gICAgV2ViU29ja2V0ID0gcmVxdWlyZSgnd3MnKTtcbiAgfSBjYXRjaCAoZSkgeyB9XG59XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBXUztcblxuLyoqXG4gKiBXZWJTb2NrZXQgdHJhbnNwb3J0IGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkge09iamVjdH0gY29ubmVjdGlvbiBvcHRpb25zXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFdTKG9wdHMpe1xuICB2YXIgZm9yY2VCYXNlNjQgPSAob3B0cyAmJiBvcHRzLmZvcmNlQmFzZTY0KTtcbiAgaWYgKGZvcmNlQmFzZTY0KSB7XG4gICAgdGhpcy5zdXBwb3J0c0JpbmFyeSA9IGZhbHNlO1xuICB9XG4gIHRoaXMucGVyTWVzc2FnZURlZmxhdGUgPSBvcHRzLnBlck1lc3NhZ2VEZWZsYXRlO1xuICBUcmFuc3BvcnQuY2FsbCh0aGlzLCBvcHRzKTtcbn1cblxuLyoqXG4gKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAqL1xuXG5pbmhlcml0KFdTLCBUcmFuc3BvcnQpO1xuXG4vKipcbiAqIFRyYW5zcG9ydCBuYW1lLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuV1MucHJvdG90eXBlLm5hbWUgPSAnd2Vic29ja2V0JztcblxuLypcbiAqIFdlYlNvY2tldHMgc3VwcG9ydCBiaW5hcnlcbiAqL1xuXG5XUy5wcm90b3R5cGUuc3VwcG9ydHNCaW5hcnkgPSB0cnVlO1xuXG4vKipcbiAqIE9wZW5zIHNvY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5XUy5wcm90b3R5cGUuZG9PcGVuID0gZnVuY3Rpb24oKXtcbiAgaWYgKCF0aGlzLmNoZWNrKCkpIHtcbiAgICAvLyBsZXQgcHJvYmUgdGltZW91dFxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHVyaSA9IHRoaXMudXJpKCk7XG4gIHZhciBwcm90b2NvbHMgPSB2b2lkKDApO1xuICB2YXIgb3B0cyA9IHtcbiAgICBhZ2VudDogdGhpcy5hZ2VudCxcbiAgICBwZXJNZXNzYWdlRGVmbGF0ZTogdGhpcy5wZXJNZXNzYWdlRGVmbGF0ZVxuICB9O1xuXG4gIC8vIFNTTCBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxuICBvcHRzLnBmeCA9IHRoaXMucGZ4O1xuICBvcHRzLmtleSA9IHRoaXMua2V5O1xuICBvcHRzLnBhc3NwaHJhc2UgPSB0aGlzLnBhc3NwaHJhc2U7XG4gIG9wdHMuY2VydCA9IHRoaXMuY2VydDtcbiAgb3B0cy5jYSA9IHRoaXMuY2E7XG4gIG9wdHMuY2lwaGVycyA9IHRoaXMuY2lwaGVycztcbiAgb3B0cy5yZWplY3RVbmF1dGhvcml6ZWQgPSB0aGlzLnJlamVjdFVuYXV0aG9yaXplZDtcbiAgaWYgKHRoaXMuZXh0cmFIZWFkZXJzKSB7XG4gICAgb3B0cy5oZWFkZXJzID0gdGhpcy5leHRyYUhlYWRlcnM7XG4gIH1cblxuICB0aGlzLndzID0gQnJvd3NlcldlYlNvY2tldCA/IG5ldyBXZWJTb2NrZXQodXJpKSA6IG5ldyBXZWJTb2NrZXQodXJpLCBwcm90b2NvbHMsIG9wdHMpO1xuXG4gIGlmICh0aGlzLndzLmJpbmFyeVR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuc3VwcG9ydHNCaW5hcnkgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLndzLnN1cHBvcnRzICYmIHRoaXMud3Muc3VwcG9ydHMuYmluYXJ5KSB7XG4gICAgdGhpcy5zdXBwb3J0c0JpbmFyeSA9IHRydWU7XG4gICAgdGhpcy53cy5iaW5hcnlUeXBlID0gJ2J1ZmZlcic7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy53cy5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgfVxuXG4gIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbn07XG5cbi8qKlxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNvY2tldFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbldTLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLndzLm9ub3BlbiA9IGZ1bmN0aW9uKCl7XG4gICAgc2VsZi5vbk9wZW4oKTtcbiAgfTtcbiAgdGhpcy53cy5vbmNsb3NlID0gZnVuY3Rpb24oKXtcbiAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgfTtcbiAgdGhpcy53cy5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldil7XG4gICAgc2VsZi5vbkRhdGEoZXYuZGF0YSk7XG4gIH07XG4gIHRoaXMud3Mub25lcnJvciA9IGZ1bmN0aW9uKGUpe1xuICAgIHNlbGYub25FcnJvcignd2Vic29ja2V0IGVycm9yJywgZSk7XG4gIH07XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlIGBvbkRhdGFgIHRvIHVzZSBhIHRpbWVyIG9uIGlPUy5cbiAqIFNlZTogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vbWxvdWdocmFuLzIwNTIwMDZcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5pZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG5hdmlnYXRvclxuICAmJiAvaVBhZHxpUGhvbmV8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgV1MucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBUcmFuc3BvcnQucHJvdG90eXBlLm9uRGF0YS5jYWxsKHNlbGYsIGRhdGEpO1xuICAgIH0sIDApO1xuICB9O1xufVxuXG4vKipcbiAqIFdyaXRlcyBkYXRhIHRvIHNvY2tldC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBvZiBwYWNrZXRzLlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuV1MucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24ocGFja2V0cyl7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy53cml0YWJsZSA9IGZhbHNlO1xuXG4gIC8vIGVuY29kZVBhY2tldCBlZmZpY2llbnQgYXMgaXQgdXNlcyBXUyBmcmFtaW5nXG4gIC8vIG5vIG5lZWQgZm9yIGVuY29kZVBheWxvYWRcbiAgdmFyIHRvdGFsID0gcGFja2V0cy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdG90YWw7IGkgPCBsOyBpKyspIHtcbiAgICAoZnVuY3Rpb24ocGFja2V0KSB7XG4gICAgICBwYXJzZXIuZW5jb2RlUGFja2V0KHBhY2tldCwgc2VsZi5zdXBwb3J0c0JpbmFyeSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIUJyb3dzZXJXZWJTb2NrZXQpIHtcbiAgICAgICAgICAvLyBhbHdheXMgY3JlYXRlIGEgbmV3IG9iamVjdCAoR0gtNDM3KVxuICAgICAgICAgIHZhciBvcHRzID0ge307XG4gICAgICAgICAgaWYgKHBhY2tldC5vcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRzLmNvbXByZXNzID0gcGFja2V0Lm9wdGlvbnMuY29tcHJlc3M7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYucGVyTWVzc2FnZURlZmxhdGUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSAnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSA/IGdsb2JhbC5CdWZmZXIuYnl0ZUxlbmd0aChkYXRhKSA6IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKGxlbiA8IHNlbGYucGVyTWVzc2FnZURlZmxhdGUudGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgIG9wdHMuY29tcHJlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL1NvbWV0aW1lcyB0aGUgd2Vic29ja2V0IGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkIGJ1dCB0aGUgYnJvd3NlciBkaWRuJ3RcbiAgICAgICAgLy9oYXZlIGEgY2hhbmNlIG9mIGluZm9ybWluZyB1cyBhYm91dCBpdCB5ZXQsIGluIHRoYXQgY2FzZSBzZW5kIHdpbGxcbiAgICAgICAgLy90aHJvdyBhbiBlcnJvclxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChCcm93c2VyV2ViU29ja2V0KSB7XG4gICAgICAgICAgICAvLyBUeXBlRXJyb3IgaXMgdGhyb3duIHdoZW4gcGFzc2luZyB0aGUgc2Vjb25kIGFyZ3VtZW50IG9uIFNhZmFyaVxuICAgICAgICAgICAgc2VsZi53cy5zZW5kKGRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLndzLnNlbmQoZGF0YSwgb3B0cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICBkZWJ1Zygnd2Vic29ja2V0IGNsb3NlZCBiZWZvcmUgb25jbG9zZSBldmVudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLS10b3RhbCB8fCBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KShwYWNrZXRzW2ldKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRvbmUoKXtcbiAgICBzZWxmLmVtaXQoJ2ZsdXNoJyk7XG5cbiAgICAvLyBmYWtlIGRyYWluXG4gICAgLy8gZGVmZXIgdG8gbmV4dCB0aWNrIHRvIGFsbG93IFNvY2tldCB0byBjbGVhciB3cml0ZUJ1ZmZlclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYud3JpdGFibGUgPSB0cnVlO1xuICAgICAgc2VsZi5lbWl0KCdkcmFpbicpO1xuICAgIH0sIDApO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGxlZCB1cG9uIGNsb3NlXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuV1MucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbigpe1xuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uQ2xvc2UuY2FsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogQ2xvc2VzIHNvY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5XUy5wcm90b3R5cGUuZG9DbG9zZSA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0eXBlb2YgdGhpcy53cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aGlzLndzLmNsb3NlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHVyaSBmb3IgY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5XUy5wcm90b3R5cGUudXJpID0gZnVuY3Rpb24oKXtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyeSB8fCB7fTtcbiAgdmFyIHNjaGVtYSA9IHRoaXMuc2VjdXJlID8gJ3dzcycgOiAnd3MnO1xuICB2YXIgcG9ydCA9ICcnO1xuXG4gIC8vIGF2b2lkIHBvcnQgaWYgZGVmYXVsdCBmb3Igc2NoZW1hXG4gIGlmICh0aGlzLnBvcnQgJiYgKCgnd3NzJyA9PSBzY2hlbWEgJiYgdGhpcy5wb3J0ICE9IDQ0MylcbiAgICB8fCAoJ3dzJyA9PSBzY2hlbWEgJiYgdGhpcy5wb3J0ICE9IDgwKSkpIHtcbiAgICBwb3J0ID0gJzonICsgdGhpcy5wb3J0O1xuICB9XG5cbiAgLy8gYXBwZW5kIHRpbWVzdGFtcCB0byBVUklcbiAgaWYgKHRoaXMudGltZXN0YW1wUmVxdWVzdHMpIHtcbiAgICBxdWVyeVt0aGlzLnRpbWVzdGFtcFBhcmFtXSA9IHllYXN0KCk7XG4gIH1cblxuICAvLyBjb21tdW5pY2F0ZSBiaW5hcnkgc3VwcG9ydCBjYXBhYmlsaXRpZXNcbiAgaWYgKCF0aGlzLnN1cHBvcnRzQmluYXJ5KSB7XG4gICAgcXVlcnkuYjY0ID0gMTtcbiAgfVxuXG4gIHF1ZXJ5ID0gcGFyc2Vxcy5lbmNvZGUocXVlcnkpO1xuXG4gIC8vIHByZXBlbmQgPyB0byBxdWVyeVxuICBpZiAocXVlcnkubGVuZ3RoKSB7XG4gICAgcXVlcnkgPSAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIHZhciBpcHY2ID0gdGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgIT09IC0xO1xuICByZXR1cm4gc2NoZW1hICsgJzovLycgKyAoaXB2NiA/ICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScgOiB0aGlzLmhvc3RuYW1lKSArIHBvcnQgKyB0aGlzLnBhdGggKyBxdWVyeTtcbn07XG5cbi8qKlxuICogRmVhdHVyZSBkZXRlY3Rpb24gZm9yIFdlYlNvY2tldC5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufSB3aGV0aGVyIHRoaXMgdHJhbnNwb3J0IGlzIGF2YWlsYWJsZS5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuV1MucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuICEhV2ViU29ja2V0ICYmICEoJ19faW5pdGlhbGl6ZScgaW4gV2ViU29ja2V0ICYmIHRoaXMubmFtZSA9PT0gV1MucHJvdG90eXBlLm5hbWUpO1xufTtcbiIsIi8vIGJyb3dzZXIgc2hpbSBmb3IgeG1saHR0cHJlcXVlc3QgbW9kdWxlXG52YXIgaGFzQ09SUyA9IHJlcXVpcmUoJ2hhcy1jb3JzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0cykge1xuICB2YXIgeGRvbWFpbiA9IG9wdHMueGRvbWFpbjtcblxuICAvLyBzY2hlbWUgbXVzdCBiZSBzYW1lIHdoZW4gdXNpZ24gWERvbWFpblJlcXVlc3RcbiAgLy8gaHR0cDovL2Jsb2dzLm1zZG4uY29tL2IvaWVpbnRlcm5hbHMvYXJjaGl2ZS8yMDEwLzA1LzEzL3hkb21haW5yZXF1ZXN0LXJlc3RyaWN0aW9ucy1saW1pdGF0aW9ucy1hbmQtd29ya2Fyb3VuZHMuYXNweFxuICB2YXIgeHNjaGVtZSA9IG9wdHMueHNjaGVtZTtcblxuICAvLyBYRG9tYWluUmVxdWVzdCBoYXMgYSBmbG93IG9mIG5vdCBzZW5kaW5nIGNvb2tpZSwgdGhlcmVmb3JlIGl0IHNob3VsZCBiZSBkaXNhYmxlZCBhcyBhIGRlZmF1bHQuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9BdXRvbWF0dGljL2VuZ2luZS5pby1jbGllbnQvcHVsbC8yMTdcbiAgdmFyIGVuYWJsZXNYRFIgPSBvcHRzLmVuYWJsZXNYRFI7XG5cbiAgLy8gWE1MSHR0cFJlcXVlc3QgY2FuIGJlIGRpc2FibGVkIG9uIElFXG4gIHRyeSB7XG4gICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAmJiAoIXhkb21haW4gfHwgaGFzQ09SUykpIHtcbiAgICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHsgfVxuXG4gIC8vIFVzZSBYRG9tYWluUmVxdWVzdCBmb3IgSUU4IGlmIGVuYWJsZXNYRFIgaXMgdHJ1ZVxuICAvLyBiZWNhdXNlIGxvYWRpbmcgYmFyIGtlZXBzIGZsYXNoaW5nIHdoZW4gdXNpbmcganNvbnAtcG9sbGluZ1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20veXVqaW9zYWthL3NvY2tlLmlvLWllOC1sb2FkaW5nLWV4YW1wbGVcbiAgdHJ5IHtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhEb21haW5SZXF1ZXN0ICYmICF4c2NoZW1lICYmIGVuYWJsZXNYRFIpIHtcbiAgICAgIHJldHVybiBuZXcgWERvbWFpblJlcXVlc3QoKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHsgfVxuXG4gIGlmICgheGRvbWFpbikge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7XG4gICAgfSBjYXRjaChlKSB7IH1cbiAgfVxufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsIGIpe1xuICB2YXIgZm4gPSBmdW5jdGlvbigpe307XG4gIGZuLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICBhLnByb3RvdHlwZSA9IG5ldyBmbjtcbiAgYS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhO1xufTsiLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcbnZhciBoYXNCaW5hcnkgPSByZXF1aXJlKCdoYXMtYmluYXJ5Jyk7XG52YXIgc2xpY2VCdWZmZXIgPSByZXF1aXJlKCdhcnJheWJ1ZmZlci5zbGljZScpO1xudmFyIGJhc2U2NGVuY29kZXIgPSByZXF1aXJlKCdiYXNlNjQtYXJyYXlidWZmZXInKTtcbnZhciBhZnRlciA9IHJlcXVpcmUoJ2FmdGVyJyk7XG52YXIgdXRmOCA9IHJlcXVpcmUoJ3V0ZjgnKTtcblxuLyoqXG4gKiBDaGVjayBpZiB3ZSBhcmUgcnVubmluZyBhbiBhbmRyb2lkIGJyb3dzZXIuIFRoYXQgcmVxdWlyZXMgdXMgdG8gdXNlXG4gKiBBcnJheUJ1ZmZlciB3aXRoIHBvbGxpbmcgdHJhbnNwb3J0cy4uLlxuICpcbiAqIGh0dHA6Ly9naGluZGEubmV0L2pwZWctYmxvYi1hamF4LWFuZHJvaWQvXG4gKi9cblxudmFyIGlzQW5kcm9pZCA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSk7XG5cbi8qKlxuICogQ2hlY2sgaWYgd2UgYXJlIHJ1bm5pbmcgaW4gUGhhbnRvbUpTLlxuICogVXBsb2FkaW5nIGEgQmxvYiB3aXRoIFBoYW50b21KUyBkb2VzIG5vdCB3b3JrIGNvcnJlY3RseSwgYXMgcmVwb3J0ZWQgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hcml5YS9waGFudG9tanMvaXNzdWVzLzExMzk1XG4gKiBAdHlwZSBib29sZWFuXG4gKi9cbnZhciBpc1BoYW50b21KUyA9IC9QaGFudG9tSlMvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4vKipcbiAqIFdoZW4gdHJ1ZSwgYXZvaWRzIHVzaW5nIEJsb2JzIHRvIGVuY29kZSBwYXlsb2Fkcy5cbiAqIEB0eXBlIGJvb2xlYW5cbiAqL1xudmFyIGRvbnRTZW5kQmxvYnMgPSBpc0FuZHJvaWQgfHwgaXNQaGFudG9tSlM7XG5cbi8qKlxuICogQ3VycmVudCBwcm90b2NvbCB2ZXJzaW9uLlxuICovXG5cbmV4cG9ydHMucHJvdG9jb2wgPSAzO1xuXG4vKipcbiAqIFBhY2tldCB0eXBlcy5cbiAqL1xuXG52YXIgcGFja2V0cyA9IGV4cG9ydHMucGFja2V0cyA9IHtcbiAgICBvcGVuOiAgICAgMCAgICAvLyBub24td3NcbiAgLCBjbG9zZTogICAgMSAgICAvLyBub24td3NcbiAgLCBwaW5nOiAgICAgMlxuICAsIHBvbmc6ICAgICAzXG4gICwgbWVzc2FnZTogIDRcbiAgLCB1cGdyYWRlOiAgNVxuICAsIG5vb3A6ICAgICA2XG59O1xuXG52YXIgcGFja2V0c2xpc3QgPSBrZXlzKHBhY2tldHMpO1xuXG4vKipcbiAqIFByZW1hZGUgZXJyb3IgcGFja2V0LlxuICovXG5cbnZhciBlcnIgPSB7IHR5cGU6ICdlcnJvcicsIGRhdGE6ICdwYXJzZXIgZXJyb3InIH07XG5cbi8qKlxuICogQ3JlYXRlIGEgYmxvYiBhcGkgZXZlbiBmb3IgYmxvYiBidWlsZGVyIHdoZW4gdmVuZG9yIHByZWZpeGVzIGV4aXN0XG4gKi9cblxudmFyIEJsb2IgPSByZXF1aXJlKCdibG9iJyk7XG5cbi8qKlxuICogRW5jb2RlcyBhIHBhY2tldC5cbiAqXG4gKiAgICAgPHBhY2tldCB0eXBlIGlkPiBbIDxkYXRhPiBdXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgNWhlbGxvIHdvcmxkXG4gKiAgICAgM1xuICogICAgIDRcbiAqXG4gKiBCaW5hcnkgaXMgZW5jb2RlZCBpbiBhbiBpZGVudGljYWwgcHJpbmNpcGxlXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5lbmNvZGVQYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0LCBzdXBwb3J0c0JpbmFyeSwgdXRmOGVuY29kZSwgY2FsbGJhY2spIHtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHN1cHBvcnRzQmluYXJ5KSB7XG4gICAgY2FsbGJhY2sgPSBzdXBwb3J0c0JpbmFyeTtcbiAgICBzdXBwb3J0c0JpbmFyeSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHV0ZjhlbmNvZGUpIHtcbiAgICBjYWxsYmFjayA9IHV0ZjhlbmNvZGU7XG4gICAgdXRmOGVuY29kZSA9IG51bGw7XG4gIH1cblxuICB2YXIgZGF0YSA9IChwYWNrZXQuZGF0YSA9PT0gdW5kZWZpbmVkKVxuICAgID8gdW5kZWZpbmVkXG4gICAgOiBwYWNrZXQuZGF0YS5idWZmZXIgfHwgcGFja2V0LmRhdGE7XG5cbiAgaWYgKGdsb2JhbC5BcnJheUJ1ZmZlciAmJiBkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZW5jb2RlQXJyYXlCdWZmZXIocGFja2V0LCBzdXBwb3J0c0JpbmFyeSwgY2FsbGJhY2spO1xuICB9IGVsc2UgaWYgKEJsb2IgJiYgZGF0YSBpbnN0YW5jZW9mIGdsb2JhbC5CbG9iKSB7XG4gICAgcmV0dXJuIGVuY29kZUJsb2IocGFja2V0LCBzdXBwb3J0c0JpbmFyeSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gbWlnaHQgYmUgYW4gb2JqZWN0IHdpdGggeyBiYXNlNjQ6IHRydWUsIGRhdGE6IGRhdGFBc0Jhc2U2NFN0cmluZyB9XG4gIGlmIChkYXRhICYmIGRhdGEuYmFzZTY0KSB7XG4gICAgcmV0dXJuIGVuY29kZUJhc2U2NE9iamVjdChwYWNrZXQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFNlbmRpbmcgZGF0YSBhcyBhIHV0Zi04IHN0cmluZ1xuICB2YXIgZW5jb2RlZCA9IHBhY2tldHNbcGFja2V0LnR5cGVdO1xuXG4gIC8vIGRhdGEgZnJhZ21lbnQgaXMgb3B0aW9uYWxcbiAgaWYgKHVuZGVmaW5lZCAhPT0gcGFja2V0LmRhdGEpIHtcbiAgICBlbmNvZGVkICs9IHV0ZjhlbmNvZGUgPyB1dGY4LmVuY29kZShTdHJpbmcocGFja2V0LmRhdGEpKSA6IFN0cmluZyhwYWNrZXQuZGF0YSk7XG4gIH1cblxuICByZXR1cm4gY2FsbGJhY2soJycgKyBlbmNvZGVkKTtcblxufTtcblxuZnVuY3Rpb24gZW5jb2RlQmFzZTY0T2JqZWN0KHBhY2tldCwgY2FsbGJhY2spIHtcbiAgLy8gcGFja2V0IGRhdGEgaXMgYW4gb2JqZWN0IHsgYmFzZTY0OiB0cnVlLCBkYXRhOiBkYXRhQXNCYXNlNjRTdHJpbmcgfVxuICB2YXIgbWVzc2FnZSA9ICdiJyArIGV4cG9ydHMucGFja2V0c1twYWNrZXQudHlwZV0gKyBwYWNrZXQuZGF0YS5kYXRhO1xuICByZXR1cm4gY2FsbGJhY2sobWVzc2FnZSk7XG59XG5cbi8qKlxuICogRW5jb2RlIHBhY2tldCBoZWxwZXJzIGZvciBiaW5hcnkgdHlwZXNcbiAqL1xuXG5mdW5jdGlvbiBlbmNvZGVBcnJheUJ1ZmZlcihwYWNrZXQsIHN1cHBvcnRzQmluYXJ5LCBjYWxsYmFjaykge1xuICBpZiAoIXN1cHBvcnRzQmluYXJ5KSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuZW5jb2RlQmFzZTY0UGFja2V0KHBhY2tldCwgY2FsbGJhY2spO1xuICB9XG5cbiAgdmFyIGRhdGEgPSBwYWNrZXQuZGF0YTtcbiAgdmFyIGNvbnRlbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICB2YXIgcmVzdWx0QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMSArIGRhdGEuYnl0ZUxlbmd0aCk7XG5cbiAgcmVzdWx0QnVmZmVyWzBdID0gcGFja2V0c1twYWNrZXQudHlwZV07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudEFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzdWx0QnVmZmVyW2krMV0gPSBjb250ZW50QXJyYXlbaV07XG4gIH1cblxuICByZXR1cm4gY2FsbGJhY2socmVzdWx0QnVmZmVyLmJ1ZmZlcik7XG59XG5cbmZ1bmN0aW9uIGVuY29kZUJsb2JBc0FycmF5QnVmZmVyKHBhY2tldCwgc3VwcG9ydHNCaW5hcnksIGNhbGxiYWNrKSB7XG4gIGlmICghc3VwcG9ydHNCaW5hcnkpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5lbmNvZGVCYXNlNjRQYWNrZXQocGFja2V0LCBjYWxsYmFjayk7XG4gIH1cblxuICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICBmci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBwYWNrZXQuZGF0YSA9IGZyLnJlc3VsdDtcbiAgICBleHBvcnRzLmVuY29kZVBhY2tldChwYWNrZXQsIHN1cHBvcnRzQmluYXJ5LCB0cnVlLCBjYWxsYmFjayk7XG4gIH07XG4gIHJldHVybiBmci5yZWFkQXNBcnJheUJ1ZmZlcihwYWNrZXQuZGF0YSk7XG59XG5cbmZ1bmN0aW9uIGVuY29kZUJsb2IocGFja2V0LCBzdXBwb3J0c0JpbmFyeSwgY2FsbGJhY2spIHtcbiAgaWYgKCFzdXBwb3J0c0JpbmFyeSkge1xuICAgIHJldHVybiBleHBvcnRzLmVuY29kZUJhc2U2NFBhY2tldChwYWNrZXQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlmIChkb250U2VuZEJsb2JzKSB7XG4gICAgcmV0dXJuIGVuY29kZUJsb2JBc0FycmF5QnVmZmVyKHBhY2tldCwgc3VwcG9ydHNCaW5hcnksIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBuZXcgVWludDhBcnJheSgxKTtcbiAgbGVuZ3RoWzBdID0gcGFja2V0c1twYWNrZXQudHlwZV07XG4gIHZhciBibG9iID0gbmV3IEJsb2IoW2xlbmd0aC5idWZmZXIsIHBhY2tldC5kYXRhXSk7XG5cbiAgcmV0dXJuIGNhbGxiYWNrKGJsb2IpO1xufVxuXG4vKipcbiAqIEVuY29kZXMgYSBwYWNrZXQgd2l0aCBiaW5hcnkgZGF0YSBpbiBhIGJhc2U2NCBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0LCBoYXMgYHR5cGVgIGFuZCBgZGF0YWBcbiAqIEByZXR1cm4ge1N0cmluZ30gYmFzZTY0IGVuY29kZWQgbWVzc2FnZVxuICovXG5cbmV4cG9ydHMuZW5jb2RlQmFzZTY0UGFja2V0ID0gZnVuY3Rpb24ocGFja2V0LCBjYWxsYmFjaykge1xuICB2YXIgbWVzc2FnZSA9ICdiJyArIGV4cG9ydHMucGFja2V0c1twYWNrZXQudHlwZV07XG4gIGlmIChCbG9iICYmIHBhY2tldC5kYXRhIGluc3RhbmNlb2YgZ2xvYmFsLkJsb2IpIHtcbiAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGI2NCA9IGZyLnJlc3VsdC5zcGxpdCgnLCcpWzFdO1xuICAgICAgY2FsbGJhY2sobWVzc2FnZSArIGI2NCk7XG4gICAgfTtcbiAgICByZXR1cm4gZnIucmVhZEFzRGF0YVVSTChwYWNrZXQuZGF0YSk7XG4gIH1cblxuICB2YXIgYjY0ZGF0YTtcbiAgdHJ5IHtcbiAgICBiNjRkYXRhID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShwYWNrZXQuZGF0YSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gaVBob25lIFNhZmFyaSBkb2Vzbid0IGxldCB5b3UgYXBwbHkgd2l0aCB0eXBlZCBhcnJheXNcbiAgICB2YXIgdHlwZWQgPSBuZXcgVWludDhBcnJheShwYWNrZXQuZGF0YSk7XG4gICAgdmFyIGJhc2ljID0gbmV3IEFycmF5KHR5cGVkLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlZC5sZW5ndGg7IGkrKykge1xuICAgICAgYmFzaWNbaV0gPSB0eXBlZFtpXTtcbiAgICB9XG4gICAgYjY0ZGF0YSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgYmFzaWMpO1xuICB9XG4gIG1lc3NhZ2UgKz0gZ2xvYmFsLmJ0b2EoYjY0ZGF0YSk7XG4gIHJldHVybiBjYWxsYmFjayhtZXNzYWdlKTtcbn07XG5cbi8qKlxuICogRGVjb2RlcyBhIHBhY2tldC4gQ2hhbmdlcyBmb3JtYXQgdG8gQmxvYiBpZiByZXF1ZXN0ZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSB3aXRoIGB0eXBlYCBhbmQgYGRhdGFgIChpZiBhbnkpXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmRlY29kZVBhY2tldCA9IGZ1bmN0aW9uIChkYXRhLCBiaW5hcnlUeXBlLCB1dGY4ZGVjb2RlKSB7XG4gIC8vIFN0cmluZyBkYXRhXG4gIGlmICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJyB8fCBkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoZGF0YS5jaGFyQXQoMCkgPT0gJ2InKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZWNvZGVCYXNlNjRQYWNrZXQoZGF0YS5zdWJzdHIoMSksIGJpbmFyeVR5cGUpO1xuICAgIH1cblxuICAgIGlmICh1dGY4ZGVjb2RlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gdXRmOC5kZWNvZGUoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBlcnI7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB0eXBlID0gZGF0YS5jaGFyQXQoMCk7XG5cbiAgICBpZiAoTnVtYmVyKHR5cGUpICE9IHR5cGUgfHwgIXBhY2tldHNsaXN0W3R5cGVdKSB7XG4gICAgICByZXR1cm4gZXJyO1xuICAgIH1cblxuICAgIGlmIChkYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IHBhY2tldHNsaXN0W3R5cGVdLCBkYXRhOiBkYXRhLnN1YnN0cmluZygxKSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBwYWNrZXRzbGlzdFt0eXBlXSB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBhc0FycmF5ID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gIHZhciB0eXBlID0gYXNBcnJheVswXTtcbiAgdmFyIHJlc3QgPSBzbGljZUJ1ZmZlcihkYXRhLCAxKTtcbiAgaWYgKEJsb2IgJiYgYmluYXJ5VHlwZSA9PT0gJ2Jsb2InKSB7XG4gICAgcmVzdCA9IG5ldyBCbG9iKFtyZXN0XSk7XG4gIH1cbiAgcmV0dXJuIHsgdHlwZTogcGFja2V0c2xpc3RbdHlwZV0sIGRhdGE6IHJlc3QgfTtcbn07XG5cbi8qKlxuICogRGVjb2RlcyBhIHBhY2tldCBlbmNvZGVkIGluIGEgYmFzZTY0IHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlNjQgZW5jb2RlZCBtZXNzYWdlXG4gKiBAcmV0dXJuIHtPYmplY3R9IHdpdGggYHR5cGVgIGFuZCBgZGF0YWAgKGlmIGFueSlcbiAqL1xuXG5leHBvcnRzLmRlY29kZUJhc2U2NFBhY2tldCA9IGZ1bmN0aW9uKG1zZywgYmluYXJ5VHlwZSkge1xuICB2YXIgdHlwZSA9IHBhY2tldHNsaXN0W21zZy5jaGFyQXQoMCldO1xuICBpZiAoIWdsb2JhbC5BcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiB7IHR5cGU6IHR5cGUsIGRhdGE6IHsgYmFzZTY0OiB0cnVlLCBkYXRhOiBtc2cuc3Vic3RyKDEpIH0gfTtcbiAgfVxuXG4gIHZhciBkYXRhID0gYmFzZTY0ZW5jb2Rlci5kZWNvZGUobXNnLnN1YnN0cigxKSk7XG5cbiAgaWYgKGJpbmFyeVR5cGUgPT09ICdibG9iJyAmJiBCbG9iKSB7XG4gICAgZGF0YSA9IG5ldyBCbG9iKFtkYXRhXSk7XG4gIH1cblxuICByZXR1cm4geyB0eXBlOiB0eXBlLCBkYXRhOiBkYXRhIH07XG59O1xuXG4vKipcbiAqIEVuY29kZXMgbXVsdGlwbGUgbWVzc2FnZXMgKHBheWxvYWQpLlxuICpcbiAqICAgICA8bGVuZ3RoPjpkYXRhXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgMTE6aGVsbG8gd29ybGQyOmhpXG4gKlxuICogSWYgYW55IGNvbnRlbnRzIGFyZSBiaW5hcnksIHRoZXkgd2lsbCBiZSBlbmNvZGVkIGFzIGJhc2U2NCBzdHJpbmdzLiBCYXNlNjRcbiAqIGVuY29kZWQgc3RyaW5ncyBhcmUgbWFya2VkIHdpdGggYSBiIGJlZm9yZSB0aGUgbGVuZ3RoIHNwZWNpZmllclxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhY2tldHNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZW5jb2RlUGF5bG9hZCA9IGZ1bmN0aW9uIChwYWNrZXRzLCBzdXBwb3J0c0JpbmFyeSwgY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBzdXBwb3J0c0JpbmFyeSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBzdXBwb3J0c0JpbmFyeTtcbiAgICBzdXBwb3J0c0JpbmFyeSA9IG51bGw7XG4gIH1cblxuICB2YXIgaXNCaW5hcnkgPSBoYXNCaW5hcnkocGFja2V0cyk7XG5cbiAgaWYgKHN1cHBvcnRzQmluYXJ5ICYmIGlzQmluYXJ5KSB7XG4gICAgaWYgKEJsb2IgJiYgIWRvbnRTZW5kQmxvYnMpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmVuY29kZVBheWxvYWRBc0Jsb2IocGFja2V0cywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHJldHVybiBleHBvcnRzLmVuY29kZVBheWxvYWRBc0FycmF5QnVmZmVyKHBhY2tldHMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGlmICghcGFja2V0cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY2FsbGJhY2soJzA6Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRMZW5ndGhIZWFkZXIobWVzc2FnZSkge1xuICAgIHJldHVybiBtZXNzYWdlLmxlbmd0aCArICc6JyArIG1lc3NhZ2U7XG4gIH1cblxuICBmdW5jdGlvbiBlbmNvZGVPbmUocGFja2V0LCBkb25lQ2FsbGJhY2spIHtcbiAgICBleHBvcnRzLmVuY29kZVBhY2tldChwYWNrZXQsICFpc0JpbmFyeSA/IGZhbHNlIDogc3VwcG9ydHNCaW5hcnksIHRydWUsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGRvbmVDYWxsYmFjayhudWxsLCBzZXRMZW5ndGhIZWFkZXIobWVzc2FnZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgbWFwKHBhY2tldHMsIGVuY29kZU9uZSwgZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHJlc3VsdHMuam9pbignJykpO1xuICB9KTtcbn07XG5cbi8qKlxuICogQXN5bmMgYXJyYXkgbWFwIHVzaW5nIGFmdGVyXG4gKi9cblxuZnVuY3Rpb24gbWFwKGFyeSwgZWFjaCwgZG9uZSkge1xuICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGFyeS5sZW5ndGgpO1xuICB2YXIgbmV4dCA9IGFmdGVyKGFyeS5sZW5ndGgsIGRvbmUpO1xuXG4gIHZhciBlYWNoV2l0aEluZGV4ID0gZnVuY3Rpb24oaSwgZWwsIGNiKSB7XG4gICAgZWFjaChlbCwgZnVuY3Rpb24oZXJyb3IsIG1zZykge1xuICAgICAgcmVzdWx0W2ldID0gbXNnO1xuICAgICAgY2IoZXJyb3IsIHJlc3VsdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnkubGVuZ3RoOyBpKyspIHtcbiAgICBlYWNoV2l0aEluZGV4KGksIGFyeVtpXSwgbmV4dCk7XG4gIH1cbn1cblxuLypcbiAqIERlY29kZXMgZGF0YSB3aGVuIGEgcGF5bG9hZCBpcyBtYXliZSBleHBlY3RlZC4gUG9zc2libGUgYmluYXJ5IGNvbnRlbnRzIGFyZVxuICogZGVjb2RlZCBmcm9tIHRoZWlyIGJhc2U2NCByZXByZXNlbnRhdGlvblxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLCBjYWxsYmFjayBtZXRob2RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24gKGRhdGEsIGJpbmFyeVR5cGUsIGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiBleHBvcnRzLmRlY29kZVBheWxvYWRBc0JpbmFyeShkYXRhLCBiaW5hcnlUeXBlLCBjYWxsYmFjayk7XG4gIH1cblxuICBpZiAodHlwZW9mIGJpbmFyeVR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IGJpbmFyeVR5cGU7XG4gICAgYmluYXJ5VHlwZSA9IG51bGw7XG4gIH1cblxuICB2YXIgcGFja2V0O1xuICBpZiAoZGF0YSA9PSAnJykge1xuICAgIC8vIHBhcnNlciBlcnJvciAtIGlnbm9yaW5nIHBheWxvYWRcbiAgICByZXR1cm4gY2FsbGJhY2soZXJyLCAwLCAxKTtcbiAgfVxuXG4gIHZhciBsZW5ndGggPSAnJ1xuICAgICwgbiwgbXNnO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gZGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgY2hyID0gZGF0YS5jaGFyQXQoaSk7XG5cbiAgICBpZiAoJzonICE9IGNocikge1xuICAgICAgbGVuZ3RoICs9IGNocjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCcnID09IGxlbmd0aCB8fCAobGVuZ3RoICE9IChuID0gTnVtYmVyKGxlbmd0aCkpKSkge1xuICAgICAgICAvLyBwYXJzZXIgZXJyb3IgLSBpZ25vcmluZyBwYXlsb2FkXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIDAsIDEpO1xuICAgICAgfVxuXG4gICAgICBtc2cgPSBkYXRhLnN1YnN0cihpICsgMSwgbik7XG5cbiAgICAgIGlmIChsZW5ndGggIT0gbXNnLmxlbmd0aCkge1xuICAgICAgICAvLyBwYXJzZXIgZXJyb3IgLSBpZ25vcmluZyBwYXlsb2FkXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIDAsIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAobXNnLmxlbmd0aCkge1xuICAgICAgICBwYWNrZXQgPSBleHBvcnRzLmRlY29kZVBhY2tldChtc2csIGJpbmFyeVR5cGUsIHRydWUpO1xuXG4gICAgICAgIGlmIChlcnIudHlwZSA9PSBwYWNrZXQudHlwZSAmJiBlcnIuZGF0YSA9PSBwYWNrZXQuZGF0YSkge1xuICAgICAgICAgIC8vIHBhcnNlciBlcnJvciBpbiBpbmRpdmlkdWFsIHBhY2tldCAtIGlnbm9yaW5nIHBheWxvYWRcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCAwLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXQgPSBjYWxsYmFjayhwYWNrZXQsIGkgKyBuLCBsKTtcbiAgICAgICAgaWYgKGZhbHNlID09PSByZXQpIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gYWR2YW5jZSBjdXJzb3JcbiAgICAgIGkgKz0gbjtcbiAgICAgIGxlbmd0aCA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsZW5ndGggIT0gJycpIHtcbiAgICAvLyBwYXJzZXIgZXJyb3IgLSBpZ25vcmluZyBwYXlsb2FkXG4gICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgMCwgMSk7XG4gIH1cblxufTtcblxuLyoqXG4gKiBFbmNvZGVzIG11bHRpcGxlIG1lc3NhZ2VzIChwYXlsb2FkKSBhcyBiaW5hcnkuXG4gKlxuICogPDEgPSBiaW5hcnksIDAgPSBzdHJpbmc+PG51bWJlciBmcm9tIDAtOT48bnVtYmVyIGZyb20gMC05PlsuLi5dPG51bWJlclxuICogMjU1PjxkYXRhPlxuICpcbiAqIEV4YW1wbGU6XG4gKiAxIDMgMjU1IDEgMiAzLCBpZiB0aGUgYmluYXJ5IGNvbnRlbnRzIGFyZSBpbnRlcnByZXRlZCBhcyA4IGJpdCBpbnRlZ2Vyc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhY2tldHNcbiAqIEByZXR1cm4ge0FycmF5QnVmZmVyfSBlbmNvZGVkIHBheWxvYWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZW5jb2RlUGF5bG9hZEFzQXJyYXlCdWZmZXIgPSBmdW5jdGlvbihwYWNrZXRzLCBjYWxsYmFjaykge1xuICBpZiAoIXBhY2tldHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBBcnJheUJ1ZmZlcigwKSk7XG4gIH1cblxuICBmdW5jdGlvbiBlbmNvZGVPbmUocGFja2V0LCBkb25lQ2FsbGJhY2spIHtcbiAgICBleHBvcnRzLmVuY29kZVBhY2tldChwYWNrZXQsIHRydWUsIHRydWUsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiBkb25lQ2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSk7XG4gIH1cblxuICBtYXAocGFja2V0cywgZW5jb2RlT25lLCBmdW5jdGlvbihlcnIsIGVuY29kZWRQYWNrZXRzKSB7XG4gICAgdmFyIHRvdGFsTGVuZ3RoID0gZW5jb2RlZFBhY2tldHMucmVkdWNlKGZ1bmN0aW9uKGFjYywgcCkge1xuICAgICAgdmFyIGxlbjtcbiAgICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBsZW4gPSBwLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IHAuYnl0ZUxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2MgKyBsZW4udG9TdHJpbmcoKS5sZW5ndGggKyBsZW4gKyAyOyAvLyBzdHJpbmcvYmluYXJ5IGlkZW50aWZpZXIgKyBzZXBhcmF0b3IgPSAyXG4gICAgfSwgMCk7XG5cbiAgICB2YXIgcmVzdWx0QXJyYXkgPSBuZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7XG5cbiAgICB2YXIgYnVmZmVySW5kZXggPSAwO1xuICAgIGVuY29kZWRQYWNrZXRzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgdmFyIGlzU3RyaW5nID0gdHlwZW9mIHAgPT09ICdzdHJpbmcnO1xuICAgICAgdmFyIGFiID0gcDtcbiAgICAgIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KHAubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmlld1tpXSA9IHAuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBhYiA9IHZpZXcuYnVmZmVyO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNTdHJpbmcpIHsgLy8gbm90IHRydWUgYmluYXJ5XG4gICAgICAgIHJlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gMDtcbiAgICAgIH0gZWxzZSB7IC8vIHRydWUgYmluYXJ5XG4gICAgICAgIHJlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gMTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlblN0ciA9IGFiLmJ5dGVMZW5ndGgudG9TdHJpbmcoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuU3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gcGFyc2VJbnQobGVuU3RyW2ldKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gMjU1O1xuXG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHRBcnJheVtidWZmZXJJbmRleCsrXSA9IHZpZXdbaV07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2FsbGJhY2socmVzdWx0QXJyYXkuYnVmZmVyKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEVuY29kZSBhcyBCbG9iXG4gKi9cblxuZXhwb3J0cy5lbmNvZGVQYXlsb2FkQXNCbG9iID0gZnVuY3Rpb24ocGFja2V0cywgY2FsbGJhY2spIHtcbiAgZnVuY3Rpb24gZW5jb2RlT25lKHBhY2tldCwgZG9uZUNhbGxiYWNrKSB7XG4gICAgZXhwb3J0cy5lbmNvZGVQYWNrZXQocGFja2V0LCB0cnVlLCB0cnVlLCBmdW5jdGlvbihlbmNvZGVkKSB7XG4gICAgICB2YXIgYmluYXJ5SWRlbnRpZmllciA9IG5ldyBVaW50OEFycmF5KDEpO1xuICAgICAgYmluYXJ5SWRlbnRpZmllclswXSA9IDE7XG4gICAgICBpZiAodHlwZW9mIGVuY29kZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoZW5jb2RlZC5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuY29kZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2aWV3W2ldID0gZW5jb2RlZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIGVuY29kZWQgPSB2aWV3LmJ1ZmZlcjtcbiAgICAgICAgYmluYXJ5SWRlbnRpZmllclswXSA9IDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW4gPSAoZW5jb2RlZCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKVxuICAgICAgICA/IGVuY29kZWQuYnl0ZUxlbmd0aFxuICAgICAgICA6IGVuY29kZWQuc2l6ZTtcblxuICAgICAgdmFyIGxlblN0ciA9IGxlbi50b1N0cmluZygpO1xuICAgICAgdmFyIGxlbmd0aEFyeSA9IG5ldyBVaW50OEFycmF5KGxlblN0ci5sZW5ndGggKyAxKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuU3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxlbmd0aEFyeVtpXSA9IHBhcnNlSW50KGxlblN0cltpXSk7XG4gICAgICB9XG4gICAgICBsZW5ndGhBcnlbbGVuU3RyLmxlbmd0aF0gPSAyNTU7XG5cbiAgICAgIGlmIChCbG9iKSB7XG4gICAgICAgIHZhciBibG9iID0gbmV3IEJsb2IoW2JpbmFyeUlkZW50aWZpZXIuYnVmZmVyLCBsZW5ndGhBcnkuYnVmZmVyLCBlbmNvZGVkXSk7XG4gICAgICAgIGRvbmVDYWxsYmFjayhudWxsLCBibG9iKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG1hcChwYWNrZXRzLCBlbmNvZGVPbmUsIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgQmxvYihyZXN1bHRzKSk7XG4gIH0pO1xufTtcblxuLypcbiAqIERlY29kZXMgZGF0YSB3aGVuIGEgcGF5bG9hZCBpcyBtYXliZSBleHBlY3RlZC4gU3RyaW5ncyBhcmUgZGVjb2RlZCBieVxuICogaW50ZXJwcmV0aW5nIGVhY2ggYnl0ZSBhcyBhIGtleSBjb2RlIGZvciBlbnRyaWVzIG1hcmtlZCB0byBzdGFydCB3aXRoIDAuIFNlZVxuICogZGVzY3JpcHRpb24gb2YgZW5jb2RlUGF5bG9hZEFzQmluYXJ5XG4gKlxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZGF0YSwgY2FsbGJhY2sgbWV0aG9kXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuZGVjb2RlUGF5bG9hZEFzQmluYXJ5ID0gZnVuY3Rpb24gKGRhdGEsIGJpbmFyeVR5cGUsIGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgYmluYXJ5VHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gYmluYXJ5VHlwZTtcbiAgICBiaW5hcnlUeXBlID0gbnVsbDtcbiAgfVxuXG4gIHZhciBidWZmZXJUYWlsID0gZGF0YTtcbiAgdmFyIGJ1ZmZlcnMgPSBbXTtcblxuICB2YXIgbnVtYmVyVG9vTG9uZyA9IGZhbHNlO1xuICB3aGlsZSAoYnVmZmVyVGFpbC5ieXRlTGVuZ3RoID4gMCkge1xuICAgIHZhciB0YWlsQXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXJUYWlsKTtcbiAgICB2YXIgaXNTdHJpbmcgPSB0YWlsQXJyYXlbMF0gPT09IDA7XG4gICAgdmFyIG1zZ0xlbmd0aCA9ICcnO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IDsgaSsrKSB7XG4gICAgICBpZiAodGFpbEFycmF5W2ldID09IDI1NSkgYnJlYWs7XG5cbiAgICAgIGlmIChtc2dMZW5ndGgubGVuZ3RoID4gMzEwKSB7XG4gICAgICAgIG51bWJlclRvb0xvbmcgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgbXNnTGVuZ3RoICs9IHRhaWxBcnJheVtpXTtcbiAgICB9XG5cbiAgICBpZihudW1iZXJUb29Mb25nKSByZXR1cm4gY2FsbGJhY2soZXJyLCAwLCAxKTtcblxuICAgIGJ1ZmZlclRhaWwgPSBzbGljZUJ1ZmZlcihidWZmZXJUYWlsLCAyICsgbXNnTGVuZ3RoLmxlbmd0aCk7XG4gICAgbXNnTGVuZ3RoID0gcGFyc2VJbnQobXNnTGVuZ3RoKTtcblxuICAgIHZhciBtc2cgPSBzbGljZUJ1ZmZlcihidWZmZXJUYWlsLCAwLCBtc2dMZW5ndGgpO1xuICAgIGlmIChpc1N0cmluZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbXNnID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShtc2cpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaVBob25lIFNhZmFyaSBkb2Vzbid0IGxldCB5b3UgYXBwbHkgdG8gdHlwZWQgYXJyYXlzXG4gICAgICAgIHZhciB0eXBlZCA9IG5ldyBVaW50OEFycmF5KG1zZyk7XG4gICAgICAgIG1zZyA9ICcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHR5cGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbXNnICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodHlwZWRbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgYnVmZmVycy5wdXNoKG1zZyk7XG4gICAgYnVmZmVyVGFpbCA9IHNsaWNlQnVmZmVyKGJ1ZmZlclRhaWwsIG1zZ0xlbmd0aCk7XG4gIH1cblxuICB2YXIgdG90YWwgPSBidWZmZXJzLmxlbmd0aDtcbiAgYnVmZmVycy5mb3JFYWNoKGZ1bmN0aW9uKGJ1ZmZlciwgaSkge1xuICAgIGNhbGxiYWNrKGV4cG9ydHMuZGVjb2RlUGFja2V0KGJ1ZmZlciwgYmluYXJ5VHlwZSwgdHJ1ZSksIGksIHRvdGFsKTtcbiAgfSk7XG59O1xuIiwiXG4vKipcbiAqIEdldHMgdGhlIGtleXMgZm9yIGFuIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0ga2V5c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzIChvYmope1xuICB2YXIgYXJyID0gW107XG4gIHZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZvciAodmFyIGkgaW4gb2JqKSB7XG4gICAgaWYgKGhhcy5jYWxsKG9iaiwgaSkpIHtcbiAgICAgIGFyci5wdXNoKGkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYWZ0ZXJcblxuZnVuY3Rpb24gYWZ0ZXIoY291bnQsIGNhbGxiYWNrLCBlcnJfY2IpIHtcbiAgICB2YXIgYmFpbCA9IGZhbHNlXG4gICAgZXJyX2NiID0gZXJyX2NiIHx8IG5vb3BcbiAgICBwcm94eS5jb3VudCA9IGNvdW50XG5cbiAgICByZXR1cm4gKGNvdW50ID09PSAwKSA/IGNhbGxiYWNrKCkgOiBwcm94eVxuXG4gICAgZnVuY3Rpb24gcHJveHkoZXJyLCByZXN1bHQpIHtcbiAgICAgICAgaWYgKHByb3h5LmNvdW50IDw9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYWZ0ZXIgY2FsbGVkIHRvbyBtYW55IHRpbWVzJylcbiAgICAgICAgfVxuICAgICAgICAtLXByb3h5LmNvdW50XG5cbiAgICAgICAgLy8gYWZ0ZXIgZmlyc3QgZXJyb3IsIHJlc3QgYXJlIHBhc3NlZCB0byBlcnJfY2JcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgYmFpbCA9IHRydWVcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycilcbiAgICAgICAgICAgIC8vIGZ1dHVyZSBlcnJvciBjYWxsYmFja3Mgd2lsbCBnbyB0byBlcnJvciBoYW5kbGVyXG4gICAgICAgICAgICBjYWxsYmFjayA9IGVycl9jYlxuICAgICAgICB9IGVsc2UgaWYgKHByb3h5LmNvdW50ID09PSAwICYmICFiYWlsKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuIiwiLyoqXG4gKiBBbiBhYnN0cmFjdGlvbiBmb3Igc2xpY2luZyBhbiBhcnJheWJ1ZmZlciBldmVuIHdoZW5cbiAqIEFycmF5QnVmZmVyLnByb3RvdHlwZS5zbGljZSBpcyBub3Qgc3VwcG9ydGVkXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFycmF5YnVmZmVyLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGFycmF5YnVmZmVyLmJ5dGVMZW5ndGg7XG4gIHN0YXJ0ID0gc3RhcnQgfHwgMDtcbiAgZW5kID0gZW5kIHx8IGJ5dGVzO1xuXG4gIGlmIChhcnJheWJ1ZmZlci5zbGljZSkgeyByZXR1cm4gYXJyYXlidWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCk7IH1cblxuICBpZiAoc3RhcnQgPCAwKSB7IHN0YXJ0ICs9IGJ5dGVzOyB9XG4gIGlmIChlbmQgPCAwKSB7IGVuZCArPSBieXRlczsgfVxuICBpZiAoZW5kID4gYnl0ZXMpIHsgZW5kID0gYnl0ZXM7IH1cblxuICBpZiAoc3RhcnQgPj0gYnl0ZXMgfHwgc3RhcnQgPj0gZW5kIHx8IGJ5dGVzID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUJ1ZmZlcigwKTtcbiAgfVxuXG4gIHZhciBhYnYgPSBuZXcgVWludDhBcnJheShhcnJheWJ1ZmZlcik7XG4gIHZhciByZXN1bHQgPSBuZXcgVWludDhBcnJheShlbmQgLSBzdGFydCk7XG4gIGZvciAodmFyIGkgPSBzdGFydCwgaWkgPSAwOyBpIDwgZW5kOyBpKyssIGlpKyspIHtcbiAgICByZXN1bHRbaWldID0gYWJ2W2ldO1xuICB9XG4gIHJldHVybiByZXN1bHQuYnVmZmVyO1xufTtcbiIsIi8qXG4gKiBiYXNlNjQtYXJyYXlidWZmZXJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9uaWtsYXN2aC9iYXNlNjQtYXJyYXlidWZmZXJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTmlrbGFzIHZvbiBIZXJ0emVuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cbihmdW5jdGlvbihjaGFycyl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24oYXJyYXlidWZmZXIpIHtcbiAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShhcnJheWJ1ZmZlciksXG4gICAgaSwgbGVuID0gYnl0ZXMubGVuZ3RoLCBiYXNlNjQgPSBcIlwiO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSs9Mykge1xuICAgICAgYmFzZTY0ICs9IGNoYXJzW2J5dGVzW2ldID4+IDJdO1xuICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaV0gJiAzKSA8PCA0KSB8IChieXRlc1tpICsgMV0gPj4gNCldO1xuICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07XG4gICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaSArIDJdICYgNjNdO1xuICAgIH1cblxuICAgIGlmICgobGVuICUgMykgPT09IDIpIHtcbiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgXCI9XCI7XG4gICAgfSBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7XG4gICAgICBiYXNlNjQgPSBiYXNlNjQuc3Vic3RyaW5nKDAsIGJhc2U2NC5sZW5ndGggLSAyKSArIFwiPT1cIjtcbiAgICB9XG5cbiAgICByZXR1cm4gYmFzZTY0O1xuICB9O1xuXG4gIGV4cG9ydHMuZGVjb2RlID0gIGZ1bmN0aW9uKGJhc2U2NCkge1xuICAgIHZhciBidWZmZXJMZW5ndGggPSBiYXNlNjQubGVuZ3RoICogMC43NSxcbiAgICBsZW4gPSBiYXNlNjQubGVuZ3RoLCBpLCBwID0gMCxcbiAgICBlbmNvZGVkMSwgZW5jb2RlZDIsIGVuY29kZWQzLCBlbmNvZGVkNDtcblxuICAgIGlmIChiYXNlNjRbYmFzZTY0Lmxlbmd0aCAtIDFdID09PSBcIj1cIikge1xuICAgICAgYnVmZmVyTGVuZ3RoLS07XG4gICAgICBpZiAoYmFzZTY0W2Jhc2U2NC5sZW5ndGggLSAyXSA9PT0gXCI9XCIpIHtcbiAgICAgICAgYnVmZmVyTGVuZ3RoLS07XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFycmF5YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlckxlbmd0aCksXG4gICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShhcnJheWJ1ZmZlcik7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKz00KSB7XG4gICAgICBlbmNvZGVkMSA9IGNoYXJzLmluZGV4T2YoYmFzZTY0W2ldKTtcbiAgICAgIGVuY29kZWQyID0gY2hhcnMuaW5kZXhPZihiYXNlNjRbaSsxXSk7XG4gICAgICBlbmNvZGVkMyA9IGNoYXJzLmluZGV4T2YoYmFzZTY0W2krMl0pO1xuICAgICAgZW5jb2RlZDQgPSBjaGFycy5pbmRleE9mKGJhc2U2NFtpKzNdKTtcblxuICAgICAgYnl0ZXNbcCsrXSA9IChlbmNvZGVkMSA8PCAyKSB8IChlbmNvZGVkMiA+PiA0KTtcbiAgICAgIGJ5dGVzW3ArK10gPSAoKGVuY29kZWQyICYgMTUpIDw8IDQpIHwgKGVuY29kZWQzID4+IDIpO1xuICAgICAgYnl0ZXNbcCsrXSA9ICgoZW5jb2RlZDMgJiAzKSA8PCA2KSB8IChlbmNvZGVkNCAmIDYzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXlidWZmZXI7XG4gIH07XG59KShcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIik7XG4iLCIvKipcbiAqIENyZWF0ZSBhIGJsb2IgYnVpbGRlciBldmVuIHdoZW4gdmVuZG9yIHByZWZpeGVzIGV4aXN0XG4gKi9cblxudmFyIEJsb2JCdWlsZGVyID0gZ2xvYmFsLkJsb2JCdWlsZGVyXG4gIHx8IGdsb2JhbC5XZWJLaXRCbG9iQnVpbGRlclxuICB8fCBnbG9iYWwuTVNCbG9iQnVpbGRlclxuICB8fCBnbG9iYWwuTW96QmxvYkJ1aWxkZXI7XG5cbi8qKlxuICogQ2hlY2sgaWYgQmxvYiBjb25zdHJ1Y3RvciBpcyBzdXBwb3J0ZWRcbiAqL1xuXG52YXIgYmxvYlN1cHBvcnRlZCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYSA9IG5ldyBCbG9iKFsnaGknXSk7XG4gICAgcmV0dXJuIGEuc2l6ZSA9PT0gMjtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KSgpO1xuXG4vKipcbiAqIENoZWNrIGlmIEJsb2IgY29uc3RydWN0b3Igc3VwcG9ydHMgQXJyYXlCdWZmZXJWaWV3c1xuICogRmFpbHMgaW4gU2FmYXJpIDYsIHNvIHdlIG5lZWQgdG8gbWFwIHRvIEFycmF5QnVmZmVycyB0aGVyZS5cbiAqL1xuXG52YXIgYmxvYlN1cHBvcnRzQXJyYXlCdWZmZXJWaWV3ID0gYmxvYlN1cHBvcnRlZCAmJiAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGIgPSBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoWzEsMl0pXSk7XG4gICAgcmV0dXJuIGIuc2l6ZSA9PT0gMjtcbiAgfSBjYXRjaChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KSgpO1xuXG4vKipcbiAqIENoZWNrIGlmIEJsb2JCdWlsZGVyIGlzIHN1cHBvcnRlZFxuICovXG5cbnZhciBibG9iQnVpbGRlclN1cHBvcnRlZCA9IEJsb2JCdWlsZGVyXG4gICYmIEJsb2JCdWlsZGVyLnByb3RvdHlwZS5hcHBlbmRcbiAgJiYgQmxvYkJ1aWxkZXIucHJvdG90eXBlLmdldEJsb2I7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgbWFwcyBBcnJheUJ1ZmZlclZpZXdzIHRvIEFycmF5QnVmZmVyc1xuICogVXNlZCBieSBCbG9iQnVpbGRlciBjb25zdHJ1Y3RvciBhbmQgb2xkIGJyb3dzZXJzIHRoYXQgZGlkbid0XG4gKiBzdXBwb3J0IGl0IGluIHRoZSBCbG9iIGNvbnN0cnVjdG9yLlxuICovXG5cbmZ1bmN0aW9uIG1hcEFycmF5QnVmZmVyVmlld3MoYXJ5KSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNodW5rID0gYXJ5W2ldO1xuICAgIGlmIChjaHVuay5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZiA9IGNodW5rLmJ1ZmZlcjtcblxuICAgICAgLy8gaWYgdGhpcyBpcyBhIHN1YmFycmF5LCBtYWtlIGEgY29weSBzbyB3ZSBvbmx5XG4gICAgICAvLyBpbmNsdWRlIHRoZSBzdWJhcnJheSByZWdpb24gZnJvbSB0aGUgdW5kZXJseWluZyBidWZmZXJcbiAgICAgIGlmIChjaHVuay5ieXRlTGVuZ3RoICE9PSBidWYuYnl0ZUxlbmd0aCkge1xuICAgICAgICB2YXIgY29weSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmJ5dGVMZW5ndGgpO1xuICAgICAgICBjb3B5LnNldChuZXcgVWludDhBcnJheShidWYsIGNodW5rLmJ5dGVPZmZzZXQsIGNodW5rLmJ5dGVMZW5ndGgpKTtcbiAgICAgICAgYnVmID0gY29weS5idWZmZXI7XG4gICAgICB9XG5cbiAgICAgIGFyeVtpXSA9IGJ1ZjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gQmxvYkJ1aWxkZXJDb25zdHJ1Y3RvcihhcnksIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIGJiID0gbmV3IEJsb2JCdWlsZGVyKCk7XG4gIG1hcEFycmF5QnVmZmVyVmlld3MoYXJ5KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyeS5sZW5ndGg7IGkrKykge1xuICAgIGJiLmFwcGVuZChhcnlbaV0pO1xuICB9XG5cbiAgcmV0dXJuIChvcHRpb25zLnR5cGUpID8gYmIuZ2V0QmxvYihvcHRpb25zLnR5cGUpIDogYmIuZ2V0QmxvYigpO1xufTtcblxuZnVuY3Rpb24gQmxvYkNvbnN0cnVjdG9yKGFyeSwgb3B0aW9ucykge1xuICBtYXBBcnJheUJ1ZmZlclZpZXdzKGFyeSk7XG4gIHJldHVybiBuZXcgQmxvYihhcnksIG9wdGlvbnMgfHwge30pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIGlmIChibG9iU3VwcG9ydGVkKSB7XG4gICAgcmV0dXJuIGJsb2JTdXBwb3J0c0FycmF5QnVmZmVyVmlldyA/IGdsb2JhbC5CbG9iIDogQmxvYkNvbnN0cnVjdG9yO1xuICB9IGVsc2UgaWYgKGJsb2JCdWlsZGVyU3VwcG9ydGVkKSB7XG4gICAgcmV0dXJuIEJsb2JCdWlsZGVyQ29uc3RydWN0b3I7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufSkoKTtcbiIsIlxuLypcbiAqIE1vZHVsZSByZXF1aXJlbWVudHMuXG4gKi9cblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5Jyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNCaW5hcnk7XG5cbi8qKlxuICogQ2hlY2tzIGZvciBiaW5hcnkgZGF0YS5cbiAqXG4gKiBSaWdodCBub3cgb25seSBCdWZmZXIgYW5kIEFycmF5QnVmZmVyIGFyZSBzdXBwb3J0ZWQuLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbnl0aGluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBoYXNCaW5hcnkoZGF0YSkge1xuXG4gIGZ1bmN0aW9uIF9oYXNCaW5hcnkob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBmYWxzZTtcblxuICAgIGlmICggKGdsb2JhbC5CdWZmZXIgJiYgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlcihvYmopKSB8fFxuICAgICAgICAgKGdsb2JhbC5BcnJheUJ1ZmZlciAmJiBvYmogaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgfHxcbiAgICAgICAgIChnbG9iYWwuQmxvYiAmJiBvYmogaW5zdGFuY2VvZiBCbG9iKSB8fFxuICAgICAgICAgKGdsb2JhbC5GaWxlICYmIG9iaiBpbnN0YW5jZW9mIEZpbGUpXG4gICAgICAgICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoX2hhc0JpbmFyeShvYmpbaV0pKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9iaiAmJiAnb2JqZWN0JyA9PSB0eXBlb2Ygb2JqKSB7XG4gICAgICBpZiAob2JqLnRvSlNPTikge1xuICAgICAgICBvYmogPSBvYmoudG9KU09OKCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkgJiYgX2hhc0JpbmFyeShvYmpba2V5XSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBfaGFzQmluYXJ5KGRhdGEpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLyohIGh0dHBzOi8vbXRocy5iZS91dGY4anMgdjIuMC4wIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWBcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLFxuXHQvLyBhbmQgdXNlIGl0IGFzIGByb290YFxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5cdC8vIFRha2VuIGZyb20gaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdO1xuXHRcdHZhciBjb3VudGVyID0gMDtcblx0XHR2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcblx0XHR2YXIgdmFsdWU7XG5cdFx0dmFyIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8vIFRha2VuIGZyb20gaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdHZhciB2YWx1ZTtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdGZ1bmN0aW9uIGNoZWNrU2NhbGFyVmFsdWUoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCA+PSAweEQ4MDAgJiYgY29kZVBvaW50IDw9IDB4REZGRikge1xuXHRcdFx0dGhyb3cgRXJyb3IoXG5cdFx0XHRcdCdMb25lIHN1cnJvZ2F0ZSBVKycgKyBjb2RlUG9pbnQudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkgK1xuXHRcdFx0XHQnIGlzIG5vdCBhIHNjYWxhciB2YWx1ZSdcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZUJ5dGUoY29kZVBvaW50LCBzaGlmdCkge1xuXHRcdHJldHVybiBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gc2hpZnQpICYgMHgzRikgfCAweDgwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpIHtcblx0XHRpZiAoKGNvZGVQb2ludCAmIDB4RkZGRkZGODApID09IDApIHsgLy8gMS1ieXRlIHNlcXVlbmNlXG5cdFx0XHRyZXR1cm4gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdHZhciBzeW1ib2wgPSAnJztcblx0XHRpZiAoKGNvZGVQb2ludCAmIDB4RkZGRkY4MDApID09IDApIHsgLy8gMi1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gNikgJiAweDFGKSB8IDB4QzApO1xuXHRcdH1cblx0XHRlbHNlIGlmICgoY29kZVBvaW50ICYgMHhGRkZGMDAwMCkgPT0gMCkgeyAvLyAzLWJ5dGUgc2VxdWVuY2Vcblx0XHRcdGNoZWNrU2NhbGFyVmFsdWUoY29kZVBvaW50KTtcblx0XHRcdHN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZSgoKGNvZGVQb2ludCA+PiAxMikgJiAweDBGKSB8IDB4RTApO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCA2KTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoKGNvZGVQb2ludCAmIDB4RkZFMDAwMDApID09IDApIHsgLy8gNC1ieXRlIHNlcXVlbmNlXG5cdFx0XHRzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoKChjb2RlUG9pbnQgPj4gMTgpICYgMHgwNykgfCAweEYwKTtcblx0XHRcdHN5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwgMTIpO1xuXHRcdFx0c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LCA2KTtcblx0XHR9XG5cdFx0c3ltYm9sICs9IHN0cmluZ0Zyb21DaGFyQ29kZSgoY29kZVBvaW50ICYgMHgzRikgfCAweDgwKTtcblx0XHRyZXR1cm4gc3ltYm9sO1xuXHR9XG5cblx0ZnVuY3Rpb24gdXRmOGVuY29kZShzdHJpbmcpIHtcblx0XHR2YXIgY29kZVBvaW50cyA9IHVjczJkZWNvZGUoc3RyaW5nKTtcblx0XHR2YXIgbGVuZ3RoID0gY29kZVBvaW50cy5sZW5ndGg7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIGNvZGVQb2ludDtcblx0XHR2YXIgYnl0ZVN0cmluZyA9ICcnO1xuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHRjb2RlUG9pbnQgPSBjb2RlUG9pbnRzW2luZGV4XTtcblx0XHRcdGJ5dGVTdHJpbmcgKz0gZW5jb2RlQ29kZVBvaW50KGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdHJldHVybiBieXRlU3RyaW5nO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0ZnVuY3Rpb24gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKSB7XG5cdFx0aWYgKGJ5dGVJbmRleCA+PSBieXRlQ291bnQpIHtcblx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTtcblx0XHR9XG5cblx0XHR2YXIgY29udGludWF0aW9uQnl0ZSA9IGJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtcblx0XHRieXRlSW5kZXgrKztcblxuXHRcdGlmICgoY29udGludWF0aW9uQnl0ZSAmIDB4QzApID09IDB4ODApIHtcblx0XHRcdHJldHVybiBjb250aW51YXRpb25CeXRlICYgMHgzRjtcblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBlbmQgdXAgaGVyZSwgaXTigJlzIG5vdCBhIGNvbnRpbnVhdGlvbiBieXRlXG5cdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZVN5bWJvbCgpIHtcblx0XHR2YXIgYnl0ZTE7XG5cdFx0dmFyIGJ5dGUyO1xuXHRcdHZhciBieXRlMztcblx0XHR2YXIgYnl0ZTQ7XG5cdFx0dmFyIGNvZGVQb2ludDtcblxuXHRcdGlmIChieXRlSW5kZXggPiBieXRlQ291bnQpIHtcblx0XHRcdHRocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTtcblx0XHR9XG5cblx0XHRpZiAoYnl0ZUluZGV4ID09IGJ5dGVDb3VudCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIFJlYWQgZmlyc3QgYnl0ZVxuXHRcdGJ5dGUxID0gYnl0ZUFycmF5W2J5dGVJbmRleF0gJiAweEZGO1xuXHRcdGJ5dGVJbmRleCsrO1xuXG5cdFx0Ly8gMS1ieXRlIHNlcXVlbmNlIChubyBjb250aW51YXRpb24gYnl0ZXMpXG5cdFx0aWYgKChieXRlMSAmIDB4ODApID09IDApIHtcblx0XHRcdHJldHVybiBieXRlMTtcblx0XHR9XG5cblx0XHQvLyAyLWJ5dGUgc2VxdWVuY2Vcblx0XHRpZiAoKGJ5dGUxICYgMHhFMCkgPT0gMHhDMCkge1xuXHRcdFx0dmFyIGJ5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtcblx0XHRcdGNvZGVQb2ludCA9ICgoYnl0ZTEgJiAweDFGKSA8PCA2KSB8IGJ5dGUyO1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDgwKSB7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDMtYnl0ZSBzZXF1ZW5jZSAobWF5IGluY2x1ZGUgdW5wYWlyZWQgc3Vycm9nYXRlcylcblx0XHRpZiAoKGJ5dGUxICYgMHhGMCkgPT0gMHhFMCkge1xuXHRcdFx0Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MEYpIDw8IDEyKSB8IChieXRlMiA8PCA2KSB8IGJ5dGUzO1xuXHRcdFx0aWYgKGNvZGVQb2ludCA+PSAweDA4MDApIHtcblx0XHRcdFx0Y2hlY2tTY2FsYXJWYWx1ZShjb2RlUG9pbnQpO1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyA0LWJ5dGUgc2VxdWVuY2Vcblx0XHRpZiAoKGJ5dGUxICYgMHhGOCkgPT0gMHhGMCkge1xuXHRcdFx0Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Ynl0ZTQgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO1xuXHRcdFx0Y29kZVBvaW50ID0gKChieXRlMSAmIDB4MEYpIDw8IDB4MTIpIHwgKGJ5dGUyIDw8IDB4MEMpIHxcblx0XHRcdFx0KGJ5dGUzIDw8IDB4MDYpIHwgYnl0ZTQ7XG5cdFx0XHRpZiAoY29kZVBvaW50ID49IDB4MDEwMDAwICYmIGNvZGVQb2ludCA8PSAweDEwRkZGRikge1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRocm93IEVycm9yKCdJbnZhbGlkIFVURi04IGRldGVjdGVkJyk7XG5cdH1cblxuXHR2YXIgYnl0ZUFycmF5O1xuXHR2YXIgYnl0ZUNvdW50O1xuXHR2YXIgYnl0ZUluZGV4O1xuXHRmdW5jdGlvbiB1dGY4ZGVjb2RlKGJ5dGVTdHJpbmcpIHtcblx0XHRieXRlQXJyYXkgPSB1Y3MyZGVjb2RlKGJ5dGVTdHJpbmcpO1xuXHRcdGJ5dGVDb3VudCA9IGJ5dGVBcnJheS5sZW5ndGg7XG5cdFx0Ynl0ZUluZGV4ID0gMDtcblx0XHR2YXIgY29kZVBvaW50cyA9IFtdO1xuXHRcdHZhciB0bXA7XG5cdFx0d2hpbGUgKCh0bXAgPSBkZWNvZGVTeW1ib2woKSkgIT09IGZhbHNlKSB7XG5cdFx0XHRjb2RlUG9pbnRzLnB1c2godG1wKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVjczJlbmNvZGUoY29kZVBvaW50cyk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgdXRmOCA9IHtcblx0XHQndmVyc2lvbic6ICcyLjAuMCcsXG5cdFx0J2VuY29kZSc6IHV0ZjhlbmNvZGUsXG5cdFx0J2RlY29kZSc6IHV0ZjhkZWNvZGVcblx0fTtcblxuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB1dGY4O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gdXRmODtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0dmFyIG9iamVjdCA9IHt9O1xuXHRcdFx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0Lmhhc093blByb3BlcnR5O1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHV0ZjgpIHtcblx0XHRcdFx0aGFzT3duUHJvcGVydHkuY2FsbCh1dGY4LCBrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gdXRmOFtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnV0ZjggPSB1dGY4O1xuXHR9XG5cbn0odGhpcykpO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICpcbiAqIExvZ2ljIGJvcnJvd2VkIGZyb20gTW9kZXJuaXpyOlxuICpcbiAqICAgLSBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9ibG9iL21hc3Rlci9mZWF0dXJlLWRldGVjdHMvY29ycy5qc1xuICovXG5cbnRyeSB7XG4gIG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICd3aXRoQ3JlZGVudGlhbHMnIGluIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xufSBjYXRjaCAoZXJyKSB7XG4gIC8vIGlmIFhNTEh0dHAgc3VwcG9ydCBpcyBkaXNhYmxlZCBpbiBJRSB0aGVuIGl0IHdpbGwgdGhyb3dcbiAgLy8gd2hlbiB0cnlpbmcgdG8gY3JlYXRlXG4gIG1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG59XG4iLCIvKipcbiAqIEpTT04gcGFyc2UuXG4gKlxuICogQHNlZSBCYXNlZCBvbiBqUXVlcnkjcGFyc2VKU09OIChNSVQpIGFuZCBKU09OMlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHJ2YWxpZGNoYXJzID0gL15bXFxdLDp7fVxcc10qJC87XG52YXIgcnZhbGlkZXNjYXBlID0gL1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbMC05YS1mQS1GXXs0fSkvZztcbnZhciBydmFsaWR0b2tlbnMgPSAvXCJbXlwiXFxcXFxcblxccl0qXCJ8dHJ1ZXxmYWxzZXxudWxsfC0/XFxkKyg/OlxcLlxcZCopPyg/OltlRV1bK1xcLV0/XFxkKyk/L2c7XG52YXIgcnZhbGlkYnJhY2VzID0gLyg/Ol58OnwsKSg/OlxccypcXFspKy9nO1xudmFyIHJ0cmltTGVmdCA9IC9eXFxzKy87XG52YXIgcnRyaW1SaWdodCA9IC9cXHMrJC87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2Vqc29uKGRhdGEpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBkYXRhIHx8ICFkYXRhKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkYXRhID0gZGF0YS5yZXBsYWNlKHJ0cmltTGVmdCwgJycpLnJlcGxhY2UocnRyaW1SaWdodCwgJycpO1xuXG4gIC8vIEF0dGVtcHQgdG8gcGFyc2UgdXNpbmcgdGhlIG5hdGl2ZSBKU09OIHBhcnNlciBmaXJzdFxuICBpZiAoZ2xvYmFsLkpTT04gJiYgSlNPTi5wYXJzZSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICB9XG5cbiAgaWYgKHJ2YWxpZGNoYXJzLnRlc3QoZGF0YS5yZXBsYWNlKHJ2YWxpZGVzY2FwZSwgJ0AnKVxuICAgICAgLnJlcGxhY2UocnZhbGlkdG9rZW5zLCAnXScpXG4gICAgICAucmVwbGFjZShydmFsaWRicmFjZXMsICcnKSkpIHtcbiAgICByZXR1cm4gKG5ldyBGdW5jdGlvbigncmV0dXJuICcgKyBkYXRhKSkoKTtcbiAgfVxufTsiLCIvKipcbiAqIENvbXBpbGVzIGEgcXVlcnlzdHJpbmdcbiAqIFJldHVybnMgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgc3RyID0gJyc7XG5cbiAgZm9yICh2YXIgaSBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICBpZiAoc3RyLmxlbmd0aCkgc3RyICs9ICcmJztcbiAgICAgIHN0ciArPSBlbmNvZGVVUklDb21wb25lbnQoaSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2ldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyO1xufTtcblxuLyoqXG4gKiBQYXJzZXMgYSBzaW1wbGUgcXVlcnlzdHJpbmcgaW50byBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuZGVjb2RlID0gZnVuY3Rpb24ocXMpe1xuICB2YXIgcXJ5ID0ge307XG4gIHZhciBwYWlycyA9IHFzLnNwbGl0KCcmJyk7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGFpcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIHBhaXIgPSBwYWlyc1tpXS5zcGxpdCgnPScpO1xuICAgIHFyeVtkZWNvZGVVUklDb21wb25lbnQocGFpclswXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pO1xuICB9XG4gIHJldHVybiBxcnk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWxwaGFiZXQgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXotXycuc3BsaXQoJycpXG4gICwgbGVuZ3RoID0gNjRcbiAgLCBtYXAgPSB7fVxuICAsIHNlZWQgPSAwXG4gICwgaSA9IDBcbiAgLCBwcmV2O1xuXG4vKipcbiAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHNwZWNpZmllZCBudW1iZXIuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG51bSBUaGUgbnVtYmVyIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBudW1iZXIuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBlbmNvZGUobnVtKSB7XG4gIHZhciBlbmNvZGVkID0gJyc7XG5cbiAgZG8ge1xuICAgIGVuY29kZWQgPSBhbHBoYWJldFtudW0gJSBsZW5ndGhdICsgZW5jb2RlZDtcbiAgICBudW0gPSBNYXRoLmZsb29yKG51bSAvIGxlbmd0aCk7XG4gIH0gd2hpbGUgKG51bSA+IDApO1xuXG4gIHJldHVybiBlbmNvZGVkO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgaW50ZWdlciB2YWx1ZSBzcGVjaWZpZWQgYnkgdGhlIGdpdmVuIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBpbnRlZ2VyIHZhbHVlIHJlcHJlc2VudGVkIGJ5IHRoZSBzdHJpbmcuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBkZWNvZGUoc3RyKSB7XG4gIHZhciBkZWNvZGVkID0gMDtcblxuICBmb3IgKGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgZGVjb2RlZCA9IGRlY29kZWQgKiBsZW5ndGggKyBtYXBbc3RyLmNoYXJBdChpKV07XG4gIH1cblxuICByZXR1cm4gZGVjb2RlZDtcbn1cblxuLyoqXG4gKiBZZWFzdDogQSB0aW55IGdyb3dpbmcgaWQgZ2VuZXJhdG9yLlxuICpcbiAqIEByZXR1cm5zIHtTdHJpbmd9IEEgdW5pcXVlIGlkLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24geWVhc3QoKSB7XG4gIHZhciBub3cgPSBlbmNvZGUoK25ldyBEYXRlKCkpO1xuXG4gIGlmIChub3cgIT09IHByZXYpIHJldHVybiBzZWVkID0gMCwgcHJldiA9IG5vdztcbiAgcmV0dXJuIG5vdyArJy4nKyBlbmNvZGUoc2VlZCsrKTtcbn1cblxuLy9cbi8vIE1hcCBlYWNoIGNoYXJhY3RlciB0byBpdHMgaW5kZXguXG4vL1xuZm9yICg7IGkgPCBsZW5ndGg7IGkrKykgbWFwW2FscGhhYmV0W2ldXSA9IGk7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIGB5ZWFzdGAsIGBlbmNvZGVgIGFuZCBgZGVjb2RlYCBmdW5jdGlvbnMuXG4vL1xueWVhc3QuZW5jb2RlID0gZW5jb2RlO1xueWVhc3QuZGVjb2RlID0gZGVjb2RlO1xubW9kdWxlLmV4cG9ydHMgPSB5ZWFzdDtcbiIsIlxuLypcbiAqIE1vZHVsZSByZXF1aXJlbWVudHMuXG4gKi9cblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5Jyk7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNCaW5hcnk7XG5cbi8qKlxuICogQ2hlY2tzIGZvciBiaW5hcnkgZGF0YS5cbiAqXG4gKiBSaWdodCBub3cgb25seSBCdWZmZXIgYW5kIEFycmF5QnVmZmVyIGFyZSBzdXBwb3J0ZWQuLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbnl0aGluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBoYXNCaW5hcnkoZGF0YSkge1xuXG4gIGZ1bmN0aW9uIF9oYXNCaW5hcnkob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBmYWxzZTtcblxuICAgIGlmICggKGdsb2JhbC5CdWZmZXIgJiYgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlciAmJiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyKG9iaikpIHx8XG4gICAgICAgICAoZ2xvYmFsLkFycmF5QnVmZmVyICYmIG9iaiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fFxuICAgICAgICAgKGdsb2JhbC5CbG9iICYmIG9iaiBpbnN0YW5jZW9mIEJsb2IpIHx8XG4gICAgICAgICAoZ2xvYmFsLkZpbGUgJiYgb2JqIGluc3RhbmNlb2YgRmlsZSlcbiAgICAgICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChfaGFzQmluYXJ5KG9ialtpXSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2JqICYmICdvYmplY3QnID09IHR5cGVvZiBvYmopIHtcbiAgICAgIC8vIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0F1dG9tYXR0aWMvaGFzLWJpbmFyeS9wdWxsLzRcbiAgICAgIGlmIChvYmoudG9KU09OICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG9iai50b0pTT04pIHtcbiAgICAgICAgb2JqID0gb2JqLnRvSlNPTigpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpICYmIF9oYXNCaW5hcnkob2JqW2tleV0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gX2hhc0JpbmFyeShkYXRhKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIlxudmFyIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCIvKipcbiAqIFBhcnNlcyBhbiBVUklcbiAqXG4gKiBAYXV0aG9yIFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPiAoTUlUIGxpY2Vuc2UpXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgcmUgPSAvXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShodHRwfGh0dHBzfHdzfHdzcyk6XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPygoPzpbYS1mMC05XXswLDR9Oil7Miw3fVthLWYwLTldezAsNH18W146XFwvPyNdKikoPzo6KFxcZCopKT8pKCgoXFwvKD86W14/I10oPyFbXj8jXFwvXSpcXC5bXj8jXFwvLl0rKD86Wz8jXXwkKSkpKlxcLz8pPyhbXj8jXFwvXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLztcblxudmFyIHBhcnRzID0gW1xuICAgICdzb3VyY2UnLCAncHJvdG9jb2wnLCAnYXV0aG9yaXR5JywgJ3VzZXJJbmZvJywgJ3VzZXInLCAncGFzc3dvcmQnLCAnaG9zdCcsICdwb3J0JywgJ3JlbGF0aXZlJywgJ3BhdGgnLCAnZGlyZWN0b3J5JywgJ2ZpbGUnLCAncXVlcnknLCAnYW5jaG9yJ1xuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZXVyaShzdHIpIHtcbiAgICB2YXIgc3JjID0gc3RyLFxuICAgICAgICBiID0gc3RyLmluZGV4T2YoJ1snKSxcbiAgICAgICAgZSA9IHN0ci5pbmRleE9mKCddJyk7XG5cbiAgICBpZiAoYiAhPSAtMSAmJiBlICE9IC0xKSB7XG4gICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgYikgKyBzdHIuc3Vic3RyaW5nKGIsIGUpLnJlcGxhY2UoLzovZywgJzsnKSArIHN0ci5zdWJzdHJpbmcoZSwgc3RyLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgdmFyIG0gPSByZS5leGVjKHN0ciB8fCAnJyksXG4gICAgICAgIHVyaSA9IHt9LFxuICAgICAgICBpID0gMTQ7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHVyaVtwYXJ0c1tpXV0gPSBtW2ldIHx8ICcnO1xuICAgIH1cblxuICAgIGlmIChiICE9IC0xICYmIGUgIT0gLTEpIHtcbiAgICAgICAgdXJpLnNvdXJjZSA9IHNyYztcbiAgICAgICAgdXJpLmhvc3QgPSB1cmkuaG9zdC5zdWJzdHJpbmcoMSwgdXJpLmhvc3QubGVuZ3RoIC0gMSkucmVwbGFjZSgvOy9nLCAnOicpO1xuICAgICAgICB1cmkuYXV0aG9yaXR5ID0gdXJpLmF1dGhvcml0eS5yZXBsYWNlKCdbJywgJycpLnJlcGxhY2UoJ10nLCAnJykucmVwbGFjZSgvOy9nLCAnOicpO1xuICAgICAgICB1cmkuaXB2NnVyaSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVyaTtcbn07XG4iLCIvKmdsb2JhbCBCbG9iLEZpbGUqL1xuXG4vKipcbiAqIE1vZHVsZSByZXF1aXJlbWVudHNcbiAqL1xuXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKTtcbnZhciBpc0J1ZiA9IHJlcXVpcmUoJy4vaXMtYnVmZmVyJyk7XG5cbi8qKlxuICogUmVwbGFjZXMgZXZlcnkgQnVmZmVyIHwgQXJyYXlCdWZmZXIgaW4gcGFja2V0IHdpdGggYSBudW1iZXJlZCBwbGFjZWhvbGRlci5cbiAqIEFueXRoaW5nIHdpdGggYmxvYnMgb3IgZmlsZXMgc2hvdWxkIGJlIGZlZCB0aHJvdWdoIHJlbW92ZUJsb2JzIGJlZm9yZSBjb21pbmdcbiAqIGhlcmUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldCAtIHNvY2tldC5pbyBldmVudCBwYWNrZXRcbiAqIEByZXR1cm4ge09iamVjdH0gd2l0aCBkZWNvbnN0cnVjdGVkIHBhY2tldCBhbmQgbGlzdCBvZiBidWZmZXJzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuZGVjb25zdHJ1Y3RQYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe1xuICB2YXIgYnVmZmVycyA9IFtdO1xuICB2YXIgcGFja2V0RGF0YSA9IHBhY2tldC5kYXRhO1xuXG4gIGZ1bmN0aW9uIF9kZWNvbnN0cnVjdFBhY2tldChkYXRhKSB7XG4gICAgaWYgKCFkYXRhKSByZXR1cm4gZGF0YTtcblxuICAgIGlmIChpc0J1ZihkYXRhKSkge1xuICAgICAgdmFyIHBsYWNlaG9sZGVyID0geyBfcGxhY2Vob2xkZXI6IHRydWUsIG51bTogYnVmZmVycy5sZW5ndGggfTtcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhKTtcbiAgICAgIHJldHVybiBwbGFjZWhvbGRlcjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIHZhciBuZXdEYXRhID0gbmV3IEFycmF5KGRhdGEubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBuZXdEYXRhW2ldID0gX2RlY29uc3RydWN0UGFja2V0KGRhdGFbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0RhdGE7XG4gICAgfSBlbHNlIGlmICgnb2JqZWN0JyA9PSB0eXBlb2YgZGF0YSAmJiAhKGRhdGEgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgdmFyIG5ld0RhdGEgPSB7fTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgIG5ld0RhdGFba2V5XSA9IF9kZWNvbnN0cnVjdFBhY2tldChkYXRhW2tleV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0RhdGE7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgdmFyIHBhY2sgPSBwYWNrZXQ7XG4gIHBhY2suZGF0YSA9IF9kZWNvbnN0cnVjdFBhY2tldChwYWNrZXREYXRhKTtcbiAgcGFjay5hdHRhY2htZW50cyA9IGJ1ZmZlcnMubGVuZ3RoOyAvLyBudW1iZXIgb2YgYmluYXJ5ICdhdHRhY2htZW50cydcbiAgcmV0dXJuIHtwYWNrZXQ6IHBhY2ssIGJ1ZmZlcnM6IGJ1ZmZlcnN9O1xufTtcblxuLyoqXG4gKiBSZWNvbnN0cnVjdHMgYSBiaW5hcnkgcGFja2V0IGZyb20gaXRzIHBsYWNlaG9sZGVyIHBhY2tldCBhbmQgYnVmZmVyc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXQgLSBldmVudCBwYWNrZXQgd2l0aCBwbGFjZWhvbGRlcnNcbiAqIEBwYXJhbSB7QXJyYXl9IGJ1ZmZlcnMgLSBiaW5hcnkgYnVmZmVycyB0byBwdXQgaW4gcGxhY2Vob2xkZXIgcG9zaXRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9IHJlY29uc3RydWN0ZWQgcGFja2V0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucmVjb25zdHJ1Y3RQYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQsIGJ1ZmZlcnMpIHtcbiAgdmFyIGN1clBsYWNlSG9sZGVyID0gMDtcblxuICBmdW5jdGlvbiBfcmVjb25zdHJ1Y3RQYWNrZXQoZGF0YSkge1xuICAgIGlmIChkYXRhICYmIGRhdGEuX3BsYWNlaG9sZGVyKSB7XG4gICAgICB2YXIgYnVmID0gYnVmZmVyc1tkYXRhLm51bV07IC8vIGFwcHJvcHJpYXRlIGJ1ZmZlciAoc2hvdWxkIGJlIG5hdHVyYWwgb3JkZXIgYW55d2F5KVxuICAgICAgcmV0dXJuIGJ1ZjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBkYXRhW2ldID0gX3JlY29uc3RydWN0UGFja2V0KGRhdGFbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSBlbHNlIGlmIChkYXRhICYmICdvYmplY3QnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICBkYXRhW2tleV0gPSBfcmVjb25zdHJ1Y3RQYWNrZXQoZGF0YVtrZXldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIHBhY2tldC5kYXRhID0gX3JlY29uc3RydWN0UGFja2V0KHBhY2tldC5kYXRhKTtcbiAgcGFja2V0LmF0dGFjaG1lbnRzID0gdW5kZWZpbmVkOyAvLyBubyBsb25nZXIgdXNlZnVsXG4gIHJldHVybiBwYWNrZXQ7XG59O1xuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IHJlbW92ZXMgQmxvYnMgb3IgRmlsZXMgZnJvbSBkYXRhIHZpYVxuICogRmlsZVJlYWRlcidzIHJlYWRBc0FycmF5QnVmZmVyIG1ldGhvZC4gVXNlZCBiZWZvcmUgZW5jb2RpbmdcbiAqIGRhdGEgYXMgbXNncGFjay4gQ2FsbHMgY2FsbGJhY2sgd2l0aCB0aGUgYmxvYmxlc3MgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmVtb3ZlQmxvYnMgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICBmdW5jdGlvbiBfcmVtb3ZlQmxvYnMob2JqLCBjdXJLZXksIGNvbnRhaW5pbmdPYmplY3QpIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIG9iajtcblxuICAgIC8vIGNvbnZlcnQgYW55IGJsb2JcbiAgICBpZiAoKGdsb2JhbC5CbG9iICYmIG9iaiBpbnN0YW5jZW9mIEJsb2IpIHx8XG4gICAgICAgIChnbG9iYWwuRmlsZSAmJiBvYmogaW5zdGFuY2VvZiBGaWxlKSkge1xuICAgICAgcGVuZGluZ0Jsb2JzKys7XG5cbiAgICAgIC8vIGFzeW5jIGZpbGVyZWFkZXJcbiAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vIHRoaXMucmVzdWx0ID09IGFycmF5YnVmZmVyXG4gICAgICAgIGlmIChjb250YWluaW5nT2JqZWN0KSB7XG4gICAgICAgICAgY29udGFpbmluZ09iamVjdFtjdXJLZXldID0gdGhpcy5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYmxvYmxlc3NEYXRhID0gdGhpcy5yZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBub3RoaW5nIHBlbmRpbmcgaXRzIGNhbGxiYWNrIHRpbWVcbiAgICAgICAgaWYoISAtLXBlbmRpbmdCbG9icykge1xuICAgICAgICAgIGNhbGxiYWNrKGJsb2JsZXNzRGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIob2JqKTsgLy8gYmxvYiAtPiBhcnJheWJ1ZmZlclxuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7IC8vIGhhbmRsZSBhcnJheVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgX3JlbW92ZUJsb2JzKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9iaiAmJiAnb2JqZWN0JyA9PSB0eXBlb2Ygb2JqICYmICFpc0J1ZihvYmopKSB7IC8vIGFuZCBvYmplY3RcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgX3JlbW92ZUJsb2JzKG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHBlbmRpbmdCbG9icyA9IDA7XG4gIHZhciBibG9ibGVzc0RhdGEgPSBkYXRhO1xuICBfcmVtb3ZlQmxvYnMoYmxvYmxlc3NEYXRhKTtcbiAgaWYgKCFwZW5kaW5nQmxvYnMpIHtcbiAgICBjYWxsYmFjayhibG9ibGVzc0RhdGEpO1xuICB9XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2V0LmlvLXBhcnNlcicpO1xudmFyIGpzb24gPSByZXF1aXJlKCdqc29uMycpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5Jyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG52YXIgYmluYXJ5ID0gcmVxdWlyZSgnLi9iaW5hcnknKTtcbnZhciBpc0J1ZiA9IHJlcXVpcmUoJy4vaXMtYnVmZmVyJyk7XG5cbi8qKlxuICogUHJvdG9jb2wgdmVyc2lvbi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucHJvdG9jb2wgPSA0O1xuXG4vKipcbiAqIFBhY2tldCB0eXBlcy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudHlwZXMgPSBbXG4gICdDT05ORUNUJyxcbiAgJ0RJU0NPTk5FQ1QnLFxuICAnRVZFTlQnLFxuICAnQUNLJyxcbiAgJ0VSUk9SJyxcbiAgJ0JJTkFSWV9FVkVOVCcsXG4gICdCSU5BUllfQUNLJ1xuXTtcblxuLyoqXG4gKiBQYWNrZXQgdHlwZSBgY29ubmVjdGAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLkNPTk5FQ1QgPSAwO1xuXG4vKipcbiAqIFBhY2tldCB0eXBlIGBkaXNjb25uZWN0YC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuRElTQ09OTkVDVCA9IDE7XG5cbi8qKlxuICogUGFja2V0IHR5cGUgYGV2ZW50YC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuRVZFTlQgPSAyO1xuXG4vKipcbiAqIFBhY2tldCB0eXBlIGBhY2tgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5BQ0sgPSAzO1xuXG4vKipcbiAqIFBhY2tldCB0eXBlIGBlcnJvcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLkVSUk9SID0gNDtcblxuLyoqXG4gKiBQYWNrZXQgdHlwZSAnYmluYXJ5IGV2ZW50J1xuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5CSU5BUllfRVZFTlQgPSA1O1xuXG4vKipcbiAqIFBhY2tldCB0eXBlIGBiaW5hcnkgYWNrYC4gRm9yIGFja3Mgd2l0aCBiaW5hcnkgYXJndW1lbnRzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5CSU5BUllfQUNLID0gNjtcblxuLyoqXG4gKiBFbmNvZGVyIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5FbmNvZGVyID0gRW5jb2RlcjtcblxuLyoqXG4gKiBEZWNvZGVyIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5EZWNvZGVyID0gRGVjb2RlcjtcblxuLyoqXG4gKiBBIHNvY2tldC5pbyBFbmNvZGVyIGluc3RhbmNlXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbmNvZGVyKCkge31cblxuLyoqXG4gKiBFbmNvZGUgYSBwYWNrZXQgYXMgYSBzaW5nbGUgc3RyaW5nIGlmIG5vbi1iaW5hcnksIG9yIGFzIGFcbiAqIGJ1ZmZlciBzZXF1ZW5jZSwgZGVwZW5kaW5nIG9uIHBhY2tldCB0eXBlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBwYWNrZXQgb2JqZWN0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIGZ1bmN0aW9uIHRvIGhhbmRsZSBlbmNvZGluZ3MgKGxpa2VseSBlbmdpbmUud3JpdGUpXG4gKiBAcmV0dXJuIENhbGxzIGNhbGxiYWNrIHdpdGggQXJyYXkgb2YgZW5jb2RpbmdzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKG9iaiwgY2FsbGJhY2spe1xuICBkZWJ1ZygnZW5jb2RpbmcgcGFja2V0ICVqJywgb2JqKTtcblxuICBpZiAoZXhwb3J0cy5CSU5BUllfRVZFTlQgPT0gb2JqLnR5cGUgfHwgZXhwb3J0cy5CSU5BUllfQUNLID09IG9iai50eXBlKSB7XG4gICAgZW5jb2RlQXNCaW5hcnkob2JqLCBjYWxsYmFjayk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIGVuY29kaW5nID0gZW5jb2RlQXNTdHJpbmcob2JqKTtcbiAgICBjYWxsYmFjayhbZW5jb2RpbmddKTtcbiAgfVxufTtcblxuLyoqXG4gKiBFbmNvZGUgcGFja2V0IGFzIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAcmV0dXJuIHtTdHJpbmd9IGVuY29kZWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGVuY29kZUFzU3RyaW5nKG9iaikge1xuICB2YXIgc3RyID0gJyc7XG4gIHZhciBuc3AgPSBmYWxzZTtcblxuICAvLyBmaXJzdCBpcyB0eXBlXG4gIHN0ciArPSBvYmoudHlwZTtcblxuICAvLyBhdHRhY2htZW50cyBpZiB3ZSBoYXZlIHRoZW1cbiAgaWYgKGV4cG9ydHMuQklOQVJZX0VWRU5UID09IG9iai50eXBlIHx8IGV4cG9ydHMuQklOQVJZX0FDSyA9PSBvYmoudHlwZSkge1xuICAgIHN0ciArPSBvYmouYXR0YWNobWVudHM7XG4gICAgc3RyICs9ICctJztcbiAgfVxuXG4gIC8vIGlmIHdlIGhhdmUgYSBuYW1lc3BhY2Ugb3RoZXIgdGhhbiBgL2BcbiAgLy8gd2UgYXBwZW5kIGl0IGZvbGxvd2VkIGJ5IGEgY29tbWEgYCxgXG4gIGlmIChvYmoubnNwICYmICcvJyAhPSBvYmoubnNwKSB7XG4gICAgbnNwID0gdHJ1ZTtcbiAgICBzdHIgKz0gb2JqLm5zcDtcbiAgfVxuXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IHRoZSBpZFxuICBpZiAobnVsbCAhPSBvYmouaWQpIHtcbiAgICBpZiAobnNwKSB7XG4gICAgICBzdHIgKz0gJywnO1xuICAgICAgbnNwID0gZmFsc2U7XG4gICAgfVxuICAgIHN0ciArPSBvYmouaWQ7XG4gIH1cblxuICAvLyBqc29uIGRhdGFcbiAgaWYgKG51bGwgIT0gb2JqLmRhdGEpIHtcbiAgICBpZiAobnNwKSBzdHIgKz0gJywnO1xuICAgIHN0ciArPSBqc29uLnN0cmluZ2lmeShvYmouZGF0YSk7XG4gIH1cblxuICBkZWJ1ZygnZW5jb2RlZCAlaiBhcyAlcycsIG9iaiwgc3RyKTtcbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBFbmNvZGUgcGFja2V0IGFzICdidWZmZXIgc2VxdWVuY2UnIGJ5IHJlbW92aW5nIGJsb2JzLCBhbmRcbiAqIGRlY29uc3RydWN0aW5nIHBhY2tldCBpbnRvIG9iamVjdCB3aXRoIHBsYWNlaG9sZGVycyBhbmRcbiAqIGEgbGlzdCBvZiBidWZmZXJzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAqIEByZXR1cm4ge0J1ZmZlcn0gZW5jb2RlZFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZW5jb2RlQXNCaW5hcnkob2JqLCBjYWxsYmFjaykge1xuXG4gIGZ1bmN0aW9uIHdyaXRlRW5jb2RpbmcoYmxvYmxlc3NEYXRhKSB7XG4gICAgdmFyIGRlY29uc3RydWN0aW9uID0gYmluYXJ5LmRlY29uc3RydWN0UGFja2V0KGJsb2JsZXNzRGF0YSk7XG4gICAgdmFyIHBhY2sgPSBlbmNvZGVBc1N0cmluZyhkZWNvbnN0cnVjdGlvbi5wYWNrZXQpO1xuICAgIHZhciBidWZmZXJzID0gZGVjb25zdHJ1Y3Rpb24uYnVmZmVycztcblxuICAgIGJ1ZmZlcnMudW5zaGlmdChwYWNrKTsgLy8gYWRkIHBhY2tldCBpbmZvIHRvIGJlZ2lubmluZyBvZiBkYXRhIGxpc3RcbiAgICBjYWxsYmFjayhidWZmZXJzKTsgLy8gd3JpdGUgYWxsIHRoZSBidWZmZXJzXG4gIH1cblxuICBiaW5hcnkucmVtb3ZlQmxvYnMob2JqLCB3cml0ZUVuY29kaW5nKTtcbn1cblxuLyoqXG4gKiBBIHNvY2tldC5pbyBEZWNvZGVyIGluc3RhbmNlXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBkZWNvZGVyXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIERlY29kZXIoKSB7XG4gIHRoaXMucmVjb25zdHJ1Y3RvciA9IG51bGw7XG59XG5cbi8qKlxuICogTWl4IGluIGBFbWl0dGVyYCB3aXRoIERlY29kZXIuXG4gKi9cblxuRW1pdHRlcihEZWNvZGVyLnByb3RvdHlwZSk7XG5cbi8qKlxuICogRGVjb2RlcyBhbiBlY29kZWQgcGFja2V0IHN0cmluZyBpbnRvIHBhY2tldCBKU09OLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBvYmogLSBlbmNvZGVkIHBhY2tldFxuICogQHJldHVybiB7T2JqZWN0fSBwYWNrZXRcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRGVjb2Rlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBwYWNrZXQ7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygb2JqKSB7XG4gICAgcGFja2V0ID0gZGVjb2RlU3RyaW5nKG9iaik7XG4gICAgaWYgKGV4cG9ydHMuQklOQVJZX0VWRU5UID09IHBhY2tldC50eXBlIHx8IGV4cG9ydHMuQklOQVJZX0FDSyA9PSBwYWNrZXQudHlwZSkgeyAvLyBiaW5hcnkgcGFja2V0J3MganNvblxuICAgICAgdGhpcy5yZWNvbnN0cnVjdG9yID0gbmV3IEJpbmFyeVJlY29uc3RydWN0b3IocGFja2V0KTtcblxuICAgICAgLy8gbm8gYXR0YWNobWVudHMsIGxhYmVsZWQgYmluYXJ5IGJ1dCBubyBiaW5hcnkgZGF0YSB0byBmb2xsb3dcbiAgICAgIGlmICh0aGlzLnJlY29uc3RydWN0b3IucmVjb25QYWNrLmF0dGFjaG1lbnRzID09PSAwKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZGVjb2RlZCcsIHBhY2tldCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHsgLy8gbm9uLWJpbmFyeSBmdWxsIHBhY2tldFxuICAgICAgdGhpcy5lbWl0KCdkZWNvZGVkJywgcGFja2V0KTtcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAoaXNCdWYob2JqKSB8fCBvYmouYmFzZTY0KSB7IC8vIHJhdyBiaW5hcnkgZGF0YVxuICAgIGlmICghdGhpcy5yZWNvbnN0cnVjdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dvdCBiaW5hcnkgZGF0YSB3aGVuIG5vdCByZWNvbnN0cnVjdGluZyBhIHBhY2tldCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYWNrZXQgPSB0aGlzLnJlY29uc3RydWN0b3IudGFrZUJpbmFyeURhdGEob2JqKTtcbiAgICAgIGlmIChwYWNrZXQpIHsgLy8gcmVjZWl2ZWQgZmluYWwgYnVmZmVyXG4gICAgICAgIHRoaXMucmVjb25zdHJ1Y3RvciA9IG51bGw7XG4gICAgICAgIHRoaXMuZW1pdCgnZGVjb2RlZCcsIHBhY2tldCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biB0eXBlOiAnICsgb2JqKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEZWNvZGUgYSBwYWNrZXQgU3RyaW5nIChKU09OIGRhdGEpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fSBwYWNrZXRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGRlY29kZVN0cmluZyhzdHIpIHtcbiAgdmFyIHAgPSB7fTtcbiAgdmFyIGkgPSAwO1xuXG4gIC8vIGxvb2sgdXAgdHlwZVxuICBwLnR5cGUgPSBOdW1iZXIoc3RyLmNoYXJBdCgwKSk7XG4gIGlmIChudWxsID09IGV4cG9ydHMudHlwZXNbcC50eXBlXSkgcmV0dXJuIGVycm9yKCk7XG5cbiAgLy8gbG9vayB1cCBhdHRhY2htZW50cyBpZiB0eXBlIGJpbmFyeVxuICBpZiAoZXhwb3J0cy5CSU5BUllfRVZFTlQgPT0gcC50eXBlIHx8IGV4cG9ydHMuQklOQVJZX0FDSyA9PSBwLnR5cGUpIHtcbiAgICB2YXIgYnVmID0gJyc7XG4gICAgd2hpbGUgKHN0ci5jaGFyQXQoKytpKSAhPSAnLScpIHtcbiAgICAgIGJ1ZiArPSBzdHIuY2hhckF0KGkpO1xuICAgICAgaWYgKGkgPT0gc3RyLmxlbmd0aCkgYnJlYWs7XG4gICAgfVxuICAgIGlmIChidWYgIT0gTnVtYmVyKGJ1ZikgfHwgc3RyLmNoYXJBdChpKSAhPSAnLScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBhdHRhY2htZW50cycpO1xuICAgIH1cbiAgICBwLmF0dGFjaG1lbnRzID0gTnVtYmVyKGJ1Zik7XG4gIH1cblxuICAvLyBsb29rIHVwIG5hbWVzcGFjZSAoaWYgYW55KVxuICBpZiAoJy8nID09IHN0ci5jaGFyQXQoaSArIDEpKSB7XG4gICAgcC5uc3AgPSAnJztcbiAgICB3aGlsZSAoKytpKSB7XG4gICAgICB2YXIgYyA9IHN0ci5jaGFyQXQoaSk7XG4gICAgICBpZiAoJywnID09IGMpIGJyZWFrO1xuICAgICAgcC5uc3AgKz0gYztcbiAgICAgIGlmIChpID09IHN0ci5sZW5ndGgpIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwLm5zcCA9ICcvJztcbiAgfVxuXG4gIC8vIGxvb2sgdXAgaWRcbiAgdmFyIG5leHQgPSBzdHIuY2hhckF0KGkgKyAxKTtcbiAgaWYgKCcnICE9PSBuZXh0ICYmIE51bWJlcihuZXh0KSA9PSBuZXh0KSB7XG4gICAgcC5pZCA9ICcnO1xuICAgIHdoaWxlICgrK2kpIHtcbiAgICAgIHZhciBjID0gc3RyLmNoYXJBdChpKTtcbiAgICAgIGlmIChudWxsID09IGMgfHwgTnVtYmVyKGMpICE9IGMpIHtcbiAgICAgICAgLS1pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHAuaWQgKz0gc3RyLmNoYXJBdChpKTtcbiAgICAgIGlmIChpID09IHN0ci5sZW5ndGgpIGJyZWFrO1xuICAgIH1cbiAgICBwLmlkID0gTnVtYmVyKHAuaWQpO1xuICB9XG5cbiAgLy8gbG9vayB1cCBqc29uIGRhdGFcbiAgaWYgKHN0ci5jaGFyQXQoKytpKSkge1xuICAgIHRyeSB7XG4gICAgICBwLmRhdGEgPSBqc29uLnBhcnNlKHN0ci5zdWJzdHIoaSkpO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICByZXR1cm4gZXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICBkZWJ1ZygnZGVjb2RlZCAlcyBhcyAlaicsIHN0ciwgcCk7XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIERlYWxsb2NhdGVzIGEgcGFyc2VyJ3MgcmVzb3VyY2VzXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5EZWNvZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLnJlY29uc3RydWN0b3IpIHtcbiAgICB0aGlzLnJlY29uc3RydWN0b3IuZmluaXNoZWRSZWNvbnN0cnVjdGlvbigpO1xuICB9XG59O1xuXG4vKipcbiAqIEEgbWFuYWdlciBvZiBhIGJpbmFyeSBldmVudCdzICdidWZmZXIgc2VxdWVuY2UnLiBTaG91bGRcbiAqIGJlIGNvbnN0cnVjdGVkIHdoZW5ldmVyIGEgcGFja2V0IG9mIHR5cGUgQklOQVJZX0VWRU5UIGlzXG4gKiBkZWNvZGVkLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAqIEByZXR1cm4ge0JpbmFyeVJlY29uc3RydWN0b3J9IGluaXRpYWxpemVkIHJlY29uc3RydWN0b3JcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIEJpbmFyeVJlY29uc3RydWN0b3IocGFja2V0KSB7XG4gIHRoaXMucmVjb25QYWNrID0gcGFja2V0O1xuICB0aGlzLmJ1ZmZlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gYmUgY2FsbGVkIHdoZW4gYmluYXJ5IGRhdGEgcmVjZWl2ZWQgZnJvbSBjb25uZWN0aW9uXG4gKiBhZnRlciBhIEJJTkFSWV9FVkVOVCBwYWNrZXQuXG4gKlxuICogQHBhcmFtIHtCdWZmZXIgfCBBcnJheUJ1ZmZlcn0gYmluRGF0YSAtIHRoZSByYXcgYmluYXJ5IGRhdGEgcmVjZWl2ZWRcbiAqIEByZXR1cm4ge251bGwgfCBPYmplY3R9IHJldHVybnMgbnVsbCBpZiBtb3JlIGJpbmFyeSBkYXRhIGlzIGV4cGVjdGVkIG9yXG4gKiAgIGEgcmVjb25zdHJ1Y3RlZCBwYWNrZXQgb2JqZWN0IGlmIGFsbCBidWZmZXJzIGhhdmUgYmVlbiByZWNlaXZlZC5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkJpbmFyeVJlY29uc3RydWN0b3IucHJvdG90eXBlLnRha2VCaW5hcnlEYXRhID0gZnVuY3Rpb24oYmluRGF0YSkge1xuICB0aGlzLmJ1ZmZlcnMucHVzaChiaW5EYXRhKTtcbiAgaWYgKHRoaXMuYnVmZmVycy5sZW5ndGggPT0gdGhpcy5yZWNvblBhY2suYXR0YWNobWVudHMpIHsgLy8gZG9uZSB3aXRoIGJ1ZmZlciBsaXN0XG4gICAgdmFyIHBhY2tldCA9IGJpbmFyeS5yZWNvbnN0cnVjdFBhY2tldCh0aGlzLnJlY29uUGFjaywgdGhpcy5idWZmZXJzKTtcbiAgICB0aGlzLmZpbmlzaGVkUmVjb25zdHJ1Y3Rpb24oKTtcbiAgICByZXR1cm4gcGFja2V0O1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBDbGVhbnMgdXAgYmluYXJ5IHBhY2tldCByZWNvbnN0cnVjdGlvbiB2YXJpYWJsZXMuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuQmluYXJ5UmVjb25zdHJ1Y3Rvci5wcm90b3R5cGUuZmluaXNoZWRSZWNvbnN0cnVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlY29uUGFjayA9IG51bGw7XG4gIHRoaXMuYnVmZmVycyA9IFtdO1xufTtcblxuZnVuY3Rpb24gZXJyb3IoZGF0YSl7XG4gIHJldHVybiB7XG4gICAgdHlwZTogZXhwb3J0cy5FUlJPUixcbiAgICBkYXRhOiAncGFyc2VyIGVycm9yJ1xuICB9O1xufVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmO1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBvYmogaXMgYSBidWZmZXIgb3IgYW4gYXJyYXlidWZmZXIuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNCdWYob2JqKSB7XG4gIHJldHVybiAoZ2xvYmFsLkJ1ZmZlciAmJiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyKG9iaikpIHx8XG4gICAgICAgICAoZ2xvYmFsLkFycmF5QnVmZmVyICYmIG9iaiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8qISBKU09OIHYzLjMuMiB8IGh0dHA6Ly9iZXN0aWVqcy5naXRodWIuaW8vanNvbjMgfCBDb3B5cmlnaHQgMjAxMi0yMDE0LCBLaXQgQ2FtYnJpZGdlIHwgaHR0cDovL2tpdC5taXQtbGljZW5zZS5vcmcgKi9cbjsoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgdGhlIGBkZWZpbmVgIGZ1bmN0aW9uIGV4cG9zZWQgYnkgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLiBUaGVcbiAgLy8gc3RyaWN0IGBkZWZpbmVgIGNoZWNrIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGByLmpzYC5cbiAgdmFyIGlzTG9hZGVyID0gdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQ7XG5cbiAgLy8gQSBzZXQgb2YgdHlwZXMgdXNlZCB0byBkaXN0aW5ndWlzaCBvYmplY3RzIGZyb20gcHJpbWl0aXZlcy5cbiAgdmFyIG9iamVjdFR5cGVzID0ge1xuICAgIFwiZnVuY3Rpb25cIjogdHJ1ZSxcbiAgICBcIm9iamVjdFwiOiB0cnVlXG4gIH07XG5cbiAgLy8gRGV0ZWN0IHRoZSBgZXhwb3J0c2Agb2JqZWN0IGV4cG9zZWQgYnkgQ29tbW9uSlMgaW1wbGVtZW50YXRpb25zLlxuICB2YXIgZnJlZUV4cG9ydHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4gIC8vIFVzZSB0aGUgYGdsb2JhbGAgb2JqZWN0IGV4cG9zZWQgYnkgTm9kZSAoaW5jbHVkaW5nIEJyb3dzZXJpZnkgdmlhXG4gIC8vIGBpbnNlcnQtbW9kdWxlLWdsb2JhbHNgKSwgTmFyd2hhbCwgYW5kIFJpbmdvIGFzIHRoZSBkZWZhdWx0IGNvbnRleHQsXG4gIC8vIGFuZCB0aGUgYHdpbmRvd2Agb2JqZWN0IGluIGJyb3dzZXJzLiBSaGlubyBleHBvcnRzIGEgYGdsb2JhbGAgZnVuY3Rpb25cbiAgLy8gaW5zdGVhZC5cbiAgdmFyIHJvb3QgPSBvYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cgfHwgdGhpcyxcbiAgICAgIGZyZWVHbG9iYWwgPSBmcmVlRXhwb3J0cyAmJiBvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiB0eXBlb2YgZ2xvYmFsID09IFwib2JqZWN0XCIgJiYgZ2xvYmFsO1xuXG4gIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsW1wiZ2xvYmFsXCJdID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWxbXCJ3aW5kb3dcIl0gPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbFtcInNlbGZcIl0gPT09IGZyZWVHbG9iYWwpKSB7XG4gICAgcm9vdCA9IGZyZWVHbG9iYWw7XG4gIH1cblxuICAvLyBQdWJsaWM6IEluaXRpYWxpemVzIEpTT04gMyB1c2luZyB0aGUgZ2l2ZW4gYGNvbnRleHRgIG9iamVjdCwgYXR0YWNoaW5nIHRoZVxuICAvLyBgc3RyaW5naWZ5YCBhbmQgYHBhcnNlYCBmdW5jdGlvbnMgdG8gdGhlIHNwZWNpZmllZCBgZXhwb3J0c2Agb2JqZWN0LlxuICBmdW5jdGlvbiBydW5JbkNvbnRleHQoY29udGV4dCwgZXhwb3J0cykge1xuICAgIGNvbnRleHQgfHwgKGNvbnRleHQgPSByb290W1wiT2JqZWN0XCJdKCkpO1xuICAgIGV4cG9ydHMgfHwgKGV4cG9ydHMgPSByb290W1wiT2JqZWN0XCJdKCkpO1xuXG4gICAgLy8gTmF0aXZlIGNvbnN0cnVjdG9yIGFsaWFzZXMuXG4gICAgdmFyIE51bWJlciA9IGNvbnRleHRbXCJOdW1iZXJcIl0gfHwgcm9vdFtcIk51bWJlclwiXSxcbiAgICAgICAgU3RyaW5nID0gY29udGV4dFtcIlN0cmluZ1wiXSB8fCByb290W1wiU3RyaW5nXCJdLFxuICAgICAgICBPYmplY3QgPSBjb250ZXh0W1wiT2JqZWN0XCJdIHx8IHJvb3RbXCJPYmplY3RcIl0sXG4gICAgICAgIERhdGUgPSBjb250ZXh0W1wiRGF0ZVwiXSB8fCByb290W1wiRGF0ZVwiXSxcbiAgICAgICAgU3ludGF4RXJyb3IgPSBjb250ZXh0W1wiU3ludGF4RXJyb3JcIl0gfHwgcm9vdFtcIlN5bnRheEVycm9yXCJdLFxuICAgICAgICBUeXBlRXJyb3IgPSBjb250ZXh0W1wiVHlwZUVycm9yXCJdIHx8IHJvb3RbXCJUeXBlRXJyb3JcIl0sXG4gICAgICAgIE1hdGggPSBjb250ZXh0W1wiTWF0aFwiXSB8fCByb290W1wiTWF0aFwiXSxcbiAgICAgICAgbmF0aXZlSlNPTiA9IGNvbnRleHRbXCJKU09OXCJdIHx8IHJvb3RbXCJKU09OXCJdO1xuXG4gICAgLy8gRGVsZWdhdGUgdG8gdGhlIG5hdGl2ZSBgc3RyaW5naWZ5YCBhbmQgYHBhcnNlYCBpbXBsZW1lbnRhdGlvbnMuXG4gICAgaWYgKHR5cGVvZiBuYXRpdmVKU09OID09IFwib2JqZWN0XCIgJiYgbmF0aXZlSlNPTikge1xuICAgICAgZXhwb3J0cy5zdHJpbmdpZnkgPSBuYXRpdmVKU09OLnN0cmluZ2lmeTtcbiAgICAgIGV4cG9ydHMucGFyc2UgPSBuYXRpdmVKU09OLnBhcnNlO1xuICAgIH1cblxuICAgIC8vIENvbnZlbmllbmNlIGFsaWFzZXMuXG4gICAgdmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgZ2V0Q2xhc3MgPSBvYmplY3RQcm90by50b1N0cmluZyxcbiAgICAgICAgaXNQcm9wZXJ0eSwgZm9yRWFjaCwgdW5kZWY7XG5cbiAgICAvLyBUZXN0IHRoZSBgRGF0ZSNnZXRVVEMqYCBtZXRob2RzLiBCYXNlZCBvbiB3b3JrIGJ5IEBZYWZmbGUuXG4gICAgdmFyIGlzRXh0ZW5kZWQgPSBuZXcgRGF0ZSgtMzUwOTgyNzMzNDU3MzI5Mik7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFRoZSBgZ2V0VVRDRnVsbFllYXJgLCBgTW9udGhgLCBhbmQgYERhdGVgIG1ldGhvZHMgcmV0dXJuIG5vbnNlbnNpY2FsXG4gICAgICAvLyByZXN1bHRzIGZvciBjZXJ0YWluIGRhdGVzIGluIE9wZXJhID49IDEwLjUzLlxuICAgICAgaXNFeHRlbmRlZCA9IGlzRXh0ZW5kZWQuZ2V0VVRDRnVsbFllYXIoKSA9PSAtMTA5MjUyICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTW9udGgoKSA9PT0gMCAmJiBpc0V4dGVuZGVkLmdldFVUQ0RhdGUoKSA9PT0gMSAmJlxuICAgICAgICAvLyBTYWZhcmkgPCAyLjAuMiBzdG9yZXMgdGhlIGludGVybmFsIG1pbGxpc2Vjb25kIHRpbWUgdmFsdWUgY29ycmVjdGx5LFxuICAgICAgICAvLyBidXQgY2xpcHMgdGhlIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgZGF0ZSBtZXRob2RzIHRvIHRoZSByYW5nZSBvZlxuICAgICAgICAvLyBzaWduZWQgMzItYml0IGludGVnZXJzIChbLTIgKiogMzEsIDIgKiogMzEgLSAxXSkuXG4gICAgICAgIGlzRXh0ZW5kZWQuZ2V0VVRDSG91cnMoKSA9PSAxMCAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbnV0ZXMoKSA9PSAzNyAmJiBpc0V4dGVuZGVkLmdldFVUQ1NlY29uZHMoKSA9PSA2ICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTWlsbGlzZWNvbmRzKCkgPT0gNzA4O1xuICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cblxuICAgIC8vIEludGVybmFsOiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG5hdGl2ZSBgSlNPTi5zdHJpbmdpZnlgIGFuZCBgcGFyc2VgXG4gICAgLy8gaW1wbGVtZW50YXRpb25zIGFyZSBzcGVjLWNvbXBsaWFudC4gQmFzZWQgb24gd29yayBieSBLZW4gU255ZGVyLlxuICAgIGZ1bmN0aW9uIGhhcyhuYW1lKSB7XG4gICAgICBpZiAoaGFzW25hbWVdICE9PSB1bmRlZikge1xuICAgICAgICAvLyBSZXR1cm4gY2FjaGVkIGZlYXR1cmUgdGVzdCByZXN1bHQuXG4gICAgICAgIHJldHVybiBoYXNbbmFtZV07XG4gICAgICB9XG4gICAgICB2YXIgaXNTdXBwb3J0ZWQ7XG4gICAgICBpZiAobmFtZSA9PSBcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKSB7XG4gICAgICAgIC8vIElFIDw9IDcgZG9lc24ndCBzdXBwb3J0IGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyB1c2luZyBzcXVhcmVcbiAgICAgICAgLy8gYnJhY2tldCBub3RhdGlvbi4gSUUgOCBvbmx5IHN1cHBvcnRzIHRoaXMgZm9yIHByaW1pdGl2ZXMuXG4gICAgICAgIGlzU3VwcG9ydGVkID0gXCJhXCJbMF0gIT0gXCJhXCI7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJqc29uXCIpIHtcbiAgICAgICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgYm90aCBgSlNPTi5zdHJpbmdpZnlgIGFuZCBgSlNPTi5wYXJzZWAgYXJlXG4gICAgICAgIC8vIHN1cHBvcnRlZC5cbiAgICAgICAgaXNTdXBwb3J0ZWQgPSBoYXMoXCJqc29uLXN0cmluZ2lmeVwiKSAmJiBoYXMoXCJqc29uLXBhcnNlXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlLCBzZXJpYWxpemVkID0gJ3tcImFcIjpbMSx0cnVlLGZhbHNlLG51bGwsXCJcXFxcdTAwMDBcXFxcYlxcXFxuXFxcXGZcXFxcclxcXFx0XCJdfSc7XG4gICAgICAgIC8vIFRlc3QgYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgaWYgKG5hbWUgPT0gXCJqc29uLXN0cmluZ2lmeVwiKSB7XG4gICAgICAgICAgdmFyIHN0cmluZ2lmeSA9IGV4cG9ydHMuc3RyaW5naWZ5LCBzdHJpbmdpZnlTdXBwb3J0ZWQgPSB0eXBlb2Ygc3RyaW5naWZ5ID09IFwiZnVuY3Rpb25cIiAmJiBpc0V4dGVuZGVkO1xuICAgICAgICAgIGlmIChzdHJpbmdpZnlTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIC8vIEEgdGVzdCBmdW5jdGlvbiBvYmplY3Qgd2l0aCBhIGN1c3RvbSBgdG9KU09OYCBtZXRob2QuXG4gICAgICAgICAgICAodmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfSkudG9KU09OID0gdmFsdWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzdHJpbmdpZnlTdXBwb3J0ZWQgPVxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggMy4xYjEgYW5kIGIyIHNlcmlhbGl6ZSBzdHJpbmcsIG51bWJlciwgYW5kIGJvb2xlYW5cbiAgICAgICAgICAgICAgICAvLyBwcmltaXRpdmVzIGFzIG9iamVjdCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoMCkgPT09IFwiMFwiICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIGIyLCBhbmQgSlNPTiAyIHNlcmlhbGl6ZSB3cmFwcGVkIHByaW1pdGl2ZXMgYXMgb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBOdW1iZXIoKSkgPT09IFwiMFwiICYmXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBTdHJpbmcoKSkgPT0gJ1wiXCInICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIHZhbHVlIGlzIGBudWxsYCwgYHVuZGVmaW5lZGAsIG9yXG4gICAgICAgICAgICAgICAgLy8gZG9lcyBub3QgZGVmaW5lIGEgY2Fub25pY2FsIEpTT04gcmVwcmVzZW50YXRpb24gKHRoaXMgYXBwbGllcyB0b1xuICAgICAgICAgICAgICAgIC8vIG9iamVjdHMgd2l0aCBgdG9KU09OYCBwcm9wZXJ0aWVzIGFzIHdlbGwsICp1bmxlc3MqIHRoZXkgYXJlIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkpLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShnZXRDbGFzcykgPT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgLy8gSUUgOCBzZXJpYWxpemVzIGB1bmRlZmluZWRgIGFzIGBcInVuZGVmaW5lZFwiYC4gU2FmYXJpIDw9IDUuMS43IGFuZFxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIzIHBhc3MgdGhpcyB0ZXN0LlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeSh1bmRlZikgPT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS43IGFuZCBGRiAzLjFiMyB0aHJvdyBgRXJyb3JgcyBhbmQgYFR5cGVFcnJvcmBzLFxuICAgICAgICAgICAgICAgIC8vIHJlc3BlY3RpdmVseSwgaWYgdGhlIHZhbHVlIGlzIG9taXR0ZWQgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KCkgPT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIG5vdCBhIG51bWJlcixcbiAgICAgICAgICAgICAgICAvLyBzdHJpbmcsIGFycmF5LCBvYmplY3QsIEJvb2xlYW4sIG9yIGBudWxsYCBsaXRlcmFsLiBUaGlzIGFwcGxpZXMgdG9cbiAgICAgICAgICAgICAgICAvLyBvYmplY3RzIHdpdGggY3VzdG9tIGB0b0pTT05gIG1ldGhvZHMgYXMgd2VsbCwgdW5sZXNzIHRoZXkgYXJlIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIGluc2lkZSBvYmplY3Qgb3IgYXJyYXkgbGl0ZXJhbHMuIFlVSSAzLjAuMGIxIGlnbm9yZXMgY3VzdG9tIGB0b0pTT05gXG4gICAgICAgICAgICAgICAgLy8gbWV0aG9kcyBlbnRpcmVseS5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkodmFsdWUpID09PSBcIjFcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbdmFsdWVdKSA9PSBcIlsxXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gUHJvdG90eXBlIDw9IDEuNi4xIHNlcmlhbGl6ZXMgYFt1bmRlZmluZWRdYCBhcyBgXCJbXVwiYCBpbnN0ZWFkIG9mXG4gICAgICAgICAgICAgICAgLy8gYFwiW251bGxdXCJgLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbdW5kZWZdKSA9PSBcIltudWxsXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gWVVJIDMuMC4wYjEgZmFpbHMgdG8gc2VyaWFsaXplIGBudWxsYCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobnVsbCkgPT0gXCJudWxsXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMSwgMiBoYWx0cyBzZXJpYWxpemF0aW9uIGlmIGFuIGFycmF5IGNvbnRhaW5zIGEgZnVuY3Rpb246XG4gICAgICAgICAgICAgICAgLy8gYFsxLCB0cnVlLCBnZXRDbGFzcywgMV1gIHNlcmlhbGl6ZXMgYXMgXCJbMSx0cnVlLF0sXCIuIEZGIDMuMWIzXG4gICAgICAgICAgICAgICAgLy8gZWxpZGVzIG5vbi1KU09OIHZhbHVlcyBmcm9tIG9iamVjdHMgYW5kIGFycmF5cywgdW5sZXNzIHRoZXlcbiAgICAgICAgICAgICAgICAvLyBkZWZpbmUgY3VzdG9tIGB0b0pTT05gIG1ldGhvZHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KFt1bmRlZiwgZ2V0Q2xhc3MsIG51bGxdKSA9PSBcIltudWxsLG51bGwsbnVsbF1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFNpbXBsZSBzZXJpYWxpemF0aW9uIHRlc3QuIEZGIDMuMWIxIHVzZXMgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2VzXG4gICAgICAgICAgICAgICAgLy8gd2hlcmUgY2hhcmFjdGVyIGVzY2FwZSBjb2RlcyBhcmUgZXhwZWN0ZWQgKGUuZy4sIGBcXGJgID0+IGBcXHUwMDA4YCkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHsgXCJhXCI6IFt2YWx1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIFwiXFx4MDBcXGJcXG5cXGZcXHJcXHRcIl0gfSkgPT0gc2VyaWFsaXplZCAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxIGFuZCBiMiBpZ25vcmUgdGhlIGBmaWx0ZXJgIGFuZCBgd2lkdGhgIGFyZ3VtZW50cy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobnVsbCwgdmFsdWUpID09PSBcIjFcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbMSwgMl0sIG51bGwsIDEpID09IFwiW1xcbiAxLFxcbiAyXFxuXVwiICYmXG4gICAgICAgICAgICAgICAgLy8gSlNPTiAyLCBQcm90b3R5cGUgPD0gMS43LCBhbmQgb2xkZXIgV2ViS2l0IGJ1aWxkcyBpbmNvcnJlY3RseVxuICAgICAgICAgICAgICAgIC8vIHNlcmlhbGl6ZSBleHRlbmRlZCB5ZWFycy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTguNjRlMTUpKSA9PSAnXCItMjcxODIxLTA0LTIwVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgICAvLyBUaGUgbWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LCBidXQgcmVxdWlyZWQgaW4gNS4xLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSg4LjY0ZTE1KSkgPT0gJ1wiKzI3NTc2MC0wOS0xM1QwMDowMDowMC4wMDBaXCInICYmXG4gICAgICAgICAgICAgICAgLy8gRmlyZWZveCA8PSAxMS4wIGluY29ycmVjdGx5IHNlcmlhbGl6ZXMgeWVhcnMgcHJpb3IgdG8gMCBhcyBuZWdhdGl2ZVxuICAgICAgICAgICAgICAgIC8vIGZvdXItZGlnaXQgeWVhcnMgaW5zdGVhZCBvZiBzaXgtZGlnaXQgeWVhcnMuIENyZWRpdHM6IEBZYWZmbGUuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBEYXRlKC02MjE5ODc1NTJlNSkpID09ICdcIi0wMDAwMDEtMDEtMDFUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSA8PSA1LjEuNSBhbmQgT3BlcmEgPj0gMTAuNTMgaW5jb3JyZWN0bHkgc2VyaWFsaXplIG1pbGxpc2Vjb25kXG4gICAgICAgICAgICAgICAgLy8gdmFsdWVzIGxlc3MgdGhhbiAxMDAwLiBDcmVkaXRzOiBAWWFmZmxlLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtMSkpID09ICdcIjE5NjktMTItMzFUMjM6NTk6NTkuOTk5WlwiJztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICBzdHJpbmdpZnlTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaXNTdXBwb3J0ZWQgPSBzdHJpbmdpZnlTdXBwb3J0ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGVzdCBgSlNPTi5wYXJzZWAuXG4gICAgICAgIGlmIChuYW1lID09IFwianNvbi1wYXJzZVwiKSB7XG4gICAgICAgICAgdmFyIHBhcnNlID0gZXhwb3J0cy5wYXJzZTtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIGIyIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGEgYmFyZSBsaXRlcmFsIGlzIHByb3ZpZGVkLlxuICAgICAgICAgICAgICAvLyBDb25mb3JtaW5nIGltcGxlbWVudGF0aW9ucyBzaG91bGQgYWxzbyBjb2VyY2UgdGhlIGluaXRpYWwgYXJndW1lbnQgdG9cbiAgICAgICAgICAgICAgLy8gYSBzdHJpbmcgcHJpb3IgdG8gcGFyc2luZy5cbiAgICAgICAgICAgICAgaWYgKHBhcnNlKFwiMFwiKSA9PT0gMCAmJiAhcGFyc2UoZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgLy8gU2ltcGxlIHBhcnNpbmcgdGVzdC5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlKHNlcmlhbGl6ZWQpO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZVN1cHBvcnRlZCA9IHZhbHVlW1wiYVwiXS5sZW5ndGggPT0gNSAmJiB2YWx1ZVtcImFcIl1bMF0gPT09IDE7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPD0gNS4xLjIgYW5kIEZGIDMuMWIxIGFsbG93IHVuZXNjYXBlZCB0YWJzIGluIHN0cmluZ3MuXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gIXBhcnNlKCdcIlxcdFwiJyk7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG4gICAgICAgICAgICAgICAgICBpZiAocGFyc2VTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBGRiA0LjAgYW5kIDQuMC4xIGFsbG93IGxlYWRpbmcgYCtgIHNpZ25zIGFuZCBsZWFkaW5nXG4gICAgICAgICAgICAgICAgICAgICAgLy8gZGVjaW1hbCBwb2ludHMuIEZGIDQuMCwgNC4wLjEsIGFuZCBJRSA5LTEwIGFsc28gYWxsb3dcbiAgICAgICAgICAgICAgICAgICAgICAvLyBjZXJ0YWluIG9jdGFsIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlU3VwcG9ydGVkID0gcGFyc2UoXCIwMVwiKSAhPT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7fVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gRkYgNC4wLCA0LjAuMSwgYW5kIFJoaW5vIDEuN1IzLVI0IGFsbG93IHRyYWlsaW5nIGRlY2ltYWxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMuIFRoZXNlIGVudmlyb25tZW50cywgYWxvbmcgd2l0aCBGRiAzLjFiMSBhbmQgMixcbiAgICAgICAgICAgICAgICAgICAgICAvLyBhbHNvIGFsbG93IHRyYWlsaW5nIGNvbW1hcyBpbiBKU09OIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMS5cIikgIT09IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpc1N1cHBvcnRlZCA9IHBhcnNlU3VwcG9ydGVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzW25hbWVdID0gISFpc1N1cHBvcnRlZDtcbiAgICB9XG5cbiAgICBpZiAoIWhhcyhcImpzb25cIikpIHtcbiAgICAgIC8vIENvbW1vbiBgW1tDbGFzc11dYCBuYW1lIGFsaWFzZXMuXG4gICAgICB2YXIgZnVuY3Rpb25DbGFzcyA9IFwiW29iamVjdCBGdW5jdGlvbl1cIixcbiAgICAgICAgICBkYXRlQ2xhc3MgPSBcIltvYmplY3QgRGF0ZV1cIixcbiAgICAgICAgICBudW1iZXJDbGFzcyA9IFwiW29iamVjdCBOdW1iZXJdXCIsXG4gICAgICAgICAgc3RyaW5nQ2xhc3MgPSBcIltvYmplY3QgU3RyaW5nXVwiLFxuICAgICAgICAgIGFycmF5Q2xhc3MgPSBcIltvYmplY3QgQXJyYXldXCIsXG4gICAgICAgICAgYm9vbGVhbkNsYXNzID0gXCJbb2JqZWN0IEJvb2xlYW5dXCI7XG5cbiAgICAgIC8vIERldGVjdCBpbmNvbXBsZXRlIHN1cHBvcnQgZm9yIGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyBieSBpbmRleC5cbiAgICAgIHZhciBjaGFySW5kZXhCdWdneSA9IGhhcyhcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKTtcblxuICAgICAgLy8gRGVmaW5lIGFkZGl0aW9uYWwgdXRpbGl0eSBtZXRob2RzIGlmIHRoZSBgRGF0ZWAgbWV0aG9kcyBhcmUgYnVnZ3kuXG4gICAgICBpZiAoIWlzRXh0ZW5kZWQpIHtcbiAgICAgICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICAgICAgLy8gQSBtYXBwaW5nIGJldHdlZW4gdGhlIG1vbnRocyBvZiB0aGUgeWVhciBhbmQgdGhlIG51bWJlciBvZiBkYXlzIGJldHdlZW5cbiAgICAgICAgLy8gSmFudWFyeSAxc3QgYW5kIHRoZSBmaXJzdCBvZiB0aGUgcmVzcGVjdGl2ZSBtb250aC5cbiAgICAgICAgdmFyIE1vbnRocyA9IFswLCAzMSwgNTksIDkwLCAxMjAsIDE1MSwgMTgxLCAyMTIsIDI0MywgMjczLCAzMDQsIDMzNF07XG4gICAgICAgIC8vIEludGVybmFsOiBDYWxjdWxhdGVzIHRoZSBudW1iZXIgb2YgZGF5cyBiZXR3ZWVuIHRoZSBVbml4IGVwb2NoIGFuZCB0aGVcbiAgICAgICAgLy8gZmlyc3QgZGF5IG9mIHRoZSBnaXZlbiBtb250aC5cbiAgICAgICAgdmFyIGdldERheSA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCkge1xuICAgICAgICAgIHJldHVybiBNb250aHNbbW9udGhdICsgMzY1ICogKHllYXIgLSAxOTcwKSArIGZsb29yKCh5ZWFyIC0gMTk2OSArIChtb250aCA9ICsobW9udGggPiAxKSkpIC8gNCkgLSBmbG9vcigoeWVhciAtIDE5MDEgKyBtb250aCkgLyAxMDApICsgZmxvb3IoKHllYXIgLSAxNjAxICsgbW9udGgpIC8gNDAwKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gSW50ZXJuYWw6IERldGVybWluZXMgaWYgYSBwcm9wZXJ0eSBpcyBhIGRpcmVjdCBwcm9wZXJ0eSBvZiB0aGUgZ2l2ZW5cbiAgICAgIC8vIG9iamVjdC4gRGVsZWdhdGVzIHRvIHRoZSBuYXRpdmUgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgbWV0aG9kLlxuICAgICAgaWYgKCEoaXNQcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5KSkge1xuICAgICAgICBpc1Byb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgdmFyIG1lbWJlcnMgPSB7fSwgY29uc3RydWN0b3I7XG4gICAgICAgICAgaWYgKChtZW1iZXJzLl9fcHJvdG9fXyA9IG51bGwsIG1lbWJlcnMuX19wcm90b19fID0ge1xuICAgICAgICAgICAgLy8gVGhlICpwcm90byogcHJvcGVydHkgY2Fubm90IGJlIHNldCBtdWx0aXBsZSB0aW1lcyBpbiByZWNlbnRcbiAgICAgICAgICAgIC8vIHZlcnNpb25zIG9mIEZpcmVmb3ggYW5kIFNlYU1vbmtleS5cbiAgICAgICAgICAgIFwidG9TdHJpbmdcIjogMVxuICAgICAgICAgIH0sIG1lbWJlcnMpLnRvU3RyaW5nICE9IGdldENsYXNzKSB7XG4gICAgICAgICAgICAvLyBTYWZhcmkgPD0gMi4wLjMgZG9lc24ndCBpbXBsZW1lbnQgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAsIGJ1dFxuICAgICAgICAgICAgLy8gc3VwcG9ydHMgdGhlIG11dGFibGUgKnByb3RvKiBwcm9wZXJ0eS5cbiAgICAgICAgICAgIGlzUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgLy8gQ2FwdHVyZSBhbmQgYnJlYWsgdGhlIG9iamVjdCdzIHByb3RvdHlwZSBjaGFpbiAoc2VlIHNlY3Rpb24gOC42LjJcbiAgICAgICAgICAgICAgLy8gb2YgdGhlIEVTIDUuMSBzcGVjKS4gVGhlIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbiBwcmV2ZW50cyBhblxuICAgICAgICAgICAgICAvLyB1bnNhZmUgdHJhbnNmb3JtYXRpb24gYnkgdGhlIENsb3N1cmUgQ29tcGlsZXIuXG4gICAgICAgICAgICAgIHZhciBvcmlnaW5hbCA9IHRoaXMuX19wcm90b19fLCByZXN1bHQgPSBwcm9wZXJ0eSBpbiAodGhpcy5fX3Byb3RvX18gPSBudWxsLCB0aGlzKTtcbiAgICAgICAgICAgICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcHJvdG90eXBlIGNoYWluLlxuICAgICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IG9yaWdpbmFsO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQ2FwdHVyZSBhIHJlZmVyZW5jZSB0byB0aGUgdG9wLWxldmVsIGBPYmplY3RgIGNvbnN0cnVjdG9yLlxuICAgICAgICAgICAgY29uc3RydWN0b3IgPSBtZW1iZXJzLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IHRvIHNpbXVsYXRlIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIGluXG4gICAgICAgICAgICAvLyBvdGhlciBlbnZpcm9ubWVudHMuXG4gICAgICAgICAgICBpc1Byb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgIHZhciBwYXJlbnQgPSAodGhpcy5jb25zdHJ1Y3RvciB8fCBjb25zdHJ1Y3RvcikucHJvdG90eXBlO1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiAhKHByb3BlcnR5IGluIHBhcmVudCAmJiB0aGlzW3Byb3BlcnR5XSA9PT0gcGFyZW50W3Byb3BlcnR5XSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBtZW1iZXJzID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gaXNQcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy8gSW50ZXJuYWw6IE5vcm1hbGl6ZXMgdGhlIGBmb3IuLi5pbmAgaXRlcmF0aW9uIGFsZ29yaXRobSBhY3Jvc3NcbiAgICAgIC8vIGVudmlyb25tZW50cy4gRWFjaCBlbnVtZXJhdGVkIGtleSBpcyB5aWVsZGVkIHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi5cbiAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2l6ZSA9IDAsIFByb3BlcnRpZXMsIG1lbWJlcnMsIHByb3BlcnR5O1xuXG4gICAgICAgIC8vIFRlc3RzIGZvciBidWdzIGluIHRoZSBjdXJyZW50IGVudmlyb25tZW50J3MgYGZvci4uLmluYCBhbGdvcml0aG0uIFRoZVxuICAgICAgICAvLyBgdmFsdWVPZmAgcHJvcGVydHkgaW5oZXJpdHMgdGhlIG5vbi1lbnVtZXJhYmxlIGZsYWcgZnJvbVxuICAgICAgICAvLyBgT2JqZWN0LnByb3RvdHlwZWAgaW4gb2xkZXIgdmVyc2lvbnMgb2YgSUUsIE5ldHNjYXBlLCBhbmQgTW96aWxsYS5cbiAgICAgICAgKFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy52YWx1ZU9mID0gMDtcbiAgICAgICAgfSkucHJvdG90eXBlLnZhbHVlT2YgPSAwO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgYFByb3BlcnRpZXNgIGNsYXNzLlxuICAgICAgICBtZW1iZXJzID0gbmV3IFByb3BlcnRpZXMoKTtcbiAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBtZW1iZXJzKSB7XG4gICAgICAgICAgLy8gSWdub3JlIGFsbCBwcm9wZXJ0aWVzIGluaGVyaXRlZCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC5cbiAgICAgICAgICBpZiAoaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBQcm9wZXJ0aWVzID0gbWVtYmVycyA9IG51bGw7XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBpdGVyYXRpb24gYWxnb3JpdGhtLlxuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAvLyBBIGxpc3Qgb2Ygbm9uLWVudW1lcmFibGUgcHJvcGVydGllcyBpbmhlcml0ZWQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAuXG4gICAgICAgICAgbWVtYmVycyA9IFtcInZhbHVlT2ZcIiwgXCJ0b1N0cmluZ1wiLCBcInRvTG9jYWxlU3RyaW5nXCIsIFwicHJvcGVydHlJc0VudW1lcmFibGVcIiwgXCJpc1Byb3RvdHlwZU9mXCIsIFwiaGFzT3duUHJvcGVydHlcIiwgXCJjb25zdHJ1Y3RvclwiXTtcbiAgICAgICAgICAvLyBJRSA8PSA4LCBNb3ppbGxhIDEuMCwgYW5kIE5ldHNjYXBlIDYuMiBpZ25vcmUgc2hhZG93ZWQgbm9uLWVudW1lcmFibGVcbiAgICAgICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHksIGxlbmd0aDtcbiAgICAgICAgICAgIHZhciBoYXNQcm9wZXJ0eSA9ICFpc0Z1bmN0aW9uICYmIHR5cGVvZiBvYmplY3QuY29uc3RydWN0b3IgIT0gXCJmdW5jdGlvblwiICYmIG9iamVjdFR5cGVzW3R5cGVvZiBvYmplY3QuaGFzT3duUHJvcGVydHldICYmIG9iamVjdC5oYXNPd25Qcm9wZXJ0eSB8fCBpc1Byb3BlcnR5O1xuICAgICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgLy8gR2Vja28gPD0gMS4wIGVudW1lcmF0ZXMgdGhlIGBwcm90b3R5cGVgIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyB1bmRlclxuICAgICAgICAgICAgICAvLyBjZXJ0YWluIGNvbmRpdGlvbnM7IElFIGRvZXMgbm90LlxuICAgICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmIGhhc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIGVhY2ggbm9uLWVudW1lcmFibGUgcHJvcGVydHkuXG4gICAgICAgICAgICBmb3IgKGxlbmd0aCA9IG1lbWJlcnMubGVuZ3RoOyBwcm9wZXJ0eSA9IG1lbWJlcnNbLS1sZW5ndGhdOyBoYXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpICYmIGNhbGxiYWNrKHByb3BlcnR5KSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChzaXplID09IDIpIHtcbiAgICAgICAgICAvLyBTYWZhcmkgPD0gMi4wLjQgZW51bWVyYXRlcyBzaGFkb3dlZCBwcm9wZXJ0aWVzIHR3aWNlLlxuICAgICAgICAgIGZvckVhY2ggPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgc2V0IG9mIGl0ZXJhdGVkIHByb3BlcnRpZXMuXG4gICAgICAgICAgICB2YXIgbWVtYmVycyA9IHt9LCBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5O1xuICAgICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgLy8gU3RvcmUgZWFjaCBwcm9wZXJ0eSBuYW1lIHRvIHByZXZlbnQgZG91YmxlIGVudW1lcmF0aW9uLiBUaGVcbiAgICAgICAgICAgICAgLy8gYHByb3RvdHlwZWAgcHJvcGVydHkgb2YgZnVuY3Rpb25zIGlzIG5vdCBlbnVtZXJhdGVkIGR1ZSB0byBjcm9zcy1cbiAgICAgICAgICAgICAgLy8gZW52aXJvbm1lbnQgaW5jb25zaXN0ZW5jaWVzLlxuICAgICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmICFpc1Byb3BlcnR5LmNhbGwobWVtYmVycywgcHJvcGVydHkpICYmIChtZW1iZXJzW3Byb3BlcnR5XSA9IDEpICYmIGlzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm8gYnVncyBkZXRlY3RlZDsgdXNlIHRoZSBzdGFuZGFyZCBgZm9yLi4uaW5gIGFsZ29yaXRobS5cbiAgICAgICAgICBmb3JFYWNoID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBpc0Z1bmN0aW9uID0gZ2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MsIHByb3BlcnR5LCBpc0NvbnN0cnVjdG9yO1xuICAgICAgICAgICAgZm9yIChwcm9wZXJ0eSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgaWYgKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkgJiYgIShpc0NvbnN0cnVjdG9yID0gcHJvcGVydHkgPT09IFwiY29uc3RydWN0b3JcIikpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IGR1ZSB0b1xuICAgICAgICAgICAgLy8gY3Jvc3MtZW52aXJvbm1lbnQgaW5jb25zaXN0ZW5jaWVzLlxuICAgICAgICAgICAgaWYgKGlzQ29uc3RydWN0b3IgfHwgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCwgKHByb3BlcnR5ID0gXCJjb25zdHJ1Y3RvclwiKSkpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2socHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvckVhY2gob2JqZWN0LCBjYWxsYmFjayk7XG4gICAgICB9O1xuXG4gICAgICAvLyBQdWJsaWM6IFNlcmlhbGl6ZXMgYSBKYXZhU2NyaXB0IGB2YWx1ZWAgYXMgYSBKU09OIHN0cmluZy4gVGhlIG9wdGlvbmFsXG4gICAgICAvLyBgZmlsdGVyYCBhcmd1bWVudCBtYXkgc3BlY2lmeSBlaXRoZXIgYSBmdW5jdGlvbiB0aGF0IGFsdGVycyBob3cgb2JqZWN0IGFuZFxuICAgICAgLy8gYXJyYXkgbWVtYmVycyBhcmUgc2VyaWFsaXplZCwgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyBhbmQgbnVtYmVycyB0aGF0XG4gICAgICAvLyBpbmRpY2F0ZXMgd2hpY2ggcHJvcGVydGllcyBzaG91bGQgYmUgc2VyaWFsaXplZC4gVGhlIG9wdGlvbmFsIGB3aWR0aGBcbiAgICAgIC8vIGFyZ3VtZW50IG1heSBiZSBlaXRoZXIgYSBzdHJpbmcgb3IgbnVtYmVyIHRoYXQgc3BlY2lmaWVzIHRoZSBpbmRlbnRhdGlvblxuICAgICAgLy8gbGV2ZWwgb2YgdGhlIG91dHB1dC5cbiAgICAgIGlmICghaGFzKFwianNvbi1zdHJpbmdpZnlcIikpIHtcbiAgICAgICAgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgdGhlaXIgZXNjYXBlZCBlcXVpdmFsZW50cy5cbiAgICAgICAgdmFyIEVzY2FwZXMgPSB7XG4gICAgICAgICAgOTI6IFwiXFxcXFxcXFxcIixcbiAgICAgICAgICAzNDogJ1xcXFxcIicsXG4gICAgICAgICAgODogXCJcXFxcYlwiLFxuICAgICAgICAgIDEyOiBcIlxcXFxmXCIsXG4gICAgICAgICAgMTA6IFwiXFxcXG5cIixcbiAgICAgICAgICAxMzogXCJcXFxcclwiLFxuICAgICAgICAgIDk6IFwiXFxcXHRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBDb252ZXJ0cyBgdmFsdWVgIGludG8gYSB6ZXJvLXBhZGRlZCBzdHJpbmcgc3VjaCB0aGF0IGl0c1xuICAgICAgICAvLyBsZW5ndGggaXMgYXQgbGVhc3QgZXF1YWwgdG8gYHdpZHRoYC4gVGhlIGB3aWR0aGAgbXVzdCBiZSA8PSA2LlxuICAgICAgICB2YXIgbGVhZGluZ1plcm9lcyA9IFwiMDAwMDAwXCI7XG4gICAgICAgIHZhciB0b1BhZGRlZFN0cmluZyA9IGZ1bmN0aW9uICh3aWR0aCwgdmFsdWUpIHtcbiAgICAgICAgICAvLyBUaGUgYHx8IDBgIGV4cHJlc3Npb24gaXMgbmVjZXNzYXJ5IHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluXG4gICAgICAgICAgLy8gT3BlcmEgPD0gNy41NHUyIHdoZXJlIGAwID09IC0wYCwgYnV0IGBTdHJpbmcoLTApICE9PSBcIjBcImAuXG4gICAgICAgICAgcmV0dXJuIChsZWFkaW5nWmVyb2VzICsgKHZhbHVlIHx8IDApKS5zbGljZSgtd2lkdGgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBEb3VibGUtcXVvdGVzIGEgc3RyaW5nIGB2YWx1ZWAsIHJlcGxhY2luZyBhbGwgQVNDSUkgY29udHJvbFxuICAgICAgICAvLyBjaGFyYWN0ZXJzIChjaGFyYWN0ZXJzIHdpdGggY29kZSB1bml0IHZhbHVlcyBiZXR3ZWVuIDAgYW5kIDMxKSB3aXRoXG4gICAgICAgIC8vIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gICAgICAgIC8vIGBRdW90ZSh2YWx1ZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG4gICAgICAgIHZhciB1bmljb2RlUHJlZml4ID0gXCJcXFxcdTAwXCI7XG4gICAgICAgIHZhciBxdW90ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSAnXCInLCBpbmRleCA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aCwgdXNlQ2hhckluZGV4ID0gIWNoYXJJbmRleEJ1Z2d5IHx8IGxlbmd0aCA+IDEwO1xuICAgICAgICAgIHZhciBzeW1ib2xzID0gdXNlQ2hhckluZGV4ICYmIChjaGFySW5kZXhCdWdneSA/IHZhbHVlLnNwbGl0KFwiXCIpIDogdmFsdWUpO1xuICAgICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGNoYXJDb2RlID0gdmFsdWUuY2hhckNvZGVBdChpbmRleCk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgY2hhcmFjdGVyIGlzIGEgY29udHJvbCBjaGFyYWN0ZXIsIGFwcGVuZCBpdHMgVW5pY29kZSBvclxuICAgICAgICAgICAgLy8gc2hvcnRoYW5kIGVzY2FwZSBzZXF1ZW5jZTsgb3RoZXJ3aXNlLCBhcHBlbmQgdGhlIGNoYXJhY3RlciBhcy1pcy5cbiAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSA4OiBjYXNlIDk6IGNhc2UgMTA6IGNhc2UgMTI6IGNhc2UgMTM6IGNhc2UgMzQ6IGNhc2UgOTI6XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IEVzY2FwZXNbY2hhckNvZGVdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA8IDMyKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHQgKz0gdW5pY29kZVByZWZpeCArIHRvUGFkZGVkU3RyaW5nKDIsIGNoYXJDb2RlLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHVzZUNoYXJJbmRleCA/IHN5bWJvbHNbaW5kZXhdIDogdmFsdWUuY2hhckF0KGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCArICdcIic7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZXMgYW4gb2JqZWN0LiBJbXBsZW1lbnRzIHRoZVxuICAgICAgICAvLyBgU3RyKGtleSwgaG9sZGVyKWAsIGBKTyh2YWx1ZSlgLCBhbmQgYEpBKHZhbHVlKWAgb3BlcmF0aW9ucy5cbiAgICAgICAgdmFyIHNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgb2JqZWN0LCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKSB7XG4gICAgICAgICAgdmFyIHZhbHVlLCBjbGFzc05hbWUsIHllYXIsIG1vbnRoLCBkYXRlLCB0aW1lLCBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzZWNvbmRzLCByZXN1bHRzLCBlbGVtZW50LCBpbmRleCwgbGVuZ3RoLCBwcmVmaXgsIHJlc3VsdDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTmVjZXNzYXJ5IGZvciBob3N0IG9iamVjdCBzdXBwb3J0LlxuICAgICAgICAgICAgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge31cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBkYXRlQ2xhc3MgJiYgIWlzUHJvcGVydHkuY2FsbCh2YWx1ZSwgXCJ0b0pTT05cIikpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID4gLTEgLyAwICYmIHZhbHVlIDwgMSAvIDApIHtcbiAgICAgICAgICAgICAgICAvLyBEYXRlcyBhcmUgc2VyaWFsaXplZCBhY2NvcmRpbmcgdG8gdGhlIGBEYXRlI3RvSlNPTmAgbWV0aG9kXG4gICAgICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjkuNS40NC4gU2VlIHNlY3Rpb24gMTUuOS4xLjE1XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBJU08gODYwMSBkYXRlIHRpbWUgc3RyaW5nIGZvcm1hdC5cbiAgICAgICAgICAgICAgICBpZiAoZ2V0RGF5KSB7XG4gICAgICAgICAgICAgICAgICAvLyBNYW51YWxseSBjb21wdXRlIHRoZSB5ZWFyLCBtb250aCwgZGF0ZSwgaG91cnMsIG1pbnV0ZXMsXG4gICAgICAgICAgICAgICAgICAvLyBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGlmIHRoZSBgZ2V0VVRDKmAgbWV0aG9kcyBhcmVcbiAgICAgICAgICAgICAgICAgIC8vIGJ1Z2d5LiBBZGFwdGVkIGZyb20gQFlhZmZsZSdzIGBkYXRlLXNoaW1gIHByb2plY3QuXG4gICAgICAgICAgICAgICAgICBkYXRlID0gZmxvb3IodmFsdWUgLyA4NjRlNSk7XG4gICAgICAgICAgICAgICAgICBmb3IgKHllYXIgPSBmbG9vcihkYXRlIC8gMzY1LjI0MjUpICsgMTk3MCAtIDE7IGdldERheSh5ZWFyICsgMSwgMCkgPD0gZGF0ZTsgeWVhcisrKTtcbiAgICAgICAgICAgICAgICAgIGZvciAobW9udGggPSBmbG9vcigoZGF0ZSAtIGdldERheSh5ZWFyLCAwKSkgLyAzMC40Mik7IGdldERheSh5ZWFyLCBtb250aCArIDEpIDw9IGRhdGU7IG1vbnRoKyspO1xuICAgICAgICAgICAgICAgICAgZGF0ZSA9IDEgKyBkYXRlIC0gZ2V0RGF5KHllYXIsIG1vbnRoKTtcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBgdGltZWAgdmFsdWUgc3BlY2lmaWVzIHRoZSB0aW1lIHdpdGhpbiB0aGUgZGF5IChzZWUgRVNcbiAgICAgICAgICAgICAgICAgIC8vIDUuMSBzZWN0aW9uIDE1LjkuMS4yKS4gVGhlIGZvcm11bGEgYChBICUgQiArIEIpICUgQmAgaXMgdXNlZFxuICAgICAgICAgICAgICAgICAgLy8gdG8gY29tcHV0ZSBgQSBtb2R1bG8gQmAsIGFzIHRoZSBgJWAgb3BlcmF0b3IgZG9lcyBub3RcbiAgICAgICAgICAgICAgICAgIC8vIGNvcnJlc3BvbmQgdG8gdGhlIGBtb2R1bG9gIG9wZXJhdGlvbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbiAgICAgICAgICAgICAgICAgIHRpbWUgPSAodmFsdWUgJSA4NjRlNSArIDg2NGU1KSAlIDg2NGU1O1xuICAgICAgICAgICAgICAgICAgLy8gVGhlIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGFyZSBvYnRhaW5lZCBieVxuICAgICAgICAgICAgICAgICAgLy8gZGVjb21wb3NpbmcgdGhlIHRpbWUgd2l0aGluIHRoZSBkYXkuIFNlZSBzZWN0aW9uIDE1LjkuMS4xMC5cbiAgICAgICAgICAgICAgICAgIGhvdXJzID0gZmxvb3IodGltZSAvIDM2ZTUpICUgMjQ7XG4gICAgICAgICAgICAgICAgICBtaW51dGVzID0gZmxvb3IodGltZSAvIDZlNCkgJSA2MDtcbiAgICAgICAgICAgICAgICAgIHNlY29uZHMgPSBmbG9vcih0aW1lIC8gMWUzKSAlIDYwO1xuICAgICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gdGltZSAlIDFlMztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgeWVhciA9IHZhbHVlLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgICAgICAgICAgICAgICBtb250aCA9IHZhbHVlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICAgICAgICBkYXRlID0gdmFsdWUuZ2V0VVRDRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgaG91cnMgPSB2YWx1ZS5nZXRVVENIb3VycygpO1xuICAgICAgICAgICAgICAgICAgbWludXRlcyA9IHZhbHVlLmdldFVUQ01pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgICAgIHNlY29uZHMgPSB2YWx1ZS5nZXRVVENTZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgICBtaWxsaXNlY29uZHMgPSB2YWx1ZS5nZXRVVENNaWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2VyaWFsaXplIGV4dGVuZGVkIHllYXJzIGNvcnJlY3RseS5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICh5ZWFyIDw9IDAgfHwgeWVhciA+PSAxZTQgPyAoeWVhciA8IDAgPyBcIi1cIiA6IFwiK1wiKSArIHRvUGFkZGVkU3RyaW5nKDYsIHllYXIgPCAwID8gLXllYXIgOiB5ZWFyKSA6IHRvUGFkZGVkU3RyaW5nKDQsIHllYXIpKSArXG4gICAgICAgICAgICAgICAgICBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1vbnRoICsgMSkgKyBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIGRhdGUpICtcbiAgICAgICAgICAgICAgICAgIC8vIE1vbnRocywgZGF0ZXMsIGhvdXJzLCBtaW51dGVzLCBhbmQgc2Vjb25kcyBzaG91bGQgaGF2ZSB0d29cbiAgICAgICAgICAgICAgICAgIC8vIGRpZ2l0czsgbWlsbGlzZWNvbmRzIHNob3VsZCBoYXZlIHRocmVlLlxuICAgICAgICAgICAgICAgICAgXCJUXCIgKyB0b1BhZGRlZFN0cmluZygyLCBob3VycykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1pbnV0ZXMpICsgXCI6XCIgKyB0b1BhZGRlZFN0cmluZygyLCBzZWNvbmRzKSArXG4gICAgICAgICAgICAgICAgICAvLyBNaWxsaXNlY29uZHMgYXJlIG9wdGlvbmFsIGluIEVTIDUuMCwgYnV0IHJlcXVpcmVkIGluIDUuMS5cbiAgICAgICAgICAgICAgICAgIFwiLlwiICsgdG9QYWRkZWRTdHJpbmcoMywgbWlsbGlzZWNvbmRzKSArIFwiWlwiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUudG9KU09OID09IFwiZnVuY3Rpb25cIiAmJiAoKGNsYXNzTmFtZSAhPSBudW1iZXJDbGFzcyAmJiBjbGFzc05hbWUgIT0gc3RyaW5nQ2xhc3MgJiYgY2xhc3NOYW1lICE9IGFycmF5Q2xhc3MpIHx8IGlzUHJvcGVydHkuY2FsbCh2YWx1ZSwgXCJ0b0pTT05cIikpKSB7XG4gICAgICAgICAgICAgIC8vIFByb3RvdHlwZSA8PSAxLjYuMSBhZGRzIG5vbi1zdGFuZGFyZCBgdG9KU09OYCBtZXRob2RzIHRvIHRoZVxuICAgICAgICAgICAgICAvLyBgTnVtYmVyYCwgYFN0cmluZ2AsIGBEYXRlYCwgYW5kIGBBcnJheWAgcHJvdG90eXBlcy4gSlNPTiAzXG4gICAgICAgICAgICAgIC8vIGlnbm9yZXMgYWxsIGB0b0pTT05gIG1ldGhvZHMgb24gdGhlc2Ugb2JqZWN0cyB1bmxlc3MgdGhleSBhcmVcbiAgICAgICAgICAgICAgLy8gZGVmaW5lZCBkaXJlY3RseSBvbiBhbiBpbnN0YW5jZS5cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04ocHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIElmIGEgcmVwbGFjZW1lbnQgZnVuY3Rpb24gd2FzIHByb3ZpZGVkLCBjYWxsIGl0IHRvIG9idGFpbiB0aGUgdmFsdWVcbiAgICAgICAgICAgIC8vIGZvciBzZXJpYWxpemF0aW9uLlxuICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKG9iamVjdCwgcHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gYm9vbGVhbkNsYXNzKSB7XG4gICAgICAgICAgICAvLyBCb29sZWFucyBhcmUgcmVwcmVzZW50ZWQgbGl0ZXJhbGx5LlxuICAgICAgICAgICAgcmV0dXJuIFwiXCIgKyB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcykge1xuICAgICAgICAgICAgLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBgSW5maW5pdHlgIGFuZCBgTmFOYCBhcmUgc2VyaWFsaXplZCBhc1xuICAgICAgICAgICAgLy8gYFwibnVsbFwiYC5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA+IC0xIC8gMCAmJiB2YWx1ZSA8IDEgLyAwID8gXCJcIiArIHZhbHVlIDogXCJudWxsXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MpIHtcbiAgICAgICAgICAgIC8vIFN0cmluZ3MgYXJlIGRvdWJsZS1xdW90ZWQgYW5kIGVzY2FwZWQuXG4gICAgICAgICAgICByZXR1cm4gcXVvdGUoXCJcIiArIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhpcyBpcyBhIGxpbmVhciBzZWFyY2g7IHBlcmZvcm1hbmNlXG4gICAgICAgICAgICAvLyBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2YgdW5pcXVlIG5lc3RlZCBvYmplY3RzLlxuICAgICAgICAgICAgZm9yIChsZW5ndGggPSBzdGFjay5sZW5ndGg7IGxlbmd0aC0tOykge1xuICAgICAgICAgICAgICBpZiAoc3RhY2tbbGVuZ3RoXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBDeWNsaWMgc3RydWN0dXJlcyBjYW5ub3QgYmUgc2VyaWFsaXplZCBieSBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBZGQgdGhlIG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgICAgICAgICBzdGFjay5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgYW5kIGluZGVudCBvbmUgYWRkaXRpb25hbCBsZXZlbC5cbiAgICAgICAgICAgIHByZWZpeCA9IGluZGVudGF0aW9uO1xuICAgICAgICAgICAgaW5kZW50YXRpb24gKz0gd2hpdGVzcGFjZTtcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgYXJyYXkgZWxlbWVudHMuXG4gICAgICAgICAgICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IHNlcmlhbGl6ZShpbmRleCwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChlbGVtZW50ID09PSB1bmRlZiA/IFwibnVsbFwiIDogZWxlbWVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5sZW5ndGggPyAod2hpdGVzcGFjZSA/IFwiW1xcblwiICsgaW5kZW50YXRpb24gKyByZXN1bHRzLmpvaW4oXCIsXFxuXCIgKyBpbmRlbnRhdGlvbikgKyBcIlxcblwiICsgcHJlZml4ICsgXCJdXCIgOiAoXCJbXCIgKyByZXN1bHRzLmpvaW4oXCIsXCIpICsgXCJdXCIpKSA6IFwiW11cIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3QgbWVtYmVycy4gTWVtYmVycyBhcmUgc2VsZWN0ZWQgZnJvbVxuICAgICAgICAgICAgICAvLyBlaXRoZXIgYSB1c2VyLXNwZWNpZmllZCBsaXN0IG9mIHByb3BlcnR5IG5hbWVzLCBvciB0aGUgb2JqZWN0XG4gICAgICAgICAgICAgIC8vIGl0c2VsZi5cbiAgICAgICAgICAgICAgZm9yRWFjaChwcm9wZXJ0aWVzIHx8IHZhbHVlLCBmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IHNlcmlhbGl6ZShwcm9wZXJ0eSwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50ICE9PSB1bmRlZikge1xuICAgICAgICAgICAgICAgICAgLy8gQWNjb3JkaW5nIHRvIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjM6IFwiSWYgYGdhcGAge3doaXRlc3BhY2V9XG4gICAgICAgICAgICAgICAgICAvLyBpcyBub3QgdGhlIGVtcHR5IHN0cmluZywgbGV0IGBtZW1iZXJgIHtxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIn1cbiAgICAgICAgICAgICAgICAgIC8vIGJlIHRoZSBjb25jYXRlbmF0aW9uIG9mIGBtZW1iZXJgIGFuZCB0aGUgYHNwYWNlYCBjaGFyYWN0ZXIuXCJcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBcImBzcGFjZWAgY2hhcmFjdGVyXCIgcmVmZXJzIHRvIHRoZSBsaXRlcmFsIHNwYWNlXG4gICAgICAgICAgICAgICAgICAvLyBjaGFyYWN0ZXIsIG5vdCB0aGUgYHNwYWNlYCB7d2lkdGh9IGFyZ3VtZW50IHByb3ZpZGVkIHRvXG4gICAgICAgICAgICAgICAgICAvLyBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHF1b3RlKHByb3BlcnR5KSArIFwiOlwiICsgKHdoaXRlc3BhY2UgPyBcIiBcIiA6IFwiXCIpICsgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0cy5sZW5ndGggPyAod2hpdGVzcGFjZSA/IFwie1xcblwiICsgaW5kZW50YXRpb24gKyByZXN1bHRzLmpvaW4oXCIsXFxuXCIgKyBpbmRlbnRhdGlvbikgKyBcIlxcblwiICsgcHJlZml4ICsgXCJ9XCIgOiAoXCJ7XCIgKyByZXN1bHRzLmpvaW4oXCIsXCIpICsgXCJ9XCIpKSA6IFwie31cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIHRyYXZlcnNlZCBvYmplY3Qgc3RhY2suXG4gICAgICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFB1YmxpYzogYEpTT04uc3RyaW5naWZ5YC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG4gICAgICAgIGV4cG9ydHMuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHNvdXJjZSwgZmlsdGVyLCB3aWR0aCkge1xuICAgICAgICAgIHZhciB3aGl0ZXNwYWNlLCBjYWxsYmFjaywgcHJvcGVydGllcywgY2xhc3NOYW1lO1xuICAgICAgICAgIGlmIChvYmplY3RUeXBlc1t0eXBlb2YgZmlsdGVyXSAmJiBmaWx0ZXIpIHtcbiAgICAgICAgICAgIGlmICgoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbChmaWx0ZXIpKSA9PSBmdW5jdGlvbkNsYXNzKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrID0gZmlsdGVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBwcm9wZXJ0eSBuYW1lcyBhcnJheSBpbnRvIGEgbWFrZXNoaWZ0IHNldC5cbiAgICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDAsIGxlbmd0aCA9IGZpbHRlci5sZW5ndGgsIHZhbHVlOyBpbmRleCA8IGxlbmd0aDsgdmFsdWUgPSBmaWx0ZXJbaW5kZXgrK10sICgoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh2YWx1ZSkpLCBjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MgfHwgY2xhc3NOYW1lID09IG51bWJlckNsYXNzKSAmJiAocHJvcGVydGllc1t2YWx1ZV0gPSAxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgICAgaWYgKChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHdpZHRoKSkgPT0gbnVtYmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgYHdpZHRoYCB0byBhbiBpbnRlZ2VyIGFuZCBjcmVhdGUgYSBzdHJpbmcgY29udGFpbmluZ1xuICAgICAgICAgICAgICAvLyBgd2lkdGhgIG51bWJlciBvZiBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICBpZiAoKHdpZHRoIC09IHdpZHRoICUgMSkgPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yICh3aGl0ZXNwYWNlID0gXCJcIiwgd2lkdGggPiAxMCAmJiAod2lkdGggPSAxMCk7IHdoaXRlc3BhY2UubGVuZ3RoIDwgd2lkdGg7IHdoaXRlc3BhY2UgKz0gXCIgXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcykge1xuICAgICAgICAgICAgICB3aGl0ZXNwYWNlID0gd2lkdGgubGVuZ3RoIDw9IDEwID8gd2lkdGggOiB3aWR0aC5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiBkaXNjYXJkcyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBlbXB0eSBzdHJpbmcga2V5c1xuICAgICAgICAgIC8vIChgXCJcImApIG9ubHkgaWYgdGhleSBhcmUgdXNlZCBkaXJlY3RseSB3aXRoaW4gYW4gb2JqZWN0IG1lbWJlciBsaXN0XG4gICAgICAgICAgLy8gKGUuZy4sIGAhKFwiXCIgaW4geyBcIlwiOiAxfSlgKS5cbiAgICAgICAgICByZXR1cm4gc2VyaWFsaXplKFwiXCIsICh2YWx1ZSA9IHt9LCB2YWx1ZVtcIlwiXSA9IHNvdXJjZSwgdmFsdWUpLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgXCJcIiwgW10pO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBQdWJsaWM6IFBhcnNlcyBhIEpTT04gc291cmNlIHN0cmluZy5cbiAgICAgIGlmICghaGFzKFwianNvbi1wYXJzZVwiKSkge1xuICAgICAgICB2YXIgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogQSBtYXAgb2YgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIHVuZXNjYXBlZFxuICAgICAgICAvLyBlcXVpdmFsZW50cy5cbiAgICAgICAgdmFyIFVuZXNjYXBlcyA9IHtcbiAgICAgICAgICA5MjogXCJcXFxcXCIsXG4gICAgICAgICAgMzQ6ICdcIicsXG4gICAgICAgICAgNDc6IFwiL1wiLFxuICAgICAgICAgIDk4OiBcIlxcYlwiLFxuICAgICAgICAgIDExNjogXCJcXHRcIixcbiAgICAgICAgICAxMTA6IFwiXFxuXCIsXG4gICAgICAgICAgMTAyOiBcIlxcZlwiLFxuICAgICAgICAgIDExNDogXCJcXHJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBTdG9yZXMgdGhlIHBhcnNlciBzdGF0ZS5cbiAgICAgICAgdmFyIEluZGV4LCBTb3VyY2U7XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlc2V0cyB0aGUgcGFyc2VyIHN0YXRlIGFuZCB0aHJvd3MgYSBgU3ludGF4RXJyb3JgLlxuICAgICAgICB2YXIgYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgSW5kZXggPSBTb3VyY2UgPSBudWxsO1xuICAgICAgICAgIHRocm93IFN5bnRheEVycm9yKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJldHVybnMgdGhlIG5leHQgdG9rZW4sIG9yIGBcIiRcImAgaWYgdGhlIHBhcnNlciBoYXMgcmVhY2hlZFxuICAgICAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3VyY2Ugc3RyaW5nLiBBIHRva2VuIG1heSBiZSBhIHN0cmluZywgbnVtYmVyLCBgbnVsbGBcbiAgICAgICAgLy8gbGl0ZXJhbCwgb3IgQm9vbGVhbiBsaXRlcmFsLlxuICAgICAgICB2YXIgbGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBzb3VyY2UgPSBTb3VyY2UsIGxlbmd0aCA9IHNvdXJjZS5sZW5ndGgsIHZhbHVlLCBiZWdpbiwgcG9zaXRpb24sIGlzU2lnbmVkLCBjaGFyQ29kZTtcbiAgICAgICAgICB3aGlsZSAoSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgc3dpdGNoIChjaGFyQ29kZSkge1xuICAgICAgICAgICAgICBjYXNlIDk6IGNhc2UgMTA6IGNhc2UgMTM6IGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgLy8gU2tpcCB3aGl0ZXNwYWNlIHRva2VucywgaW5jbHVkaW5nIHRhYnMsIGNhcnJpYWdlIHJldHVybnMsIGxpbmVcbiAgICAgICAgICAgICAgICAvLyBmZWVkcywgYW5kIHNwYWNlIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAxMjM6IGNhc2UgMTI1OiBjYXNlIDkxOiBjYXNlIDkzOiBjYXNlIDU4OiBjYXNlIDQ0OlxuICAgICAgICAgICAgICAgIC8vIFBhcnNlIGEgcHVuY3R1YXRvciB0b2tlbiAoYHtgLCBgfWAsIGBbYCwgYF1gLCBgOmAsIG9yIGAsYCkgYXRcbiAgICAgICAgICAgICAgICAvLyB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNoYXJJbmRleEJ1Z2d5ID8gc291cmNlLmNoYXJBdChJbmRleCkgOiBzb3VyY2VbSW5kZXhdO1xuICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgICAgIC8vIGBcImAgZGVsaW1pdHMgYSBKU09OIHN0cmluZzsgYWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kXG4gICAgICAgICAgICAgICAgLy8gYmVnaW4gcGFyc2luZyB0aGUgc3RyaW5nLiBTdHJpbmcgdG9rZW5zIGFyZSBwcmVmaXhlZCB3aXRoIHRoZVxuICAgICAgICAgICAgICAgIC8vIHNlbnRpbmVsIGBAYCBjaGFyYWN0ZXIgdG8gZGlzdGluZ3Vpc2ggdGhlbSBmcm9tIHB1bmN0dWF0b3JzIGFuZFxuICAgICAgICAgICAgICAgIC8vIGVuZC1vZi1zdHJpbmcgdG9rZW5zLlxuICAgICAgICAgICAgICAgIGZvciAodmFsdWUgPSBcIkBcIiwgSW5kZXgrKzsgSW5kZXggPCBsZW5ndGg7KSB7XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA8IDMyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVuZXNjYXBlZCBBU0NJSSBjb250cm9sIGNoYXJhY3RlcnMgKHRob3NlIHdpdGggYSBjb2RlIHVuaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gbGVzcyB0aGFuIHRoZSBzcGFjZSBjaGFyYWN0ZXIpIGFyZSBub3QgcGVybWl0dGVkLlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA9PSA5Mikge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIHJldmVyc2Ugc29saWR1cyAoYFxcYCkgbWFya3MgdGhlIGJlZ2lubmluZyBvZiBhbiBlc2NhcGVkXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRyb2wgY2hhcmFjdGVyIChpbmNsdWRpbmcgYFwiYCwgYFxcYCwgYW5kIGAvYCkgb3IgVW5pY29kZVxuICAgICAgICAgICAgICAgICAgICAvLyBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDkyOiBjYXNlIDM0OiBjYXNlIDQ3OiBjYXNlIDk4OiBjYXNlIDExNjogY2FzZSAxMTA6IGNhc2UgMTAyOiBjYXNlIDExNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldml2ZSBlc2NhcGVkIGNvbnRyb2wgY2hhcmFjdGVycy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IFVuZXNjYXBlc1tjaGFyQ29kZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTc6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBgXFx1YCBtYXJrcyB0aGUgYmVnaW5uaW5nIG9mIGEgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgYW5kIHZhbGlkYXRlIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm91ci1kaWdpdCBjb2RlIHBvaW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW4gPSArK0luZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChwb3NpdGlvbiA9IEluZGV4ICsgNDsgSW5kZXggPCBwb3NpdGlvbjsgSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQSB2YWxpZCBzZXF1ZW5jZSBjb21wcmlzZXMgZm91ciBoZXhkaWdpdHMgKGNhc2UtXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluc2Vuc2l0aXZlKSB0aGF0IGZvcm0gYSBzaW5nbGUgaGV4YWRlY2ltYWwgdmFsdWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3IHx8IGNoYXJDb2RlID49IDk3ICYmIGNoYXJDb2RlIDw9IDEwMiB8fCBjaGFyQ29kZSA+PSA2NSAmJiBjaGFyQ29kZSA8PSA3MCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldml2ZSB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBmcm9tQ2hhckNvZGUoXCIweFwiICsgc291cmNlLnNsaWNlKGJlZ2luLCBJbmRleCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEludmFsaWQgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDM0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQW4gdW5lc2NhcGVkIGRvdWJsZS1xdW90ZSBjaGFyYWN0ZXIgbWFya3MgdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJlZ2luID0gSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9wdGltaXplIGZvciB0aGUgY29tbW9uIGNhc2Ugd2hlcmUgYSBzdHJpbmcgaXMgdmFsaWQuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjaGFyQ29kZSA+PSAzMiAmJiBjaGFyQ29kZSAhPSA5MiAmJiBjaGFyQ29kZSAhPSAzNCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwZW5kIHRoZSBzdHJpbmcgYXMtaXMuXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IHNvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDM0KSB7XG4gICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHRvIHRoZSBuZXh0IGNoYXJhY3RlciBhbmQgcmV0dXJuIHRoZSByZXZpdmVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFVudGVybWluYXRlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBudW1iZXJzIGFuZCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBiZWdpbiA9IEluZGV4O1xuICAgICAgICAgICAgICAgIC8vIEFkdmFuY2UgcGFzdCB0aGUgbmVnYXRpdmUgc2lnbiwgaWYgb25lIGlzIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDUpIHtcbiAgICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFBhcnNlIGFuIGludGVnZXIgb3IgZmxvYXRpbmctcG9pbnQgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KSB7XG4gICAgICAgICAgICAgICAgICAvLyBMZWFkaW5nIHplcm9lcyBhcmUgaW50ZXJwcmV0ZWQgYXMgb2N0YWwgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPT0gNDggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4ICsgMSkpLCBjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCBvY3RhbCBsaXRlcmFsLlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaXNTaWduZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBpbnRlZ2VyIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgIGZvciAoOyBJbmRleCA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBJbmRleCsrKTtcbiAgICAgICAgICAgICAgICAgIC8vIEZsb2F0cyBjYW5ub3QgY29udGFpbiBhIGxlYWRpbmcgZGVjaW1hbCBwb2ludDsgaG93ZXZlciwgdGhpc1xuICAgICAgICAgICAgICAgICAgLy8gY2FzZSBpcyBhbHJlYWR5IGFjY291bnRlZCBmb3IgYnkgdGhlIHBhcnNlci5cbiAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuY2hhckNvZGVBdChJbmRleCkgPT0gNDYpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPSArK0luZGV4O1xuICAgICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgZGVjaW1hbCBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyBwb3NpdGlvbiA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBwb3NpdGlvbisrKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09IEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCB0cmFpbGluZyBkZWNpbWFsLlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgSW5kZXggPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIGV4cG9uZW50cy4gVGhlIGBlYCBkZW5vdGluZyB0aGUgZXhwb25lbnQgaXNcbiAgICAgICAgICAgICAgICAgIC8vIGNhc2UtaW5zZW5zaXRpdmUuXG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSAxMDEgfHwgY2hhckNvZGUgPT0gNjkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBwYXN0IHRoZSBzaWduIGZvbGxvd2luZyB0aGUgZXhwb25lbnQsIGlmIG9uZSBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSA0MyB8fCBjaGFyQ29kZSA9PSA0NSkge1xuICAgICAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGV4cG9uZW50aWFsIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChwb3NpdGlvbiA9IEluZGV4OyBwb3NpdGlvbiA8IGxlbmd0aCAmJiAoKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpOyBwb3NpdGlvbisrKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09IEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCBlbXB0eSBleHBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIEluZGV4ID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAvLyBDb2VyY2UgdGhlIHBhcnNlZCB2YWx1ZSB0byBhIEphdmFTY3JpcHQgbnVtYmVyLlxuICAgICAgICAgICAgICAgICAgcmV0dXJuICtzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQSBuZWdhdGl2ZSBzaWduIG1heSBvbmx5IHByZWNlZGUgbnVtYmVycy5cbiAgICAgICAgICAgICAgICBpZiAoaXNTaWduZWQpIHtcbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGB0cnVlYCwgYGZhbHNlYCwgYW5kIGBudWxsYCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpID09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA0O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2Uuc2xpY2UoSW5kZXgsIEluZGV4ICsgNSkgPT0gXCJmYWxzZVwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA1O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpID09IFwibnVsbFwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA0O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFVucmVjb2duaXplZCB0b2tlbi5cbiAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZXR1cm4gdGhlIHNlbnRpbmVsIGAkYCBjaGFyYWN0ZXIgaWYgdGhlIHBhcnNlciBoYXMgcmVhY2hlZCB0aGUgZW5kXG4gICAgICAgICAgLy8gb2YgdGhlIHNvdXJjZSBzdHJpbmcuXG4gICAgICAgICAgcmV0dXJuIFwiJFwiO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBQYXJzZXMgYSBKU09OIGB2YWx1ZWAgdG9rZW4uXG4gICAgICAgIHZhciBnZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0cywgaGFzTWVtYmVycztcbiAgICAgICAgICBpZiAodmFsdWUgPT0gXCIkXCIpIHtcbiAgICAgICAgICAgIC8vIFVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0LlxuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoKGNoYXJJbmRleEJ1Z2d5ID8gdmFsdWUuY2hhckF0KDApIDogdmFsdWVbMF0pID09IFwiQFwiKSB7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgc2VudGluZWwgYEBgIGNoYXJhY3Rlci5cbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFyc2Ugb2JqZWN0IGFuZCBhcnJheSBsaXRlcmFscy5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIltcIikge1xuICAgICAgICAgICAgICAvLyBQYXJzZXMgYSBKU09OIGFycmF5LCByZXR1cm5pbmcgYSBuZXcgSmF2YVNjcmlwdCBhcnJheS5cbiAgICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKDs7IGhhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbGV4KCk7XG4gICAgICAgICAgICAgICAgLy8gQSBjbG9zaW5nIHNxdWFyZSBicmFja2V0IG1hcmtzIHRoZSBlbmQgb2YgdGhlIGFycmF5IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGFycmF5IGxpdGVyYWwgY29udGFpbnMgZWxlbWVudHMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGEgY29tbWEgc2VwYXJhdGluZyB0aGUgcHJldmlvdXMgZWxlbWVudCBmcm9tIHRoZVxuICAgICAgICAgICAgICAgIC8vIG5leHQuXG4gICAgICAgICAgICAgICAgaWYgKGhhc01lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVbmV4cGVjdGVkIHRyYWlsaW5nIGAsYCBpbiBhcnJheSBsaXRlcmFsLlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgYCxgIG11c3Qgc2VwYXJhdGUgZWFjaCBhcnJheSBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBFbGlzaW9ucyBhbmQgbGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiKSB7XG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZ2V0KHZhbHVlKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09IFwie1wiKSB7XG4gICAgICAgICAgICAgIC8vIFBhcnNlcyBhIEpTT04gb2JqZWN0LCByZXR1cm5pbmcgYSBuZXcgSmF2YVNjcmlwdCBvYmplY3QuXG4gICAgICAgICAgICAgIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgZm9yICg7OyBoYXNNZW1iZXJzIHx8IChoYXNNZW1iZXJzID0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgIC8vIEEgY2xvc2luZyBjdXJseSBicmFjZSBtYXJrcyB0aGUgZW5kIG9mIHRoZSBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ9XCIpIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgb2JqZWN0IGxpdGVyYWwgY29udGFpbnMgbWVtYmVycywgdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgYmUgYSBjb21tYSBzZXBhcmF0b3IuXG4gICAgICAgICAgICAgICAgaWYgKGhhc01lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIixcIikge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCJ9XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBVbmV4cGVjdGVkIHRyYWlsaW5nIGAsYCBpbiBvYmplY3QgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggb2JqZWN0IG1lbWJlci5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gTGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQsIG9iamVjdCBwcm9wZXJ0eSBuYW1lcyBtdXN0IGJlXG4gICAgICAgICAgICAgICAgLy8gZG91YmxlLXF1b3RlZCBzdHJpbmdzLCBhbmQgYSBgOmAgbXVzdCBzZXBhcmF0ZSBlYWNoIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgLy8gbmFtZSBhbmQgdmFsdWUuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiLFwiIHx8IHR5cGVvZiB2YWx1ZSAhPSBcInN0cmluZ1wiIHx8IChjaGFySW5kZXhCdWdneSA/IHZhbHVlLmNoYXJBdCgwKSA6IHZhbHVlWzBdKSAhPSBcIkBcIiB8fCBsZXgoKSAhPSBcIjpcIikge1xuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1t2YWx1ZS5zbGljZSgxKV0gPSBnZXQobGV4KCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0b2tlbiBlbmNvdW50ZXJlZC5cbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogVXBkYXRlcyBhIHRyYXZlcnNlZCBvYmplY3QgbWVtYmVyLlxuICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIGVsZW1lbnQgPSB3YWxrKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgICBpZiAoZWxlbWVudCA9PT0gdW5kZWYpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VyY2VbcHJvcGVydHldID0gZWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHRyYXZlcnNlcyBhIHBhcnNlZCBKU09OIG9iamVjdCwgaW52b2tpbmcgdGhlXG4gICAgICAgIC8vIGBjYWxsYmFja2AgZnVuY3Rpb24gZm9yIGVhY2ggdmFsdWUuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gICAgICAgIC8vIGBXYWxrKGhvbGRlciwgbmFtZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICAgIHZhciB3YWxrID0gZnVuY3Rpb24gKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gc291cmNlW3Byb3BlcnR5XSwgbGVuZ3RoO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gYGZvckVhY2hgIGNhbid0IGJlIHVzZWQgdG8gdHJhdmVyc2UgYW4gYXJyYXkgaW4gT3BlcmEgPD0gOC41NFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpdHMgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgaW1wbGVtZW50YXRpb24gcmV0dXJucyBgZmFsc2VgXG4gICAgICAgICAgICAvLyBmb3IgYXJyYXkgaW5kaWNlcyAoZS5nLiwgYCFbMSwgMiwgM10uaGFzT3duUHJvcGVydHkoXCIwXCIpYCkuXG4gICAgICAgICAgICBpZiAoZ2V0Q2xhc3MuY2FsbCh2YWx1ZSkgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICBmb3IgKGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgbGVuZ3RoLS07KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlKHZhbHVlLCBsZW5ndGgsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlKHZhbHVlLCBwcm9wZXJ0eSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoc291cmNlLCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFB1YmxpYzogYEpTT04ucGFyc2VgLiBTZWUgRVMgNS4xIHNlY3Rpb24gMTUuMTIuMi5cbiAgICAgICAgZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIChzb3VyY2UsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCwgdmFsdWU7XG4gICAgICAgICAgSW5kZXggPSAwO1xuICAgICAgICAgIFNvdXJjZSA9IFwiXCIgKyBzb3VyY2U7XG4gICAgICAgICAgcmVzdWx0ID0gZ2V0KGxleCgpKTtcbiAgICAgICAgICAvLyBJZiBhIEpTT04gc3RyaW5nIGNvbnRhaW5zIG11bHRpcGxlIHRva2VucywgaXQgaXMgaW52YWxpZC5cbiAgICAgICAgICBpZiAobGV4KCkgIT0gXCIkXCIpIHtcbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJlc2V0IHRoZSBwYXJzZXIgc3RhdGUuXG4gICAgICAgICAgSW5kZXggPSBTb3VyY2UgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayAmJiBnZXRDbGFzcy5jYWxsKGNhbGxiYWNrKSA9PSBmdW5jdGlvbkNsYXNzID8gd2FsaygodmFsdWUgPSB7fSwgdmFsdWVbXCJcIl0gPSByZXN1bHQsIHZhbHVlKSwgXCJcIiwgY2FsbGJhY2spIDogcmVzdWx0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydHNbXCJydW5JbkNvbnRleHRcIl0gPSBydW5JbkNvbnRleHQ7XG4gICAgcmV0dXJuIGV4cG9ydHM7XG4gIH1cblxuICBpZiAoZnJlZUV4cG9ydHMgJiYgIWlzTG9hZGVyKSB7XG4gICAgLy8gRXhwb3J0IGZvciBDb21tb25KUyBlbnZpcm9ubWVudHMuXG4gICAgcnVuSW5Db250ZXh0KHJvb3QsIGZyZWVFeHBvcnRzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFeHBvcnQgZm9yIHdlYiBicm93c2VycyBhbmQgSmF2YVNjcmlwdCBlbmdpbmVzLlxuICAgIHZhciBuYXRpdmVKU09OID0gcm9vdC5KU09OLFxuICAgICAgICBwcmV2aW91c0pTT04gPSByb290W1wiSlNPTjNcIl0sXG4gICAgICAgIGlzUmVzdG9yZWQgPSBmYWxzZTtcblxuICAgIHZhciBKU09OMyA9IHJ1bkluQ29udGV4dChyb290LCAocm9vdFtcIkpTT04zXCJdID0ge1xuICAgICAgLy8gUHVibGljOiBSZXN0b3JlcyB0aGUgb3JpZ2luYWwgdmFsdWUgb2YgdGhlIGdsb2JhbCBgSlNPTmAgb2JqZWN0IGFuZFxuICAgICAgLy8gcmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgYEpTT04zYCBvYmplY3QuXG4gICAgICBcIm5vQ29uZmxpY3RcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWlzUmVzdG9yZWQpIHtcbiAgICAgICAgICBpc1Jlc3RvcmVkID0gdHJ1ZTtcbiAgICAgICAgICByb290LkpTT04gPSBuYXRpdmVKU09OO1xuICAgICAgICAgIHJvb3RbXCJKU09OM1wiXSA9IHByZXZpb3VzSlNPTjtcbiAgICAgICAgICBuYXRpdmVKU09OID0gcHJldmlvdXNKU09OID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSlNPTjM7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgcm9vdC5KU09OID0ge1xuICAgICAgXCJwYXJzZVwiOiBKU09OMy5wYXJzZSxcbiAgICAgIFwic3RyaW5naWZ5XCI6IEpTT04zLnN0cmluZ2lmeVxuICAgIH07XG4gIH1cblxuICAvLyBFeHBvcnQgZm9yIGFzeW5jaHJvbm91cyBtb2R1bGUgbG9hZGVycy5cbiAgaWYgKGlzTG9hZGVyKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBKU09OMztcbiAgICB9KTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gdG9BcnJheVxuXG5mdW5jdGlvbiB0b0FycmF5KGxpc3QsIGluZGV4KSB7XG4gICAgdmFyIGFycmF5ID0gW11cblxuICAgIGluZGV4ID0gaW5kZXggfHwgMFxuXG4gICAgZm9yICh2YXIgaSA9IGluZGV4IHx8IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycmF5W2kgLSBpbmRleF0gPSBsaXN0W2ldXG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5XG59XG4iLCIoZnVuY3Rpb24oZ2xvYmFsLCBfbWFpbiwgbW9kdWxlRGVmcywgY2FjaGVkTW9kdWxlcywgX2VudHJpZXMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGVNZXRhID0ge1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL2xpYi9oYXMuanNcIjp7XCJpbmRleFwiOjgsXCJoYXNoXCI6XCJIa3k0UVlWclUxK2tGSElFdXhQeVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9saWIvc3RyLXNldC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL2luYy9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbGliL3N0ci1zZXQuanNcIjp7XCJpbmRleFwiOjksXCJoYXNoXCI6XCJsY3JEbVFLNHVhcU9xTitGVjQvOVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9pbmMvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9vbi5qc1wiOntcImluZGV4XCI6ODAsXCJoYXNoXCI6XCJ5NU1Pb0ZwVEtLQkh3RThxOGphZVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvc29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIl19LFwiaG1yL25vZGVfbW9kdWxlcy9mb28vYnJvd3Nlci5qc1wiOntcImluZGV4XCI6NixcImhhc2hcIjpcIkdaYWpZWnNCNlpyalJDY2hkMmRYXCIsXCJwYXJlbnRzXCI6W1wiaG1yL21zZy5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzXCI6e1wiaW5kZXhcIjo4NSxcImhhc2hcIjpcImFzeE5lS0tFWW1ueG5BeElDVFM2XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvbWFuYWdlci5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3BhcnNldXJpL2luZGV4LmpzXCI6e1wiaW5kZXhcIjoxMTcsXCJoYXNoXCI6XCJjL2M3WGZ0U0k2Q2xGYzloMmpPaFwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvdXJsLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3NvY2tldC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL3VybC5qc1wiOntcImluZGV4XCI6ODIsXCJoYXNoXCI6XCJlcWh1WXBtRXFZMWxkOGYyV0JZSFwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9kZWJ1Zy9icm93c2VyLmpzXCI6e1wiaW5kZXhcIjo4NixcImhhc2hcIjpcIlM3NnEyOGYxVlBKSWNDdEpuMWVxXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi91cmwuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvc29ja2V0LmlvLXBhcnNlci9pbmRleC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy93ZWJzb2NrZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9wb2xsaW5nLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy14aHIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvc29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL2lzLWJ1ZmZlci5qc1wiOntcImluZGV4XCI6MTIwLFwiaGFzaFwiOlwiVGdtQWlTMU02ZFFlMDR6a3NEdjRcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvYmluYXJ5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtYmluZC9pbmRleC5qc1wiOntcImluZGV4XCI6ODQsXCJoYXNoXCI6XCI0eUljVncrYWZ3VXNuVFF5STBhM1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvc29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9pbmRleG9mL2luZGV4LmpzXCI6e1wiaW5kZXhcIjoxMTYsXCJoYXNoXCI6XCI4ek1HVjBqMElENWJVSWVUN3IrTVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvc29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9iYWNrbzIvaW5kZXguanNcIjp7XCJpbmRleFwiOjgzLFwiaGFzaFwiOlwiTDVyeTNtZlZFdzF3Z214OVNhK3FcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy90by1hcnJheS9pbmRleC5qc1wiOntcImluZGV4XCI6MTI0LFwiaGFzaFwiOlwiMkVvZ2dhZnhYK0dMWGtYaWFHam1cIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL3NvY2tldC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9hcnJheS96aXBPYmplY3QuanNcIjp7XCJpbmRleFwiOjExLFwiaGFzaFwiOlwiZktmU3dJelBvNVNVeDlkMERrZ05cIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvaW5jL2luZGV4LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNBcnJheS5qc1wiOntcImluZGV4XCI6NjUsXCJoYXNoXCI6XCJycE1pRTFaMTk5L1haQ2pubzRLTlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2FycmF5L3ppcE9iamVjdC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9tYXAuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vZmlsdGVyLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVGb3JFYWNoLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0tleS5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvdG9QYXRoLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3Qva2V5c0luLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9zaGltS2V5cy5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWxEZWVwLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlc1Byb3BlcnR5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL3NvbWUuanNcIl19LFwiaG1yL25vZGVfbW9kdWxlcy9iYXIvbWFpbi5qc1wiOntcImluZGV4XCI6NSxcImhhc2hcIjpcIjNHMHZ4NHliaGpPMGVZaTNScVVQXCIsXCJwYXJlbnRzXCI6W1wiaG1yL21zZy5qc1wiXX0sXCJobXIvbXNnLmpzXCI6e1wiaW5kZXhcIjo0LFwiaGFzaFwiOlwiaEVaNFdOQkxETFFBUEhmNDR3TC9cIixcInBhcmVudHNcIjpbXCJobXIvYnJvd3Nlci5qc1wiXX0sXCJobXIvYnJvd3Nlci5qc1wiOntcImluZGV4XCI6MyxcImhhc2hcIjpcImgwMU1QU1R3eC94SVI1RzNaNDVWXCIsXCJwYXJlbnRzXCI6W119LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYXJyYXlFYWNoLmpzXCI6e1wiaW5kZXhcIjoxNyxcImhhc2hcIjpcImVMeFVCVnNiOHZwRmJ1MFZONEtMXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9mb3JFYWNoLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2FycmF5U29tZS5qc1wiOntcImluZGV4XCI6MjAsXCJoYXNoXCI6XCJHeGVKUHhKajJqVWc1VHpWNWdMdlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2VxdWFsQXJyYXlzLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL3NvbWUuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYXJyYXlNYXAuanNcIjp7XCJpbmRleFwiOjE5LFwiaGFzaFwiOlwieGRyOGMwSnNVRmFwSUhUdU01VkVcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL21hcC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9hcnJheUZpbHRlci5qc1wiOntcImluZGV4XCI6MTgsXCJoYXNoXCI6XCJCR3VuejB3MVF6Slh5cVFTT2RaYlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vZmlsdGVyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvc29ja2V0LmlvLXBhcnNlci9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qc1wiOntcImluZGV4XCI6MTIyLFwiaGFzaFwiOlwiZEt0ZXdzMVM0c0h2YVpoWitjZXFcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvYmluYXJ5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qc1wiOntcImluZGV4XCI6MTIxLFwiaGFzaFwiOlwiMHVMMUxTYS9tT2orTGx1K0hUWjdcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9qc29uMy9saWIvanNvbjMuanNcIjp7XCJpbmRleFwiOjEyMyxcImhhc2hcIjpcImdvcTJiM0JIOTBUMWFzd0FzQjNyXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL2luZGV4LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VTb21lLmpzXCI6e1wiaW5kZXhcIjozOSxcImhhc2hcIjpcImxDVzVBdEhuOVgydlN1UGdTOHBrXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9zb21lLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VFYWNoLmpzXCI6e1wiaW5kZXhcIjoyNSxcImhhc2hcIjpcIkppN05MQ0poZHpTQmxwREkrcUMzXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVNvbWUuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXAuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VGaWx0ZXIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vZm9yRWFjaC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWFwLmpzXCI6e1wiaW5kZXhcIjozMyxcImhhc2hcIjpcIm9mdjJqQ0U1UWxhaHB5bkc0cmtOXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9tYXAuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNBcnJheUxpa2UuanNcIjp7XCJpbmRleFwiOjU0LFwiaGFzaFwiOlwiNzZBd3RoejhDaFRnakdrMEpaNllcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWFwLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc0FyZ3VtZW50cy5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2tleXMuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9tYXAuanNcIjp7XCJpbmRleFwiOjE0LFwiaGFzaFwiOlwiNjNuNXg4R1RpV1B1eGlaem05VE1cIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvaW5jL2luZGV4LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VDYWxsYmFjay5qc1wiOntcImluZGV4XCI6MjMsXCJoYXNoXCI6XCJGREVteG9oMWNYWS9oZGRnUE5HV1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vbWFwLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL2ZpbHRlci5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlT2JqZWN0TWFwcGVyLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL3NvbWUuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUZpbHRlci5qc1wiOntcImluZGV4XCI6MjYsXCJoYXNoXCI6XCJ5eXZRYWc0aHc4c0l0QkZmMy85VFwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vZmlsdGVyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vZmlsdGVyLmpzXCI6e1wiaW5kZXhcIjoxMixcImhhc2hcIjpcIlh0VTV6akNxU0RsWWN3T0xVQzEzXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL2luYy9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVGb3JPd24uanNcIjp7XCJpbmRleFwiOjQ2LFwiaGFzaFwiOlwiS0pxaWpqdkpPN2QxblUxN1N6M2NcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvZm9yT3duLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2JpbmRDYWxsYmFjay5qc1wiOntcImluZGV4XCI6NDEsXCJoYXNoXCI6XCJTNml5MUkrNTNJRXpETFNHdVcwalwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUZvck93bi5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQXNzaWduZXIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUZvckVhY2guanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VDYWxsYmFjay5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVPYmplY3RNYXBwZXIuanNcIjp7XCJpbmRleFwiOjQ3LFwiaGFzaFwiOlwiY3A4cytaNmtoaUtkSzVRQ1ErTXNcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvbWFwVmFsdWVzLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VGb3JPd24uanNcIjp7XCJpbmRleFwiOjI4LFwiaGFzaFwiOlwic09MbUhIMk9vc21lVzkyWWFMSy9cIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVPYmplY3RNYXBwZXIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VFYWNoLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvZm9yT3duLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9tYXBWYWx1ZXMuanNcIjp7XCJpbmRleFwiOjc0LFwiaGFzaFwiOlwiMkhmQW1WdWFWR2ZjOHBkNXpJYUNcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvaW5jL2luZGV4LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Fzc2lnbldpdGguanNcIjp7XCJpbmRleFwiOjIxLFwiaGFzaFwiOlwiYUtCS3lmSUtxWnNOT0hBYkpUQUlcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvYXNzaWduLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9rZXlzLmpzXCI6e1wiaW5kZXhcIjo3MixcImhhc2hcIjpcIkJiWEdOSWNmYXRTcDMydVdPQkFWXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYXNzaWduV2l0aC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUFzc2lnbi5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L3BhaXJzLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlRm9yT3duLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9lcXVhbE9iamVjdHMuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL2JpbmFyeS5qc1wiOntcImluZGV4XCI6MTE4LFwiaGFzaFwiOlwiSjBWcnFKcnBoRWNsdUdmMHo5UGFcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1wYXJzZXIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tcGFyc2VyL2luZGV4LmpzXCI6e1wiaW5kZXhcIjoxMTksXCJoYXNoXCI6XCI3UHJnT1JZOWZhSWEzUXZYZUhqVVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvc29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvdXRpbGl0eS9pZGVudGl0eS5qc1wiOntcImluZGV4XCI6NzYsXCJoYXNoXCI6XCJBL2N6NU80bm5obzJ4MmU1S0lXU1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2JpbmRDYWxsYmFjay5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUNhbGxiYWNrLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzTGVuZ3RoLmpzXCI6e1wiaW5kZXhcIjo1OCxcImhhc2hcIjpcIkRGSUtJMTIxVnplRStwQmJ4MU9hXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNBcnJheUxpa2UuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUJhc2VFYWNoLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzQXJyYXkuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9rZXlzSW4uanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL3NoaW1LZXlzLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzVHlwZWRBcnJheS5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc09iamVjdExpa2UuanNcIjp7XCJpbmRleFwiOjU5LFwiaGFzaFwiOlwicUVHbkFXSk5vQWV0T0lKN1lLaVZcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzTmF0aXZlLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzQXJyYXkuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNBcmd1bWVudHMuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNUeXBlZEFycmF5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNFcXVhbC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0luZGV4LmpzXCI6e1wiaW5kZXhcIjo1NSxcImhhc2hcIjpcIkk4eTVBc2pML2x3RGxPUkRPcXFNXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9rZXlzSW4uanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL3NoaW1LZXlzLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNPYmplY3QuanNcIjp7XCJpbmRleFwiOjY4LFwiaGFzaFwiOlwiR28rZFRMRnFPMUtKTit1UUxiOHNcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvdG9PYmplY3QuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzU3RyaWN0Q29tcGFyYWJsZS5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc0Z1bmN0aW9uLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3Qva2V5c0luLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3Qva2V5cy5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWwuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUNvcHkuanNcIjp7XCJpbmRleFwiOjI0LFwiaGFzaFwiOlwiV3ZHaThJeXdNNnU3Wk5Ydnp0d2dcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlQXNzaWduLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VBc3NpZ24uanNcIjp7XCJpbmRleFwiOjIyLFwiaGFzaFwiOlwiNlZYODdZb2VOZ0R2TVV5aUFjLzdcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvYXNzaWduLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2Z1bmN0aW9uL3Jlc3RQYXJhbS5qc1wiOntcImluZGV4XCI6MTYsXCJoYXNoXCI6XCIvUlJIOU1DdGpBcnIxcDNRZWg2M1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUFzc2lnbmVyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUFzc2lnbmVyLmpzXCI6e1wiaW5kZXhcIjo0MixcImhhc2hcIjpcIlg4UjgxanZSQ29mWTFCbkcrQS9MXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2Fzc2lnbi5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0l0ZXJhdGVlQ2FsbC5qc1wiOntcImluZGV4XCI6NTYsXCJoYXNoXCI6XCJkWE1uTlJldkFpek9CaXNLQ0Vlc1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUFzc2lnbmVyLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL3NvbWUuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2Fzc2lnbi5qc1wiOntcImluZGV4XCI6NzAsXCJoYXNoXCI6XCI5V09oSkJSRWw4QU85SHM2Q3IrUVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9pbmMvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9kZWJ1Zy9ub2RlX21vZHVsZXMvbXMvaW5kZXguanNcIjp7XCJpbmRleFwiOjg4LFwiaGFzaFwiOlwiSGFuVkttNUFrVjZNT2RIUkFNQ1RcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2RlYnVnL2RlYnVnLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZGVidWcvZGVidWcuanNcIjp7XCJpbmRleFwiOjg3LFwiaGFzaFwiOlwieXFkUjduSmM3d3hJSHpGRE56RytcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2RlYnVnL2Jyb3dzZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9oYXMtYmluYXJ5L25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzXCI6e1wiaW5kZXhcIjoxMTUsXCJoYXNoXCI6XCJkS3Rld3MxUzRzSHZhWmhaK2NlcVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvaGFzLWJpbmFyeS9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2hhcy1iaW5hcnkvaW5kZXguanNcIjp7XCJpbmRleFwiOjExNCxcImhhc2hcIjpcImhwMk5HSENKSWplMTJ4UFgvRk1KXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIjp7XCJpbmRleFwiOjgxLFwiaGFzaFwiOlwiZFpod3JGMzZ1RklHYkRaTWhzczZcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9saWIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlRm9yRWFjaC5qc1wiOntcImluZGV4XCI6NDUsXCJoYXNoXCI6XCJpSnRXQkN6eCtienpTTHdsYWFSdlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vZm9yRWFjaC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXRMZW5ndGguanNcIjp7XCJpbmRleFwiOjUxLFwiaGFzaFwiOlwiVWlaNkYwK25YWjBmaUtja1Rxbk1cIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0FycmF5TGlrZS5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQmFzZUVhY2guanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVNsaWNlLmpzXCI6e1wiaW5kZXhcIjozOCxcImhhc2hcIjpcIk9MZ3c5WFZpYzFXMEFLamVoekhCXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZU1hdGNoZXNQcm9wZXJ0eS5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9hcnJheS9sYXN0LmpzXCI6e1wiaW5kZXhcIjoxMCxcImhhc2hcIjpcIjNvWFhhMmlkV2JLeVNWTGNxM29zXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZU1hdGNoZXNQcm9wZXJ0eS5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlUHJvcGVydHkuanNcIjp7XCJpbmRleFwiOjM2LFwiaGFzaFwiOlwiWXVrMnRwb2YyMXEwWGwyc1FnODlcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXRMZW5ndGguanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL3V0aWxpdHkvcHJvcGVydHkuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvdG9PYmplY3QuanNcIjp7XCJpbmRleFwiOjYyLFwiaGFzaFwiOlwiOGYzZXVsQjk3RGRkQlJkY1UrN3ZcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVCYXNlRWFjaC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzTWF0Y2guanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VHZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzS2V5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVCYXNlRm9yLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvcGFpcnMuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXRjaGVzLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlc1Byb3BlcnR5LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUJhc2VFYWNoLmpzXCI6e1wiaW5kZXhcIjo0MyxcImhhc2hcIjpcIis1WDNadG03OE5OUHI5dlFaN2ZCXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUVhY2guanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvY29sbGVjdGlvbi9mb3JFYWNoLmpzXCI6e1wiaW5kZXhcIjoxMyxcImhhc2hcIjpcIjBMbzFSTnQxOFBNby9IQUtiSEV1XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL2luYy9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNNYXRjaC5qc1wiOntcImluZGV4XCI6MzIsXCJoYXNoXCI6XCJFcHVKemxnMjA0YVIzNVQ0UUtjU1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXRjaGVzLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VJc0VxdWFsLmpzXCI6e1wiaW5kZXhcIjozMCxcImhhc2hcIjpcImRCZ29GWG5oajlLSDZvWDNkUXdhXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzTWF0Y2guanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXRjaGVzUHJvcGVydHkuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUdldC5qc1wiOntcImluZGV4XCI6MjksXCJoYXNoXCI6XCJIOUVpTWQzdWxsUXBSa3Zvb0xnelwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VQcm9wZXJ0eURlZXAuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VNYXRjaGVzUHJvcGVydHkuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNLZXkuanNcIjp7XCJpbmRleFwiOjU3LFwiaGFzaFwiOlwibERwdzVjcmNSbVRSRXhUTFZUS2NcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC91dGlsaXR5L3Byb3BlcnR5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlc1Byb3BlcnR5LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzU3RyaWN0Q29tcGFyYWJsZS5qc1wiOntcImluZGV4XCI6NjAsXCJoYXNoXCI6XCJvZk5QNC9uRnJ6NVJrYjNrR09oblwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2dldE1hdGNoRGF0YS5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZU1hdGNoZXNQcm9wZXJ0eS5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlUHJvcGVydHlEZWVwLmpzXCI6e1wiaW5kZXhcIjozNyxcImhhc2hcIjpcIm1xWDFPeVlkbmRKMTgzbHlsL3NuXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvdXRpbGl0eS9wcm9wZXJ0eS5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC90b1BhdGguanNcIjp7XCJpbmRleFwiOjYzLFwiaGFzaFwiOlwiZmFWUXZzYitMU0xJNHVhTWd0clFcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlUHJvcGVydHlEZWVwLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlc1Byb3BlcnR5LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL3V0aWxpdHkvcHJvcGVydHkuanNcIjp7XCJpbmRleFwiOjc3LFwiaGFzaFwiOlwiN0lvT0kvdUdaQ3hiY1kyM3VRREtcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlQ2FsbGJhY2suanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQmFzZUZvci5qc1wiOntcImluZGV4XCI6NDQsXCJoYXNoXCI6XCI5UldsRmFCT3VlbHZ3Z2toWWdQR1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VGb3IuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUZvci5qc1wiOntcImluZGV4XCI6MjcsXCJoYXNoXCI6XCJOR3hjWjBuMDErdzJHMVB6eUJsWVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VGb3JPd24uanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVRvU3RyaW5nLmpzXCI6e1wiaW5kZXhcIjo0MCxcImhhc2hcIjpcIkFCRlFGZjE0cFJFQ2kzc3c4b0tWXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvdG9QYXRoLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL29iamVjdC9wYWlycy5qc1wiOntcImluZGV4XCI6NzUsXCJoYXNoXCI6XCJ4Nklsd3g4ZW5jdmcvQlc1QVBJMlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2dldE1hdGNoRGF0YS5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXRNYXRjaERhdGEuanNcIjp7XCJpbmRleFwiOjUyLFwiaGFzaFwiOlwibjBQSFdoTnM2WVorRHpnWU1IUHhcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlcy5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlcy5qc1wiOntcImluZGV4XCI6MzQsXCJoYXNoXCI6XCJDd2o1R1NpUXY5L0U4blNGQm9YMlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VDYWxsYmFjay5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzRnVuY3Rpb24uanNcIjp7XCJpbmRleFwiOjY2LFwiaGFzaFwiOlwieGtmenJaTlpQR0dPSWYwa0U4WTlcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzTmF0aXZlLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNOYXRpdmUuanNcIjp7XCJpbmRleFwiOjY3LFwiaGFzaFwiOlwiMnJzdGFBTHkxRFcwSlNEZGlqcHNcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXROYXRpdmUuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvZ2V0TmF0aXZlLmpzXCI6e1wiaW5kZXhcIjo1MyxcImhhc2hcIjpcIjdHUlo3MTE1QlN1b2MvMWJkYUJLXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc0FycmF5LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3Qva2V5cy5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzQXJndW1lbnRzLmpzXCI6e1wiaW5kZXhcIjo2NCxcImhhc2hcIjpcInhRNG1xYnNLUU1DbXRzUGJmUWM2XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2tleXNJbi5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvc2hpbUtleXMuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2tleXNJbi5qc1wiOntcImluZGV4XCI6NzMsXCJoYXNoXCI6XCI4UE9aaUdSMWZSSHNvNTc5RzQ2WlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL3NoaW1LZXlzLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL3NoaW1LZXlzLmpzXCI6e1wiaW5kZXhcIjo2MSxcImhhc2hcIjpcIm9PNGFLb3BteFJmUHh5S2dSWDlGXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2tleXMuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2Zvck93bi5qc1wiOntcImluZGV4XCI6NzEsXCJoYXNoXCI6XCJMWjc3UHp1Slcvd2xnVlBkdmxHY1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9pbmMvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qc1wiOntcImluZGV4XCI6OTksXCJoYXNoXCI6XCIwdUwxTFNhL21PaitMbHUrSFRaN1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy14aHIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvc29ja2V0LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2VxdWFsQnlUYWcuanNcIjp7XCJpbmRleFwiOjQ5LFwiaGFzaFwiOlwiK3krK2dlc0pwUHZ5TSsyRThhTkJcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNFcXVhbERlZXAuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9wYXJzZWpzb24vaW5kZXguanNcIjp7XCJpbmRleFwiOjExMSxcImhhc2hcIjpcIlU0SGlqNlgwUExnaDZOV0Fvd0FqXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9wYXJzZXFzL2luZGV4LmpzXCI6e1wiaW5kZXhcIjoxMTIsXCJoYXNoXCI6XCJGSTR0UkVMd0k1SXR6K2Nrd1IrbVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy93ZWJzb2NrZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9wb2xsaW5nLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3NvY2tldC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1wYXJzZXIvbGliL2tleXMuanNcIjp7XCJpbmRleFwiOjEwMixcImhhc2hcIjpcIm9GeUtOVEEwdHdseVFWaFZ6cDluXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9icm93c2VyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2VxdWFsQXJyYXlzLmpzXCI6e1wiaW5kZXhcIjo0OCxcImhhc2hcIjpcIk9CSkw2dnVhT290dTVmbFVlQ252XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUlzRXF1YWxEZWVwLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2VxdWFsT2JqZWN0cy5qc1wiOntcImluZGV4XCI6NTAsXCJoYXNoXCI6XCI0NEl5NDlrRGNhQVpzeWtFZGFIM1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VJc0VxdWFsRGVlcC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzVHlwZWRBcnJheS5qc1wiOntcImluZGV4XCI6NjksXCJoYXNoXCI6XCJhVmVaeUlGR2FkckVoN0VzYURSdVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VJc0VxdWFsRGVlcC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNFcXVhbERlZXAuanNcIjp7XCJpbmRleFwiOjMxLFwiaGFzaFwiOlwibHRaWmFNSG16cDZkOWpCbHRWM1lcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSXNFcXVhbC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWF0Y2hlc1Byb3BlcnR5LmpzXCI6e1wiaW5kZXhcIjozNSxcImhhc2hcIjpcIk91ZG5Tb2VxMkE0cWw1bGc1MWtjXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUNhbGxiYWNrLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vc29tZS5qc1wiOntcImluZGV4XCI6MTUsXCJoYXNoXCI6XCI5SnlKRmZkQ3g1NnBtUjZmd005cVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9pbmMvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL2luYy9pbmRleC5qc1wiOntcImluZGV4XCI6NyxcImhhc2hcIjpcImF6eUduRXhYMnVWbFBJN29NOTJiXCIsXCJwYXJlbnRzXCI6W119LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnQuanNcIjp7XCJpbmRleFwiOjkyLFwiaGFzaFwiOlwicUFTMWpDOGdWVEc0eWIvQWFub0JcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvd2Vic29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9icm93c2VyLmpzXCI6e1wiaW5kZXhcIjoxMDEsXCJoYXNoXCI6XCJFTTNnWU9ZdmRKSWZtaWZEdGVRclwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvd2Vic29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi9zb2NrZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy91dGY4L3V0ZjguanNcIjp7XCJpbmRleFwiOjEwOSxcImhhc2hcIjpcIjZuc3FhbmZCd2NieG43MG9zLzg5XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9icm93c2VyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLXBhcnNlci9ub2RlX21vZHVsZXMvYXJyYXlidWZmZXIuc2xpY2UvaW5kZXguanNcIjp7XCJpbmRleFwiOjEwNCxcImhhc2hcIjpcIlJTYjVaeDlDZ1gzYWRqemJ2Zi9rXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9icm93c2VyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLXBhcnNlci9ub2RlX21vZHVsZXMvYWZ0ZXIvaW5kZXguanNcIjp7XCJpbmRleFwiOjEwMyxcImhhc2hcIjpcIk56UGZYV0VDbU04clcvNmZka2NqXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL2xpYi9icm93c2VyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLXBhcnNlci9ub2RlX21vZHVsZXMvYmxvYi9pbmRleC5qc1wiOntcImluZGV4XCI6MTA2LFwiaGFzaFwiOlwia2UvVTRXc0JjVmJIVUh5aXNBanVcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1wYXJzZXIvbGliL2Jyb3dzZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9iYXNlNjQtYXJyYXlidWZmZXIvbGliL2Jhc2U2NC1hcnJheWJ1ZmZlci5qc1wiOntcImluZGV4XCI6MTA1LFwiaGFzaFwiOlwiZFc2Y25rdGpCSXlaNmJ2OXZScDJcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1wYXJzZXIvbGliL2Jyb3dzZXIuanNcIl19LFwiLi4vLi4vc29mdHdhcmUvbm9kZS12NC4xLjEtbGludXgteDY0L2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qc1wiOntcImluZGV4XCI6MSxcImhhc2hcIjpcIjQ3REVRcGo4SEJTYSsvVEltVys1XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3dlYnNvY2tldC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2hhcy1jb3JzL2luZGV4LmpzXCI6e1wiaW5kZXhcIjoxMTAsXCJoYXNoXCI6XCJId1RiNFVGL1MwODlaWUE4aHJSbFwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIveG1saHR0cHJlcXVlc3QuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi94bWxodHRwcmVxdWVzdC5qc1wiOntcImluZGV4XCI6OTgsXCJoYXNoXCI6XCJ1czBGc041czdoaVQzaHFWVjVseFwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9wb2xsaW5nLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy14aHIuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1wYXJzZXIvbm9kZV9tb2R1bGVzL2hhcy1iaW5hcnkvbm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanNcIjp7XCJpbmRleFwiOjEwOCxcImhhc2hcIjpcImRLdGV3czFTNHNIdmFaaForY2VxXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tcGFyc2VyL25vZGVfbW9kdWxlcy9oYXMtYmluYXJ5L2luZGV4LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLXBhcnNlci9ub2RlX21vZHVsZXMvaGFzLWJpbmFyeS9pbmRleC5qc1wiOntcImluZGV4XCI6MTA3LFwiaGFzaFwiOlwiRXhBTWpYMTVEb0JuUjNOZFVDZHlcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1wYXJzZXIvbGliL2Jyb3dzZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3BvbGxpbmctanNvbnAuanNcIjp7XCJpbmRleFwiOjk0LFwiaGFzaFwiOlwiQ3YraFhJL25ydXNZTElQSHk3UjBcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3BvbGxpbmcuanNcIjp7XCJpbmRleFwiOjk2LFwiaGFzaFwiOlwidmRnU3RKUEp6WnJYVFFlc3FOOHpcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy1qc29ucC5qc1wiLFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3BvbGxpbmcteGhyLmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWluaGVyaXQvaW5kZXguanNcIjp7XCJpbmRleFwiOjEwMCxcImhhc2hcIjpcIlQwRnFjaDRkNGFrdmxyOGJoN2xjXCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL3BvbGxpbmctanNvbnAuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy93ZWJzb2NrZXQuanNcIixcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9wb2xsaW5nLmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy14aHIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L25vZGVfbW9kdWxlcy95ZWFzdC9pbmRleC5qc1wiOntcImluZGV4XCI6MTEzLFwiaGFzaFwiOlwiWk0zKzV3NGwvRDJmNng3c3Z5U0ZcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvd2Vic29ja2V0LmpzXCIsXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvcG9sbGluZy5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvd2Vic29ja2V0LmpzXCI6e1wiaW5kZXhcIjo5NyxcImhhc2hcIjpcIlBRY0QyOEoxRk1pS3JOejZvSVY0XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi90cmFuc3BvcnRzL2luZGV4LmpzXCJdfSxcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9wb2xsaW5nLXhoci5qc1wiOntcImluZGV4XCI6OTUsXCJoYXNoXCI6XCIvRkFtazJNTFRGSjg3VnJTelBmYlwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvdHJhbnNwb3J0cy9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3RyYW5zcG9ydHMvaW5kZXguanNcIjp7XCJpbmRleFwiOjkzLFwiaGFzaFwiOlwiUFFZa0E2MCs0cG1UOUk3OTZTd2pcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3NvY2tldC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvbGliL3NvY2tldC5qc1wiOntcImluZGV4XCI6OTEsXCJoYXNoXCI6XCIyeklzSWdHZ2pWM2F4TjBiMTlJK1wiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9saWIvaW5kZXguanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L25vZGVfbW9kdWxlcy9lbmdpbmUuaW8tY2xpZW50L2xpYi9pbmRleC5qc1wiOntcImluZGV4XCI6OTAsXCJoYXNoXCI6XCJHNlFZdVNOdTBFY1MrRzV0UjlORVwiLFwicGFyZW50c1wiOltcIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5LWhtci9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudC9ub2RlX21vZHVsZXMvZW5naW5lLmlvLWNsaWVudC9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbm9kZV9tb2R1bGVzL2VuZ2luZS5pby1jbGllbnQvaW5kZXguanNcIjp7XCJpbmRleFwiOjg5LFwiaGFzaFwiOlwiSFFhdTRNa0Q0bEF5bkI5dHQwV2xcIixcInBhcmVudHNcIjpbXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL21hbmFnZXIuanNcIl19LFwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9tYW5hZ2VyLmpzXCI6e1wiaW5kZXhcIjo3OSxcImhhc2hcIjpcInljYXpmeXowTFFHUHRkL1AxSWg5XCIsXCJwYXJlbnRzXCI6W1wibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9pbmRleC5qc1wiXX0sXCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQvbGliL2luZGV4LmpzXCI6e1wiaW5kZXhcIjo3OCxcImhhc2hcIjpcIjZPMjFaL1NKVG9Mb0F5ZlZrUzErXCIsXCJwYXJlbnRzXCI6W119fTtcbiAgdmFyIG9yaWdpbmFsRW50cmllcyA9IFtcIi9ob21lL3Rhb3gvd29ya3NwYWNlL2Jyb3dzZXJpZnktcHJhY3RpY2UvaG1yXCJdO1xuICB2YXIgdXBkYXRlVXJsID0gbnVsbDtcbiAgdmFyIHVwZGF0ZU1vZGUgPSBcIndlYnNvY2tldFwiO1xuICB2YXIgc3VwcG9ydE1vZGVzID0gW1wibm9uZVwiLFwid2Vic29ja2V0XCJdO1xuICB2YXIgaWdub3JlVW5hY2NlcHRlZCA9IHRydWU7XG4gIHZhciB1cGRhdGVDYWNoZUJ1c3QgPSBmYWxzZTtcbiAgdmFyIGJ1bmRsZUtleSA9IFwid2Vic29ja2V0Om51bGxcIjtcbiAgdmFyIHNpb1BhdGggPSBcIi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnktaG1yL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2xpYi9pbmRleC5qc1wiO1xuICB2YXIgaW5jUGF0aCA9IFwiLi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1obXIvaW5jL2luZGV4LmpzXCI7XG5cbiAgaWYgKCFnbG9iYWwuX2htcikge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsLCAnX2htcicsIHt2YWx1ZToge319KTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGdsb2JhbC5faG1yID0ge307XG4gICAgfVxuICB9XG5cbiAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZ2xvYmFsLl9obXIsIGJ1bmRsZUtleSkpIHtcbiAgICAvLyBUZW1wb3JhcnkgaGFjayBzbyByZXF1aXJpbmcgbW9kdWxlcyB3b3JrcyBiZWZvcmUgdGhlIF9obXIgdmFsdWVzIGFyZVxuICAgIC8vIGNvcnJlY3RseSBpbml0aWFsaXplZC5cbiAgICBnbG9iYWwuX2htcltidW5kbGVLZXldID0ge2luaXRNb2R1bGU6IGZ1bmN0aW9uKCl7fX07XG4gIH1cblxuICB2YXIgbWFpbiA9IHJlcXVpcmUoaW5jUGF0aCk7XG4gIHZhciBpc0ZpcnN0UnVuID0gbWFpbihcbiAgICBtb2R1bGVEZWZzLCBjYWNoZWRNb2R1bGVzLCBtb2R1bGVNZXRhLCB1cGRhdGVVcmwsXG4gICAgdXBkYXRlTW9kZSwgc3VwcG9ydE1vZGVzLCBpZ25vcmVVbmFjY2VwdGVkLCB1cGRhdGVDYWNoZUJ1c3QsIGJ1bmRsZUtleSxcbiAgICBzaW9QYXRoID8gcmVxdWlyZShzaW9QYXRoKSA6IG51bGwsXG4gICAgdHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnICYmIF9fZmlsZW5hbWUsXG4gICAgdHlwZW9mIF9fZGlybmFtZSAhPT0gJ3VuZGVmaW5lZCcgJiYgX19kaXJuYW1lXG4gICk7XG4gIGlmIChpc0ZpcnN0UnVuKSB7XG4gICAgZm9yICh2YXIgaT0wLCBsZW49b3JpZ2luYWxFbnRyaWVzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgcmVxdWlyZShvcmlnaW5hbEVudHJpZXNbaV0pO1xuICAgIH1cbiAgfVxufSkuY2FsbChcbiAgdGhpcyxcbiAgdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxcbiAgYXJndW1lbnRzWzNdLCBhcmd1bWVudHNbNF0sIGFyZ3VtZW50c1s1XSwgYXJndW1lbnRzWzZdXG4pO1xuIl19
