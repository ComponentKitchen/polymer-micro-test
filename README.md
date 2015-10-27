# polymer-micro-test

This project explores the question: What is the smallest amount of code that
must be added to [polymer-micro](https://www.polymer-project.org/1.0/docs/devguide/experimental.html#polymer-micro) to create a web component environment that can meet the needs of our open source
component collection, [Basic Web Components](https://github.com/basic-web-components/basic-web-components)?

The minimalComponent.js file defines a Polymer behavior that can be used with
polymer-micro. The behavior adds the following features:

1. Creation of a shadow root
2. <template> instantiation
3. Shimming of CSS styles under the Shadow DOM polyfill
4. Polymer-style automatic node finding (not sure if we really need this)

The file test-element.html uses polymer-micro and the above behavior to define a
very simple component. The page index.html shows that component in use. You
can view that page in the
[live demo](https://componentkitchen.github.io/polymer-micro-test/index.html).
