// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

import "./Payments.sol";

contract Tender{

    struct Proposal {   
        string name;
        uint256 quantity;
        string descripcion;
    }

    struct Participant {
        address direccion;
        Proposal[] proposals;
    }

    Participant[] public participants;
    mapping(address => uint256) public indexParticipant;
    address public licitador;
    uint public deadline;
    uint256 private MAX_PROPOSALS;

    event GanadorLicitacion(address indexed ganador, string name);

    constructor(uint _deadline, uint _max) {
        licitador = msg.sender;
        deadline = block.timestamp + _deadline;
        MAX_PROPOSALS = _max;
    }

    function addParticipant(address _direccion, Proposal[] memory _proposals) public {
        require(_proposals.length <= MAX_PROPOSALS, "Numero de propuestas superado");
        require(indexParticipant[_direccion] == 0, "La direccion del participante ya esta registrada");
        participants.push(Participant(_direccion, _proposals));
        indexParticipant[_direccion] = participants.length;
    }

    function addProposal(address _direccion, uint256 _quantity, string memory _descripcion, string memory _name) public {
        require(msg.sender==_direccion, "Solo puede agregar un contrato el duenyo del mismo");
        uint256 indice = indexParticipant[_direccion];
        require(indice > 0, "La direccion del participante no esta registrada");
        require(participants[indice - 1].proposals.length < MAX_PROPOSALS, "Se alcanzo el maximo de propuestas por participante");

        Proposal memory newProposal = Proposal(_name , _quantity, _descripcion);
        participants[indice - 1].proposals.push(newProposal);
    }

    function seleccionarGanador(address _winner, Proposal memory _proposal) public {
        require(msg.sender == licitador, "Solo el propietario puede seleccionar un ganador");
        require(block.timestamp >= deadline, "La licitacion aun no ha finalizado");

        emit GanadorLicitacion(_winner, _proposal.name);
    }

}