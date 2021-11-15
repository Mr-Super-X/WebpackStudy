
import {Plugin, Compiler, compilation} from "webpack"
import { RawSource } from "webpack-sources"

class WebpackBuildSizePlugin implements Plugin {
  options: any;
  PLUGIN_NAME: string = 'WebpackBuildSizePlugin';

  constructor(options: any) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const outputOptions = compiler.options.output;
    compiler.hooks.emit.tap(
      this.PLUGIN_NAME,
      compilation => {
        const assets = compilation.assets;
        const buildSize = {} as any;
        const files = Object.keys(assets);
        let total = 0;
        for (const file of files) {
          const size = assets[file].size();
          buildSize[file] = size;
          total += size;
        }

        console.log("Build Size: ", buildSize);
        console.log('Total Size: ', total);
        buildSize.total = total;
        // 生成json文件
        assets[
          outputOptions.publicPath + '/' + (this.options.filename || 'build-size.json')
        ] = new RawSource(JSON.stringify(buildSize, null, (this.options.tabSize || 4)));
      }
    )
  }
  
}

module.exports = WebpackBuildSizePlugin;