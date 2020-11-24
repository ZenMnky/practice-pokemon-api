require('dotenv').config(); //reads the .env file and adds values to 'process.env' object
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const helmet = require('helmet');

app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

const API_TOKEN = process.env.API_TOKEN;
const PORT = 8000;

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

// Valid types of pokemon
const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

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
    const {name, type} = req.query;
    return res.status(200).send('Request successful! Endpoint is still under development')
}

// 🚧 use validation handler for ALL endpoints 🚧
app.use(validateBearerToken);

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
    console.log(`Server started at http://localhost:${PORT}`)
})