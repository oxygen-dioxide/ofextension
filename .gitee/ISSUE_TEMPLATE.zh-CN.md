### 错误自排
- 正确指定OpenFOAM版本：在插件设置中指定`OFpath`，即对应版本的OF路径。
- `Make/files`中的`$FOAM_APPBIN`修改成`$FOAM_USER_APPBIN`，确保能正确编译。
- 调试的程序需要在特定的算例中运行，因此需要确保**正确指定调试算例的路径**，并且**算例需要手动初始化**（比如网格生成、设初场等）。  
本插件中调试算例路径是在运行ofInit的时候指定的，默认为求解器目录下的`debug_case`，也可以指定其他路径。


### 问题简单描述
<必填>


### 需要提交的信息
1. 激活OpenFOAM环境，切换到solver目录，然后提交以下命令的返回结果。
```bash
echo $WM_COMPILE_OPTION
echo $WM_PROJECT_DIR
ls -l
cat Make/files
```
返回结果：  
<必填>


2. VSCode中OFextension的配置截图
> 如何查看设置?
> - 点击VSCode左下角的小齿轮-> Settings （或者直接快捷键`Ctrl+,`调出设置页面）
> ![输入图片说明](https://images.gitee.com/uploads/images/2021/0525/100502_86c40c86_8022863.png "ofextension.png")
> - 设置页面有多个子页面，如User、Remote、Workspace，对应不同层级的配置
> - 每个页面中，点击`Extension`->`OFExtension`查看插件配置，截图该部分。

- User配置  
<必填>

- Workspace配置  
<必填>

- Remote配置（如果使用WSL）  
<如果有就填>
