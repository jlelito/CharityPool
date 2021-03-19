import React, { Component } from 'react';
import './App.css';
import FriendsPoolTogether from './abis/FriendsPoolTogether.json';
import Web3 from 'web3';
import Navbar from './components/Navbar.js';
import Notification from './components/Notification.js';
import Loading from './components/Loading.js';
import ConnectionBanner from '@rimble/connection-banner';
import cETH from './abis/cETHRopstenABI.json';
import Pool from './components/Pool.js';

class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    let web3
    
    this.setState({loading: true})
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
  PoolTogetherData = FriendsPoolTogether.networks[3]
  if(PoolTogetherData) {
    const abi = FriendsPoolTogether.abi
    const address = PoolTogetherData.address
    //Load contract and set state
    const poolContract = new this.state.web3.eth.Contract(abi, address)
    await this.setState({ poolContract, poolContractAddress: address })
    contractAdmin = await this.state.poolContract.methods.admin().call()
    this.setState({ admin: contractAdmin })
  }
  //Compound Ropsten address located here: https://compound.finance/docs#networks
  const compoundCETHContractAddress = '0x859e9d8a4edadfedb5a2ff311243af80f85a91b8'
  const cETHContract = new this.state.web3.eth.Contract(cETH, compoundCETHContractAddress)
  await this.setState({cETHContract, cETHAddress: compoundCETHContractAddress})
  let cETHBalance = await this.state.cETHContract.methods.balanceOf(this.state.poolContractAddress).call()
  this.setState({contractCETHBalance: cETHBalance})
  console.log('cETH Contract:', this.state.cETHContract)
  let contractETHDeposited = await this.state.cETHContract.methods.balanceOfUnderlying(this.state.poolContractAddress).call()
  contractETHDeposited = this.state.web3.utils.fromWei(contractETHDeposited, 'Ether')
  this.setState({ contractETHDeposited })


}

async loadPoolData() {

  let currentDeposit = await this.state.poolContract.methods.deposits(this.state.account).call()
  
  this.setState({depositedAmount: currentDeposit})
}



//Supply ETH to Pool
poolDeposit = (id, amount) => {
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  try {
    this.state.poolContract.methods.deposit(id, this.state.cETHAddress).send({ from: this.state.account, value: amount}).on('transactionHash', async (hash) => {
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
poolWithdraw = (id, amount) => {
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  try {
    this.state.poolContract.methods.withdraw(id, amount, this.state.cETHAddress).send({ from: this.state.account }).on('transactionHash', async (hash) => {
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
    depositedAmount: null,
    currentEthBalance: '0',
    hash: null,
    action: null,
    trxStatus: null,
    confirmNum: 0
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
          <h1 className='mt-1 mb-5'>Charity Pool</h1>
          <p>Pool Money together for Charity! Vote on the charity of the week to receive the interest!</p>
          <h3 className='mt-5'>ETH Deposited to Contract: {this.state.contractETHDeposited} ETH</h3>
          <h3 className='mt-2'>Contract cETH Balance: {this.state.contractCETHBalance} cETH</h3>
          {this.state.poolsList.length === 0 ? <h1 className='my-5'>No Pools Found!</h1> : 
            <>
              <div className='row'>
                <Pool
                  key={pool.poolID}
                  web3={this.state.web3}
                  depositedAmount={this.state.depositedAmount}
                  poolDeposit={this.poolDeposit}
                  poolWithdraw={this.poolWithdraw}
                  currentEthBalance = {this.state.currentEthBalance}
                /> 
              </div>
            </>
            }
          
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
