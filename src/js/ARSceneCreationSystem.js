import { BODY_TYPES, CubeObject, THREE, XRGameSystem } from 'elixr';

export class ARSceneCreationSystem extends XRGameSystem {
	update() {
		if (!this.lightingCreated) {
			const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
			this.core.scene.add(ambientLight);
			const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
			this.core.scene.add(directionalLight);
			this.lightingCreated = true;
		}
		const frame = this.core.renderer.xr.getFrame();
		const referenceSpace = this.core.renderer.xr.getReferenceSpace();
		if (!this.planesSetup && frame.detectedPlanes.size > 0) {
			this.planesSetup = true;
			frame.detectedPlanes.forEach((plane) => {
				const planePose = frame.getPose(plane.planeSpace, referenceSpace);
				const polygon = plane.polygon;
				console.log(plane.orientation, polygon.length);

				let minx = Infinity;
				let minz = Infinity;
				let maxx = -Infinity;
				let maxz = -Infinity;

				polygon.forEach((point) => {
					minx = Math.min(minx, point.x);
					minz = Math.min(minz, point.z);
					maxx = Math.max(maxx, point.x);
					maxz = Math.max(maxz, point.z);
				});

				const planeObject = new CubeObject(
					maxx - minx,
					0.02,
					maxz - minz,
					{ color: 0xffffff * Math.random() },
					{ mass: 0, type: BODY_TYPES.STATIC },
				);
				this.core.addGameObject(planeObject);
				planeObject.visible = false;
				new THREE.Matrix4()
					.fromArray(planePose.transform.matrix)
					.decompose(
						planeObject.position,
						planeObject.quaternion,
						planeObject.scale,
					);
			});
		}
	}
}
