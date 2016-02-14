##这是browserify的练习项目

```json
    "scripts": {
        "build-main": "browserify foo/main.js -o foo/bundle.js",
        "watch-main": "watchify foo/main.js -o foo/bundle.js --debug --verbose",
        "beefy-main": "beefy main.js",
        "watch-hmr": "watchify hmr/main.js -p browserify-hmr -o hmr/bundle.js -dv & ecstatic hmr -p 8000",
        "watch-budo": "watchify hmr/main.js -p browserify-hmr -o hmr/bundle.js -dv & budo hmr/main.js -d hmr --live -p 8888",
        "watch-budo-browser": "watchify hmr -p browserify-hmr -o hmr/bundle.js -dv & budo hmr/browser.js -d hmr --live -p 8888",
        "watch-budo-main": "node hmr/main.js"
    }
```
- watch-hmr/watch-budo 都可以实现浏览器的自动刷新
- watch-budo-browser/watch-budo-main：实现服务端和浏览器运行不同的js

###brfs
将nodejs的文件读写在浏览器的环境下直接替换为文件内容。

###widget
browserify组件化示例