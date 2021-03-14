import React, { Component } from 'react';
import './App.css';
import FriendsPoolTogether from './abis/FriendsPoolTogether.json';
import Web3 from 'web3';
import Navbar from './components/Navbar.js';
import Notification from './components/Notification.js';
import Loading from './components/Loading.js';
import ConnectionBanner from '@rimble/connection-banner';


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
    this.loadContractData()
    this.loadPoolData()
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
  
    if(this.state.network !== 5777) {
      this.setState({wrongNetwork: true})
      web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`))
      await this.setState({web3})
    }
  }

// Load HouseToken Contract Data
async loadContractData() {
  
  let contractAdmin, PoolTogetherData
  PoolTogetherData = FriendsPoolTogether.networks[5777]
  if(PoolTogetherData) {
    const abi = FriendsPoolTogether.abi
    const address = PoolTogetherData.address
    //Load contract and set state
    const poolContract = new this.state.web3.eth.Contract(abi, address)
    await this.setState({ poolContract, poolContractAddress: address })
    contractAdmin = await this.state.poolContract.methods.admin().call()
    this.setState({ admin: contractAdmin })
  }

}

async loadPoolData() {
  let length
  const poolsList = []
  length = await this.state.poolContract.methods.nextId().call()
  for(let i=0; i < length; i++){
    let currentPool = await this.state.poolContract.methods.pools(i).call()
    poolsList.push(currentPool)
  }
  this.setState({poolsList})
  console.log('Current Pool List:', poolsList)
}

//Creates Pools
createPool = (name) => {

  this.setState({confirmNum: 0})
  try {
    this.state.poolContract.methods.createPool(name).send({ from: this.state.account }).on('transactionHash', async (hash) => {
      this.setState({hash: hash, action: 'Created Pool', trxStatus: 'Pending'})
      this.showNotification()
      await this.loadAccountData()
      await this.loadPoolData()
      
    }).on('receipt', (receipt) => {
        if(receipt.status === true){
          this.setState({trxStatus: 'Success'})
        }
        else if(receipt.status === false){
          this.setState({trxStatus: 'Failed'})
        }
    }).on('error', (error) => {
        window.alert('Error! Could not create house!')
    }).on('confirmation', (confirmNum) => {
        if(confirmNum > 10) {
          this.setState({confirmNum : '10+'})
        } else{
        this.setState({confirmNum})
        }
    })
    } catch(e) {
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
    poolsList: [],
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
              amount={this.state.notifyAmount}
              name={this.state.notifyName}
          />

          <h1>Pool Together App</h1>
          <h3>Create Pool</h3>
          <form className='col justify-content-center' onSubmit={() => {
            console.log(this.poolName.value.toString())
            let createPoolName = this.poolName.value.toString()
            this.createPool(createPoolName)
          }}>
            <label>Pool Name</label>
            <input
              type='text'
              ref={(poolName) => { this.poolName = poolName }}
              className='form-control form-control-md'
              placeholder='Pool Name'
              required 
            />
            <button type='submit' className='btn btn-primary'>Create</button>
          </form>
          <div className='row'>
            {this.state.poolsList.length === 0 ? <h1>No Pools Found!</h1> : 
            <>
            {this.state.poolsList.map(pool => (
              <div className='col-sm-6'>
                <div className='card mt-4 mx-3'>
                  <div className='card-body'>
                    <h5 className='card-title'>Pool #: {pool.poolID} </h5>
                    <h5 className='card-title'>{pool.name} </h5>
                    <div className='float-left'>
                      <p className='card-text'>Pool Admin: {pool.admin}  </p>
                      <p className='card-text'>Total Amount Deposited: {pool.amountDeposited}</p>
                      <p className='card-text'>Prize Interest Amount: </p>
                      <p className='card-text'>Next Prize Release Date: </p>
                      <div className='row justify-content-center'>
                      <form>
                        <input type='number' className='form-control mx-2' placeholder='0' min='.01' step='.01' required></input>
                        <div className='row justify-content-center'>
                          <button className='btn btn-primary'>Deposit</button>
                        </div>
                      </form>
                      <form>
                        <input type='number' className='form-control mx-2' placeholder='0' min='.01' step='.01' required></input>
                        <div className='row justify-content-center'>
                          <button className='btn btn-primary'>Withdraw</button>
                        </div>
                      </form>
                      </div>
                    </div>
                  </div>
                  <div className='card-footer'>
                    <label>Amount Deposited: </label>
                  </div>
                </div>        
              </div>    
            ))}
            </>
            }
          </div>
        </>
        }
        
      </div>
    );
  }
}
export default App;
