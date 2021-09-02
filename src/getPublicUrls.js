var http = require("http");
var options = {
    hostname: '127.0.0.1',
    port: 4040,
    path: '/api/tunnels',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
};

module.exports.getPublicUrl = function() {

    return new Promise((resolve, reject) => {

        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(_config) {
                const config = JSON.parse(_config);
                console.log(config);
                const httpsTunnel = config.tunnels.find(t => t.proto === 'https');
                resolve(httpsTunnel.public_url);
            });
        });

        req.on('error', function(e) {
            reject(e.message);
        });

        req.end();
    });
}
