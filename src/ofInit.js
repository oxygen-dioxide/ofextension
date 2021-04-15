const vscode = require('vscode');
const fs=require('fs');
const cp=require('child_process');
const path=require('path');


function get_includePath(log_wmake){
    var data = fs.readFileSync(log_wmake,'utf8');
    var m = data.match(/\-I(\S*)/g);
    return m;
}

function sort_uniq_pp(arr){
    // var fs=require('fs');
    // sort and uniq
    arr.sort();
    // var hash=[arr[0]];
    var hash=[];
    console.log('提取到的头文件路径：')
    // 要检查目录是否存在
    for (let i = 0; i < arr.length; i++) {
        // 添加第1个元素
        arr[i]=arr[i].replace('-I','');
        var wkspaceFd = vscode.workspace.workspaceFolders[0].uri.fsPath;
        var father_path=path.resolve(wkspaceFd,'..');
        // 相对路径转绝对路径
        arr[i]=arr[i].replace('./', wkspaceFd+'/');
        arr[i]=arr[i].replace('../',father_path+'/');
        if (hash.length===0 && arr[i]!=='.'){
            try {
                fs.accessSync(arr[i],fs.constants.F_OK);
                console.log(`exist: ${arr[i]}`);
                hash.push(arr[i]);
            } catch (err) {
                console.log(`not exist: ${arr[i]}`);
            }

            // fs.access(arr[i],(err)=>{
            //     if(!err){
            //         console.log('exist');
            //         hash.push(arr[i]);
            //     }else{
            //         console.log('not exist');
            //     }
            // });
        } 
        // 添加后续元素，保证与已有的最后一个元素不相同
        if(hash.length>=1 
            && arr[i]!==hash[hash.length-1] 
            && arr[i]!=='-I.') {
                try {
                    fs.accessSync(arr[i],fs.constants.F_OK);
                    console.log(`exist: ${arr[i]}`);
                    hash.push(arr[i]);
                } catch (err) {
                    console.log(`not exist: ${arr[i]}`);
                }
            // fs.access(arr[i],(err)=>{
            //     if(!err){
            //         hash.push(arr[i]);
            //     }
            // })
        }
    }

// TODO:  2021-4-11，等待编译结束才能解析includePath

    // post process: 修改src与否；lnInclude后面加上/*
    // for (let i = 0; i < hash.length; i++) {
    //     hash[i]=hash[i].replace('-I','');
    //     if (hash[i].match(/lnInclude$/)){
    //         hash[i]=hash[i].replace(/$/,'/*')
    //     }
    // }
    return hash;
}


function gen_cpp_conf(err,m_uniq,wkspacefd){
    console.log(m_uniq);
    if(err){
        console.log('---配置文件.vscode/c_cpp_properties.json 不存在，重新创建')
        m_uniq=sort_uniq_pp(m_uniq);
        m_uniq.push('./**');
        var c_cpp={
                "configurations": [
                    {
                        "name": "Linux",
                        "includePath": m_uniq,
                        "defines": [],
                        "compilerPath": "/usr/bin/gcc",
                        "cStandard": "gnu11",
                        "cppStandard": "gnu++14",
                        "intelliSenseMode": "gcc-x64"
                    }
                ],
                "version": 4 
            }
        var c_cpp_json = JSON.stringify(c_cpp,null,2);
        console.log('---更新c_cpp_peroperties.json内容:\n',c_cpp_json);
        fs.writeFileSync(`${wkspacefd}/.vscode/c_cpp_properties.json`,c_cpp_json);
    }else{
        console.log('---配置文件已存在，更新includePath')
        var c_cpp_raw=fs.readFileSync(`${wkspacefd}/.vscode/c_cpp_properties.json`);
        var c_cpp=JSON.parse(c_cpp_raw);
        // 合并头文件列表，还需要去重
        c_cpp.configurations[0].includePath.push(...m_uniq);
        c_cpp.configurations[0].includePath = sort_uniq_pp(c_cpp.configurations[0].includePath);
        c_cpp.configurations[0].includePath.push('./**');
        var c_cpp_json2=JSON.stringify(c_cpp,null,2);
        console.log('---更新c_cpp_properties.json内容:\n'+c_cpp_json2);
        fs.writeFileSync(`${wkspacefd}/.vscode/c_cpp_properties.json`,c_cpp_json2);
    }
}


function check_exist(f_or_fd, tp){
    // 父目录是否存在，比如.vscode，若不存在，则创建
    var father_path = path.resolve(f_or_fd,'..');
    try {
        fs.accessSync(father_path,fs.constants.F_OK);
        console.log('父目录存在');
    } catch (error) {
        console.log('父目录不存在，递归创建');
        fs.mkdirSync(father_path,{recursive: true});
    }

    // 文件或者文件夹是否存在
    // tp=0，文件；tp=1，文件夹
    try {
        fs.accessSync(f_or_fd,fs.constants.F_OK);
        console.log(`${f_or_fd} 已存在`);
        return 1;
    } catch (err) {
        console.log(`${f_or_fd} 不存在`);
        try {
            if(tp===1){
                fs.mkdirSync(f_or_fd);
                console.log(f_or_fd+'创建成功');
            }
        } catch (error) {
            console.log(f_or_fd+'创建失败');
        }
        return 0;
    }
}

function add_task(wkspaceFd, OFpath){
    var file=`${wkspaceFd}/.vscode/tasks.json`;
    // 文件检查
    var isExist = check_exist(file,0);

    var conf=vscode.workspace.getConfiguration('ofextension');
    var task_obj_build={
        "type": "shell",
        "label": "ofextension: build solver",
        "command": [
            "cd ${workspaceFolder};",
            `source ${OFpath}/etc/bashrc ${conf.get('OFbuildopt')};`,
            "wmake 2>&1 | tee log.wmake_opt"
        ],
        "args": [],
        "options": {},
        "problemMatcher": [],
        "group": {
            "kind": "build",
            "isDefault": true
        }
    };
    var task_obj_debug={
        "type": "shell",
        "label": "ofextension: debug solver",
        "command": [
            "cd ${workspaceFolder};",
            `source ${OFpath}/etc/bashrc ${conf.get('OFdebugopt')};`,
            "wmake 2>&1 | tee log.wmake_debug"
        ],
        "args": [],
        "options": {},
        "problemMatcher": []
    };

    var fjson=undefined;
    // task
    if (isExist){  // 若已存在
        console.log(`${file}已存在，更新task`);
        var fraw = fs.readFileSync(file)
        fjson=JSON.parse(fraw);
        // 检查是否存在
        var taski=undefined;
        var flag=1; //标志量，删除后，fjson已改变，需要重启循环
        while (flag) {
            if (fjson.tasks.length) {
                for (let i = 0; i < fjson.tasks.length; i++) {
                    taski = fjson.tasks[i];
                    if((taski['type']==='shell' && taski['label']==='ofextension: build solver') 
                     ||(taski['type']==='shell' && taski['label']==='ofextension: debug solver')){
                        // delete fjson.tasks[i];
                        fjson.tasks.splice(i,1); // 删除之，后面重新定义
                        flag=1;
                        console.log(fjson.tasks.length);
                        break;
                    }
                    flag=0; // 顺利到达最后
                }
            }else{
                flag=0;
            }
        }
        // 删除现有的group default
        for (let i = 0; i < fjson.tasks.length; i++) {
            taski = fjson.tasks[i];
            if(taski['group'].kind==='build' && taski['group'].isDefault ==='true'){
                fjson.tasks['group'].isDefault='false'; // 取消其他默认任务
            }
        }
        // 如果ofwmake已存在，则此时taski对应其引用
        // 否则taski为空
    } else{ //若不存在
        console.log(`${file}不存在，重新创建并添加task`);
        fjson={
            "tasks":[],
            "version": "2.0.0"};
    }
    fjson.tasks.push(task_obj_build);
    fjson.tasks.push(task_obj_debug);
    var fjson_stringigy = JSON.stringify(fjson,null,2);
    fs.writeFileSync(file,fjson_stringigy);
    vscode.window.showInformationMessage('OFextension-ofInit: 成功更新.vscode/tasks.json');
}

async function add_launch(wkspaceFd,OFpath,GDBpath,sh){
    var file=`${wkspaceFd}/.vscode/launch.json`;
    var conf=vscode.workspace.getConfiguration('ofextension');
    // var case_path=undefined; // 通过用户交互得到算例目录
    var case_path=await vscode.window.showInputBox(
        {
            ignoreFocusOut: true,
            placeHolder:`默认值为：${wkspaceFd}/debug_case，可后续将测试算例拷贝至该目录`,
            prompt:'请输入测试算例的路径，用于调试（调试程序在测试算例中运行）',
            value:`${wkspaceFd}/debug_case`
            // validateInput: function(in_path){
            //     return in_path;
            // }
        }
    );
    console.log('case_path: '+case_path);
    // 创建of-debug.sh文件
    var of_debug_str=`#!/bin/bash\n. ${OFpath}/etc/bashrc ${conf.get('OFdebugopt')}\n${GDBpath} "$@"`
    fs.writeFileSync(`${wkspaceFd}/.vscode/of-gdb.sh`,of_debug_str);
    // 创建launch.json文件
    // - 从Make/files中提取可执行文件的路径
    var fc=fs.readFileSync(`${wkspaceFd}/Make/files`,'utf8');
    try {
        cp.execSync(`chmod +x ${wkspaceFd}/.vscode/of-gdb.sh`,{cwd:wkspaceFd,shell:sh,encoding:'utf8'})
        console.log('success: chmod +x of-gdb.sh');
    } catch (error) {
        console.log('fail: chmod +x of-gdb.sh');
    }
    var program = fc.match(/EXE\s*=\s*(.*)/)[1].replace(/\(|\)/g,'');
    var cmd = `source ${OFpath}/etc/bashrc ${conf.get('OFdebugopt')} 2>&1 > /dev/null; echo ${program}`;
    console.log('get program: '+cmd);
    program =cp.execSync(cmd,{cwd:wkspaceFd,shell:sh,encoding:'utf8'})
    console.log('the program: '+program);
    program = program.trim();
    var launch_obj= {
                "name": "ofextension: debug solver",
                "type": "cppdbg",
                "request": "launch",
                "program": program,
                "args": [],
                "stopAtEntry": true,
                "cwd": case_path,
                "environment": [],
                "externalConsole": false,
                "MIMode": "gdb",
                "setupCommands": [
                    {
                        "description": "Enable pretty-printing for gdb",
                        "text": "-enable-pretty-printing",
                        "ignoreFailures": true
                    }
                ],
                "preLaunchTask": "ofextension: debug solver",
                "miDebuggerPath": "${workspaceFolder}/.vscode/of-gdb.sh"
            };

    var isExist = check_exist(file,0);
    var fjson=undefined;
    if(isExist){
        console.log(`${file}存在，更新configuration`);
        var fraw=fs.readFileSync(file);
        fjson=JSON.parse(fraw);
        var confi=undefined;
        var flag=1;
        while(flag){
            if (fjson.configurations.length) {
                for (let i = 0; i < fjson.configurations.length; i++) {
                    confi = fjson.configurations[i];
                    if(confi['name']==='ofextension: debug solver'){
                        // delete fjson.configurations[i];
                        fjson.configurations.splice(i,1); // 删除之，后面重新定义
                        flag=1;
                        break;
                    }
                    flag=0;
                }
            }else{
                flag=0;
            }
        }
    }else{
        console.log(`${file}不存在，重新创建并添加configuration`);
        fjson={
            "version": "0.2.0",
            "configurations": []
        };
    }
    fjson.configurations.push(launch_obj);
    var fjson_stringigy=JSON.stringify(fjson,null,2);
    fs.writeFileSync(file,fjson_stringigy);
    vscode.window.showInformationMessage('OFextension-ofInit: 成功更新.vscode/launch.json');
}



module.exports = function(context) {
    // 注册HelloWord命令, 
    // 所有注册类的API执行后都需要将返回结果放到`context.subscriptions`中去
    context.subscriptions.push(vscode.commands.registerCommand('ofextension.ofInit', async () => {

        const wkspaceFd = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const logfile=`${wkspaceFd}/log.wmake`;

        var conf=vscode.workspace.getConfiguration('ofextension');
        console.log('\n=== 当前配置 ===')
        var OFpath = conf.get('OFpath');
        // var OFsrc = conf.get('OFsrc') ? conf.get('OFsrc'): `${OFpath}/src`; // 如果没有设置，则默认OFpath下的src
        var GDBpath = conf.get('GDBpath') ? conf.get('GDBpath'): '/usr/bin/gdb'; 
        console.log('OpenFOAM-path： '+OFpath);
        // console.log('OpenFOAM-src： '+OFsrc);
        console.log('GDB-path： '+GDBpath);

        // premake the solver
            // 检查是否是求解器目录 
        const file_Makefiles=`${wkspaceFd}/Make/files`;
        console.log('\n=== 检查是否为求解器目录 ===')
        try {
            fs.accessSync(file_Makefiles,fs.constants.F_OK);
            console.log(`Yes, ${file_Makefiles} 存在。`)
        } catch (err) {
            console.log(`No, ${file_Makefiles} 不存在，请切换到求解器目录。`)
            vscode.window.showErrorMessage('Make/files不存在，请切换到求解器目录！');
        }
        //     // 预编译，得到log.wmake文件用于提取includePath 
        console.log('\n=== 预编译，获取wmake日志 ===');
        // Note: 务必修改Make/files文件，使编译结果保存到用户目录
        // cp.exec(`sed -i "s~FOAM_APPBIN~FOAM_USER_APPBIN~g" ${wkspaceFd}/Make/files`);
        var cmd=`source ${OFpath}/etc/bashrc ${conf.get('OFbuildopt')}`; // source ...bashrc 状态码为1，因此不能用&&连接命令
        var sh=vscode.env.shell
        console.log(`用于执行命令的shell：${sh}`)
        cmd+='; wclean &&  wmake 2>&1 | tee log.wmake'
        console.log(`执行预编译命令：${cmd}`)
        // var stdout = cp.exec(cmd,{cwd:wkspaceFd,shell:sh})
        // console.log('预编译：\n',stdout);
        cp.exec(cmd,{cwd:wkspaceFd,shell:sh},(err,stdout,stderr)=>{
            console.log('预编译stdout: \n'+ (stdout?stdout: '无'));
            console.log('预编译stderr: '+ (stderr?`\n${stderr}`: '无'));
            // if(err){ console.log('error: '+err); }
            if(!err){
                console.log('\n=== 提取wmake日志文件，更新includePath ===')
                fs.access(`${wkspaceFd}/.vscode/c_cpp_properties.json`,fs.constants.F_OK,(err)=>{
                    var m = get_includePath(logfile);
                    var m_uniq=sort_uniq_pp(m);
                    gen_cpp_conf(err,m_uniq,wkspaceFd);
                    vscode.window.showInformationMessage('OFextension-ofInit: 成功更新includePath');
                });
            }
        });

        add_task(wkspaceFd,OFpath);
        add_launch(wkspaceFd,OFpath,GDBpath,sh);
        
    }));
};