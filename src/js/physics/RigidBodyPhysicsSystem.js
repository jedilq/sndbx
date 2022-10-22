import * as CANNON from 'cannon-es';

import { GameSystem } from 'elixr';
import { RigidBodyComponent } from './RigidBodyComponent';

const STEP_TIME = 1 / 90;

export class RigidBodyPhysicsSystem extends GameSystem {
	init() {
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, 0, 0);
		this.physicsWorld.broadphase = new CANNON.NaiveBroadphase();
		this.physicsWorld.solver.iteractions = 2;
	}

	update(delta, _time) {
		this.queryGameObjects('rigidBodies').forEach((gameObject) => {
			const rigidBody = gameObject.getMutableComponent(RigidBodyComponent);
			if (!rigidBody._rigidBody) {
				const body = new CANNON.Body({
					angularDamping: rigidBody.angularDamping,
					angularFactor: rigidBody.angularConstraints,
					linearDamping: rigidBody.linearDamping,
					linearFactor: rigidBody.linearConstraints,
					collisionFilterGroup: rigidBody.collisionGroup,
					fixedRotation: rigidBody.fixedRotation,
					isTrigger: rigidBody.isTrigger,
					mass: rigidBody.mass,
					shape: rigidBody.shape,
					type: rigidBody.bodyType,
					velocity: rigidBody.velocity,
				});
				this.physicsWorld.addBody(body);
				rigidBody._rigidBody = body;
				rigidBody.setTransformFromObject3D(gameObject);
			} else if (rigidBody._rigidBody.removalFlag) {
				this.physicsWorld.removeBody(rigidBody._rigidBody);
			}
		});
		this.physicsWorld.step(STEP_TIME, delta);
		this.queryGameObjects('rigidBodies').forEach((gameObject) => {
			const rigidBody = gameObject.getMutableComponent(RigidBodyComponent);
			rigidBody.copyTransformToObject3D(gameObject);
		});
	}
}

RigidBodyPhysicsSystem.queries = {
	rigidBodies: { components: [RigidBodyComponent] },
};
