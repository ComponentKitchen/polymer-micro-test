suite("MinimalComponent", function() {

  test("behavior instantiates element template", function() {
    var element = document.createElement('simple-element');
    assert(element.root);
    assert(element.root.textContent.trim(), "Hello");
  });

});
