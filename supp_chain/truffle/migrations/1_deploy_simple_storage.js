const composable = artifacts.require("ERC998ERC1155TopDownPresetMinterPauser");

module.exports = function (deployer) {
  deployer.deploy(composable, "erc998", "ERC998", "https://ERC998.com/{id}");
};
