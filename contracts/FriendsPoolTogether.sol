pragma solidity ^0.6.0;

contract FriendsPoolTogether {
    
    uint public nextId = 0;
    address public admin;
    mapping(uint => Pool) public pools;
    mapping(address => mapping(uint => uint)) public deposits;
    mapping(address => mapping(uint => bool)) public poolsWhitelist;
    
    event PoolCreated(uint id, address admin);
    event whitelistedEvent(uint _id, address member);
    event deposited(uint _id, uint depositAmount);
    event withdrawed(uint _id, uint withdrawAmount);

    constructor() public {
        admin = msg.sender;
    }
    
    struct Pool {
        uint poolID;
        string name;
        address payable admin;
        uint tickets;
    }
    
    //Creates a pool
    function createPool(string memory  _name) public {
       pools[nextId] = Pool(nextId, _name,  msg.sender, 0);
       nextId++;
    }
    
    //Whitelist member for a pool
    function whitelist(uint _id, address memberTarget) public onlyAdmin(_id) {
        poolsWhitelist[memberTarget][_id] = true;
    }
    
    //Unwhitelist member for a pool
    function unwhitelist(uint _id, address memberTarget) public onlyAdmin(_id) {
        poolsWhitelist[memberTarget][_id] = false;
    }
    
    //Deposit into a pool
    function deposit(uint _id) public payable onlyMember(_id) {
        deposits[msg.sender][_id] += msg.value;
        pools[_id].tickets += msg.value;
    }
    
    //Withdraw from a pool
    function withdraw(uint _id, uint amount) public onlyMember(_id) {
        deposits[msg.sender][_id] -= amount;
        pools[_id].tickets -= amount;
        address payable target = msg.sender;
        target.transfer(amount);
    }
    
    //Internal function: Releases the prize after the timeperiod
    function releasePrize(uint _id) internal {
        //Release prize to random winner
    }

    //Internal function: Deposits prize pool into Compound Finance, AAVE, or interest account
    function depositIntoCompound() internal {
        //Deposit into interest account
    }
    
    //Internal function: Gets a random number for the winner
    function getRandomNumber() internal {
        //Get random number
    }

    //Can only be admin for pool modifier
    modifier onlyAdmin(uint _id) {
        require(msg.sender == pools[_id].admin, 'Must be te admin for this pool!');
        _;
    }

    //Can only be members for pool modifier
    modifier onlyMember(uint _id) {
        require(poolsWhitelist[msg.sender][_id] == true, 'Must be a member!');
        _;
    }
    
    
}