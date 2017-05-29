/**
 * Created by hanymhajna on 29/05/2017.
 */

var logger;
var util = require('util');
var maskingObject;
var _ = require('lodash');

module.exports.init = function (log, jsonMaskingObject) {
    logger = log;
    maskingObject = jsonMaskingObject;
};

module.exports.requestMiddleware = function (req, res, next) {
    var incomingRequest = _.cloneDeep(req);
    if (isNeededMasking(req)) maskRequest(incomingRequest.body);
    logger.info(util.format("Start handling request %s:%s", incomingRequest.method, incomingRequest.originalUrl), {headers: JSON.stringify(secureHeaders(req, incomingRequest.headers))}, {body: JSON.stringify(incomingRequest.body)});

    var end = res.end;
    res.end = function (chunk, encoding) {
        res.end = end;
        res.end(chunk, encoding);
        var responseBody = safeJSONParse(chunk);
        if (isNeededMasking(req) && res.statusCode == 200) maskRequest(responseBody);
        logger.info("Finish handle %s:%s request", req.method, req.originalUrl, util.format("statusCode: %s", res.statusCode), util.format("headers: %j", secureHeaders(req, req.headers)), util.format("responseBody: %j", responseBody));
    };

    next();
};


function safeJSONParse(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return undefined;
    }
}

var isNeededMasking = function (req) {
    return maskingObject.filter(function (request) {
        if (req.originalUrl.indexOf(request.endPoint) > -1 && req.method === request.method) return true;
        else return false;
    });
};

var secureHeaders = function (req, headers) {
    var incomingHeader = _.cloneDeep(headers);
    var maskObject = maskingObject.filter(function (request) {
        if (req.originalUrl.indexOf(request.endPoint) > -1 && req.method === request.method) return true;
        else return false;
    });

    if (maskObject && maskObject.length > 0) {
        maskObject[0].excludeHeaders.forEach(function (headerToBeRemoved) {
            delete incomingHeader[headerToBeRemoved];
        })
    }

    return incomingHeader;

};

var maskRequest = function (body) {
    if (body) {
        var keys = Object.keys(body);
        keys.forEach(function (key) {
            body[key] = maskString(body[key]);
        });
    }
};

function maskString(string) {
    for (var i = 1; i < string.length - 1; i++) {
        string = string.substr(0, i) + '*' + string.substr(i + 1);
    }
    return string;
}
