import mysql from 'mysql2/promise';
import City from '../models/city.mjs';
import Continent from '../models/continent.mjs';
import Country from '../models/country.mjs';
import District from '../models/district.mjs';
import Language from '../models/language.mjs';
import Region from '../models/region.mjs';

export default class DatabaseService {
	conn;

	constructor(conn) {
		this.conn = conn;
	}

	/* Establish database connection and return the instance */
	static async connect() {
		const conn = await mysql.createConnection({
			host: process.env.DATABASE_HOST || 'localhost',
			user: 'user',
			password: 'password',
			database: 'world',
		});

		console.log("connect() executed successfully");
		return new DatabaseService(conn);
	}

	async addCity() {
		try {
			const sql = `INSERT INTO city (ID, Name, CountryCode, District, Population)
    VALUES (${ID}, "${cityName}", "${countryCode}", "${district}", ${population})`;
			console.log("addCity() executed successfully");
			return result;
		} catch {
			console.error('Could not add city: ', err);
			return false;
		}
	}

	async addCountry(
		countryCode,
		countryName,
		continentName,
		regionName,
		surfaceArea,
		indepYear,
		population,
		lifeExpectancy,
		GNP,
		gnpOld,
		localName,
		govForm,
		headOfState,
		capitalCity,
		code2,
	) {
		try {
			const sql = `INSERT INTO country (Code, Name, Continent, Region, SurfaceArea, IndepYear, Population, LifeExpectancy, GNP, GNPOld, LocalName, GovernmentForm, HeadOfState, Capital, Code2)
        VALUES ("${countryCode}", "${countryName}", "${continentName}, "${regionName}", ${surfaceArea}, ${indepYear}, ${population}, ${lifeExpectancy}, ${GNP}, ${gnpOld}, "${localName}", "${govForm}", "${headOfState}", "${capitalCity}", "${code2}");`;
			const [result] = await this.conn.execute(sql);
			console.log("addCountry() executed successfully");
			return result;
		} catch (err) {
			console.error('Could not add country: ', err);
			return false;
		}
	}

	/* Delete a city by ID */
	async deleteCity(cityId) {
		const res = await this.conn.execute(`DELETE FROM city WHERE id = ${cityId}`);
		console.log(res);
		console.log("deleteCity() executed successfully");
		return res;
	}

	/* delete a country */
	async deleteCountry(countryCode) {
		try {
			const sql = `BEGIN;
        DELETE FROM city WHERE CountryCode = "${countryCode}";
        DELETE FROM countrylanguage WHERE CountryCode = "${countryCode}";
        DELETE FROM country WHERE Code = "${countryCode}";
        COMMIT;`;
			const [result] = await this.conn.execute(sql);
			console.log("deleteCountry() executed successfully");
			return result;
		} catch (err) {
			console.error('Error deleting country:', err);
			return false;
		}
	}

	async getAllCities() {
		try {
			// Fetch cities from database
			const data = await this.conn.execute('SELECT * FROM city');
			console.log("getAllCities() executed successfully");
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
			console.log("getCities() executed successfully");
			return rows;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllCapitals(cityId) {
		try {
			const sql = `
    SELECT city.*
    FROM city,country
    WHERE city.ID = country.Capital
    `;
			const [rows, fields] = await this.conn.execute(sql);
			console.log("getAllCapitals() executed successfully");
			return rows;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllRegions(Region) {
		try {
			const sql = `
        SELECT Region, Continent, SUM(Population) as Population
        FROM country
        Group BY Region 
        ORDER BY Region DESC
        `;
			const [rows, fields] = await this.conn.execute(sql);
			const regions = rows.map((r) => new Country(r.Continent, r.Region, r.Population));
			console.log("getAllRegions() executed successfully");
			return regions;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllPopulation() {
		try {
			const sql = `
        SELECT SUM(Population) AS "Global Population"
        FROM country
        `;
			const [rows, fields] = await this.conn.execute(sql);
			console.log("getAllPopulation() executed successfully");
			return rows;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllLanguages() {
		try {
			const sql = `
        SELECT LANGUAGE
        FROM countrylanguage
        GROUP BY LANGUAGE
        `;
			const [rows, fields] = await this.conn.execute(sql);
			const langs = rows.map((l) => new Language(l.Name, l.Population, l.Percentage));
			console.log("getAllLanguages() executed successfully");
			return langs;
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
		console.log("getCity() executed successfully");
		return [city, country];
	}

	/* Get a list of countries */
	async getAllCountries() {
		const sql = `SELECT * FROM country`;
		const [rows, fields] = await this.conn.execute(sql);

		const countries = rows.map(
			(c) => new Country(c.Code, c.Name, c.Continent, c.Region, c.Population),
		);
		console.log("getAllCountries() executed successfully");
		return countries;
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
			console.log("getCountries() executed successfully");
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
			console.log("getCountryName() executed successfully");
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
			console.log("getContinents() executed successfully");
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
			console.log("getContinent() executed successfully");
			return rows;
		} catch (err) {
			console.error('Error fetching continents:', err);
			return [];
		}
	}
	/* Update a city name */
	async updateCityName(cityId, newName) {
		try {
			const sql = `UPDATE city SET Name = '${newName}' WHERE ID = ${cityId}`;
			const [result] = await this.conn.execute(sql);
			console.log("updateCityName() executed successfully");
			return result;
		} catch (err) {
			console.error('Error updating city name:', err);
			return false;
		}
	}

	/* Update a country name */
	async updateCountryName(countryCode, newName) {
		try {
			const sql = `UPDATE country SET Name = '${newName}' WHERE Code = '${countryCode}'`;
			const [result] = await this.conn.execute(sql);
			console.log("updateCountryName() executed successfully");
			return result;
		} catch (err) {
			console.error('Error updating country name:', err);
			return false;
		}
	}

	/* Update a contient name */
	async updateContinentName(oldContinentName, newContinentName) {
		try {
			const sql = `UPDATE country SET Continent = '${newContinentName}' WHERE Continent = '${oldContinentName}'`;
			const [result] = await this.conn.execute(sql);
			console.log("updateContinentName() executed successfully");
			return result;
		} catch (err) {
			console.error('Error updating continent name:', err);
			return false;
		}
	}
}
