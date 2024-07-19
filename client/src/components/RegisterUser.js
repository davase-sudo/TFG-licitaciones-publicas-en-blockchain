import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import configurationUser from '../contracts/UserManagament.json';

const RegisterUser = ({ contractManagament }) => {
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  const handleRegister = async (event) => {
    event.preventDefault();
    const userAddress = event.target.elements.address.value;
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const userContract = new web3.eth.Contract(
      configurationUser.abi,
      await contractManagament.methods.userManagament().call()
    );

    try {
      await userContract.methods.registerUser(userAddress, "pepe").send({ from: accounts[0], gas: 200000 });
      setMessage('Usuario registrado exitosamente');
      setVariant('success');
    } catch (error) {
      console.error(error);
      setMessage('Error al registrar el usuario');
      setVariant('danger');
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Registrar Usuario</h3>
      <Form onSubmit={handleRegister}>
        <Form.Group controlId="formUserAddress" className="mb-3">
          <Form.Label>Dirección de usuario</Form.Label>
          <Form.Control type="text" name="address" placeholder="Ingrese la dirección de usuario" required />
        </Form.Group>
        <Button variant="primary" type="submit">
          Registrar Usuario
        </Button>
      </Form>
      {message && (
        <Alert variant={variant} className="mt-3">
          {message}
        </Alert>
      )}
    </Container>
  );
};

export default RegisterUser;
