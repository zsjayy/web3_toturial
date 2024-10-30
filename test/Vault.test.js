const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { assert } = require("chai");

describe("test vault contract", async function () {
    /**
     * 通过deploy中编写部署脚本，就可以在这里使用
     * 
     */
    let firstAccount;
    let myToken;
    beforeEach(async function() {
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        console.log("firstAccount is:"+firstAccount);
        const tokenDeployment = await deployments.get("Mytoken");
        const vaultDeployment = await deployments.get("Vault");
        console.log("contract is deployed");
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
        const token_address = myToken.target;
        console.log("========token address is:"+token_address)

        vault.waitForDeployment();
        // const vault = await vaultFactory.deploy(token_address);
        // await vault.waitForDeployment();
        console.log("========vault合约部署后构造函数中token的值为:"+(await vault.token()))
        //合约中public类型的变量拥有getter()函数的属性，可以通过vault.token()的形式调用合约中的public变量
        assert.equal((await vault.token()),token_address);
        
    })
})