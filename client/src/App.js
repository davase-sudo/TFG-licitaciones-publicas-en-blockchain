import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Account from './components/Account';
import RegisterUser from './components/RegisterUser';
import ListUsers from './components/ListUsers';
import TenderList from './components/TenderList';
import CreateTender from './components/CreateTender';
import TenderDetails from './components/TenderDetails';
import ParticipantDetails from './components/ParticipantDetails';
import configurationManagament from './contracts/TenderManagament.json';
import configurationUserManagament from './contracts/UserManagament.json';

function App() {
  const [contractManagament, setContractManagament] = useState(null);
  const [userManagament, setUserManagament] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);

          const deployedNetwork = configurationManagament.networks['5777'].address;
          if (deployedNetwork) {
            const instance = new web3.eth.Contract(configurationManagament.abi, deployedNetwork);
            setContractManagament(instance);

            const contractAddress2 = await instance.methods.userManagament().call();
            if (contractAddress2) {
              const userInstance = new web3.eth.Contract(configurationUserManagament.abi, contractAddress2);
              setUserManagament(userInstance);
              checkUserRole(accounts[0], userInstance);
            }
          }
        } catch (error) {
          console.error('Error initializing web3 or fetching contracts:', error);
        }
      } else {
        console.error("Please install MetaMask!");
      }
    };

    const handleAccountsChanged = (newAccounts) => {
      if (newAccounts.length === 0) {
        console.log("Please connect to MetaMask.");
        setAccounts([]);
        setRole('');
        navigate('/');
      } else {
        setAccounts(newAccounts);
        if (userManagament) {
          checkUserRole(newAccounts[0], userManagament);
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    initWeb3();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [userManagament, navigate]);

  const checkUserRole = async (account, userInstance) => {
    try {
      if (userInstance) {
        const isRegistered = await userInstance.methods.isUserRegistered(account).call();
        if (!isRegistered) {
          window.alert('Usuario no registrado');
          setAccounts([]);
          navigate('/');
          return;
        }
        const isAdmin = await userInstance.methods.isAdmin(account).call();
        setRole(isAdmin ? 'Admin' : 'Participant');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Tender DApp</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Mostrar Contratos</Nav.Link>
              {role === 'Admin' && (
                <>
                  <Nav.Link as={Link} to="/create-tender">Crear Contrato</Nav.Link>
                  <Nav.Link as={Link} to="/register-user">Registrar Usuario</Nav.Link>
                  <Nav.Link as={Link} to="/list-users">Ver Usuarios</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
          <Nav>
            <Nav.Item>
              <Account userManagament={userManagament} />
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-5">
        <Routes>
          <Route path="/" element={<TenderList contractManagament={contractManagament} />} />
          {role === 'Admin' && (
            <>
              <Route path="/create-tender" element={<CreateTender contractManagament={contractManagament} />} />
              <Route path="/register-user" element={<RegisterUser contractManagament={contractManagament} />} />
              <Route path="/list-users" element={<ListUsers contractManagament={contractManagament} />} />
            </>
          )}
          <Route path="/tender/:address" element={<TenderDetails userRole={role} />} />
          <Route path="/tender/:address/participant/:participantAddress" element={<ParticipantDetails />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
