# Composo

Thesis B & C code mateiral.

Setting up Supp_Chain:
There's a specific way to launch everything in /supp_chain:
1. fire up ganache on port 8545
2. "npm start" in /client
3. add ganache contract private key/s to metamask
4. connect metamask to port 8545 
5. run the "truffle develop" command in /truffle
6. run the "truffle migrate --network development" command to deploy contracts on 8545
7. connect the ganache account/s on metamask to 8545
8. (optional) add the truffle-config.js file to ganache for transaction data
9. click the add item button and it should fire up metamask, and stuff on the console
