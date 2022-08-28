import * as THREE from 'three';

import { Component, Types } from 'ecsy';

export class GameStateComponent extends Component {}

GameStateComponent.schema = {
	// three globals
	renderer: { type: Types.Ref, default: undefined },
	scene: { type: Types.Ref, default: undefined },
	camera: { type: Types.Ref, default: undefined },

	// player globals
	viewerTransform: { type: Types.Ref, default: undefined },
};

export const createPlayerTransform = (scene, camera) => {
	const viewerTransform = new THREE.Group();
	viewerTransform.add(camera);
	scene.add(viewerTransform);

	return viewerTransform;
};
