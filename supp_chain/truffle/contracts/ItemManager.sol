pragma solidity ^0.6.0; 

import "./Item.sol"; 

contract ItemManager {
    struct S_Item {
        Item _item;
        ItemManager.SupplyChainSteps _step;
        string _identifier; 
    }


    mapping(uint => S_Item) public items; 
    uint index;
  
    // add more states and drivers
    enum SupplyChainSteps {Created, Paid, Delivered}
    event SupplyChainStep(uint _itemIndex, uint _step, address _address); 
    
    function createItem(string memory _identifier, uint _priceInWei) public {
      Item item = new Item(this, _priceInWei, index);
      items[index]._item = item;
      items[index]._step = SupplyChainSteps.Created; 
      items[index]._identifier = _identifier;
      emit SupplyChainStep(index, uint(items[index]._step), address(item)); 
      index++;
    }


    function triggerPayment(uint _index) public payable {
      Item item = items[_index]._item; 

      // can only be called from item contract
      require(address(item) == msg.sender, "Only items are allowed to update themselves");
      require(item.priceInWei() == msg.value, "Full amount not paid");
      require(items[index]._step == SupplyChainSteps.Created, "Item is further in the supply chain");
    
      items[_index]._step = SupplyChainSteps.Paid;
      emit SupplyChainStep(_index, uint(items[_index]._step), address(item)); }


    function triggerDelivery(uint _index) public {
      require(items[_index]._step == SupplyChainSteps.Paid, "Item is further in the supply chain");
      items[_index]._step = SupplyChainSteps.Delivered;
      emit SupplyChainStep(_index, uint(items[_index]._step), address(items[_index]._item)); 
    }

}