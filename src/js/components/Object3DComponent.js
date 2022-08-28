import { Component, Types } from 'ecsy';

export class Object3DComponent extends Component {
	/**
	 * Update the Object3DComponent.value with new Object3D, parenting the new
	 * object under the parent of the old object, and disposing the old object
	 * @param {THREE.Object3D} newObject - new Object3D to replace the old one
	 * @param {boolean} createClone - whether or not to create and use a clone
	 * of the new object, default to true
	 */
	update(newObject, createClone = true) {
		let oldObject = this.value;

		if (oldObject == null) throw 'Object3DComponent.value cannot be null';

		let parent = oldObject.parent;

		if (createClone) {
			newObject = newObject.clone();
		}

		this.value = newObject;

		parent.add(newObject);
		parent.remove(oldObject);
	}
}

Object3DComponent.schema = {
	value: { type: Types.Ref, default: undefined },
};
