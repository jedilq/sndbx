import { GLTFObject, Matrix4, THREE, XRGameSystem } from 'elixr';

export class ARSceneCreationSystem extends XRGameSystem {
	init() {
		this.snowman = null;
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

			const snowman = new GLTFObject('assets/Snowman.glb', {
				hasPhysics: false,
			});
			this.core.addGameObject(snowman);
			snowman.position.set(0, 1.2, -2);
			snowman.rotateZ(Math.PI / 4);
			snowman.colliderVisible = true;

			// generate anchor pose from snowman's position and rotation
			// eslint-disable-next-line no-undef
			const anchorPose = new XRRigidTransform(
				{ x: snowman.position.x, y: snowman.position.y, z: snowman.position.z },
				{
					x: snowman.quaternion.x,
					y: snowman.quaternion.y,
					z: snowman.quaternion.z,
					w: snowman.quaternion.w,
				},
			);

			// create anchor using anchor pose and reference space
			// the use of XRSpace here can be versatile, for example if you create an
			// anchor from a hit test result, you can use the hit test result's space
			// as the reference space, or if you create an anchor from your hand's
			// pose, you can use the hand's target ray space as the reference space
			frame.createAnchor(anchorPose, referenceSpace).then(
				(anchor) => {
					snowman.anchor = anchor;
					anchor.gameObject = snowman;
				},
				(error) => {
					console.error('Could not create anchor: ' + error);
				},
			);

			this.snowman = snowman;
		}

		const anchor = this.snowman.anchor;
		if (anchor) {
			// get anchor pose from anchor space and reference space
			// update snowman's position and rotation based on anchor pose each frame
			const anchorPose = frame.getPose(anchor.anchorSpace, referenceSpace);
			if (anchorPose) {
				new Matrix4()
					.fromArray(anchorPose.transform.matrix)
					.decompose(
						this.snowman.position,
						this.snowman.quaternion,
						this.snowman.scale,
					);
				this.snowman.visible = true;
			} else {
				this.snowman.visible = false;
			}
		}
	}
}
