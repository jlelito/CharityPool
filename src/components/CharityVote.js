import React, { Component } from 'react';

class CharityVote extends Component {

    constructor(props){
        super(props)
        this.state = {
            description: 'No Description Found!',
            imageFound: false
        }
    }

    componentDidMount() {
        this.findCharityData(this.props.charity.name)
    }

    findCharityData(name) {
        this.props.charityDataState.forEach(element => {
            if(element.name === this.props.charity.name){
                if(element.image !== null){
                    this.setState({imageFound : true})
                }
                this.setState({description: element.description})
            }
        })
    }

    render() {
        return (
            <>
                <div className='row justify-content-center my-3'>
                    <form className='card'>
                        <div className='card-body'>
                            <label className='mt-1'><b>{this.props.charity.name}</b></label>
                            <a className='ml-3 mt-1' href={`https://ropsten.etherscan.io/address/${this.props.charity.targetAddress}`} target='_blank'>Charity Address</a>
                            <div className='mt-1 text-success'>Total Votes: {this.props.charity.votes}</div>
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
                            <button id='addvotes' className='btn btn-primary btn-sm mx-1 mt-1' type='button' disabled={this.props.votingPower <= 0 || !this.props.isConnected} onClick={() => {
                                this.props.addVotes(this.props.charity.id, this.voteInput.value.toString())
                                this.voteInput.value = null
                            }}>
                                Add Votes
                            </button>
                            <button id='removevotes' className='btn btn-primary btn-sm mx-1 mt-1' type='button' disabled={this.props.myVote <= 0 || !this.props.isConnected} onClick={() => {
                                this.props.removeVotes(this.props.charity.id, this.voteInput.value.toString())
                                this.voteInput.value = null
                            }}>Remove Votes</button>
                            <a className='mt-2' onClick={() => this.voteInput.value = this.props.myVote}>Max</a>

                            <div className='mt-1'>Your Votes Delegated: {this.props.myVote}</div>
                        </div>
                    </form>
                    <div className='card w-25'>
                        <div className='card-body'>
                            <p className='text-wrap'>{this.state.description}</p>   
                        </div>         
                    </div>
                    {this.state.imageFound ? 'Image Found!'
                    // <img src={require(`../src_images/${this.props.charityDataState.image}.jpg`)} alt='charity-image'/>
                    : 'No Image Found!'}
                </div>
            </>
        );
    }
}
  

  export default CharityVote;