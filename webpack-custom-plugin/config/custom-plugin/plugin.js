"use strict";
exports.__esModule = true;
var webpack_sources_1 = require("webpack-sources");
var WebpackBuildSizePlugin = /** @class */ (function () {
    function WebpackBuildSizePlugin(options) {
        this.PLUGIN_NAME = 'WebpackBuildSizePlugin';
        this.options = options;
    }
    WebpackBuildSizePlugin.prototype.apply = function (compiler) {
        var _this = this;
        var outputOptions = compiler.options.output;
        compiler.hooks.emit.tap(this.PLUGIN_NAME, function (compilation) {
            var assets = compilation.assets;
            var buildSize = {};
            var files = Object.keys(assets);
            var total = 0;
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                var size = assets[file].size();
                buildSize[file] = size;
                total += size;
            }
            console.log("Build Size: ", buildSize);
            console.log('Total Size: ', total);
            buildSize.total = total;
            // 生成json文件
            assets[outputOptions.publicPath + '/' + (_this.options.filename || 'build-size.json')] = new webpack_sources_1.RawSource(JSON.stringify(buildSize, null, (_this.options.tabSize || 4)));
        });
    };
    return WebpackBuildSizePlugin;
}());
module.exports = WebpackBuildSizePlugin;
