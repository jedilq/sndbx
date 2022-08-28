import * as THREE from 'three';

import { Collider, VerticalCollider } from '../../components/TagComponents';
import { Not, System } from 'ecsy';

import { Object3DComponent } from '../../components/Object3DComponent';
import { RigidBodyComponent } from '../../components/RigidBodyComponent';
import { deleteEntity } from '../../utils/ecsyUtils';

export class RigidBodyPhysicsSystem extends System {
	init() {
		this._helperVec3 = new THREE.Vector3();
		this._helperMatrix4 = new THREE.Matrix4();
		this.raycaster = new THREE.Raycaster();
		this.raycaster.far = 0.1;
	}

	execute(delta, _time) {
		let collidingObjects = this.collectAllCollidingObjects();
		this.queries.rigidBody.results.forEach((entity) => {
			let rigidBodyMesh = entity.getComponent(Object3DComponent).value;
			let rigidBodyComponent = entity.getMutableComponent(RigidBodyComponent);
			if (!rigidBodyComponent.active) return;

			if (rigidBodyComponent.perishable && rigidBodyComponent.timeToLive <= 0) {
				deleteEntity(entity);
			} else {
				let collision = this.checkForCollision(
					rigidBodyMesh,
					rigidBodyComponent,
					collidingObjects,
				);

				if (collision) {
					this.changeRigidBodyTrajectory(
						rigidBodyMesh,
						rigidBodyComponent,
						collision,
					);
				}

				this.advanceRigidBody(rigidBodyMesh, rigidBodyComponent, delta);
				if (
					rigidBodyComponent.hasRotation &&
					rigidBodyComponent.rotationSpeed > 0
				) {
					this.rotateRigidBody(rigidBodyMesh, rigidBodyComponent, delta);
				}
				if (rigidBodyComponent.perishable) {
					rigidBodyComponent.timeToLive -= delta;
				}
			}
		});
	}

	collectAllCollidingObjects() {
		return this.queries.collider.results.map(
			(entity) => entity.getComponent(Object3DComponent).value,
		);
	}

	checkForCollision(rigidBodyMesh, rigidBodyComponent, collidingObjects) {
		this.raycaster.set(rigidBodyMesh.position, rigidBodyComponent.direction);
		let intersect = this.raycaster.intersectObjects(collidingObjects)[0];
		return intersect;
	}

	changeRigidBodyTrajectory(rigidBodyMesh, rigidBodyComponent, collision) {
		rigidBodyComponent.direction.reflect(collision.face.normal);
		if (!rigidBodyComponent.hasRotation) {
			rigidBodyMesh.lookAt(
				this._helperVec3.addVectors(
					rigidBodyMesh.position,
					rigidBodyComponent.direction,
				),
			);
		} else {
			// randomize rotation axis and speed
			rigidBodyComponent.rotationAxis
				.set(Math.random(), Math.random(), Math.random())
				.normalize();
			rigidBodyComponent.rotationSpeed *= Math.random() * 0.4 + 0.6;
		}

		rigidBodyComponent.speed *=
			1 - rigidBodyComponent.collisionSpeedReductionFactor;
	}

	advanceRigidBody(rigidBodyMesh, rigidBodyComponent, delta) {
		this._helperVec3
			.copy(rigidBodyComponent.direction)
			.multiplyScalar(rigidBodyComponent.speed * delta);
		rigidBodyMesh.position.add(this._helperVec3);
		rigidBodyComponent.speed = Math.max(
			rigidBodyComponent.speed + rigidBodyComponent.dragDecel * delta,
			0,
		);
	}

	rotateRigidBody(rigidBodyMesh, rigidBodyComponent, delta) {
		rigidBodyMesh.rotateOnAxis(
			rigidBodyComponent.rotationAxis,
			rigidBodyComponent.rotationSpeed * delta,
		);
		rigidBodyComponent.rotationSpeed *= 1 - rigidBodyComponent.spinDown * delta;
		if (Math.abs(rigidBodyComponent.rotationSpeed) < 0.05)
			rigidBodyComponent.rotationSpeed = 0;
	}
}

RigidBodyPhysicsSystem.queries = {
	collider: {
		components: [Collider, Not(VerticalCollider), Object3DComponent],
	},
	rigidBody: { components: [RigidBodyComponent, Object3DComponent] },
};
