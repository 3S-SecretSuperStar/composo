# Composo

Thesis B code mateiral.

Setting up Supp_Chain:
The current stub implementation has 3 things:

- 1 itemManager contracts to keep track of created Items
- 1 Item contract to kept track of the items deets (name of item, price, stage in supply chain)

You can successfully create an item with a price from the frontend, which creates a an Item contract and adds it as a mapping in the ItemManager contract.

You can pay the contract the price specified when creating the item, and the console tells you if the item moves to next stage (or if you've have already paid for the item/ or you haven’t paid enough)
