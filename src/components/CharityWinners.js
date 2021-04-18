import React, { Component } from 'react';
import ethlogo from './../src_images/ETH.png';
import donation from './../src_images/donation.png';

class CharityWinners extends Component {
/* Component for the charity vote winners */
render() {
    return (
        <>
        {this.props.web3 !== null && this.props.web3 !== undefined ? 
        <div className='col-sm-4 float-right justify-content-center'>
            <div className='card mx-5 mt-4'>
                <div className='card-text'>
                    <h5 className='card-header justify-content-center'>Most Recent Donations <img src={donation} width='35' height='35' alt='donationimage'/></h5>
                    <ol className='list-group list-group-flush'>
                        {this.props.pastWinners.length === 0 ? 'None Found!' :
                            <>
                                {this.props.pastWinners.map(winner => (
                                    <li className='list-group-item' key={winner.id}>
                                    <p><b>Date (EST): </b>{(new Date(parseInt(winner.returnValues.timestamp) * 1000)).toLocaleString()}</p>
                                    <p><b>Charity: </b> {winner.returnValues.name}</p>
                                    <p className='row'><b className='mr-1'>Donation Amount: </b> {this.props.web3.utils.fromWei(winner.returnValues.prize, 'Ether')} ETH <img src={ethlogo} width='25' height='25' alt='ethlogo'/> </p>
                                    <p className='text-muted'>Donation $ Amount:  
                                        {(this.props.web3.utils.fromWei(winner.returnValues.prize, 'Ether') / this.props.ethPrice) > 1 ?
                                        ' $' + this.props.web3.utils.fromWei(winner.returnValues.prize, 'Ether') / this.props.ethPrice : 
                                        ' Less Than $1'
                                        }
                                    </p>
                                    <p><b># of Votes: </b> {this.props.web3.utils.fromWei(winner.returnValues.votes, 'milliether')}</p>
                                    </li>  
                                ))}
                            </>
                        }
                    </ol>
                </div>
            </div>
        </div>
        : null}
        </>
        )
    }


}

export default CharityWinners