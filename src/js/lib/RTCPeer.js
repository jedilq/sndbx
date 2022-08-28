import randomatic from 'randomatic';

const SimplePeer = window.SimplePeer;
const SIGNALING_SERVER = 'http://144.126.211.214:3000';

export class RTCPeer {
	constructor() {
		this.resetPeer();
		this._onConnect = () => {};
		this._onData = (_) => {};
		this._decoder = new TextDecoder('utf-8');
		// debug
		window.resetRTCPeer = () => this.resetPeer();
	}

	get sessionId() {
		return this._sessionId;
	}

	get connected() {
		return this._connected;
	}

	resetPeer() {
		this._sessionId = randomatic('A0', 5, { exclude: '0oOiIlL1' });
		this._password = randomatic('*', 20);
		this._connecting = false;
		this._connected = false;
		this._peer?.destroy();
		this._peer = null;
		this._abortController = new AbortController();
	}

	async _setupPeer(peerSessionId = null) {
		this._peer = new SimplePeer({ initiator: peerSessionId != null });
		this._connecting = true;

		this._peer.on('signal', (data) => {
			console.log(data);
			if (peerSessionId) {
				SignalSend(this._sessionId, this._password, peerSessionId, data);
			}
		});
		this._peer.on('connect', () => {
			this._connecting = false;
			this._connected = true;
			this._onConnect();
		});
		this._peer.on('data', (data) => {
			const decodedData = this._decoder.decode(data);
			this._onData(decodedData);
		});
		this._peer.on('error', (err) => {
			this._connected = false;
			console.log(err);
		});

		while (this._connecting) {
			console.log('hello');
			try {
				const message = await SignalReceive(
					this._sessionId,
					this._password,
					this._abortController.signal,
				);
				peerSessionId = message.from;
				this._peer.signal(message.data);
			} catch (e) {
				console.log("didn't receive a message or an error, retrying...", e);
			}
		}
	}

	async initiateConnection(peerSessionId) {
		this._setupPeer(peerSessionId);
	}

	async waitForConnection() {
		this._setupPeer();
	}

	onConnect(connectAction) {
		this._onConnect = connectAction;
	}

	onData(dataAction) {
		this._onData = dataAction;
	}

	send(data) {
		try {
			this._peer.send(data);
		} catch (e) {
			this._connected = false;
		}
	}
}

async function SignalReceive(username, password, signal = undefined) {
	const headers = new Headers({
		Authorization: 'Basic ' + window.btoa(username + ':' + password),
	});

	const response = await fetch(SIGNALING_SERVER, {
		method: 'GET',
		cache: 'no-cache',
		headers: headers,
		signal,
	});

	try {
		var data = await response.json();
		const from = response.headers.get('X-From');
		console.log('Received', data);
		return { from: from, data: data };
	} catch (e) {
		return null;
	}
}

async function SignalSend(username, password, to, message, signal = undefined) {
	console.log('Sending', message);

	const headers = new Headers({
		Authorization: 'Basic ' + window.btoa(username + ':' + password),
	});

	await fetch(`${SIGNALING_SERVER}?to=${to}`, {
		method: 'POST',
		cache: 'no-cache',
		headers: headers,
		body: JSON.stringify(message),
		signal,
	});
}
