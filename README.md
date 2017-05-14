# HMLS

Go from 0 to webapp in seconds.

Express is bloated and too intricate.

`hapi`, `marko`, `lasso`, and `socket.io` are extremely efficient and powerful.  So `HMLS` just wires all of that up for you so that you can be up and running with a webapp in two shakes of a lamb's tail.
 
`HMLS` doesn't "dumb it down" or hide things.  The individual components are easily accessed and altered, giving you all of the flexibility that you'd ever need, or at least the same flexibility that you'd have if you wired this together yourself.

`HMLS` really represents the _VC_ in _MVC_.

<!-- toc -->

- [Installation](#installation)
  * [index.js](#indexjs)
  * [routes/index.js](#routesindexjs)
- [Methods, Attributes, and Options](#methods-attributes-and-options)
  * [`new HMLS([options])`](#new-hmlsoptions)
  * [`hmls.server`](#hmlsserver)
  * [`hmls.lasso`](#hmlslasso)
- [Examples](#examples)
  * [With a simple `marko` template](#with-a-simple-marko-template)
    + [index.js](#indexjs-1)
    + [pages/slash/index.marko](#pagesslashindexmarko)
    + [routes/slash/index.js](#routesslashindexjs)
  * [Bundling assets with `lasso`](#bundling-assets-with-lasso)
    + [index.js](#indexjs-2)
    + [routes/slash/index.js](#routesslashindexjs-1)
    + [pages/slash/index.marko](#pagesslashindexmarko-1)
    + [pages/slash/browser.json](#pagesslashbrowserjson)
    + [pages/slash/lib1.js](#pagesslashlib1js)
    + [pages/slash/lib2.js](#pagesslashlib2js)
    + [pages/slash/style.css](#pagesslashstylecss)
- [Structure and Architecture](#structure-and-architecture)
  * [Project Structure](#project-structure)
    + [/routes](#routes)
    + [/static](#static)
    + [/assets](#assets)

<!-- tocstop -->

## Installation
 
`mkdir <project>`
 
`cd <project>`
 
`npm init`
 
`npm install --save hmls`
 
Then make a few files:

### index.js
 
 ```js
'use strict'

const HMLS = require('hmls')

const vc = new HMLS()

vc.on('started', () => {
  console.log('server started at %s', vc.server.info.uri)
})

vc.init()
vc.start()
```
 
### routes/index.js
 
```js
'use strict'

module.exports = {
  method: 'get',
  path: '/',
  handler: function (req, reply) {
    reply('Welcome to the home page!')
  }
}
```

Then `node index.js` and visit http://localhost:8080 to see your home page.

## Methods, Attributes, and Options

### `new HMLS([options])`

Instantiates a new `hmls` object.  `options` has the following defaults:

```js
{
  server: {
    host: 'localhost',
    port: '8080'
  },
  lasso: {
    outputDir: path.join(__dirname, '..', '..', 'static')
  },
  routesPath: path.join(__dirname, '..', '..', 'routes'),
  assetsPath: path.join(__dirname, '..', '..', 'assets'),
  ioPath: path.join(__dirname, '..', '..', 'io')
}
```

* `server` - this object will be passed _directly_ to `hapi`'s `server.connection()` method.  See https://hapijs.com/api for full options.
* `lasso` - this object will be passed _directly_ to `lasso`'s `lasso.configure()` method.  `lasso.outpurDir` must be set, at a minimum, this specifies the folder where `lasso` will output bundled resources.  It defaults to `/static`.  `HMLS` will automatically use `inert` to serve this folder.
* `routesPath` - `HMLS` will search this folder for `hapi` routes. More precisely said, it will add each file's exported object to `hapi`'s route table.  _ALL_ files in this folder must export an object, or an array of objects that are `hapi` routes.
* `assetsPath` - `HMLS` will serve all files in this folder at `/assets`, useful for static resources like images.
* `ioPath` - `HMLS` wires up `socket.io`, any file in this folder is expected to export a function with the signature `function(io) {}`, where `io` is the `socket.io` instance.

### `hmls.server`

The `hapi` server.

### `hmls.lasso`

The `lasso` instance.

## socket.io

`socket.io` is all wired up.  To add sockets to `HMLS` add JS files to the `/io` folder (or whichever folder) set with `options.ioPath`.

A trivial file in the `/io` folder:

```js
'use strict'

module.exports = function (io) {
  io.on('connection', function(socket) {
    console.log('%s connected', socket.id)
  })
}
```

Then the view (the `.marko` file) should include the `socket.io` client JS library (simply paste `<script src="/socket.io/socket.io.js"></script>`).

For example:

### pages/slash/index.marko

```html
<lasso-page package-path="./browser.json"/>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>/</title>
    <lasso-head/>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
<h1>
    The current <code>Date</code> is ${input.now}!
</h1>
<lasso-body/>
</body>
</html>
```

### io/slash/index.js

```js
'use strict'

module.exports = function (io) {
  io.on('connection', function(socket) {
    console.log('%s connected', socket.id)
    socket.on('greetingAcknowledgement', function() {
      console.log('%s acknowledged `greeting`', socket.id)
    })
    console.log('sending `greeting` to %s', socket.id)
    socket.emit('greeting')
  })
}
```

Now you can interact with the server with client JS:

### pages/slash/lib.js

```js
var socket = io();

socket.on('greeting', function() {
  console.log('received `greeting` from server');
  socket.emit('greetingAcknowledgement');
});
```

Node console:

```js
server started at http://localhost:8080
VwyAfRLa6cSJM3neAAAA connected
sending `greeting` to VwyAfRLa6cSJM3neAAAA
VwyAfRLa6cSJM3neAAAA acknowledged `greeting`
```

Browser console:

```js
received `greeting` from server
```

## Examples

### With a simple `marko` template

#### index.js
 
 ```js
'use strict'

const HMLS = require('hmls')

const vc = new HMLS()

vc.on('started', () => {
  console.log('server started at %s', vc.server.info.uri)
})

vc.init()
vc.start()
```

#### pages/slash/index.marko

```html
<h1>
    The current <code>Date</code> is ${input.now}!
</h1>
```

#### routes/slash/index.js

```js
'use strict'

module.exports = [{
  method: 'get',
  path: '/',
  handler: function (req, reply) {
    const page = require('~/pages/slash/index.marko')
    reply(page.stream(
      {
        now: new Date()
      }
    ))
  }
}]
```

### Bundling assets with `lasso`

You can use `lasso`'s manifest file (`browser.json`) and its taglib in `marko` files to bundle assets.

#### index.js

```js
'use strict'

const HMLS = require('hmls')

const vc = new HMLS()

vc.on('started', () => {
  console.log('server started at %s', vc.server.info.uri)
})

vc.init()
vc.start()
```

#### routes/slash/index.js

```js
'use strict'

module.exports = [{
  method: 'get',
  path: '/',
  handler: function (req, reply) {
    const page = require('~/pages/slash/index.marko')
    reply(page.stream(
      {
        now: new Date()
      }
    ))
  }
}]
```

#### pages/slash/index.marko

```html
<lasso-page package-path="./browser.json"/>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>/</title>
    <lasso-head/>
</head>
<body>
<h1>
    The current <code>Date</code> is ${input.now}!
</h1>
<lasso-body/>
</body>
</html>
```

#### pages/slash/browser.json

```json
{
  "dependencies": [
    {
      "type": "js",
      "url": "//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"
    },
    "./lib1.js",
    "./lib2.js",
    "./style.css"
  ]
}
```

#### pages/slash/lib1.js

```js
console.log('from pages/slash/lib1.js');
```

#### pages/slash/lib2.js

```js
console.log('from pages/slash/lib2.js');
```

#### pages/slash/style.css

```css
body {
    background-color: #eee;
}

h1 {
    color: red;
}
```

Now the page source will look something like this:

```html
<!doctype html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <title>/</title>
      <link rel="stylesheet" href="/static/slash-4c51a8fb.css">
   </head>
   <body>
      <h1>The current <code>Date</code> is Sun May 14 2017 17:31:37 GMT-0400 (EDT)!</h1>
      <script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
      <script src="/static/slash-71d36ac2.js"></script>
   </body>
</html>
```

`/static/slash-71d36ac2.js` will look like this:

```js
console.log('from pages/slash/lib1.js');
console.log('from pages/slash/lib2.js');
```

_Notice that the two JS lib files have been combined into one resource, also notice the jQuery injection._
 
## Structure and Architecture
 
`Hapi` is _fantastic_ at serving static content (well, really any content).  `Hapi` is the webserver used in `HMLS`.  You can directly access the `hapi` instance with `hmls.server`.

`Marko` is _fantastic_ at rendering dynamic content.  `Marko` is used as `HMLS`' templating engine.

`Lasso` is _fantastic_ at bundling resources together (client JS, CSS, et cetera).  You can directly access the `lasso` instance with `hmls.lasso`.

(see where I am going here?)

All `HMLS` really does is wire all of these pieces together, while exposing each piece, so you can get as hardcore with each piece as you like.

### Project Structure

#### /routes

This folder should contain JS files that export `hapi` routes.  By default it is the `routes` folder in your project root.  Change this with `options.routesPath`.

An example of a trivial route file:

```js
'use strict'

module.exports = [{
  method: 'get',
  path: '/',
  handler: function (req, reply) {
    reply('I get rendered to the browser!')
  }
}]
```

#### /static

This folder is where `lasso` will output bundled resources.  By default it is the `static` folder in your project root.  Change this with `options.lasso.outputDir`.

#### /assets

You can put anything in here that you'd like to be served, like images or other resources.