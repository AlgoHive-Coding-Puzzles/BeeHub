import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { RadioButton } from "primereact/radiobutton";
import HtmlPreview from "./HtmlPreview";
import { ensureArticleTag } from "../utils/htmlConverter";
import HtmlRichTextEditor from "./HtmlRichTextEditor";

interface HtmlEditorPanelProps {
  html: string;
  setHtml: (html: string) => void;
  richTextContent: string;
  setRichTextContent: (content: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  isValidHtml: boolean;
  toast: React.RefObject<Toast>;
}

const HtmlEditorPanel = ({
  html,
  setHtml,
  richTextContent,
  setRichTextContent,
  fileName,
  setFileName,
  isValidHtml,
  toast,
}: HtmlEditorPanelProps) => {
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFromHtmlEditor = (newHtml: string) => {
    setHtml(newHtml);
    setRichTextContent(newHtml);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setHtml(content);
      setRichTextContent(content);
      setFileName(file.name);
      setImportDialogVisible(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "File imported successfully",
        life: 3000,
      });
    };
    reader.readAsText(file);
  };

  const handleSaveFile = () => {
    // Ensure we have valid HTML with article tags before saving
    const contentToSave = ensureArticleTag(html);

    const blob = new Blob([contentToSave], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setSaveDialogVisible(false);
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "File saved successfully",
      life: 3000,
    });
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <div>
          <Button
            label="Import File"
            icon="pi pi-upload"
            className="mr-2"
            onClick={() => setImportDialogVisible(true)}
            style={{
              backgroundColor: "#ff6900",
              color: "white",
            }}
          />
          <Button
            label="Save File"
            icon="pi pi-save"
            onClick={() => setSaveDialogVisible(true)}
            disabled={!isValidHtml}
            tooltip={!isValidHtml ? "HTML must contain an article tag" : ""}
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#007ad9",
              color: "white",
            }}
          />
        </div>
        <div>
          <span className="font-semibold mr-2">Current file:</span>
          {fileName}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-md p-2 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Editor</h3>
          <div className="h-[500px] overflow-auto">
            <HtmlRichTextEditor
              value={richTextContent}
              onChange={updateFromHtmlEditor}
            />
          </div>
        </div>
        <div className="border rounded-md p-2 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <div className="h-[500px] overflow-auto">
            <HtmlPreview html={html} />
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog
        header="Import HTML File"
        visible={importDialogVisible}
        style={{ width: "450px" }}
        onHide={() => setImportDialogVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setImportDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Import"
              icon="pi pi-check"
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
        }
      >
        <p>Select an HTML file to import:</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".html,.alghive"
          style={{ display: "none" }}
        />
        <Button
          label="Choose File"
          icon="pi pi-upload"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3"
        />
      </Dialog>

      {/* Save Dialog */}
      <Dialog
        header="Save HTML File"
        visible={saveDialogVisible}
        style={{ width: "450px" }}
        onHide={() => setSaveDialogVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setSaveDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSaveFile}
              disabled={fileName === "unknown.html"}
            />
          </div>
        }
      >
        <div className="p-field">
          <label className="block mb-2 font-bold">
            Select file type to save:
          </label>
          <div className="flex flex-column gap-3">
            <div className="flex align-items-center">
              <RadioButton
                inputId="cipher"
                name="fileType"
                value="cipher.html"
                onChange={(e) => setFileName(e.value)}
                checked={fileName === "cipher.html"}
              />
              <label htmlFor="cipher" className="ml-2">
                cipher.html (First part)
              </label>
            </div>
            <div className="flex align-items-center">
              <RadioButton
                inputId="unveil"
                name="fileType"
                value="unveil.html"
                onChange={(e) => setFileName(e.value)}
                checked={fileName === "unveil.html"}
              />
              <label htmlFor="unveil" className="ml-2">
                unveil.html (Second part)
              </label>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default HtmlEditorPanel;
