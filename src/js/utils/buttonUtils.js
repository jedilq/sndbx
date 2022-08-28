import * as THREE from 'three';

const TOUCH_RADIUS = 0.01;

export const createLongButton = (width, height, path) => {
	const geometry = new THREE.PlaneGeometry(width, height);
	const material = new THREE.MeshBasicMaterial({
		color: 0xffff00,
		transparent: true,
		opacity: 0,
	});
	const plane = new THREE.Mesh(geometry, material);

	const defaultButtonMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(width, height),
		new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load(path),
			transparent: true,
			side: THREE.DoubleSide,
		}),
	);
	plane.add(defaultButtonMesh);
	defaultButtonMesh.position.z = 0.001;
	return plane;
};

export const createRoundButton = (radius, defaultPath, pressedPath = null) => {
	const geometry = new THREE.CircleGeometry(radius, 8);
	const material = new THREE.MeshBasicMaterial({
		color: 0xffff00,
		transparent: true,
		opacity: 0,
	});
	const circle = new THREE.Mesh(geometry, material);

	const defaultButtonMesh = new THREE.Mesh(
		new THREE.PlaneGeometry(radius * 2, radius * 2),
		new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load(defaultPath),
			transparent: true,
			side: THREE.DoubleSide,
		}),
	);
	circle.add(defaultButtonMesh);
	defaultButtonMesh.position.z = 0.001;

	if (pressedPath) {
		const pressedButtonMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(radius * 2, radius * 2),
			new THREE.MeshBasicMaterial({
				map: new THREE.TextureLoader().load(pressedPath),
				transparent: true,
				side: THREE.DoubleSide,
			}),
		);
		circle.add(pressedButtonMesh);
		pressedButtonMesh.position.z = 0.001;

		pressedButtonMesh.visible = false;
		circle.pressed = false;
		circle.toggle = function () {
			this.pressed = !this.pressed;
			defaultButtonMesh.visible = !this.pressed;
			pressedButtonMesh.visible = this.pressed;
		};
	}
	return circle;
};

export const checkButtonIntersect = (handComponent, buttonMesh) => {
	if (!buttonMesh.geometry.boundsTree) {
		buttonMesh.geometry.computeBoundsTree();
	}

	const transformMatrix = new THREE.Matrix4()
		.copy(buttonMesh.matrixWorld)
		.invert()
		.multiply(handComponent.indexTip.matrixWorld);

	const sphere = new THREE.Sphere(undefined, TOUCH_RADIUS);
	sphere.applyMatrix4(transformMatrix);

	return buttonMesh.geometry.boundsTree.intersectsSphere(sphere);
};
