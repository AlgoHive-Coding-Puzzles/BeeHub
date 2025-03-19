import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import HtmlEditor from "./HtmlEditor";

interface PythonUnveilEditorPanelProps {
  pythonCode: string;
  setPythonCode: (code: string) => void;
}

const PythonUnveilEditorPanel = ({
  pythonCode,
  setPythonCode,
}: PythonUnveilEditorPanelProps) => {
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

  const validateUnveilClass = (
    code: string
  ): { valid: boolean; issues: string[] } => {
    const issues = [];

    // Check for class definition
    if (!code.includes("class Unveil")) {
      issues.push("Missing 'class Unveil' definition");
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
    const validation = validateUnveilClass(internalCode);

    if (validation.valid) {
      toast.current?.show({
        severity: "success",
        summary: "Validation Success",
        detail: "unveil.py looks good! All required elements are present.",
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
      code: `# unveil.py - Solves the second part of the puzzle
import sys

class Unveil:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        # TODO: Implement your part 2 solution here
        # This solution often builds on part 1's solution but with additional constraints
        result = 0
        for i, line in enumerate(self.lines):
            # Example advanced processing
            try:
                parts = line.strip().split()
                # Consider only even-indexed lines
                if i % 2 == 0:
                    result += len(parts)
            except:
                pass
        return result

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
    print(solution)
`,
    },
    {
      label: "Complex Pattern Matching",
      value: "complex",
      code: `# unveil.py - Handles advanced pattern matching for part 2
import sys
import re

class Unveil:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        valid_lines = []
        for i, line in enumerate(self.lines):
            # Look for specific pattern combinations
            if re.search(r'([a-z])\\1{2,}', line.strip()):  # Repeated characters
                valid_lines.append(line.strip())
        
        # Process the valid lines further
        result = sum(len(line) for line in valid_lines)
        return result

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
    print(solution)
`,
    },
    {
      label: "Matrix Processing",
      value: "matrix",
      code: `# unveil.py - Processes data as a matrix
import sys

class Unveil:
    def __init__(self, lines: list):
        self.lines = lines
        
    def run(self):
        # Convert input to a matrix
        matrix = []
        for line in self.lines:
            row = [int(x) if x.isdigit() else 0 for x in line.strip().split()]
            if row:  # Skip empty rows
                matrix.append(row)
        
        # Find the sum of diagonal elements
        diagonal_sum = 0
        for i in range(min(len(matrix), len(matrix[0]) if matrix else 0)):
            diagonal_sum += matrix[i][i]
            
        return diagonal_sum

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
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
        <h3 className="text-lg font-semibold">unveil.py Editor</h3>
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
            The <code>run()</code> method should solve the second part of the
            puzzle
          </li>
          <li>
            Typically more complex than part 1, often building on part 1's
            concepts
          </li>
          <li>
            Return the solution as a number, string, or any serializable value
          </li>
        </ul>
      </div>

      {/* Help Dialog */}
      <Dialog
        header="unveil.py Help"
        visible={helpDialogVisible}
        style={{ width: "50vw" }}
        onHide={() => setHelpDialogVisible(false)}
      >
        <div className="p-3">
          <h4 className="text-lg font-bold mb-2">Required Structure</h4>
          <p className="mb-3">
            Your <code>unveil.py</code> file must include:
          </p>
          <pre className="p-3 mb-3 rounded text-sm">
            {`class Unveil:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # Should return the solution for part 2
        pass`}
          </pre>

          <h4 className="text-lg font-bold mb-2">Purpose</h4>
          <p>
            This file solves the second part of the puzzle, which is typically a
            more complex variation of part 1.
          </p>

          <h4 className="text-lg font-bold mb-2">Testing</h4>
          <p>Your code should be runnable via command line with:</p>
          <pre className="p-3 mb-3 rounded text-sm">python unveil.py</pre>
          <p>
            This should read the <code>input.txt</code> file created by forge.py
            and print the part 2 solution.
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

export default PythonUnveilEditorPanel;
