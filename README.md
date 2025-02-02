# OFextension

## 1 介绍

VSCode的OpenFOAM插件。本插件依托于C/C++插件，用于快速部署开发环境以适配OpenFOAM求解器代码。
代码跳转、悬浮提示、调试等功能是写求解器所必备的功能，本插件基于自己的一点理解所开发，对小白友好，一键完成部署。

[代码仓库](https://gitee.com/xfygogo/ofextension)

## 2 快速开始
- 在插件设置中指定OpenFOAM和gdb的路径 (Settings-> Extensions: OFextension中的`OFpath`和`GDBpath`)；  
![基本设置](images/ofextension-setting.png)
务必确保在`OFpath`中正确指定了自己的OpenFOAM路径。如果不需要调试，就不用管`GDBpath`
- 按`F1`或`Ctrl+Shift+P`打开命令面板，搜索并运行`ofInit`命令；  
![运行ofInit命令](images/ofextension-ofInit.gif)
- 调试前请初始化算例（如清理算例、网格生成等，这很关键！），然后按键`F5`或通过调试面板启动调试。

### 2.1 特性展示
- 语法高亮与鼠标悬浮提示  
![语法高亮与鼠标悬浮提示](images/ofextension-hover_prompt.png)
- 代码跳转 (<font color=red>阅读源码很有用！</font>)
![代码跳转](images/ofextension-jump_to_definition.gif)
- 调试  
![调试](images/ofextension-debug.png)

### 2.2 视频演示

[VS Code的OpenFOAM插件(OFextension)演示](https://www.bilibili.com/video/BV1RX4y1g752/)

- Step1. 拷贝求解器， 修改Make/files（注意：保证EXE输出到有权限的路径下）
```sh
# 激活OpenFOAM环境
$ of8
$ foamVersion
OpenFOAM-8
# 切换到求解器目录
$ run
$ cd ../solver
# 拷贝要调试的求解器和测试算例
$ cp $FOAM_SOLVERS/incompressible/icoFoam -r .
$ cd icoFOAM
$ sed -i 's/FOAM_APPBIN/FOAM_USER_APPBIN/g' 
```

- Step2. 拷贝算例、算例初始化（网格生成等，每次调试前都需要注意算例的状态）
```sh
$ cp $FOAM_TUTORIALS/incompressible/icoFOAM/cavity/cavity -r debug_case
$ cd debug_case
$ foamCleanTutorials && blockMesh 2>&1 | tee log.blockMesh
$ cd ..
```
- Step3. 运行ofInit。
按F1，搜索并运行ofInit。等待片刻，`.vscode`中会自动生成相关配置文件。这里需要查看相关的日志文件`log.wmake*`，确保没有报错。


### 2.3 相关参考

- [利用VS Code阅读源码及调试OpenFOAM](http://www.xfy-learning.com/2021/01/05/%E5%88%A9%E7%94%A8VS-Code%E9%98%85%E8%AF%BB%E6%BA%90%E7%A0%81%E5%8F%8A%E8%B0%83%E8%AF%95OpenFOAM/)
- [OFprimer: 6.2 Debugging and profling](https://www.researchgate.net/publication/267569764_The_OpenFOAM_Technology_Primer)  

## 3 安装教程
### 3.1 依赖
- OpenFOAM需要在Linux平台使用，本插件适用于Linux平台。使用Remote-WSL或者Remote-SSH连接WSL或者远程Linux服务器也可。
- C/C++插件，用于高亮显示、跳转、鼠标悬浮提示等。
```
Name: C/C++  
Id: ms-vscode.cpptools  
Description: C/C++ IntelliSense, debugging, and code browsing.  
Publisher: Microsoft  
```
- 调试需要gdb。 可以通过系统包管理器安装，比如Ubuntu下：
```sh 
sudo apt update
sudo apt install gdb -y
```
也可以选择自己编译的版本。

### 3.2 离线安装
按F1，搜索vsix，选择Extensions: Install from VSIX...，选择ofextension_vxxx.vsix即可

### 3.3 Extension Marketplace中搜索安装
搜索`OFextension`，安装即可。

## 4 架构
待补充

## 5 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
