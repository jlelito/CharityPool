pragma solidity ^0.6.0;

contract FriendsPoolTogether {
    
    uint public nextId = 0;
    address public admin;
    mapping(uint => Pool) public pools;
    mapping(address => mapping(uint => bool)) public whitelisted;
    mapping(address => mapping(uint => uint)) public deposits;
    
    event PoolCreated(uint id, address admin);
    event WhiteListed(uint _id, address member);
    event deposited(uint _id, uint depositAmount);
    event withdrawed(uint _id, uint withdrawAmount);
    
    
    struct Pool {
        uint poolID;
        address admin;
        uint tickets;
    }
    
    
    function createPool() public {
       pools[nextId] = Pool(nextId, msg.sender, 0);
       nextId++;
    }
    
    function whitelist(uint _id, address memberTarget) public onlyAdmin(_id) {
        nextId++;
    }
    
    function deposit() public {
        nextId++;
    }
    
    
    function withdraw() public {
        nextId++;
    }
    
    
    function getRandomNumber() internal {
        nextId++;
    }
    
    
    modifier onlyAdmin(uint _id) {
        require(msg.sender == pools[_id].admin);
        _;
    }
    
    
}