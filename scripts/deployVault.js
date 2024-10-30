const { ethers } = require("hardhat");
const { eth } = require("web3");

/*
脚本与合约交互
1.先用Mytoken合约给账户A铸造代币TT，1000个，查看合约的balanceOf
2.部署Vault合约，并传入Mytoken合约的地址
3.将10000个代币使用approve方法授权给Vault合约地址
*/

async function init(){
    const tokenFactory = await ethers.getContractFactory("Mytoken");
    const vaultFactory = await ethers.getContractFactory("Vault");
    console.log("deploy contracts....");

    const token = await tokenFactory.deploy("mytoken","MY");
    await token.waitForDeployment();
    console.log("contracts have been deployed,address is:" + token.target);
    // const target = await token.getAddress();
    // console.log("get token address:",token.getAddress());
    // console.log("get target:",target)

    const vault = await vaultFactory.deploy(token.target);
    await vault.waitForDeployment();
    console.log("contracts have been deployed,address is:" + vault.target);

    //判断逻辑：如果是sepolia才走验证逻辑，本地网络不走
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY){
        console.log("staring waiting for 5 confirmations");
        await vault.deploymentTransaction().wait(5);
        verifyVault(vault.target,[token.target]);
    }else{
        console.log("verify skipped");
    }

    //铸造1000个代币给账号1：1）先获取账号1，2）再调用mint函数
    const accounts = await ethers.getSigners();
    const account_0 = accounts[0].address;
    console.log("账户为："+ account_0);
    const account_balanceOf = await ethers.provider.getBalance(account_0);
    const contract_balacneOf = await ethers.provider.getBalance(token.target);
    // await account_balanceOf.waitForDeployment();
    console.log("账户"+account_0+"的代币持有为："+account_balanceOf);
    console.log("合约持有的代币数量为："+contract_balacneOf);

    //调用approve方法将代币授权给vault
    // const amount = await ethers.utils.parseUnits("1000",18);
    await token.approve(vault.target,1000);
    const contract_allowanceOf = await token.allowance(account_0, vault.target);
    console.log("vault合约账号被授权代币为:"+contract_allowanceOf);
    const contract_balanceOf_1 = await ethers.provider.getBalance(vault.target);
    console.log("此时vault合约的账户代币为:"+ contract_balanceOf_1)

    //调用vault的deposit函数存入等量的代币
    await vault.deposit(1000);
    console.log("存入代币："+ contract_balanceOf_1);
    console.log("账户"+account_0+"余额为"+account_balanceOf);
    
}

async function verifyVault(VaultAddress,args){
    await hre.run("verify:verify",{
        address:VaultAddress,  //部署的合约地址
        constructionArguments:args //合约地址需要出传入的参数
    });
}

async function main() {
    await init();
}

main().then().catch((error)=>{
    console.error(error);
    process.exit(1);
})