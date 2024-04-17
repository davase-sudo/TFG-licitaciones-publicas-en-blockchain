// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

import "./Tender.sol";
import "./UserManagament.sol";

contract TenderManagament {
    
    mapping(address => bool) public tenders;

    event NuevaLicitacion(address tender, address indexed licitador);
    UserManagament public userManagament;

    constructor() {

        userManagament = new UserManagament();

    }

    modifier usuarioManagamentInicializado() {
        require(address(userManagament) != address(0), "UserManagament no inicializado");
        _;
    }
    
    function registrarLicitacion(uint256 _deadline, uint _max) public usuarioManagamentInicializado {

        require(_deadline >= 60,"duracion de la licitacion inferior a la permitida");
        require(_deadline <= 157766400,"duracion de la licitacion superior a la permitida");
        require(userManagament.users[msg.sender]==true, "Usuario no autorizado");

        Tender tender = new Tender(_deadline,_max);
        tenders[address(tender)] = true;
        
        emit NuevaLicitacion(address(tender), msg.sender);
    }
    
}