import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

interface PropertiesFormPanelProps {
  authorName: string;
  setAuthorName: (name: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: string;
  setDifficulty: (diff: string) => void;
}

const PropertiesFormPanel = ({
  authorName,
  setAuthorName,
  language,
  setLanguage,
  difficulty,
  setDifficulty,
}: PropertiesFormPanelProps) => {
  const [metaXml, setMetaXml] = useState("");
  const [descXml, setDescXml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const toast = useRef<Toast>(null);

  const languages = [
    { label: "English", value: "en" },
    { label: "Français", value: "fr" },
  ];

  const difficulties = [
    { label: "Easy", value: "EASY" },
    { label: "Medium", value: "MEDIUM" },
    { label: "Hard", value: "HARD" },
  ];

  const generateXmlFiles = () => {
    if (!authorName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Author name is required",
        life: 3000,
      });
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Generate meta.xml content
    const metaContent = `<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>${authorName}</author>
    <created>${currentDate}</created>
    <modified>${currentDate}</modified>
    <title>Meta</title>
</Properties>`;

    // Generate desc.xml content
    const descContent = `<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>${difficulty}</difficulty>
    <language>${language}</language>
</Properties>`;

    setMetaXml(metaContent);
    setDescXml(descContent);
    setPreviewOpen(true);

    toast.current?.show({
      severity: "success",
      summary: "XML Generated",
      detail: "Property files generated successfully",
      life: 3000,
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMetaXml = () => {
    downloadFile(metaXml, "meta.xml");
  };

  const downloadDescXml = () => {
    downloadFile(descXml, "desc.xml");
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="">
        <div className="">
          <Card title="Puzzle Properties">
            <div className="p-fluid">
              <div className="field mb-4">
                <label htmlFor="author" className="font-bold block mb-2">
                  Author Name*
                </label>
                <InputText
                  id="author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter your name"
                  className={!authorName.trim() ? "p-invalid" : ""}
                />
                {!authorName.trim() && (
                  <small className="p-error">Author name is required</small>
                )}
              </div>

              <div className="field mb-4">
                <label htmlFor="language" className="font-bold block mb-2">
                  Puzzle Language
                </label>
                <Dropdown
                  id="language"
                  value={language}
                  options={languages}
                  onChange={(e) => setLanguage(e.value)}
                  placeholder="Select a language"
                  className="w-full"
                />
              </div>

              <div className="field mb-4">
                <label htmlFor="difficulty" className="font-bold block mb-2">
                  Puzzle Difficulty
                </label>
                <Dropdown
                  id="difficulty"
                  value={difficulty}
                  options={difficulties}
                  onChange={(e) => setDifficulty(e.value)}
                  placeholder="Select a difficulty"
                  className="w-full"
                />
              </div>

              <Button
                label="Generate XML Files"
                icon="pi pi-file"
                className="mt-4"
                onClick={generateXmlFiles}
              />
            </div>
          </Card>
        </div>

        {previewOpen && (
          <div className="col-12 md:col-6">
            <Card
              title="Generated XML Files"
              subTitle="Click on each file name to download"
              className="h-full"
            >
              <div className="p-fluid">
                <div className="field mb-4">
                  <div className="mb-2 w-sm">
                    <h3 className="text-lg font-semibold">meta.xml</h3>
                    <Button
                      label="Download"
                      icon="pi pi-download"
                      onClick={downloadMetaXml}
                      className="p-button-sm"
                      severity="success"
                    />
                  </div>
                  <div
                    className="border-1 border-round p-3 overflow-auto"
                    style={{ maxHeight: "150px", backgroundColor: "#272822" }}
                  >
                    <pre className="m-0">{metaXml}</pre>
                  </div>
                </div>

                <div className="field">
                  <div className="mb-2  w-sm">
                    <h3 className="text-lg font-semibold">desc.xml</h3>
                    <Button
                      label="Download"
                      icon="pi pi-download"
                      onClick={downloadDescXml}
                      className="p-button-sm"
                      severity="success"
                    />
                  </div>
                  <div
                    className="border-1 border-round p-3 overflow-auto"
                    style={{ maxHeight: "150px", backgroundColor: "#272822" }}
                  >
                    <pre className="m-0">{descXml}</pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesFormPanel;
