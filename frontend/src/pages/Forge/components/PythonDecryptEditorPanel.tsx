import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import HtmlEditor from "./HtmlEditor";

interface PythonDecryptEditorPanelProps {
  pythonCode: string;
  setPythonCode: (code: string) => void;
}

const PythonDecryptEditorPanel = ({
  pythonCode,
  setPythonCode,
}: PythonDecryptEditorPanelProps) => {
  const [internalCode, setInternalCode] = useState(pythonCode);
  const [helpDialogVisible, setHelpDialogVisible] = useState(false);
  const [templateDialogVisible, setTemplateDialogVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setInternalCode(pythonCode);
  }, [pythonCode]);

  const handleCodeChange = (value: string) => {
    setInternalCode(value);
    setPythonCode(value);
  };

  const validateDecryptClass = (
    code: string
  ): { valid: boolean; issues: string[] } => {
    const issues = [];

    // Check for class definition
    if (!code.includes("class Decrypt")) {
      issues.push("Missing 'class Decrypt' definition");
    }

    // Check for required methods
    if (!code.includes("def __init__(self, lines")) {
      issues.push("Missing or incorrect constructor method");
    }

    if (!code.includes("def run(self)")) {
      issues.push("Missing 'run' method");
    }

    // Check if implementation exists (not just placeholder)
    if (code.includes("# TODO") && code.includes("pass")) {
      issues.push(
        "Implementation needed: 'run' method contains placeholder code"
      );
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  };

  const handleValidateClick = () => {
    const validation = validateDecryptClass(internalCode);

    if (validation.valid) {
      toast.current?.show({
        severity: "success",
        summary: "Validation Success",
        detail: "decrypt.py looks good! All required elements are present.",
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Validation Issues",
        detail: validation.issues.join(". "),
        life: 5000,
      });
    }
  };

  const templates = [
    {
      label: "Basic Template",
      value: "basic",
      code: `# decrypt.py - Solves the first part of the puzzle
import sys

class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        # TODO: Implement your puzzle solution here
        # Process all lines to find the answer
        result = 0
        for i, line in enumerate(self.lines):
            # Example processing
            try:
                nums = [int(x) for x in line.strip().split()]
                result += sum(nums)
            except:
                # Handle if the line doesn't contain numbers
                pass
        return result

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
`,
    },
    {
      label: "Pattern Matching",
      value: "pattern",
      code: `# decrypt.py - Finds patterns in input data
import sys
import re

class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        count = 0
        for line in self.lines:
            # Example: count occurrences of a pattern
            matches = re.findall(r'(xyz)', line.strip())
            count += len(matches)
        return count

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
`,
    },
    {
      label: "Data Processing",
      value: "data",
      code: `# decrypt.py - Processes and analyzes data
import sys
from collections import Counter

class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        all_chars = ''.join([line.strip() for line in self.lines])
        char_count = Counter(all_chars)
        
        # Find the most common character
        most_common = char_count.most_common(1)[0][0]
        
        # Count occurrences of the most common character
        return char_count[most_common]

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
`,
    },
  ];

  const applyTemplate = () => {
    if (!selectedTemplate) return;

    const template = templates.find((t) => t.value === selectedTemplate);
    if (template) {
      setInternalCode(template.code);
      setPythonCode(template.code);
      setTemplateDialogVisible(false);
      toast.current?.show({
        severity: "info",
        summary: "Template Applied",
        detail: `${template.label} has been applied`,
        life: 3000,
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">decrypt.py Editor</h3>
        <div>
          <Button
            label="Template"
            icon="pi pi-file"
            className="p-button-outlined mr-2"
            onClick={() => setTemplateDialogVisible(true)}
          />
          <Button
            label="Help"
            icon="pi pi-question-circle"
            className="p-button-outlined p-button-info mr-2"
            onClick={() => setHelpDialogVisible(true)}
          />
          <Button
            label="Validate"
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleValidateClick}
          />
        </div>
      </div>

      <div className="border rounded-md p-2">
        <HtmlEditor value={internalCode} onChange={handleCodeChange} />
      </div>

      <div className="mt-4 p-3 border-1 surface-border surface-card border-round">
        <h4 className="text-md font-semibold mb-2">Implementation Notes</h4>
        <ul className="list-disc pl-4">
          <li>
            The <code>run()</code> method should analyze the input and return
            the solution
          </li>
          <li>
            The solution can be a number, string, or any serializable value
          </li>
          <li>
            The <code>lines</code> parameter contains the lines from input.txt
          </li>
        </ul>
      </div>

      {/* Help Dialog */}
      <Dialog
        header="decrypt.py Help"
        visible={helpDialogVisible}
        style={{ width: "50vw" }}
        onHide={() => setHelpDialogVisible(false)}
      >
        <div className="p-3">
          <h4 className="text-lg font-bold mb-2">Required Structure</h4>
          <p className="mb-3">
            Your <code>decrypt.py</code> file must include:
          </p>
          <pre className="p-3 mb-3 rounded text-sm">
            {`class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # Should return the solution for part 1
        pass`}
          </pre>

          <h4 className="text-lg font-bold mb-2">Purpose</h4>
          <p>
            This file solves the first part of the puzzle based on the generated
            input.
          </p>

          <h4 className="text-lg font-bold mb-2">Testing</h4>
          <p>Your code should be runnable via command line with:</p>
          <pre className="p-3 mb-3 rounded text-sm">python decrypt.py</pre>
          <p>
            This should read the <code>input.txt</code> file created by forge.py
            and print the solution.
          </p>
        </div>
      </Dialog>

      {/* Template Dialog */}
      <Dialog
        header="Select Template"
        visible={templateDialogVisible}
        style={{ width: "40vw" }}
        onHide={() => setTemplateDialogVisible(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setTemplateDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Apply Template"
              icon="pi pi-check"
              onClick={applyTemplate}
              disabled={!selectedTemplate}
            />
          </div>
        }
      >
        <div className="p-3">
          <p className="mb-3">Select a template to get started quickly:</p>
          <Dropdown
            value={selectedTemplate}
            options={templates}
            onChange={(e) => setSelectedTemplate(e.value)}
            placeholder="Select a Template"
            className="w-full mb-3"
          />

          {selectedTemplate && (
            <div>
              <h4 className="font-semibold mb-2">Template Preview:</h4>
              <div
                className="p-2 rounded h-40vh overflow-auto text-sm"
                style={{ backgroundColor: "#272822", color: "#f8f8f2" }}
              >
                <pre>
                  {templates.find((t) => t.value === selectedTemplate)?.code}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default PythonDecryptEditorPanel;
