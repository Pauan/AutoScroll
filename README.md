# AutoScroll
For users on Linux or Mac, the lack of autoscroll can be a big pain. This extension can help!


Test these sites:

* `https://easywebsoc.td.com/waw/idp/login.htm?execution=e1s1`
* `9to5mac.com`
* `www.willhaben.at`
* `http://www.wind.it/it/privati/`
* `http://www.opengl.org/sdk/docs/man/xhtml/glDrawElements.xml`
* `https://www.opengl.org/sdk/docs/man/html/glDrawElements.xhtml`
* `https://twitter.com/amcharts`
* `http://addepar.github.io/ember-table/#/ember-table/simple`
* `http://blog.dogecoin.com/`
* `https://plus.google.com/`
* `https://duckduckgo.com/?q=test&ia=meanings`
* `https://upload.wikimedia.org/wikipedia/commons/1/1a/SVG_example_markup_grid.svg`

TODO

* Use SVG rather than PNG images
* Use the nice Radiance and Ambiance images provided by a user
* Disable autoscrolling on Windows (since it has native autoscrolling already) ?
* Add better scaling (slower when near the disc, faster when away from the disc, like in Firefox)
* Add configurable scaling
* Move speed should be 0 = slowest, 10 = fastest
* Use a slider for the move speed, rather than a number box
* Fix the severe bug with pinch-to-zoom on Mac
* Add better promotional images on the Chrome Web Store
* Add in an option for reversing the X and Y axis (up is down, down is up, etc.)
* Add in touchscreen/tablet support
* When scrolling horizontally, it should only scroll when the mouse is to the left/right of the disc, like in Firefox
* When scrolling vertically, it should only scroll when the mouse is to the top/bottom of the disc, like in Firefox
* Switch to the new options page system (in Chrome)

Intentional differences with Firefox
====================================

* AutoScroll does not scroll on `contenteditable` elements; Firefox does
