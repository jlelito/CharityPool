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

  //Test Creating Pools
  it("Creates Pools", async () => {
    let nextId = await PoolTogetherInstance.nextId();
    nextId = nextId.toNumber();
    console.log('Id before pool: ', nextId);
    await PoolTogetherInstance.createPool();
    nextId = await PoolTogetherInstance.nextId();
    nextId = nextId.toNumber();
    console.log('Id after pool: ', nextId);
    assert.equal(nextId, 1);
  });

  //Test funding Pools
  it("Funds Pools", async () => {
    

  });

  //Test withdrawing from pools
  it("Withdraws from Pool", async () => {
    
  });


});
