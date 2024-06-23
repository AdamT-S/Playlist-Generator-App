export default class Country {
	code;
	name;
	continent;
	region;
	numberOfCities;
	capitalCity;
	population;
	cityResidents;
	cityResidentsPer;
	countrysideResident;
	countrysideResidentsPer;

	constructor(
		code,
		name,
		continent,
		region,
		population,
		numberOfCities,
		capitalCity,
		cityResidents,
		cityResidentsPer,
		countrysideResident,
		countrysideResidentsPer,
	) {
		this.code = code;
		this.name = name;
		this.continent = continent;
		this.region = region;
		this.numberOfCities = numberOfCities;
		this.capitalCity = capitalCity;
		this.population = population;
		this.cityResidents = cityResidents;
		this.cityResidentsPer = cityResidentsPer;
		this.countrysideResident = countrysideResident;
		this.countrysideResidentsPer = countrysideResidentsPer;
	}
}
