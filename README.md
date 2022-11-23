# Composo

Thesis code mateiral.

Setting up the blockchain environment:
The specific way to setup and launch everything in /supp_chain is as follows:
1. fire up ganache on port 8545
2. "npm start" in /client
3. add ganache contract private key/s to metamask
4. connect metamask to port 8545 (if not enabled by default) 
5. run the "truffle develop" command in /truffle
6. run the "truffle migrate --network development" command to deploy contracts on 8545
7. connect the ganache account/s on metamask to 8545
8. (optional) add the truffle-config.js file to ganache for transaction data
9. play around and mint tokens!
