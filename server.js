require('dotenv').config(); //reads the .env file and adds values to 'process.env' object
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const POXEDEX = require('./pokedex.json');

const morganSetting = process.env.NODE_ENV === 'production'
    ? 'tiny'
    : 'common'

app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());
// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production'){
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 8000;
// Valid types of pokemon
const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

/**
 * validateBearerToken
 * 
 */
const validateBearerToken = (req, res, next)  => {
    const authVal = req.get('Authorization')

    if(!authVal){
        return res.status(400).json({error: 'Unauthorized request'});
    }

    if (!authVal.startsWith('Bearer ')){
        return res.status(400).send('Must include Bearer token')
    }

    //returns an array with two elements. token is second element
    const token = authVal.split(' ')[1]
    if(token !== API_TOKEN){
        return res.status(401).json({message: 'invalid credentials'})
    }

    next();
}

/**
 * handleTypes
 * returns a response with valid Pokemon types
 */
const handleTypes = (req, res) => {
    res.json(validTypes)       
}


/**
 * handlePokemon
 */
const handlePokemon = (req,res) => {
    // initialize response object
    let response = POXEDEX.pokemon;
    // Get query parameters
    let {name, type} = req.query;

    // Validate query params
    // check if type key exists without a value
    if(type === ''){
        res.status(400).send(`'type' must have a value if included`)
    }
    // check if type is one of the valid options
    if(type && !validTypes.includes(type)){
        res.status(400).send(`'type' value must match one of the valid types. See valid types at the endpoint /types`)
    }
    // check if name key exists without a value
    if(name === ''){
        res.status(400).send(`'name' must have a value if included`)
    }
    // Perform logic & construct response
    if(type){
        response = response.filter(pokemon => pokemon.type.includes(type))
    }
    if(name){
        response = response.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))
    }

    // Send response
    return res.json(response)
}

app.use(validateBearerToken); // use validation handler for ALL endpoints 

/**
 * Endpoint: /
 * directs client to useful endpoints
 */
app.get('/', (req, res) => {
    return res
        .status(200)
        .send('I see you. I hear you. Nothing here though. Please try /types or /pokemon ')
})


/**
 * Endpoint: /types
 * returns a alist of all the valid types of pokemon
 */
app.get('/types', handleTypes);

/**
 * Endpoint: /pokemon
 * Query Option: 'name' - searching for whether the Pokemon's name includes a specific string. case insensitive.
 * Query Option: 'type' - must be one of the valid types. 
 * w/o query options: Returns an array of full pokedex entries
 *
 */
app.get('/pokemon', handlePokemon)


// run that server, doge 🐕
app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`)
})