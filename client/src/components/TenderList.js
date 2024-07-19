import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';

function TenderList({ contractManagament }) {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const fetchTenders = async () => {
      if (contractManagament) {
        try {
          const tenderList = await contractManagament.methods.getTenders().call();
          setTenders(tenderList);
        } catch (error) {
          console.error('Error fetching tenders:', error);
        }
      }
    };
    fetchTenders();
  }, [contractManagament]);

  return (
    <div>
      <h3 className="mb-4">Lista de Contratos</h3>
      <Row>
        {tenders.map((tender, index) => (
          <Col key={index} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Contrato {index + 1}</Card.Title>
                <Card.Text>
                  Dirección: {tender}
                </Card.Text>
                <Button as={Link} to={`/tender/${tender}`} variant="primary">
                  Ver Detalles
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default TenderList;
