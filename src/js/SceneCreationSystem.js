import * as THREE from 'three';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { SingleUseGameSystem } from 'elixr';

export class SceneCreationSystem extends SingleUseGameSystem {
	update() {
		const room = new THREE.LineSegments(
			new BoxLineGeometry(6, 6, 6, 10, 10, 10),
			new THREE.LineBasicMaterial({ color: 0x808080 }),
		);
		room.geometry.translate(0, 3, 0);
		this.core.scene.add(room);
		this.core.scene.background = new THREE.Color(0x505050);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		this.core.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
		this.core.scene.add(directionalLight);
	}
}
