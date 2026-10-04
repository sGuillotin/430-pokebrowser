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
const getAllPokemon = (request, response) => {
  respondJSON(request, response, 200, {
    status: 200,
    'Content-Length': Buffer.byteLength(JSON.stringify(pokemon), 'utf8'),
    pokemon
  });
};

// get names only
const getPokemonNames = (request, response) => {
  // how to check for queryparams if they come in via client form? pass via client?
  //   - (how to handle request.body?)
  // Object.values is redundant, .entries() and .keys() do not work

  // console.log(Object.values(pokemon).map(p => p.name));
  const allNames = pokemon.map(p => p.name);
  console.log(allNames);

  // if(request.query.valid === "true") -- API1 sample

  // check for bad data?
  // guiding comment w regex for weaknesses list?

  // 1 - filter the data
  // 2 - return names

  // set type filter to all as default value
  // if(!request.query.type){
  //   request.query.type = "";
  // }

  const result = pokemon
    // type
    // .filter(p => p.type.includes("Fire")) // works
    // .filter(p => p.type.includes(`${request.query.type}`)) // can't read properties of undefined
    // why is request.query undefined?????? TODO explore
    
    // weaknesses
    // .filter(p => p.weaknesses.includes(`${request.query.weaknesses}`))
    
    // return names only
    // .map(p => `name: ${p.name},/ntype: ${p.type},/nweaknesses: ${p.weaknesses}`)
    .map(p => p.name)
  ;
    

  respondJSON(request, response, 200, {
    status: 200,
    'Content-Length': Buffer.byteLength(JSON.stringify(result), 'utf8'),
    result
  });
};

// search all
const searchAllPokemon = (request, response) => {
  return(request, response, 200, {
    sorry: "this method is not yet available. please return soon!",
    id: "notImplemented"
   });
};

// search single
const searchSinglePokemon = (request, response) => {
  return(request, response, 501, {
    sorry: "this method is not yet available. please return soon!",
    id: "notImplemented"
   });
};


// ---------- POST requests --------------------------
const addPokemon = (request, response) => {
  return(request, response, 501, {
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

  return respondJSON(request, response, 204, {});
  */
};

// modify by name
const modifyPokemon = (request, response) => {
  return(request, response, 501, {
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