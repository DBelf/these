const GenerateAST = require('./GenerateAST');
const Scope = require('./Scope');
const ManifestChecks = require('./ManifestChecks');

const analyze = function (path) {
  const ast = GenerateAST.astFromFile(path);
  const globalScope = Scope.getGlobalScope(ast);
  const vulnerabilityObject = Scope.nestedVulnerabilities(path, globalScope);
  const sources = vulnerabilityObject.sources;
  const sinks = vulnerabilityObject.sinks;
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
if(manifests.length) {
  console.log('Manifest Found:');
  manifests.forEach(manifest => console.log(manifest.contentSecurityPolicy()));
} else{
  console.log('No Manifest:');
  console.log('');
}
filesInProject.map((file) => {
  try {
    analyze(file);
  } catch (err) {
    return ;
  }
});
console.log('---------');