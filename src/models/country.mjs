export default class Country {
	code;
	name;
	continent;
	region;
	population;
	numberOfCities;

	constructor(code, name, continent, region, population, numberOfCities) {
		this.code = code;
		this.name = name;
		this.continent = continent;
		this.region = region;
		this.population = population;
		this.numberOfCities = numberOfCities;
	}
}
