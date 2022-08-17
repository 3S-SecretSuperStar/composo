const composable = artifacts.require("ERC998ERC1155TopDownPresetMinterPauser");
const erc998 = artifacts.require("ERC998ERC1155TopDown");
const erc1155 = artifacts.require("ERC1155PresetMinterPauser");

module.exports = function (deployer) {
  deployer.deploy(composable, "erc998", "ERC998", "https://ERC998.com/{id}");
  deployer.deploy(erc998, "erc998", "ERC998", "https://ERC998.com/{id}");
  deployer.deploy(erc1155, "https://ERC1155.com/{id}");
};
