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
    status: 404,
    message: 'The resource you are looking for was not found.',
    id: 'notFound',
  });
};


const badJSON = (request, response) => {
  respondJSON(request, response, 400, {
    status: 400,
    message: 'Request body part(s) were missing or in an invalid format.',
    id: 'invalidDataFormat',
  });
};


// ----------- Endpoints -----------------------------
// get all pokemon
// full objects
// no filtering
const getAllPokemon = (request, response) => {
  respondJSON(request, response, 200, {
    status: 200,
    'Content-Length': Buffer.byteLength(JSON.stringify(pokemon), 'utf8'),
    pokemon
  });
};

// get pokemon names only
// filter by type, weaknesses
const getPokemonNames = (request, response) => {
  // how to check for queryparams if they come in via client form? pass via client?
  //   - (how to handle request.body?)
  // Object.values is redundant, .entries() and .keys() do not work
  // .includes`"${request.query.type}"` is repetitive :)


  // check for bad data?
  // guiding comment w regex for weaknesses list?
  // set type filter to all as default value?

  // 1 - filter the data
  // 2 - return names

  let result = pokemon.filter(p => p); // shallow copy pokemon

  if (!request.query.type && !request.query.weakness) {
    result = pokemon
      .map(p => p.name)
    ;
  } else {
    result = pokemon;
      // type
      // .filter(p => p.type.includes("Fire")) // works
      if(request.query.type){
        result = result.filter(p => p.type.includes(request.query.type));
        // enter as ?type=Fire
        console.log("type filtered");
      }

      // weakness
      if(request.query.weakness){
        result = result.filter(p => p.weaknesses.includes(request.query.weakness));
        // &?weakness=Water
        console.log("weakness filtered");
      }

      // return names only
      result = result.map(p => p.name);
  }

  // console.log(pokemon);

  respondJSON(request, response, 200, {
    status: 200,
    'Content-Length': Buffer.byteLength(JSON.stringify(result), 'utf8'),
    result
  });
};

// search all pokemon
// sends full objects
// filter by type, weaknesses
const searchAllPokemon = (request, response) => {
  respondJSON(request, response, 200, {
    sorry: "this method is not yet available. please return soon!",
    id: "notImplemented"
  });
};

// search single pokemon by name
// respond with full object
const searchSinglePokemon = (request, response) => {

  let result;

  if (!request.query.name) {
    // return 400, no name provided!
    respondJSON(request, response, 400, {
      error: "Please enter a name.",
      id: "noName"
    });
  } else {
    // search by name for full pokemon object
    result = pokemon
      .filter(p => p.name === request.query.name);
  }

  respondJSON(request, response, 200, {
    status: 200,
    'Content-Length': Buffer.byteLength(JSON.stringify(result), 'utf8'),
    result
  });
};


// ---------- POST requests --------------------------
const addPokemon = (request, response) => {
  respondJSON(request, response, 501, {
    sorry: "this method is not yet available. please return soon to create your own pokemon.",
    id: "notImplemented"
  });

  /*
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

  return respondJSON(request, response, 204, {}); // successful, no response
  */
};

// modify by name
const modifyPokemon = (request, response) => {
  respondJSON(request, response, 501, {
    sorry: "this method is not yet available. please return soon!",
    id: "notImplemented"
  });

  // post request idk pokemon[request.name] = { request.body }
};

module.exports = {
  notFound,
  badJSON,
  getAllPokemon,
  getPokemonNames,
  searchAllPokemon,
  searchSinglePokemon,
  addPokemon,
  modifyPokemon
};