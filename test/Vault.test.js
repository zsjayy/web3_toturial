const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { assert } = require("chai");

describe("test vault contract", async function () {
    /**
     * 通过deploy中编写部署脚本，就可以在这里使用
     * 
     */
    let firstAccount;
    let myToken;
    let token_address;
    let vault_address;
    let vault_balanceOf;
    beforeEach(async function() {
        //执行符合tag的部署脚本
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        console.log("firstAccount is:"+firstAccount);
        //获取合约的部署信息并进行存储
        const tokenDeployment = await deployments.get("Mytoken");
        const vaultDeployment = await deployments.get("Vault");
        console.log("contract is deployed");
        //通过合约名称+合约地址创建合约实例，本质vault是ethers.Contract的实例，包含了一些属性
        myToken = await ethers.getContractAt("Mytoken",tokenDeployment.address);
        vault = await ethers.getContractAt("Vault",vaultDeployment.address);
    })

    it("vault if init success",async function() {
        //创建合约工厂对象
        // const tokenFactory = await ethers.getContractFactory("Mytoken");
        // const vaultFactory = await ethers.getContractFactory("Vault");

        //部署合约
        // const token = await tokenFactory.deploy("MyToken","MY");
        myToken.waitForDeployment();
        token_address = myToken.target;
        console.log("========token address is:"+token_address)

        vault.waitForDeployment();
        vault_address = vault.target;
        console.log("========vault address is:"+vault.address);
        // const vault = await vaultFactory.deploy(token_address);
        // await vault.waitForDeployment();
        console.log("========vault合约部署后构造函数中token的值为:"+(await vault.token()))
        //合约中public类型的变量拥有getter()函数的属性，可以通过vault.token()的形式调用合约中的public变量
        assert.equal((await vault.token()),token_address);    
    })

    it("deposit function success",async function(){
        //先获取到代币金额，mytoken铸造的代币
        const amount = await myToken.balanceOf(firstAccount);
        vault_balanceOf = await myToken.balanceOf(vault_address);
        console.log("=====Mytoken合约铸造的代币金额为:"+amount+"=====");
        console.log("=====Vault合约铸造的代币金额为:"+vault_balanceOf+"=====");
        //将金额授权给合约vault
        await myToken.approve(vault_address,amount);
        console.log("完成代币授权给合约vault")
        //vault授权后调用deposit函数存入金库账户
        await vault.deposit(amount);
        console.log("存入金库")
        vault_balanceOf = await myToken.balanceOf(vault_address);
        const totalSupply = await vault.totalSupply();
        console.log("=====此时合约vault的余额为:"+vault_balanceOf+"=====");
        assert.equal(amount,vault_balanceOf);
    })
})