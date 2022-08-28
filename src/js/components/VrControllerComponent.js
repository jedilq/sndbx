import { Component, TagComponent, Types } from 'ecsy';

export class VrControllerComponent extends Component {}

VrControllerComponent.schema = {
	model: { type: Types.Ref, default: undefined },
	controllerInterface: { type: Types.Ref, default: undefined },
};

export class RightController extends TagComponent {}

export class LeftController extends TagComponent {}

export class Occupied extends TagComponent {}
