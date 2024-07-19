// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract UserManagament {
    // Estructura para almacenar la información del usuario
    struct User {
        string name;
        bool isRegistered;
        bool isAdmin;
    }

    // Dirección del dueño del contrato (super admin)
    address public owner;

    // Mapping para almacenar los usuarios por su dirección
    mapping(address => User) public users;
    // Array para almacenar las direcciones de los usuarios registrados
    address[] public userAddresses;

    // Modificador para funciones restringidas a administradores
    modifier onlyAdmin() {
        require(users[msg.sender].isAdmin, "Only admin can perform this action");
        _;
    }

    // Modificador para funciones restringidas al dueño del contrato
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Constructor para inicializar el dueño del contrato
    constructor(address _owner) {
        owner = _owner;
        users[owner] = User({
            name: "Owner",
            isRegistered: true,
            isAdmin: true
        });
        userAddresses.push(owner);
    }

    // Función para registrar un nuevo usuario
    function registerUser(address userAddress, string memory _name) public {
        require(!users[userAddress].isRegistered, "User already registered");

        // Registrar al usuario
        users[userAddress] = User({
            name: _name,
            isRegistered: true,
            isAdmin: false
        });

        // Añadir la dirección del usuario al array de direcciones
        userAddresses.push(userAddress);
    }

    // Función para verificar si un usuario está registrado
    function isUserRegistered(address _user) public view returns (bool) {
        return users[_user].isRegistered;
    }

    // Función para obtener información del usuario
    function getUser(address _user) public view returns (string memory name, bool is_admin) {
        require(users[_user].isRegistered, "User not registered");

        User memory user = users[_user];
        return (user.name, user.isAdmin);
    }

    // Función para obtener todas las direcciones de usuarios registrados
    function getAllUsers() public view returns (address[] memory) {
        return userAddresses;
    }

    // Función para verificar si un usuario es administrador
    function isAdmin(address _user) public view returns (bool) {
        return users[_user].isAdmin;
    }

    // Función para asignar el rol de administrador a un usuario (solo el dueño puede hacerlo)
    function makeAdmin(address _user) public onlyOwner {
        require(users[_user].isRegistered, "User not registered");
        users[_user].isAdmin = true;
    }

    // Función para revocar el rol de administrador a un usuario (solo el dueño puede hacerlo)
    function revokeAdmin(address _user) public onlyOwner {
        require(users[_user].isRegistered, "User not registered");
        users[_user].isAdmin = false;
    }
}

