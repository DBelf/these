module.exports = {
  meta: {},
  create: function(context) {
    return {
      MemberExpression: function(node){
        console.log(context.getSource(node));
      }
    }
  }
}
