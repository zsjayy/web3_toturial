const { getNamedAccounts, deployments } = require("hardhat");

module.exports = async({getNamedAccounts,deployments}) =>{
    const { firstAccount } = await getNamedAccounts();
    console.log("========用户账号为："+ firstAccount+"============");
    const { deploy } = await deployments;
    const tokenDeployment = await deployments.get("Mytoken");
    const token_address = tokenDeployment.address;
    console.log("token address is:"+token_address);
    //一定要注意deploy的传参及格式await deploy("合约名称",{from:部署账户,args:[合约构造函数传参],log:true})
    await deploy("Vault",{
        from:firstAccount,
        args:[token_address],
        log:true
    })
}

module.exports.tags = ["all","vault"];