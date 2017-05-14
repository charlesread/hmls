#HMLS

Go from 0 to webapp in seconds.

Express is bloated and too intricate.

`hapi`, `marko`, `lasso`, and `socket.io` are extremely efficient and powerful.  So `HMLS` just wires all of that up for you so that you can be up and running with a webapp in two shakes of a lamb's tail.
 
`HMLS` doesn't "dumb it down" or hide things.  The individual components are easily accessed and altered, giving you all of the flexibility that you'd ever need, or at least the same flexibility that you'd have if you wired this together yourself.

`HMLS` really represents the _VC_ in _MVC_.

<!-- toc -->

- [Installation](#installation)
  * [routes/intex.js](#routesintexjs)
  * [index.js](#indexjs)
- [Methods, Attributes, and Options](#methods-attributes-and-options)
  * [`new HMLS([options])`](#new-hmlsoptions)
  * [`hmls.server`](#hmlsserver)
  * [`hmls.lasso`](#hmlslasso)
- [Examples](#examples)
  * [With a simple `marko` template](#with-a-simple-marko-template)
    + [pages/slash/index.marko](#pagesslashindexmarko)
    + [routes/slash/index.js](#routesslashindexjs)
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
 
### routes/intex.js
 
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
  routesPath: path.join(__dirname, '..', '..', 'routes')
}
```

* `server` - this object will be passed _directly_ to `hapi`'s `server.connection()` method.  See https://hapijs.com/api for full options.
* `lasso` - this object will be passed _directly_ to `lasso`'s `lasso.configure()` method.  `lasso.outpurDir` must be set, at a minimum, this specifies the folder where `lasso` will output bundled resources.  It defaults to `/static`.  `HMLS` will automatically use `inert` to serve this folder.
* `routesPath` - `HMLS` will search this folder for `hapi` routes. More precisely said, it will add each file's exported object to `hapi`'s route table.  _ALL_ files in this folder must export an object, or an array of objects that are `hapi` routes.

### `hmls.server`

The `hapi` server.

### `hmls.lasso`

The `lasso` instance.

## Examples

### With a simple `marko` template

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

Then `node index.js` and visit http://localhost:8080 to see your home page.
 
## Structure and Architecture
 
`Hapi` is _fantastic_ at serving static content (well, really any content).  `Hapi` is the webserver used in `HMLS`.  You can directly access the `hapi` instance with `hmls.server`.

`Marko` is _fantastic_ at rendering dynamic content.  `Marko` is used as `HMLS`' templating engine.

`Lasso` is _fantastic_ at bundling resources together (client JS, CSS, et cetera).  You can directly access the `lasso` instance with `hmls.lasso`.

(see where I am going here?)

All `HMLS` really does is wire all of these pieces together, while exposing each piece, so you can get as hardcore with each piece as you like.

### Project Structure

#### /routes

This folder should contain JS files that export `hapi` routes.  By default it is the `routes` folder in your project root.  Change this with `options.routesPath`.

#### /static

This folder is where `lasso` will output bundled resources.  By default it is the `static` folder in your project root.  Change this with `options.lasso.outputDir`.

#### /assets

You can put anything in here that you'd like to be served, like images or other resources.