const UserManagament = artifacts.require("UserManagament");

module.exports = function(deployer) {
  deployer.deploy(UserManagament);
};
