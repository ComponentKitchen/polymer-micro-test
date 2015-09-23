/*
 * A minimal set of helper functions to go on top of polymer-micro:
 *
 *   1. <template> instantiation
 *   2. Polymer-style automatic node finding
 */

(function() {

// Polymer-style automatic node finding.
// See https://www.polymer-project.org/1.0/docs/devguide/local-dom.html#node-finding.
// This feature is not available in polymer-micro, so we provide a basic
// version of this ourselves.
function createReferencesToNodesWithIds(instance) {
  instance.$ = {};
  var nodesWithIds = instance.root.querySelectorAll('[id]');
  [].forEach.call(nodesWithIds, function(node) {
    var id = node.getAttribute('id');
    instance.$[id] = node;
  });
}

window.MinimalComponent = {

  // Use polymer-micro created callback to initialize the component.
  created: function() {

    if (this.template) {
      // Instantiate template.
      this.root = this.createShadowRoot();
      this.root.appendChild(this.template.content.cloneNode(true));

      // Create this.$.<id> properties.
      createReferencesToNodesWithIds(this);
    }

    // Initialize property values from attributes.
    this._marshalAttributes();
  },

  get ownerDocument() {
    // Support both polyfilled and native HTML Imports.
    var currentScript = document._currentScript || document.currentScript;
    return currentScript.ownerDocument;
  }

};

})();