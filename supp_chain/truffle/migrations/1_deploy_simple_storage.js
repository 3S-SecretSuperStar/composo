const ItemManager = artifacts.require("ItemManager");

module.exports = function (deployer) {
  deployer.deploy(ItemManager);
};
