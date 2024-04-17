// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

contract Payments {
    function transfer(address payable _destinatario, uint _monto) public {
        require(msg.sender.balance >= _monto, "Fondos insuficientes");
        _destinatario.transfer(_monto);
    }
}