pragma solidity ^0.5.12;

import './CompoundWallet.sol';

contract FriendsPoolTogether is CompoundWallet {
    
    uint public nextId = 1;
    uint public ethDeposited = 0;
    address public admin;
    mapping(uint => Pool) public pools;
    mapping(address => mapping(uint => uint)) public deposits;
    mapping(address => mapping(uint => bool)) public poolsWhitelist;
    
    event PoolCreated(uint id, address admin);
    event whitelistedEvent(uint _id, address member);
    event unWhitelistedEvent(uint _id, address member);
    event deposited(uint _id, uint depositAmount);
    event withdrawed(uint _id, uint withdrawAmount);

    constructor() public {
        admin = msg.sender;
    }
    
    struct Pool {
        uint poolID;
        string name;
        address payable admin;
        uint amountDeposited;
    }
    
    /// @dev Creates a pool
    /// @param _name the id of the pool to whitelist member to
    function createPool(string memory  _name) public {
       pools[nextId] = Pool(nextId, _name,  msg.sender, 0);
       poolsWhitelist[msg.sender][nextId] = true;
       emit PoolCreated(nextId, msg.sender);
       nextId++;  
    }
    
    /// @dev Whitelist member for a pool
    /// @param _id the id of the pool to whitelist member to
    /// @param _memberTarget the address of the member to add to whitelist
    function whitelist(uint _id, address _memberTarget) public onlyPoolAdmin(_id) {
        poolsWhitelist[_memberTarget][_id] = true;
        emit whitelistedEvent(_id, _memberTarget);
    }
    
    /// @dev Unwhitelist member for a pool
    /// @param _id the id of the pool to unwhitelist from
    /// @param _memberTarget the address of the member to remove from whitelist
    function unwhitelist(uint _id, address _memberTarget) public onlyPoolAdmin(_id) {
        poolsWhitelist[_memberTarget][_id] = false;
        emit unWhitelistedEvent(_id, _memberTarget);
    }
    
     /// @dev Deposit into a pool
     /// @param _id the id of the pool to deposit
     /// @param _compoundAddress the compound address to deposit into
    function deposit(uint _id, address payable _compoundAddress) public payable onlyMember(_id) {
        deposits[msg.sender][_id] += msg.value;
        pools[_id].amountDeposited += msg.value;
        ethDeposited += msg.value;
        //Somehow calculate how many cTokens minted

        supplyEthToCompound(_compoundAddress);
        emit deposited(_id, msg.value);
    }
    
    /// @dev Withdraw from a pool
    /// @param _id the id of the pool to withdraw
    /// @param _amount the amount of Wei to withdraw
    /// @param _compoundAddress the compound address to withdraw from
    function withdraw(uint _id, uint _amount, address _compoundAddress) public onlyMember(_id) {
        require(deposits[msg.sender][_id] >= _amount, 'not enough deposited!');
        redeemcETHTokens(_amount, false, _compoundAddress);
        address(msg.sender).transfer(_amount);
        deposits[msg.sender][_id] -= _amount;
        pools[_id].amountDeposited -= _amount;
        ethDeposited -= _amount;
        emit withdrawed(_id, _amount);
    }
    

    /// @dev Releases the interest  after the timeperiod
    /// @param _id the id of the pool to release the prize
    /// @param _target the target address to release the prize
    function releasePrizeTarget(uint _id, address payable _target, address _compoundAddress) internal {
        //Release interest to target address
        address(_target).transfer(calculateInterest(_id, _compoundAddress));
    }


    /// @dev Calculates the interest accured for Pool
    /// @param _id the id of the pool to calculate the interest
    function calculateInterest(uint _id, address _compoundAddress) public onlyAdmin() returns (uint) {
        cETH cToken = cETH(_compoundAddress);
        //1. Retrieve how much total ETH Underlying in Contract
        uint contractEthUnderlying = cToken.balanceOfUnderlying(address(this));
        //2. Calculate the total interest to be paid out for contract
        uint totalInterest = contractEthUnderlying - ethDeposited;
        //3. Calculate the interest to be paid to pool
        uint poolInterest = (totalInterest * pools[_id].amountDeposited) / contractEthUnderlying;

        return poolInterest;
    }
    

    /// @dev Can only be admin for pool modifier
    modifier onlyPoolAdmin(uint _id) {
        require(msg.sender == pools[_id].admin, 'Must be te admin for this pool!');
        _;
    }

    /// @dev Can only be members in pool modifier
    modifier onlyMember(uint _id) {
        require(poolsWhitelist[msg.sender][_id] == true, 'Must be a member!');
        _;
    }
    
    
}