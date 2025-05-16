import { Object as FabricObject, IObjectOptions } from 'fabric/fabric-impl';

export interface CustomFabricObject extends FabricObject {
  radius?: number;
  fontSize?: number;
  text?: string;
}

export type UpdateableProperties = Partial<IObjectOptions> & {
  radius?: number;
  fontSize?: number;
  text?: string;
};
