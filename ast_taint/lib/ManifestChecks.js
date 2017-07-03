/**
 * Created by dimitri on 03/07/2017.
 */
const fs = require('fs');
const path = require('path');

const ManiFestChecks = (function checks() {
  const getJSON = function (manifestPath) {
    const obj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return obj;
  };

  class Manifest {
    constructor(pathToManifest) {
      this.path = pathToManifest;
      this.manifestJSON = getJSON(pathToManifest);
    }

    contentSecurityPolicy() {
      if (Object.prototype.hasOwnProperty.call(this.manifestJSON, 'content_security_policy')) {
        return this.manifestJSON.content_security_policy;
      } return 'script-src \'self\'; object-src \'self\';';
    }
  }

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

    return filesInPath.map(file => new Manifest(file));
  };

  return {
    findManifest,
  };
}());

module.exports = ManiFestChecks;
