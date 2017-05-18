/**
 * Created by dimitri on 16/05/2017.
 */
var fs = require('fs'),
    path = require('path'),
    esprima = require('esprima');

var GenerateAST = (function () {
    var _EXTENSION = '.js';
    var _DEFAULT_DIRECTORY = 'tmp'
    var _DEFAULT_FILENAME = 'tmp.js';
    var _FULLPATH = _DEFAULT_DIRECTORY + '/' + _DEFAULT_FILENAME;

    var gatherCode = function (filesInPath) {
        for (var i = 0; i < filesInPath.length; i++) {
            appendToFile(filesInPath[i]);
        }
    }

    var astFromFile = function (filePath) {
        var code = fs.readFileSync(filePath, 'utf-8');
        var ast = esprima.parse(code, {
            loc: true
        });
        return ast;
    }

    var createAST = function (parentPath, destination) {
        var filesInPath = gatherFiles(parentPath);
        createTmpDir(destination);
        gatherCode(filesInPath);
        ast = astFromFile(_FULLPATH);
        return ast;
    }

    var gatherFiles = function (parentPath) {
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
                filesInPath = filesInPath.concat(gatherFiles(filename, _EXTENSION)); //recurse
            }
            else if (filename.indexOf(_EXTENSION) >= 0) {
                // console.log('-- found: ', filename); //DEBUG
                filesInPath.push(filename);
            }
        }
        return filesInPath;
    }

    var createDirectory = function (dirPath) {
        var splitPath = dirPath.split('/');
        for (var i = 0; i < splitPath.length; i++) {
            if (!fs.existsSync(splitPath[i])) {
                fs.mkdirSync(splitPath[i]);
            }
        }
    }

    var createDefault = function () {
        createDirectory(_DEFAULT_DIRECTORY);
        fs.writeFile(_FULLPATH, '', (err) => {
            console.log(err);
        });
    }

    //FIXME breaks on nested folders.
    var createWithFilePath = function (destination) {
        var fullPath = destination.split('/');
        if (fullPath.length > 1) {
            createDirectory(fullPath.slice(0, -1).join('/'));
        }
        fs.writeFile(destination, '', (err) => {
            console.log(err);
        });
    }

    //FIXME calling this somehow prints null??
    var createTmpDir = function (destination) {
        if (!destination) {
            createDefault();
        } else if (~destination.indexOf('.js')) {//bitwise ~ makes it true or false
            _FULLPATH = destination;
            createWithFilePath(destination);
        } else {
            //TODO check whether forwardslash is in destination name.
            _FULLPATH = destination.concat(_DEFAULT_FILENAME);
            createWithFilePath();
        }
    }

    var appendToFile = function (filePath) {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) throw err;
            fs.appendFile(_FULLPATH, data, function (err) {
                if (err) throw err;
            });
        });
    }

    return {
        collectFiles: gatherFiles,
        createAST: createAST,
        astFromFile: astFromFile
    }
})();

module.exports = GenerateAST;