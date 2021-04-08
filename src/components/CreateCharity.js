import React, { Component } from 'react';

class WhitelistForm extends Component {

    render() {
        return (
            <>
            <form onSubmit={(e) => {
              let charityName, targetAddress
              e.preventDefault()
              charityName = this.charityName.value.toString()
              targetAddress = this.targetAddress.value.toString()
              this.charityName.value = null
              this.targetAddress.value = null
              this.props.poolCreateCharity(charityName, targetAddress)
            }}>
              <div className='row justify-content-center'>
              <input 
                  type='text' 
                  className='form-control mx-2 col-4' 
                  placeholder='Charity Name' 
                  ref={(charityName) => { this.charityName = charityName }}
                  disabled={this.props.isConnected}
                  required 
              />
              <input 
                  type='text' 
                  className='form-control mx-2 col-4' 
                  placeholder='Charity Address' 
                  ref={(targetAddress) => { this.targetAddress = targetAddress }}
                  disabled={this.props.isConnected}
                  required 
              />
              </div>
              <div className='row justify-content-center'>
                  <button className='btn btn-primary mt-3' type='submit'>Create</button>
              </div>
            </form>
          </>
        );
    }
  }

  export default WhitelistForm;