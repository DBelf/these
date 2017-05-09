module.exports = {
  meta: {},

  create: function(context) {
    var knownSources = ["document.URL"];

    return {

      MemberExpression: function(node){
        if (knownSources.includes(context.getSource(node))){
          switch(node.parent.type){
            case "VariableDeclarator":
              console.log("vardec: " + node.parent.id.name + "  --  " + context.getScope().type);
              break;
            case "AssignmentExpression":
              console.log("varassign: " + node.parent.type);
              break;
            default:
              break;
          }
        }
      }

    }
  }
}


//Je wil dus vinden waar hij gebruikt wordt.
//Dan wil je kijken of deze shit een onveilige use is.
