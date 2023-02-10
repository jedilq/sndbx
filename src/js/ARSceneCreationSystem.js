import {
	GLTFModelLoader,
	GLTFObject,
	Matrix4,
	THREE,
	XRGameSystem,
} from 'elixr';

export class ARSceneCreationSystem extends XRGameSystem {
	init() {
		this.snowman = null;
		this.objects = [];
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

			const position = new THREE.Vector3(0, 0, -2);
			const quaternion = new THREE.Quaternion(0, 0, 0, 1);
			// eslint-disable-next-line no-undef
			const anchorPose2 = new XRRigidTransform(
				{
					x: position.x,
					y: position.y,
					z: position.z,
				},
				{
					x: quaternion.x,
					y: quaternion.y,
					z: quaternion.z,
					w: quaternion.w,
				},
			);
			frame.createAnchor(anchorPose2, referenceSpace).then(
				(anchor) => {
					GLTFModelLoader.getInstance().load('assets/snowman.glb', (gltf) => {
						const model = gltf.scene;

						model.position.copy(position);
						model.quaternion.copy(quaternion);
						model.anchor = anchor;
						anchor.gameObject = model;
						this.objects.push(model);
					});
				},
				(error) => {
					console.error('Could not create anchor: ' + error);
				},
			);
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

		for (const model of this.objects) {
			if (model.anchor) {
				const anchorPose = frame.getPose(
					model.anchor.anchorSpace,
					referenceSpace,
				);
				if (anchorPose) {
					new THREE.Matrix4()
						.fromArray(anchorPose.transform.matrix)
						.decompose(model.position, model.quaternion, new THREE.Vector3());
					model.visible = true;
				} else {
					model.visible = false;
				}
			}
		}
	}
}

// const addStuffToRoom = (objectUrl, frame, referenceSpace, models) => {
// 	GLTFModelLoader.getInstance().load(objectUrl, (gltf) => {
// 		const model = gltf.scene;

// 		model.position.set(0, 0, -2);
// 		model.quaternion.set(0, 0, 0, 1);

// 		// eslint-disable-next-line no-undef
// 		const anchorPose = new XRRigidTransform(
// 			{
// 				x: model.position.x,
// 				y: model.position.y,
// 				z: model.position.z,
// 			},
// 			{
// 				x: model.quaternion.x,
// 				y: model.quaternion.y,
// 				z: model.quaternion.z,
// 				w: model.quaternion.w,
// 			},
// 		);

// 		// create anchor using anchor pose and reference space
// 		frame.createAnchor(anchorPose, referenceSpace).then(
// 			(anchor) => {
// 				model.anchor = anchor;
// 				anchor.gameObject = model;
// 				models.push(model);
// 			},
// 			(error) => {
// 				console.error('Could not create anchor: ' + error);
// 			},
// 		);
// 	});
// };
