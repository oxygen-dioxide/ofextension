// const { exit } = require('node:process');
const vscode = require('vscode');

// for(let key in vscode){ 
// 	console.log('key:', key);
// }

function get_includePath(log_wmake){
    const fs=require('fs');
    var data = fs.readFileSync(log_wmake,'utf8');
    var m = data.match(/\-I(\S*)/g);
    return m;
}

function sort_uniq_pp(arr){
    var fs=require('fs');
    // sort and uniq
    arr.sort();
    // var hash=[arr[0]];
    var hash=[];
    console.log('提取到的头文件路径：')
    // 要检查目录是否存在
    for (let i = 0; i < arr.length; i++) {
        // 添加第1个元素
        arr[i]=arr[i].replace('-I','');
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
    const fs=require('fs');
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


module.exports = function(context) {
    // 注册HelloWord命令, 
    // 所有注册类的API执行后都需要将返回结果放到`context.subscriptions`中去
    context.subscriptions.push(vscode.commands.registerCommand('ofextension.ofInit', async () => {
        const fs=require('fs')
        const cp=require('child_process');

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
        }
        //     // 预编译，得到log.wmake文件用于提取includePath 
        console.log('\n=== 预编译，获取wmake日志 ===');
        // Note: 务必修改Make/files文件，使编译结果保存到用户目录
        // cp.exec(`sed -i "s~FOAM_APPBIN~FOAM_USER_APPBIN~g" ${wkspaceFd}/Make/files`);
        var cmd=`source ${OFpath}/etc/bashrc ;export WM_COMPILE_OPTION=Debug `; // source ...bashrc 状态码为1，因此不能用&&连接命令
        var sh=vscode.env.shell
        console.log(`用于执行命令的shell：${sh}`)
        cmd+='&& wclean &&  wmake 2>&1 | tee log.wmake'
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
                });
            }
        });
        
    }));
};