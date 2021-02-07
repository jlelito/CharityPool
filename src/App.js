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
      web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`))
      await this.setState({web3})
    }
    await this.loadContractData()
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

    console.log('Getting network')
    const networkId = await web3.eth.net.getId()
    this.setState({network: networkId})

    if(this.state.network !== 3) {
      this.setState({wrongNetwork: true})
    }
  }

// Load HouseToken Contract Data
async loadContractData() {
  let contractAdmin
  let PoolTogetherData = FriendsPoolTogether.networks[5777]
  if(PoolTogetherData) {
    
    const abi = PoolTogetherData.abi
    const address = PoolTogetherData.address
    //Load contract and set state
    const tokenContract = new this.state.web3.eth.Contract(abi, address)
    await this.setState({ contract : tokenContract })

    contractAdmin = await this.state.houseToken.methods.admin().call()
    this.setState({ admin: contractAdmin })
  }

}

constructor(props) {
  super(props)
  this.notificationOne = React.createRef()
  this.state = {
    account: '0x0',
    admin:'0x0',
    contract: {},
    loading: true,
    currentDate: null,
    currentEthBalance: '0',
    hash: null,
    action: null,
    showNotification: false,
    notifyAmount:null,
    notifyName:null
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
      <div className="App">
        <Navbar 
          account={this.state.account}
          balance={this.state.currentEthBalance}
        />

        <Notification 
            showNotification={this.state.showNotification}
            action={this.state.action}
            hash={this.state.hash}
            ref={this.notificationOne}
            amount={this.state.notifyAmount}
            name={this.state.notifyName}
        />

          <h1>Hello!!!</h1>
          <h1>Account: {this.state.account}</h1>
          <h1>Admin: {this.state.admin}</h1>
          <p>
            Josh's Pool Together App.
          </p>
          <p
            
          >
            Learn React
          </p>
        
      </div>
    );
  }
}
export default App;
