const fs = require('fs');   // import filesystems module

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

/**
 * Serves HTML file in client directory
 * @param {*} request 
 * @param {*} response 
 * @param {*} content 
 * @param {*} mimeType string including quotes
 */
const serveFile = (request, response, content, mimeType) => {
  response.writeHead(200, { 'Content-Type': mimeType });
  // HEAD requests get headers only
  if (request.method !== 'HEAD')
    response.write(content);

  response.end();
};

const getIndex = (request, response) => serveFile(request, response, index, 'text/html');
const getCSS = (request, response) => serveFile(request, response, css, 'text/css');

module.exports = {
    getIndex,
    getCSS
}