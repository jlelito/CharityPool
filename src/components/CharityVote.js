import React, { Component } from 'react';

class CharityVote extends Component {

    render() {
        return (
        <div>
            <p><b>Voting Power: {this.props.votingPower} Votes</b></p>
            <ol>
                {this.props.charities.map(charity => (
                <li className='row justify-content-center my-3' key={charity.id}>
                
                    <label className='mt-1'>{charity.name}</label>
                    <input 
                        type='number' 
                        className='form-control mx-2 col-3' 
                        placeholder='0' 
                        min='1' 
                        step='1'
                        ref={(voteInput) => { this.voteInput = voteInput }}
                        disabled={this.props.isConnected}
                        required 
                    />
                    <button className='btn btn-primary btn-sm mx-1' onClick={() => this.props.addVotes(charity.id, this.voteInput.value.toString())}>Add Votes</button>
                    <button className='btn btn-primary btn-sm mx-1' onClick={() => this.props.removeVotes(charity.id, this.voteInput.value.toString())}>Remove Votes</button>
                    <div className='mt-1'>Votes: {charity.votes}</div>
                    <a className='ml-3 mt-1' href={`https://ropsten.etherscan.io/address/${charity.targetAddress}`} target='_blank'>Charity Address</a>
                    
                </li>
            ))}
            </ol>
        </div>
        );
    }
  }

  export default CharityVote;