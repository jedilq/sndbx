import {
	BODY_TYPES,
	CubeObject,
	GLTFObject,
	MovementObstacle,
	MovementSurface,
	SingleUseGameSystem,
	THREE,
} from 'elixr';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class VRSceneCreationSystem extends SingleUseGameSystem {
	update() {
		this._createLighting();

		this._createRoom1();
		this._createRoom2();
		this._createRamp();

		const snowman = new GLTFObject('assets/Snowman.glb', {
			hasPhysics: true,
			mass: 1,
			type: BODY_TYPES.DYNAMIC,
		});
		this.core.addGameObject(snowman);
		snowman.position.set(0, 1.2, -2);
		snowman.rotateZ(Math.PI / 4);
		snowman.colliderVisible = true;
	}

	_createLighting() {
		new RGBELoader().load('assets/studio_small_09_1k.hdr', (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			this.core.scene.background = texture;
			this.core.scene.environment = texture;
		});
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		this.core.scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
		this.core.scene.add(directionalLight);
	}

	_createRoom1() {
		const boxFloor = new CubeObject(
			6,
			0.02,
			6,
			{ color: 0x3a3b3c },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxFloor);
		boxFloor.addComponent(MovementSurface);

		const boxCeiling = new CubeObject(
			6,
			0.02,
			6,
			{ color: 0xfaf9f6 },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxCeiling);
		boxCeiling.position.set(0, 3, 0);

		const boxWall = new CubeObject(
			6,
			3,
			0.02,
			{ color: 0xfaf9f6 },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxWall);
		boxWall.position.set(0, 1.5, 3);
		boxWall.addComponent(MovementObstacle);

		const boxWall3 = boxWall.clone(true);
		this.core.addGameObject(boxWall3);
		boxWall3.position.set(3, 1.5, 0);
		boxWall3.rotateY(Math.PI / 2);

		const boxWall4 = boxWall.clone(true);
		this.core.addGameObject(boxWall4);
		boxWall4.position.set(-3, 1.5, 0);
		boxWall4.rotateY(Math.PI / 2);

		const boxWall5 = new CubeObject(
			2,
			3,
			0.02,
			{ color: 0xfaf9f6 },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxWall5);
		boxWall5.position.set(2, 1.5, -3);
		boxWall5.addComponent(MovementObstacle);

		const boxWall6 = boxWall5.clone(true);
		this.core.addGameObject(boxWall6);
		boxWall6.position.set(-2, 1.5, -3);
	}

	_createRoom2() {
		const roomPositionOffset = new THREE.Vector3(
			0,
			2,
			-(6 + Math.pow(3, 0.5) * 2),
		);
		const boxFloor = new CubeObject(
			6,
			0.02,
			6,
			{ color: 0x3a3b3c },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxFloor);
		boxFloor.addComponent(MovementSurface);
		boxFloor.position.add(roomPositionOffset);

		const boxCeiling = new CubeObject(
			6,
			0.02,
			6,
			{ color: 0xfaf9f6 },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxCeiling);
		boxCeiling.position.set(0, 3, 0);
		boxCeiling.position.add(roomPositionOffset);

		const boxWall = new CubeObject(
			6,
			3,
			0.02,
			{ color: 0xfaf9f6 },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxWall);
		boxWall.position.set(0, 1.5, -3);
		boxWall.addComponent(MovementObstacle);
		boxWall.position.add(roomPositionOffset);

		const boxWall3 = boxWall.clone(true);
		this.core.addGameObject(boxWall3);
		boxWall3.position.set(3, 1.5, 0);
		boxWall3.rotateY(Math.PI / 2);
		boxWall3.position.add(roomPositionOffset);

		const boxWall4 = boxWall.clone(true);
		this.core.addGameObject(boxWall4);
		boxWall4.position.set(-3, 1.5, 0);
		boxWall4.rotateY(Math.PI / 2);
		boxWall4.position.add(roomPositionOffset);

		const boxWall5 = new CubeObject(
			2,
			3,
			0.02,
			{ color: 0xfaf9f6 },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(boxWall5);
		boxWall5.position.set(2, 1.5, 3);
		boxWall5.addComponent(MovementObstacle);
		boxWall5.position.add(roomPositionOffset);

		const boxWall6 = boxWall5.clone(true);
		this.core.addGameObject(boxWall6);
		boxWall6.position.set(-2, 1.5, 3);
		boxWall6.position.add(roomPositionOffset);
	}

	_createRamp() {
		const rampFloor = new CubeObject(
			2,
			0.02,
			4,
			{ color: 0xff5f1f },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(rampFloor);
		rampFloor.rotateX(Math.PI / 6);
		rampFloor.position.set(0, 1, -Math.pow(3, 0.5) - 3);
		rampFloor.addComponent(MovementSurface);

		const rampCeiling = rampFloor.clone(true);
		this.core.addGameObject(rampCeiling);
		rampCeiling.position.add(new THREE.Vector3(0, 3, 0));
		rampCeiling.removeComponent(MovementSurface);

		const rampSidePanel = new CubeObject(
			0.02,
			5,
			Math.pow(3, 0.5) * 2,
			{ color: 0xff5f1f },
			{ mass: 0, type: BODY_TYPES.STATIC },
		);
		this.core.addGameObject(rampSidePanel);
		rampSidePanel.position.set(1, 2.5, -Math.pow(3, 0.5) - 3);
		rampSidePanel.addComponent(MovementObstacle);

		const rampSidePanel2 = rampSidePanel.clone(true);
		this.core.addGameObject(rampSidePanel2);
		rampSidePanel2.position.set(-1, 2.5, -Math.pow(3, 0.5) - 3);
	}
}
