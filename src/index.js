/* Import dependencies */
import express from 'express';
import { } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './services/databaseservices.mjs';

// Set path for linking Pug with ExpressW
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Create express instance */
const app = express();
const port = 3000;

/* Add form data middleware */
app.use(express.urlencoded({ extended: true }));


// Integrate Pug with Express
app.set("view engine", "pug");

// Serve assets from 'static' folder
app.use(express.static("static"));

const db = await DatabaseService.connect();
const { conn } = db;

/* Landing route */
app.get("/", (req, res) => {
  res.render("index");
});

// Login route
app.get('/login', (req, res) => {
	res.render('login');
});

// Admin route
app.get('/admin', async (req, res, next) => {
	try {
		const continents = await db.getContinents();
		res.render('admin', {continents}); // Pass continents as an object
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Continents route (after clicking data btn)
app.get(`/continents`, async (req, res, next) => {
	try {
		const continents = await db.getContinents();
		res.render('continents', {continents}); // Pass continents as an object
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Particular continent route (after clicking continent)
app.get('/continents/:name', async (req, res, next) => {
	try {
		let name = req.params.name.replaceAll('%20', '');
		const [continent, fields] = await db.getContinent(req.params.name);
		const continentCountries = await db.getCountries(req.params.name);
		res.render('continent_countries', {continent, continentCountries}); // Pass continent and countries as an objects
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Particular country route (after clicking country)
app.get('/continents/:continent/:countryName', async (req, res, next) => {
	try {
		let name = req.params.countryName.replaceAll('%20', '');
		const country = await db.getCountryName(name);
		const countryCities = await db.getCities(name);
		res.render('country_cities', {country, countryCities}); // Pass country and cities as an objects
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Cities route (after clicking see all cities btn)
app.get('/cities', async (req, res, next) => {
	try {
		const [cities, fields] = await db.getAllCities();
		res.render('cities', {cities}); // Pass cities as an object
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Particular city route (after clicking city)
app.get('/cities/city/:id', async (req, res, next) => {
	try {
		const city = await db.getCity(req.params.id);
		res.render('city', {city}); // Pass city as an object
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Handle form submission
// app.get('/submit-form', async (req, res, next) => {
// 	try {
// 		const city = req.query.cityDelete; // Get city input value
// 		const countryCode = req.query.countryDeleteCode; // Get country input value
// 		const countryName = req.query.countryDeleteName; // Get country input value
// 		if (city != '') {
// 			db.deleteCity(city);
// 		}
// 		if (countryCode != '' && countryName != '') {
// 			db.deleteCountry(countryName, countryCode);
// 		}
// 	} catch (err) {
// 		next(err); // Pass error to the next middleware
// 	}
// });

// Run server!
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
