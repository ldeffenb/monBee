const { BeeDebug } = require("@ethersphere/bee-js")

function isUndefined(value){
    // Obtain `undefined` value that's
    // guaranteed to not have been re-assigned
    var undefined = void(0);
    return value === undefined;
}

var beeDebug = new BeeDebug('http://localhost:1635')

// Work around spelling misteak (sic) on getChequebookBalance pending correction
if (isUndefined(beeDebug.getChequebookBalance))
	beeDebug.getChequebookBalance = beeDebug.getChequeubookBalance
	
async function tryIt()
{	var balance = await beeDebug.getChequebookBalance()
	console.log(balance)
}

tryIt()
