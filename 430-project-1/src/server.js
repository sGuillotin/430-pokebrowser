const http = require('http'); // pull in http module
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
// querystring module for parsing querystrings from url
const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// GET and HEAD share the same routes. The json handler skips the body for HEAD.
const getStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getUsers': jsonHandler.getUsers,
  notFound: jsonHandler.notFound,
};

const postStruct = {
  '/addUser': (request, response) => parseBody(request, response, jsonHandler.addUser),
  notFound: jsonHandler.notFound,
};



// Reassembles a (possibly chunked) request body, parses it, then calls handler.
const parseBody = (request, response, handler) => {
  // The request will come in in pieces. We will store those pieces in this body array.
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const type = request.headers['content-type'];

    if (type === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    } else if (type === 'application/json') {
      try {
        request.body = JSON.parse(bodyString);
      } catch (err) {
        console.dir(err);
        return jsonHandler.badJSON(request, response);
      }
    } else {
      return jsonHandler.badJSON(request, response);
    }

    return handler(request, response);
  });
};




const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  // If there is an Accept header, split it into an array. If there is not, use JSON
  request.acceptedTypes = request.headers.accept
    ? request.headers.accept.split(',')
    : ['application/json'];
  // console.log(request.headers);
  // console.log(request.headers.accept);

  let struct;
  if (request.method === 'GET' || request.method === 'HEAD') {
    struct = getStruct;
  } else if (request.method === 'POST') {
    struct = postStruct;
  } else {
    return jsonHandler.notFound(request, response);
  }

  if (struct[parsedUrl.pathname]) {
    return struct[parsedUrl.pathname](request, response);
  }
  return struct.notFound(request, response);

  // console.log(request.url);
  // response.writeHead(200, { 'Content-Type': 'text/plain' });
  // response.write('Hello server.');
  // response.end();
};


http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
})

// good reference https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/src/jsonResponses.js