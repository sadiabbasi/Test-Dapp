import React, { useState } from 'react';
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { Web3 } from 'web3';
import { ethers, InfuraProvider } from 'ethers';

const web3 = new Web3('http://localhost:8545');

const DemoComponent = () => {
  const [uri, setUri] = useState('');

  const handleCreateAccount = () => {
    const account = web3.eth.accounts.create();
    console.log("account", account)
    web3.eth.defaultAccount = account.address;
  }

  const handleConnect = async () => {

  // Replace with your actual private key
  const privateKey = '0xc7709ab54044f7a97d8b3d006c404644a15286c7cc13e7a597353a405610e690'.trim();

    const account = web3.eth.accounts.privateKeyToAccount('0xc7709ab54044f7a97d8b3d006c404644a15286c7cc13e7a597353a405610e690');
    console.log("account", account, JSON.stringify(account.addresss));
  
    const core = new Core({
      projectId: '2850896ad9cf6c1d958203b00b199c2d',
    });
  
    const web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "Demo app",
        description: "Demo Client as Wallet/Peer",
        url: "www.walletconnect.com",
        icons: [],
      },
      // Set a longer timeout value (in milliseconds) for the RPC request
      // Adjust this value based on your network conditions and requirements
      rpcTimeout: 30000, // 30 seconds
    });
  
    await web3wallet.pair({ uri });
  
    web3wallet.on('session_proposal', async proposal => {
      console.log("proposal", proposal)
      try {
        const approvedNamespaces = buildApprovedNamespaces({
          proposal: proposal.params,
          supportedNamespaces: {
            eip155: {
              chains: ['eip155:11155111'], //11155111
              methods: ['eth_sendTransaction', 'personal_sign'],
              events: ['accountsChanged', 'chainChanged'],
              accounts: [
                'eip155:11155111:0x253c8d99c27d47A4DcdB04B40115AB1dAc466280'
              ]
            }
          }
        })
        const session = await web3wallet.approveSession({
          id: proposal.id,
          namespaces: approvedNamespaces
        });
        console.log("session", session)
      } catch (error) {
        console.log("error",error);
          await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError("USER_REJECTED")
        })
      }
    });
    try{
      web3wallet.on('session_request', async event => {
        const { topic, params, id } = event;
        const { request } = params;
        let requestParamsMessage = request.params[0];
        console.log("requestParamsMessage", requestParamsMessage, request)
           // Prepare the transaction object
           const {data, from, to, value} = requestParamsMessage
          const transaction = {
            from,
            to,
            data,
            value
          };
          console.log("transaction", transaction)
          try {
            const provider = new InfuraProvider('sepolia');
            
            // Create a wallet instance with the custom provider
            const wallet = new ethers.Wallet(privateKey, provider);
            const signedTransaction = await wallet.sendTransaction(transaction);
            console.log("signedTransaction", signedTransaction)
            // Wait for the transaction to be mined
            await signedTransaction.wait();
            const response = { id, result: signedTransaction, jsonrpc: '2.0' };
            console.log("response", response)
            await web3wallet.respondSessionRequest({ topic, response });
          } catch (error) {
            console.error("Error sending transaction:", error);
            console.error("Error message:", error?.message);
            console.error("Error code:", error?.code);
            console.error("Error stack:", error?.stack);
          }
      });
    } catch(error) {
      console.log("error2", error)
    }
   
    
    // Example for personal_sign

    // web3wallet.on('session_request', async event => {
    //   console.log("event", event)

    //   const { topic, params, id } = event
    //   const { request } = params
    //   let requestParamsMessage = request.params[0].data;
    //   console.log("requestParamsMessage", requestParamsMessage, request.params[0])
    //   const transactionHash = requestParamsMessage.slice(2)
    //   console.log("transactionHash", transactionHash, transactionHash.length);
    //   const message = hexToUtf8(requestParamsMessage);
    //   console.log("message", message);

    //   // const wallet = new ethers.Wallet(privateKey);
    //   // console.log("wallet",wallet)
    //   // const signedMessage = await wallet.signMessage(message)
    //   // console.log("signedMessage", signedMessage)
    //   // const response = { id, result: signedMessage, jsonrpc: '2.0' }
    //   // console.log("response", response)
    //   // const resp = await web3wallet.respondSessionRequest({ topic, response });
    //   // console.log("resp", resp)
    // })

    const iss = `did:pkh:eip155:1:0x253c8d99c27d47A4DcdB04B40115AB1dAc466280`;
    web3wallet.on("auth_request", async (event) => {
      console.log("auth_request", event)
      const { id } = event.request;

      // format the payload
      const message = web3wallet.formatMessage(event.params.cacaoPayload, iss);
      // prompt the user to sign the message
      const signature = await web3wallet.signMessage(message);
      // respond
      await web3wallet.respondAuthRequest(
        {
          id: id,
          signature: {
            s: signature,
            t: "eip191",
          },
        },
        iss,
      );
    });
    
    await web3wallet.core.pairing.pair({ uri: uri, activatePairing: true });

  };
  

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleCreateAccount} style={{ margin: '1.5rem', width: '20%', height: '50px' }}>Create Account</button>

      <input
        type="text"
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        placeholder="Enter WalletConnect URI"
        style={{ width: '100%', height: '50px' }}
      />
      <button onClick={handleConnect} style={{ marginTop: '1.5rem', width: '20%', height: '50px' }}>Connect</button>
    </div>
  );
};

export default DemoComponent;
