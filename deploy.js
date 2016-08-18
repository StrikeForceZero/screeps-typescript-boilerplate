const https   = require('https');
const config  = require('./config.js');
const path    = require('path');
const fs      = require('fs');
const Promise = require('bluebird');

const uploadPromise = new Promise(
    ( resolve, reject ) => {

        const email      = config.credentials.email,
              password   = config.credentials.password,
              mainScript = path.resolve(__dirname, './dist/main.js'),
              data       = {
                  branch : config.branch,
                  modules: {
                      main: fs.readFileSync(mainScript, 'utf-8'),
                  }
              };

        const req = https.request(
            {
                hostname: 'screeps.com',
                port    : 443,
                path    : '/api/user/code',
                method  : 'POST',
                auth    : `${email}:${password}`,
                headers : {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }
        );

        req.on(
            'response', ( response ) => {
                const buffer = [];
                response.on('data', data => buffer.push(data));
                response.on('end', () => resolve(buffer.join('')));
            }
        );

        req.write(JSON.stringify(data));
        req.end();

        console.log(`[${config.branch}] uploading code`);
    }
);


uploadPromise.then(data => console.log(data));