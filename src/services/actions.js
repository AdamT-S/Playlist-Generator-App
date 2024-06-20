function updateLimit() {
	let limitInput = document.querySelector('.data_li:nth-child(1) .data_filter');
	let N = limitInput.value;
	console.log(`n client ${N}`);

	window.location.href = window.location.pathname + `?N=${N}`;
}
