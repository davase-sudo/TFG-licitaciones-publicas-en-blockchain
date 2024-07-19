import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import { Container, Card, Spinner, Table } from 'react-bootstrap';
import configurationTender from '../contracts/Tender.json';

const web3 = new Web3('http://127.0.0.1:7545');

function ParticipantDetails() {
  const { address, participantAddress } = useParams();
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    const fetchParticipantProposal = async () => {
      try {
        const instance = new web3.eth.Contract(configurationTender.abi, address);
        const proposal = await instance.methods.getProposalByParticipant(participantAddress).call();
        setProposal(proposal);
      } catch (error) {
        console.error('Error fetching participant proposal:', error);
      }
    };
    fetchParticipantProposal();
  }, [address, participantAddress]);

  if (!proposal) return (
    <Container className="mt-5 text-center">
      <Spinner animation="border" />
      <p>Cargando...</p>
    </Container>
  );

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header as="h5">Detalles del Participante</Card.Header>
        <Card.Body>
          <p><strong>Dirección:</strong> {participantAddress}</p>
          {proposal ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Descripción</th>
                  <th>Documento Hash</th>
                  <th>Documento Real</th>
                  <th>Documento Revelado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{proposal.name}</td>
                  <td>{proposal.quantity}</td>
                  <td>{proposal.description}</td>
                  <td>{proposal.hashDocument}</td>
                  <td>{proposal.realDocument || 'No revelado'}</td>
                  <td>{proposal.documentRevealed ? 'Sí' : 'No'}</td>
                </tr>
              </tbody>
            </Table>
          ) : (
            <p>Sin propuestas</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ParticipantDetails;
