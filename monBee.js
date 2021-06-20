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

var paymentThreshold = 100000000
var paymentEarly = 10000000
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

var screen = blessed.screen({
  smartCSR: true,
  dockBorders : true,
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

var numWidth = 2		// This is horizontal boxes
var numLines = 10		// This is per box

function createBox(URL)
{

// Create a box for the node
	var box = blessed.box({
	  parent: screen,
	  mouse: true,
	  keys: true,
	  vi: true,
	  left: (boxCount%numWidth)*boxWidth,
	  top: Math.trunc(boxCount/numWidth)*(numLines+1),
	  width: boxWidth+1,
	  height: (numLines+2),
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

	  content: '{center}\n\n\nThreshold: '+shortNum(paymentThreshold)+'\nEarly:     '+shortNum(paymentEarly)+'\nTrigger:   '+shortNum(paymentTrigger)+'\nBalance {cyan-fg}99%{/cyan-fg}: ~{cyan-fg}'+shortNum((paymentTrigger) * 0.99)+'{/cyan-fg}\nBalance {yellow-fg}98%{/yellow-fg}: ~{yellow-fg}'+shortNum((paymentTrigger) * 0.98)+'{/yellow-fg}{/center}',
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
	  top: Math.trunc((boxCount+numWidth-1)/numWidth)*(numLines+1)+1,
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
var cashBoxGasPrice = ""

function refreshCashBoxTitle()
{
	var checks = ""
	if (cashBoxChecks > 0) checks = " c:"+cashBoxChecks
	cashBox.setLine(0, '{center}{bold}'+currentLocalTime()+'{/bold}'+cashBoxStatus+checks+cashBoxGasPrice+'{/center}')
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

function setCashBoxGasPrice(gasPrice)
{
		cashBoxGasPrice = ' @ '+gasPrice
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

function showLogError(text)
{
	if (!debugging) console.error(currentLocalTime()+' '+text)
	showError(text)
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

function clearDelta(name)
{
	lastValues[name] = void(0)
}

function valueChanged(name, value)
{
	if (isUndefined(lastValues[name])) return true;
	return lastValues[name] != value;
}

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

// Here's my explict code for accessing web3 blockchain APIs without pulling in 350 packages!

var blockchainURL

var bigZero = BigInt(0)
var big8 = BigInt(8)
var big32 = BigInt(32)
var big10 = BigInt(10)
var big100 = BigInt(100)

var etherMap = [
    { name: "wei",           abbr: "wei",	base: BigInt("1") },
    { name: "kwei",          abbr: "kwei",	base: BigInt("1000") },
//  { name: "ada",           base: BigInt("1000") },
//  { name: "femtoether",    base: BigInt("1000") },
    { name: "mwei",          abbr: "mwei",	base: BigInt("1000000") },
//  { name: "babbage",       base: BigInt("1000000") },
//  { name: "picoether",     base: BigInt("1000000") },
    { name: "gwei",          abbr: "gwei",	base: BigInt("1000000000") },
//  { name: "shannon",       base: BigInt("1000000000") },
//  { name: "nanoether",     base: BigInt("1000000000") },
//  { name: "nano",          base: BigInt("1000000000") },
//  { name: "szabo",         base: BigInt("1000000000000") },
    { name: "microether",    abbr: "micro",	base: BigInt("1000000000000") },
//  { name: "micro",         base: BigInt("1000000000000") },
//  { name: "finney",        base: BigInt("1000000000000000") },
    { name: "milliether",    abbr: "milli",	base: BigInt("1000000000000000") },
//  { name: "milli",         base: BigInt("1000000000000000") },
    { name: "ether",         abbr: "eth",	base: BigInt("1000000000000000000") },
    { name: "kether",        abbr: "keth",	base: BigInt("1000000000000000000000") },
//  { name: "grand",         base: BigInt("1000000000000000000000") },
//  { name: "einstein",      base: BigInt("1000000000000000000000") },
    { name: "mether",        abbr: "meth",	base: BigInt("1000000000000000000000000") },
    { name: "gether",        abbr: "geth",	base: BigInt("1000000000000000000000000000") },
    { name: "tether",        abbr: "teth",	base: BigInt("1000000000000000000000000000000") }
	];

function prettyEther(value, abbr)
{
	if (typeof(value) == "number") value = BigInt(value)
	for (var i = etherMap.length-1; i >= 0; i--)
	{
		var base = etherMap[i].base
		if (value >= base)
		{
			var result = value/base
			var remainder = value - result*base
			
			if (i > 1 && remainder > bigZero)
			{
				var decimal = remainder / etherMap[i-1].base
				var overage = remainder - decimal*etherMap[i-1].base
				if (overage == bigZero && (decimal/big100)*big100 == decimal)
				{
					result = result+'.'+decimal/big100
					remainder = bigZero
				} else if (overage == bigZero && (decimal/big10)*big10 == decimal)
				{
					result = result+'.'+decimal/big10
					remainder = bigZero
				}
			}
		
			if (abbr && etherMap[i].abbr)
				result = result+etherMap[i].abbr
			else
				result = result+etherMap[i].name
			if (remainder > bigZero)
				result = result+"+"
			return [result, remainder]
		}
	}
	return [value, bigZero]
}

function fullEther(value, abbr)
{
	var [result, remainder] = prettyEther(value, abbr)
//print(string.format("remainder=%s(%s) bigZero=%s(%s)", type(remainder), tostring(remainder), type(bigZero), tostring(bigZero)))
	while (remainder > bigZero)
	{
		var newPiece
		[newPiece, remainder] = prettyEther(remainder)
		result = result+newPiece
//print(string.format("remainder=%s(%s) bigZero=%s(%s)", type(remainder), tostring(remainder), type(bigZero), tostring(bigZero)))
	}
	return result
}

function justEther(value)
{
	if (typeof(value) == "number") value = BigInt(value)
	var etherBase = BigInt("1000000000000000000")
	var milBase = BigInt("1000000000000000")
	var ether = value / etherBase
	var value = value - ether*etherBase
	var mils = value / milBase
	return [ether, mils]
}

async function executeRPC(URL, method, params)
{
	if (isUndefined(params)) params = ""
	
	var body = "{\"jsonrpc\":\"2.0\",\"method\":\""+method+"\",\"params\":["+params+"],\"id\":1}"

	try
	{
		var response = await axios({ method: 'post', url: URL, headers: {'Content-Type': 'application/JSON'}, data: body})
	}
	catch (err)
	{
		if (err.response)
		{	console.error(URL+' response error '+err)
			//console.error(JSON.stringify(err.response))
		} else if (err.request)
		{	console.error(URL+' request error '+err)
			//console.error(JSON.stringify(err.request))
		} else
		{	console.error(URL+' other error '+err)
			//console.error(JSON.stringify(err))
		}
		return void(0)
	}
	if (!isUndefined(response.data.error))
	{	console.error(URL+' method:'+method+' error '+response.data.error.message)
		return void(0)
	}
	if (isUndefined(response.data.result))
	{	console.error(URL+' method:'+method+' contains no result!')
		return void (0)
	}
	//console.error('response.data.result='+JSON.stringify(response.data.result))

	return await response.data.result
}

function numericResult(result)
{
	var answer = Number(result)
	if (answer == NaN) return result
	//console.error('numericResult('+result+')='+answer)
	return answer
}

async function getBlockNumber(URL)
{
	var blockNumber = await executeRPC(URL, "eth_blockNumber")
	return numericResult(blockNumber)
}

async function getGasPrice(URL)
{
	var blockNumber = await executeRPC(URL, "eth_gasPrice")
	return numericResult(blockNumber)
}

async function getSyncing(URL)
{
	var result = await executeRPC(URL, "eth_syncing")
	if (!isUndefined(result.currentBlock) && !isUndefined(result.highestBlock))
	{	var current = numericResult(result.currentBlock)
		var highest = numericResult(result.highestBlock)
		if (current == highest)
		{	return highest
		} else return current+'/'+highest
	}
	if (result == false)
	{	return getBlockNumber(URL)
	}
	return JSON.stringify(result)
}

async function getPeers(URL)
{
	var peerCount = await executeRPC(URL, "net_peerCount")
	return numericResult(peerCount)
}

async function getPendingCount(URL)
{
	//var pending = await executeRPC(URL, "eth_pendingTransactions")
	//showError(JSON.stringify(pending))
//	return pending.length
	var pending = await executeRPC(URL, "eth_getBlockTransactionCountByNumber", "\"pending\"")
	//showError(JSON.stringify(pending))
	return numericResult(pending)
}

var peerMAs = new Map()

//await new Promise(r => setTimeout(r, 2000));

var cashoutChecks= false
var casherRunning = false
var nodeCasherRunning = []
var waiterRunning = false
var casherPending = []
var gasPrice = 0
var pendingTransactions = 0
var maxGasPrice = 20000000000 // 20gwei // 1500000000	// 1.5gwei

var cashedChecks = 0
var cashedAmount = 0

function addCashedCheck(amount)
{
	cashedChecks++
	cashedAmount += amount
	var text = "Cashed: "+cashedChecks+" @ "+shortNum(cashedAmount)
	setCashBoxLine(casherPending.length+1,text)
	screen.render()
}

function setGasPrice(gp, pendingCount)
{
	gasPrice = gp
	pendingTransactions = pendingCount
	var fmtGas = fullEther(gasPrice,true)
	if (fmtGas.length > 10) [fmtGas] = prettyEther(gasPrice, true)
	if (gasPrice > maxGasPrice)
			fmtGas = "{red-fg}"+fmtGas+"{/}"
	else fmtGas = "{green-fg}"+fmtGas+"{/}"
	if (pendingCount > 0)
		fmtPending = "{red-fg} *"+pendingCount+"{/}"
	else fmtPending = "{green-fg} *"+pendingCount+"{/}"
	if (!isUndefined(pendingCount)) fmtGas = fmtGas+fmtPending
	setCashBoxGasPrice(fmtGas)
}

function updateGoerli(block)
{
	var text = "Goerli: "+block
	setCashBoxLine(casherPending.length+2,text)
	screen.render()
}

function logResponse(method, req, rspData)
{
	console.error(currentLocalTime()+' '+method+" "+req+"\n"+JSON.stringify(rspData,null,2)+"\n**************************************************************************************")
}

function refreshCasherPending()
{
	casherPending.sort(function(l,r){
		if (l.cashed == r.cashed)
		{
			if (l.cashed)	// Different sort for cashed checks
			{
				if (l.when == r.when)
				{
					if (l.URL < r.URL) return -1
					else if (l.URL > r.URL) return 1
					else if (l.peer < r.peer) return -1
					else if (l.peer > r.peer) return 1
					else return 0	// Peers should never be equal!
				} else return (l.when - r.when)
			} else
			{
				if (l.cashing == r.cashing)
				{
					if (l.uAmount == r.uAmount)	// uAmount is the total amount, amount is only the original amount
					{
						if (l.when == r.when)
						{
							if (l.URL < r.URL) return -1
							else if (l.URL > r.URL) return 1
							else if (l.peer < r.peer) return -1
							else if (l.peer > r.peer) return 1
							else return 0	// Peers should never be equal!
						} else return (l.when - r.when)
					} else return -(l.uAmount - r.uAmount)
				} else if (l.cashing) return -1	// cashing goes next
				else return 1	// must be right is cashing
			}
		} else if (l.cashed) return -1	// cashed goes first
		else return 1	// Must be right is cashed
	})
	var pending=0
	for (var i=0; i<casherPending.length; i++)
	{
		if (!casherPending[i].cashed) pending++
		casherPending[i].line = i+1
		setCashBoxLineTime(casherPending[i].line, casherPending[i].when, casherPending[i].text)
	}

	var cashedCount = 0
	for (i=0; i<casherPending.length; i++)
		if (casherPending[i].cashed)
			cashedCount++
	var removed = false
	while (cashedCount > objs.length && casherPending.length > 0 && casherPending[0].cashed)
	{
		cashedCount--
		removed = true
		cashBox.deleteLine(1)	// Scroll the box up by one
		check = casherPending.shift()	// Remove the cashed check
		clearDelta(check.URL+':'+check.peer+':amount')	// So a new check for this peer doesn't show a delta
	}
	
	if (removed)
		refreshCasherPending()
	else
	{
		setCashBoxChecks(pending)
		screen.render()
	}
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
				if (!finished) finalStatus = 'W-'+colorValue(check.uAmount)
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
			if (!casherPending[i].cashed)
				pending++
		setCashBoxChecks(pending)
		if (pending == 0) refreshCasherPending()
		await new Promise(r => setTimeout(r, 10000))	// Check once every 10 seconds
	}
	if (casherPending.length == 0) refreshCasherPending()
	waiterRunning = false
	//showError('actualCasher exiting...')
}

async function actualNodeCasher(check)
{
	while (waiterRunning || (gasPrice > maxGasPrice && pendingTransactions > 0))
	{
		var safe = check.text
		check.text = safe + "{red-fg}*{/}"
		setCashBoxLineTime(check.line, check.when, check.text)
		screen.render()
		await new Promise(r => setTimeout(r, 1000))	// Check once/second
		check.text = safe
	}
	
	
	check.cashing = true
	check.text = check.text + '*'
	setCashBoxLineTime(check.line, check.when, check.text)
	screen.render()
	
	var host = check.URL.substring(check.URL.length-8)
	showError(host+' cash:'+check.peer)
		
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
						//showError(host+' wait:'+shortID(transaction.data.transactionHash,100), "wait")
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
							addCashedCheck(check.uAmount)
							if (result.data.result.lastPayout != check.uAmount)
								showError(host+' cashed lastPayout:'+shortNum(result.data.result.lastPayout)+colorValue(check.uAmount-check.amount, true)+'=expected:'+shortNum(check.amount)+" ("+(pending)+" queued)")
							else if (check.amount == check.uAmount)
								showError(host+' cashed lastPayout:'+shortNum(result.data.result.lastPayout)+' amount:'+shortNum(check.amount)+" ("+(pending)+" queued)")
							else showError(host+' cashed lastPayout:'+shortNum(result.data.result.lastPayout)+' amount:'+shortNum(check.amount)+colorValue(check.uAmount-check.amount, true)+'='+shortNum(check.uAmount)+" ("+(pending)+" queued)")
						}
						finished = true
						break;
					}
				}
				if (!finished)
				{	
					check.waiting = true
					finalStatus = 'W-'+colorValue(check.uAmount)
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
					showError(host+' '+finalStatus+':'+shortID(transaction.data.transactionHash,100))
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

	var pending=0
	for (var i=0; i<casherPending.length; i++)
		if (!casherPending[i].cashed)
			pending++
	setCashBoxChecks(pending)
	if (pending == 0) refreshCasherPending()

	nodeCasherRunning[check.URL] = false
}

async function actualCasher()
{
	//showError('actualCasher running for '+casherPending.length+' checks!')
	while (casherPending.length > 0)
	{
		var check
		var cashedCount = 0
		var found = false
		for (var i=0; i<casherPending.length; i++)
		{
			if (!casherPending[i].cashing)
			{
				found = true
				check = casherPending[i]
				if (!nodeCasherRunning[check.URL])
				{
					nodeCasherRunning[check.URL] = true
					actualNodeCasher(check)
				}
			} else cashedCount++
		}
		if (!found) break	// Nothing to cash!
		
		if (cashedCount > 5) refreshCasherPending()

		await new Promise(r => setTimeout(r, 5000))	// Check once/5 seconds
	}
	casherRunning = false
	//showError('actualCasher exiting...')
}

function cashCheck(URL, ethereum, peer, amount, lastCheck, lastCashout)
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
	casherPending[casherPending.length] = {when: new Date(), URL: URL, ethereum: ethereum, peer: peer, amount: amount, uAmount: amount, lastCheck: lastCheck, lastCashout: lastCashout}
	setCashBoxChecks(casherPending.length)

	casherPending[casherPending.length-1].text = host+' '+colorValue(amount)+colorDelta(URL+':'+peer+':amount', amount, true)
	addCashBoxLine(casherPending.length, casherPending[casherPending.length-1].text)
	
	refreshCasherPending()

	if (!casherRunning && cashoutChecks)
	{
		casherRunning = true
		actualCasher()	// Hopefully this returns on the first async call...
	}
	return true
}

var crossConnect = false

class beeMonitor
{
	constructor(url, cashNOW)
	{
		this.URL = url
		this.lastValues = {}
		this.closePeers = {}
		this.cashedChecks = 0
		this.box = createBox(url)
		this.topoLoaded = false
		//this.beeDebug = new BeeDebug(url)
		if (!cashNOW)
			this.cashLast = new Date()	// Defining this will defer a full check pass

		// Work around spelling misteak (sic) on getChequebookBalance pending correction
		//if (isUndefined(this.beeDebug.getChequebookBalance))
			//this.beeDebug.getChequebookBalance = this.beeDebug.getChequeubookBalance
	}
	
	async populateMultiAddr()
	{
		var addresses = await axios({ method: 'get', url: this.URL+'/addresses' })
		this.address = addresses.data.overlay
		this.ethereum = addresses.data.ethereum
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
	
	valueChanged(name, value)
	{
		return valueChanged(this.URL+':'+name)
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
		this.refreshTitle("/cheques")
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
				var receivedPayout = parseInt(v.lastreceived.payout,10)
				totalreceived = totalreceived + receivedPayout
				try
				{
					var cashout
					try
					{	this.refreshTitle((i+1)+'/'+cashes.data.lastcheques.length, (i==0 || i==cashes.data.lastcheques.length-1))
						cashout = await axios({ method: 'get', url: URL+'/chequebook/cashout/'+v.peer})
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
						var cumulativePayout = parseInt(cashout.data.cumulativePayout,10)
						totalcashed = totalcashed + cumulativePayout
						if (receivedPayout > cumulativePayout)
						{
							totalcashable = totalcashable + 1
							if (!cashCheck(URL, this.ethereum, v.peer, receivedPayout-cumulativePayout, v, cashout.data))
								totalpending = totalpending + 1
							foundOne = true
						}
					} else if (!isUndefined(cashout.data.uncashedAmount))
					{
						var uncashedAmount = parseInt(cashout.data.uncashedAmount,10)
						if (!isUndefined(cashout.data.lastCashedCheque) && cashout.data.lastCashedCheque != null
						&& !isUndefined(cashout.data.lastCashedCheque.payout) && cashout.data.lastCashedCheque.payout != null)
							totalcashed = totalcashed + parseInt(cashout.data.lastCashedCheque.payout,10)
						if (uncashedAmount > 0)
						{
							totalcashable = totalcashable + 1
							if (!cashCheck(URL, this.ethereum, v.peer, uncashedAmount, v, cashout.data))
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
	
	async refreshTopo ()
	{
//  "baseAddr": "03ed575c4681446d6d3d647f955265b90306e203a8cea0257218b209ed143efb",
//  "population": 200598,
//  "connected": 65,
//  "timestamp": "2021-05-21T11:29:07.2359363-04:00",
//  "nnLowWatermark": 2,
//  "depth": 1,
//  "bins": {
		
		if (this.topoActive) return
		this.topoActive = true
		try
		{
		if (isUndefined(this.lastTopo)) this.lastTopo = "/topology"
		this.box.setLine(2, '{center}'+this.lastTopo+' {red-fg}'+currentLocalTime()+'{/red-fg}{/center}')
		var topoTime = new Date()
		const topo = await axios({ method: 'get', url: this.URL+'/topology' })
		topoTime = Math.trunc((new Date() - topoTime)/1000+0.5)
		
		function colorBin(previous, current)
		{
			if (isUndefined(previous)) return current;
			if (previous == current) return current;
			if (previous < current) return "{green-fg}"+current+"{/}"
			if (previous > current) return "{red-fg}"+current+"{/}"
			return "?"+current+"?"
		}
		
		var topoBins = ""
		if (isUndefined(this.lastBins)) this.lastBins = topo.data.bins
		topoBins = topoBins + colorBin(this.lastBins.bin_0.connected, topo.data.bins.bin_0.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_1.connected, topo.data.bins.bin_1.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_2.connected, topo.data.bins.bin_2.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_3.connected, topo.data.bins.bin_3.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_4.connected, topo.data.bins.bin_4.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_5.connected, topo.data.bins.bin_5.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_6.connected, topo.data.bins.bin_6.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_7.connected, topo.data.bins.bin_7.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_8.connected, topo.data.bins.bin_8.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_9.connected, topo.data.bins.bin_9.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_10.connected, topo.data.bins.bin_10.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_11.connected, topo.data.bins.bin_11.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_12.connected, topo.data.bins.bin_12.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_13.connected, topo.data.bins.bin_13.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_14.connected, topo.data.bins.bin_14.connected)
		topoBins = topoBins + " " + colorBin(this.lastBins.bin_15.connected, topo.data.bins.bin_15.connected)
		
		this.lastBins = topo.data.bins
		this.lastTopo = 'Topo: '+topo.data.connected+'/'+topo.data.population+''+this.colorDelta('topoconnected',topo.data.connected,true)+
						' Depth:{yellow-fg}'+topo.data.depth+'{/}'+this.colorDelta("topodepth",topo.data.depth)
		this.box.setLine(2, '{center}'+this.lastTopo+' '+currentLocalTime().substring(0,5)+' {blue-fg}'+topoTime+'s{/blue-fg}{/center}')
		this.box.setLine(9, '{center}'+topoBins+'{/center}')
		screen.render()
		this.topoActive = false
		this.topoLoaded = true
		} catch (error)
		{	showError('refreshTopo:'+error)
			this.box.setContent("")
			this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {red-fg}FAILED{/red-fg}{/center}')
		}
	}

	async refreshTitle(what, force) {
		if (isUndefined(force)) force = true
		if (!force)
		{	if (!isUndefined(this.lastTitle))
			{	var elapsed = Math.trunc((new Date() - this.lastTitle)/1000+0.5)
				force = elapsed > 0
			}
		}
		if (force)
		{	this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {red-fg}'+what+'{/red-fg}{/center}')
			this.lastTitle = new Date()
			screen.render()
		}
	}

	async refreshBox () {

		var start = new Date()
		this.refreshTitle("refresh")
		var debugURL = this.URL
	
		try
		{
		this.refreshTitle("/peers")
		const peers = await axios({ method: 'get', url: debugURL+'/peers' })

		var connected = {}
		var peerCount = 0
		if (peers.data.peers != null)
		{
			peerCount = peers.data.peers.length
			for (var i=0; i<peers.data.peers.length; i++)
			{	connected[peers.data.peers[i].address] = true
			}
		}
		
		if (isUndefined(this.multiAddr) || isUndefined(this.address))
		{
			this.refreshTitle("/address")
			await this.populateMultiAddr()
		}
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
	
		this.refreshTitle("/balances")
		const balances = await axios({ method: 'get', url: debugURL+'/balances' })
		this.refreshTitle("/consumed")
		const consumed = await axios({ method: 'get', url: debugURL+'/consumed' })
		// beeDebug.getAllBalances()
		
		var negTotal = 0
		var posTotal = 0
		var closeCount = 0
		var reallyCloseCount = 0
		var biggestBalance = 0
		var biggestPeer = ""
		
		function logClosePeer(which, peer, balance)
		{
			if (isUndefined(which.closePeers)) which.closePeers = {}
			if (isUndefined(which.closePeers[peer])) which.closePeers[peer] = 0
			if (which.closePeers[peer] != balance)
			{
				var prevPercent = Math.trunc(which.closePeers[peer]*100/paymentTrigger)
				var percent = Math.trunc(balance*100/paymentTrigger)
				if (percent > 89)
					showLogError(which.closePeers[peer]+'->'+balance+'='+percent+'% '+peer+' '+which.URL)
				else if (prevPercent > 89 && balance < which.closePeers[peer])
					showLogError(which.closePeers[peer]+'<-'+balance+'=<'+percent+'% '+peer+' '+which.URL)
				which.closePeers[peer] = balance
				return true
			}
			return false
		}

		var peerChanged = {}
		for (var i=0; i<balances.data.balances.length; i++)
		{
			var b = balances.data.balances[i]
			var bal = parseInt(b.balance,10)
			if (bal < 0)
				negTotal = negTotal + bal
			else if (bal > 0)
			{
				posTotal = posTotal + bal
				if (connected[b.peer])
				{
//if (!isUndefined(this.closePeers[b.peer]))
//if (this.closePeers[b.peer] > bal)
//{
//var percent = Math.trunc(bal*1000000/paymentTrigger)/10000.0
//showLogError(this.closePeers[b.peer]+'<-'+bal+'='+percent+'% '+b.peer+' '+this.URL)
//}
					if (bal > (paymentTrigger) * 0.99)
						reallyCloseCount = reallyCloseCount + 1
					else if (bal > (paymentTrigger) * 0.98)
						closeCount = closeCount + 1
					else if (bal > biggestBalance)
					{
						biggestBalance = bal
						biggestPeer = b.peer
					}
					peerChanged[b.peer] = logClosePeer(this, b.peer, bal)
				}
			}
		}
	
		var balTotal = negTotal + posTotal
		var closeString = ""
		if (reallyCloseCount > 0)
			closeString = ' ~{cyan-fg}'+reallyCloseCount+'{/cyan-fg}'
		else if (closeCount > 0)
			closeString = ' ~{yellow-fg}'+closeCount+'{/yellow-fg}'
		else if (biggestBalance > (paymentTrigger)*0.75)
			closeString = ' >{yellow-fg}'+(Math.trunc(biggestBalance*100/paymentTrigger))+'%{/yellow-fg}'
		else if (biggestBalance > 0)
		{
			var percent = Math.trunc(biggestBalance*100/paymentTrigger)
			if (percent > 0)
				closeString = ' >{magenta-fg}'+percent+'%{/magenta-fg}'
			else
			{
				closeString = ' <{red-fg}1%{/red-fg}'
				if (peerChanged[biggestPeer])
				{
					var percent = Math.trunc(biggestBalance*1000000/paymentTrigger)/10000.0
					showLogError('Closest:'+biggestBalance+' or '+percent+'% '+biggestPeer+' '+this.URL)
				}
			}
		}


		var cnegTotal = 0
		var cposTotal = 0
		
		for (var i=0; i<consumed.data.balances.length; i++)
		{
			var b = consumed.data.balances[i]
			var bal = parseInt(b.balance,10)
			if (bal < 0)
				cnegTotal = cnegTotal + bal
			else if (bal > 0)
			{
				cposTotal = cposTotal + bal
			}
		}
	
		var cbalTotal = cnegTotal + cposTotal



		this.refreshTitle("/settle")
		const settlements = await axios({ method: 'get', url: debugURL+'/settlements' })
		// beeDebug.getAllSettlements()
		var settleReceived = parseInt(settlements.data.totalReceived,10)
		var settleSent = parseInt(settlements.data.totalSent,10)
		if (isUndefined(settleSent) && !isUndefined(parseInt(settlements.data.totalsent,10)))	// 0.5.3 node support
		{
			settleSent = parseInt(settlements.data.totalsent,10)
			settleReceived = parseInt(settlements.data.totalreceived,10)
		}
		var netSettle = settleReceived-settleSent
		
		this.refreshTitle("/pseudo")
		const tsettlements = await axios({ method: 'get', url: debugURL+'/timesettlements' })
		// beeDebug.getAllSettlements()
		var tsettleReceived = parseInt(tsettlements.data.totalReceived,10)
		var tsettleSent = parseInt(tsettlements.data.totalSent,10)
		if (isUndefined(tsettleSent) && !isUndefined(parseInt(tsettlements.data.totalsent,10)))	// 0.5.3 node support
		{
			tsettleSent = parseInt(tsettlements.data.totalsent,10)
			tsettleReceived = parseInt(tsettlements.data.totalreceived,10)
		}
		var tnetSettle = tsettleReceived-tsettleSent
		
		this.refreshTitle("/balance")
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
		
		if (!this.topoLoaded || peers.data.peers != null)
			if (this.topoLoaded || this.valueChanged('connected',peerCount))
				this.refreshTopo()
		
		this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {blue-fg}'+elapsed+'s{/blue-fg}{/center}')
		this.box.setLine(1, '{center}Connected: '+peerCount+this.colorDelta('connected',peerCount,true)+' Addr: {bold}'+leftID(this.address,10)+'{/bold}{/center}')

//  "population": 200598,
//  "connected": 65,
//  "timestamp": "2021-05-21T11:29:07.2359363-04:00",
//  "nnLowWatermark": 2,
//  "depth": 1,

		this.box.setLine(3, '{center}Peers: '+balances.data.balances.length+''+this.colorDelta('peers',balances.data.balances.length,true)+
						' Net:'+this.colorValue(totalNet)+this.colorSpecificDelta(this.startingNet,totalNet)+'{/center}')
		this.box.setLine(4, '{center}CheckBook: '+this.colorValue(parseInt(checkbook.data.totalBalance,10))+'('+this.colorValue(parseInt(checkbook.data.availableBalance,10))+')'+this.colorDelta('checkbook',parseInt(checkbook.data.availableBalance,10),true)+'{/center}')
		//this.box.setLine(3, '{center}CheckBook: '+this.colorValue(balance.totalBalance)+'('+this.colorValue(balance.availableBalance)+')'+this.colorDelta('checkbook',balance.availableBalance,true)+'{/center}')
		this.box.setLine(5, cashLine)
		this.box.setLine(6, '{center}Settled: '+this.colorValue(settleReceived)+this.colorValue(-settleSent,true)+'='+this.colorValue(netSettle)+this.colorDelta('netSettle',netSettle)+'{/center}')
		this.box.setLine(7, '{center}Pseudo: '+this.colorValue(tsettleReceived)+this.colorValue(-tsettleSent,true)+'='+this.colorValue(tnetSettle)+this.colorDelta('tnetSettle',tnetSettle)+'{/center}')
		this.box.setLine(8, '{center}Balance: '+this.colorValue(posTotal)+this.colorValue(negTotal,true)+'='+this.colorValue(balTotal)+this.colorDelta('balance',balTotal)+closeString+'{/center}')
		//this.box.setLine(8, '{center}Consume: '+this.colorValue(cposTotal)+this.colorValue(cnegTotal,true)+'='+this.colorValue(cbalTotal)+this.colorDelta('cbalance',cbalTotal)+' '+this.colorValue(balTotal-cbalTotal)+'{/center}')
		} catch (error)
		{	showError('refresh:'+error)
			this.box.setContent("")
			this.box.setLine(-1, '{center}{bold}'+currentLocalTime()+' '+this.URL+'{/bold} {red-fg}FAILED{/red-fg}{/center}')
		}
		
		screen.render()
	}
}

const objs = []

var cashNOW = false

for (var i=2; i<process.argv.length; i++)
{
	if (process.argv[i] == '--cashout' || process.argv[i] == '--cashNOW')
	{
		cashNOW = (process.argv[i] == '--cashNOW')
		cashoutChecks = true
		debugging = true
	} else if (process.argv[i] == '--debug')
		debugging = true
	else if (process.argv[i] == '--crossconnect')
		crossConnect = true
	else
	{
		objs[objs.length] = new beeMonitor(process.argv[i], cashNOW)
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
if (cashNOW) showError("Cashing ALL checks NOW!")
else if (cashoutChecks) showError("Cashing checks!")
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

var lastSync = ""

async function pollBlockchain(URL)
{
	var timeout = 1000
	try 
	{
		blockchainURL = URL
		//var blockNumber = await getBlockNumber(URL)
		var gasPrice = await getGasPrice(URL)
		var pending = await getPendingCount(URL)
		
		var gp = fullEther(gasPrice,true)
		if (gp.length > 10) [gp] = prettyEther(gasPrice, true)
		
		//console.error("blockNumber="+blockNumber+' gas='+shortNum(gasPrice)+' or '+gp)
		var sync = await getSyncing(URL)
		//var peers = await getPeers(URL)
		//console.error('sync:'+sync)
		//console.error('peers:'+peers)
		if (Number(sync))
			sync = "{green-fg}"+sync+"{/}"
		else sync = "{red-fg}"+sync+"{/}"
		
		//console.error(`pending=${pending}`)
		
		setGasPrice(gasPrice, pending)
		//setGasPrice(gasPrice)
		if (sync != lastSync)
		{
			if (Number(sync)) timeout = 10000	// synced and just changed, sleep 10 seconds
			lastSync = sync
			updateGoerli(sync)
		}
	} catch (error)
	{	showError('pollBlockchain:'+error);
		timeout = 10000	// Don't beat it up if we're having errors
	}
	setTimeout(pollBlockchain, timeout, URL)
}

refreshScreens()
refreshCashBox()
maxGasPrice = 20000000000	// 20gwei	// 1500000000 = 1.5gwei  1000000000 = 1gwei
//pollBlockchain("http://192.168.10.17:8546")	// Set your swap-endpoint here
