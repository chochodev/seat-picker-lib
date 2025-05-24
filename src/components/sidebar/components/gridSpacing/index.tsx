import React, { useState, useCallback, useEffect } from 'react';
import { LuGrid2X2 } from 'react-icons/lu';
import { fabric } from 'fabric';
import { CustomFabricObject } from '@/types/fabric-types';

interface GridSpacingProps {
  canvas: fabric.Canvas | null;
  selectedObjects: CustomFabricObject[];
}

const GridSpacing: React.FC<GridSpacingProps> = ({
  canvas,
  selectedObjects,
}) => {
  const [gridSpacing, setGridSpacing] = useState({ row: 65, column: 65 });
  const [gridLayout, setGridLayout] = useState({ rows: 2, columns: 2 });

  // Calculate optimal initial grid layout based on number of selected objects
  useEffect(() => {
    if (selectedObjects.length <= 1) return;

    const total = selectedObjects.length;
    const sqrt = Math.sqrt(total);
    const rows = Math.ceil(sqrt);
    const columns = Math.ceil(total / rows);

    setGridLayout({ rows, columns });
  }, [selectedObjects.length]);

  const updateGridLayout = useCallback(() => {
    if (!canvas || selectedObjects.length <= 1) return;

    const objects = canvas.getActiveObjects();
    if (objects.length > 1) {
      const firstObj = objects[0];
      const { rows, columns } = gridLayout;
      const { row: rowSpacing, column: columnSpacing } = gridSpacing;

      objects.forEach((obj, index) => {
        if (index === 0) return;
        const row = Math.floor(index / columns);
        const col = index % columns;

        obj.set({
          left: firstObj.left! + col * columnSpacing,
          top: firstObj.top! + row * rowSpacing,
        });
      });

      canvas.renderAll();
    }
  }, [canvas, selectedObjects, gridLayout, gridSpacing]);

  const handleGridSpacingChange = useCallback(
    (type: 'row' | 'column', value: number) => {
      if (!canvas || selectedObjects.length <= 1) return;

      // Ensure spacing is never negative and has a reasonable minimum
      const minSpacing = 5;
      const maxSpacing = 200;
      const clampedValue = Math.max(minSpacing, Math.min(maxSpacing, value));

      setGridSpacing((prev) => ({ ...prev, [type]: clampedValue }));
      updateGridLayout();
    },
    [canvas, selectedObjects, updateGridLayout]
  );

  const handleGridLayoutChange = useCallback(
    (type: 'rows' | 'columns', value: number) => {
      if (!canvas || selectedObjects.length <= 1) return;

      const total = selectedObjects.length;
      let newValue = Math.max(1, Math.min(total, value));

      // Ensure the other dimension is adjusted to accommodate all objects
      if (type === 'rows') {
        const columns = Math.ceil(total / newValue);
        setGridLayout((prev) => ({ rows: newValue, columns }));
      } else {
        const rows = Math.ceil(total / newValue);
        setGridLayout((prev) => ({ rows, columns: newValue }));
      }

      updateGridLayout();
    },
    [canvas, selectedObjects, updateGridLayout]
  );

  if (selectedObjects.length <= 1) return null;

  return (
    <>
      <div className="mb-2 text-xs font-semibold text-gray-500">
        Editing {selectedObjects.length} seats
      </div>
      <div className="rounded-md bg-white p-4 shadow">
        <div className="mb-4 flex items-center gap-2">
          <LuGrid2X2 className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Grid Layout</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Rows</label>
              <div className="mt-1 flex items-center gap-1">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridLayoutChange('rows', gridLayout.rows - 1)
                  }
                  disabled={gridLayout.rows <= 1}
                  title="Decrease rows"
                >
                  -
                </button>
                <input
                  type="number"
                  value={gridLayout.rows}
                  onChange={(e) =>
                    handleGridLayoutChange('rows', Number(e.target.value))
                  }
                  className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min="1"
                  max={selectedObjects.length}
                  step="1"
                  title={`Enter number of rows (1-${selectedObjects.length})`}
                />
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridLayoutChange('rows', gridLayout.rows + 1)
                  }
                  disabled={gridLayout.rows >= selectedObjects.length}
                  title="Increase rows"
                >
                  +
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {gridLayout.rows * gridLayout.columns >= selectedObjects.length
                  ? `${gridLayout.rows} rows × ${gridLayout.columns} columns`
                  : 'Not enough space for all seats'}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Columns
              </label>
              <div className="mt-1 flex items-center gap-1">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridLayoutChange('columns', gridLayout.columns - 1)
                  }
                  disabled={gridLayout.columns <= 1}
                  title="Decrease columns"
                >
                  -
                </button>
                <input
                  type="number"
                  value={gridLayout.columns}
                  onChange={(e) =>
                    handleGridLayoutChange('columns', Number(e.target.value))
                  }
                  className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min="1"
                  max={selectedObjects.length}
                  step="1"
                  title={`Enter number of columns (1-${selectedObjects.length})`}
                />
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridLayoutChange('columns', gridLayout.columns + 1)
                  }
                  disabled={gridLayout.columns >= selectedObjects.length}
                  title="Increase columns"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Row Spacing
              </label>
              <div className="mt-1 flex items-center gap-1">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridSpacingChange('row', gridSpacing.row - 5)
                  }
                  disabled={gridSpacing.row <= 5}
                  title="Decrease row spacing"
                >
                  -
                </button>
                <input
                  type="number"
                  value={gridSpacing.row}
                  onChange={(e) =>
                    handleGridSpacingChange('row', Number(e.target.value))
                  }
                  className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min="5"
                  max="200"
                  step="5"
                  title="Enter row spacing (5-200)"
                />
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridSpacingChange('row', gridSpacing.row + 5)
                  }
                  disabled={gridSpacing.row >= 200}
                  title="Increase row spacing"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Column Spacing
              </label>
              <div className="mt-1 flex items-center gap-1">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridSpacingChange('column', gridSpacing.column - 5)
                  }
                  disabled={gridSpacing.column <= 5}
                  title="Decrease column spacing"
                >
                  -
                </button>
                <input
                  type="number"
                  value={gridSpacing.column}
                  onChange={(e) =>
                    handleGridSpacingChange('column', Number(e.target.value))
                  }
                  className="w-12 rounded border border-solid border-gray-200 bg-white px-1 py-0.5 text-center text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min="5"
                  max="200"
                  step="5"
                  title="Enter column spacing (5-200)"
                />
                <button
                  className="flex h-6 w-6 items-center justify-center rounded border border-solid border-gray-200 text-xs transition-colors hover:bg-gray-100 disabled:opacity-50"
                  onClick={() =>
                    handleGridSpacingChange('column', gridSpacing.column + 5)
                  }
                  disabled={gridSpacing.column >= 200}
                  title="Increase column spacing"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GridSpacing;
