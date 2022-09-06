import { GameComponent, Types } from 'elixr';

export class InteractiveObjectComponent extends GameComponent {}

InteractiveObjectComponent.schema = {
	attachedController: { type: Types.Ref, default: undefined },
};
