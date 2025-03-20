import { useState, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import HtmlEditor from "./HtmlEditor";

interface SolutionEditorsPanelProps {
  decryptCode: string;
  setDecryptCode: (code: string) => void;
  unveilCode: string;
  setUnveilCode: (code: string) => void;
}

const SolutionEditorsPanel = ({
  decryptCode,
  setDecryptCode,
  unveilCode,
  setUnveilCode,
}: SolutionEditorsPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [helpDialogVisible, setHelpDialogVisible] = useState(false);
  const [helpContent, setHelpContent] = useState({ title: "", content: "" });
  const toast = useRef<Toast>(null);

  const handleValidateDecrypt = () => {
    if (
      decryptCode.includes("class Decrypt") &&
      decryptCode.includes("def __init__(self, lines") &&
      decryptCode.includes("def run(self)")
    ) {
      toast.current?.show({
        severity: "success",
        summary: "Validation Success",
        detail: "decrypt.py structure is valid.",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail:
          "decrypt.py must include class Decrypt with __init__ and run methods.",
        life: 5000,
      });
    }
  };

  const handleValidateUnveil = () => {
    if (
      unveilCode.includes("class Unveil") &&
      unveilCode.includes("def __init__(self, lines") &&
      unveilCode.includes("def run(self)")
    ) {
      toast.current?.show({
        severity: "success",
        summary: "Validation Success",
        detail: "unveil.py structure is valid.",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail:
          "unveil.py must include class Unveil with __init__ and run methods.",
        life: 5000,
      });
    }
  };

  const showDecryptHelp = () => {
    setHelpContent({
      title: "decrypt.py Help",
      content: `
# decrypt.py File Requirements

This file implements the solution for Part 1 of your puzzle.

## Required Structure

\`\`\`python
class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # Your solution code here
        # Return a string or number as the answer
        pass
\`\`\`

The 'lines' parameter contains the puzzle input as a list of strings, one string per line.

## Execution

When executed as a script, decrypt.py should:
1. Read input.txt
2. Process the data using the Decrypt class
3. Print the answer to standard output
`,
    });
    setHelpDialogVisible(true);
  };

  const showUnveilHelp = () => {
    setHelpContent({
      title: "unveil.py Help",
      content: `
# unveil.py File Requirements

This file implements the solution for Part 2 of your puzzle.

## Required Structure

\`\`\`python
class Unveil:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # Your solution code here
        # Return a string or number as the answer
        pass
\`\`\`

The 'lines' parameter contains the puzzle input as a list of strings, one string per line.

## Execution

When executed as a script, unveil.py should:
1. Read input.txt
2. Process the data using the Unveil class 
3. Print the answer to standard output
`,
    });
    setHelpDialogVisible(true);
  };

  return (
    <div>
      <Toast ref={toast} />

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        <TabPanel header="decrypt.py">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">decrypt.py Editor</h3>
            <div>
              <Button
                label="Help"
                icon="pi pi-question-circle"
                className="p-button-outlined p-button-info mr-2"
                onClick={showDecryptHelp}
              />
              <Button
                label="Validate"
                icon="pi pi-check"
                className="p-button-success"
                onClick={handleValidateDecrypt}
              />
            </div>
          </div>

          <div className="border rounded-md p-2">
            <HtmlEditor
              value={decryptCode}
              onChange={(code) => setDecryptCode(code)}
            />
          </div>

          <div className="mt-4 p-3 border-1 surface-border surface-card border-round">
            <h4 className="text-md font-semibold mb-2">Implementation Notes</h4>
            <ul className="list-disc pl-4">
              <li>
                Implement the <code>run()</code> method to solve Part 1 of your
                puzzle
              </li>
              <li>
                The <code>lines</code> parameter contains all input lines from
                input.txt
              </li>
              <li>
                Your solution should return the final answer as a string or
                number
              </li>
            </ul>
          </div>
        </TabPanel>

        <TabPanel header="unveil.py">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">unveil.py Editor</h3>
            <div>
              <Button
                label="Help"
                icon="pi pi-question-circle"
                className="p-button-outlined p-button-info mr-2"
                onClick={showUnveilHelp}
              />
              <Button
                label="Validate"
                icon="pi pi-check"
                className="p-button-success"
                onClick={handleValidateUnveil}
              />
            </div>
          </div>

          <div className="border rounded-md p-2">
            <HtmlEditor
              value={unveilCode}
              onChange={(code) => setUnveilCode(code)}
            />
          </div>

          <div className="mt-4 p-3 border-1 surface-border surface-card border-round">
            <h4 className="text-md font-semibold mb-2">Implementation Notes</h4>
            <ul className="list-disc pl-4">
              <li>
                Implement the <code>run()</code> method to solve Part 2 of your
                puzzle
              </li>
              <li>
                The <code>lines</code> parameter contains all input lines from
                input.txt
              </li>
              <li>
                Your solution should return the final answer as a string or
                number
              </li>
              <li>You can reuse code from decrypt.py if needed</li>
            </ul>
          </div>
        </TabPanel>
      </TabView>

      {/* Help Dialog */}
      <Dialog
        header={helpContent.title}
        visible={helpDialogVisible}
        style={{ width: "50vw" }}
        onHide={() => setHelpDialogVisible(false)}
      >
        <div className="p-3">
          <div className="markdown-content" style={{ whiteSpace: "pre-wrap" }}>
            {helpContent.content}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SolutionEditorsPanel;
