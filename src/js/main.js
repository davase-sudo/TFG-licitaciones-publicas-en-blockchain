import Web3 from 'web3';
import configuration from '../../build/contracts/UserManagament.json';
import 'bootstrap/dist/css/bootstrap.css';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

const web3 = new Web3('http://127.0.0.1:7545');
const contract = new web3.eth.Contract(CONTRACT_ABI,CONTRACT_ADDRESS);

window.addEventListener('load', async () => {
    // Modern dapp browsers
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // Acccounts now exposed
            const accountEl = document.getElementById('account');
            accountEl.innerText = accounts[0];

            ethereum.on('accountsChanged', function (newAccounts) {
                // Si no hay cuentas disponibles, limpiar el elemento de la cuenta
                if (newAccounts.length === 0) {
                    accountEl.innerText = 'Sin cuenta conectada';
                } else {
                    // Actualizar el elemento de la cuenta con la nueva cuenta
                    accountEl.innerText = newAccounts[0];
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
    // Legacy dapp browsers
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        const accounts = await web3.eth.getAccounts();
        const accountEl = document.getElementById('account');
        accountEl.innerText = accounts[0];
    }
    // Non-dapp browsers
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

window.addEventListener('load', async () => {
    const accountEl = document.getElementById('account');
    if(accountEl!='Sin cuenta conectada' && accountEl){
        try {
            const accounts = await web3.eth.getAccounts();
            const balance = await contract.methods.getBalanceInEther(accounts[0]).call();
            // Mostrar el saldo en un elemento HTML
            const balanceEl = document.getElementById('balance');
            balanceEl.innerText = `${balance} ETH`;
        } catch (error) {
            console.error('Error al obtener el saldo:', error);
        }
    }
});

async function loadTemplate(templateUrl) {
    const response = await fetch(templateUrl);
    const html = await response.text();
    document.getElementById('content').innerHTML = html;
}

const main = async () => {

};
  
main();