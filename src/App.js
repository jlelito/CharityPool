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
import WhitelistForm from './components/WhitelistForm.js';
import CreateCharity from './components/CreateCharity.js';

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
  console.log('charities:', charities)

  this.setState({charities, myVotes})
  if (this.state.account !== 'undefined' && this.state.account !== null) {

    accountDepositedAmount = await this.state.poolContract.methods.deposits(this.state.account).call()
    votingPower = await this.state.poolContract.methods.votingPower(this.state.account).call()
  } else{
    accountDepositedAmount = 0
    votingPower = 0
  }
  

  await this.setState({depositedAmount: accountDepositedAmount, votingPower})
  console.log('deposited amt:', this.state.depositedAmount)
  
  poolBalanceUnderlying = await this.state.cETHContract.methods.balanceOfUnderlying(this.state.poolContractAddress).call()
  poolETHDeposited = await this.state.poolContract.methods.ethDeposited().call()
  poolInterest = poolBalanceUnderlying - poolETHDeposited
  this.setState({poolETHDeposited, poolInterest})


  await this.getETHPrice()
  this.sortCharities()
}

async getETHPrice()  {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
  const myJson = await response.json(); //extract JSON from the http response
  // do something with myJson
  this.setState({ethPrice: myJson.ethereum.usd})
}



//Supply ETH to Pool
poolDeposit = (amount) => {
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

poolWhitelist = (targetAddress) => {
  try {
    this.state.poolContract.methods.whitelist(targetAddress).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Whitelisted Member to Pool', trxStatus: 'Pending', confirmNum: 0})
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
          window.alert('Error! Could not whitelist member!')
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

poolUnwhitelist = (targetAddress) => {
  try {
    this.state.poolContract.methods.unwhitelist(targetAddress).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Unwhitelisted Member from Pool', trxStatus: 'Pending', confirmNum: 0})
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
          window.alert('Error! Could not unwhitelist member!')
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

showNotification = () => {
  this.notificationOne.current.updateShowNotify()
}

constructor(props) {
  super(props)
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
    myVotes: [],
    depositedAmount: null,
    votingPower: null,
    currentEthBalance: '0',
    hash: null,
    action: null,
    trxStatus: null,
    confirmNum: 0,
    ethPrice: null
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

          {this.state.admin === this.state.account ? 
          <>
          <h2 className='mt-2'>Whitelist Addresses</h2>
            <WhitelistForm 
              poolWhitelist={this.poolWhitelist}
              poolUnwhitelist={this.poolUnwhitelist}
            />

          <h2 className='mt-2'>Create Charities</h2>  
            <CreateCharity 
              poolCreateCharity={this.poolCreateCharity}
            />

            <button className='btn btn-primary mt-5' onClick={() => this.releasePrize()}>Release Prize!</button>
          </>
          : null

          }

          {this.state.web3 !== null ?
          <h3 className='mt-5'>ETH Deposited to Contract: {this.state.web3.utils.fromWei(this.state.poolETHDeposited)} ETH</h3>
          : null}
          <h3 className='mt-2'>Contract cETH Balance: {this.state.contractCETHBalance} cETH</h3>
            <div className='row justify-content-center'>
              <Pool
                web3={this.state.web3}
                admin={this.state.admin}
                depositedAmount={this.state.depositedAmount}
                poolDeposit={this.poolDeposit}
                poolWithdraw={this.poolWithdraw}
                currentEthBalance = {this.state.currentEthBalance}
                votingPower={this.state.votingPower}
                poolInterest={this.state.poolInterest}
                ethPrice={this.state.ethPrice}
              /> 
            </div>

            &nbsp;
            <hr/>
            <h2>Vote for Charities</h2>
            {this.state.web3 !== null ?
            <>
            <p><b>Your Voting Power: {this.state.web3.utils.fromWei(this.state.votingPower, 'milliether')} Votes</b></p>
            <p><b>Your Votes Delegated: {this.state.web3.utils.fromWei((this.state.depositedAmount - this.state.votingPower).toString(), 'milliether')} Votes</b></p>
            </>
            :  null}
            <p className='text-muted small'>Note: 1 ETH = 1000 Votes</p>
            
            {this.state.charities.map(charity => (
              <CharityVote
                key={charity.id}
                web3={this.state.web3}
                depositedAmount={this.state.depositedAmount}
                myVote={this.state.myVotes[charity.id]}
                charity={charity}
                addVotes={this.addVotes}
                removeVotes={this.removeVotes}
                votingPower={this.state.votingPower}
              />
              
            ))}
            
  
            

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
