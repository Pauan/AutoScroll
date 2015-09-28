"use strict";

function printDimensions(name) {
  console.log("----");
  console.log(name);

  console.log("  window");
  console.log("    client: " + window.innerWidth + " x " + window.innerHeight);

  console.log("  <html>");
  console.log("    client: " + document.documentElement.clientWidth + " x " +
                               document.documentElement.clientHeight);
  console.log("    scroll: " + document.documentElement.scrollWidth + " x " +
                               document.documentElement.scrollHeight);

  console.log("  <body>");
  console.log("    client: " + document.body.clientWidth + " x " +
                               document.body.clientHeight);
  console.log("    scroll: " + document.body.scrollWidth + " x " +
                               document.body.scrollHeight);

  console.log("  scrollingElement");
  console.log("    client: " + document.scrollingElement.clientWidth + " x " +
                               document.scrollingElement.clientHeight);
  console.log("    scroll: " + document.scrollingElement.scrollWidth + " x " +
                               document.scrollingElement.scrollHeight);
}


console.log(document.compatMode);


printDimensions("normal");


document.documentElement.style.margin = "10px";
document.body.style.margin = "10px";

printDimensions("margins");
