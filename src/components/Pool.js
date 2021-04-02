import React, { Component } from 'react';
import ethlogo from '../src_images/ETH.png';

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
                    <p className='card-text'><b>Interest Amount: {this.props.web3.utils.fromWei(this.props.poolInterest.toString(), 'Ether')} ETH</b></p>
                        }
                    <p>Price of ETH: ${this.props.ethPrice} (powered by CoinGecko)</p>
                    <p>Interest Amount: {}</p>
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
                                disabled={this.props.isConnected}
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
                            min='.00001' 
                            step='.00001'
                            ref={(withdrawInput) => { this.withdrawInput = withdrawInput }}
                            disabled={this.props.isConnected}
                            required 
                        />
                        {this.props.votingPower != 0 && this.props.votingPower != null ? 
                        <a className='text-muted mt-2' onClick={() => this.withdrawInput.value = this.props.web3.utils.fromWei(this.props.votingPower, 'Ether')}>Max</a>
                        : null}
                        </div>
                        <div className='row justify-content-center'>
                            <button className='btn btn-primary mt-1' type='submit'>Withdraw</button>
                        </div>
                    </form>
                    </div>
                    {/* <div className='row float-right text-muted'>Avaliable Withdraw Amount: {this.props.web3.utils.fromWei(this.props.votingPower, 'Ether')} Ether </div> */}
                </div>
                <div className='card-footer'>
                    {this.props.depositedAmount != null ?
                    <label>Your Amount Deposited:<b> {this.props.web3.utils.fromWei(this.props.depositedAmount.toString(), 'Ether')} ETH</b>
                         <img className='my-2' src={ethlogo} width='25' height='25' alt='ethlogo'/>
                    </label>
                    : 'None Deposited!'}
                </div>
            </div>        
        </div>
    )
}


}

export default Pool;