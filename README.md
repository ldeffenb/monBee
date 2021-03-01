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

Finally, to run monBee, use the following command:

node monBee.js 2>monBee.err

This will default to monitoring the bee node whose Debug API is at http://localhost:1635

To monitor other, or even multiple, bee nodes, use:

node monBee.js http://localhost:1635 http://localhost:1638 http://192.168.10.177:1635 2>monBee.err

If you want monBee to cashout any discovered cashable checks, add --cashout anywhere on the command line.

(the 2>monBee.err will capture any error messages to monBee.err instead of messing up the TUI presentation)

Note: This is my first-ever github repository and public release of an open-source project.  I am NOT a JavaScript programmer, but ported my lua/moai code to node.js so that it can be more easily used (and hopefully expanded) by others.
