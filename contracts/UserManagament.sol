// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

contract UserManagament {

    // Mapeo que asocia direcciones de cuentas con un booleano que indica si pueden o no crear licitaciones
    mapping(address => bool) private users;

    event NuevoUsuario(address indexed usuario);

    constructor() {
        users[msg.sender] = true;
    }

    function registrarNuevoUsuario() public {
        require(!users[msg.sender], "Ya estas registrado como usuario");
        users[msg.sender] = false;
        emit NuevoUsuario(msg.sender);
    }

    // Función para permitir que una cuenta pueda crear licitaciones
    function allowCreatingLicitacion(address account) private {
        users[account] = true;
    }

    // Función para revocar el permiso de una cuenta para crear licitaciones
    function disallowCreatingLicitacion(address account) private {
        users[account] = false;
    }
    // Función auxiliar para convertir wei a Ether
    function convertToEther(uint256 amountInWei) internal pure returns (uint256) {
        return amountInWei / 1 ether;
    }

    // Función para obtener el saldo en Ether de una cuenta
    function getBalanceInEther(address account) public view returns (uint256) {
        // Obtiene el saldo en wei de la cuenta
        uint256 balanceInWei = account.balance;
        // Convierte el saldo de wei a Ether
        return convertToEther(balanceInWei);
    }


}
