export default class District {
	owningCountryCode;
	name;
	population;

	constructor(owningCountryCode, name, population) {
		this.owningCountryCode = owningCountryCode;
		this.name = name;
		this.population = population;
	}
}
