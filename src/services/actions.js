// Function to show only 'N' records from the database
function updateLimit() {
	let limitInput = document.querySelector('.N');
	let N = limitInput.value;
	console.log(`n client ${N}`);
	if (!window.location.search) {
		window.location.href = window.location.href + `?N=${N}`;
	} else {
		const search = window.location.search;
		window.location.search = search.replace('?', `?N=${N}&`);
	}
}
// Function to filter the records
function filter() {
	let filterCity = document.querySelector('input[name="filterCity"]');
	let filterDistrict = document.querySelector('input[name="filterDistrict"]');
	let filterCountry = document.querySelector('input[name="filterCountry"]');
	let filterRegion = document.querySelector('input[name="filterRegion"]');
	let filterContinent = document.querySelector('input[name="filterContinent"]');
	let filterCityV = filterCity.value;
	let filterDistrictV = filterDistrict.value;
	let filterCountryV = filterCountry.value;
	let filterRegionV = filterRegion.value;
	let filterContinentV = filterContinent.value;
	console.log(`filterCity ${filterCityV}`);
	console.log(`filterDistrictV ${filterDistrictV}`);
	console.log(`filterCountryV ${filterCountryV}`);
	console.log(`filterRegionV ${filterRegionV}`);
	console.log(`filterContinentV ${filterContinentV}`);

	window.location.href =
		window.location.pathname +
		`?filterCity=${filterCityV}&filterDistrict=${filterDistrictV}&filterCountry=${filterCountryV}&filterRegion=${filterRegionV}&filterContinent=${filterContinentV}`;
	[filterCityV, filterCountryV, filterContinentV] = [0, 0, 0];
}

// Function to set a cookie
function setCookie(name, value, days) {
	let expires = '';
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	}
	// Set the domain to 'localhost' and the path to '/'
	let domain = 'localhost';
	let path = '/'; // Set to the root path

	document.cookie =
		name + '=' + (value || '') + expires + '; path=' + path + '; domain=' + domain;
}

// Function to get a cookie value by name
function getCookie(name) {
	let nameEQ = name + '=';
	let cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i];
		while (cookie.charAt(0) == ' ') {
			cookie = cookie.substring(1, cookie.length);
		}
		if (cookie.indexOf(nameEQ) == 0) {
			return cookie.substring(nameEQ.length, cookie.length);
		}
	}
	return null;
}

// Function to check cookies after initial loading page
const checkFromCookies = () => {
	const currentPage = document.documentElement;
	let status = getCookie('logged');
	console.log('logged?: ', status);
	if (status == 'true') {
		// document.querySelector('.stocksElement').style.display = 'block';
		currentPage.style.setProperty('--loginStatus', `block`);
	} else {
		// 	document.querySelector('.stocksElement').style.display = 'none';
		currentPage.style.setProperty('--loginStatus', `none`);
	}
};

document.addEventListener('DOMContentLoaded', (event) => {
	checkFromCookies();

	if (window.location.pathname == '/login') {
		const email = document.querySelector('input[type="email"]');
		email.addEventListener('change', (e) => console.log('email: ', e.target.value));
		const password = document.querySelector('input[type="password"]');
		password.addEventListener('change', (e) => console.log('password: ', e.target.value));

		const btn = document.querySelector('button[type="submit"]');
		btn.prevent;
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			console.log('email.value : ', email.value);
			console.log('password.value : ', password.value);
			if (email.value == 'a@gmail.com' && password.value == 'a') {
				setCookie('logged', 'true', 1);
				checkFromCookies();
				window.location.href = '/continents';
			} else {
				setCookie('logged', 'false', 1);
				checkFromCookies();
			}
		});
	}
});
