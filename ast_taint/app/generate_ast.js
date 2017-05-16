/**
 * Created by dimitri on 16/05/2017.
 */
var fs = require('fs'),
    path = require('path'),
    esprima = require('esprima');

var GenerateAST = (function () {
    var _EXTENSION = '.js';

    var collectFiles = function (parentPath) {
        var filesInPath = [];

        if (!fs.existsSync(parentPath)) {
            // console.log("no dir ",path); //DEBUG
            return;
        }

        var files = fs.readdirSync(parentPath);

        for (var i = 0; i < files.length; i++) {
            var filename = path.join(parentPath, files[i]);
            var stat = fs.lstatSync(filename);

            if (stat.isDirectory()) {
                filesInPath = filesInPath.concat(collectFiles(filename, _EXTENSION)); //recurse
            }
            else if (filename.indexOf(_EXTENSION) >= 0) {
                // console.log('-- found: ', filename); //DEBUG
                filesInPath.push(filename);
            }
        }
        return filesInPath;
    }

    return {
        collectFiles: collectFiles
    }
})();

module.exports = GenerateAST;