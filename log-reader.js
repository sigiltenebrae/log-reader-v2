const express = require('express');
const cors = require('cors');
const fs = require('fs');

const args = process.argv;
const settings = args.length === 2 ? require("./services.example.json"): require(args[2]);

const app = express();
const port = settings.port;
app.use(cors({ origin: '*' }));

app.get('/api', (request, response) => {
    if (request.query.apiKey === settings.apiKey) {
        response.json({
            message: "usable commands: logs, logs/name"
        });
    }
    else {
        response.json({
            message: "invalid api key"
        });
    }
});

app.get('/api/services', (request, response) => {
    if (request.query.apiKey === settings.apiKey) {
        let out_array = [];
        settings.services.forEach((service) => {
            out_array.push(service.name);
        });
        response.json({services: out_array});
    }
    else {
        response.json({
            message: "invalid api key"
        });
    }
})

app.get('/api/logs/:name', (request, response) => {
    if (request.query.apiKey === settings.apiKey) {
        const name = request.params.name;
        let service = settings.services.find(i => i.name === name);
        if (service) {
            fs.readFile(service.log, 'utf8', function(err, data) {
                if (err) {
                    console.log(err);
                    response.json({
                        name: service.name,
                        log: []
                    })
                }
                else {
                    let array = data.toString().split('\n');
                    let out_array = [];
                    if (request.query.lines) {
                        for (let i = 0; i < request.query.lines; i++) {
                            out_array.push(array[array.length - 1 - i]);
                        }
                        out_array.reverse();
                        response.json({
                            name: service.name,
                            log: out_array
                        })
                    }
                    else {
                        array.reverse();
                        response.json({
                            name: service.name,
                            log: array
                        });
                    }
                }
            })
        }
        else {
            response.json({
                message: "service not found"
            });
        }
    }
    else {
        response.json({
            message: "invalid api key"
        });
    }
})

var server = app.listen(port, function() {
    console.log("Log reader service running on port " + port);
})