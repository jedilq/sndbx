import * as THREE from 'three';

import { Component, Types } from 'ecsy';

export class RigidBodyComponent extends Component {
	serialize() {
		return {
			active: this.active,
			direction: this.direction.toArray(),
			speed: this.speed,
			dragDecel: this.dragDecel,
			hasRotation: this.hasRotation,
			rotationAxis: this.rotationAxis.toArray(),
			rotationSpeed: this.rotationSpeed,
			spinDown: this.spinDown,
			perishable: this.perishable,
			timeToLive: this.timeToLive,
			ignoreRigidBodyCollision: this.ignoreRigidBodyCollision,
			collisionSpeedReductionFactor: this.collisionSpeedReductionFactor,
		};
	}

	deserialize(object) {
		this.active = object.active;
		this.direction = new THREE.Vector3().fromArray(object.direction);
		this.speed = object.speed;
		this.dragDecel = object.dragDecel;
		this.hasRotation = object.hasRotation;
		this.rotationAxis = new THREE.Vector3().fromArray(object.rotationAxis);
		this.rotationSpeed = object.rotationAxis;
		this.spinDown = object.spinDown;
		this.perishable = object.perishable;
		this.timeToLive = object.timeToLive;
		this.ignoreRigidBodyCollision = object.ignoreRigidBodyCollision;
		this.collisionSpeedReductionFactor = object.collisionSpeedReductionFactor;
	}
}

RigidBodyComponent.schema = {
	active: { type: Types.Boolean, default: true },
	// translational movement
	direction: { type: Types.Ref, default: undefined },
	speed: { type: Types.Number, default: 0 },
	dragDecel: { type: Types.Number, default: 0 },
	// rotational movement
	hasRotation: { type: Types.Boolean, default: false },
	rotationAxis: { type: Types.Ref, default: undefined },
	rotationSpeed: { type: Types.Number, default: 0 },
	spinDown: { type: Types.Number, default: 0 },

	perishable: { type: Types.Boolean, default: true },
	timeToLive: { type: Types.Number, default: 3 },

	ignoreRigidBodyCollision: { type: Types.Boolean, default: true },
	collisionSpeedReductionFactor: { type: Types.Number, default: 0 },
};

RigidBodyComponent.createDefaultSchema = () => {
	return {
		active: true,
		direction: new THREE.Vector3(0, 0, -1),
		speed: 0,
		dragDecel: -0.1,
		hasRotation: true,
		rotationAxis: new THREE.Vector3(),
		rotationSpeed: 0,
		spinDown: 0.2,
		perishable: false,
		timeToLive: 0,
		ignoreRigidBodyCollision: false,
		collisionSpeedReductionFactor: 0.3,
	};
};
