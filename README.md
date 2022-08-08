# Composo

Thesis B code mateiral.

Setting up Supp_Chain:
There's a specific way to launch everything in /supp_chain:
1. fire up ganache on port 8545
2. "npm start" in /client
3. add ganache contract private key/s to metamask
4. connect metamask to port 8545 
5. run the "truffle develop" command in /truffle
6. run the "migrate" command in /truffle
7. run the "truffle migrate --network development" command to deploy contracts on 8545
8. connect the ganache account/s on metamask to 8545
9. (optional) add the truffle-config.js file to ganache for transaction data
10. click the add item button and it should fire up metamask, and stuff on the console


The current stub implementation has 3 things:
- 1 Item contract to kept track of the items details (name of item, price, stage in supply chain)
- 1 ItemManager contract to keep track of created Items

You can successfully create an item with a price from the frontend, which creates a an Item contract and adds it as a mapping in the ItemManager contract.

You can pay the contract the price specified when creating the item, and the console tells you if the item moves to next stage (or if you've have already paid for the item/ or you haven’t paid enough)
