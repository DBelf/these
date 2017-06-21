const GenerateAST = require('./GenerateAST');
const Scope = require('./Scope');
const fs = require('fs');
const path = require('path');

const findManifest = function gatherFiles(projectPath) {
  let filesInPath = [];
  if (!fs.existsSync(projectPath)) {
    // console.log("no dir ",path); //DEBUG
    return filesInPath;
  }
  const files = fs.readdirSync(projectPath);
  files.forEach((filePath) => {
    const filename = path.join(projectPath, filePath);
    const stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      filesInPath = filesInPath.concat(gatherFiles(filename)); // recurse
    } else if (filename.endsWith('manifest.json')) {
      // console.log('-- found: ', filename); //DEBUG
      filesInPath.push(filename);
    }
  });

  return filesInPath;
};

const readManifest = function (manifestPath) {
  console.log(manifestPath);
  const obj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (obj.hasOwnProperty('content_security_policy')) {
    console.log(obj['content_security_policy']);
  }
};

const analyze = function (path) {
  console.log(path);
  const ast = GenerateAST.astFromFile(path);
  const globalScope = Scope.getGlobalScope(ast);
  const sources = Scope.nestedVariableSources(path, globalScope);
  const sinks = Scope.nestedSinks(path, globalScope);
  sources.forEach((source) => {
    if (source) {
      source.saveToFile();
    }
  });
  sinks.forEach((sink) => {
    if (sink) {
      sink.saveToFile();
    }
  });
};

if (process.argv.length < 3) {
  console.log('Usage: ASTTaint.js file.js');
  process.exit(1);
}

const projectPath = process.argv[2];
console.log(`Reading ${projectPath}`);

const filesInProject = GenerateAST.collectFiles(projectPath);
const manifest = findManifest(projectPath);
if (manifest.length >= 1) {
  readManifest(manifest[0]);
}
filesInProject.map(file => analyze(file));
