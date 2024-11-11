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
通过第二种方法来实现跨链操作
在第一节中我们已经在sepolia链上mint了一个NFT，根据第二种方式，我们也同样需要在B链上mint一个Wrapped的NFT
1、新建一个WrappedMyToken合约  

1.1集成MyToken合约

1.2完成构造函数

1.3修改mint函数（对固定tokenId进行铸造，而不是进行自增）

2、创建NFT POOL

<!-- TOC -->