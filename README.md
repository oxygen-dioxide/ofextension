# ofextension README
本插件基于C/C++插件，用于快速配置环境以适配OpenFOAM求解器代码。
## 快速开始
- 在插件设置中指定OpenFOAM和gdb的路径；
查看：images/ofextension-setting.png
- 按`F1`或`Ctrl+Shift+P`打开命令面板，搜索并运行`ofInit`命令；
查看: images/ofextension-ofInit.png
- 调试前初始化算例（如清理算例、网格生成等，这很关键！），然后按键`F5`或通过调试面板启动调试。

## 特性
- 一键预编译，提取includePath，自动添加到`c_cpp_properties.json`文件中。
- `.vscode/tasks.json`中添加task，用于OpenFOAM编译（通过`Ctrl+Shift+B`即可一键编译）。
- 配置`.vscode/launch.json`，用于OpenFOAM调试（通过`F5`或在调试面板中启用）。  
- ...

## 要求
调试功能依赖于`gdb`，可以通过系统包管理器安装，也可以自行编译并在插件的设置中指定路径。

## 插件设置
插件设置支持指定OpenFOAM的路径`OFpath`，gdb的路径`GDBpath`等。

## Known Issues
待添加。

## Release Notes
### 0.0.1
实现基本功能。
### 0.0.2
修复bug：路径检测中将替换..为绝对路径。


**Enjoy!**
