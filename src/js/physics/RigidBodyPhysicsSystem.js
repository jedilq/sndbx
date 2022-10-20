import * as THREE from 'three';

import { GameSystem } from 'elixr';
import { RigidBodyComponent } from './RigidBodyComponent';

const RAYCAST_RANGE = 0.1;

export class RigidBodyPhysicsSystem extends GameSystem {
	init() {
		this._helperVec3 = new THREE.Vector3();
		this._helperMatrix4 = new THREE.Matrix4();
		this.raycaster = new THREE.Raycaster();
		this.raycaster.far = RAYCAST_RANGE;
		this.boundaryBox3 = new THREE.Box3(
			new THREE.Vector3(-3.2, -0.2, -3.2),
			new THREE.Vector3(3.2, 6.2, 3.2),
		);
	}

	update(delta, _time) {
		const rigidBodyObjects = this.queryGameObjects('rigidBodies');
		const wallObjects = rigidBodyObjects.filter((object) => {
			return object.userData.isWall;
		});
		rigidBodyObjects.forEach((rigidBodyObject) => {
			const rigidBodyComponent = rigidBodyObject.getMutableComponent(
				RigidBodyComponent,
			);
			if (!rigidBodyComponent.active) return;

			// const closeByObjects = rigidBodyObjects.filter((object) => {
			// 	if (object == rigidBodyObject) return false;
			// 	if (object.userData.isWall) return false;
			// 	const distance = object.position.distanceTo(rigidBodyObject.position);
			// 	return distance <= RAYCAST_RANGE;
			// });

			this.raycaster.set(
				rigidBodyObject.position,
				rigidBodyComponent.direction,
			);
			const wallIntersect = this.raycaster.intersectObjects(
				wallObjects,
				true,
			)[0];
			const intersect = this.raycaster.intersectObjects(
				rigidBodyObjects,
				true,
			)[0];

			if (wallIntersect) {
				this._changeRigidBodyTrajectory(rigidBodyComponent, wallIntersect);
			} else if (intersect) {
				this._changeRigidBodyTrajectory(rigidBodyComponent, intersect);
			}

			this._moveRigidBody(rigidBodyObject, rigidBodyComponent, delta);
			this._spinRigidBody(rigidBodyObject, rigidBodyComponent, delta);
		});
	}

	_changeRigidBodyTrajectory(rigidBodyComponent, intersect) {
		rigidBodyComponent.direction.reflect(
			intersect.face.normal
				.clone()
				.applyQuaternion(
					intersect.object.getWorldQuaternion(new THREE.Quaternion()),
				),
		);

		// randomize rotation axis and speed
		rigidBodyComponent.rotationAxis
			.set(Math.random(), Math.random(), Math.random())
			.normalize();
		rigidBodyComponent.rotationSpeed *= Math.random() * 0.4 + 0.6;

		rigidBodyComponent.speed *=
			1 - rigidBodyComponent.collisionSpeedReductionFactor;
	}

	_moveRigidBody(rigidBodyObject, rigidBodyComponent, delta) {
		if (rigidBodyComponent.speed == 0) return;
		this._helperVec3
			.copy(rigidBodyComponent.direction)
			.multiplyScalar(rigidBodyComponent.speed * delta);
		rigidBodyObject.position.add(this._helperVec3);
		rigidBodyComponent.speed = Math.max(
			rigidBodyComponent.speed + rigidBodyComponent.dragDecel * delta,
			0,
		);
		if (!this.boundaryBox3.containsPoint(rigidBodyObject.position)) {
			rigidBodyObject.position.copy(
				generateRandomPointInBox3(this.boundaryBox3),
			);
			console.log('wall bad');
		}
	}

	_spinRigidBody(rigidBodyObject, rigidBodyComponent, delta) {
		if (rigidBodyComponent.rotationSpeed == 0) return;
		rigidBodyObject.rotateOnAxis(
			rigidBodyComponent.rotationAxis,
			rigidBodyComponent.rotationSpeed * delta,
		);
		rigidBodyComponent.rotationSpeed *= 1 - rigidBodyComponent.spinDown * delta;
		if (Math.abs(rigidBodyComponent.rotationSpeed) < 0.05)
			rigidBodyComponent.rotationSpeed = 0;
	}
}

RigidBodyPhysicsSystem.queries = {
	rigidBodies: { components: [RigidBodyComponent] },
};

const generateRandomPointInBox3 = (box3) => {
	return new THREE.Vector3(
		(box3.max.x - box3.min.x) * Math.random() + box3.min.x,
		(box3.max.y - box3.min.y) * Math.random() + box3.min.y,
		(box3.max.z - box3.min.z) * Math.random() + box3.min.z,
	);
};
