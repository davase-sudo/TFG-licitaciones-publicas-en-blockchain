import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';

const Account = ({ userManagament }) => {
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(false);

  const checkUserRole = async (account) => {
    try {
      if (userManagament) {
        const isRegistered = await userManagament.methods.isUserRegistered(account).call();
        if (!isRegistered) {
          window.alert('Usuario no registrado');
          return;
        }
        const isAdmin = await userManagament.methods.isAdmin(account).call();
        setRole(isAdmin ? 'Admin' : 'Participant');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  useEffect(() => {
    const loadAccount = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          window.ethereum.on('accountsChanged', function (newAccounts) {
            setAccount(newAccounts.length === 0 ? '' : newAccounts[0]);
            if (newAccounts.length > 0) {
              checkUserRole(newAccounts[0]);
            } else {
              setRole('');
            }
          });
          window.ethereum.on('disconnect', function () {
            setAccount('');
            setRole('');
          });
          if (accounts.length > 0) {
            checkUserRole(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error loading account:', error);
      }
    };

    loadAccount();
  }, [userManagament]);

  const connectAccount = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        checkUserRole(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting account:', error);
    }
  };

  const disconnectAccount = () => {
    setAccount('');
    setRole('');
    setShowModal(false);
  };

  return (
    <div id="account" className="d-flex justify-content-between align-items-center">
      {account ? (
        <>
          {role && (
            <div className="ml-auto">
              <Badge
                bg={role === 'Admin' ? 'success' : 'primary'}
                onClick={() => setShowModal(true)}
                style={{ cursor: 'pointer' }}
              >
                {role}
              </Badge>
            </div>
          )}
        </>
      ) : (
        <Button onClick={connectAccount} variant="primary">Conectar Cuenta</Button>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cuenta Conectada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Cuenta:</strong> {account}</p>
          <Button variant="danger" onClick={disconnectAccount}>Desconectar Cuenta</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Account;
