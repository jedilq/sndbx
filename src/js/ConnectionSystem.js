import { GameComponent, GameSystem, THREE, Types } from 'elixr';

const SPW_OPTIONS = {
	debug: true,
	serverUrl: 'https://whereismypeer.net:8000',
	simplePeerOptions: {
		config: {
			iceServers: [
				{
					urls: ['stun:ws-turn6.xirsys.com'],
				},
				{
					username:
						'uvHExGwBOpO3rvQwF-nt56O_ohdzs_cA4XZ2-fmJRjmJ195k3LKD66x5V4iqHMdpAAAAAGLsC5VmZWxpeHo=',
					credential: 'b8e6e188-1420-11ed-a07f-0242ac140004',
					urls: [
						'turn:ws-turn6.xirsys.com:80?transport=udp',
						'turn:ws-turn6.xirsys.com:3478?transport=udp',
						'turn:ws-turn6.xirsys.com:80?transport=tcp',
						'turn:ws-turn6.xirsys.com:3478?transport=tcp',
						'turns:ws-turn6.xirsys.com:443?transport=tcp',
						'turns:ws-turn6.xirsys.com:5349?transport=tcp',
					],
				},
			],
		},
	},
};

export class ConnectionSystem extends GameSystem {
	init() {
		const startButton = document.getElementById('start-button');
		const sessionIdBox = document.getElementById('session-id');

		startButton.onclick = () => {
			navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
				SPW_OPTIONS.isInitiator = sessionIdBox.value.length == 0;

				if (!SPW_OPTIONS.isInitiator) {
					SPW_OPTIONS.sessionId = sessionIdBox.value.toUpperCase();
				}

				SPW_OPTIONS.stream = stream;

				// eslint-disable-next-line no-undef
				this.spw = new SimplePeerWrapper(SPW_OPTIONS);

				// Make the peer connection
				this.spw.connect();

				// Do something when the connection is made
				this.spw.on('connect', () => {
					onConnect(SPW_OPTIONS.isInitiator);
				});

				// When data recieved over the connection call gotData
				this.spw.on('data', onData);

				this.spw.on('stream', onStream);

				this.spw.on('error', (error) => {
					// eslint-disable-next-line no-undef
					console.log(error);
				});

				this.spw.onCreated(onCreated);
			});
		};
		this.guestPlayers = {};

		const onConnect = (isHost) => {
			this.peerSpace = new THREE.Group();
			this.core.scene.add(this.peerSpace);
			const peerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
			this.peerHead = new THREE.Mesh(
				new THREE.SphereGeometry(0.1, 32, 16),
				peerMaterial,
			);
			this.peerLeftHand = new THREE.Mesh(
				new THREE.BoxGeometry(0.03, 0.1, 0.15),
				peerMaterial,
			);
			this.peerRightHand = new THREE.Mesh(
				new THREE.BoxGeometry(0.03, 0.1, 0.15),
				peerMaterial,
			);
			this.core.scene.add(this.peerHead);
			this.peerSpace.add(this.peerLeftHand);
			this.peerSpace.add(this.peerRightHand);

			if (!isHost) {
				this.core.playerSpace.position.set(0, 0, -1);
			}

			this.core.game.addComponent(ConnectionComponent);

			this.connection = this.core.game.getMutableComponent(ConnectionComponent);
		};

		const onCreated = (room) => {
			sessionIdBox.disabled = true;
			sessionIdBox.value = room;
			startButton.disabled = true;
		};

		const onStream = (stream) => {
			console.log(stream);
		};

		const onData = (payload) => {
			const data = JSON.parse(payload.data);
			if (data['playerSpace']) {
				deserializeTransform(data['playerSpace'], this.peerSpace);
			}
			if (data['head']) {
				deserializeTransform(data['head'], this.peerHead);
			}
			if (data['leftHand']) {
				deserializeTransform(data['leftHand'], this.peerLeftHand);
			}
			if (data['rightHand']) {
				deserializeTransform(data['rightHand'], this.peerRightHand);
			}
			if (this.connection && data['cubes'] && data['cubes'].length > 0) {
				this.connection.incomingCubes.push(...data['cubes']);
			}
		};

		window.onbeforeunload = () => {
			this.spw.close();
		};
	}

	execute(_delta, _time) {
		if (this.spw && this.connection) {
			const data = {};
			data['playerSpace'] = serializeTransform(this.core.playerSpace);
			data['head'] = serializeTransform(this.core.renderer.xr.getCamera());
			if (this.core.controllers['left']) {
				data['leftHand'] = serializeTransform(
					this.core.controllers['left'].gripSpace,
				);
			}
			if (this.core.controllers['right']) {
				data['rightHand'] = serializeTransform(
					this.core.controllers['right'].gripSpace,
				);
			}

			data['cubes'] = this.connection.outgoingCubes;
			this.spw.send(JSON.stringify(data));
			this.connection.outgoingCubes.length = 0;
		}
	}
}

const serializeTransform = (object) => {
	const transform = {};
	transform['position'] = object.position.toArray();
	transform['quaternion'] = object.quaternion.toArray();
	return transform;
};

const deserializeTransform = (transform, object) => {
	object.position.fromArray(transform['position']);
	object.quaternion.fromArray(transform['quaternion']);
};

export class ConnectionComponent extends GameComponent {}

ConnectionComponent.schema = {
	outgoingCubes: { type: Types.Array, default: [] },
	incomingCubes: { type: Types.Array, default: [] },
};
