// function deployFunction(){
//     console.log("this contract is deploying");
// }

// module.exports.default=deployFunction;


//通过getNamedAccounts方法就可以不在用下标的形式调用用户，同时hardhat.config.js需要进行对应的修改
module.exports = async({getNamedAccounts, deployments}) =>{
    //加花括号就相当于函数.属性名，如getNameAccouts().firstAccount
    const { firstAccount } = await getNamedAccounts();
    console.log("firstAccount is:"+firstAccount);
    // console.log("firstAccount_1 is:"+((await getNamedAccounts()).firstAccount));
    const { deploy } = deployments;
    //这里要加await，等待合约部署完成，才能被test脚本调用合约Mytoken
    await deploy("Mytoken",{
        from:firstAccount,
        args:["MyToken","MT"],
        log:true
    })
    console.log("this contract is deploying(simple version),address:");

}

//给这个部署脚本设置一个tag，方便fixture调用
module.exports.tags = ["all", "Mytoken"];