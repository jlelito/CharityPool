const FriendsPoolTogether = artifacts.require("FriendsPoolTogether");

module.exports = async function(deployer, accounts) {
  deployer.deploy(FriendsPoolTogether);
};