
export default class DatabaseService {
    conn;

    constructor(conn) {
        this.conn = conn;
    }

     /* Delete a city by ID */
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
}