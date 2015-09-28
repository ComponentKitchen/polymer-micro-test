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

function findClassDefiningTemplate(obj) {
  if (obj.hasOwnProperty('template')) {
    return obj;
  } else if (obj.__proto__) {
    return findClassDefiningTemplate(obj.__proto__);
  } else {
    return null;
  }
}

function getInitializedTemplate(component) {
  if (typeof component._initializedTemplate === 'undefined') {
    var classDefiningTemplate = findClassDefiningTemplate(component);
    var template = classDefiningTemplate.template;
    var initializedTemplate;
    var baseClass = findClassDefiningTemplate(classDefiningTemplate.__proto__);
    if (baseClass) {
      var baseClassTemplate = getInitializedTemplate(baseClass);
      initializedTemplate = foldTemplates(template, baseClassTemplate);
    } else {
      initializedTemplate = document.createElement('template');
      initializedTemplate.content.appendChild(template.content.cloneNode(true));
    }
    shimTemplateStyles(initializedTemplate, component.is);
    classDefiningTemplate._initializedTemplate = initializedTemplate;
  }
  return component._initializedTemplate;
}

// Invoke basic style shimming with ShadowCSS.
function shimTemplateStyles(template, tag) {
  if (window.ShadowDOMPolyfill) {
    WebComponents.ShadowCSS.shimStyling(template.content, tag);
  }
}

window.MinimalComponent = {

  // Use polymer-micro created callback to initialize the component.
  created: function() {
    var template = getInitializedTemplate(this);
    if (template) {

      // Instantiate template.
      this.root = this.createShadowRoot();
      var clone = document.importNode(template.content, true);
      this.root.appendChild(clone);

      // Create this.$.<id> properties.
      createReferencesToNodesWithIds(this);
    }

    // Initialize property values from attributes.
    this._marshalAttributes();
  }

};

})();
