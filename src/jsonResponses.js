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

/**
 * respondJSON for simple 200, "message: result" scenarios
 */
const simpleSuccess = (request, response, result) => {
  respondJSON(request, response, 200, {
    status: 200,
    contentLength: Buffer.byteLength(JSON.stringify(result), 'utf8'),
    message: result
  });
}

/**
 * respondJSON for 400 requests
 */
const respond400 = (message, id, request, response) => {
  respondJSON(request, response, 400, {
    status: 400,
    message: message,
    id: id
  });
}

// filter by type or weakness
// const filterBy = (request, result, filterCat) => {
//   if(request.query[filterCat]){
//     console.log("filtered by", request.query[filterCat]);
//     result = result.filter(p => p[filterCat].includes(request.query[filterCat]));
//   }
//   return result;
// }

// filter by type
const filterType = (request, result) => {
  if(request.query.type){
    console.log("filtered by", request.query.type);
    result = result.filter(p => p.type.includes(request.query.type));
  }
  return result;
}

// filter by weakness (separate function because of difference in weakness and weaknesses)
const filterWeakness = (request, result) => {
  if(request.query.weakness){
    result = result.filter(p => p.weaknesses.includes(request.query.weakness));
    console.log(`${request.query.weakness} weakness filtered`);
  }
  return result;
}



// ----------- Endpoints -----------------------------
// get all pokemon
// full objects - tweaked
// no filtering
const getAllPokemon = (request, response) => {
  // simplify the output object(s) + rearrange id
  // reformat and simplify entire pokemon obj
  const result = simplifyPokeObj(pokemon);

  simpleSuccess(request, response, result);
};

// search all pokemon
// send names only
// filter by type, weaknesses
const getPokemonNames = (request, response) => {

  // 1 - filter the data
  // 2 - return names

  let result;

  // if no filters
  if (!request.query.type && !request.query.weakness) {
    result = pokemon.map(p => p.name); // return all names
  } else {
    result = pokemon.filter(p => p); // shallow copy pokemon + remove falsy elements
    // note: renaming Pikachu will still modify pokemon, since it's a shallow copy

      // type - ?type=Fire
      result = filterType(request, result);

      // weakness - &weakness=Water
      result = filterWeakness(request, result);

      // return names only
      result = result.map(p => p.name);
  }

  if (!result || result.length === 0) {
    respond400("No matches found. Please try again and use the format 'Element' for each box",
      "noTypeWeaknessNamesFound", request, response);
  } else {
    simpleSuccess(request, response, result);
  }
};

// search all pokemon
// sends full objects
// filter by type, weaknesses
const searchAllPokemon = (request, response) => {
  let result;

  if (!request.query.type && !request.query.weakness) {
    return respond400("Please enter at least one type or weakness to filter by. For a list of all pokemon, please use /getAllPokemon.",
      "noTypeFilterEntered", request, response);
  } else {
    result = pokemon.filter(p => p); // shallow copy pokemon + remove falsy elements
    // note: renaming Pikachu will still modify pokemon, since it's a shallow copy

      // type - ?type=Fire
      result = filterType(request, result);

      // weakness - &weakness=Water
      result = filterWeakness(request, result);

    // simplify the output object(s) + rearrange id
    result = simplifyPokeObj(result);
  }

  // if no results
  if (!result || result.length === 0) {
    respond400("No matches found. Please try again and use the format 'Element'",
      "noTypeWeaknessMatchFound", request, response);
  } else {
    simpleSuccess(request, response, result);
  }
};

// search single pokemon by name
// respond with full object
const searchSinglePokemon = (request, response) => {

  let result;

  console.log("searching single", request.query.name);

  if (!request.query.name) {
    // return 400, no name provided!
    return respond400("Please enter a name.", "noSearchName", request, response);
  } else {
    // search by name for full pokemon object
    result = pokemon
      .filter(p => p.name === request.query.name);

    // handle result = nothing (no matches) here
    if (!result || result.length === 0) {
      return respond400("No matches found. Please try again and use the format 'Name'",
        "noNameFound", request, response);
    }
  }

  // simplify the output object(s) + rearrange id
  result = simplifyPokeObj(result);

  simpleSuccess(request, response, result);
};


// ---------- POST requests --------------------------
const addPokemon = (request, response) => {
  // if no name or id
  if(!request.body.name || !request.body.id){
    return respond400("Please enter a Name and an ID to create your pokemon.",
      'noNameAndIDToCreate', request, response);
  }

  console.log("name", request.body.name);
  console.log("id", request.body.id);
  // does the name already exist?
  // filter pokemon for name, see if length of result is 0
  const nameExists = pokemon.filter(p => p.name === request.body.name).length !== 0;
  const idExists = pokemon.filter(p => p.id == request.body.id).length !== 0;


  if(nameExists && idExists){
    return respond400("This Name and ID are already in use. Please choose your own ID and name.",
      "pleasePickYourOwnIdName", request, response);
  } else if(nameExists){
     return respond400("A pokemon by this name already exists. Please choose your own!",
      "pickYourOwnName", request, response);
  // check if id already exists
  } else if(idExists){
     return respond400("Another pokemon is already using this ID. Please choose your own!",
      "pickYourOwnId", request, response);
  }


  // add entry
  pokemon[request.body.id - 1] = {
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
    message: `Pokemon created! ${pokemon[request.body.id - 1]}`
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
};

// modify by name
const modifyPokemon = (request, response) => {

  console.log("Modifying:", request.body.name);
  const nameExists = pokemon.filter(p => p.name === request.body.name).length !== 0;
  
  // 1 - check if name exists
  if(!nameExists){
    return respond400("No matches found under that name. Please try again and use the format 'Name'",
      "noEditMatchFound", request, response);
  }

  // 1b - check if no data
  if(!request.body.id && !request.body.newName && !request.body.type && !request.body.height && !request.body.weight && !request.body.weakness){
    return respond400("No data entered. Please enter at least one field to change.",
      "noNewData", request, response);
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