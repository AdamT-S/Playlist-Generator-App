import DatabaseService from './services/databaseservices.mjs';
const db = await DatabaseService.connect();
const {conn} = db;

const cityToDeleteInput = document.querySelector('#cityDelete');
const countryToDeleteInput = document.getElementById('countryDeleteCode');
const continentToDeleteInput = document.querySelector('#continentDelete');

const h1 = document.querySelector('header h1.data-title');
h1.style.color = 'red';

cityToDeleteInput.addEventListener('change', (e) => console.log(e.target.value));
countryToDeleteInput.addEventListener('change', (e) => console.log(e.target.value));
