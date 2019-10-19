

if(process.env.NODE_ENV === 'production')
{
	//var Key = process.env.API_KEY
	var KeyMapbox = process.env.MAPBOX
	var KeyDarkSky = process.env.DARKSKY
}
else
{
	const credentials = require('./credentials.js')
	var KeyMapbox = credentials.MAPBOX_TOKEN
	var KeyDarkSky = credentials.DARK_SKY_SECRET_KEY
}


//const credentials = require('./credentials.js')

const request = require('request')

const express = require('express')

const app = express()

const port = process.env.PORT || 3000

// https://api.darksky.net/forecast/[key]/[latitude],[longitude]
//"https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=YOUR_MAPBOX_ACCESS_TOKEN"
//credentials.MAPBOX_TOKEN
//credentials.DARK_SKY_SECRET_KEY

const geocode = function(ciudad,callback)
{

	const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + ciudad + '.json?type=place&limit=1&access_token=' + KeyMapbox

	request({url, json: true}, function(error, response) 
	{ 
		if(error)
		{
			console.log('Error, checar internet')
		}
		else
		{
			if(response.body.features == undefined)
			{
				console.log('Error, Llave de Mapbox equivocada')
			}
			else
			{
				if(ciudad == response.body.features[0].text)
				{
					const data = response.body.features
					const Lon = data[0].center[0]
					const Lat = data[0].center[1]	

					callback(Lat,Lon,ciudad)

				}
				else
				{
					console.log("Error, Ciudad mal escrita /o no especificada")

				}
				
			}

			
		}
		
	})

}

const geocode2 = function (Lat, Lon, Cd,callback)
{
	const url = 'https://api.darksky.net/forecast/'+KeyDarkSky+'/'+Lat+','+Lon+'?lang=es&units=si'

	request({url, json: true}, function(error, response) 
	{ 
		if(error)
		{
			console.log('Error, checar internet')
		}
		else
		{
			if(response.body.currently == undefined)
			{
				console.log('Error, Llave de DarkSky equivocada ')
			}
			else
			{
				info = response.body
				Ahorita = info.hourly.summary
				Temp = info.currently.temperature
				StT = 'Actualmente esta a '+Temp+'°C.'
				Lluvia = info.currently.precipProbability
				StLL = 'Hay '+Lluvia+'% de posibilidad de lluvia.'
				StringFinal = Ahorita+StT+StLL+'('+Cd+')'

				callback(StringFinal)
			}
		}
		
	})
}


/*
geocode('Monterrey', function(Lat,Lon,Cd) 
{
	geocode2(Lat,Lon,Cd, function(Mensaje)
	{
		console.log(Mensaje)
	})

})
*/

app.get('', function(req, res){
	res.send({
		greeting: 'Hola Mundo',
		P : req.query.search
	})


})


app.get('/weather', function(req,res){


	if (!req.query.search )
	{
		res.send({
		error: "debes enviar el nombre de una ciudad"
		})
	}
	

	
	console.log(req.query.search)

	geocode(req.query.search, function(Lat,Lon,Cd) 
	{
		geocode2(Lat,Lon,Cd, function(Mensaje)
		{

			res.send({
			 Ciudad : req.query.search,
			 Todo : Mensaje
			})
			console.log(Mensaje)
		})

	})
	

	
})

app.get('*', function(req, res){
	res.send({
		error: "Ruta no valida"
	})
})

app.listen(port, function(){
	console.log('Comenzo este pez')
})