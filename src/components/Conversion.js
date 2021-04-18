import React, { Component } from 'react';

class Conversion extends Component {
/* Component for the conversion rate */
render() {
    return (
        <div className='row justify-content-center'>
            <div className='col-auto' className='text-muted small mr-2'>
            Conversion Rate: 
            </div>
            <div className='col-auto float-left'>
                <div className='row justify-content-center'>
                    <p className='text-muted small'>.001 ETH = 1 Vote</p>
                    <p className='text-muted small ml-3'>.01 ETH = 10 Votes</p>
                </div>
                <div className='row justify-content-center'>
                    <p className='text-muted small'>.1 ETH = 100 Votes</p>
                    <p className='text-muted small ml-3'>1 ETH = 1000 Votes</p>
                </div>
            </div>
        </div>
    )
}


}

export default Conversion