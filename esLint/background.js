window.addEventListener("message", function(event) {
  if (event.source == window &&
      event.data.direction &&
      event.data.direction == "from-page-script") {
    alert("Content script received message: \"" + event.data.message + "\"");
  }
});
