// In-memory data store: cleared when Node restarts
// pokemon is like our const users = {};
// PUT POKEDEX HERE!!
const fs = require('fs');   // import filesystems module
const pokemon = JSON.parse(fs.readFileSync(`${__dirname}/../data/pokedex.json`));
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

// ------------- Endpoint helper methods -----------
/**
 * simplifies incoming pokemon object(s), rearranges a little, removes img attr
 * @param {*} result JSON object
 * @returns 
 */
const simplifyPokeObj = (result) => {
  return result.map(p => ({
    name: p.name,
    id: p.id,
    type: p.type,
    weaknesses: p.weaknesses,
    height: p.height,
    weight: p.weight,
    'next-evolution': p.next_evolution
  }));
}

// ----------- Endpoints -----------------------------
// get all pokemon
// full objects - tweaked
// no filtering
const getAllPokemon = (request, response) => {
  // simplify the output object(s) + rearrange id
  // reformat and simplify entire pokemon obj
  const result = simplifyPokeObj(pokemon);

  respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(pokemon), 'utf8'),
    message: result
  });
};

// search all pokemon
// send names only
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

  // if no filters
  if (!request.query.type && !request.query.weakness) {
    result = pokemon.map(p => p.name); // return all names
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

    // simplify the output object(s) + rearrange id
    result = simplifyPokeObj(result);
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
        id: "noSearchMatchFound"
      });
    }
  }

  // simplify the output object(s) + rearrange id
  result = simplifyPokeObj(result);

  return respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(result), 'utf8'),
    message: result
  });
};


// ---------- POST requests --------------------------
const addPokemon = (request, response) => {
  // if no name or id
  if(!request.body.name || !request.body.id){
    return respondJSON(request, response, 400, {
      status: 400,
      message: "Please enter a Name and an ID to create your pokemon.",
      id: 'noNameAndIDToCreate'
    });
  }


  console.log("name", request.body.name);
  console.log("id", request.body.id);
  // does the name already exist?
  // filter pokemon for name, see if length of result is 0
  const nameExists = pokemon.filter(p => p.name === request.body.name).length !== 0;
  const idExists = pokemon.filter(p => p.id == request.body.id).length !== 0;


  if(nameExists && idExists){
    return respondJSON(request, response, 400, {
      status: 400,
      message: "This Name and ID are already in use. Please choose your own ID and name.",
      id: "pleasePickYourOwnIdName"
    });
  } else if(nameExists){
     return respondJSON(request, response, 400, {
      status: 400,
      message: "A pokemon by this name already exists. Please choose your own!",
      id: "pickYourOwnName"
    });
  // check if id already exists
  } else if(idExists){
     return respondJSON(request, response, 400, {
      status: 400,
      message: "Another pokemon is already using this ID. Please choose your own!",
      id: "pickYourOwnId"
    });
  }


  // add entry
  pokemon[request.body.id] = {
    // id: request.body.id ? request.body.id : pokemon.length,
    id: request.body.id,
    name: request.body.name,
    type: request.body.type,
    height: request.body.height,
    weight: request.body.weight,
    weaknesses: request.body.weakness
  };

  // respondJSON( 201 Created ) blah blah
  respondJSON(request, response, 201, {
    status: 201,
    message: `Pokemon created! ${pokemon[request.body.id]}`
  })



  // 1 - check if name exists
  // just check in data or use searchSinglePokemon?

  // 2 - create entry

    // name: p.name,
    // id: p.id,
    // type: p.type,
    // weaknesses: p.weaknesses,
    // height: p.height,
    // weight: p.weight,

    // height as "X m"   weight as "Y kg"


    // "id": 1,
    // "num": "001",
    // "name": "Bulbasaur",
    // "img": "http://www.serebii.net/pokemongo/pokemon/001.png",
    // "type": [
    //   "Grass",
    //   "Poison"
    // ],
    // "height": "0.71 m",
    // "weight": "6.9 kg",
    // "weaknesses": [
    //   "Fire",
    //   "Ice",
    //   "Flying",
    //   "Psychic"
    // ],


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

  //if dne, creates entry
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

  console.log("Modifying:", request.body.name);
  const nameExists = pokemon.filter(p => p.name === request.body.name).length !== 0;
  
  // 1 - check if name exists
  if(!nameExists){
    return respondJSON(request, response, 400, {
      status: 400,
      message: "No matches found under that name. Please try again and use the format 'Name'",
      id: 'noEditMatchFound'
    });
  }

  // if no data
  if(!request.body.id && !request.body.newName && !request.body.type && !request.body.height && !request.body.weight && !request.body.weakness){
    return respondJSON(request, response, 400, {
      status: 400,
      message: "No data entered. Please enter at least one field to change.",
      id: 'noNewData'
    });
  }
  
  // access match - find restructures(?) pokemon to be accessible
  const match = pokemon.find(p => p.name === request.body.name);

  // 2 - edit existing pokemon obj
  // modify entry by index in pokemon array of objs (id)
  // use ternary operators to fallback on defaults (attr: this ? condition : else)
  pokemon[match.id - 1] = {
    id: request.body.id ? Number(request.body.id) : match.id,
    name: request.body.newName ? request.body.newName : match.name,
    type: request.body.type ? request.body.type : match.type,
    height: request.body.height ? request.body.height : match.height,
    weight: request.body.weight ? request.body.weight : match.weight,
    weaknesses: request.body.weakness ? request.body.weakness : match.weaknesses
  };

  // respondJSON( 201 Created ) blah blah
  return respondJSON(request, response, 200, {
    status: 200,
    message: `Pokemon modified successfully: ${JSON.stringify(pokemon[match.id-1])}`
  })
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