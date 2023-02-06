# Weather App
## Description
This project is basically a web app that displays the weather conditions of the user's location. Users can also search for the weather condition of a different location by name. All of these is made possible via integration of the OpenWeatherMap API. Also, the user's location is access via the GeoLocation API (accessible on the browser).
## How to run this project
This project can be viewed on .... but if you want to run it locally, you can do so by following these steps.
- Clone the repo.
- Run <i>yarn install</i> or <i>npm install</i> (You may have to delete the yarn.lock file to avoid conflicts if you opt in for npm)
- Create an account with OpenWeatherMap API and generate an access key
- Set an environment variable with variable name of <i>OPEN_WEATHER_API_KEY</i>, assign your access key to this. Also create another variable <i>PORT</i> to specify the port on which the localhost will run. Since we are running this locally, we can set this up easily with <i>dotenv</i>.
- Run <i>yarn run dev</i> (or <i>npm run dev</i>) to start the development server.
### Extras
The <i>start</i> script in the package.json file is meant for use in production but you can still use it locally. Before using it, you should run the <i>build</i> script first, this transpiles the typescript files to javascript. Without this, the <i>start</i> script will fail, as it is setup to start the server from the transpiled javascript files.

You can also run tests by running <i>yarn run test</i> (or <i>npm run test</i>)
## Credits
OpenWeatherMap API