suite("MinimalComponent", function() {

  var container = document.querySelector('#container');

  teardown(function() {
    window.attachedHook = null;
    window.createdHook = null;
  });

  test("behavior instantiates element template", function() {
    var element = document.createElement('test-template');
    assert(element.root);
    assert(element.root.textContent.trim(), "Hello");
  });

  test("template can be a string", function() {
    var element = document.createElement('test-template-string');
    assert(element.root);
    assert(element.root.textContent.trim(), "Hello");
  });

  test("component using behavior still has its own created method invoked", function(done) {
    var element;
    createdHook = function(instance) {
      assert.equal('test-created', instance.localName);
      done();
    };
    element = document.createElement('test-created');
  });

  test("outer component has its created method invoked after inner component", function(done) {
    var count = 0;
    var expectedSequence = ['test-created', 'test-containment'];
    createdHook = function(instance) {
      assert.equal(expectedSequence[count], instance.localName);
      if (count < expectedSequence.length - 1) {
        count++;
      } else {
        done();
      }
    };
    var element = document.createElement('test-containment');
  });

  test("subclass instance is also instanceof base class", function() {
    var baseElement = document.createElement('base-class');
    var baseClass = baseElement.constructor;
    var subElement = document.createElement('sub-class');
    assert(subElement instanceof baseClass);
  });

  test("subclass template inserted into base class' template", function() {
    var element = document.createElement('sub-class');
    var template = element.constructor.prototype._template;
    assert.equal(template.content.textContent, "BASE[SUB()]");
  });

  test("subclass instance has access to members inherited from base class", function() {
    var element = document.createElement('sub-class');
    assert(element.flag);
  });

  test("subclass can override members inherited from base class", function() {
    var element = document.createElement('sub-class');
    element.textContent = "Hello";
    assert.equal(element.text, "HELLO");
  });

});
