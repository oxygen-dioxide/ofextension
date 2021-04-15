# OFextension

## 介绍
VSCode的OpenFOAM插件。本插件依托于C/C++插件，用于快速部署开发环境以适配OpenFOAM求解器代码。
代码跳转、悬浮提示、调试等功能是写求解器所必备的功能，本插件基于自己的一点理解所开发，对小白友好，一键完成部署。

## 快速开始
- 在插件设置中指定OpenFOAM和gdb的路径 (Settings-> Extensions: OFextension中的`OFpath`和`GDBpath`)；
[基本设置](images/ofextension-setting.png)
- 按`F1`或`Ctrl+Shift+P`打开命令面板，搜索并运行`ofInit`命令；
[运行ofInit命令](images/ofextension-ofInit.png)
- 调试前请初始化算例（如清理算例、网格生成等，这很关键！），然后按键`F5`或通过调试面板启动调试。

## 安装教程
### 依赖
- C/C++
Name: C/C++
Id: ms-vscode.cpptools
Description: C/C++ IntelliSense, debugging, and code browsing.
Publisher: Microsoft
- gdb
可以通过系统包管理器安装，比如Ubuntu下：
```sh 
sudo apt update
sudo apt install gdb -y
```
也可以选择自己编译的版本。

### 离线安装
按F1，搜索vsix，选择Extensions: Install from VSIX...，选择ofextension_v<version>.vsix即可

### Extension Marketplace中搜索安装
搜索`OFextension`，安装即可。

## 架构
待补充

## 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
