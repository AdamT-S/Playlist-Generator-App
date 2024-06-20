import mysql from "mysql2/promise";

function updateLimit() {
	let limitInput = document.querySelector('.data_li:nth-child(1) .data_filter');
	let N = limitInput.value;
	console.log(`n client ${N}`);

	window.location.href = window.location.pathname + `?N=${N}`;
}

export default class DatabaseService {
    conn;

    constructor(conn) {
        this.conn = conn;
    }

    /* Establish database connection and return the instance */
    static async connect() {
        const conn = await mysql.createConnection({
            host: process.env.DATABASE_HOST || "localhost",
            user: "root",
            password: "",
            database: "world",
        });

        return new DatabaseService(conn);
    }
    async addCity(){
        try{
            const sql = `INSERT INTO city (ID, Name, CountryCode, District, Population)
        VALUES (${ID}, "${cityName}", "${countryCode}", "${district}", ${population})`;
        return result;
        }
        catch{
            console.error("Could not add city: ", err);
            return false;
        }
    }

    async addCountry(countryCode, countryName, continentName, regionName, surfaceArea, indepYear, population, lifeExpectancy, GNP, gnpOld, localName, govForm, headOfState, capitalCity, code2)
    {
        try{
            const sql = `INSERT INTO country (Code, Name, Continent, Region, SurfaceArea, IndepYear, Population, LifeExpectancy, GNP, GNPOld, LocalName, GovernmentForm, HeadOfState, Capital, Code2)
            VALUES ("${countryCode}", "${countryName}", "${continentName}, "${regionName}", ${surfaceArea}, ${indepYear}, ${population}, ${lifeExpectancy}, ${GNP}, ${gnpOld}, "${localName}", "${govForm}", "${headOfState}", "${capitalCity}", "${code2}");`;
            const [result] = await this.conn.execute(sql);
            return result;
        }
        catch(err){
            console.error("Could not add country: ", err);
            return false;
        }
        
    }
    async deleteCity(cityId) {
        const res = await this.conn.execute(
            `DELETE FROM city WHERE id = ${cityId}`
        );
        console.log(res);
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
            return result;
        } catch (err) {
            console.error("Error deleting country:", err);
            return false;
        }
    }
    /* Update a city name */
    async  updateCityName(cityId, newName) {
        try {
            const sql = `UPDATE city SET Name = '${newName}' WHERE ID = ${cityId}`;
            const [result] = await this.conn.execute(sql);
            return result;
        } catch (err) {
            console.error("Error updating city name:", err);
            return false;
        }
    }

    /* Update a country name */
    async updateCountryName(countryCode, newName) {
        try {
            const sql = `UPDATE country SET Name = '${newName}' WHERE Code = '${countryCode}'`;
            const [result] = await this.conn.execute(sql);
            return result;
        } catch (err) {
            console.error("Error updating country name:", err);
            return false;
        }
    }
    
    /* Update a contient name */
    async updateContinentName(oldContinentName, newContinentName) {
        try {
            const sql = `UPDATE country SET Continent = '${newContinentName}' WHERE Continent = '${oldContinentName}'`;
            const [result] = await this.conn.execute(sql);
            return result;
        } catch (err) {
            console.error("Error updating continent name:", err);
            return false;
        }
    }
}