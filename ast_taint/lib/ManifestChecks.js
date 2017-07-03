/**
 * Created by dimitri on 03/07/2017.
 */


const ManiFestChecks = (function checks() {
  const getJSON = function (path) {

  };

  class Manifest {
    constructor(pathToManifest) {
      this.path = pathToManifest;
      this.manifestJson = getJSON(pathToManifest);
    }
  }


  return {

  };
}());
