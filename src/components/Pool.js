import React, { Component } from 'react';
import ethlogo from '../src_images/ETH.png';

class Pool extends Component {

render() {
    return(
        <div className='col-sm-6' key={this.props.pool.poolID}>
            <div className='card mt-4 mx-3'>
                <div className='card-body'>
                    <p className='card-text'>Pool Admin: {this.props.pool.admin}  </p>
                    <p className='card-text'>Total Amount Deposited: {this.props.web3.utils.fromWei(this.props.pool.amountDeposited, 'Ether')} ETH
                        <img className='my-2' src={ethlogo} width='25' height='25' alt='ethlogo'/>
                    </p>
                    <p className='card-text'>Interest Amount: </p>
                    <p className='card-text'>Next Interest Release Date: </p>
                    <div className='row justify-content-center'>

                    <form onSubmit={(e) => {
                        let depositAmount
                        e.preventDefault()
                        depositAmount = this.depositInput.value.toString()
                        this.depositInput.value = null
                        this.props.poolDeposit(this.props.pool.poolID, depositAmount)
                    }}>
                        <div className='row justify-content-center'>
                            <input 
                                type='number' 
                                className='form-control mx-2 col-6' 
                                placeholder='0 ETH' 
                                min='.01' 
                                step='.01'
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
                        this.props.poolWithdraw(this.props.pool.poolID, withdrawAmount)
                    }}>
                        <div className='row justify-content-center'>
                        <input 
                            type='number' 
                            className='form-control mx-2 col-6' 
                            placeholder='0 ETH' 
                            min='.01' 
                            step='.01'
                            ref={(withdrawInput) => { this.withdrawInput = withdrawInput }}
                            disabled={this.props.isConnected}
                            required 
                        />
                        <a className='text-muted mt-2' onClick={() => this.withdrawInput.value = this.props.web3.utils.fromWei(this.props.depositedAmount[1], 'Ether')}>Max</a>
                        </div>
                        <div className='row justify-content-center'>
                            <button className='btn btn-primary mt-1' type='submit'>Withdraw</button>
                        </div>
                    </form>
                    </div>
                </div>
                <div className='card-footer'>
                    {this.props.depositedAmount != undefined ?
                    <label>Your Amount Deposited: {this.props.web3.utils.fromWei(this.props.depositedAmount[1], 'Ether')} ETH
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