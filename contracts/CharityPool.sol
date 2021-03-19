pragma solidity ^0.5.12;

import './CompoundWallet.sol';

contract CharityPool is CompoundWallet {
    
    uint public ethDeposited = 0;
    address public admin;
    mapping(address => uint) public deposits;
    mapping(address => bool) public poolsWhitelist;
    
    event whitelistedEvent(address member);
    event unWhitelistedEvent(address member);
    event deposited(uint depositAmount);
    event withdrawed(uint withdrawAmount);

    constructor() public {
        admin = msg.sender;
    }
 
    /// @dev Whitelist member for a pool
    /// @param _memberTarget the address of the member to add to whitelist
    function whitelist(address _memberTarget) public onlyPoolAdmin() {
        poolsWhitelist[_memberTarget] = true;
        emit whitelistedEvent(_memberTarget);
    }
    
    /// @dev Unwhitelist member for a pool
    /// @param _memberTarget the address of the member to remove from whitelist
    function unwhitelist(address _memberTarget) public onlyPoolAdmin() {
        poolsWhitelist[_memberTarget] = false;
        emit unWhitelistedEvent(_memberTarget);
    }
    
     /// @dev Deposit into a pool
     /// @param _compoundAddress the compound address to deposit into
    function deposit(address payable _compoundAddress) public payable onlyMember() {
        deposits[msg.sender] += msg.value;
        ethDeposited += msg.value;
        supplyEthToCompound(_compoundAddress);
        emit deposited(msg.value);
    }
    
    /// @dev Withdraw from a pool
    /// @param _amount the amount of Wei to withdraw
    /// @param _compoundAddress the compound address to withdraw from
    function withdraw(uint _amount, address _compoundAddress) public onlyMember() {
        require(deposits[msg.sender] >= _amount, 'not enough deposited!');
        redeemcETHTokens(_amount, false, _compoundAddress);
        address(msg.sender).transfer(_amount);
        deposits[msg.sender] -= _amount;
        ethDeposited -= _amount;
        emit withdrawed(_amount);
    }
    

    /// @dev Releases the interest  after the timeperiod
    /// @param _target the target address to release the prize
    function releasePrizeTarget(address payable _target, address _compoundAddress) public onlyAdmin() {
        //Release interest to target address
        address(_target).transfer(calculateInterest(_compoundAddress));
    }


    /// @dev Calculates the interest accured for Pool
    function calculateInterest(address _compoundAddress) internal returns (uint) {
        cETH cToken = cETH(_compoundAddress);
        //1. Retrieve how much total ETH Underlying in Contract
        uint contractEthUnderlying = cToken.balanceOfUnderlying(address(this));
        //2. Calculate the total interest to be paid out for contract
        uint totalInterest = contractEthUnderlying - ethDeposited;
        return totalInterest;
    }
    

    /// @dev Can only be admin for pool modifier
    modifier onlyPoolAdmin() {
        require(msg.sender == admin, 'Must be te admin for this pool!');
        _;
    }

    /// @dev Can only be members in pool modifier
    modifier onlyMember() {
        require(poolsWhitelist[msg.sender] == true, 'Must be a member!');
        _;
    }
    
    
}