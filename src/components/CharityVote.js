import React, { Component } from 'react';

class CharityVote extends Component {

    render() {
        return (
        <div>
            <p>Voting Power: {this.props.depositedAmount} Votes</p>
            <ol>
                <li className='row justify-content-center'>
                    <label>The Water Project</label>
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
                    <button className='btn btn-primary mt-1' type='submit'>Vote</button>
                </li>
                <li>
                    2nd charity
                </li>
            </ol>
        </div>
        );
    }
  }

  export default CharityVote;