import { GLTFModelLoader, THREE, XRGameSystem } from 'elixr';

export class ARSceneCreationSystem extends XRGameSystem {
	init() {
		this.rootObject = null;
	}

	update() {
		const frame = this.core.renderer.xr.getFrame();
		const referenceSpace = this.core.renderer.xr.getReferenceSpace();

		if (!this.lightingCreated) {
			const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
			this.core.scene.add(ambientLight);
			const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
			this.core.scene.add(directionalLight);
			this.lightingCreated = true;

			this.rootObject = new THREE.Object3D();

			// eslint-disable-next-line no-undef
			const anchorPose2 = new XRRigidTransform(
				{
					x: this.rootObject.x,
					y: this.rootObject.y,
					z: this.rootObject.z,
				},
				{
					x: this.rootObject.x,
					y: this.rootObject.y,
					z: this.rootObject.z,
					w: this.rootObject.w,
				},
			);
			frame.createAnchor(anchorPose2, referenceSpace).then(
				(anchor) => {
					this.rootObject.anchor = anchor;
					anchor.gameObject = this.rootObject;
					this.core.scene.add(this.rootObject);
				},
				(error) => {
					console.error('Could not create anchor: ' + error);
				},
			);

			// add all objects under rootObject
			GLTFModelLoader.getInstance().load('assets/Snowman.glb', (gltf) => {
				const model = gltf.scene;

				model.position.set(0, 0, -2);
				model.quaternion.set(0, 0, 0, 1);

				this.rootObject.add(model);
			});
		}

		if (this.rootObject.anchor) {
			const anchorPose = frame.getPose(
				this.rootObject.anchor.anchorSpace,
				referenceSpace,
			);
			if (anchorPose) {
				new THREE.Matrix4()
					.fromArray(anchorPose.transform.matrix)
					.decompose(
						this.rootObject.position,
						this.rootObject.quaternion,
						new THREE.Vector3(),
					);
				this.rootObject.visible = true;
			} else {
				this.rootObject.visible = false;
			}
		}
	}
}
