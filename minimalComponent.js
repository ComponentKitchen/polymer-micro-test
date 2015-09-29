/*
 * A small set of helper functions to go on top of polymer-micro:
 *
 *   1. <template> instantiation, including CSS style shimming
 *   2. <template> inheritance
 *   3. Polymer-style automatic node finding
 */

(function() {

// Given a component prototype, return the complete inherited template.
// Each subclass will have its template folded into the template inherited from
// its base classes. See notes at foldTemplate.
function constructInheritedTemplate(prototype) {
  var basePrototype = prototype.__proto__;
  var subTemplate = prototype.hasOwnProperty('template') && prototype.template;
  var baseTemplate = basePrototype && basePrototype.template &&
      constructInheritedTemplate(basePrototype);
  var template = foldTemplate(subTemplate, baseTemplate);
  return template;
}

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

// Given two templates, "fold" one inside the other. For now, this just entails
// putting the first inside the location of the first <content> node in the
// second template.
//
// Example: if the first (sub) template is
//
//   <template>
//     Hello, <content></content>.
//   </template>
//
// and the second (base) template is
//
//   <template>
//     <b>
//       <content></content>
//     </b>
//   </template>
//
// Then the returned folded template is
//
//   <template>
//     <b>
//       Hello, <content></content>.
//     </b>
//   </template>
//
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

// Initialize the given prototype so that it can be used to instantiate
// components. The first invocation of this will construct the component
// template, including any template portions inherited from base classes. This
// will also handle shimming CSS styles under the Shadow DOM polyfill.
// Subsequent invocations of this function will have no effect.
function initializeComponentPrototype(prototype) {

  if (prototype._initialized) {
    return; // Already initialized
  }

  // Look for the "subclasses" key. We'd much prefer to use "extends", but
  // currently Polymer passes that straight to document.registerElement(), which
  // rejects attempts to extend non-native elements.
  if (prototype.hasOwnProperty('subclasses')) {
    // This component class subclasses another one.
    var baseTag = prototype.subclasses;
    var basePrototype = getPrototypeForTag(baseTag);
    if (!basePrototype) {
      throw "Tried to subclass undefined element '" & baseTag & "'.";
    }

    // Ensure the base class is set up if it hasn't been instantiated before.
    initializeComponentPrototype(basePrototype);

    // Destructively modify the prototype's base class.
    prototype.__proto__ = basePrototype;
  }

  var template = constructInheritedTemplate(prototype);
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
