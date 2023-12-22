const { DirectSecp256k1HdWallet, coins } = require('@cosmjs/proto-signing');
const { SigningStargateClient } = require('@cosmjs/stargate');

// Replace these values with your actual data
const rpcEndpoint = 'RPC_ENDPOINT'; // Replace with the Mocha testnet RPC endpoint
const mnemonic = 'MNEMONIC'; // Replace with your mnemonic
const recipientAddress = 'RECIPIENT_ADDRESS'; // Replace with the recipient's address
const amountToSend = '1'; // Amount of TIA to send (in smallest unit)
const memo = 'MEMO'; // Replace with your desired memo
const numberOfTransactions = 1; // Number of transactions to send

async function sendTransactions() {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'celestia' });
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

    const [firstAccount] = await wallet.getAccounts();

    for (let i = 0; i < numberOfTransactions; i++) {
        const { accountNumber, sequence } = await client.getAccount(firstAccount.address);

        const currentSequence = sequence + i;

        try {
            const result = await client.sendTokens(
                firstAccount.address,
                recipientAddress,
                coins(amountToSend, 'utia'),
                {
                    amount: coins('8000', 'utia'), // Fee as per network requirement
                    gas: '130000', // Gas limit (adjust as needed)
                    sequence: currentSequence, // Use the updated sequence number
                },
                `${memo}` // Including the memo here with an index
            );

            console.log(`Transaction ${i + 1} successful with ID: ${result.transactionHash}`);
        } 
        catch (error) {
            console.error(`Transaction ${i + 1} failed: ${error.message}`);
            // break; // Stop the loop if any transaction fails
        }
    }
}

sendTransactions().catch(console.error);