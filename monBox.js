//import blessed from 'blessed';
const blessed = require('blessed')

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'monBee';

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Create a box for the node
	var box = blessed.box({
	  parent: screen,
	  mouse: true,
	  keys: true,
	  vi: true,
	  left: '25%',
	  top: '25%',
	  width: '50%',
	  height: '50%',
	  content: '{center}A very simple box\n\n\nq to quit{/center}',
	  tags: true,
	  border: {
		type: 'line'
	  },
	  style: {
		fg: 'brightwhite',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	// Append our box to the screen.
	screen.append(box);

	// Focus our element.
	box.focus();

	screen.render()
