/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Calendar = require('views/calendar');

    // create the main context
    var mainContext = Engine.createContext();

    // your app here
    mainContext.add(Calendar);
});
