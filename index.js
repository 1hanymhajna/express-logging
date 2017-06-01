/**
 * Created by hanymhajna on 29/05/2017.
 */

var customLogger;
var util = require('util');
var maskingObject;
var _ = require('lodash');

module.exports.init = function (logger, jsonMaskingObject) {
    customLogger = logger;
    maskingObject = jsonMaskingObject;
};

module.exports.requestMiddleware = function (req, res, next) {

    // logging incoming request
    var incomingRequest = _.cloneDeep(req);
    var maskObject = getMaskObject(req);
    if (maskObject) maskBody(incomingRequest.body, maskObject.requestNodesToMask);
    customLogger.info(util.format("Start handling request %s:%s", incomingRequest.method, incomingRequest.originalUrl), {headers: JSON.stringify(maskingHeaders(maskObject, incomingRequest.headers))}, {body: JSON.stringify(incomingRequest.body)});


    // logging response
    var end = res.end;
    res.end = function (chunk, encoding) {
        res.end = end;
        res.end(chunk, encoding);
        var responseBody = safeJSONParse(chunk);
        var maskObject = getMaskObject(req);
        if (maskObject && res.statusCode == 200) maskBody(responseBody, maskObject.responseNodesToMask);
        customLogger.info(util.format("Finish handle %s:%s request", req.method, req.originalUrl), util.format("statusCode: %s", res.statusCode), util.format("headers: %j", maskingHeaders(maskObject, req.headers)), util.format("responseBody: %j", responseBody));
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

var getMaskObject = function (req) {
    var maskObjects = maskingObject.filter(function (request) {
        if (req.originalUrl.indexOf(request.endPoint) > -1 && req.method === request.method) return true;
        else return false;
    });
    if (maskObjects && maskObjects.length > 0) return maskObjects[0];
    else return undefined;
};

var maskingHeaders = function (maskObject, headers) {
    var incomingHeader = _.cloneDeep(headers);

    if (maskObject) {
        maskObject.headers.forEach(function (headerToBeRemoved) {
            incomingHeader[headerToBeRemoved] = maskString(incomingHeader[headerToBeRemoved]);
        })
    }

    return incomingHeader;

};

var maskBody = function (body, nodesToMask) {
    if (body && nodesToMask) {
        nodesToMask.forEach(function (nodeToMask) {
            body[nodeToMask] = maskString(body[nodeToMask]);
        });
    } else if (body) {
        var keys = Object.keys(body);
        keys.forEach(function (key) {
            body[key] = maskString(body[key]);
        });
    }else{

    }
};

function maskString(string) {
    if(string){
        for (var i = 1; i < string.length - 1; i++) {
            string = string.substr(0, i) + '*' + string.substr(i + 1);
        }
        return string
    }
    return undefined;
}
