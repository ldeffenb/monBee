//import { Bee } from "@ethersphere/bee-js"
//import pkg from '@ethersphere/bee-js';
//const { Bee } = pkg;

//import axios from 'axios'
const axios = require('axios')
axios.default

//import blessed from 'blessed';
const blessed = require('blessed')

//const { BeeDebug } = require("@ethersphere/bee-js")

function isUndefined(value){
    // Obtain `undefined` value that's
    // guaranteed to not have been re-assigned
    var undefined = void(0);
    return value === undefined;
}

//const bee = new Bee('http://localhost:8080')
//const beeDebug = new BeeDebug('http://localhost:1635')

//const tag = await bee.createTag()
//box.setContent(tag)

function shortNum(n,plus)
{
	if (typeof(n) != "number") return n
	
	var negative, result
	if (n < 0)
	{	negative = true
		n = -n
	}

	//if (n >= 100*1000*1000*1000*1000*1000)
	//	result = (n/(1000*1000*1000*1000*1000)).toFixed(0)+'q'
	//else if (n >= 10*1000*1000*1000*1000*1000)
	//	result = (n/(1000*1000*1000*1000*1000)).toFixed(1)+'q'
	//else if (n >= 1*1000*1000*1000*1000*1000)
	//	result = (n/(1000*1000*1000*1000*1000)).toFixed(2)+'q'

	//else
	if (n >= 100*1000*1000*1000*1000)
		result = (n/(1000*1000*1000*1000)).toFixed(0)+'t'
	else if (n >= 10*1000*1000*1000*1000)
		result = (n/(1000*1000*1000*1000)).toFixed(1)+'t'
	else if (n >= 1*1000*1000*1000*1000)
		result = (n/(1000*1000*1000*1000)).toFixed(2)+'t'

	else if (n >= 100*1000*1000*1000)
		result = (n/(1000*1000*1000)).toFixed(0)+'b'
	else if (n >= 10*1000*1000*1000)
		result = (n/(1000*1000*1000)).toFixed(1)+'b'
	else if (n >= 1*1000*1000*1000)
		result = (n/(1000*1000*1000)).toFixed(2)+'b'

	else if (n >= 100*1000*1000)
		result = (n/(1000*1000)).toFixed(0)+'m'
	else if (n >= 10*1000*1000)
		result = (n/(1000*1000)).toFixed(1)+'m'
	else if (n >= 1*1000*1000)
		result = (n/(1000*1000)).toFixed(2)+'m'

	else if (n >= 100*1000)
		result = (n/(1000)).toFixed(0)+'k'
	else if (n >= 10*1000)
		result = (n/(1000)).toFixed(1)+'k'
	else if (n >= 1*1000)
		result = (n/(1000)).toFixed(2)+'k'
		
	else result = ''+n
	
	if (negative) result = "-"+result
	else if (plus) result = "+"+result
	return result
}

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'monBee';

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

var boxCount = 0

var boxWidth = 45

function createBox(URL)
{

// Create a box for the node
	var box = blessed.box({
	  parent: screen,
	  mouse: true,
	  keys: true,
	  vi: true,
	  left: (boxCount%2)*boxWidth,
	  top: Math.trunc(boxCount/2)*8,
	  width: boxWidth+1,
	  height: 9,
	  content: '{center}'+URL+'{/center}',
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

	boxCount = boxCount + 1

	return box
}

var cashBox, outputBox

function addBoxes()
{

	cashBox = blessed.box({
	  top: 0,
	  left: 2*boxWidth,
	  width: '100%-'+(2*boxWidth),
	  height: '100%',
	  content: '{center}\nnew\ncashable\nchecks\nwill\nappear\nhere\n\eventually!{/center}',
	  scrollable: true,
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

	screen.append(cashBox);

	outputBox = blessed.box({
	  top: Math.trunc((boxCount+1)/2)*8+1,
	  left: 0,
	  width: 2*boxWidth,
	  height: '100%',
	  content: '{left}error and trace\noutput will appear here\nand scroll down{/left}',
	  scrollable: true,
	  tags: true,
	  style: {
		fg: 'white',
		bg: 'black',	// Was magenta
		border: {
		  fg: '#f0f0f0'
		},
		hover: {
		  bg: 'green'
		}
	  }
	});

	screen.append(outputBox);
}

function showError(text)
{
	var today = new Date().toJSON().substring(10,19).replace('T',' ');
	var line = today+' '+text
	console.error(line)
	outputBox.insertLine(0, line);
	screen.render()
}

// If box is focused, handle `enter`/`return` and give us some more content.
//box.key('enter', function(ch, key) {
  //box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
//  box.setContent(JSON.stringify(tag));
//  box.setLine(1, 'bar');
//  box.insertLine(1, 'foo');
//  screen.render();
//});


var peerMAs = new Map()

class beeMonitor
{
	constructor(url)
	{
		this.URL = url
		this.lastValues = {}
		this.cashedChecks = 0
		this.box = createBox(url)
		//this.maPromise = this.populateMultiAddr()
		
		//this.beeDebug = new BeeDebug(url)

		// Work around spelling misteak (sic) on getChequebookBalance pending correction
		//if (isUndefined(this.beeDebug.getChequebookBalance))
			//this.beeDebug.getChequebookBalance = this.beeDebug.getChequeubookBalance
	}
	
	async populateMultiAddr()
	{
		var addresses = await axios({ method: 'get', url: this.URL+'/addresses' })
		for (var i=0; i<addresses.data.underlay.length; i++)
		{
			var p = addresses.data.overlay
			var a = addresses.data.underlay[i]
			if (a.substring(0,16) == '/ip4/192.168.10.')
			{
				this.multiAddr = a
				peerMAs.set(addresses.data.overlay,a)
				//showError(this.URL+' peer '+p+' multiAddr '+a)
				break
			}
		}
	}

	colorValue(value, forcePlus)
	{
		if (value < 0)
		{	return '{red-fg}'+shortNum(value)+'{/red-fg}'
		} else if (value > 0)
		{	if (isUndefined(forcePlus))
			{	return '{green-fg}'+shortNum(value)+'{/green-fg}'
			}
			return '{green-fg}+'+shortNum(value)+'{/green-fg}'
		}
		return '{white-fg}'+shortNum(value)+'{/white-fg}'
	}

	colorDelta(name, value, forcePlus)
	{
		if (isUndefined(this.lastValues[name]))
		{	this.lastValues[name] = value
			return ''
		}
		
		var delta = value - this.lastValues[name]
		this.lastValues[name] = value;
		if (delta != 0)
		{
			return ' ('+this.colorValue(delta, forcePlus)+')'
		}
		return ''
	}

	colorSpecificDelta(previousValue, value, forcePlus)
	{
		var delta = value - previousValue
		if (delta != 0)
		{
			return ' ('+this.colorValue(delta, forcePlus)+')'
		}
		return ''
	}

	async captureCashes(URL, connected)
	{
		var cashes = await axios({ method: 'get', url: URL+'/chequebook/cheque' })
		// beeDebug.getLastCheques()

		var totalreceived=0, totalcashed=0, totalcashable=0, totalpending=0
		
		var foundOne
		var checkCount = 0
		var host = URL.substring(URL.length-8)

		for (var i=0; i<cashes.data.lastcheques.length; i++)
		{
			var v = cashes.data.lastcheques[i]
			if (isUndefined(connected) || connected[v.peer])
			{
			if (v.lastreceived != null && !isUndefined(v.lastreceived.payout))
			{
				totalreceived = totalreceived + v.lastreceived.payout
				try
				{
					var cashout
					try
					{	cashout = await axios({ method: 'get', url: URL+'/chequebook/cashout/'+v.peer})
						// beeDebug.getLastCashoutAction(v.peer)
					} catch (error) {
						//print(string.format("Peer(%s) First Cashout!", tostring(v.peer)))
						if (error.response.status == 404)
						{
							try
							{
								showError('404 from '+URL+'/chequebook/cashout/'+v.peer)
								cashout = await axios({ method: 'get', url: URL+'/chequebook/cashout/'+v.peer})
							} catch (error) {
								if (error.response.status == 404)
									showError('SECOND 404 from '+URL+'/chequebook/cashout/'+v.peer)
								else showError("RETRY: "+error)
							}
						} else showError(error)
						cashout = {"data":{"cumulativePayout": 0}}
					}
					checkCount = checkCount + 1
					if (!isUndefined(cashout.data.cumulativePayout))
					{
						totalcashed = totalcashed + cashout.data.cumulativePayout
						if (v.lastreceived.payout > cashout.data.cumulativePayout)
						{
							totalcashable = totalcashable + 1
							//updateScroll(host.." "..shortID(v.peer,4).." "..shortColor(v.lastreceived.payout-cashout.data.cumulativePayout))
							//if not cashCheck(URL, v.peer, callback) then
								totalpending = totalpending + 1
							//end
							var today = new Date().toJSON().substring(10,19).replace('T',' ');
							cashBox.insertLine(1, today+' '+host+' {green-fg}'+this.colorValue(v.lastreceived.payout-cashout.data.cumulativePayout)+'{/green-fg}');
							screen.render()
							foundOne = true
						}
					}
				} catch (error) {
					showError(error);
				}
			}
			}
			//else showError(v.peer+' not connected')
		}
		//if not foundOne then updateScroll(string.format("noCash:%s %d in %ds", host, checkCount, MOAISim.getDeviceTime()-start)) end
		
		return {totalreceived, totalcashed, totalcashable, totalpending}
	}

	async refreshBox () {

		var start = new Date()
		var today = new Date().toJSON().substring(10,19).replace('T',' ');
		this.box.setLine(-1, '{center}{bold}'+today+' '+this.URL+'{/bold} {red-fg}refresh{/red-fg}{/center}')
		screen.render()

		var debugURL = this.URL
	
		try
		{
		const peers = await axios({ method: 'get', url: debugURL+'/peers' })

		var connected = {}
		for (var i=0; i<peers.data.peers.length; i++)
		{	connected[peers.data.peers[i].address] = true
		}
		
		if (isUndefined(this.multiAddr))
			await this.populateMultiAddr()

		if (!isUndefined(this.multiAddr))
		{
			for (let [p, ma] of peerMAs.entries())
			{
				if (ma != this.multiAddr)
				{	if (!connected[p])
					{
						try
						{	const connection = await axios({ method: 'post', url: debugURL+'/connect'+ma })
							if (connection.data.address == p)
							{	showError(debugURL+' connected to '+ma)
							} else showError(debugURL+' connected to '+JSON.stringify(connection.data.address))
						} catch (error)
						{	showError(error)
						}
					}
					//else showError(debugURL+' already connected to '+ma)
				}
			}
		} else showError(debugURL+' ma='+this.multiAddr)
	
		const balances = await axios({ method: 'get', url: debugURL+'/balances' })
		// beeDebug.getAllBalances()
		
		var negTotal = 0
		var posTotal = 0
		var closeCount = 0
		var reallyCloseCount = 0
		var paymentThreshold = 10000000000000
		var paymentEarly = 1000000000000
		var paymentTrigger = paymentThreshold - paymentEarly
		
		for (var i=0; i<balances.data.balances.length; i++)
		{
			var b = balances.data.balances[i]
			if (b.balance < 0)
				negTotal = negTotal + b.balance
			else if (b.balance > 0)
			{
				posTotal = posTotal + b.balance
				if (connected[b.peer])
				{
					if (b.balance > (paymentTrigger) * 0.99)
						reallyCloseCount = reallyCloseCount + 1
					else if (b.balance > (paymentTrigger) * 0.98)
						closeCount = closeCount + 1
				}
			}
		}
		
		var balTotal = negTotal + posTotal
		var closeString = ""
		if (reallyCloseCount > 0)
			closeString = ' ~{yellow-fg}'+reallyCloseCount+'{/yellow-fg}'
		else if (closeCount > 0)
			closeString = ' ~'+closeCount
		
		const settlements = await axios({ method: 'get', url: debugURL+'/settlements' })
		// beeDebug.getAllSettlements()
		var netSettle = settlements.data.totalreceived-settlements.data.totalsent
		
		var checkbook = await axios({ method: 'get', url: debugURL+'/chequebook/balance' })
		//var balance = await this.beeDebug.getChequebookBalance()
		
		var cashLine = ""
		if (isUndefined(this.cashLast) || (new Date()-this.cashLast) > 5*60*1000)	// Time for a full pass, every 5 minutes in msec
		{
			if (isUndefined(this.cashLast)) this.cashLast = new Date()	// Temporarily for the elapsed math
			var elapsed = new Date()-this.cashLast
			var host = debugURL.substring(debugURL.length-8)
			var today = new Date().toJSON().substring(10,19).replace('T',' ');
			cashBox.insertLine(1, today+' '+host+' cashLine '+elapsed+'ms');
			
			this.cashLast = new Date()
			var cashes = await this.captureCashes(debugURL)	// get ALL peers
			var netCashed = cashes.totalreceived-cashes.totalcashed
			var cashable = ""
			if (cashes.totalcashable > 0)
			{
				this.cashedChecks = this.cashedChecks + cashes.totalcashable - cashes.totalpending
				cashable = ' '+this.colorValue(cashes.totalcashable)+'!'
			}
			var cashed = ""
			if (this.cashedChecks > 0) cashed = this.colorValue(this.cashedChecks)+' '
			cashLine = '{center}'+cashed+'CHECKS: '+this.colorValue(cashes.totalreceived)+this.colorValue(-cashes.totalcashed,true)+'='+this.colorValue(netCashed)+this.colorDelta('CASHED',netCashed)+cashable+'{/center}'
		} else	// Just do a connected peer pass
		{
			var cashes = await this.captureCashes(debugURL, connected)	// get just connected peers
			var netCashed = cashes.totalreceived-cashes.totalcashed
			var cashable = ""
			if (cashes.totalcashable > 0)
			{
				this.cashedChecks = this.cashedChecks + cashes.totalcashable - cashes.totalpending
				cashable = ' '+this.colorValue(cashes.totalcashable)+'!'
			}
			var cashed = ""
			if (this.cashedChecks > 0) cashed = this.colorValue(this.cashedChecks)+' '
			cashLine = '{center}'+cashed+'Checks: '+this.colorValue(cashes.totalreceived)+this.colorValue(-cashes.totalcashed,true)+'='+this.colorValue(netCashed)+this.colorDelta('cashed',netCashed)+cashable+'{/center}'
		}
		
		var totalNet = balTotal + netSettle
		if (isUndefined(this.startingNet)) this.startingNet = totalNet

		var elapsed = Math.trunc((new Date() - start)/1000+0.5)
		today = new Date().toJSON().substring(10,19).replace('T',' ');
		
		this.box.setLine(-1, '{center}{bold}'+today+' '+this.URL+'{/bold} {blue-fg}'+elapsed+'s{/blue-fg}{/center}')
		this.box.setLine(1, '{center}Connected: '+peers.data.peers.length+this.colorDelta('connected',peers.data.peers.length,true)+'{/center}')
		this.box.setLine(2, '{center}Peers: '+balances.data.balances.length+''+this.colorDelta('peers',balances.data.balances.length,true)+
						' Net:'+this.colorValue(totalNet)+this.colorSpecificDelta(this.startingNet,totalNet)+'{/center}')
		this.box.setLine(3, '{center}CheckBook: '+this.colorValue(checkbook.data.totalBalance)+'('+this.colorValue(checkbook.data.availableBalance)+')'+this.colorDelta('checkbook',checkbook.data.availableBalance,true)+'{/center}')
		//this.box.setLine(3, '{center}CheckBook: '+this.colorValue(balance.totalBalance)+'('+this.colorValue(balance.availableBalance)+')'+this.colorDelta('checkbook',balance.availableBalance,true)+'{/center}')
		this.box.setLine(3, '{center}CheckBook: '+this.colorValue(checkbook.data.totalBalance)+'('+this.colorValue(checkbook.data.availableBalance)+')'+this.colorDelta('checkbook',checkbook.data.availableBalance,true)+'{/center}')
		this.box.setLine(4, cashLine)
		this.box.setLine(5, '{center}Settled: '+this.colorValue(settlements.data.totalreceived)+this.colorValue(-settlements.data.totalsent)+'='+this.colorValue(netSettle)+this.colorDelta('netSettle',netSettle)+'{/center}')
		this.box.setLine(6, '{center}Pending: '+this.colorValue(posTotal)+this.colorValue(negTotal)+'='+this.colorValue(balTotal)+this.colorDelta('balance',balTotal)+closeString+'{/center}')
		} catch (error)
		{	showError(error)
			this.box.setContent("")
			this.box.setLine(-1, '{center}{bold}'+today+' '+this.URL+'{/bold} {red-fg}FAILED{/red-fg}{/center}')
		}
		screen.render()
	}
}

const objs = []

if (process.argv.length < 3)
{	var defaultURL = 'http://127.0.0.1:1635'
	objs[0] = new beeMonitor(defaultURL)
	console.error('Usage: '+process.argv[0]+' '+process.argv[1]+' http://127.0.0.1:1635 <http://127.0.0.1:1638 <...>>')
	console.error('      Defaulting to '+defaultURL)
} else
{
	for (var i=2; i<process.argv.length; i++)
		objs[i-2] = new beeMonitor(process.argv[i])
}
addBoxes()
screen.render()

async function testIt()
{
	const overlay = await beeDebug.getOverlayAddress()
	console.error(overlay)
	const checkbook = await beeDebug.getChequebookAddress()
	console.error(checkbook)
	console.error("getChequebookBalance="+beeDebug.getChequebookBalance)
	console.error("getChequebookBalance="+beeDebug.getChequeubookBalance)
	const balance = await beeDebug.getChequebookBalance()
	console.error(balance)
	const balance2 = await beeDebug.getChequeubookBalance()
	console.error(balance2)
}
//testIt()

async function refreshScreen()
{
	var start = new Date()
	var now = new Date()
	//console.error(typeof(now)+' '+now)
	//var tzOffset = now.getTimezoneOffset()
	//console.error(typeof(tzOffset)+' '+tzOffset)
	//now = now + tzOffset
	//console.error(typeof(now)+' '+now)
	var today = now.toJSON().substring(10,19).replace('T',' ');
	today = now.toLocaleTimeString()
	cashBox.setLine(0, '{center}{bold}'+today+'{/bold} {red-fg}(refresh){/red-fg}{/center}')
	screen.render()

	var promises = []
	var broken = []
	for (var i=0; i<objs.length; i++)
		try { promises[i] = objs[i].refreshBox() }
		catch (error) { showError(error); broken[i] = true }
	for (var i=0; i<objs.length; i++)
		if (!broken[i])
			try { await promises[i] }
			catch (error) { showError(error) }
		else showError(objs[i].url+' broken promise!')

	var elapsed = Math.trunc((new Date() - start)/1000+0.5)
	today = new Date().toJSON().substring(10,19).replace('T',' ');
	cashBox.setLine(0, '{center}{bold}'+today+'{/bold} {blue-fg}('+elapsed+'s){/blue-fg}{/center}')
	screen.render()
	
    setTimeout(refreshScreen, 60000);
}

refreshScreen();

