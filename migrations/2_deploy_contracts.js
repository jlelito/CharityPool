const CharityPool = artifacts.require("CharityPool");

module.exports = async function(deployer) {
  deployer.deploy(CharityPool);
};