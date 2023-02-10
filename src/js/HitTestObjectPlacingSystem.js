import { GLTFModelLoader, THREE, XRGameSystem } from 'elixr';

export class HitTestObjectPlacingSystem extends XRGameSystem {
	init() {
		this.hitTestSource = null;
		this.hitTestSourceRequested = false;
		this.reticle = null;
		this.ducks = [];
	}

	update() {
		const frame = this.core.renderer.xr.getFrame();
		const referenceSpace = this.core.renderer.xr.getReferenceSpace();

		if (frame) {
			if (this.hitTestSourceRequested === false) {
				this.hitTestSourceRequested = true;
				// Request a hit test source using the viewer as the reference space
				// On mobile devices, this translates to the direction the camera is facing
				// On headsets, this translates to the direction the headset is facing
				// We only need one hit test source for the entire session
				frame.session.requestReferenceSpace('viewer').then((referenceSpace) => {
					frame.session
						.requestHitTestSource({ space: referenceSpace })
						.then((source) => {
							this.hitTestSource = source;
						});
				});

				// Load a gltf model
				// We don't want to load this model every time we place an object
				GLTFModelLoader.getInstance().load(
					'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf',
					(gltf) => {
						const duck = gltf.scene;
						duck.scale.setScalar(0.1);

						// Once the model is loaded, we listen for the select event
						// On mobile devices, this translates to a tap
						// On headsets, this translates to a trigger press
						frame.session.addEventListener('select', () => {
							if (this.reticle) {
								// Clone the duck model and place it at the reticle's position
								const duckClone = duck.clone();
								duckClone.position.set(
									this.reticle.position.x,
									this.reticle.position.y,
									this.reticle.position.z,
								);
								duckClone.quaternion.set(
									this.reticle.quaternion.x,
									this.reticle.quaternion.y,
									this.reticle.quaternion.z,
									this.reticle.quaternion.w,
								);
								this.core.scene.add(duckClone);

								// eslint-disable-next-line no-undef
								const anchorPose = new XRRigidTransform(
									{
										x: duckClone.position.x,
										y: duckClone.position.y,
										z: duckClone.position.z,
									},
									{
										x: duckClone.quaternion.x,
										y: duckClone.quaternion.y,
										z: duckClone.quaternion.z,
										w: duckClone.quaternion.w,
									},
								);

								// create anchor using anchor pose and reference space
								frame.createAnchor(anchorPose, referenceSpace).then(
									(anchor) => {
										duckClone.anchor = anchor;
										anchor.gameObject = duckClone;
										this.ducks.push(duckClone);
									},
									(error) => {
										console.error('Could not create anchor: ' + error);
									},
								);
							}
						});
					},
				);
			}

			if (this.hitTestSource) {
				const hitTestResults = frame.getHitTestResults(this.hitTestSource);
				if (hitTestResults.length) {
					const hit = hitTestResults[0];
					// Create a reticle if it doesn't exist
					// This reticle is a cylinder that we will place at the hit test result's pose
					if (this.reticle === null) {
						this.reticle = new THREE.Mesh(
							new THREE.CylinderGeometry(0.1, 0.1, 0.001, 32),
							new THREE.MeshBasicMaterial({ color: 0xffffff }),
						);
						this.core.scene.add(this.reticle);
					}

					// get hit test result's pose and update reticle's position and rotation
					const hitPose = hit.getPose(referenceSpace);
					this.reticle.position.set(
						hitPose.transform.position.x,
						hitPose.transform.position.y,
						hitPose.transform.position.z,
					);
					this.reticle.quaternion.set(
						hitPose.transform.orientation.x,
						hitPose.transform.orientation.y,
						hitPose.transform.orientation.z,
						hitPose.transform.orientation.w,
					);
				}
			}

			// Update the position of the duck using its attached anchor
			for (const duck of this.ducks) {
				if (duck.anchor) {
					const anchorPose = frame.getPose(
						duck.anchor.anchorSpace,
						referenceSpace,
					);
					if (anchorPose) {
						new THREE.Matrix4()
							.fromArray(anchorPose.transform.matrix)
							.decompose(duck.position, duck.quaternion, new THREE.Vector3());
						duck.visible = true;
					} else {
						duck.visible = false;
					}
				}
			}
		}
	}
}
