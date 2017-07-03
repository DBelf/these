const GenerateAST = require('./GenerateAST');
const Scope = require('./Scope');
const ManifestChecks = require('./ManifestChecks');
const fs = require('fs');

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
const manifests = ManifestChecks.findManifest(projectPath);
manifests.forEach(manifest => console.log(manifest.contentSecurityPolicy()));
filesInProject.map(file => analyze(file));
