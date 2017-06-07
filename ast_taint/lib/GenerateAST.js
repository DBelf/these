/**
 * Created by dimitri on 16/05/2017.
 */
const fs = require('fs');
const path = require('path');
const esprima = require('esprima');

const GenerateAST = (function generate() {
  const EXTENSION = '.js';
  const DEFAULT_DIRECTORY = 'tmp';
  const DEFAULT_FILENAME = 'tmp.js';
  let FULLPATH = `${DEFAULT_DIRECTORY}/${DEFAULT_FILENAME}`;

  const appendToFile = function (filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      fs.appendFile(FULLPATH, data, (error) => {
        if (error) throw error;
      });
    });
  };

  const gatherCode = function (filesInPath) {
    filesInPath.forEach(file => appendToFile(file));
  };

  const astFromFile = function (filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = esprima.parse(code, {
      loc: true,
    });
    return ast;
  };

  const gatherFiles = function (parentPath) {
    let filesInPath = [];
    if (!fs.existsSync(parentPath)) {
      // console.log("no dir ",path); //DEBUG
      return filesInPath;
    }
    const files = fs.readdirSync(parentPath);
    files.forEach((filePath) => {
      const filename = path.join(parentPath, filePath);
      const stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        filesInPath = filesInPath.concat(gatherFiles(filename, EXTENSION)); // recurse
      } else if (filename.indexOf(EXTENSION) >= 0) {
        // console.log('-- found: ', filename); //DEBUG
        filesInPath.push(filename);
      }
    });
    return filesInPath;
  };

  const createDirectory = function (dirPath) {
    const splitPath = dirPath.split('/');
    splitPath.forEach((pathPart) => {
      if (!fs.existsSync(pathPart)) {
        fs.mkdirSync(pathPart);
      }
    });
  };

  const createDefault = function () {
    createDirectory(DEFAULT_DIRECTORY);
    fs.writeFile(FULLPATH, '', (err) => {
      console.log(err);
    });
  };

  // FIXME breaks on nested folders.
  const createWithFilePath = function (destination) {
    const fullPath = destination.split('/');
    if (fullPath.length > 1) {
      createDirectory(fullPath.slice(0, -1).join('/'));
    }
    fs.writeFile(destination, '', (err) => {
      console.log(err);
    });
  };

  // FIXME calling this somehow prints null??
  const createTmpDir = function (destination) {
    if (!destination) {
      createDefault();
    } else if (destination.indexOf('.js') >= 0) { // bitwise ~ makes it true or false
      FULLPATH = destination;
      createWithFilePath(destination);
    } else {
      // TODO check whether forwardslash is in destination name.
      FULLPATH = destination.concat(DEFAULT_FILENAME);
      createWithFilePath();
    }
  };

  const createProjectAST = function (parentPath, destination) {
    const filesInPath = gatherFiles(parentPath);
    createTmpDir(destination);
    gatherCode(filesInPath);

    const ast = astFromFile(FULLPATH);
    return ast;
  };

  return {
    collectFiles: gatherFiles,
    createProjectAST,
    astFromFile,
  };
}());

module.exports = GenerateAST;
