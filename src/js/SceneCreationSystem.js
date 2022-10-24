import * as THREE from 'three';

import { Physics, RigidBodyComponent, SingleUseGameSystem } from 'elixr';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';

export class SceneCreationSystem extends SingleUseGameSystem {
	update() {
		const room = new THREE.LineSegments(
			new BoxLineGeometry(5.98, 2.98, 5.98, 10, 5, 10),
			new THREE.LineBasicMaterial({ color: 0x808080 }),
		);
		room.geometry.translate(0, 1.5, 0);
		this.core.scene.add(room);
		this.core.scene.background = new THREE.Color(0x505050);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		this.core.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
		this.core.scene.add(directionalLight);

		this._createBox(
			{ x: 6, y: 0.02, z: 6 },
			new THREE.Vector3(0, 0, 0),
			0xff5f1f,
			false,
		);

		this._createBox(
			{ x: 6, y: 0.02, z: 6 },
			new THREE.Vector3(0, 3, 0),
			0xff5f1f,
			false,
		);

		this._createBox(
			{ x: 6, y: 3, z: 0.02 },
			new THREE.Vector3(0, 1.5, -3),
			0x3a3b3c,
			false,
		);

		this._createBox(
			{ x: 6, y: 3, z: 0.02 },
			new THREE.Vector3(0, 1.5, 3),
			0x3a3b3c,
			false,
		);

		this._createBox(
			{ x: 0.02, y: 3, z: 6 },
			new THREE.Vector3(3, 1.5, 0),
			0x3a3b3c,
			false,
		);

		this._createBox(
			{ x: 0.02, y: 3, z: 6 },
			new THREE.Vector3(-3, 1.5, 0),
			0x3a3b3c,
			false,
		);
	}

	_createBox(dimensions, position, color, visible = true) {
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z),
			new THREE.MeshStandardMaterial({ color }),
		);
		this.core.scene.add(box);

		const wallObject = this.core.createGameObject(box);

		wallObject.position.copy(position);
		wallObject.visible = visible;

		wallObject.addComponent(RigidBodyComponent, {
			mass: 0,
			shape: new Physics.Box(
				new THREE.Vector3(dimensions.x / 2, dimensions.y / 2, dimensions.z / 2),
			),
			type: Physics.BODY_TYPES.STATIC,
		});
	}
}
