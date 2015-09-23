(function() {

// Polymer-style automatic node finding.
// See https://www.polymer-project.org/1.0/docs/devguide/local-dom.html#node-finding.
// This feature is not available in polymer-micro, so we provide a basic
// version of this ourselves.
function annotateNodesWithIds(instance) {
  instance.$ = {};
  var nodesWithIds = instance.root.querySelectorAll('[id]');
  [].forEach.call(nodesWithIds, function(node) {
    var id = node.getAttribute('id');
    instance.$[id] = node;
  });
}

window.MinimalComponent = {

  created: function() {
    // Instantiate template.
    this.root = this.createShadowRoot();
    this.root.appendChild(this.template.content.cloneNode(true));

    // Initialize property values from attributes.
    annotateNodesWithIds(this);
    this._marshalAttributes();
  },

  get ownerDocument() {
    var currentScript = document._currentScript || document.currentScript;
    return currentScript.ownerDocument;
  }

};

})();
