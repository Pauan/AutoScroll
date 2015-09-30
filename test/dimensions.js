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

  if (document.scrollingElement) {
    console.log("  scrollingElement");
    console.log("    client: " + document.scrollingElement.clientWidth + " x " +
                                 document.scrollingElement.clientHeight);
    console.log("    scroll: " + document.scrollingElement.scrollWidth + " x " +
                                 document.scrollingElement.scrollHeight);
  }
}


console.log(document.compatMode);


if (document.scrollingElement) {
  if (document.scrollingElement === document.documentElement) {
    console.log("scrollingElement === <html>");
  } else {
    console.log("scrollingElement !== <html>");
  }

  if (document.scrollingElement === document.body) {
    console.log("scrollingElement === <body>");
  } else {
    console.log("scrollingElement !== <body>");
  }
}


printDimensions("normal");


document.documentElement.style.margin = "10px";
document.body.style.margin = "10px";

printDimensions("margins");

document.documentElement.style.margin = "";
document.body.style.margin = "";


document.documentElement.style.width = "100%";
document.documentElement.style.height = "100%";
document.body.style.width = "75%";
document.body.style.height = "75%";
document.body.style.overflow = "auto";

printDimensions("overflow");

//document.documentElement.style.width = "";
//document.documentElement.style.height = "";
//document.body.style.width = "";
//document.body.style.height = "";
//document.body.overflow = "";
