# monBee
An Ethersphere Bee node monitor written in JavaScript for node.js

To get started the following commands, or their equivalents, should work if you don't already have node and/or npm

sudo apt-get install nodejs

sudo apt-get install npm

Then the following command should install the needed dependencies.

npm i

monBee uses blessed for drawing its TUI (Text User Interface)

monBee uses axios to communicate to bee's Debug API (to be converted to bee-js)

monBee will eventually use @ethersphere/bee-js instead of axios

Note: This is my first-ever github repository and public release of an open-source project.  I am NOT a JavaScript programmer, but ported my lua/moai code to node.js so that it can be more easily used (and hopefully expanded) by others.
