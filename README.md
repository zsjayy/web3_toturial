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