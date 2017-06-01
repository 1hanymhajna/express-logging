/**
 * Created by hanymhajna on 29/05/2017.
 */

"use strict";
var should = require('should');
var sinon = require('sinon');
var rewire = require('rewire');
var index = rewire('../index');
var util = require('util');


describe("index spec", function () {
    describe("init function", function () {
        describe("When call init function", function () {
            it("Should set the values in customLogger & maskingObject", function () {
                index.init("loggerObject", "maskingObject");
                index.__get__("customLogger").should.equal("loggerObject");
                index.__get__("maskingObject").should.equal("maskingObject");
            })
        })
    });
    describe("requestMiddleware function", function () {


        describe("basic flow", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject = [];

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};
                index.init(stubLogger, maskingObject);

                requestObject = {
                    method: "GET",
                    originalUrl: "myOriginalUrl",
                    headers: {"first": "value", "second": "value"},
                    body: {"key": "value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });
            it("Should called logger with start handling request with correct variables", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify(requestObject.headers)},
                    {body: JSON.stringify(requestObject.body)}).calledOnce.should.equal(true);

            });
            it("Should call logger with finish handle request variable with correct variables", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", requestObject.headers),
                    util.format("responseBody: %s", expectedResponseBody)).calledOnce.should.equal(true);
            });
            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })
        });

        describe("When call it with object to be mask", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "GET",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"},
                    body: {"key": "value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/health",
                        "method": "GET",
                        "headers": [
                            "first"
                        ]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should mask all the body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify({"first": "v***e", "second": "value"})},
                    {body: JSON.stringify({"key": "v***e"})}).calledOnce.should.equal(true);
            });
            it("Should mask response body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", {"first": "v***e", "second": "value"}),
                    util.format("responseBody: %s", JSON.stringify({
                        "firstKey": "f********e",
                        "secondKey": "s*********e"
                    }))).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })

        });


        describe("When call it with object to be mask with specific request node to mask", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "GET",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"},
                    body: {"key1": "value","key2":"value","key3":"value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/health",
                        "method": "GET",
                        "headers": [
                            "first"
                        ],
                        requestNodesToMask:["key1","key3"]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should mask all the body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify({"first": "v***e", "second": "value"})},
                    {body: JSON.stringify({"key1": "v***e","key2":"value","key3":"v***e"})}).calledOnce.should.equal(true);
            });
            it("Should mask response body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", {"first": "v***e", "second": "value"}),
                    util.format("responseBody: %s", JSON.stringify({
                        "firstKey": "f********e",
                        "secondKey": "s*********e"
                    }))).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })

        });

        describe("When call it with object to be mask with specific response node to mask", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "GET",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"},
                    body: {"key1": "value","key2":"value","key3":"value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/health",
                        "method": "GET",
                        "headers": [
                            "first"
                        ],
                        responseNodesToMask:["firstKey"]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should mask all the body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify({"first": "v***e", "second": "value"})},
                    {body: JSON.stringify({"key1": "v***e","key2":"v***e","key3":"v***e"})}).calledOnce.should.equal(true);
            });
            it("Should mask response body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", {"first": "v***e", "second": "value"}),
                    util.format("responseBody: %s", JSON.stringify({
                        "firstKey": "f********e",
                        "secondKey": "secondValue"
                    }))).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })

        });


        describe("When call it with object to be mask with specific response & request nodes to mask", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "GET",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"},
                    body: {"key1": "value","key2":"value","key3":"value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/health",
                        "method": "GET",
                        "headers": [
                            "first"
                        ],
                        responseNodesToMask:["firstKey"],
                        requestNodesToMask:["key1"]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should mask all the body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify({"first": "v***e", "second": "value"})},
                    {body: JSON.stringify({"key1": "v***e","key2":"value","key3":"value"})}).calledOnce.should.equal(true);
            });
            it("Should mask response body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", {"first": "v***e", "second": "value"}),
                    util.format("responseBody: %s", JSON.stringify({
                        "firstKey": "f********e",
                        "secondKey": "secondValue"
                    }))).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })

        });


        describe("When call it with object to be mask without requestBody", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "GET",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/health",
                        "method": "GET",
                        "headers": [
                            "first"
                        ],
                        responseNodesToMask:["firstKey"],
                        requestNodesToMask:["key1"]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should mask all the body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify({"first": "v***e", "second": "value"})},
                    {body: undefined}).calledOnce.should.equal(true);
            });
            it("Should mask response body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", {"first": "v***e", "second": "value"}),
                    util.format("responseBody: %s", JSON.stringify({
                        "firstKey": "f********e",
                        "secondKey": "secondValue"
                    }))).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })

        });

        describe("When call it with object to be mask , but call it with different api", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "GET",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"},
                    body: {"key": "value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/AnotherRequest",
                        "method": "GET",
                        "headers": [
                            "first"
                        ]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should not mask anything", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify(requestObject.headers)},
                    {body: JSON.stringify(requestObject.body)}).calledOnce.should.equal(true);
            });
            it("Should mask response body and relevant headers", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", requestObject.headers),
                    util.format("responseBody: %s", expectedResponseBody)).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })
        });

        describe("When call it with object to be mask , but call it with different method", function () {
            var sandbox;
            var requestObject;
            var responseObject;
            var expectedResponseBody;
            var stubLogger;
            var stubNext;
            var maskingObject;

            before(function () {
                sandbox = sinon.sandbox.create();
                stubLogger = {info: sandbox.stub()};

                requestObject = {
                    method: "POST",
                    originalUrl: "/v1/health",
                    headers: {"first": "value", "second": "value"},
                    body: {"key": "value"}
                };

                responseObject = {
                    statusCode: 200,
                    end: sandbox.stub()
                };

                expectedResponseBody = JSON.stringify({
                    "firstKey": "firstValue",
                    "secondKey": "secondValue"
                });

                maskingObject = [
                    {
                        "endPoint": "/v1/health",
                        "method": "GET",
                        "headers": [
                            "first"
                        ]
                    }
                ];

                index.init(stubLogger, maskingObject);
                stubNext = sandbox.stub();
                index.requestMiddleware(requestObject, responseObject, stubNext);
                responseObject.end(expectedResponseBody, "UTF-8");
            });


            it("Should not mask anything", function () {
                stubLogger.info.withArgs(util.format("Start handling request %s:%s", requestObject.method, requestObject.originalUrl),
                    {headers: JSON.stringify(requestObject.headers)},
                    {body: JSON.stringify(requestObject.body)}).calledOnce.should.equal(true);
            });
            it("Should not mask any thing in the response", function () {
                stubLogger.info.withArgs(util.format("Finish handle %s:%s request", requestObject.method, requestObject.originalUrl),
                    util.format("statusCode: %s", responseObject.statusCode),
                    util.format("headers: %j", requestObject.headers),
                    util.format("responseBody: %s", expectedResponseBody)).calledOnce.should.equal(true);
            });

            it("Should call next", function () {
                stubNext.withArgs().calledOnce.should.equal(true);
            })
        })
    });

    describe("safeJSONParse function", function () {
        it("Should pars string to json", function () {
            var safeResponse = index.__get__("safeJSONParse")(JSON.stringify({"first": "second"}));
            safeResponse.should.deepEqual({"first": "second"});
        });
        it("Should return undefined when it failed to parse it", function (done) {
            var safeResponse = index.__get__("safeJSONParse")({"first": "second"});
            if (!safeResponse) done();
            else done("expect to return endefined");
        })
    })
});