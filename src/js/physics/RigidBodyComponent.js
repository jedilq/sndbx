import * as THREE from 'three';

import { GameComponent, Types } from 'elixr';

export class RigidBodyComponent extends GameComponent {}

RigidBodyComponent.schema = {
	active: { type: Types.Boolean, default: true },
	// translational movement
	direction: { type: Types.Ref, default: undefined },
	speed: { type: Types.Number, default: 0 },
	dragDecel: { type: Types.Number, default: 0 },
	// rotational movement
	rotationAxis: { type: Types.Ref, default: undefined },
	rotationSpeed: { type: Types.Number, default: 0 },
	spinDown: { type: Types.Number, default: 0 },

	collisionSpeedReductionFactor: { type: Types.Number, default: 0 },
};

RigidBodyComponent.createDefaultSchema = () => {
	return {
		active: true,
		direction: new THREE.Vector3(0, 0, -1),
		speed: 0,
		dragDecel: -0.1,
		rotationAxis: new THREE.Vector3(),
		rotationSpeed: 0,
		spinDown: 0.2,
		collisionSpeedReductionFactor: 0.3,
	};
};
