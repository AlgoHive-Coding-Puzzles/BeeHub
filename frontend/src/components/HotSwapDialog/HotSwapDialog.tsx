import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { FileUpload } from "primereact/fileupload";
import { Puzzle } from "../../types/Puzzle";

interface HotSwapDialogProps {
  visible: boolean;
  onHide: () => void;
  onUpload: (file: File) => Promise<void>;
  puzzle: Puzzle | null;
}

const HotSwapDialog: React.FC<HotSwapDialogProps> = ({
  visible,
  onHide,
  onUpload,
  puzzle,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const toast = useRef<Toast>(null);

  const handleFileSelect = (e: any) => {
    const file = e.files[0];
    if (!file.name.endsWith(".alghive")) {
      toast.current?.show({
        severity: "error",
        summary: "Invalid File",
        detail: "Please select a valid .alghive file",
      });
      fileUploadRef.current?.clear();
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.current?.show({
        severity: "error",
        summary: "No File Selected",
        detail: "Please select a file to upload",
      });
      return;
    }

    setUploading(true);
    try {
      await onUpload(selectedFile);
      fileUploadRef.current?.clear();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      onHide();
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
        disabled={uploading}
      />
      <Button
        label="Hot Swap"
        icon="pi pi-refresh"
        className="p-button-success"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        loading={uploading}
      />
    </div>
  );

  return (
    <Dialog
      header={`Hot Swap Puzzle: ${puzzle?.name || ""}`}
      visible={visible}
      style={{ width: "550px" }}
      footer={footer}
      onHide={onHide}
      dismissableMask={!uploading}
      closable={!uploading}
    >
      <Toast ref={toast} />

      <div className="p-fluid">
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            This will replace the puzzle with the new version while maintaining
            the same ID. The change will be immediate and users won't notice the
            swap.
          </p>
          <p className="bg-yellow-100 p-3 rounded text-yellow-800 text-sm mb-4">
            <i className="pi pi-exclamation-triangle mr-2"></i>
            Important: The new puzzle file must have the same ID as the original
            puzzle:
            <strong> {puzzle?.id}</strong>
          </p>
        </div>

        {uploading && (
          <div className="mb-4">
            <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
            <div className="text-center text-sm text-gray-600 mt-2">
              Processing hot swap...
            </div>
          </div>
        )}

        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="file"
          url="/api/dummy-url"
          accept=".alghive"
          maxFileSize={10000000}
          auto={false}
          chooseLabel="Select .alghive File"
          className="w-full"
          onSelect={handleFileSelect}
          customUpload={true}
          disabled={uploading}
        />

        {selectedFile && (
          <div className="mt-3 p-3 bg-gray-100 rounded flex justify-between items-center">
            <div>
              <i className="pi pi-file mr-2"></i>
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({Math.round(selectedFile.size / 1024)} KB)
              </span>
            </div>
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-rounded p-button-danger"
              onClick={() => {
                fileUploadRef.current?.clear();
                setSelectedFile(null);
              }}
              disabled={uploading}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default HotSwapDialog;
