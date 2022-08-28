import * as THREE from 'three';

import { Collider, ObjectCollider } from '../../components/TagComponents';

import { CurvedRaycaster } from '../../lib/CurvedRaycaster';
import { InteractionSystem } from '../../utils/ecsyUtils';
import { LOCOMOTION_CONSTANTS } from '../../Constants';
import { Not } from 'ecsy';
import { Object3DComponent } from '../../components/Object3DComponent';

const NUM_MARKER_DOTS = 10;
const MARKER_GAP = 0.4;
const FLOOR_Y = 0;
const MARKER_Y_OFFSET = 0.02;

export class TeleportSystem extends InteractionSystem {
	init() {
		this.footPosition = new THREE.Vector3();
		this.teleportPosition = new THREE.Vector3();
		this.teleportDelta = new THREE.Vector3();

		this.markerGroup = null;
		this.endMarker = null;
		this.markerDots = [];
		this.markerPosition = new THREE.Vector3();
		this.raycaster = new CurvedRaycaster();

		this.teleportIsEngaged = false;
		this.teleportWasEngaged = false;
	}

	onExecute(_delta, _time) {
		if (!this.markerGroup) this.setupMarkerGroup();

		this.teleportIsEngaged = isJoystickEngaged(this.controllerInterfaces.RIGHT);

		if (this.teleportWasEngaged) {
			this.updateRaycaster();
			this.projectTeleportDestination();
		}

		this.updateMarkerGroup();

		this.teleportWasEngaged = this.teleportIsEngaged;
	}

	updateRaycaster() {
		let direction = this.controllerInterfaces.RIGHT.getDirection();
		let origin = this.controllerInterfaces.RIGHT.getPosition();
		this.raycaster.set(origin, direction);
	}

	projectTeleportDestination() {
		let webxrManager = this.gameStateComponent.renderer.xr;
		let viewerTransform = this.gameStateComponent.viewerTransform;
		// update foot position
		webxrManager.getCamera().getWorldPosition(this.footPosition);
		this.footPosition.setY(FLOOR_Y);

		let intersectableObjects = this.queries.collider.results.map(
			(entity) => entity.getComponent(Object3DComponent).value,
		);

		// game environment is enclosed with boundary colliders, there should always be an intersection
		let intersection = this.raycaster.intersectObjects(
			intersectableObjects,
			true,
		)[0];
		if (!intersection) {
			console.warn('no intersection, something went wrong');
			return;
		}

		this.teleportPosition.copy(intersection.point).setY(FLOOR_Y);
		this.teleportDelta.subVectors(this.teleportPosition, this.footPosition);

		if (this.teleportDelta.length() > MARKER_GAP * NUM_MARKER_DOTS) {
			this.teleportPosition.addVectors(
				this.footPosition,
				this.teleportDelta
					.normalize()
					.multiplyScalar(MARKER_GAP * NUM_MARKER_DOTS),
			);
		}

		if (!this.teleportIsEngaged) {
			this.teleport(viewerTransform);
		}
	}

	setupMarkerGroup() {
		this.markerGroup = new THREE.Group();
		this.gameStateComponent.scene.add(this.markerGroup);
		for (let i = 0; i < NUM_MARKER_DOTS; i++) {
			let markerDot = new THREE.Mesh(
				new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16),
				// new THREE.MeshBasicMaterial({ color: 0xffffff }),
				new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }),
			);
			this.markerGroup.add(markerDot);
			this.markerDots.push(markerDot);
		}
		this.endMarker = new THREE.Mesh(
			new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32),
			// new THREE.MeshBasicMaterial({ color: 0xffffff }),
			new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }),
		);
		this.markerGroup.add(this.endMarker);
	}

	updateMarkerGroup() {
		this.markerGroup.visible = this.teleportIsEngaged;
		if (!this.teleportIsEngaged) return;
		this.endMarker.position.copy(this.teleportPosition).y += MARKER_Y_OFFSET;

		let distanceToCover = this.footPosition.distanceTo(this.teleportPosition);
		let distanceCovered = 0;
		this.teleportDelta.normalize().multiplyScalar(MARKER_GAP);
		this.markerPosition.copy(this.footPosition).y += MARKER_Y_OFFSET;
		for (let i = 0; i < NUM_MARKER_DOTS; i++) {
			distanceCovered += MARKER_GAP;
			if (distanceCovered >= distanceToCover) {
				this.markerDots[i].visible = false;
			} else {
				this.markerDots[i].visible = true;
				this.markerDots[i].position.copy(
					this.markerPosition.add(this.teleportDelta),
				);
			}
		}
	}

	teleport(viewerTransform) {
		const offset = new THREE.Vector3();
		offset.copy(this.teleportPosition);

		offset.addScaledVector(this.footPosition, -1);

		viewerTransform.position.add(offset);
	}
}

TeleportSystem.addQueries({
	collider: { components: [Collider, Not(ObjectCollider), Object3DComponent] },
});

/**
 * Check whether joystick is engaged for teleport
 * @param {import('../../lib/ControllerInterface').ControllerInterface} controllerInterface
 * @returns {Boolean}
 */
const isJoystickEngaged = (controllerInterface) => {
	if (!controllerInterface) return false;
	let axisRad = controllerInterface.getJoystickAngle();
	let axisVal = controllerInterface.getJoystickValue();

	return (
		Math.abs(axisRad) > LOCOMOTION_CONSTANTS.TELEPORT_ANGLE_MIN &&
		Math.abs(axisRad) <= LOCOMOTION_CONSTANTS.TELEPORT_ANGLE_MAX &&
		axisVal >= LOCOMOTION_CONSTANTS.TELEPORT_VALUE_MIN
	);
};
