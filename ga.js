'use strict';

var addScript = require('add-script');

module.exports = add;

add.init = init;

add.q = [];

add.l = Date.now();

if (typeof window !== 'undefined')
	window.GoogleAnalyticsObject = 'ga';

function add(){
	if (!window.ga)
		init();

	if (window.ga === add)
		add.q.push(arguments);
	else
		window.ga.apply(ga, arguments);
}

function init(){
	if (typeof window !== 'undefined' && window.document)
		addScript('https://www.google-analytics.com/analytics.js');

	window.ga = add;
}
