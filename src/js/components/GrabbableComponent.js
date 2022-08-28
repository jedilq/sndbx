import { Component, Types } from 'ecsy';

export const GRAB_STATE = {
	IDLE: 0,
	IN_FLIGHT: 1,
	IN_HAND: 2,
};

export class GrabbableComponent extends Component {}

GrabbableComponent.schema = {
	state: { type: Types.Number, default: GRAB_STATE.IDLE },
	handKey: { type: Types.String, default: '' },
	grabSpaceTransformOverride: { type: Types.Ref, default: undefined },
	stateJustChanged: { type: Types.Boolean, default: false },
};
