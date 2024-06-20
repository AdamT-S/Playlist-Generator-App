export default class City {
	id;
	name;
	region;
	countryCode;
	district;
	country;
	continent;
	population;

	constructor(id, name, region, countryCode, district, population, country, continent) {
		this.id = id;
		this.name = name;
		this.region = region;
		this.countryCode = countryCode;
		this.district = district;
		this.population = population;
		this.country = country;
		this.continent = continent;
	}
}
