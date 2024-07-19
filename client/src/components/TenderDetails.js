import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Web3 from 'web3';
import { Container, Row, Col, Card, Spinner, Table, Alert, Form, Button } from 'react-bootstrap';
import configurationTender from '../contracts/Tender.json';
import crypto from 'crypto-browserify';
import { Buffer } from 'buffer';

const web3 = new Web3('http://127.0.0.1:7545');

function TenderDetails({ userRole }) {
  const { address } = useParams();
  const [tender, setTender] = useState(null);
  const [details, setDetails] = useState({
    licitador: '',
    deadline: '',
    revealDeadline: '',
    evaluationDeadline: '',
    active: false,
    winner: '',
  });
  const [participants, setParticipants] = useState([]);
  const [newProposal, setNewProposal] = useState({
    name: '',
    quantity: '',
    description: '',
    document: null,
  });
  const [newDocument, setNewDocument] = useState({
    name: '',
    document: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchTenderDetails = async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const instance = new web3.eth.Contract(configurationTender.abi, address);
      await instance.methods.checkAndUpdateStatus().send({ from: account, gas: 3000000 });
      setTender(instance);

      const licitador = await instance.methods.licitador().call();
      const deadline = Number(await instance.methods.deadline().call());
      const revealDeadline = Number(await instance.methods.revealDeadline().call());
      const evaluationDeadline = Number(await instance.methods.evaluationDeadline().call());
      const active = await instance.methods.active().call();
      const winner = await instance.methods.winner().call();

      setDetails({
        licitador,
        deadline,
        revealDeadline,
        evaluationDeadline,
        active,
        winner,
      });

      const participants = await instance.methods.getParticipants().call();
      setParticipants(participants);

      // Determine status based on current time and deadlines
      const currentTime = new Date().getTime() / 1000;
      if (currentTime > evaluationDeadline) {
        setStatus('Finalizado');
      } else if (currentTime > revealDeadline) {
        setStatus('Evaluación');
      } else if (currentTime > deadline) {
        setStatus('Revelación de Documentos');
      } else {
        setStatus('Presentación de Ofertas');
      }
    };

    // Fetch initial data
    fetchTenderDetails();

    // Set up interval to refresh data periodically
    const intervalId = setInterval(fetchTenderDetails, 5000); // Update every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProposal({ ...newProposal, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewProposal({ ...newProposal, document: e.target.files[0] });
  };

  const handleDocumentChange = (e) => {
    const { name, value } = e.target;
    setNewDocument({ ...newDocument, [name]: value });
  };

  const handleDocumentFileChange = (e) => {
    setNewDocument({ ...newDocument, document: e.target.files[0] });
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const accounts =  await window.ethereum.request({ method: 'eth_accounts' });
      const reader = new FileReader();
      reader.readAsArrayBuffer(newProposal.document);
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
        const hexDocument = buffer.toString('hex');
        console.log(accounts);
        await tender.methods.addParticipant(accounts[0]).send({ from: accounts[0], gas: 3000000 });
        await tender.methods.addOrUpdateProposal(accounts[0], newProposal.quantity, newProposal.description, newProposal.name, hexDocument).send({ from: accounts[0], gas: 3000000 });
  
        alert('Propuesta presentada con éxito');
      };
    } catch (error) {
      console.error('Error al presentar la propuesta:', error);
      alert('Hubo un error al presentar la propuesta. Por favor, intente nuevamente.');
    }
  
    setIsSubmitting(false);
  };

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const accounts = await web3.eth.getAccounts();
      const reader = new FileReader();
      reader.readAsArrayBuffer(newDocument.document);
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
        const hexDocument = buffer.toString('hex');
        const name = newDocument.name;
        await tender.methods.revealDocument(accounts[0], name, hexDocument).send({ from: accounts[0], gas: 5000000000 });

        alert('Documento presentado con éxito');
      };
      alert('Documento presentado con éxito');
    } catch (error) {
      console.error('Error al presentar el documento:', error);
      alert('Hubo un error al presentar el documento. Por favor, intente nuevamente.');
    }

    setIsSubmitting(false);
  };

  const handleSelectWinner = async (e) => {
    e.preventDefault();
    const winnerAddress = e.target.elements.winnerAddress.value;
    try {
      const accounts = await web3.eth.getAccounts();
      await tender.methods.seleccionarGanador(winnerAddress).send({ from: accounts[0], gas: 30000000 });

      alert('Ganador seleccionado con éxito');
    } catch (error) {
      console.error('Error al seleccionar el ganador:', error);
      alert('Hubo un error al seleccionar el ganador. Por favor, intente nuevamente.');
    }
  };

  if (!tender) return (
    <Container className="mt-5 text-center">
      <Spinner animation="border" />
      <p>Cargando...</p>
    </Container>
  );

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Header as="h3">Detalles del Contrato</Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <tbody>
                  <tr>
                    <td><strong>Licitador</strong></td>
                    <td>{details.licitador}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha Límite</strong></td>
                    <td>{new Date(details.deadline * 1000).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha Límite de Revelación</strong></td>
                    <td>{new Date(details.revealDeadline * 1000).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha Límite de Evaluación</strong></td>
                    <td>{new Date(details.evaluationDeadline * 1000).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Activo</strong></td>
                    <td>{details.active ? 'Sí' : 'No'}</td>
                  </tr>
                  <tr>
                    <td><strong>Ganador</strong></td>
                    <td>{details.winner}</td>
                  </tr>
                  <tr>
                    <td><strong>Estado</strong></td>
                    <td>{status}</td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mt-4">Participantes</h5>
              {participants.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Dirección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <Link to={`/tender/${address}/participant/${participant}`}>{participant}</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Sin participantes</Alert>
              )}

              {status === 'Presentación de Ofertas' && userRole === 'Participant' && (
                <>
                  <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Ocultar Formulario' : 'Presentar Propuesta'}
                  </Button>

                  {showForm && (
                    <div className="mt-4">
                      <h5>Presentarse como Participante</h5>
                      <Form onSubmit={handleSubmitProposal}>
                        <Form.Group controlId="formName">
                          <Form.Label>Nombre</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={newProposal.name}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="formQuantity">
                          <Form.Label>Cantidad</Form.Label>
                          <Form.Control
                            type="number"
                            name="quantity"
                            value={newProposal.quantity}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                          <Form.Label>Descripción</Form.Label>
                          <Form.Control
                            type="text"
                            name="description"
                            value={newProposal.description}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="formDocument">
                          <Form.Label>Documento</Form.Label>
                          <Form.Control
                            type="file"
                            name="document"
                            onChange={handleFileChange}
                            required
                          />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Enviando...' : 'Presentar Propuesta'}
                        </Button>
                      </Form>
                    </div>
                  )}
                </>
              )}

              {status === 'Revelación de Documentos' && userRole === 'Participant' && (
                <div className="mt-4">
                  <h5>Presentar Documento Real</h5>
                  <Form onSubmit={handleSubmitDocument}>
                    <Form.Group controlId="formDocName">
                      <Form.Label>Nombre de la Propuesta</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={newDocument.name}
                        onChange={handleDocumentChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="formDocFile">
                      <Form.Label>Documento Real</Form.Label>
                      <Form.Control
                        type="file"
                        name="document"
                        onChange={handleDocumentFileChange}
                        required
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : 'Presentar Documento'}
                    </Button>
                  </Form>
                </div>
              )}

              {status === 'Evaluación' && userRole === 'Admin' && (
                <div className="mt-4">
                  <h5>Seleccionar Ganador</h5>
                  <Form onSubmit={handleSelectWinner}>
                    <Form.Group controlId="formWinner">
                      <Form.Label>Dirección del Ganador</Form.Label>
                      <Form.Control as="select" name="winnerAddress" required>
                        <option value="">Seleccione el ganador</option>
                        {participants.map((participant, index) => (
                          <option key={index} value={participant}>
                            {participant}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : 'Seleccionar Ganador'}
                    </Button>
                  </Form>
                </div>
              )}

              {status !== 'Presentación de Ofertas' && status !== 'Revelación de Documentos' && status !== 'Evaluación' && (
                <Alert variant="info">El período de presentación de propuestas ha finalizado.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TenderDetails;
