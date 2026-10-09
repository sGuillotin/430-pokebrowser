// In-memory data store: cleared when Node restarts
// pokemon is like our const users = {};
// PUT POKEDEX HERE!!
const fs = require('fs');   // import filesystems module
const pokemon = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));
// console.log("pokemon", pokemon);
// regex for negating filters - may or may not use outside getPokemonNames
const startsWithNot = /^!/;


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
// full objects - tweaked
// no filtering
const getAllPokemon = (request, response) => {
  const result = pokemon
  .map(p => ({
    name: p.name,
    id: p.id,
    type: p.type,
    weaknesses: p.weaknesses,
    height: p.height,
    weight: p.weight,
  }));

  respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(pokemon), 'utf8'),
    message: result
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

  let result;

  if (!request.query.type && !request.query.weakness) {
    result = pokemon.map(p => p.name); // just get the names
  } else {
    result = pokemon.filter(p => p); // shallow copy pokemon + remove falsy elements
    // note: renaming Pikachu will still modify pokemon, since it's a shallow copy

      // type
      // .filter(p => p.type.includes("Fire")) // works
      if(request.query.type){
        result = result.filter(p => p.type.includes(request.query.type));
        // enter as ?type=Fire
        // make case-insensitive using regex?
        console.log("type filtered");
      }

      // weakness
      if(request.query.weakness){
        result = result.filter(p => p.weaknesses.includes(request.query.weakness));
        // &weakness=Water
        console.log(`${request.query.weakness} weakness filtered`);
      } else if(startsWithNot.test(request.query.weakness)){
        result = result.filter(p => !p.weaknesses.includes(request.query.weakness));
        console.log("!weakness filtered");
      }

      // return names only
      result = result.map(p => p.name);
  }

  // console.log(pokemon);

  respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(result), 'utf8'),
    message: result
  });
};

// search all pokemon
// sends full objects
// filter by type, weaknesses
const searchAllPokemon = (request, response) => {
  let result;

  if (!request.query.type && !request.query.weakness) {
    result = pokemon.map(p => p.name); // just get the names
  } else {
    result = pokemon.filter(p => p); // shallow copy pokemon + remove falsy elements
    // note: renaming Pikachu will still modify pokemon, since it's a shallow copy

      // type
      // .filter(p => p.type.includes("Fire")) // works
      if(request.query.type){
        result = result.filter(p => p.type.includes(request.query.type));
        // enter as ?type=Fire
        // make case-insensitive using regex?
        console.log("type filtered");
      }

      // weakness
      if(request.query.weakness){
        result = result.filter(p => p.weaknesses.includes(request.query.weakness));
        // &weakness=Water
        console.log(`${request.query.weakness} weakness filtered`);
      } else if(startsWithNot.test(request.query.weakness)){
        result = result.filter(p => !p.weaknesses.includes(request.query.weakness));
        console.log("!weakness filtered");
      }

    // return full objects - no name mapping here
    // simplify the output objects + rearrange id
    result = result.map(p => ({
      name: p.name,
      id: p.id,
      type: p.type,
      weaknesses: p.weaknesses,
      height: p.height,
      weight: p.weight,
    }));
  }

  respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(result), 'utf8'),
    message: result
  });
};

// search single pokemon by name
// respond with full object
const searchSinglePokemon = (request, response) => {

  let result;

  console.log("searching single", request.query.name);

  if (!request.query.name) {
    // return 400, no name provided!
    return respondJSON(request, response, 400, {
      status: 400,
      message: "Please enter a name.",
      id: "noName"
    });
  } else {
    // search by name for full pokemon object
    result = pokemon
      .filter(p => p.name === request.query.name);

    // handle result = nothing (no matches) here
    if(!result || result.length === 0){
      return respondJSON(request, response, 400, {
        status: 400,
        message: "no matches found. Please try again and use the format 'Name'",
        id: "noMatchFound"
      });
    }
  }

  // simplify the output objects + rearrange id
  result = result.map(p => ({
    name: p.name,
    id: p.id,
    type: p.type,
    weaknesses: p.weaknesses,
    height: p.height,
    weight: p.weight,
    'next-evolution': p.next_evolution
  }));


  respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(result), 'utf8'),
    message: result
  });
};


// ---------- POST requests --------------------------
const addPokemon = (request, response) => {
  respondJSON(request, response, 501, {
    status: 501,
    message: "this method is not yet available. please return soon to create your own pokemon.",
    id: "notImplemented"
  });

  // 1 - check if name exists
  // just check in data or use searchSinglePokemon?

  // 2 - create entry

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
    status: 501,
    message: "this method is not yet available. please return soon!",
    id: "notImplemented"
  });

  // post request idk pokemon[request.name] = { request.body }

  // 1 - check if name exists
  // searchSinglePokemon.response.status === 200

  // 2 - edit pokemon obj
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