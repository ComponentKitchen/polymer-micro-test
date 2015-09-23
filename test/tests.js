suite("MinimalComponent", function() {

  setup(function() {
    window.createdHook = null;
  });

  test("behavior instantiates element template", function() {
    var element = document.createElement('test-template');
    assert(element.root);
    assert(element.root.textContent.trim(), "Hello");
  });

  test("component using behavior still has its own created method invoked", function(done) {
    element = document.createElement('test-created');
    assert(element.createdWasCalled);
  });

});
