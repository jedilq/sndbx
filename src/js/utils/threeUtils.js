import * as THREE from 'three';

export const swapModel = (oldModel, newModel, discard = true) => {
	if (oldModel.parent) oldModel.parent.add(newModel);
	newModel.position.copy(oldModel.position);
	newModel.quaternion.copy(oldModel.quaternion);
	[...oldModel.children].forEach(newModel.attach);
	if (oldModel.parent && discard) oldModel.parent.remove(oldModel);
};

export const serializeTransform = (object) => {
	return {
		position: object.getWorldPosition(new THREE.Vector3()).toArray(),
		quaternion: object.getWorldQuaternion(new THREE.Quaternion()).toArray(),
	};
};

export const deserializeTransform = (transform, object) => {
	try {
		object.position.fromArray(transform.position);
		object.quaternion.fromArray(transform.quaternion);
	} catch (e) {
		console.log(e);
	}
};
