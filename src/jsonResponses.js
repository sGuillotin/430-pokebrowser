// In-memory data store: cleared when Node restarts
// pokemon is like our const users = {};
// PUT POKEDEX HERE!!
const fs = require('fs');   // import filesystems module
const pokemon = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));
// console.log("pokemon", pokemon);


// Sends a JSON response. HEAD requests and 204 responses get no body.
const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};


// ----------- Errors --------------------------------
const notFound = (request, response) => {
  respondJSON(request, response, 404, {
    message: 'The resource you are looking for was not found.',
    id: 'notFound',
  });
};


const badJSON = (request, response) => {
  respondJSON(request, response, 400, {
    message: 'Request body part(s) were missing or in an invalid format.',
    id: 'invalidDataFormat',
  });
};


// ----------- Endpoints -----------------------------
const getAllPokemon = (request, response) => {
  respondJSON(request, response, 200, { pokemon });
};


const getPokemonNames = (request, response) => {
  // how to check for queryparams if they come in via client form? pass via client?
  // TODO filtering next
  // console.log(Object.values(pokemon).filter(entry => entry));
  console.log(pokemon.filter(entry => entry.name)); // everything with a name
  console.log(pokemon.filter(entry.name)); // error

  respondJSON(request, response, 200, { pokemon });
};



const addPokemon = (request, response) => {
  return(request, response, 501, { message: "this method is not yet available. please return soon to create your own pokemon." });

  const { name, age } = request.body;

  const missingName = !name;
  const missingAge = age === undefined || age === null || age === '';

  if (missingName || missingAge) {
    return respondJSON(request, response, 400, {
      message: 'Name and age are both required.',
      id: 'addPokemonMissingParams',
    });
  }

  let responseCode = 204;

  if (!users[name]) {
    responseCode = 201;
    users[name] = { name };
  }

  users[name].age = age;

  if (responseCode === 201) {
    return respondJSON(request, response, 201, { message: 'Created Successfully' });
  }

  return respondJSON(request, response, 204, {});
};



module.exports = {
  notFound,
  badJSON,
  getAllPokemon,
  getPokemonNames,

  addPokemon
};