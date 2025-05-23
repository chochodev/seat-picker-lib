import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

// ::::::::::::::: Create rectangle object
const createRect = (left: number, top: number) => {
  const rect = new fabric.Rect({
    left,
    top,
    fill: '#cccccc',
    stroke: 'black',
    strokeWidth: 1,
    width: 100,
    height: 100,
    selectable: true,
    borderColor: 'green',
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: 'lightblue',
    cornerSize: 5,
    cornerStrokeColor: 'blue',
    transparentCorners: false,
    id: uuidv4(),
    strokeUniform: true,
    rx: 0,
    ry: 0,
  });

  rect.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false,
  });
  
  return rect;    
};

// ::::::::::::::: Create seat object
const createSeat = (
  left: number,
  top: number,
  canvas?: fabric.Canvas | null
) => {
  const seatNumber = getNextSeatNumber(canvas);
  const seat = new fabric.Circle({
    left,
    top,
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 1,
    radius: 10,
    selectable: true,
    borderColor: 'green',
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: 'lightblue',
    cornerSize: 5,
    cornerStrokeColor: 'blue',
    transparentCorners: false,
    rx: 0.25,
    ry: 0.25,
    id: uuidv4(),
    strokeUniform: true,
    seatNumber: String(seatNumber),
  });

  seat.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false,
  });
  
  return seat;    
};

// ::::::::::::::: Create text object
const createText = (left: number, top: number, text: string = 'Type here') => {
  const textObject = new fabric.IText(text, {
    left,
    top,
    fontSize: 20,
    fill: 'black',
    selectable: true,
    borderColor: 'green',
    borderDashArray: [2, 4],
    padding: 2,
    cornerColor: 'lightblue',
    cornerSize: 5,
    cornerStrokeColor: 'blue',
    transparentCorners: false,
    fontFamily: 'sans-serif',
    id: uuidv4(),
    strokeUniform: true,
  });

  textObject.setControlsVisibility({
    mt: false,
    mb: false,
    ml: false,
    mr: false,
  });
  
  return textObject;
};

// Helper to get the next available seat number from the canvas
function getNextSeatNumber(canvas?: fabric.Canvas | null) {
  if (!canvas) return 1;
  const allSeats = canvas.getObjects('circle');
  const numbers = allSeats
    .map((obj) => parseInt((obj as any).seatNumber || '', 10))
    .filter((n) => !isNaN(n));
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

export {
  createRect,
  createSeat,
  createText,
};
