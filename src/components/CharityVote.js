import React, { Component } from 'react';

class CharityVote extends Component {

    render() {
        return (
            <>
            <div className='row justify-content-center my-3'>
                <form>
                    <label className='mt-1'><b>{this.props.charity.name}</b></label>
                    <a className='ml-3 mt-1' href={`https://ropsten.etherscan.io/address/${this.props.charity.targetAddress}`} target='_blank'>Charity Address</a>
                    <div className='mt-1'>Total Votes: {this.props.charity.votes}</div>
                    <input 
                        type='number' 
                        className='form-control mx-2 col' 
                        placeholder='0' 
                        min='1' 
                        step='1'
                        ref={(voteInput) => { this.voteInput = voteInput }}
                        disabled={this.props.isConnected}
                        required 
                    />
                    {this.props.votingPower != 0 && this.props.votingPower != null ? 
                        <a className='mt-2' onClick={() => this.voteInput.value = this.props.web3.utils.fromWei(this.props.votingPower, 'milliether')}>Max</a>
                    : null}
                    <button id='addvotes' className='btn btn-primary btn-sm mx-1 mt-1' type='button' onClick={() => {
                        this.props.addVotes(this.props.charity.id, this.voteInput.value.toString())
                        this.voteInput.value = null
                    }}>
                        Add Votes
                    </button>
                    <button id='removevotes' className='btn btn-primary btn-sm mx-1 mt-1' type='button' onClick={() => {
                        this.props.removeVotes(this.props.charity.id, this.voteInput.value.toString())
                        this.voteInput.value = null
                    }}>Remove Votes</button>

                    <div className='mt-1'>Your Votes Delegated: {this.props.myVote}</div>

                </form>
            </div>
            </>
        );
    }
}
  

  export default CharityVote;