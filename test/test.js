const { assert } = require('chai');

const PoolTogether = artifacts.require("./FriendsPoolTogether.sol");

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract("PoolTogether", accounts => {
  let PoolTogetherInstance;
  
  before(async () => {
    PoolTogetherInstance = await PoolTogether.deployed();
  })

  //Test deploying the contract
  it("Should deploy the contract", async () => {
    address = PoolTogetherInstance.address;
    console.log('Contract Address: ', address);
    assert.equal(address, PoolTogetherInstance.address);
  });

  //Test funding Pools
  it("Deposit into Pool", async () => {

  
  });

  //Test withdrawing from pools
  it("Withdraws from Pool", async () => {
    
  });


});
