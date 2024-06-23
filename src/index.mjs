/* Import dependencies */
import express from 'express';
import session from 'express-session';
import {} from 'module';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import DatabaseService from './services/database.service.mjs';

/* Create express instance */
const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Add form data middleware */
app.use(express.urlencoded({extended: true}));

app.get('*.js', function (req, res) {
	res.type('application/javascript');
	res.sendFile('/services/actions.js', {root: __dirname});
	// console.log(`req.url: ${req.url}`);
	// console.log(`__dirname: ${__dirname}`);
});

// Integrate Pug with Express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));
/* Add form data middleware */
app.use(express.urlencoded({extended: true}));

app.use(
	session({
		secret: 'verysecretkey',
		resave: false,
		saveUninitialized: true,
		cookie: {secure: false},
	}),
);

// Integrate Pug with Express
app.set('view engine', 'pug');

// Serve assets from 'static' folder
app.use(express.static('static'));

const db = await DatabaseService.connect();
const {conn} = db;

// Landing route
app.get('/', (req, res) => {
	res.render('index');
});
// Landing route
app.get('/admin?delete:name', (req, res) => {
	console.log(reg.params.name);

	deleteIt(reg.params.name);
});

// Login route
app.get('/login', (req, res) => {
	res.render('login');
});

// Admin route
app.get('/admin', async (req, res, next) => {
	try {
		// Fetch continents from the database
		const continents = await db.getContinents();

		// Pass continents as an object
		res.render('admin', {continents});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Continents route (after clicking data btn)
app.get(`/continents`, async (req, res, next) => {
	try {
		// Pass continents as an object
		const continents = await db.getContinents();
		let N = req.query.N || continents.length;

		// Fetch continents from the database
		res.render('continents', {dataset: continents.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Particular continent route (after clicking continent)
app.get('/continents/:continent', async (req, res, next) => {
	try {
		let name = req.params.continent.replaceAll('%20', '');
		const continent = await db.getContinent(name);
		const continentCountries = await db.getCountries('', name);

		// Default to all countries if N is not provided
		let N = req.query.N || continentCountries.length;

		res.render('continent', {
			continent,
			dataset: continentCountries.slice(0, N),
		}); // Pass continent and countries as an objects
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Particular country route (after clicking country)
app.get('/continents/:continent/:countryName', async (req, res, next) => {
	try {
		let name = req.params.countryName.replaceAll('%20', '');
		// Fetch data
		const country = await db.getCountryName(name);
		const countryCities = await db.getCities(name, '');

		// Default to all cities if N is not provided
		let N = req.query.N || countryCities.length;

		// Pass country and cities as an objects
		res.render('country', {country, countryCities: countryCities.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Cities route (after clicking see all cities btn)
app.get('/cities', async (req, res, next) => {
	try {
		const cities = await db.getAllCities();

		// Default to all cities if N is not provided
		let N = req.query.N || cities.length;
		let filterCity = req.query.filterCity || '';
		let filterDistrict = req.query.filterDistrict || '';
		let filterCountry = req.query.filterCountry || '';
		let filterRegion = req.query.filterRegion || '';
		let filterContinent = req.query.filterContinent || '';
		let filter =
			filterCity || filterDistrict || filterCountry || filterRegion || filterContinent;

		const filteredCities = cities.filter((city) => {
			if (filterCountry) {
				return city.country == filter;
			} else if (filterContinent) {
				return city.continent == filter;
			} else if (filterDistrict) {
				return city.district == filter;
			} else if (filterRegion) {
				return city.region == filter;
			} else if (filterCity) {
				return city.name == filter;
			} else {
				return true;
			}
		});

		res.render('cities', {dataset: filteredCities.slice(0, N)});
		// Pass cities and N as an object
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Particular city route (after clicking city)
app.get('/cities/city/:id', async (req, res, next) => {
	try {
		const [city, country] = await db.getCity(req.params.id);

		res.render('city', {city, country}); // Pass city as an object
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// countries route (after clicking see all countries btn)
app.get('/countries', async (req, res, next) => {
	try {
		const countries = await db.getAllCountries();
		console.log(countries);

		let N = req.query.N || countries.length;

		// Pass countries as an object
		res.render('countries', {countries: countries.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});
// regions route (after clicking see all regions btn)
app.get('/regions', async (req, res, next) => {
	try {
		const regions = await db.getAllRegions();
		console.log(`regions[0]: ${regions[0]}`);
		let N = req.query.N || regions.length;

		// Pass regions as an object
		res.render('regions', {regions: regions.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});
// region route (after clicking see all regions btn)
app.get('/regions/:regionName', async (req, res, next) => {
	try {
		// Delete all white spaces
		let regionName = req.params.regionName.replaceAll('%20', '');

		const countries = await db.getCountries(regionName);
		console.log(`countries: ${countries[0]}`);
		let N = req.query.N || countries.length;

		// Pass regions as an object
		res.render('region', {regionName, countries: countries.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});
//  capitals route (after clicking see all capitals btn)
app.get('/capitals', async (req, res, next) => {
	try {
		const capitals = await db.getAllCapitals();
		// Default to all cities if N is not provided
		let N = req.query.N || capitals.length;
		let filterCity = req.query.filterCity || '';
		let filterDistrict = req.query.filterDistrict || '';
		let filterCountry = req.query.filterCountry || '';
		let filterRegion = req.query.filterRegion || '';
		let filterContinent = req.query.filterContinent || '';
		let filter =
			filterCity || filterDistrict || filterCountry || filterRegion || filterContinent;

		const filteredCapitals = capitals.filter((city) => {
			if (filterCountry) {
				return city.country == filter;
			} else if (filterContinent) {
				return city.continent == filter;
			} else if (filterDistrict) {
				return city.district == filter;
			} else if (filterRegion) {
				return city.region == filter;
			} else if (filterCity) {
				return city.name == filter;
			} else {
				return true;
			}
		});

		// Pass capitals as an object
		res.render('cities', {dataset: filteredCapitals.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});
//  capitals route (after clicking see all capitals btn)
app.get('/districts', async (req, res, next) => {
	try {
		const districts = await db.getAllDistricts();
		let N = req.query.N || districts.length;

		// Pass capitals as an object
		res.render('districts', {districts: districts.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

//  capitals route (after clicking see all capitals btn)
app.get('/districts/:district', async (req, res, next) => {
	try {
		let districtName = req.params.district.replaceAll('%20', '');

		const citiesInDistrict = await db.getCities('', districtName);
		console.log(`citiesInDistrict: ${citiesInDistrict}`);
		let N = req.query.N || citiesInDistrict.length;

		// Pass capitals as an object
		res.render('cities', {dataset: citiesInDistrict.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

//  population route (after clicking see all population btn)
app.get('/population/:category', async (req, res, next) => {
	try {
		let category = req.params.category.replaceAll('%20', '');

		const population = await db.getAllPopulation();
		const countriesPop = await db.getAllCountries();

		// Pass population as an object
		if (category == 'continent') {
			res.render('populationContinents', {dataset: population});
		} else if (category == 'region') {
			res.render('populationRegions', {dataset: population});
		} else if (category == 'country') {
			res.render('populationCountries', {dataset: countriesPop});
		}
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});
//  languages route (after clicking see all languages btn)
app.get('/languages', async (req, res, next) => {
	try {
		const languages = await db.getAllLanguages();
		let N = req.query.N || languages.length;

		// Pass languages an object
		res.render('languages', {langs: languages.slice(0, N)});
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Handle form submission
app.post('/delete', async (req, res, next) => {
	const params = req.body;
	const cityId = params.cityDelete;
	const countryCode = params.countryDeleteCode;
	try {
		if (cityId != '') {
			db.deleteCity(cityId);
		}
		if (countryCode != '') {
			db.deleteCountry(countryCode);
		}
		res.redirect('/cities');
	} catch (err) {
		next(err); // Pass error to the next middleware
	}
});

// Run server!
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
