
export default class DatabaseService {
    conn;

    constructor(conn) {
        this.conn = conn;
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