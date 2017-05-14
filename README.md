# HMLS

Go from 0 to webapp in seconds.

Express is bloated and too intricate.

`hapi`, `marko`, `lasso`, and `socket.io` are extremely efficient and powerful.  So `HMLS` just wires all of that up for you so that you can be up and running with a webapp in two shakes of a lamb's tail.
 
 `HMLS` doesn't "dumb it down" or hide things.  The individual components are easily accessed and altered, giving you all of the flexibility that you'd ever need, or at least the same flexibility that you'd have if you wired this together yourself.
 
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

vc.init()
vc.start()
```

Then `node index.js` and visit http://localhost:8080 to see your home page.
 
 ## Structure and Architecture
 
 _coming soon_