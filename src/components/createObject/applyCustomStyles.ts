import { fabric } from 'fabric';

export function applyCustomStyles(obj: fabric.Object) {
  obj.set({
    borderColor: 'green',
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: 'lightblue',
    cornerSize: 5,
    cornerStrokeColor: 'blue',
    transparentCorners: false,
    strokeUniform: true,
  });
  obj.setControlsVisibility &&
    obj.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
    });
}
