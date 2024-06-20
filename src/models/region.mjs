export default class Region {
	owningContinent;
	name;
	population;

	constructor(owningContinent, name, population) {
		this.owningContinent = owningContinent;
		this.name = name;
		this.population = population;
	}
}
