import { Box, Modal, Flex, Button, Text, Card, Heading, EthAddress, Icon } from 'rimble-ui';
import React, { Component } from 'react';
import { Loader } from 'rimble-ui';

class AccountModal extends Component {

    constructor(props){
        super(props)
        this.state = {
            isOpen: false
        }
    }

  
    closeModal = e => {
      e.preventDefault()
      this.setState({isOpen: false})
    }
  
    openModal = e => {
      e.preventDefault()
      this.setState({isOpen: true})
    }

  render() {
    return (
      <Box className='App'>
        <Box>
          <Button size="small" onClick={this.openModal}>{this.props.account.substring(0,5) + '...' + this.props.account.slice(-4)}</Button>
  
          <Modal isOpen={this.state.isOpen}>
            <Card width={'520px'} p={0}>
              <Button.Text
                icononly
                icon={'Close'}
                color={'moon-gray'}
                position={'absolute'}
                top={0}
                right={0}
                mt={3}
                mr={3}
                onClick={this.closeModal}
              />
  
              <Box p={4} mb={3}>
                <Heading.h3>Connected Wallet</Heading.h3>
                <Text>Metamask Account</Text>
                <EthAddress address = {this.props.account}/>
                <a className='mt-4' href={`https://ropsten.etherscan.io/address/${this.props.account}`} target='_blank' rel='noopener noreferrer'>
                    View on Etherscan
                    <Icon
                        ml={1}
                        color="blue"
                        name="Launch"
                        size="14px" 
                    />
                </a>
              </Box>
              <Flex>
              <Box>
                {this.props.trxStatus !== 'Pending' ? 
                <>
                <Box>
                  <Text className='ml-4 my-3'>No Transactions Pending</Text>
                </Box>
                </>
                : <Box>
                    <div className='row'>
                      <Loader 
                        className='mt-3 ml-5 mr-1'
                        type='Oval'
                        color='#00BFFF'
                        height={50}
                        width={50}>
                      </Loader>
                      <Text className='my-3'>{this.props.action} : {this.props.amount}</Text>
                      <a className='ml-2 my-3' href={`https://ropsten.etherscan.io/tx/${this.props.hash}`} target='_blank' rel='noopener noreferrer'>
                          Etherscan.io
                      </a>
                    </div>
                  </Box>
                  
                }
              
              </Box>
              </Flex>
            </Card>
          </Modal>
        </Box>
      </Box>
    );
  }
}

export default AccountModal