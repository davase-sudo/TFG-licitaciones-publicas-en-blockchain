import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function CreateTender({ contractManagament }) {
  const [deadline, setDeadline] = useState('');
  const [revealTime, setRevealTime] = useState('');
  const [evaluationTime, setEvaluationTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateTender = async () => {
    if (contractManagament) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        if (isNaN(deadline) || isNaN(revealTime) || isNaN(evaluationTime)) {
          setErrorMessage('Por favor, ingrese valores válidos para todos los campos.');
          return;
        }

        // Convertir los días a segundos
        const deadlineInSeconds = parseInt(deadline);
        const revealTimeInSeconds = parseInt(revealTime);
        const evaluationTimeInSeconds = parseInt(evaluationTime);
        
        const receipt = await contractManagament.methods.registrarLicitacion(
          deadlineInSeconds,
          revealTimeInSeconds,
          evaluationTimeInSeconds
        ).send({ from: account, gas: 3000000 });
       
        Object.keys(receipt.events).forEach((eventKey) => {
          const event = receipt.events[eventKey];
          if (event.event === 'Debug') {
            console.log(`Debug Event - Message: ${event.returnValues.message}, Value: ${event.returnValues.value}`);
          } else {
            console.log(`Event - Name: ${event.event}, Values: ${JSON.stringify(event.returnValues)}`);
          }
        });
  
        setSuccessMessage('Licitación creada con éxito.');
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Error al crear la licitación: ${error.message}`);
        setSuccessMessage('');
      }
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Crear Contrato</h3>
      <Form>
        <Form.Group className="mb-3" controlId="formDeadline">
          <Form.Label>Fecha Límite (en días)</Form.Label>
          <Form.Control 
            type="number" 
            value={deadline} 
            onChange={(e) => setDeadline(e.target.value)} 
            placeholder="Ingrese la fecha límite" 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formRevealTime">
          <Form.Label>Tiempo de Revelación (en días)</Form.Label>
          <Form.Control 
            type="number" 
            value={revealTime} 
            onChange={(e) => setRevealTime(e.target.value)} 
            placeholder="Ingrese el tiempo de revelación" 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEvaluationTime">
          <Form.Label>Tiempo de Evaluación (en días)</Form.Label>
          <Form.Control 
            type="number" 
            value={evaluationTime} 
            onChange={(e) => setEvaluationTime(e.target.value)} 
            placeholder="Ingrese el tiempo de evaluación" 
          />
        </Form.Group>

        <Button variant="primary" onClick={handleCreateTender}>
          Crear
        </Button>
      </Form>

      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}
    </Container>
  );
}

export default CreateTender;
