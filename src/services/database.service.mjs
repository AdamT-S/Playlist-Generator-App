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
		console.log("connect() executed sucessfully");
		return new DatabaseService(conn);
	}

	/* Get a single continent */
	async getContinent(continent) {
		try {
			const sql = `
        SELECT Continent, SUM(country.Population) AS Population, COUNT(country.Code) AS countries
        FROM country
        WHERE Continent = "${continent}"
        GROUP BY Continent
        `;
			const [rows, fields] = await this.conn.execute(sql);
			const row = rows[0];
			const gotContinent = new Continent(row.Continent, row.Population, row.countries);
			// console.log(gotContinent);
			console.log("getContinent() executed sucessfully");
			return gotContinent;
		} catch (err) {
			console.error('Error fetching continents:', err);
			return [];
		}
	}

	/* get all of the continents */
	async getContinents() {
		try {
			const sql = `
			SELECT country.Continent,
			COUNT(country.Code) AS "Countries",
			SUM(country.Population) AS "Population",
			(SELECT SUM(Population) FROM country) AS "worldPopulation",
			c.Continent,
			ROUND((SELECT SUM(Population) FROM country WHERE country.Continent = c.Continent) / (SELECT SUM(Population) FROM country) * 100, 2) AS "Continent percentage"
			FROM 
				country
			JOIN 
				(SELECT DISTINCT Continent FROM country) AS c ON country.Continent = c.Continent
			GROUP BY 
				country.Continent;
	
        `;
			const [rows, fields] = await this.conn.execute(sql);
			const continents = rows.map(
				(c) => new Continent(c.Continent, c.Population, c.Countries, c.worldPopulation),
			);
			console.log("getContinents() executed sucessfully");
			return continents;
		} catch (err) {
			console.error('Error fetching continents:', err);
			return [];
		}
	}

	async getContinentRegions(continentName) {
		try {
			const sql = `
			SELECT Region, SUM(Population) AS "RegionPopulation"
			FROM country
			where Continent = "${continentName}"
			GROUP BY Region
			ORDER BY Population DESC;
        `;
			const [rows, fields] = await this.conn.execute(sql);
			console.log("getContinentRegions() executed sucessfully");
			return rows;
		} catch (err) {
			console.error('Error fetching countries by continent:', err);
			return [];
		}
	}

	async getAllRegions() {
		try {
			const sql = `
				SELECT Continent, Region, SUM(Population) AS "RegionPopulation"
				FROM country
				GROUP BY Region
				ORDER BY SUM(Population) DESC
        `;
			const [rows, fields] = await this.conn.execute(sql);
			const regions = rows.map((r) => new Region(r.Continent, r.Region, r.RegionPopulation));
			console.log("getAllRegions() executed sucessfully");
			return regions;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}
	/* SQL statement that gets a country based on it's name */
	async getCountryName(countryName) {
		try {
			const sql = `
				SELECT country.name,COUNT(city.ID) AS "numberOfCities", country.population, country.code, country.continent, country.region, capital_city.Name AS "capitalCity", Capital
				FROM country
				INNER JOIN city ON country.Code = city.CountryCode
				LEFT JOIN city AS capital_city ON country.Capital = capital_city.ID
				WHERE country.Name =  "${countryName}"
				GROUP BY country.name, country.population, country.code, country.continent, country.region,country.Capital,capital_city.Name;
		`;
			const [rows, fields] = await this.conn.execute(sql);
			console.log('db259:', [rows[0], fields]);
			const country = new Country(
				rows[0].code,
				rows[0].name,
				rows[0].continent,
				rows[0].region,
				rows[0].population,
				rows[0].numberOfCities,
				{capitalName: rows[0].capitalCity, capitalId: rows[0].Capital},
			);
			console.log('db269:', country);
			console.log("getCountryName() executed sucessfully");
			return country;
		} catch (err) {
			console.error('Error fetching countries by continent:', err);
			return [];
		}
	}

	/* Get a list of countries */
	async getAllCountries() {
		const sql = `
    SELECT country.*, 
	COUNT(city.ID) AS "numberOfCities", 
	((country.Population - SUM(city.Population)) / country.Population) * 100 AS "countrysideResidentsPer", 
	(country.Population - SUM(city.Population)) AS "countrysideResident",
	(SUM(city.Population) / country.Population) * 100 AS "cityResidentsPer", 
	SUM(city.Population) AS "cityResidents"
    FROM country
    LEFT JOIN city ON country.Code = city.CountryCode
    GROUP BY country.Code, country.Name, country.Population, country.Continent, country.Region
    ORDER BY country.Population 
	DESC;
    `;
		const [rows, fields] = await this.conn.execute(sql);
		console.log(rows[0]);

		const countries = rows.map(
			(c) =>
				new Country(
					c.Code,
					c.Name,
					c.Continent,
					c.Region,
					c.Population,
					c.numberOfCities,
					'',
					c.cityResidents,
					c.cityResidentsPer,
					c.countrysideResident,
					c.countrysideResidentsPer,
				),
		);
		console.log("getAllCountries() executed sucessfully");
		return countries;
	}

	// SQL statement that gets all the countries based on a named continent
	async getCountries(regionName, continentName) {
		try {
			const sql = `
          SELECT country.Code, country.Name, COUNT(city.ID) AS "numberOfCities", country.Population, ((country.Population - SUM(city.Population)) / country.Population) * 100 AS "countrysideResidents%", (country.Population - SUM(city.Population)) AS "CountrysideResident",
		  (SUM(city.Population) / country.Population) * 100 AS "cityResidents%", SUM(city.Population) AS "CityResidents"
          FROM country
          LEFT JOIN city ON country.Code = city.CountryCode
          ${
				regionName
					? `WHERE (region = "${regionName}")`
					: `WHERE (Continent = "${continentName}")`
			}
          GROUP BY country.Name, country.Population
          ORDER BY country.Population DESC;
        `;
			const [rows, fields] = await this.conn.execute(sql);
			console.log(rows);
			const countries = rows.map(
				(c) =>
					new Country(
						c.Code,
						c.Name,
						c.Continent,
						c.Region,
						c.Population,
						c.numberOfCities,
					),
			);
			console.log("getCountries() executed sucessfully");
			return countries;
		} catch (err) {
			console.error('Error fetching countries by continent:', err);
			return [];
		}
	}

	/* Get a list of countries */
	async getAllDistricts() {
		try {
			const sql = `
			SELECT CountryCode, District, SUM(Population) as 'Population'
			From City
			Group BY District        
			ORDER BY Population DESC	
    `;
			const [rows, fields] = await this.conn.execute(sql);
			const districts = rows.map(
				(d) => new District(d.CountryCode, d.District, d.Population),
			);
			console.log("getAllDistricts() executed sucessfully");
			return districts;
		} catch (err) {
			console.error('Error fetching AllDistricts():', err);
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
		const city = new City(
			data.ID,
			data.Name,
			'region',
			data.CountryCode,
			data.District,
			data.Population,
			'country',
			'continent',
		);
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
		console.log("getCity() executed sucessfully");
		return [city, country];
	}

	async getAllCities() {
		try {
			// Fetch cities from database
			const [data, fields] = await this.conn.execute(`
			SELECT city.*, country.Name as countryName, country.Continent as countryContinent, country.Region, city.District
			FROM city
			Join country on city.CountryCode = country.Code
			ORDER BY Population DESC
			`);
			const cities = data.map(
				(c) =>
					new City(
						c.ID,
						c.Name,
						c.Region,
						c.CountryCode,
						c.District,
						c.Population,
						c.countryName,
						c.countryContinent,
						c.countrysideResidentsPcnt,
						c.CountrysideResidents,
						c.cityResidentsPcnt,
						c.CityResidents,
					),
			);
			console.log("getAllCities() executed sucessfully");
			return cities;
		} catch (err) {
			// Handle error...
			console.error(err);
			return undefined;
		}
	}

	/* Get a list of all cities within a country */
	async getCities(country, district) {
		try {
			const sql = `
			SELECT city.ID AS Id, city.Name, country.Region, city.CountryCode, city.District, city.Population, country.Name as Country, country.Continent
			FROM city, country
			WHERE country.Code = city.CountryCode AND (country.Name = "${country}" OR city.District = "${district}")
			ORDER BY Population DESC;
        `;
			const [rows, fields] = await this.conn.execute(sql);

			const dataset = rows.map((record) => {
				return new City(
					record.Id,
					record.Name,
					record.Region,
					record.CountryCode,
					record.District,
					record.Population,
					record.Country,
					record.Continent,
				);
			});
			console.log("getCities() executed sucessfully");
			return dataset;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllCapitals(cityId) {
		try {
			const sql = `
    SELECT city.*, country.Name as countryName, country.Continent as countryContinent ,country.Region, city.District
	FROM city
	Join country on city.CountryCode = country.Code
    WHERE city.ID = country.Capital
	ORDER BY city.Population DESC
    `;
			const [rows, fields] = await this.conn.execute(sql);
			const cities = rows.map(
				(c) =>
					new City(
						c.ID,
						c.Name,
						c.Region,
						c.CountryCode,
						c.District,
						c.Population,
						c.countryName,
						c.countryContinent,
					),
			);
			console.log("getAllCapitals() executed sucessfully");
			return cities;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllPopulation() {
		try {
			const sql = `
			SELECT
			c.Continent AS Continent,
			c.ContinentPop,
			c.Region AS Region,
			c.RegionPop,
			SUM(city.Population) AS CityContinentPop,
			rc.RegionCityPop
		FROM 
			(
				SELECT 
					Continent, 
					SUM(Population) AS ContinentPop, 
					NULL AS Region, 
					NULL AS RegionPop 
				FROM 
					country 
				GROUP BY 
					Continent
		
				UNION ALL
		
				SELECT 
					Continent, 
					NULL AS ContinentPop, 
					Region, 
					SUM(Population) AS RegionPop 
				FROM 
					country 
				GROUP BY 
					Continent, 
					Region
			) AS c
		LEFT JOIN 
			city ON city.CountryCode IN (SELECT Code FROM country WHERE country.Continent = c.Continent)
		LEFT JOIN 
			(
				SELECT 
					country.Region, 
					SUM(city.Population) AS RegionCityPop 
				FROM 
					country 
				JOIN 
					city ON city.CountryCode = country.Code 
				GROUP BY 
					country.Region
			) AS rc ON c.Region = rc.Region
		LEFT JOIN 
			country ON country.Continent = c.Continent AND country.Region = c.Region
		GROUP BY 
			c.Continent, 
			c.Region
		
		
        `;
			const [rows, fields] = await this.conn.execute(sql);
			console.log("getAllPopulation() executed sucessfully");
			return rows;
		} catch (err) {
			console.error('Error fetching cities by country:', err);
			return [];
		}
	}

	async getAllLanguages() {
		try {
			const sql = `
			SELECT 
			Language,
			Round(SUM(TotalLanguagePopulation),0) AS TotalPeopleSpeaking,
			Round(SUM(TotalLanguagePopulation) / (SELECT SUM(Population) FROM country), 2) * 100 AS SpeakerPercentage
			FROM 
				(SELECT 
					countrylanguage.Language,
					SUM(country.Population * (countrylanguage.Percentage / 100)) AS TotalLanguagePopulation
				FROM 
					countrylanguage
				JOIN 
					country ON countrylanguage.CountryCode = country.Code
				GROUP BY 
					countrylanguage.Language, countrylanguage.Percentage) AS language_population
			GROUP BY 
				Language
			ORDER BY 
				TotalPeopleSpeaking DESC;
		
        `;
			const [rows, fields] = await this.conn.execute(sql);
			console.log(`rows`, rows);
			const langs = rows.map(
				(l) => new Language(l.Language, l.TotalPeopleSpeaking, l.SpeakerPercentage),
			);
			console.log(`langs`, langs);
			console.log("getAllLanguages() executed sucessfully");
			return langs;
		} catch (err) {
			console.error('Error fetching Language:', err);
			return [];
		}
	}

	async addCity() {
		try {
			const sql = `INSERT INTO city (ID, Name, CountryCode, District, Population)
    VALUES (${ID}, "${cityName}", "${countryCode}", "${district}", ${population})`;
			console.log("addCity() executed sucessfully");
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
			console.log("addCountry() executed sucessfully");
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
		console.log("deleteCity() executed sucessfully");
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
			console.log("deleteCountry() executed sucessfully");
			return result;
		} catch (err) {
			console.error('Error deleting country:', err);
			return false;
		}
	}

	/* Update a city name */
	async updateCityName(cityId, newName) {
		try {
			const sql = `UPDATE city SET Name = '${newName}' WHERE ID = ${cityId}`;
			const [result] = await this.conn.execute(sql);
			console.log("updateCityName() executed sucessfully");
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
			console.log("updateCountryName() executed sucessfully");
			return result;
		} catch (err) {
			console.error('Error updating country name:', err);
			return false;
		}
	}

	/* Update a continent name */
	async updateContinentName(oldContinentName, newContinentName) {
		try {
			const sql = `UPDATE country SET Continent = '${newContinentName}' WHERE Continent = '${oldContinentName}'`;
			const [result] = await this.conn.execute(sql);
			console.log("updateContinentName() executed sucessfully");
			return result;
		} catch (err) {
			console.error('Error updating continent name:', err);
			return false;
		}
	}
}
