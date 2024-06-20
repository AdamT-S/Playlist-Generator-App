
export default class DatabaseService {
    conn;

    constructor(conn) {
        this.conn = conn;
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

}