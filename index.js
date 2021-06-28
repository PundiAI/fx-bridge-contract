'use strict';
var Web3 = require('web3')
const fs = require('fs');

let web3 = new Web3(Web3.givenProvider);
const stdin = process.openStdin()

const BACKSPACE = String.fromCharCode(127);

const getPassword = (prompt) => {
	if (prompt) {
		process.stdout.write(prompt + '\n');
	}

	let stdin = process.stdin;
	stdin.resume();
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding('utf8');

	let  password = '';
	return new Promise((resolve) => {
		stdin.on('data', function (ch) {
			ch = ch.toString('utf8');

			if (ch == "\n" || ch == "\r" || ch == "\u0004") {
				stdin.setRawMode(false);
				stdin.pause();
				return resolve(password)
			} else if (ch === "\u0003") {
				return resolve(true)
			} else if (ch === BACKSPACE) {
				password = password.slice(0, password.length - 1);
			} else {
				password += ch;
			}
		})
	})

}


const decryptKeyStore = async ({file}) => {
	if (!file) {
		throw Error(
			`must provide private key file`
		);
	}
	if (!fs.existsSync(file)) {
		throw Error(
			`private key file not exist`
		);
	}
	const privateEncrypt = JSON.parse(await fs.readFileSync(file));
	const password = await getPassword('Input passowrd:')
	const key = web3.eth.accounts.decrypt(privateEncrypt, password.toString())
	return key.privateKey;
}

module.exports = {
	decryptKeyStore
}
