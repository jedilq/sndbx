import * as THREE from 'three';

import {
	GRAB_STATE,
	GrabbableComponent,
} from '../../components/GrabbableComponent';

import { HAND_MODE } from '../../components/HandComponent';
import { InteractionSystem } from '../../utils/ecsyUtils';
import { Object3DComponent } from '../../components/Object3DComponent';
import { Occupied } from '../../components/VrControllerComponent';
import { RigidBodyComponent } from '../../components/RigidBodyComponent';
import { TRIGGERS } from '../../lib/ControllerInterface';

const FOCUS_ANGLE_THRESHOLD = (10 / 180) * Math.PI;
const FOCUS_MAX_RANGE = 2;
const FLIGHT_SPEED = 8;
const OBJECT_HIGHLIGHT_SCORE_DISTANCE_WEIGHT = 0.7;
const NUM_FRAMES_TO_STORE = 10;

export class ObjectGNTSystem extends InteractionSystem {
	init() {
		this._helperVec3 = new THREE.Vector3();
		this._helperQuat = new THREE.Quaternion();
		this.handPosition = new THREE.Vector3();
		this.handDirection = new THREE.Vector3();
		this.cameraPosition = new THREE.Vector3();
		this.indicatorRing = null;
		this.gripFrames = {
			LEFT: [],
			RIGHT: [],
		};
	}

	onExecute(delta, time) {
		if (!this.indicatorRing) this.setupIndicatorRing();

		let camera = this.gameStateComponent.renderer.xr.getCamera();
		camera.getWorldPosition(this.cameraPosition);
		let maxScore = 0;
		let focusEntity = null;
		let handOccupied = { LEFT: false, RIGHT: false };
		this.queries.grabbable.results.forEach((entity) => {
			let grabbableComponent = entity.getMutableComponent(GrabbableComponent);
			grabbableComponent.stateJustChanged = false;
			let object = entity.getComponent(Object3DComponent).value;
			let handKey = grabbableComponent.handKey;
			if (grabbableComponent.state === GRAB_STATE.IDLE) {
				let objectScore = this.scoreObject(object);
				if (objectScore > maxScore) {
					maxScore = objectScore;
					focusEntity = entity;
				}
			} else if (grabbableComponent.state === GRAB_STATE.IN_FLIGHT) {
				let grabSpace = this.handComponents[handKey].grabSpace;
				let deltaVector = grabSpace
					.getWorldPosition(this.handPosition)
					.sub(object.getWorldPosition(this._helperVec3));
				if (deltaVector.length() < FLIGHT_SPEED * delta) {
					grabbableComponent.state = GRAB_STATE.IN_HAND;
				} else {
					object.position.add(
						deltaVector.normalize().multiplyScalar(FLIGHT_SPEED * delta),
					);
				}
			} else if (grabbableComponent.state === GRAB_STATE.IN_HAND) {
				if (
					!this.controllerInterfaces[handKey].triggerPressed(
						TRIGGERS.HAND_TRIGGER,
					)
				) {
					this.handComponents[handKey].mode = HAND_MODE.FIST;
					this.handComponents[handKey].resetGrabSpace();
					this.controllerEntities[handKey].removeComponent(Occupied);
					grabbableComponent.state = GRAB_STATE.IDLE;
					grabbableComponent.handKey = '';
					// implement throw here
					let rigidBodyComponent = entity.getMutableComponent(
						RigidBodyComponent,
					);
					rigidBodyComponent.active = true;
					if (this.gripFrames[handKey].length > 1) {
						let startFrame = this.gripFrames[handKey][
							this.gripFrames[handKey].length - 1
						];
						let endFrame = this.gripFrames[handKey][0];
						this._helperVec3.subVectors(endFrame[1], startFrame[1]);
						let speed =
							this._helperVec3.length() / (endFrame[0] - startFrame[0]);
						rigidBodyComponent.direction.copy(this._helperVec3.normalize());
						rigidBodyComponent.speed = speed;

						let deltaQuat = startFrame[2].invert().multiply(endFrame[2]);
						let [axis, angle] = getAxisAndAngelFromQuaternion(deltaQuat);
						let rotationSpeed = angle / (endFrame[0] - startFrame[0]);
						rigidBodyComponent.rotationAxis.copy(axis);
						rigidBodyComponent.rotationSpeed = rotationSpeed;
					}
					this.gripFrames[handKey] = [];
				} else {
					let handComponent = this.handComponents[handKey];
					handComponent.mode = HAND_MODE.GRAB;
					if (grabbableComponent.grabSpaceTransformOverride) {
						handComponent.grabSpace.position.copy(
							grabbableComponent.grabSpaceTransformOverride[handKey].position,
						);
						handComponent.grabSpace.quaternion.copy(
							grabbableComponent.grabSpaceTransformOverride[handKey].quaternion,
						);
					}
					this.gameStateComponent.scene.add(object);
					object.position.copy(
						handComponent.grabSpace.getWorldPosition(this._helperVec3),
					);
					object.quaternion.copy(
						handComponent.grabSpace.getWorldQuaternion(this._helperQuat),
					);

					this.gripFrames[handKey].unshift([
						time,
						this._helperVec3.clone(),
						this._helperQuat.clone(),
					]);
					if (this.gripFrames[handKey].length == NUM_FRAMES_TO_STORE + 1) {
						this.gripFrames[handKey].pop();
					}
				}
			}
			if (grabbableComponent.handKey) {
				handOccupied[grabbableComponent.handKey] = true;
			}
		});

		['LEFT', 'RIGHT'].forEach((handKey) => {
			if (
				!handOccupied[handKey] &&
				this.controllerEntities[handKey].hasComponent(Occupied)
			) {
				this.handComponents[handKey].mode = HAND_MODE.FIST;
				this.handComponents[handKey].resetGrabSpace();
				this.controllerEntities[handKey].removeComponent(Occupied);
			}
		});

		if (focusEntity) {
			let focusObject = focusEntity.getComponent(Object3DComponent).value;
			this.updateIndicatorRing(focusObject);
			Object.entries(this.controllerInterfaces).forEach((entry) => {
				let [handKey, controllerInterface] = entry;
				if (
					!this.controllerEntities[handKey].hasComponent(Occupied) &&
					controllerInterface.triggerJustPressed(TRIGGERS.HAND_TRIGGER)
				) {
					this.grabObject(focusEntity, handKey);
				}
			});
		} else {
			this.indicatorRing.visible = false;
		}
	}

	setupIndicatorRing() {
		this.indicatorRing = new THREE.Mesh(
			new THREE.RingGeometry(0.02, 0.03, 32),
			new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
		);
		this.indicatorRing.visible = false;
		this.gameStateComponent.scene.add(this.indicatorRing);
		this.indicatorRing.renderOrder = 999;
		this.indicatorRing.material.depthTest = false;
		this.indicatorRing.material.depthWrite = false;
	}

	grabObject(entity, handKey) {
		entity.getMutableComponent(RigidBodyComponent).active = false;
		this.gameStateComponent.scene.attach(
			entity.getComponent(Object3DComponent).value,
		);
		let grabbableComponent = entity.getMutableComponent(GrabbableComponent);
		grabbableComponent.state = GRAB_STATE.IN_FLIGHT;
		grabbableComponent.stateJustChanged = true;
		grabbableComponent.handKey = handKey;
		this.controllerEntities[handKey].addComponent(Occupied);
	}

	/**
	 *
	 * @param {THREE.Object3D} focusObject
	 */
	updateIndicatorRing(focusObject) {
		this.indicatorRing.visible = true;
		let camera = this.gameStateComponent.renderer.xr.getCamera();
		camera.getWorldPosition(this.cameraPosition);
		focusObject.getWorldPosition(this._helperVec3);
		this.indicatorRing.position.copy(this._helperVec3);
		this.indicatorRing.lookAt(this.cameraPosition);
	}

	scoreObject(object) {
		let score = 0;
		Object.entries(this.handComponents).forEach((entry) => {
			let [handKey, handComponent] = entry;
			if (!this.controllerEntities[handKey].hasComponent(Occupied)) {
				let grabSpace = handComponent.grabSpace;
				let handPosition = new THREE.Vector3();
				grabSpace.getWorldPosition(handPosition);
				let handDirection = new THREE.Vector3();
				grabSpace.getWorldDirection(handDirection).negate();

				object.getWorldPosition(this._helperVec3).sub(handPosition);
				let distance = this._helperVec3.length();
				let bonusScore = distance < 0.1 ? 1 : 0;
				if (distance < FOCUS_MAX_RANGE) {
					let angle = this._helperVec3.angleTo(handDirection);
					let distanceScore = (FOCUS_MAX_RANGE - distance) / FOCUS_MAX_RANGE;
					let angleScore =
						(FOCUS_ANGLE_THRESHOLD - angle) / FOCUS_ANGLE_THRESHOLD;
					score = Math.max(
						score,
						OBJECT_HIGHLIGHT_SCORE_DISTANCE_WEIGHT * distanceScore +
							(1 - OBJECT_HIGHLIGHT_SCORE_DISTANCE_WEIGHT) * angleScore +
							bonusScore,
					);
				}
			}
		});
		return score;
	}
}

ObjectGNTSystem.addQueries({
	grabbable: {
		components: [GrabbableComponent, RigidBodyComponent, Object3DComponent],
	},
});

const getAxisAndAngelFromQuaternion = (q) => {
	const angle = 2 * Math.acos(q.w);
	var s;
	if (1 - q.w * q.w < 0.000001) {
		s = 1;
	} else {
		s = Math.sqrt(1 - q.w * q.w);
	}
	return [new THREE.Vector3(q.x / s, q.y / s, q.z / s), angle];
};
