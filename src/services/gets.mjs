import mysql from 'mysql2/promise';
import City from '../models/city.mjs';
import Continent from '../models/continent.mjs';
import Country from '../models/country.mjs';

export default class DatabaseService {
	conn;

	constructor(conn) {
		this.conn = conn;
	}

	/* Establish database connection and return the instance */
	static async connect() {
		const conn = await mysql.createConnection({
			host: process.env.DATABASE_HOST || 'localhost',
			user: 'root',
			password: '',
			database: 'world',
		});

		return new DatabaseService(conn);
	}

	/* Get a list of all cities */
	async getAllCities() {
		try {
			// Fetch cities from database
			const data = await this.conn.execute('SELECT * FROM city');
			return data;
		} catch (err) {
			// Handle error...
			console.error(err);
			return undefined;
		}
	}

	/* Get a list of all cities within a country */
	async getCities(countryName) {
		try {
			const sql = `
            SELECT city.*
            FROM city
            JOIN country ON country.Code = city.CountryCode
            WHERE country.Name = '${countryName}'
            ORDER BY Population DESC;
            `;
			const [rows, fields] = await this.conn.execute(sql);
			return rows;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	/* Get a particular city by ID, including country information */
	async getCity(cityId) {
		const sql = `
        SELECT city.*, country.Name AS Country, country.Region, country.Continent, country.Population as CountryPopulation
        FROM city
        INNER JOIN country ON country.Code = city.CountryCode
        WHERE city.ID = ${cityId}
    `;
		const [rows, fields] = await this.conn.execute(sql);
		/* Get the first result of the query (we're looking up the city by ID, which should be unique) */
		const data = rows[0];
		const city = new City(data.ID, data.Name, data.CountryCode, data.District, data.Population);
		const country = new Country(
			data.Code,
			data.Country,
			data.Continent,
			data.Region,
			data.CountryPopulation,
		);
		const continent = new Continent(data.Continent, data.Population, data.NumberOfCountries);
		city.country = country;
		country.continent = continent;
		return [city, country];
	}

	/* Get a list of countries */
	async getAllCountries() {
		const sql = `SELECT country.Name FROM country`;
		const [rows, fields] = await this.conn.execute(sql);

		// const countries = rows.map(
		// 	(c) => new Country(c.Code, c.Name, c.Continent, c.Region, c.Population),
		// );
		console.log(rows);
		return rows;
	}

	// SQL statement that gets all the countries based on a named continent
	async getCountries(continentName) {
		try {
			const sql = `
            SELECT country.Name, COUNT(city.ID) AS "Number_of_cities", country.Population
            FROM country
            LEFT JOIN city ON country.Code = city.CountryCode
            WHERE (continent = "${continentName}" OR "${continentName}" = 'Antarctica' AND country.Code = 'ATA')
            GROUP BY country.Name
            ORDER BY population DESC;
            `;
			const [rows, fields] = await this.conn.execute(sql);
			return rows;
		} catch (err) {
			console.error('Error fetching countries by continent:', err);
			return [];
		}
	}

	/* SQL statement that gets a country based on it's name */
	async getCountryName(countryName) {
		try {
			const sql = `
            SELECT country.name, COUNT(city.ID) As "numberOfCities", country.population, country.code, country.continent, country.region
            FROM country, city
            WHERE country.Code = city.CountryCode AND country.Name =  "${countryName}"
            GROUP BY country.Name
            `;
			const [rows, fields] = await this.conn.execute(sql);
			const country = new Country(
				rows[0].code,
				rows[0].name,
				rows[0].continent,
				rows[0].region,
				rows[0].population,
				rows[0].numberOfCities,
			);
			console.log(country);
			return country;
		} catch (err) {
			console.error('Error fetching countries by continent:', err);
			return [];
		}
	}

	/* get all of the continents */
	async getContinents() {
		try {
			const sql = `
            SELECT Continent,  COUNT(country.Code) AS Countries,SUM(country.Population) AS Population
            FROM country
            GROUP BY Continent
            ORDER BY population DESC;
            `;
			const [rows, fields] = await this.conn.execute(sql);
			return rows;
		} catch (err) {
			console.error('Error fetching continents:', err);
			return [];
		}
	}

	/* Get a single continent */
	async getContinent(Continent) {
		try {
			const sql = `
            SELECT Continent, SUM(country.Population) AS Population, COUNT(country.Code) AS countries
            FROM country
            WHERE Continent = "${Continent}"
            GROUP BY Continent
            `;
			const [rows, fields] = await this.conn.execute(sql);
			return rows;
		} catch (err) {
			console.error('Error fetching continents:', err);
			return [];
		}
	}
}
