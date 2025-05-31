import React from "react";
import SeatPicker from "@/components";
import type { CanvasObject, SeatData } from "@/types/data.types";
// import "seat-picker/dist/index.css";

const CustomerSeatCanvas: React.FC = () => {
  const [layout, setLayout] = React.useState<CanvasObject | null>(null);
  const [error, setError] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);

  // Handle file upload
  const handleFile = async (file: File) => {
    setError("");
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      console.log("Loaded layout:", json);
      if (!json.objects || !Array.isArray(json.objects)) {
        throw new Error("Invalid seat layout format");
      }
      setLayout(json);
    } catch (err) {
      console.error("Error loading file:", err);
      setError("Invalid or corrupt seat file.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSeatAction = (action: string, seat: SeatData) => {
    console.log("Action:", action, "on seat:", seat);
    // Implement your buy functionality here
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-4 text-2xl font-bold">Customer Seat Viewer</h1>
      <div className="mb-6">
        <div
          className={`relative rounded-lg border-2 border-dashed ${
            isDragging ? "border-gray-400 bg-gray-50" : "border-gray-300"
          } p-6 transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {fileName ? (
                <span className="font-medium text-gray-900">{fileName}</span>
              ) : (
                <>
                  Drag and drop your seat file here, or{" "}
                  <span className="text-gray-900 underline">browse</span>
                </>
              )}
            </p>
            {!fileName && (
              <p className="mt-1 text-xs text-gray-500">
                Only JSON files are supported
              </p>
            )}
          </div>
        </div>
        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>

      {layout ? (
        <SeatPicker
          layout={layout}
          readOnly
          style={{
            width: 800,
            height: 600,
            backgroundColor: "#f8fafc",
            showSeatNumbers: true,
            seatNumberStyle: {
              fontSize: 14,
              fill: "#222",
              fontWeight: "bold",
            },
            seatStyle: {
              fill: "transparent",
              stroke: "black",
              strokeWidth: 1,
              radius: 10,
            },
          }}
          labels={{
            buyButton: "Buy Seat",
            cancelButton: "Cancel",
            seatNumber: "Seat Number",
            category: "Category",
            price: "Price",
            status: "Status",
          }}
          onSeatAction={handleSeatAction}
          onChange={(json) => console.log("Layout changed:", json)}
        />
      ) : (
        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="flex h-[600px] items-center justify-center text-gray-500">
            Please upload a seat layout file
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSeatCanvas;
