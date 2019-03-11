'use strict'

// Poly for IE, used in binlookup
var assign = require('object-assign')

if (Object.assign === undefined)
	Object.assign = assign

var AsyncCache = require('async-cache')
var lookup = require('binlookup')()
var ga = require('./ga')

ga('create', 'UA-41149323-1', 'auto')
ga('send', 'pageview')

var cache = new AsyncCache({
	load: lookup,
});

var $form = document.querySelector('section.lookup form')
var $iin = $form.querySelector('input.iin')

var blueprint = {
	number: {},
	scheme: null,
	type: null,
	brand: null,
	prepaid: null,
	country: null,
	bank: null,
}

$form.addEventListener('submit', function (e) {
	e.preventDefault()

	submit()
})

$iin.addEventListener('input', function (e) {
	submit()
})

function submit() {
	var prefix = (($iin.value.match(/[0-9]+/g) || []).join('').match(/(.{1,4})/g) || []).join(' ')

	setValue($iin, prefix)

	if (prefix.length < 4)
		return render(blueprint)

	cache.get(prefix.replace(/ /g, ''), function (err, range) {
		if (err)
			return render(blueprint)

		if ($iin.value === prefix)
			render(range)
	})
}

function setValue($node, value) {
	if ($node.setSelectionRange) {
		var start = $node.selectionStart
		var end = $node.selectionEnd

		if (start === $node.value.length) {
			start += value.length - $node.value.length
			end += value.length - $node.value.length
		}
	}

	$node.value = value

	if ($node.setSelectionRange)
		$node.setSelectionRange(start, end)

	return value
}

var $result = document.querySelector('ul.result')
var $scheme = $result.querySelector('li.scheme p')
var $brand = $result.querySelector('li.brand p')
var $numberLength = $result.querySelector('li.number li.length p')
var $numberLuhn = $result.querySelectorAll('li.number li.luhn ol li')
var $type = $result.querySelectorAll('li.type ol li')
var $prepaid = $result.querySelectorAll('li.prepaid ol li')
var $countryName = $result.querySelector('li.country p.name')
var $countryGeoLat = $result.querySelector('li.country p.geo span.latitude')
var $countryGeoLon = $result.querySelector('li.country p.geo span.longitude')
var $bankName = $result.querySelector('li.bank p.name')
var $bankUrl = $result.querySelector('li.bank p.url')
var $bankUrlLink = $result.querySelector('li.bank p.url a')
var $bankPhone = $result.querySelector('li.bank p.phone')

function render(range) {
	if (range.scheme) {
		$scheme.classList.remove('any')
		$scheme.textContent = range.scheme.substr(0, 1).toUpperCase() + range.scheme.substr(1)
	} else {
		$scheme.classList.add('any')
		$scheme.textContent = ''
	}

	if (range.brand) {
		$brand.classList.remove('any')
		$brand.textContent = range.brand
	} else {
		$brand.classList.add('any')
		$brand.textContent = ''
	}

	if (range.number.length) {
		$numberLength.classList.remove('any')
		$numberLength.textContent = range.number.length
	} else {
		$numberLength.classList.add('any')
		$numberLength.textContent = ''
	}

	renderBoolean($numberLuhn, range.number.luhn)
	renderList($type, range.type)
	renderBoolean($prepaid, range.prepaid)

	if (range.country) {
		$countryName.classList.remove('any')
		$countryGeoLat.classList.remove('any')
		$countryGeoLon.classList.remove('any')
		$countryName.textContent = range.country.emoji + ' ' + range.country.name
		$countryGeoLat.textContent = range.country.latitude
		$countryGeoLon.textContent = range.country.longitude
	} else {
		$countryName.classList.add('any')
		$countryGeoLat.classList.add('any')
		$countryGeoLon.classList.add('any')
		$countryName.textContent = ''
		$countryGeoLat.textContent = ''
		$countryGeoLon.textContent = ''
	}

	if (range.bank && range.bank.name) {
		$bankName.classList.remove('any')
		$bankName.textContent = range.bank.name + (range.bank.city ? ', ' + range.bank.city : '')
	} else {
		$bankName.classList.add('any')
		$bankName.textContent = ''
	}

	if (range.bank && range.bank.url) {
		$bankUrl.classList.remove('any')
		$bankUrlLink.textContent = range.bank.url
		$bankUrlLink.setAttribute('href', 'http://' + range.bank.url)
	} else {
		$bankUrl.classList.add('any')
		$bankUrlLink.textContent = ''
		$bankUrlLink.setAttribute('href', '')
	}

	if (range.bank && range.bank.phone) {
		$bankPhone.classList.remove('any')
		$bankPhone.textContent = range.bank.phone
	} else {
		$bankPhone.classList.add('any')
		$bankPhone.textContent = ''
	}
}

function renderBoolean($s, value) {
	Array.prototype.forEach.call($s, function ($) {
		if ($.classList.contains('yes') && value === true
			|| $.classList.contains('no') && value === false) {
			$.classList.add('selected')
		} else {
			$.classList.remove('selected')
		}
	})
}

function renderList($s, value) {
	Array.prototype.forEach.call($s, function ($) {
		if ($.dataset.value === value) {
			$.classList.add('selected')
		} else {
			$.classList.remove('selected')
		}
	})
}
