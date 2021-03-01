# monBee
An Ethersphere Bee node monitor written in JavaScript for node.js

To get started the following commands, or their equivalents, should work if you don't already have node and/or npm

sudo apt-get install nodejs

sudo apt-get install npm

Or for Windows or macOS, https://nodejs.org/en/download/

You'll also need git to clone this repository: https://git-scm.com/download/win

Then the following command should install the needed dependencies when executed in the cloned directory.

npm i

monBee uses blessed for drawing its TUI (Text User Interface)

monBee uses axios to communicate to bee's Debug API (to be converted to bee-js)

monBee will eventually use @ethersphere/bee-js instead of axios

Finally, to run monBee, use the following command:

node monBee.js

This will default to monitoring the bee node whose Debug API is at http://localhost:1635

To monitor other, or even multiple, bee nodes, use:

node monBee.js http://localhost:1635 http://localhost:1638 http://192.168.10.177:1635

If you want monBee to cashout any discovered cashable checks, add --cashout anywhere on the command line.

If you add --debug and 2>monBee.err to the command line, any errors or debug logs will be written to monBee.err to subsequently provide to the developer.

Note: This is my first-ever github repository and public release of an open-source project.  I am NOT a JavaScript programmer, but ported my lua/moai code to node.js so that it can be more easily used (and hopefully expanded) by others.
