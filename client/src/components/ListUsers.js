import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Container, Row, Col, Accordion, ListGroup, Button } from 'react-bootstrap';
import configurationUser from '../contracts/UserManagament.json';

const ListUsers = ({ contractManagament }) => {
  const [users, setUsers] = useState([]);
  const [usersInfo, setUsersInfo] = useState([]);
  const web3 = new Web3(window.ethereum);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (contractManagament) {
          const userManagementAddress = await contractManagament.methods.userManagament().call();
          if (userManagementAddress) {
            const userContract = new web3.eth.Contract(configurationUser.abi, userManagementAddress);
            const userList = await userContract.methods.getAllUsers().call();
            const usersInfo = await Promise.all(
              userList.map(async (userAddress) => {
                const user = await userContract.methods.getUser(userAddress).call();
                const isAdmin = await userContract.methods.isAdmin(userAddress).call();
                return { address: userAddress, name: user.name, isAdmin };
              })
            );
            setUsersInfo(usersInfo);
            setUsers(userList);
          } else {
            console.error('No se pudo obtener la dirección del contrato UserManagament');
          }
        } else {
          console.error('contractManagament no está definido');
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    };
    loadUsers();
  }, [contractManagament]);

  const toggleAdmin = async (address) => {
    try {
      const userManagementAddress = await contractManagament.methods.userManagament().call();
      const userContract = new web3.eth.Contract(configurationUser.abi, userManagementAddress);
      const isAdmin = await userContract.methods.isAdmin(address).call();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const fromAddress = accounts[0];
      if (isAdmin) {
        await userContract.methods.revokeAdmin(address).send({ from: fromAddress });
      } else {
        await userContract.methods.makeAdmin(address).send({ from: fromAddress });
      }
      const updatedUsersInfo = usersInfo.map((user) =>
        user.address === address ? { ...user, isAdmin: !isAdmin } : user
      );
      setUsersInfo(updatedUsersInfo);
    } catch (error) {
      console.error('Error cambiando estado de administrador:', error);
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Lista de Usuarios</h3>
      <Row>
        <Col>
          <Accordion defaultActiveKey="0">
            {usersInfo.map((user, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>Usuario {index + 1}</Accordion.Header>
                <Accordion.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item><strong>Dirección:</strong> {user.address}</ListGroup.Item>
                    <ListGroup.Item><strong>Nombre:</strong> {user.name}</ListGroup.Item>
                    <ListGroup.Item><strong>Admin:</strong> {user.isAdmin ? 'Sí' : 'No'}</ListGroup.Item>
                    <Button onClick={() => toggleAdmin(user.address)}>
                      {user.isAdmin ? 'Revocar Admin' : 'Hacer Admin'}
                    </Button>
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
};

export default ListUsers;
