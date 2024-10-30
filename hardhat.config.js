require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
require("@chainlink/env-enc").config();
require("hardhat-deploy");

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const SEPOLIA_ACCOUNTS = process.env.SEPOLIA_ACCOUNTS;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY;
const SEPOLIA_ACCOUNTS_1 = process.env.SEPOLIA_ACCOUNTS_1;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "hardhat", 默认使用的是hardhat本地的网络
  solidity: "0.8.27",
  networks:{
    sepolia:{
      url: SEPOLIA_URL,
      accounts:[SEPOLIA_ACCOUNTS,SEPOLIA_ACCOUNTS_1],
      chainId:11155111
    }
  },
  etherscan:{
    apiKey:{
      sepolia: ETHERSCAN_APIKEY
    } 
  },
  namedAccounts:{
    firstAccount:{
      default:0
    },
    secondAccount:{
      default:1
    }
  }
};
