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

    constructor(address _admin) public {
        admin = _admin;
    }
    
    struct Pool {
        uint poolID;
        string name;
        address admin;
        uint tickets;
    }
    
    //Creates a pool
    function createPool() public {
       pools[nextId] = Pool(nextId, msg.sender, 0);
       nextId++;
    }
    
    //Whitelist members for a pool
    function whitelist(uint _id, address memberTarget) public onlyAdmin(_id) {
        nextId++;
    }
    
    //Deposit into a pool
    function deposit(uint _id) public payable {
        nextId++;
    }
    
    //Withdraw from a pool
    function withdraw(uint _id) public {
        nextId++;
    }
    
    //Internal function: Releases the prize after the timeperiod
    function releasePrize() internal {
        nextId++;
    }

    //Internal function: Deposits prize pool into Compound Finance, AAVE, or interest account
    function depositIntoCompound() internal {
        nextId++;
    }
    
    //Internal function: Gets a random number for the winner
    function getRandomNumber() internal {
        nextId++;
    }

    //Can only be admin for pool modifier
    modifier onlyAdmin(uint _id) {
        require(msg.sender == pools[_id].admin, 'Must be te admin for this pool!');
        _;
    }

    //Can only be members for pool modifier
    modifier onlyMember(uint _id) {
        require(whitelisted[msg.sender][_id] == true, 'Must be a member!');
        _;
    }
    
    
}