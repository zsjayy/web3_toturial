const { ethers } = require('hardhat');
const { expect } = require('chai');

async function main() {
    const overrides = {
        gasLimit: 12000000, // Increase the gas limit if needed
    };
    const tokenFactory = await ethers.getContractFactory('Mytoken');
    const vaultFactory = await ethers.getContractFactory('Vault');
    console.log('Deploying MyToken and Vault...');

    const token = await tokenFactory.deploy("MY","M",overrides);
    await token.waitForDeployment();
    const targetAddress = await token.getAddress();
    const vault = await vaultFactory.deploy(targetAddress,overrides);
    await vault.waitForDeployment();
    console.log('MyToken deployed to:', targetAddress);

    await despoit();
    console.log("1111");
    return token,vault;
}

async function despoit(vault){
    const amount = 1000;
    const shares = await vault.deposit(amount);
    expect(shares).to.equal(amount);
    console.log('Deposit successful! shraes:',shares);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
})