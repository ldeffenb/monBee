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

var paymentThreshold = 10000000000000
var paymentEarly = 1000000000000
var paymentTrigger = paymentThreshold - paymentEarly

function specificLocalTime(when)
{
	return when.toLocaleTimeString('en-GB')	// en-GB gets a 24hour format, but amazingly local time!
}

function currentLocalTime()
{
	return specificLocalTime(new Date())
}

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
var boxes = []	// for focus tabbing
var boxFocus = 0
var boxColors = [ 'white', 'blue', 'red', 'green', 'magenta', 'yellow' ]
var boxWidth = 45

screen.key(['tab'], function (ch, key) {
	boxes[boxFocus].style.border.fg = 'white'
	boxFocus = (boxFocus+1)%boxCount
	boxes[boxFocus].style.border.fg = 'green'
	screen.render()
})

var numWidth = 2

function createBox(URL)
{

// Create a box for the node
	var box = blessed.box({
	  parent: screen,
	  mouse: true,
	  keys: true,
	  vi: true,
	  left: (boxCount%numWidth)*boxWidth,
	  top: Math.trunc(boxCount/numWidth)*8,
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
	boxFocus = boxCount	// index of focussed box
	boxes[boxCount] = box	// For later focus tabbing
	
box.key(['c'], function (ch, key) {
	showError(JSON.stringify(ch)+' Got key '+JSON.stringify(key))
})

	boxCount = boxCount + 1

	return box
}

var cashBox, outputBox

function addBoxes()
{

	cashBox = blessed.box({
	  top: 0,
	  left: numWidth*boxWidth,
	  width: '100%-'+(numWidth*boxWidth),
	  height: '100%',

	  content: '{center}\n\nThreshold: '+shortNum(paymentThreshold)+'\nEarly:     '+shortNum(paymentEarly)+'\nTrigger:   '+shortNum(paymentTrigger)+'\nBalance {cyan-fg}99%{/cyan-fg}: ~{cyan-fg}'+shortNum((paymentTrigger) * 0.99)+'{/cyan-fg}\nBalance {yellow-fg}98%{/yellow-fg}: ~{yellow-fg}'+shortNum((paymentTrigger) * 0.98)+'{/yellow-fg}{/center}',
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
	  top: Math.trunc((boxCount+numWidth-1)/numWidth)*8+1,
	  left: 0,
	  width: numWidth*boxWidth,
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

var cashBoxStatus = "" //"{yellow-fg}starting{/yellow-fg}"
var cashBoxChecks = 0

function refreshCashBoxTitle()
{
	var checks = ""
	if (cashBoxChecks > 0) checks = " c:"+cashBoxChecks
	cashBox.setLine(0, '{center}{bold}'+currentLocalTime()+'{/bold} '+cashBoxStatus+checks+'{/center}')
	screen.render()
}

function setCashBoxStatus(status)
{
		cashBoxStatus = status
		refreshCashBoxTitle()
}

function setCashBoxChecks(checks)
{
		cashBoxChecks = checks
		refreshCashBoxTitle()
}

function showCashBox(text)
{
	var line = currentLocalTime()+' '+text
	cashBox.insertLine(1, line);
	screen.render()
}

function setCashBoxLineTime(index,when,text)	// Caller is expected to trigger the render
{
	var line = specificLocalTime(when)+' '+text
	cashBox.setLine(index, line);
}

function setCashBoxLine(index,text)
{
	var line = currentLocalTime()+' '+text
	cashBox.setLine(index, line);
	screen.render()
}

function addCashBoxLine(index,text)
{
	var line = currentLocalTime()+' '+text
	cashBox.insertLine(index, line);
	screen.render()
}

var debugging = false
var lastErrorTag = ""

function showError(text, tag)
{
	var line = currentLocalTime()+' '+text
	if (debugging) console.error(line)
	if (!isUndefined(tag) && tag == lastErrorTag)
	{	
		outputBox.setLine(0, line);
		lastErrorTag = tag
	} else
	{
		outputBox.insertLine(0, line);
		lastErrorTag = !isUndefined(tag)?tag:""
	}
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

function shortID(id, n)
{
	if (id.substring(0,2) == '0x') id = id.substring(2)
	if (id.length <= n*2) return id
	return id.substring(0,n)+".."+id.substring(id.length-n)
}

function leftID(id, n)
{
	if (id.substring(0,2) == '0x') id = id.substring(2)
	if (id.length <= n) return id
	return id.substring(0,n-3)+"..."
}

function colorValue(value, forcePlus)
{
	if (value < 0)
	{	return '{red-fg}'+shortNum(value)+'{/red-fg}'
	} else if (value > 0)
	{	if (isUndefined(forcePlus))
		{	return '{green-fg}'+shortNum(value)+'{/green-fg}'
		}
		return '{green-fg}+'+shortNum(value)+'{/green-fg}'
	}
	if (isUndefined(forcePlus))
		return '{white-fg}'+shortNum(value)+'{/white-fg}'
	else return '{white-fg}+'+shortNum(value)+'{/white-fg}'
}

function colorSpecificDelta(previousValue, value, forcePlus)
{
	var delta = value - previousValue
	if (delta != 0)
	{
		return ' ('+colorValue(delta, forcePlus)+')'
	}
	return ''
}

var lastValues = {}

function colorDelta(name, value, forcePlus)
{
	if (isUndefined(lastValues[name]))
	{	lastValues[name] = value
		return ''
	}
	
	var delta = value - lastValues[name]
	lastValues[name] = value;
	if (delta != 0)
	{
		return ' ('+colorValue(delta, forcePlus)+')'
	}
	return ''
}

var peerMAs = new Map()

//await new Promise(r => setTimeout(r, 2000));

var cashoutChecks= false
var casherRunning = false
var waiterRunning = false
var casherPending = []

var cashedChecks = 0
var cashedAmount = 0

function addCashedCheck(amount)
{
	cashedChecks++
	cashedAmount += amount
	text = "Cashed: "+cashedChecks+" @ "+shortNum(cashedAmount)
	setCashBoxLine(casherPending.length+1,text)
	screen.render()
}

function logResponse(method, req, rspData)
{
	console.error(currentLocalTime()+' '+method+" "+req+"\n"+JSON.stringify(rspData,null,2)+"\n**************************************************************************************")
}

function refreshCasherPending()
{
	while (casherPending.length > 0 && casherPending[0].cashed)
	{
		cashBox.deleteLine(1)	// Scroll the box up by one
		casherPending.shift()	// Remove the cashed check
	}

	casherPending.sort(function(l,r){
		if (l.uAmount == r.uAmount)	// uAmount is the total amount, amount is only the original amount
		{
			if (l.when == r.when)
			{
				if (l.URL < r.URL) return -1
				else if (l.URL > r.URL) return 1
				else if (l.peer < r.peer) return -1
				else if (l.peer > r.peer) return 1
				else return 0	// Peers should never be equal!
			} else return -(l.when - r.when)
		} else return -(l.uAmount - r.uAmount)
	})
	for (var i=0; i<casherPending.length; i++)
	{
		casherPending[i].line = i+1
		setCashBoxLineTime(casherPending[i].line, casherPending[i].when, casherPending[i].text)
	}
	screen.render()
}

async function actualWaiter()
{
	//showError('actualCasher running for '+casherPending.length+' checks!')
	while (casherPending.length > 0)
	{
		var check
		var found = false
		for (var i=0; i<casherPending.length; i++)
		{
			if (casherPending[i].waiting && !casherPending[i].cashed)
			{
				found = true
				check = casherPending[i]
				break
			}
		}
		if (!found) break	// Nothing to wait on!

		check.text = check.text + '*W'
		setCashBoxLineTime(check.line, check.when, check.text)
		screen.render()
		
		var host = check.URL.substring(check.URL.length-8)
		//showError(host+' cash:'+check.peer)
			
		try
		{
			try
			{
				var finished = false
				var finalStatus = "????"
				var result = await axios({ method: 'get', url: check.URL+'/chequebook/cashout/'+check.peer})
				//showError(JSON.stringify(result.data))
				if (isUndefined(result.data.result) || result.data.result == null)
				{
					//showError(host+' wait:'+shortID(transaction.data.transactionHash,100), "wait")
				}
				else
				{
					logResponse("GET", check.URL+'/chequebook/cashout/'+check.peer, result.data)
					//showError(host+' result='+JSON.stringify(result.data.result))
					if (result.data.result.bounced)
						finalStatus = 'BOUNCE'
					else
					{
						var pending=0
						for (var i=0; i<casherPending.length; i++)
							if (!casherPending[i].cashing)
								pending++
						finalStatus = 'cashed'
						addCashedCheck(check.uAmount)
						if (result.data.result.lastPayout != check.uAmount)
							showError(host+' WAIT cashed lastPayout:'+shortNum(result.data.result.lastPayout)+colorValue(check.uAmount-check.amount, true)+'=expected:'+shortNum(check.amount)+" ("+(pending)+" queued)")
						else if (check.amount == check.uAmount)
							showError(host+' WAIT cashed lastPayout:'+shortNum(result.data.result.lastPayout)+' amount:'+shortNum(check.amount)+" ("+(pending)+" queued)")
						else showError(host+' WAIT cashed lastPayout:'+shortNum(result.data.result.lastPayout)+' amount:'+shortNum(check.amount)+colorValue(check.uAmount-check.amount, true)+'='+shortNum(check.uAmount)+" ("+(pending)+" queued)")
					}
					finished = true
				}
				if (!finished) finalStatus = 'WAIT'
				check.text = host+' '+finalStatus
				setCashBoxLineTime(check.line, check.when, check.text)
				screen.render()
				//showCashBox(host+' '+finalStatus)
				if (finalStatus != 'cashed')
				{
					//showError(host+' '+finalStatus+':'+shortID(transaction.data.transactionHash,100))
				} else check.cashed = true
			} catch (error)
			{
				showError('waitWaiter:'+error)
			}
		} catch (error) {
			showError('actualWaiter:'+error)
		}
		//if (casherPending.shift() != check)
		//	showError("HUH?  casherPending.shift != check?")
		var pending=0
		for (var i=0; i<casherPending.length; i++)
			if (!casherPending[i].cashing)
				pending++
		setCashBoxChecks(pending)
		await new Promise(r => setTimeout(r, 10000))	// Check once every 10 seconds
	}
	waiterRunning = false
	//showError('actualCasher exiting...')
}

async function actualCasher()
{
	//showError('actualCasher running for '+casherPending.length+' checks!')
	while (casherPending.length > 0)
	{
		var check
		var found = false
		for (var i=0; i<casherPending.length; i++)
		{
			if (!casherPending[i].cashing)
			{
				found = true
				check = casherPending[i]
				break
			}
		}
		if (!found) break	// Nothing to cash!

		check.cashing = true
		check.text = check.text + '*'
		setCashBoxLineTime(check.line, check.when, check.text)
		screen.render()
		
		var host = check.URL.substring(check.URL.length-8)
		showError(host+' cash:'+check.peer)
			
		//local startTransaction = MOAISim.getDeviceTime()
		try
		{
			logResponse("GET", check.URL+'/chequebook/cheque/'+check.peer, check.lastCheck)
			logResponse("GET", check.URL+'/chequebook/cashout/'+check.peer, check.lastCashout)
			// 1 gwei = 10^9 wei = 1000000000
			//var transaction = await axios({ method: 'post', url: check.URL+'/chequebook/cashout/'+check.peer}, headers: { 'Gas-Price': '1000000000' }})
			var transaction = await axios({ method: 'post', url: check.URL+'/chequebook/cashout/'+check.peer})
			// ???? beeDebug.getLastCashoutAction(v.peer)
			logResponse("POST", check.URL+'/chequebook/cashout/'+check.peer, transaction.data)
			showError(host+' trans:'+shortID(transaction.data.transactionHash,100))
			//showCashBox(host+' '+shortID(check.peer,4)+' '+shortID(transaction.data.transactionHash,4))
			while (true)
			{
				try
				{
					var finished = false
					var finalStatus = "????"
					for (var t=0; t<60; t++)	// Wait up to 60 seconds for result to appear
					{
						var result = await axios({ method: 'get', url: check.URL+'/chequebook/cashout/'+check.peer})
						//showError(JSON.stringify(result.data))
						if (isUndefined(result.data.result) || result.data.result == null)
						{
							showError(host+' wait:'+shortID(transaction.data.transactionHash,100), "wait")
							await new Promise(r => setTimeout(r, 1000))	// Check once/second
						}
						else
						{
							logResponse("GET", check.URL+'/chequebook/cashout/'+check.peer, result.data)
							//showError(host+' result='+JSON.stringify(result.data.result))
							if (result.data.result.bounced)
								finalStatus = 'BOUNCE'
							else
							{
								var pending=0
								for (var i=0; i<casherPending.length; i++)
									if (!casherPending[i].cashing)
										pending++
								finalStatus = 'cashed'
								finalStatus = 'cashed'
								addCashedCheck(check.uAmount)
								if (result.data.result.lastPayout != check.uAmount)
									showError(host+' cashed lastPayout:'+shortNum(result.data.result.lastPayout)+colorValue(check.uAmount-check.amount, true)+'=expected:'+shortNum(check.amount)+" ("+(pending)+" queued)", "wait")
								else if (check.amount == check.uAmount)
									showError(host+' cashed lastPayout:'+shortNum(result.data.result.lastPayout)+' amount:'+shortNum(check.amount)+" ("+(pending)+" queued)", "wait")
								else showError(host+' cashed lastPayout:'+shortNum(result.data.result.lastPayout)+' amount:'+shortNum(check.amount)+colorValue(check.uAmount-check.amount, true)+'='+shortNum(check.uAmount)+" ("+(pending)+" queued)", "wait")
							}
							finished = true
							break;
						}
					}
					if (!finished)
					{	
						check.waiting = true
						finalStatus = 'WAIT'
						if (!waiterRunning)
						{
							waiterRunning = true
							actualWaiter()
						}
					}
					check.text = host+' '+finalStatus
					setCashBoxLineTime(check.line, check.when, check.text)
					screen.render()
					//showCashBox(host+' '+finalStatus)
					if (finalStatus != 'cashed')
						showError(host+' '+finalStatus+':'+shortID(transaction.data.transactionHash,100), "wait")
					else check.cashed = true
					break
				} catch (error)
				{
					showError('waitCashout:'+error)
				}
			}
		} catch (error) {
			showError('actualCashout:'+error)
		}
		//if (casherPending.shift() != check)
		//	showError("HUH?  casherPending.shift != check?")
		var pending=0
		for (var i=0; i<casherPending.length; i++)
			if (!casherPending[i].cashing)
				pending++
		setCashBoxChecks(pending)
	}
	casherRunning = false
	//showError('actualCasher exiting...')
}

function cashCheck(URL, peer, amount, lastCheck, lastCashout)
{
	var host = URL.substring(URL.length-8)
	for (var i=0; i<casherPending.length; i++)
	{
		if (casherPending[i].URL == URL && casherPending[i].peer == peer)
		{
			if (casherPending[i].cashing)
			{
				//showError(host+' Skipping duplicate cash('+peer+') '+colorValue(amount)+colorSpecificDelta(casherPending[i].amount, amount, true))
			} else
			{
				if (amount != casherPending[i].uAmount)
				{
					casherPending[i].text = host+' '+colorValue(amount)+colorSpecificDelta(casherPending[i].amount, amount, true)
					setCashBoxLine(i+1, casherPending[i].text)
					showError(host+' Delta Check '+colorValue(amount)+colorDelta(URL+':'+peer+':amount', amount, true)+colorSpecificDelta(casherPending[i].amount, amount, true)+'\n         '+peer)
					casherPending[i].uAmount = amount
					casherPending[i].when = new Date()
					refreshCasherPending()
				}
			}
			return false
		}
	}
	casherPending[casherPending.length] = {when: new Date(), URL: URL, peer: peer, amount: amount, uAmount: amount, lastCheck: lastCheck, lastCashout: lastCashout}
	setCashBoxChecks(casherPending.length)

	casherPending[casherPending.length-1].text = host+' '+colorValue(amount)+colorDelta(URL+':'+peer+':amount', amount, true)
	addCashBoxLine(casherPending.length, casherPending[casherPending.length-1].text)
	
	refreshCasherPending()

	if (!casherRunning)
	{
		casherRunning = true
		actualCasher()	// Hopefully this returns on the first async call...
	}
	return true
}

var crossConnect = false

class beeMonitor
{
	constructor(url)
	{
		this.URL = url
		this.lastValues = {}
		this.cashedChecks = 0
		this.box = createBox(url)
		//this.beeDebug = new BeeDebug(url)
		this.cashLast = new Date()	// Defining this will defer a full check pass


		// Work around spelling misteak (sic) on getChequebookBalance pending correction
		//if (isUndefined(this.beeDebug.getChequebookBalance))
			//this.beeDebug.getChequebookBalance = this.beeDebug.getChequeubookBalance
	}
	
	async populateMultiAddr()
	{
		var addresses = await axios({ method: 'get', url: this.URL+'/addresses' })
		this.address = addresses.data.overlay
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
		return colorValue(value, forcePlus)
	}

	colorDelta(name, value, forcePlus)
	{
		return colorDelta(this.URL+':'+name, value, forcePlus)
	}

	colorSpecificDelta(previousValue, value, forcePlus)
	{
		return colorSpecificDelta(previousValue, value, forcePlus)
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
						if (!isUndefined(error) && !isUndefined(error.response) && !isUndefined(error.response.status) && error.response.status == 404)
						{
							//print(string.format("Peer(%s) First Cashout!", tostring(v.peer)))
							//try
							//{
							//	showError('404 from '+URL+'/chequebook/cashout/'+v.peer)
							//	cashout = await axios({ method: 'get', url: URL+'/chequebook/cashout/'+v.peer})
							//} catch (error) {
							//	if (error.response.status == 404)
							//		showError('SECOND 404 from '+URL+'/chequebook/cashout/'+v.peer)
							//	else showError("404 RETRY: "+error)
							//}
						} else showError('cashout:'+error)
						cashout = {"data":{"cumulativePayout": 0}}
					}
					checkCount = checkCount + 1
					if (!isUndefined(cashout.data.cumulativePayout))
					{
						totalcashed = totalcashed + cashout.data.cumulativePayout
						if (v.lastreceived.payout > cashout.data.cumulativePayout)
						{
							totalcashable = totalcashable + 1
							if (!cashCheck(URL, v.peer, v.lastreceived.payout-cashout.data.cumulativePayout, v, cashout.data))
								totalpending = totalpending + 1
							foundOne = true
						}
					}
				} catch (error) {
					showError('lastcheque:'+error);
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
		this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {red-fg}refresh{/red-fg}{/center}')
		screen.render()

		var debugURL = this.URL
	
		try
		{
		const peers = await axios({ method: 'get', url: debugURL+'/peers' })

		var connected = {}
		for (var i=0; i<peers.data.peers.length; i++)
		{	connected[peers.data.peers[i].address] = true
		}
		
		if (isUndefined(this.multiAddr) || isUndefined(this.address))
			await this.populateMultiAddr()
		if (crossConnect)
		{
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
							{	showError('connect:'+error)
							}
						}
						//else showError(debugURL+' already connected to '+ma)
					}
				}
			}
			//else showError(debugURL+' ma='+this.multiAddr)
		}
	
		const balances = await axios({ method: 'get', url: debugURL+'/balances' })
		// beeDebug.getAllBalances()
		
		var negTotal = 0
		var posTotal = 0
		var closeCount = 0
		var reallyCloseCount = 0
		
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
			closeString = ' ~{cyan-fg}'+reallyCloseCount+'{/cyan-fg}'
		else if (closeCount > 0)
			closeString = ' ~{yellow-fg}'+closeCount+'{/yellow-fg}'
		
		const settlements = await axios({ method: 'get', url: debugURL+'/settlements' })
		// beeDebug.getAllSettlements()
		var netSettle = settlements.data.totalreceived-settlements.data.totalsent
		
		var checkbook = await axios({ method: 'get', url: debugURL+'/chequebook/balance' })
		//var balance = await this.beeDebug.getChequebookBalance()
		
		var cashLine = ""
		if (isUndefined(this.cashLast) || (new Date()-this.cashLast) > 5*60*1000)	// Time for a full pass, every 5 minutes in msec
		{
			var startScan = new Date()
			
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
			
			if (isUndefined(this.cashShort)) this.cashShort = 0
			var elapsed = new Date()-startScan
			var host = debugURL.substring(debugURL.length-8)
			//showCashBox(host+' full '+elapsed+'ms vs '+this.cashShort+'ms')
		} else	// Just do a connected peer pass
		{
			var startScan = new Date()

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
			this.cashShort = new Date() - startScan
		}
		
		var totalNet = balTotal + netSettle
		if (isUndefined(this.startingNet)) this.startingNet = totalNet

		var elapsed = Math.trunc((new Date() - start)/1000+0.5)
		
		this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {blue-fg}'+elapsed+'s{/blue-fg}{/center}')
		this.box.setLine(1, '{center}Connected: '+peers.data.peers.length+this.colorDelta('connected',peers.data.peers.length,true)+' Addr: '+leftID(this.address,10)+'{/center}')
		this.box.setLine(2, '{center}Peers: '+balances.data.balances.length+''+this.colorDelta('peers',balances.data.balances.length,true)+
						' Net:'+this.colorValue(totalNet)+this.colorSpecificDelta(this.startingNet,totalNet)+'{/center}')
		this.box.setLine(3, '{center}CheckBook: '+this.colorValue(checkbook.data.totalBalance)+'('+this.colorValue(checkbook.data.availableBalance)+')'+this.colorDelta('checkbook',checkbook.data.availableBalance,true)+'{/center}')
		//this.box.setLine(3, '{center}CheckBook: '+this.colorValue(balance.totalBalance)+'('+this.colorValue(balance.availableBalance)+')'+this.colorDelta('checkbook',balance.availableBalance,true)+'{/center}')
		this.box.setLine(4, cashLine)
		this.box.setLine(5, '{center}Settled: '+this.colorValue(settlements.data.totalreceived)+this.colorValue(-settlements.data.totalsent)+'='+this.colorValue(netSettle)+this.colorDelta('netSettle',netSettle)+'{/center}')
		this.box.setLine(6, '{center}Balance: '+this.colorValue(posTotal)+this.colorValue(negTotal)+'='+this.colorValue(balTotal)+this.colorDelta('balance',balTotal)+closeString+'{/center}')
		} catch (error)
		{	showError('refresh:'+error)
			this.box.setContent("")
			this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {red-fg}FAILED{/red-fg}{/center}')
		}
		
		screen.render()
	}
}

const objs = []

for (var i=2; i<process.argv.length; i++)
{
	if (process.argv[i] == '--cashout')
	{
		cashoutChecks = true
		debugging = true
	} else if (process.argv[i] == '--debug')
		debugging = true
	else if (process.argv[i] == '--crossconnect')
		crossConnect = true
	else
	{
		objs[objs.length] = new beeMonitor(process.argv[i])
	}
}
if (objs.length < 1)
{	var defaultURL = 'http://127.0.0.1:1635'
	objs[0] = new beeMonitor(defaultURL)
	console.error('Usage: '+process.argv[0]+' '+process.argv[1]+' http://127.0.0.1:1635 <http://127.0.0.1:1638 <...>>')
	console.error('      put --cashout anywhere to automatically cash checkds')
	console.error('      Defaulting to '+defaultURL)
}
addBoxes()
if (cashoutChecks) showError("Cashing checks!")
else showError("Monitoring checks")
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

async function refreshScreen(i)
{
	var promises = []
	var broken = []
	try { promises[i] = objs[i].refreshBox() }
	catch (error) { showError('refresh2:'+error); broken[i] = true }
	if (!broken[i])
		try { await promises[i] }
		catch (error) { showError('broken:'+error) }
	else showError(objs[i].url+' broken promise!')

	screen.render()
	
    setTimeout(refreshScreen, 60000, i);
}

async function refreshScreens()
{
	for (var i=0; i<objs.length; i++)
		refreshScreen(i)
}

async function refreshCashBox()
{
	refreshCashBoxTitle()
	setTimeout(refreshCashBox, 1000);	// Keep a timestamp running
}

refreshScreens()
refreshCashBox()
