// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Tender.sol";
import "./UserManagament.sol";
import "./Payments.sol";

contract TenderManagament {
    address[] public tenderList;

    event NuevaLicitacion(address indexed tender, address indexed licitador);
    event Debug(string message, uint256 value);
    event ErrorHandled(string reason);

    UserManagament public userManagament;
    Payments public payments;

    constructor() {
        userManagament = UserManagament(address(new UserManagament(msg.sender)));
        payments = Payments(address(new Payments()));
    }

    modifier authorized() {
        require(userManagament.isAdmin(msg.sender), "Usuario no autorizado");
        _;
    }
    
    function registrarLicitacion(uint256 _deadline, uint256 _revealTime, uint256 _evaluationTime) public authorized {
        //require(_deadline >= 259200, "Duracion de la licitacion inferior a la permitida");
        //require(_deadline <= 3024000, "Duracion de la licitacion superior a la permitida");

        try new Tender(_deadline, _revealTime, _evaluationTime, address(payments), msg.sender) returns (Tender tender) {
            tenderList.push(address(tender));
            emit NuevaLicitacion(address(tender), msg.sender);
            emit Debug("registrarLicitacion finished", block.timestamp);
        } catch Error(string memory reason) {
            emit ErrorHandled(reason);
        } catch (bytes memory /* lowLevelData */) {
            emit ErrorHandled("Low-level error occurred");
        }
    }

    function getTenders() public view returns (address[] memory) {
        return tenderList;
    }
}
