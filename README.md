[![Build Status](https://travis-ci.org/charlesread/hmls.svg?branch=master)](https://travis-ci.org/charlesread/hmls)
[![Dependencies](https://david-dm.org/charlesread/hmls.svg)](https://david-dm.org/charlesread/hmls)
[![Coverage Status](https://coveralls.io/repos/github/charlesread/hmls/badge.svg?branch=master)](https://coveralls.io/github/charlesread/hmls?branch=master)

# HMLS

[![Join the chat at https://gitter.im/hmls-njs/Lobby](https://badges.gitter.im/hmls-njs/Lobby.svg)](https://gitter.im/hmls-njs/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Go from 0 to webapp in seconds.

HMLS gives you, with _zero_ configuration:

* A full blown and easy-to-use web server with a ton of plugins; `hapi`
* An awesome view layer via `marko` (easy-to-use taglibs, reusable custom components, et cetera)
* Asset bundling (and serving) via `lasso` (complete with `less` CSS pre-processing)
* Bi-directional communication is as easy as writing a few callbacks with `socket.io`, and is ready to go

`hapi`, `marko`, `lasso`, and `socket.io` are extremely efficient and powerful.  So `HMLS` just wires all of that up for you so that you can be up and running with a webapp in two shakes of a lamb's tail.
 
`HMLS` doesn't "dumb it down" or hide things.  The individual components are easily accessed and altered, giving you all of the flexibility that you'd ever need, or at least the same flexibility that you'd have if you wired this together yourself.

`HMLS` really represents the _VC_ in _MVC_.

<!-- toc -->

- [Change Log](#change-log)
- [Installation](#installation)
  * [index.js](#indexjs)
  * [routes/index.js](#routesindexjs)
  * [Too lazy for that noise?](#too-lazy-for-that-noise)
- [Scaffolding](#scaffolding)
- [Related Plugins](#related-plugins)
- [Methods, Attributes, and Options](#methods-attributes-and-options)
  * [`new HMLS([options])`](#new-hmlsoptions)
  * [`async hmls.init()`](#async-hmlsinit)
  * [`async hmls.start()`](#async-hmlsstart)
  * [`hmls.server`](#hmlsserver)
  * [`hmls.lasso`](#hmlslasso)
  * [`hmls.io`](#hmlsio)
- [Events](#events)
  * [willInitialize](#willinitialize)
  * [initialized](#initialized)
  * [willRegisterRoutes](#willregisterroutes)
  * [routesRegistered](#routesregistered)
  * [willStart](#willstart)
  * [started](#started)
- [Structure and Architecture](#structure-and-architecture)
  * [Project Structure](#project-structure)
    + [/routes](#routes)
    + [/static](#static)
    + [/assets](#assets)
    + [/io](#io)
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
  * [socket.io](#socketio)
    + [pages/slash/index.marko](#pagesslashindexmarko-2)
    + [io/slash/index.js](#ioslashindexjs)
    + [pages/slash/lib.js](#pagesslashlibjs)

<!-- tocstop -->

## Change Log

* 2017-12-16 - As of v2.x `HMLS` is fully compatible with Hapi v17.x and `async/await`.

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

!async function () {
  await vc.init()
  await vc.start()
  console.log('server started: %s', vc.server.info.uri)
}()
  .catch((err) => {
    console.error(err.message)
  })
```
 
### routes/index.js
 
```js
'use strict'

module.exports = {
  method: 'get',
  path: '/',
  handler: async function (req, h) {
    return 'Welcome to the home page!'
  }
}
```

Then `node index.js` and visit http://localhost:8080 to see your home page.

### Too lazy for that noise?

Check this out, just a one liner that installs `hmls`, scaffolds out a simple project, and starts it up:

```bash
$ mkdir my-project && cd my-project && npm init && npm i -S hmls && node node_modules/hmls/bin/hmls.js -s && node index.js
```

## Scaffolding

`HMLS` comes with a CLI that can be used to create all of the files and folders (along with small examples) necessary to run  immediately.

First create a project and install `HMLS` globally:

`$ mkdir <project>`

`$ cd <project>`
 
`$ npm init`
 
`$ npm install --save hmls`

`$ npm install --global hmls`

Then:

`$ hmls --scaffold && node index.js`

Simple as that!

## Related Plugins

I've written a few `hapi`-related plugins that I use all the time, mostly for authorization and authentication:

* [hapi-acl-auth](https://www.npmjs.com/package/hapi-acl-auth)
* [hapi-auth-auth0](https://www.npmjs.com/package/hapi-auth-auth0)
* [hapi-auth-fb](https://www.npmjs.com/package/hapi-auth-fb)

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
    outputDir: path.join(__dirname, '..', '..', 'static'),
    plugins: ['lasso-marko']
  },
  projectRoot: path.join(__dirname, '..', '..'),
  routesPath: [path.join(__dirname, '..', '..', 'routes')],
  assetsPath: [path.join(__dirname, '..', '..', 'assets')],
  ioPath: path.join(__dirname, '..', '..', 'io')
 }
```

* `server` - this object will be passed _directly_ to `hapi`'s constructor.  See https://hapijs.com/api for full options.
* `lasso` - this object will be passed _directly_ to `lasso`'s `lasso.configure()` method.  `lasso.outpurDir` must be set, at a minimum, this specifies the folder where `lasso` will output bundled resources.  It defaults to `/static`.  `HMLS` will automatically use `inert` to serve this folder.
* `routesPath` - `HMLS` will search this folder, or array of folders, for `hapi` routes. More precisely said, it will add each file's exported object to `hapi`'s route table.  _ALL_ files in this folder must export an object, or an array of objects, that are `hapi` routes.
* `assetsPath` - `HMLS` will serve all files in this folder, or array of folders, at `/assets`, useful for static resources like images.
* `ioPath` - `HMLS` wires up `socket.io`, any file in this folder is expected to export a function with the signature `function(io) {}`, where `io` is the `socket.io` instance.

### `async hmls.init()`

Returns: `Promise`

Initializes everything (`hapi`, `lasso`, `sockets`, et cetera).

If this is not called explicitly it is called in `hmls.start()`.

If you want to do things to the individual components prior to starting `hapi` (like manually adding routes to `hapi`) this is useful.

### `async hmls.start()`

Returns: `Promise`

Starts the `hapi` server, will invoke `hmls.init()` if it has not already been invoked.

### `hmls.server`

The `hapi` server object.

### `hmls.lasso`

The `lasso` instance.

### `hmls.io`

The `socket.io` instance.

## Events

`HMLS` emits several events, they are emitted in this order:

### willInitialize

Emitted when `async hmls.init()` is about to start.

### initialized

Emitted after `async hmls.init()` has completed.

### willRegisterRoutes

Emitted right before routes in `routesPath` are added.

### routesRegistered

Emitted after all routes are added.

### willStart

Emitted just before `async hmls.start()` starts.

### started

Emitted after `async hmls.start()` has completed.  Useful for things like rigging `browser-refresh` or other things that require that all of the "initial work" has been done and the app is ready to go.

## Structure and Architecture
 
`Hapi` is _fantastic_ at serving static content (well, really any content).  `Hapi` is the webserver used in `HMLS`.  You can directly access the `hapi` instance with `hmls.server`.

`Marko` is _fantastic_ at rendering dynamic content.  `Marko` is used as `HMLS`' templating engine.

`Lasso` is _fantastic_ at bundling resources together (client JS, CSS, et cetera).  You can directly access the `lasso` instance with `hmls.lasso`.

`socket.io` is super neat and allows the client and the server to communicate via websockets.  

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
  handler: async function (req, h) {
    return 'I get rendered to the browser!'
  }
}]
```

#### /static

This folder is where `lasso` will output bundled resources.  By default it is the `static` folder in your project root.  Change this with `options.lasso.outputDir`.

#### /assets

You can put anything in here that you'd like to be served, like images or other resources. By default it is the `assets` folder in your project root.  Change this with `options.assetsPath`.

#### /io

All files in this folder will be `require`d.  It is assumed that each file will export a single function whose one parameter is the HMLS `socket.io` instance (accessible anytime via `hmls.io`).  Then you can do whatever you like via `socket.io`.  Here's an example of a file in the `/io` folder:

```js
'use strict'

module.exports = function (io) {
  io.on('connection', function(socket) {
    console.log('%s connected', socket.id)
  })
}
```

## Examples

### With a simple `marko` template

#### index.js
 
 ```js
'use strict'

const HMLS = require('hmls')

const vc = new HMLS()

!async function () {
  await vc.init()
  await vc.start()
  console.log('server started: %s', vc.server.info.uri)
}()
  .catch((err) => {
    console.error(err.message)
  })
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
  handler: async function (req, h) {
    const page = require('~/pages/slash/index.marko')
    return page.stream(
      {
        now: new Date()
      }
    )
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

vc.start()
  .catch(function(err) {
    console.error(err.message)
  })
```

#### routes/slash/index.js

```js
'use strict'

module.exports = [{
  method: 'get',
  path: '/',
  handler: async function (req, h) {
    try {
      const page = require('~/pages/slash/index.marko')
      return page.stream(
        {
          now: new Date()
        }
      )
    } catch (err) {
      console.error(err.message)
      return err.message
    }
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
 
### socket.io

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

#### pages/slash/index.marko

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

#### io/slash/index.js

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

#### pages/slash/lib.js

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
