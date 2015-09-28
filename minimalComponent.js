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

function constructTemplate(prototype) {
  var basePrototype = prototype.__proto__;
  var subTemplate = prototype.hasOwnProperty('template') && prototype.template;
  var baseTemplate = basePrototype && basePrototype.template &&
      constructTemplate(basePrototype);
  var template = foldTemplate(subTemplate, baseTemplate);
  return template;
}

function foldTemplate(subTemplate, baseTemplate) {

  var subClone = subTemplate && subTemplate.content.cloneNode(true);
  var baseClone = baseTemplate && baseTemplate.content.cloneNode(true);

  if (!subClone && !baseClone) {
    // No templates.
    return null;
  }

  var folded = document.createElement('template');
  if (subTemplate && !baseTemplate) {
    // Sub only
    folded.content.appendChild(subClone);
  } else if (!subTemplate && baseTemplate) {
    // Base only
    folded.content.appendChild(baseClone);
  } else {
    // Sub and base; need to fold former into latter.
    var contentNode = baseClone.querySelector('content');
    if (contentNode) {
      contentNode.parentNode.replaceChild(subClone, contentNode);
      folded.content.appendChild(baseClone);
    } else {
      // No place in base for sub template -- throw sub template away.
      folded.content.appendChild(baseClone);
    }
  }

  return folded;
}

function getPrototypeForTag(tag) {
  // REVIEW: Is there a more direct way to look this up?
  // TODO: memoize
  var element = document.createElement(tag);
  return element.__proto__;
}

function initializeComponentPrototype(prototype) {

  if (prototype._initialized) {
    return; // Already initialized
  }

  if (prototype.hasOwnProperty('subclasses')) {
    // This component class subclasses another one.
    var baseTag = prototype.subclasses;
    var basePrototype = getPrototypeForTag(baseTag);
    if (!basePrototype) {
      throw "Tried to subclass undefined element '" & baseTag & "'.";
    }
    initializeComponentPrototype(basePrototype);

    // Destructively modify the prototype's base class.
    prototype.__proto__ = basePrototype;
  }

  var template = constructTemplate(prototype);
  if (template) {
    shimTemplateStyles(template, prototype.is);
    prototype._template = template;
  }

  prototype._initialized = true;

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

    initializeComponentPrototype(this.__proto__);

    if (this._template) {

      // Instantiate template.
      this.root = this.createShadowRoot();
      var clone = document.importNode(this._template.content, true);
      this.root.appendChild(clone);

      // Create this.$.<id> properties.
      createReferencesToNodesWithIds(this);
    }

    // Initialize property values from attributes.
    this._marshalAttributes();
  }

};

})();
