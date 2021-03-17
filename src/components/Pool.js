import React, { Component } from 'react';

class Pool extends Component {

render() {
    return(
        <div className='col-sm-6' key={this.props.pool.poolID}>
            <div className='card mt-4 mx-3'>
                <div className='card-body'>
                    <h5 className='card-title'>Pool #: {this.props.pool.poolID} </h5>
                    <h5 className='card-title'>{this.props.pool.name} </h5>
                    <div className='float-left'>
                        <p className='card-text'>Pool Admin: {this.props.pool.admin}  </p>
                        <p className='card-text'>Total Amount Deposited: {this.props.pool.amountDeposited}</p>
                        <p className='card-text'>Prize Interest Amount: </p>
                        <p className='card-text'>Next Prize Release Date: </p>
                        <div className='row justify-content-center'>

                        <form onSubmit={(e) => {
                            let depositAmount
                            e.preventDefault()
                            console.log('Deposit Input:', this.depositInput.value)
                            depositAmount = this.depositInput.value.toString()
                            console.log('Deposit amount:', depositAmount)
                            this.depositInput.value = null
                            this.props.poolDeposit(this.props.pool.poolID, depositAmount)
                        }}>
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
                            <div className='row justify-content-center'>
                            <button className='btn btn-primary' type='submit'>Deposit</button>
                            </div>
                        </form>

                        <form onSubmit={(e) => {
                            let withdrawAmount
                            e.preventDefault()
                            withdrawAmount = this.withdrawInput.value.toString()
                            console.log('Withdraw amount:', withdrawAmount)
                            this.withdrawInput.value = null
                            //this.props.poolWithdraw(this.props.pool.poolID, withdrawAmount)
                        }}>
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
                            <div className='row justify-content-center'>
                            <button className='btn btn-primary' type='submit'>Withdraw</button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
                <div className='card-footer'>
                    {this.props.depositedAmounts[this.props.pool.poolID] != undefined ?
                    <label>Your Amount Deposited: {this.props.depositedAmounts[this.props.pool.poolID][1]} </label>
                    : 'None Deposited!'}
                </div>
            </div>        
        </div>
    )
}


}

export default Pool;