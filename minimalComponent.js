window.MinimalComponent = {

  created: function() {
    this.root = this.createShadowRoot();
    this.root.appendChild(this.template.content.cloneNode(true));
  },

  get ownerDocument() {
    var currentScript = document._currentScript || document.currentScript;
    return currentScript.ownerDocument;
  }

};
