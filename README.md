# express-logging
express logging for incoming request and response

## Features
* Logging every incoming request
* Logging every response
* Option to mask all request/response body
* Option to mask specific headers
* You can use any logger you want

`Please notice, in case that you want to mask a header from all your request, you have to add object in the JSON for every endpoint`

## How to use
1- npm install dynamic-express-logging
2- In your index.js file add these lines:
```bash
var dynamicExpressLogging = require('dynamic-express-logging');
dynamicExpressLogging.init(`your logger`,`JSON object to mask your request and response body & headers`);
app.use(dynamicExpressLogging.requestMiddleware);
```

## mask JSON object
```json
[
  {
    "endPoint": "`endPoint`",
    "method": "`METHOD`",
    "headers":[
      `header keys`
    ]
  }
]
```
### JSON EXAMPLE
```json
[
  {
    "endPoint": "`endPoint`",
    "method": "`METHOD`",
    "headers":[
      `header keys`
    ]
  }
]
```