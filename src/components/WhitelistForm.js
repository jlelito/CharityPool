import React, { Component } from 'react';

class WhitelistForm extends Component {

    render() {
        return (
            <>
            <form onSubmit={(e) => {
              let targetAddress
              e.preventDefault()
              targetAddress = this.targetAddress.value.toString()
              this.targetAddress.value = null
              this.props.poolWhitelist(targetAddress)
            }}>
              <div className='row justify-content-center'>
              <input 
                  type='text' 
                  className='form-control mx-2 col-3' 
                  placeholder='0x000...' 
                  ref={(targetAddress) => { this.targetAddress = targetAddress }}
                  disabled={this.props.isConnected}
                  required 
              />
              </div>
              <div className='row justify-content-center'>
                  <button className='btn btn-primary mt-1' type='submit'>Whitelist</button>
                  <button className='btn btn-primary mt-1 mx-2' onClick={() => this.props.poolUnwhitelist(this.targetAddress.value.toString())}>Unwhitelist</button>
              </div>
            </form>
          </>
        );
    }
  }

  export default WhitelistForm;