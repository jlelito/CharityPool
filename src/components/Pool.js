import React, { Component } from 'react';
import ethlogo from '../src_images/ETH.png';
import { Loader } from 'rimble-ui';

class Pool extends Component {


calculateInterest() {
    let result
    result = this.props.web3.utils.fromWei(this.props.poolInterest.toString(), 'Ether') / this.props.ethPrice
    if(result < 1){
        result = 'Less than $1'
    }
    return result
}


render() {
    return(
        <div className='col-sm-6'>
            <div className='card mt-4 mx-3'>
                <div className='card-body'>
                    <p className='card-text'>Pool Admin: {this.props.admin}  </p>
                    {this.props.web3 === null ? null : 
                    <>
                    <b className='card-text'>Interest Amount: <p className='text-success'>{this.props.web3.utils.fromWei(this.props.poolInterest.toString(), 'Ether')} ETH</p></b>
                    <b>Interest $ Amount: <b className='text-success'>{this.calculateInterest()}</b></b>
                    </>
                    }
                    <p className='text-muted'>Price of ETH: ${this.props.ethPrice} (powered by CoinGecko)</p>
                    <p className='card-text'>Next Interest Release Date: </p>
                    <div className='row justify-content-center'>

                    <form onSubmit={(e) => {
                        let depositAmount
                        e.preventDefault()
                        depositAmount = this.depositInput.value.toString()
                        this.depositInput.value = null
                        this.props.poolDeposit(depositAmount)
                    }}>
                        <div className='row justify-content-center'>
                            <input 
                                type='number' 
                                className='form-control mx-2 col-6' 
                                placeholder='0 ETH' 
                                min='.00001' 
                                step='.00001'
                                ref={(depositInput) => { this.depositInput = depositInput }}
                                disabled={!this.props.isConnected}
                                required 
                            />
                            <a className='text-muted mt-2' onClick={() => this.depositInput.value = this.props.currentEthBalance}>Max</a>
                        </div>
                        <div className='row justify-content-center'>
                            <button className='btn btn-primary mt-1' type='submit'>Deposit</button>
                        </div>
                    </form>

                    <form onSubmit={(e) => {
                        let withdrawAmount
                        e.preventDefault()
                        withdrawAmount = this.withdrawInput.value.toString()
                        this.withdrawInput.value = null
                        this.props.poolWithdraw(withdrawAmount)
                    }}>
                        <div className='row justify-content-center'>
                        <input 
                            type='number' 
                            className='form-control mx-2 col-6' 
                            placeholder='0 ETH' 
                            min='.0000000000000000000001' 
                            step='.0001'
                            ref={(withdrawInput) => { this.withdrawInput = withdrawInput }}
                            disabled={!this.props.isConnected || this.props.votingPower == 0 }
                            required 
                        />
                        {this.props.votingPower != 0 && this.props.votingPower != null ? 
                        <a className='text-muted mt-2' onClick={() => this.withdrawInput.value = this.props.web3.utils.fromWei(this.props.votingPower, 'Ether')}>Max</a>
                        : null}
                        </div>
                        <div className='row justify-content-center'>
                            <button className='btn btn-primary mt-1' type='submit' disabled={!this.props.isConnected || this.props.votingPower == 0 }>Withdraw</button>
                        </div>
                    </form>
                    </div>
                </div>
                <div className='card-footer'>
                    {this.props.depositedAmount != null && this.props.depositedAmount != undefined ?
                    <>
                    <label className='row justify-content-center'><p>Your Amount Deposited:<b> {this.props.web3.utils.fromWei(this.props.depositedAmount.toString(), 'Ether')} ETH</b></p>
                         <img src={ethlogo} width='25' height='25' alt='ethlogo'/>
                         {this.props.trxStatus === 'Pending' && (this.props.action === 'Deposited ETH to Pool' || this.props.action === 'Redeemed ETH from Pool')  ? 
                            <Loader 
                                className='mt-1 ml-1'
                                type='Oval'
                                color='#00BFFF'
                                height={35}
                                width={35}>
                            </Loader>
                            : null
                        }
                    </label>
                    <label className='row justify-content-center'><p>Your Amount Avaliable to Withdraw:<b className='text-success'> {this.props.web3.utils.fromWei(this.props.votingPower.toString(), 'Ether')} ETH</b></p>
                        <img src={ethlogo} width='25' height='25' alt='ethlogo'/>
                    </label>
                    <label className='row justify-content-center'><p>ETH Delegated <b className='text-danger'> {this.props.web3.utils.fromWei((this.props.depositedAmount - this.props.votingPower).toString(), 'Ether')} ETH</b></p>
                        <img src={ethlogo} width='25' height='25' alt='ethlogo'/>
                    </label>
                    </>
                    : 'None Deposited!'}
                </div>
            </div>        
        </div>
    )
}


}

export default Pool;