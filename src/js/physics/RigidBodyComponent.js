import { GameComponent, Types } from 'elixr';

export class RigidBodyComponent extends GameComponent {
	/**
	 * Sync rigid body transform to rendered object
	 * @param {THREE.Object3D} object3D
	 */
	copyTransformToObject3D(object3D) {
		if (this._rigidBody) {
			object3D.position.copy(this._rigidBody.position);
			object3D.quaternion.copy(this._rigidBody.quaternion);
		} else {
			console.warn('Rigid body is not initialized yet');
		}
	}

	/**
	 * Set rigid body transform from rendered object
	 * @param {THREE.Object3D} object3D
	 */
	setTransformFromObject3D(object3D) {
		if (this._rigidBody) {
			this._rigidBody.position.copy(object3D.position);
			this._rigidBody.quaternion.copy(object3D.quaternion);
		} else {
			console.warn('Rigid body is not initialized yet');
		}
	}

	remove() {
		this._rigidBody.removalFlag = true;
	}
}

RigidBodyComponent.schema = {
	mass: { type: Types.Number, default: 0 },
	shape: { type: Types.Ref },
	bodyType: { type: Types.String },
	velocity: { type: Types.Ref },

	active: { type: Types.Boolean, default: true },
	angularDamping: { type: Types.Number, default: 0.01 },
	angularConstraints: { type: Types.Ref },
	linearDamping: { type: Types.Number, default: 0.01 },
	linearConstraints: { type: Types.Ref },
	collisionGroup: { type: Types.Number, default: 1 },
	fixedRotation: { type: Types.Boolean, default: false },
	isTrigger: { type: Types.Boolean, default: false },

	_rigidBody: { type: Types.Ref },
};
