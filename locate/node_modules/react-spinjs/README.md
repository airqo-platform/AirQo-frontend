# React SpinJS

[![npm](https://img.shields.io/npm/v/react-spinjs.svg?style=flat-square)](https://www.npmjs.com/package/react-spinjs)

This is build on top of the fantastic spinner library, [spin.js](http://fgnass.github.io/spin.js/). This exposes spin.js as a component.

# Usage

```javascript
import ReactSpinner from 'react-spinjs';

// Put a default spinner
<ReactSpinner/>

// Pass in a config object
// See the documentation for spin.js
<ReactSpinner config={configObject}/>

// For convenience, pass in just a config
<ReactSpinner color="white"/>
```
