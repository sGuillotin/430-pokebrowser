// In-memory data store: cleared when Node restarts
// PUT POKEDEX HERE!!
const users = {};

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




const getUsers = (request, response) => {
  respondJSON(request, response, 200, { users });
};

const notFound = (request, response) => {
  respondJSON(request, response, 404, {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  });
};


const badJSON = (request, response) => {
  respondJSON(request, response, 400, {
    message: 'Request body was missing or in an invalid format.',
    id: 'invalidDataFormat',
  });
};

const addUser = (request, response) => {
  const { name, age } = request.body;

  const missingName = !name;
  const missingAge = age === undefined || age === null || age === '';

  if (missingName || missingAge) {
    return respondJSON(request, response, 400, {
      message: 'Name and age are both required.',
      id: 'addUserMissingParams',
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
  getUsers,
  notFound,
  badJSON,
  addUser
};