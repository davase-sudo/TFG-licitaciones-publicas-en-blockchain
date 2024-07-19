// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Payments.sol";

contract Tender {

    struct Proposal {
        string name;
        uint256 quantity;
        string description;
        bytes32 hashDocument;
        string realDocument;
        bool documentRevealed;
    }

    struct Participant {
        address direccion;
        Proposal proposal;
        bool hasProposal;
    }

    Participant[] public participants;
    mapping(address => uint256) public indexParticipant;
    address public licitador;
    uint256 public deadline;
    uint256 public revealDeadline;
    uint256 public evaluationDeadline;
    bool public active;
    address public winner;
    address private paymentsContract;

    event GanadorLicitacion(address indexed ganador, string name);
    event DocumentRevealed(address indexed participant, string name, string realDocument);
    event NuevaLicitacion(address indexed tender, address indexed licitador, uint256 deadline, uint256 revealDeadline, uint256 evaluationDeadline);
    event LicitacionCancelada(address indexed licitador);
    event PropuestaActualizada(address indexed participant, string name);

    constructor(uint256 _deadline, uint256 _revealTime, uint256 _evaluationTime, address _paymentsContract, address _licitador) {
        licitador = _licitador;
        deadline = block.timestamp + _deadline;
        revealDeadline = deadline + _revealTime;
        evaluationDeadline = revealDeadline + _evaluationTime;
        active = true;
        paymentsContract = _paymentsContract;
        emit NuevaLicitacion(address(this), licitador, deadline, revealDeadline, evaluationDeadline);
    }

    modifier onlyLicitador() {
        require(msg.sender == licitador, "Solo el licitador puede ejecutar esta accion");
        _;
    }

    modifier activeTender() {
        require(active == true, "Licitacion cancelada o finalizada");
        _;
    }

    modifier withinDeadline() {
        require(block.timestamp <= deadline, "Tiempo de presentacion finalizado");
        _;
    }

    modifier withinRevealPeriod() {
        require(block.timestamp > deadline && block.timestamp <= revealDeadline, "Fuera del periodo de revelacion de documentos");
        _;
    }

    modifier withinEvaluationPeriod() {
        require(block.timestamp > revealDeadline && block.timestamp <= evaluationDeadline, "Fuera del periodo de evaluacion");
        _;
    }

    function updateStatus() internal {
        if (block.timestamp > evaluationDeadline && active) {
            active = false;
            emit LicitacionCancelada(licitador);
        }
    }

    function addParticipant(address _direccion) public activeTender withinDeadline {
        updateStatus();
        require(active, "Licitacion cancelada o finalizada");
        require(indexParticipant[_direccion] == 0, "La direccion del participante ya esta registrada");
        indexParticipant[_direccion] = participants.length + 1;
        Participant storage participant = participants.push();
        participant.direccion = _direccion;
    }

    function addOrUpdateProposal(address _direccion, uint256 _quantity, string memory _description, string memory _name, string memory _document) public activeTender withinDeadline {
        updateStatus();
        require(active, "Licitacion cancelada o finalizada");
        require(msg.sender == _direccion, "Solo puede agregar o actualizar una propuesta el dueno de la misma");
        uint256 indice = indexParticipant[_direccion];
        require(indice > 0, "La direccion del participante no esta registrada");

        bytes32 hashDocument = sha256(abi.encodePacked(_document));

        Participant storage participant = participants[indice - 1];
        participant.proposal = Proposal(_name, _quantity, _description, hashDocument, "", false);
        participant.hasProposal = true;
        emit PropuestaActualizada(_direccion, _name);
    }

    function revealDocument(address _direccion, string memory _name, string memory _realDocument) public activeTender withinRevealPeriod {
        updateStatus();
        require(active, "Licitacion cancelada o finalizada");
        require(msg.sender == _direccion, "Solo puede revelar el documento el dueno de la propuesta");
        uint256 indice = indexParticipant[_direccion];
        require(indice > 0, "La direccion del participante no esta registrada");

        Participant storage participant = participants[indice - 1];
        Proposal storage proposal = participant.proposal;
        require(sha256(abi.encodePacked(proposal.name)) == sha256(abi.encodePacked(_name)), "El nombre de la propuesta no coincide");
        require(!proposal.documentRevealed, "El documento ya ha sido revelado");

        bytes32 storedDocumentHash = proposal.hashDocument;
        bytes32 realDocumentHash = sha256(abi.encodePacked(_realDocument));
        require(realDocumentHash == storedDocumentHash, "El documento no coincide con el hash");

        proposal.realDocument = _realDocument;
        proposal.documentRevealed = true;
        emit DocumentRevealed(_direccion, _name, _realDocument);
    }

    function seleccionarGanador(address _winner) public activeTender withinEvaluationPeriod onlyLicitador {
        updateStatus();
        require(active, "Licitacion cancelada o finalizada");
        require(block.timestamp >= revealDeadline, "La revelacion de documentos aun no ha finalizado");
        uint256 indice = indexParticipant[_winner];
        require(indice > 0, "La direccion del participante no esta registrada");

        Participant storage participant = participants[indice - 1];
        Proposal memory proposal = participant.proposal;
        winner = _winner;
        active = false;

        emit GanadorLicitacion(_winner, proposal.name);
    }

    function getParticipants() public view returns (address[] memory) {
        address[] memory participantAddresses = new address[](participants.length);
        for (uint i = 0; i < participants.length; i++) {
            participantAddresses[i] = participants[i].direccion;
        }
        return participantAddresses;
    }

    function getProposalByParticipant(address _direccion) public view returns (Proposal memory) {
        uint256 indice = indexParticipant[_direccion];
        require(indice > 0, "La direccion del participante no esta registrada");
        return participants[indice - 1].proposal;
    }

    function cancelarLicitacion() public onlyLicitador activeTender {
        active = false;
        emit LicitacionCancelada(msg.sender);
    }

    function checkAndUpdateStatus() public {
        updateStatus();
    }
}
