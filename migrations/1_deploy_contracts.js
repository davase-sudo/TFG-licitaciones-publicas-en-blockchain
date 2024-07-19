const TenderManagament = artifacts.require("TenderManagament");

module.exports = function(deployer) {
  deployer.deploy(TenderManagament);
};
