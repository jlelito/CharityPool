import React, { Component } from 'react';
import { Loader } from 'rimble-ui';
import  ReactTextCollapse  from 'react-text-collapse';

class CharityVote extends Component {

    constructor(props){
        super(props)
        this.state = {
            description: 'No Description Found!',
            image: null,
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
                    this.setState({image: element.image})
                }
                this.setState({description: element.description})
            }
        })
    }

    render() {
        const TEXT_COLLAPSE_OPTIONS = {
            collapse: false, // default state when component rendered
            collapseText: '...show more', // text to show when collapsed
            expandText: 'show less', // text to show when expanded
            minHeight: 166, // component height when closed
            maxHeight: 166, // expanded to
            textStyle: { // pass the css for the collapseText and expandText here
              color: "blue",
              fontSize: "15px"
            }
          }

        return (
            <>
                <div className='row ml-5 mt-4'>
                    <form className='card' style={{height: "230px", width: "350px"}}>
                        <div className='card-header'>
                            <label className='mt-1'><b>{this.props.charity.name}</b></label>
                            <a className='ml-3 mt-1' href={`https://ropsten.etherscan.io/address/${this.props.charity.targetAddress}`} target='_blank'>Charity Address</a>
                        </div>
                        <div className='card-body'> 
                            <div className='row justify-content-center mt-1 text-success'>Total Votes: {this.props.web3.utils.fromWei(this.props.charity.votes.toString(), 'milliether')}
                            {this.props.trxStatus === 'Pending' && 
                            this.props.charityTarget === this.props.charity.id &&
                            (this.props.action === 'Added Votes to Charity' 
                            || this.props.action === 'Removed Votes from Charity')  ? 
                                <Loader 
                                    className='mt-1 ml-1'
                                    type='Oval'
                                    color='#00BFFF'
                                    height={25}
                                    width={25}>
                                </Loader> 
                            : null}
                            </div>
                            <input 
                                type='number' 
                                className='form-control mx-2 col' 
                                placeholder='0' 
                                min='1' 
                                step='1'
                                ref={(voteInput) => { this.voteInput = voteInput }}
                                disabled={!this.props.isConnected || this.props.votingPower === 0}
                                required 
                            />
                            {this.props.votingPower != 0 && this.props.votingPower != null ? 
                                <a className='mt-2' onClick={() => this.voteInput.value = this.props.web3.utils.fromWei(this.props.votingPower, 'milliether')}>Max</a>
                            : null}
                            <button id={'addvotes' + this.props.charity.id} className='btn btn-primary btn-sm mx-1 mt-1' type='button' disabled={this.props.votingPower <= 0 || !this.props.isConnected} onClick={() => {
                                this.props.addVotes(this.props.charity.id, this.voteInput.value.toString())
                                this.voteInput.value = null
                            }}>
                                Add Votes
                            </button>

                            <button id={'removevotes' + this.props.charity.id} className='btn btn-primary btn-sm mx-1 mt-1' type='button' disabled={this.props.myVote <= 0 || !this.props.isConnected} onClick={() => {
                                this.props.removeVotes(this.props.charity.id, this.voteInput.value.toString())
                                this.voteInput.value = null
                            }}>Remove Votes</button>
                            
                            {this.props.myVote != 0 && this.props.myVote != null ?
                                <a className='mt-2' onClick={() => this.voteInput.value = this.props.web3.utils.fromWei(this.props.myVote.toString(), 'milliether')}>Max</a>
                            : null}
                            {this.props.web3 !== 'undefined' && this.props.web3 !== null  && this.props.myVote !== undefined ?
                            <>
                            <div className='row justify-content-center mt-1'>Your Votes Delegated: {this.props.web3.utils.fromWei(this.props.myVote.toString(), 'milliether')}
                            {this.props.trxStatus === 'Pending' && 
                            this.props.charityTarget === this.props.charity.id &&
                            (this.props.action === 'Added Votes to Charity' 
                            || this.props.action === 'Removed Votes from Charity')  ? 
                                <Loader 
                                    className='mt-1 ml-1'
                                    type='Oval'
                                    color='#00BFFF'
                                    height={25}
                                    width={25}>
                                </Loader> 
                            : null}
                            </div>
                            </>
                            : null}
                        </div>
                    </form>
                    <div className='card' style={{height: "230px", width: "350px"}}>
                        <div className='card-body'>
                        <>
                        {this.state.description.length > 280 ? 
                            <ReactTextCollapse options={TEXT_COLLAPSE_OPTIONS}>
                                <p className='text-wrap'>{this.state.description}</p> 
                            </ReactTextCollapse>
                            : <p className='text-wrap'>{this.state.description}</p> 
                        }
                        </>
                        </div>         
                    </div>
                    {this.state.imageFound ? 
                        <img src={'./images/habitat.jpg'} alt={`../src_images/${this.state.image}.jpg`} width='250px' height='250px'/>
                        :
                        <div className='row ml-3 mt-5'>No Image Found!</div>
                    }
                </div>
                
            </>
        );
    }
}
  

  export default CharityVote;