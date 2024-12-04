# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
<!-- TOC -->
# 第一部分 npm&hardhat使用

1、安装NVM环境，NVM是node管理器可以安装多个版本的node，并切换使用
nvm install 20 --安装版本为v20.18.0的node
nvm use 版本号 --切换使用某个版本的node

2、初始化一个npm项目
npm init -- 同时会生成一个package.json文件记录项目相关信息
![alt text](./images/image.png)

3、安装hardhat
npm install hardhat --save-dev

4、在hardhat项目目录下运行
npx hardhat 
![alt text](./images/image-1.png)

--使用键盘选择"创建一个新的hardhat.config.js（Create a JavaScript project）" ，然后回车。
这个 JavaScript Hardhat 工程会默认下载 hardhat-toolbox 插件及一些常规设置：
创建好的Hardhat工程包含文件有：
contracts：智能合约目录
scripts ：部署脚本文件
test：智能合约测试用例文件夹。
hardhat.config.js：配置文件，配置hardhat连接的网络及编译选项。

5、导入依赖库
npm install @openzeppelin/contracts --save-dev

6、修改solidity相关配置，hardhat.config.js

7、编译合约
npx hardhat compile
![alt text](./images/image-2.png)
![alt text](./images/image-3.png)
8、部署约合（编写运行脚本进行部署）
npx hardhat run scripts/deployVault.js
![alt text](./images/image-4.png)
8.1、hardhat网络介绍--通过hardhat.config.js文件进行网络配置
npx hardhat run scripts/deployVault.js --network sepolia
![alt text](./images/image-5.png)
1）通过.env配置的方式保存敏感信息(需要安装dotenv包，npm install dotenv --save-dev)
![alt text](./images/image-6.png)
2）通过env-enc的方式进行加密配置
set env-enc set-pw 110119120
npx env-enc set 设置变量和值，require("@chainlink/env-enc").config();在hardhat.config.js进行引用（记住要const定义对应的变量参数）
9、验证合约
1)命令行验证
npx hardhat verify 合约地址 合约参数 --network sepolia
![alt text](./images/image-7.png)
2)部署脚本里验证
![alt text](./images/image-8.png)
2.1）增加逻辑--默认网络不需要验证skipped，sepolia网络走验证逻辑
![alt text](./images/image-9.png)
10、hardhat测试合约
10.1 安装hardhat-deploy插件，并在hardhat.config.js中导入
利用插件进行合约的部署，减少部署的冗余代码
npm install -D hardhat-deploy
![alt text](./images/image-10.png)
此时就有deploy命令，可以直接使用npx hardhat deploy进行部署
![alt text](./images/image-11.png)

# 第二部分 代码技巧
1、test脚本中如何获取合约中的状态变量
```js
//合约中public类型的状态变量支持getter()特性，可以直接使用部署合约的实例调用如：vault.token()
contract Vault {
    //这里的token属性是public，自带getter()方法
    IERC20 public immutable token;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address _token) {
        token = IERC20(_token);
    }
```
2、test脚本中环境设置（包括部署合约、获取账户信息及创建合约实例）
```js
//这行代码是获取合约部署的相关信息，包含abi、address等等
const tokenDeployment = await deployments.get("Mytoken");
```
![alt text](image.png)

3、当前合约部署脚本获取之前合约的地址
```ts
//当前合约中设置变量，获取之前已经部署的合约的deployment
const tokenDeployment = await deployments.get("MyToken");
//通过deloyment.address获取合约地址
const tokenAddr = await tokenDeployment.address;
```
![alt text](image-11.png)

4、一个完整的部署脚本（参考用02_deploy_pool_lock_and_release.js）
```js
const{ getNamedAccounts } = require("hardhat")
moudle.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = getNameAccounts()
    const {deploy,log} = deployments

    log("NFTPoolLockAndRelease contract deploying...")
    //合约部署需要参数_router、_link、_nftAddr
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
    //获得CCIP的对象（就是在0_deploy_ccip_simulator.js部署后才能获得），方便后面调用CCIP中的函数
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator",ccipSimulatorDeployment.address)
    //下面开始调用CCIP中的函数，获取需要的东西
    const ccipConfig = await ccipSimulator.configuretion()
    const sourceChainRouter = ccipConfig.sourceRouter_
    const linkTokenAddr = ccipConfig.linkToken_
    const nftDeployment = await deployments.get("MyToken")
    const nftAddr = nftDeployment.address
    await deploy("NFTPoolLockAndRelease",{
        cotract: "NFTPoolLockAndRelease",
        from: firstAccount,
        log: true,
        //这里的传参数_router、_link、_nftAddr
        args:[sourceChainRouter,linkTokenAddr,nftAddr]
    })
    log("NFTPoolLockAndRelease contract deployed")
}

moudle.exports.tags = ["sourcechain","all"]
```
5、一个完成的测试脚本
```js
const { getNamedAccounts, ethers, deployments } = require("hardhat");
const { expect } = require("chai");

//把变量提取出来，方便后面的测试函数调用
let firstAccount
let ccipSimulator
let nft
let NFTPoolLockAndRelease
let wnft
let NFTPoolBurnAndMint
let chainSelector
before(async function(){
    //准备变量--账号
    firstAccount = (await getNamedAccounts()).firstAccount
    //准备变量--合约，通过tag，部署所有合约
    await deployments.fixture(["all"])
    ccipSimulator = await ethers.getContract("CCIPLocalSimulator",firstAccount)
    nft = await ethers.getContract("MyToken",firstAccount)
    NFTPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease",firstAccount)
    wnft = await ethers.getContract("WrappedMyToken",firstAccount)
    NFTPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint",firstAccount)
    const ccipConfig = await ccipSimulator.configuration()
    console.log("ccipConfig:",ccipConfig)
    chainSelector = ccipConfig.chainSelector_
    console.log("chainSelector:",chainSelector)

})

//第一步：源链sourcechain--》目标链destchain
describe("source chain -> dest chain test", async function(){
    //test1--是否成功mint
    it("test if user can mint one nft from MyToken contract successfully",
        async function () {
            await nft.safeMint(firstAccount)
            const owner = await nft.ownerOf(0)
            expect(owner).to.equal(firstAccount)    
        }
    )

    //test2--是否将nft已经lock在源链的pool中，并通过ccip将message发送给目标链
    it("test if nft has locked in source pool and send message to dest pool successfully",
        async function(){
            //await nft.transferFrom(firstAccount,NFTPoolLockAndRelease.target,0),不能直接这么用
            //这是在测试NFTPoolLockAndRelease合约中lockAndSendNFT()函数，该函数中使用的nft.transferFrom()，调用的是MyToken合约中的transferFrom()
            //所以NFTPoolLockAndRelease合约本身不具备转移nft的权限
            //先授权--将id为0的nft授权给NFTPoolLockAndRelease合约（执行lockAndSendNFT所需条件一）
            await nft.approve(NFTPoolLockAndRelease.target,0)
            console.log("nft's approval:",await nft.approve(NFTPoolLockAndRelease.target,0))
            //执行lockAndSentNFT需要fee（执行lockAndSendNFT所需条件二）
            await ccipSimulator.requestLinkFromFaucet(NFTPoolLockAndRelease, ethers.parseEther("10"))
            
            //参考合约中的入参进行赋值uint256 tokenId, newOwner, chainSelector, revceiver
            //lockAndSendNFT包含两个步骤：1.将nft从firstAccount转移到NFTPoolLockAndRelease合约；2.通过ccip发送消息
            console.log("newOwner:",firstAccount)
            console.log("chainSelector:",chainSelector)
            
            const receiverAddr = NFTPoolBurnAndMint.target
            console.log("receiver:",receiverAddr)
            await NFTPoolLockAndRelease.lockAndSendNFT(0,firstAccount,chainSelector,receiverAddr)
            //检查是不是完成了第一步的转移
            const owner = await nft.ownerOf(0)
            console.log("newOwner:",owner)
            expect(owner).to.equal(NFTPoolLockAndRelease.target)
        }
    )

    //test3--目标链接收到并mint新的wnft
    it("test if user can get a wrapped nft in dest chain",
        async function(){
            //当源链完成lockAndSendNFT后,会通过CCIP发送消息给目标链，目标链上就会mint一个wnft
            //所以只要验证目标链上是否有id为0的wnft存在,即owner不是空值，且owner为firstAccount
            const owner = await wnft.ownerOf(0)
            expect(owner).to.equal(firstAccount)

    })
})

//第二步：目标链destchain--》源链sourcechain
describe("dest chain->source chain test", async function(){
    //test4-目标链的wnft被burn掉，并通过ccip发送message给源链
    it("test if dest chain burn wnft and send message successfully",
        async function() {
            //wnft当前的owner是firstAccount,合约NFTPoolBurnAndMint想要burn掉wnft需要获取approve
            await wnft.approve(NFTPoolBurnAndMint.target,0)
            //需要消耗fees
            await ccipSimulator.requestLinkFromFaucet(NFTPoolBurnAndMint,ethers.parseEther("10"))
            //调用burnAndSendNFT()，传参为tokenId, newOwner, chainSelector, revceiver
            await NFTPoolBurnAndMint.burnAndSendNFT(0,firstAccount,chainSelector,NFTPoolLockAndRelease.target)
            //执行完burnAndSendNFT后，目标链的池子中就没有wnft了，此时totalSupply应该为0
            const totalSupply = await wnft.totalSupply()
            expect(totalSupply).to.equal(0)
        }
    )
    //test5-源链接收到信息后，nft被unlock
    it("test if source nft has unlocked", 
        async function(){
            //检查源链当中的nft是否被unlock释放出来
            const owner = await nft.ownerOf(0)
            expect(owner).to.equal(firstAccount) 
    })
})
```

6、部署脚本中的ethers.getContractAt()和测试脚本中的ethers.getCotract()有什么区别
ethers.getContractAt()是用于获取已经部署的合约实例args(name,address)，与其进行交互，比如部署脚本中获取前一个部署合约的地址
```js
//用于获取前面已经部署的MyToken合约，并填入传参args：合约名，合约地址
const nftDeployment = await deployments.get("MyToken")
const nft = await ethers.getContractAt("MyToken", nftDeployment.address)
```
ethers.getContract()是用于部署新的合约实例，相当于ethers.getContractFactory()，即通过合约工厂部署一个新的合约实例
```js
//谁去部署的
const nft = await ethers.getContract("Mytoken", firstAccount)
//相当于
const contractFactory = await ethers.getContractFactory("MyContract");  
const contract = await contractFactory.deploy(); // 部署合约并获得实例
```
7、部署脚本deploy和测试脚本test中如何获取合约地址
部署脚本deploy
```js
//先创建一个合约实例
const nftDeployment = await deployments.get("MyToken")
//获取合约地址
const nftAddr = nftDeployment.address
```
测试脚本test
```js
//先创建一个合约实例
const nftDeployment = await ethers.getContract("MyToken",firstAccout)
const nftAddr = nftDeployment.target
```
8、获取当前用户的账户余额，检查是否够gas费用
```js
const [account] = await ethers.getSigners()
const accountBalance = await ethers.provider.getBalance(account.address)
或者
const accountBalance = await ethers.provider.getBalance(firstAccount) -- 即账户的地址
```
9、如何获取mint的tokenId--在dev分支上尝试
问题：由于burn掉的代币tokenId没有被重置，所以再次mint时tokenId会进行累加
解决：如何获取tokenId
方案一：通过修改MyToken.sol合约中safemint方法return tokenId来实现，如：
```js
    function safeMint(address to) public returns(uint256){
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, META_DATA);
        isTokenIdExitStill[tokenId] = true;
        emit Minted(to,tokenId);
        return tokenId;
    }
```
对应js脚本的调用为：
```js
//尝试获取tokenId
const tokenId = await nft.safeMint(firstAccount)
console(`mint出来的tokenId为${tokenId}`)
```
结果日志打印出来是：mint出来的tokenId为[object][object]
疑问：为什么mint函数返回的是个对象呢？
解答：
1）在智能合约中函数方法可以分为两种：***状态改变型函数(写入函数)***和**状态只读型函数**
***状态改变型函数(写入函数)***：如转账、铸币等。它们通常返回一个包含交易信息的对象(transactionresponse)，而不是直接返回执行结果
2）智能合约的**写入型函数**调用涉及到区块链的交易处理
所以本合约中的safeMint函数返回类型是 uint256，它在只能合约中确实返回了tokenId。但是，智能合约函数的调用在 JavaScript 中通常是异步的，返回的是一个交易对象，而不是直接的返回值
由此引出另外两种获取tokenId的解决方案：1、交易日志中获取；2、合约中写一个读取tokenId的只读型函数
优化方案1：交易日志中获取
```js
//尝试1:通过交易日志查询到tokenId
const mintTx = await nft.safeMint(firstAccount)
const mintReceipt = await mintTx.wait()
const mintReceiptString = JSON.stringify(mintReceipt,null,2)
console.log(`合约交易信息内容是：${mintReceiptString}`)
const tokenId = await mintReceiptString.logs[0].args.tokenId
```
2.1）问题：这个打印的mintReceiptString里面没有看到tokenId的相关信息,（即使追加event没有对应信息）
```js
event Minted(address indexed to, uint256 indexed tokenId);

function safeMint(address to) public returns(uint256){
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, META_DATA);
    isTokenIdExitStill[tokenId] = true;
    emit Minted(to,tokenId);
    return tokenId;
    }
```
打印输出结果：
```text
receipt的打印输出为:{
  "_type": "TransactionReceipt",
  "blockHash": "0x7b712ac81f2ca097a18ce7167c49d670e10057169cf85fca38fd7f3746205405",
  "blockNumber": 2,
  "contractAddress": null,
  "cumulativeGasUsed": "216130",
  "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "gasPrice": "1786313340",
  "blobGasUsed": null,
  "blobGasPrice": null,
  "gasUsed": "216130",
  "hash": "0x8ef224ccbe646fbc7c5bb89e5ab0a0e663abdb5174e212e2e78932d3ea762f0a",
  "index": 0,
  "logs": [
    {
      "_type": "log",
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "blockHash": "0x7b712ac81f2ca097a18ce7167c49d670e10057169cf85fca38fd7f3746205405",
      "blockNumber": 2,
      "data": "0x",
      "index": 0,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ],
      "transactionHash": "0x8ef224ccbe646fbc7c5bb89e5ab0a0e663abdb5174e212e2e78932d3ea762f0a",
      "transactionIndex": 0
    },
    {
      "_type": "log",
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "blockHash": "0x7b712ac81f2ca097a18ce7167c49d670e10057169cf85fca38fd7f3746205405",
      "blockNumber": 2,
      "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "index": 1,
      "topics": [
        "0xf8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7"
      ],
      "transactionHash": "0x8ef224ccbe646fbc7c5bb89e5ab0a0e663abdb5174e212e2e78932d3ea762f0a",
      "transactionIndex": 0
    },
    {
      "_type": "log",
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "blockHash": "0x7b712ac81f2ca097a18ce7167c49d670e10057169cf85fca38fd7f3746205405",
      "blockNumber": 2,
      "data": "0x",
      "index": 2,
      "topics": [
        "0x30385c845b448a36257a6a1716e6ad2e1bc2cbe333cde1e69fe849ad6511adfe",
        "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ],
      "transactionHash": "0x8ef224ccbe646fbc7c5bb89e5ab0a0e663abdb5174e212e2e78932d3ea762f0a",
      "transactionIndex": 0
    }
  ],
  "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000040020000000000000100000800000000000000000080000010000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000002000000000000000000000000000008000000042000000200000000000000000000000002040000000000000000020000000000000000000200000000000000000000000000000000000000000000000",
  "status": 1,
  "to": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}
```
原因：
hardhat测试框架中，默认情况下，交易回执只显示原始的日志（logs），不会自动解码事件。你需要手动解码事件日志。
```js
    nft = await ethers.getContract("MyToken",firstAccount)
    contractABI = [
        "event Minted(address indexed to, uint256 indexed tokenId)",
        "function safeMint(address to) public returns (uint256)"
    ];
    // iface = new ethers.utils.Interface(contractABI);  由于导入包依赖的问题，这一步无法正确执行

    const filter = nft.filters.Minted(null, null); // 监听所有 Minted 事件
    const logs = await nft.queryFilter(filter);
    console.log("Minted事件的日志: ", logs);

    logs.forEach((log) => {
    const parsedLog = iface.parseLog(log);
    console.log("解析后的事件:", parsedLog);
    });
```
优化方案2:合约中写一个读取tokenId的**只读型函数**
```js
// 新增函数以获取指定地址的所有 Token IDs  
function getTokenIdsByOwner(address owner) public view returns (uint256[] memory) {  
    uint256 balance = balanceOf(owner);  
    uint256[] memory tokenIds = new uint256[](balance);  

    for (uint256 i = 0; i < balance; i++) {  
        tokenIds[i] = tokenOfOwnerByIndex(owner, i);  
    }  

    return tokenIds;  
} 
```
![alt text](image-47.png)
10、如何确认合约函数调用时链上交易所需的gas费用--待更新

11、会存在修改Mytoken.sol合约后需要重新部署，而重新部署后合约的地址就会更改，旧代币无法同步到新合约中，如何避免这个问题呢？
***代理合约***


# 第三部分 跨链应用
## 第一节 去中心化存储
### 步骤
1、进入https://www.openzeppelin.com/生成一个ERC721合约

2、进入filebase上传自己的nft图片和metaData的json文件

3、取到ipfs的URI替换合约中的URI

4、nft铸造，

4.1部署合约并使用safeMint函数铸造合约，此时登录在opensea测试网上就可以查看到刚才铸造的nft
![alt text](image-3.png)，其中这里展示信息就是json文件中的内容
opensea是nft交易平台
testnets.opensea是测试网络环境
![alt text](image-1.png)
ipfs（是一种网络协议）是最大的一个去中心化存储平台，可以把nft的metedata信息存在这里
filebase是基于ipfs的去中心化存储平台
## 第二节 NFT跨链原理
（由于前面我连接的是sepolia网络，所以是在sepolia链上）
思路：先将nft在原有链上锁定，再新的链上释放（mint）出来一个相同的地址
问题：如何保证从A到B链的信息准确，没有人篡改（需要公信力），最好是借助成熟的跨链协议
#### 跨链协议-chainlink CCIP
**跨链的原理**
![alt text](image-4.png)
**跨链的方式**
第一种
![alt text](image-5.png)
第二种
![alt text](image-6.png)
跨链流程
![alt text](image-7.png)
### NFT跨链代码演示
#### 跨链代码合约
通过第二种方法来实现跨链操作
在第一节中我们已经在sepolia链上mint了一个NFT，根据第二种方式，我们也同样需要在B链上mint一个Wrapped的NFT

1、新建一个WrappedMyToken合约  

1.1集成MyToken合约

1.2完成构造函数

1.3修改mint函数（对固定tokenId进行铸造，而不是进行自增）

2、创建NFT POOL--完成lock--》mint

2.1创建MyToken代币合约和LockAndRelease池子

2.2创建WrappedMyToken代币合约和BurnAndMint池子

2.3原链上的nft通过LockAndRelease中lockAndSend方法，将tokenId和owner发送给目标链

2.4目标链通过BurnAndMint中ccipReceive方法，接收tokenId和owner信息并进行mint

2.5以上几步实现第一步（lock--》mint）
![alt text](image-8.png)

3、进行burn--》unlock

3.1目标链通过burnAndSendNFT()，将wnft转移到当前合约中，并且进行burn

3.2burn后将tokenId的相关数据转移到lockAndRelase合约中

3.3lockAndRelase合约接收到数据信息后，将tokenId从当前合约转移到newOwner中

3.4以上几步实现第二步（burn--》unlock）
![alt text](image-9.png)
***至此完成合约的编码***

#### 合约部署（deploy）

1、分别创建4个部署脚本，对应nft、wnft、poolLockAndRelease,poolBurnAndMint

2、安装hardhat所需要的插件
```shell
npm install --save-dev @nomicfoundation/hardhat-ethers ethers hardhat-deploy hardhat-deploy-ethers
```
3、hardhat.config.js中引入对应包
```shell
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
```
4、编写部署脚本
4.1编写MyToken合约部署脚本
```js
const { getNamedAccounts } = require("hardhat")
moudle.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNameAccounts()
    const {deploy, log} = deployments

    log("nft contract is deploying")

    await deploy("MyToken",{
        contract: "MyToken",
        from:firstAccount,
        args:["MyToken", "MT"],
        log: true
    })
    log("nft contract deployed successfully")
}

moudle.exports.tags["sourcechain","all"]
```
4.2编写NFTPoolLockAndRelease合约部署脚本
由于改合约的构造函数中所需的参数本地无法提供，所以需要安装一个本地的chainlink

5、chainlink-local
5.1chainlink-local安装
```shell
npm install -D @chainlink/local
```
6、编写跨链应用合约
6.1编写合约CCIPSimulator.sol引入CCIP的mock合约CCIPLocalSimulator
![alt text](image-10.png)
6.2编写CCIPSimulator.sol合约的部署脚本
6.3编写MyToken合约的部署脚本
6.4编写NFTPoolLockAndRelease合约的部署脚本
由于需要三个参数_router、_link、_nftAddr，正好由编写的CCIPSimulator合约引入的mock合约CCIPLocalSimulator提供
![alt text](image-12.png)
6.5编写WNFT
6.6编写NFTPoolBurnAndMint合约的部署脚本
至此一共编写5个部署脚本：test-1，sourcechain-2，destchain-2
![alt text](image-13.png)
#### 合约测试（test）
1、编写测试脚本，完成5个合约的单元测试
![alt text](image-14.png)

2、设置部署网络--部署到测试网络
2.1新建helper-hardhat-config.js，并在部署脚本中导入
由于nft、wnft无论什么网络都需要部署，所以不用导入；两个pool由于测试使用的是mock，里面的参数会根据网络的不通而变，所以要导入并进行判断
![alt text](image-15.png)
![alt text](image-16.png)
2.2脚本中导入networkConfig，根据网络进行参数的读取
![alt text](image-17.png)
2.3设置私钥
通过env-enc方式对私钥进行加密：
i、进入MATAMASK找到一个账户，查看用户详情查看私钥
ii、进入Alchemy找到所需的测试网络
![alt text](image-18.png)
iii、完成设置（env-enc view 查看明文信息）
![alt text](image-19.png)

2.4进行部署
```shell
//--network [要部署的网络] --tags [要部署的合约]
npx hardhat deploy --network sepolia --tags sourcechain
```
在两个网络上部署合约（sepolia、amoy），所以两个网络上都需要有代币用以支付gas
![alt text](image-20.png)
![alt text](image-21.png)
#### 合约task
1、hardhat自定义任务task

1.1新建task/mint-nft.js

1.2编写脚本
```js
// const { getNamedAccounts } = require("hardhat");
const { task } = require("hardhat/config");

task("mint-nft").setAction(async(taskArgs, hre) => {
    const { firstAccount } = await getNamedAccounts()
    const nft = await ethers.getContract("MyToken", firstAccount)

    console.log("ntf contract address is:${nft.target}")

    console.log("nft contract deploying....")
    const mintTx = await nft.safeMint(firstAccount)
    await mintTx.wait(6)

    const tokenAmount = nft.totalSupply()
    const tokenId = await tokenAmount - 1n
    console.log("nft minted,tokenId is ${tokenId}")
})

module.exports = {}
```
1.3新建index.js，导入新建的脚本
```js
exports.mintNft = require("./mint-nft")
exports.mintNft = require("./check-nft")
```
1.4在harhat.config.js文件中导入task
```js
require("./task");
```
![alt text](image-22.png)
![alt text](image-23.png)
1.5仿造1.1～1.4的步骤编写lock-and-cross.js

1.5.1实质上是执行NFTPoolLockAndRelease合约中的lockAndSendNFT方法，所以需要查看参数
需要tokenId, newOwner, chainSelector, revceiver四个参数
![alt text](image-24.png)
1.5.2参数获取
***tokenId***通过命令行人工传递
```shell
npx hardhat lock-and-cross --tokenid 0 --network sepolia
```
***newOwner***取值hardhat.config.js配置中的对应网络的accounts
***chainSelector***取值为测试网Sepolia的chain selector（CCIP BLOCKCHAIN identifier）
![alt text](image-25.png)
***receiver***取值为目标合约NFTPoolBurnAndMint的地址
***注意***
![alt text](image-26.png)
1.5.3完成lock-and-cross.js的编写
根据lockAndCrossTx.hash值去ccip.chain.link去查询
![alt text](image-27.png)
1.5.4完成check-wnft.js编写--前置条件是1.5.3要完成
```shell
npx hardhat check-wnft --network amoy // 注意网络是amoy
```
![alt text](image-28.png)
此时源链上token为0的owner发生了变化，说明跨链成功
![alt text](image-29.png)

***实际代码流程梳理***
源链source chain
1、MyToken铸造3个代币，tokenId为0，1，2，表现为：
nft的token的owner：0，1，2的owner为**firstAccount**
2、cross token to destchain
2.1、通过源链Pool，将3个nft代币通过lockAndSendNFT将代币nft->lock，表现为：
nft的token的owner：0，1，2的owner为**源链Pool的合约地址address**
2.2、发送ccip通知给目标链

目标链dest chain
1、
1.1接收到ccip的通知后，WrappedMyToken对应的铸造3个wnft代币，tokenId：0，1，2，表现为：
wnft的token的owner：0，1，2的owner为**firstAccount**
2、cross token to sourcechain
2.1、通过目标链Pool，将3个wnft代币通过burnAndMintNFT将代币wnft->burn，表现为：
wnft的token的owner：0，1，2的owner为**目标链Pool的合约地址address**
目标链Pool
![alt text](image-31.png)
![alt text](image-30.png)
***捋一遍执行过程***
[source chain]
源链mint2个代币
![alt text](image-32.png)
区块链浏览器查看代币
![alt text](image-34.png)
check-nft检查mint出来的代币
![alt text](image-33.png)
lock代币MT3、4，并通过ccip发送消息
![alt text](image-35.png)
![alt text](image-36.png)
![alt text](image-37.png)
![alt text](image-38.png)

[dest chain]
check-wnft检查目标链对应mint的wnft
![alt text](image-39.png)
![alt text](image-40.png)
***check-nft检查源链nft的owner***
![alt text](image-41.png)
burn代币3、4，并通过ccip发送消息
![alt text](image-42.png)
![alt text](image-43.png)
***check-wnft检查目标链wnft的tokenId为3、4的owner***
![alt text](image-46.png)
注：wnft代币tokenId为3、4被burn掉
***check-nft检查源链nft的tokenId为3、4的owner***
![alt text](image-45.png)
注：代币MT中tokenId为3的owner由0x73A6ed269995a8Cc0aB4548eAffa4526402B6220(合约)-->0xAbf770B1Ac0EE5095cB330f1F520FA3dFEd78Ca6(账户firstAccount),表明MT由lock状态变为unlock状态
## 第三节 代理合约
在跨链应用中尝试解决tokenId问题时，引起的合约修改后重新部署，合约的地址会发生变化，从而旧合约地址铸造的代币也无法同步到新的合约中
为了使修改合约而不影响代币，提出**代理合约**
<!-- TOC -->