/**
 * Created by dimitri on 16/05/2017.
 */
var fs = require('fs'),
    path = require('path'),
    esprima = require('esprima');

var GenerateAST = (function (){
    var _EXTENSION = '.js';

    var collectFiles = function(path){
        if (!fs.existsSync(path)){
            // console.log("no dir ",path); //DEBUG
            return;
        }
        
    }

    return {
        collectFiles: collectFiles
    }
})();

module.exports = GenerateAST;