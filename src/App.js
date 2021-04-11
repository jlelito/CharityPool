import React, { Component } from 'react';
import './App.css';
import CharityPool from './abis/CharityPool.json';
import Web3 from 'web3';
import Navbar from './components/Navbar.js';
import Notification from './components/Notification.js';
import Loading from './components/Loading.js';
import ConnectionBanner from '@rimble/connection-banner';
import cETH from './abis/cETHRopstenABI.json';
import Pool from './components/Pool.js';
import CharityVote from './components/CharityVote.js';
import CreateCharity from './components/CreateCharity.js';
import CharityData from './CharityData.json';
import magnify from './src_images/magnify.png';
import ethlogo from './src_images/ETH.png';
import { Loader } from 'rimble-ui';

class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData()
    
  }

  async loadBlockchainData() {
    this.setState({loading: true})
    let web3
    
    if(typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum)
      await this.setState({web3})
      await this.loadAccountData()
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`))
      await this.setState({web3})
    }
    await this.loadContractData()
    await this.loadPoolData()
    this.setState({loading: false})
    //Update interest every 5 seconds
    var self = this
    var intervalId = window.setInterval(async function(){
      let poolBalanceUnderlying, poolETHDeposited, poolInterest
      poolBalanceUnderlying = await self.state.cETHContract.methods.balanceOfUnderlying(self.state.poolContractAddress).call()
      poolETHDeposited = await self.state.poolContract.methods.ethDeposited().call()
      poolInterest = poolBalanceUnderlying - poolETHDeposited
      console.log('new interest:', poolInterest)
      await self.setState({poolInterest})
      self.getETHPrice()
    }, 10000);
  }

  //Load account data
  async loadAccountData() {
    let web3 = new Web3(window.ethereum) 
    const accounts = await this.state.web3.eth.getAccounts()
    if(typeof accounts[0] !== 'undefined' && accounts[0] !== null) {
      let currentEthBalance = await this.state.web3.eth.getBalance(accounts[0])
      currentEthBalance = this.state.web3.utils.fromWei(currentEthBalance, 'Ether')
      await this.setState({account: accounts[0], currentEthBalance, isConnected: true})
    } else {
      await this.setState({account: null, isConnected: false})
    }
  
    const networkId = await web3.eth.net.getId()
    this.setState({network: networkId})
  
    if(this.state.network !== 3) {
      this.setState({wrongNetwork: true})
      web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`))
      await this.setState({web3})
    }
  }

// Load HouseToken Contract Data
async loadContractData() {
  
  let contractAdmin, PoolTogetherData
  PoolTogetherData = CharityPool.networks[3]
  if(PoolTogetherData) {
    const abi = CharityPool.abi
    const address = PoolTogetherData.address
    //Load contract and set state
    const poolContract = new this.state.web3.eth.Contract(abi, address)
    contractAdmin = await poolContract.methods.admin().call()
    this.setState({admin: contractAdmin, poolContract, poolContractAddress: address})
  }
  //Compound Ropsten address located here: https://compound.finance/docs#networks
  const compoundCETHContractAddress = '0x859e9d8a4edadfedb5a2ff311243af80f85a91b8'
  const cETHContract = new this.state.web3.eth.Contract(cETH, compoundCETHContractAddress)
  await this.setState({cETHContract, cETHAddress: compoundCETHContractAddress})
  let cETHBalance = await this.state.cETHContract.methods.balanceOf(this.state.poolContractAddress).call()
  this.setState({contractCETHBalance: cETHBalance})

}

async loadPoolData() {
  let charities = []
  let myVotes = []
  let currentCharity, currentVote, votingPower, nextId, accountDepositedAmount, poolETHDeposited, poolBalanceUnderlying, poolInterest

  nextId = await this.state.poolContract.methods.nextId().call()

  for(let i=0; i<nextId; i++){
    currentCharity = await this.state.poolContract.methods.charities(i).call()
    charities.push(currentCharity)

    if (this.state.account !== 'undefined' && this.state.account !== null) {
      currentVote = await this.state.poolContract.methods.votes(this.state.account, i).call()
      myVotes.push(currentVote)
    }
  }

  this.setState({charities, myVotes})
  this.sortCharities()
  let currentCharities =  this.state.charities.slice(0, 3)
  this.setState({currentCharities})
  if (this.state.account !== 'undefined' && this.state.account !== null) {
    accountDepositedAmount = await this.state.poolContract.methods.deposits(this.state.account).call()
    votingPower = await this.state.poolContract.methods.votingPower(this.state.account).call()
  } else{
    accountDepositedAmount = 0
    votingPower = 0
  }
  
  await this.setState({depositedAmount: accountDepositedAmount, votingPower})
  poolBalanceUnderlying = await this.state.cETHContract.methods.balanceOfUnderlying(this.state.poolContractAddress).call()
  poolETHDeposited = await this.state.poolContract.methods.ethDeposited().call()
  poolInterest = poolBalanceUnderlying - poolETHDeposited
  this.setState({poolETHDeposited, poolInterest})
  let events = await this.state.poolContract.getPastEvents('wonPrize', {fromBlock: 0, toBlock: 'latest'})
  events = events.slice(-3).reverse()
  this.setState({pastWinners: events})
  await this.getETHPrice()
  
}

//Supply ETH to Pool
poolDeposit = (amount) => {
  this.setState({amount: amount})
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  try {
    this.state.poolContract.methods.deposit(this.state.cETHAddress).send({ from: this.state.account, value: amount}).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Deposited ETH to Pool', trxStatus: 'Pending', confirmNum: 0})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadAccountData()
          await this.loadContractData()
          await this.loadPoolData()

          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Supply ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

//Withdraw ETH from Pool
poolWithdraw = (amount) => {
  this.setState({amount: amount})
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  try {
    this.state.poolContract.methods.withdraw(amount, this.state.cETHAddress).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Redeemed ETH from Pool', trxStatus: 'Pending', confirmNum: 0})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadAccountData()
          await this.loadContractData()
          await this.loadPoolData()

          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Redeem ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}


poolCreateCharity = (name, address) => {
  try {
    this.state.poolContract.methods.createCharity(name, address).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Created Charity', trxStatus: 'Pending', confirmNum: 0})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadAccountData()
          await this.loadContractData()
          await this.loadPoolData()

          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not create charity!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}


addVotes = (id, voteAmount) => {
  this.setState({charityTarget: id, amount: voteAmount})
  voteAmount = this.state.web3.utils.toWei(voteAmount, 'milliether')
  try {
    this.state.poolContract.methods.addVotes(id, voteAmount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Added Votes to Charity', trxStatus: 'Pending', confirmNum: 0})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadAccountData()
          await this.loadContractData()
          await this.loadPoolData()
          this.sortCharities()

          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not add votes to charity!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

removeVotes = (id, voteAmount) => {
  this.setState({charityTarget: id, amount: voteAmount})
  voteAmount = this.state.web3.utils.toWei(voteAmount, 'milliether')
  try {
    this.state.poolContract.methods.removeVotes(id, voteAmount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Removed Votes from Charity', trxStatus: 'Pending', confirmNum: 0})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadAccountData()
          await this.loadContractData()
          await this.loadPoolData()
          this.sortCharities()

          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not remove votes from charity!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

releasePrize = () => {
  try {
    this.state.poolContract.methods.releasePrizeTarget(this.state.cETHAddress).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Released Prize', trxStatus: 'Pending', confirmNum: 0})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadAccountData()
          await this.loadContractData()
          await this.loadPoolData()

          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not release prize!!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}


sortCharities = () => {
  let sortedCharities = this.state.charities.sort(function(a,b){
    return b.votes - a.votes
  })
  this.setState({sortedCharities})
}


searchCharities = (searchInput) => {
  console.log(this.state.charities)
  let filteredCharities = this.state.charities.filter(charity => charity.name.toLowerCase().includes(searchInput.toLowerCase()))
  this.setState({currentCharities: filteredCharities})
}

showMoreCharities = () => {
  this.setState({currentCharities: this.state.charities.slice(0, this.state.currentCharities.length+3)})
}

showNotification = () => {
  this.notificationOne.current.updateShowNotify()
}

calculateInterest() {
  let result
  result = this.state.web3.utils.fromWei(this.state.poolInterest.toString(), 'Ether') / this.state.ethPrice
  if(result < 1) {
      result = 'Less than $1'
  }
  return result
}

async getETHPrice()  {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
  const myJson = await response.json()
  this.setState({ethPrice: myJson.ethereum.usd})
}

constructor(state) {
  super(state)
  this.notificationOne = React.createRef()
  this.state = {
    web3: null,
    account: null,
    admin:null,
    network: null,
    wrongNetwork: false,
    loading: false,
    isConnected: null,
    poolContract: {},
    poolContractAddress: null,
    contractCETHBalance: null,
    contractETHDeposited : null,
    poolsList: [],
    poolETHDeposited: null,
    poolInterest: null,
    charities: [],
    currentCharities: [],
    myVotes: [],
    depositedAmount: null,
    votingPower: 0,
    currentEthBalance: 0,
    hash: null,
    action: null,
    trxStatus: null,
    confirmNum: 0,
    ethPrice: null,
    charityDataState: CharityData.charities,
    charityTarget: null,
    amount: null,
    pastWinners: []
  }
}

  render() {

    if(window.ethereum != null) {

      window.ethereum.on('chainChanged', async (chainId) => {
        window.location.reload()
      })
  
      window.ethereum.on('accountsChanged', async (accounts) => {
        if(typeof accounts[0] !== 'undefined' & accounts[0] !== null) {
          await this.loadAccountData()
          await this.loadPoolData()
        } else {
          this.setState({account: null, currentEthBalance: 0, isConnected: false})
        }
      })
  
    }

    return (
      <div className='App'>
        <Navbar 
          account={this.state.account}
          currentBalance={this.state.houseTokenBalance}
          balance={this.state.currentEthBalance}
          network={this.state.network}
          isConnected={this.state.isConnected}
          trxStatus={this.state.trxStatus}
          amount={this.state.amount}
          action={this.state.action}
          hash={this.state.hash}
        />

        <div className='mt-5' />
        {window.ethereum === null ?
          <ConnectionBanner className='mt-5' currentNetwork={this.state.network} requiredNetwork={3} onWeb3Fallback={true} />
          :
          this.state.wrongNetwork ? <ConnectionBanner className='mt-5' currentNetwork={this.state.network} requiredNetwork={3} onWeb3Fallback={false} /> 
          :
          null
        }
        {this.state.loading ?
        <Loading />
        :
        <>
          <Notification 
            showNotification={this.state.showNotification}
            action={this.state.action}
            hash={this.state.hash}
            ref={this.notificationOne}
            trxStatus={this.state.trxStatus}
            confirmNum={this.state.confirmNum}
            
          />
          &nbsp;
          <div className='mt-3'></div>
          <h1 className='mt-1 mb-3'>Charity Pool</h1>
          <p>Pool money together for Charity! Vote on the charity of the week to receive the interest!</p>
          
          <b>
            <li>1. Make sure <a href='https://metamask.io/download' target='_blank'>MetaMask</a> is installed</li>
            <li>2. <a href='#deposit'>Deposit</a> test ETH into the pool below (test ETH faucet <a href='https://faucet.ropsten.be/' target='_blank'>here</a>)</li>
            <li>3. <a href='#charityVote'>Vote on your favorite charity</a> to receive the interest!</li>
          </b>
          
          <p>You can withdraw ETH that is not delegated at any time!</p>
          {this.state.admin === this.state.account ? 
          <>

          <h2 className='mt-2'>Create Charities</h2>  
            <CreateCharity 
              poolCreateCharity={this.poolCreateCharity}
            />
            <h5 className='mt-5'>Release Prize!</h5>
            <button className='btn btn-primary mt-2' onClick={() => this.releasePrize()}>Release Prize!</button>
          </>
          : null

          }

          {this.state.web3 !== null && this.state.web3 !== undefined ?
          <>
          <div className='row justify-content-center'>
          <h5 className='mt-5'>ETH Deposited to Contract: {this.state.web3.utils.fromWei(this.state.poolETHDeposited)} ETH</h5>
            <img src={ethlogo} className='mt-5' width='30' height='30' alt='ethlogo'/>
          </div>
          </>
          
          : null}
            <div className='row justify-content-center'>
              <Pool
                web3={this.state.web3}
                admin={this.state.admin}
                depositedAmount={this.state.depositedAmount}
                poolDeposit={this.poolDeposit}
                poolWithdraw={this.poolWithdraw}
                calculateInterest={this.calculateInterest}
                currentEthBalance = {this.state.currentEthBalance}
                votingPower={this.state.votingPower}
                poolInterest={this.state.poolInterest}
                ethPrice={this.state.ethPrice}
                isConnected={this.state.isConnected}
                trxStatus={this.state.trxStatus}
                action={this.state.action}
              /> 
            </div>
            
            &nbsp;
            <hr/>
            <h2 id='charityVote'>Vote for Charities</h2>
            {this.state.isConnected ?
            <>
            {this.state.votingPower === 0 ? 
              <>
                <p className='text-danger'><b>No Voting Power!</b></p>
                <p><b>Your Votes Delegated: {this.state.web3.utils.fromWei((this.state.depositedAmount - this.state.votingPower).toString(), 'milliether')} Votes</b></p>
              </>
            : 
              <>
              <div className='row justify-content-center'>
                <p className='text-success'><b>Your Voting Power: {this.state.web3.utils.fromWei(this.state.votingPower.toString(), 'milliether')} Votes</b></p>
                {this.state.trxStatus === 'Pending' && (this.state.action === 'Added Votes to Charity' || this.state.action === 'Removed Votes from Charity') ? 
                  <Loader 
                      className='mt-2 ml-1'
                      type='Oval'
                      color='#00BFFF'
                      height={50}
                      width={50}>
                  </Loader>
                  : null
                }
              </div>
              <div className='row justify-content-center'>
                <p><b>Your Votes Delegated: {this.state.web3.utils.fromWei((this.state.depositedAmount - this.state.votingPower).toString(), 'milliether')} Votes</b></p>
                {this.state.trxStatus === 'Pending' && (this.state.action === 'Added Votes to Charity' || this.state.action === 'Removed Votes from Charity') ? 
                  <Loader 
                      className='mt-2 ml-1'
                      type='Oval'
                      color='#00BFFF'
                      height={50}
                      width={50}>
                  </Loader>
                  : null
                }
                </div>

              </>
            }
            </>
            :  null}
            <div className='row justify-content-center'>
              <div className='col-auto' className='text-muted small mr-2'>
                Conversion Rate: 
              </div>
              <div className='col-auto float-left'>
                <div className='row justify-content-center'>
                  <p className='text-muted small'>.001 ETH = 1 Vote</p>
                  <p className='text-muted small ml-3'>.01 ETH = 10 Votes</p>
                </div>
                <div className='row justify-content-center'>
                  <p className='text-muted small'>.1 ETH = 100 Votes</p>
                  <p className='text-muted small ml-3'>1 ETH = 1000 Votes</p>
                </div>
              </div>
            </div>
            

            <form className='row justify-content-center mt-3'>
              <div className='col-4'>
                <div className='input-group'>
                  <img src={magnify} className='float-right mt-1' width='35' height='35' alt='magnify'/>
                  <input className='form-control form-control' type='text' placeholder='Search...' ref={(searchInput) => { this.searchInput = searchInput }}
                    aria-label='Search'>
                  </input>
                  <button className='btn btn-primary' onClick={(e) => 
                    {
                      e.preventDefault()
                      this.searchCharities(this.searchInput.value.toString())
                    }}>
                      Search
                  </button>
                  <button className='btn btn-primary ml-2' onClick={(e) => 
                    {
                      e.preventDefault()
                      this.searchInput.value = null
                      this.searchCharities('')
                    }}>
                      Reset
                  </button>
                </div>
              </div>
            </form>
            
            <div className='row'>
              <div className='col-8'>
              {this.state.currentCharities.length === 0 ? <h3 className='mt-4'>No Charities Found!</h3> : 
                <>
                  {this.state.currentCharities.map(charity => (
                    <CharityVote
                      key={charity.id}
                      web3={this.state.web3}
                      isConnected={this.state.isConnected}
                      depositedAmount={this.state.depositedAmount}
                      myVote={this.state.myVotes[charity.id]}
                      charity={charity}
                      addVotes={this.addVotes}
                      removeVotes={this.removeVotes}
                      votingPower={this.state.votingPower}
                      charityDataState = {this.state.charityDataState}
                      trxStatus={this.state.trxStatus}
                      action={this.state.action}
                      charityTarget={this.state.charityTarget}
                    />   
                  ))
                  }
                </>
              }
              </div>

              <div className='col-4 float-right'>
                <div className='card mr-5 mt-4'>
                  <div className='card-text'>
                    <h5 className='card-header justify-content-center'>Most Recent Donations</h5>
                    <ol>
                    {this.state.pastWinners.length === 0 ? 'None Found!' :
                    <>
                    {this.state.pastWinners.map(winner => (
                      <li key={winner.id}>
                        <p><b>Date: </b>{(new Date(parseInt(winner.returnValues.timestamp) * 1000)).toLocaleString()}</p>
                        <p><b>Charity: </b> {winner.returnValues.name}</p>
                        <p><b>Donation Amount: </b> {this.state.web3.utils.fromWei(winner.returnValues.prize, 'Ether')} ETH <img src={ethlogo} width='25' height='25' alt='ethlogo'/> </p>
                        <p className='text-muted'>Donation $ Amount:  
                          {(this.state.web3.utils.fromWei(winner.returnValues.prize, 'Ether') / this.state.ethPrice) > 1 ?
                            ' $' + this.state.web3.utils.fromWei(winner.returnValues.prize, 'Ether') / this.state.ethPrice : 
                            ' Less Than $1'
                          }
                        </p>
                        <p><b># of Votes: </b> {this.state.web3.utils.fromWei(winner.returnValues.votes, 'milliether')}</p>
                        <hr />
                      </li>  
                    ))}
                    </>
                    }
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            
            {(this.state.charities.length - this.state.currentCharities.length) % 3 !== 0 ? 
            <><a id='showmore' href='#showmore' onClick={(e) => {
              e.preventDefault()
              this.showMoreCharities()
            }}>Show More Charities</a></>
            : null}
            

          <div className='row justify-content-center mt-4'>
            <p>Charity Pool Contract on Etherscan: </p>
            <a className='ml-3' href={`https://ropsten.etherscan.io/address/${this.state.poolContractAddress}`} target='_blank'>Etherscan</a>
          </div>
        </>
        
        }
        
      </div>
    );
  }
}
export default App;
