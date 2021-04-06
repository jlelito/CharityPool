import React, { Component } from 'react';

class WhitelistForm extends Component {

    render() {
        return (
            <>
              <form>
                <div className='row justify-content-center'>
                <input 
                    type='text' 
                    className='form-control mx-2 col-4' 
                    placeholder='0x000...' 
                    ref={(targetAddress) => { this.targetAddress = targetAddress }}
                    disabled={this.props.isConnected}
                    required 
                />
                </div>
                <div className='row justify-content-center'>
                    <button className='btn btn-primary mt-1' type='button' onClick={() => {
                        this.props.poolWhitelist(this.targetAddress.value.toString())
                        this.targetAddress.value = null
                    }}>Whitelist</button>
                    <button className='btn btn-primary mt-1 mx-2' type='button' onClick={() => {
                        this.props.poolUnwhitelist(this.targetAddress.value.toString())
                        this.targetAddress.value = null
                    }}>Unwhitelist</button>
                      
                </div>
              </form>
            </>
        );
    }
  }

  export default WhitelistForm;