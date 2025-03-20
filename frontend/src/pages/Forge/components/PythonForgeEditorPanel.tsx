import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import HtmlEditor from "./HtmlEditor"; // Reusing your simple text editor for Python code

interface PythonForgeEditorPanelProps {
  pythonCode: string;
  setPythonCode: (code: string) => void;
}

const PythonForgeEditorPanel = ({
  pythonCode,
  setPythonCode,
}: PythonForgeEditorPanelProps) => {
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

  const validateForgeClass = (
    code: string
  ): { valid: boolean; issues: string[] } => {
    const issues = [];

    // Check for class definition
    if (!code.includes("class Forge")) {
      issues.push("Missing 'class Forge' definition");
    }

    // Check for required methods
    if (
      !code.includes(
        "def __init__(self, lines_count: int, unique_id: str = None)"
      )
    ) {
      issues.push("Missing or incorrect constructor method");
    }

    if (!code.includes("def run(self)")) {
      issues.push("Missing 'run' method");
    }

    if (!code.includes("def generate_line(self, index: int)")) {
      issues.push("Missing 'generate_line' method");
    }

    // Check for return types
    if (!code.includes("def run(self) -> list")) {
      issues.push("'run' method should specify return type -> list");
    }

    if (!code.includes("def generate_line(self, index: int) -> str")) {
      issues.push("'generate_line' method should specify return type -> str");
    }

    // Check if implementation exists (not just placeholder)
    if (code.includes("# TODO") && code.includes("pass")) {
      issues.push(
        "Implementation needed: 'generate_line' method contains placeholder code"
      );
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  };

  const handleValidateClick = () => {
    const validation = validateForgeClass(internalCode);

    if (validation.valid) {
      toast.current?.show({
        severity: "success",
        summary: "Validation Success",
        detail: "forge.py looks good! All required elements are present.",
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
      code: `# forge.py - Generates input.txt
import sys
import random

class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id

    def run(self) -> list:
        random.seed(self.unique_id)
        lines = []
        for i in range(self.lines_count):
            lines.append(self.generate_line(i))
        return lines

    def generate_line(self, index: int) -> str:
        # TODO: Implement your line generation logic here
        # This method should return a single line of input
        return f"Line {index}: {random.randint(1, 100)}"

if __name__ == '__main__':
    lines_count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    unique_id = sys.argv[2] if len(sys.argv) > 2 else "test_seed"
    forge = Forge(lines_count, unique_id)
    lines = forge.run()
    with open('input.txt', 'w') as f:
        f.write('\\n'.join(lines))
    print(f"Generated {lines_count} lines with seed '{unique_id}'")
`,
    },
    {
      label: "Number Puzzle Template",
      value: "number",
      code: `# forge.py - Generates number sequence puzzles
import sys
import random

class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id
        
    def run(self) -> list:
        random.seed(self.unique_id)
        lines = []
        for i in range(self.lines_count):
            lines.append(self.generate_line(i))
        return lines
        
    def generate_line(self, index: int) -> str:
        # Generate a sequence of numbers
        start = random.randint(1, 10)
        step = random.randint(1, 5)
        length = random.randint(5, 10)
        
        sequence = [start + step * i for i in range(length)]
        return " ".join(map(str, sequence))

if __name__ == '__main__':
    lines_count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    unique_id = sys.argv[2] if len(sys.argv) > 2 else "test_seed"
    forge = Forge(lines_count, unique_id)
    lines = forge.run()
    with open('input.txt', 'w') as f:
        f.write('\\n'.join(lines))
    print(f"Generated {lines_count} lines with seed '{unique_id}'")
`,
    },
    {
      label: "String Puzzle Template",
      value: "string",
      code: `# forge.py - Generates string puzzles
import sys
import random
import string

class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id
        
    def run(self) -> list:
        random.seed(self.unique_id)
        lines = []
        for i in range(self.lines_count):
            lines.append(self.generate_line(i))
        return lines
        
    def generate_line(self, index: int) -> str:
        # Generate a string with an encoded message
        length = random.randint(10, 20)
        chars = [random.choice(string.ascii_lowercase) for _ in range(length)]
        
        # Insert a hidden pattern
        if index % 3 == 0:
            pos = random.randint(0, length - 3)
            chars[pos:pos+3] = "xyz"
            
        return "".join(chars)

if __name__ == '__main__':
    lines_count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    unique_id = sys.argv[2] if len(sys.argv) > 2 else "test_seed"
    forge = Forge(lines_count, unique_id)
    lines = forge.run()
    with open('input.txt', 'w') as f:
        f.write('\\n'.join(lines))
    print(f"Generated {lines_count} lines with seed '{unique_id}'")
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
        <h3 className="text-lg font-semibold">forge.py Editor</h3>
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
        <HtmlEditor
          value={internalCode}
          onChange={handleCodeChange}
          // height="500px"
          // language="python"
        />
      </div>

      <div className="mt-4 p-3 border-1 surface-border surface-card border-round">
        <h4 className="text-md font-semibold mb-2">Implementation Notes</h4>
        <ul className="list-disc pl-4">
          <li>
            The <code>generate_line(index)</code> method should create each line
            of the puzzle input
          </li>
          <li>
            Use the <code>unique_id</code> as a random seed to ensure consistent
            outputs
          </li>
          <li>
            Each call to <code>run()</code> should produce a list of strings
          </li>
          <li>
            For testing, you can set <code>unique_id="test_seed"</code> for
            consistent results
          </li>
          <li>
            The line <code>if __name__ == 'main':</code> is used to run the
            script directly from the command line and must be included
          </li>
        </ul>
      </div>

      {/* Help Dialog */}
      <Dialog
        header="forge.py Help"
        visible={helpDialogVisible}
        style={{ width: "50vw" }}
        onHide={() => setHelpDialogVisible(false)}
      >
        <div className="p-3">
          <h4 className="text-lg font-bold mb-2">Required Structure</h4>
          <p className="mb-3">
            Your <code>forge.py</code> file must include:
          </p>
          <pre className="p-3 mb-3 rounded text-sm">
            {`class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id

    def run(self) -> list:
        # Should return a list of strings
        pass

    def generate_line(self, index: int) -> str:
        # Should return a single line as a string
        pass`}
          </pre>

          <h4 className="text-lg font-bold mb-2">Purpose</h4>
          <p>
            This file generates unique puzzle inputs based on a seed. When users
            play your puzzle, this code will create their specific puzzle
            instance.
          </p>

          <h4 className="text-lg font-bold mb-2">Testing</h4>
          <p>Your code should be runnable via command line with:</p>
          <pre className="bg-gray-100 p-3 mb-3 rounded text-sm">
            python forge.py [lines_count] [unique_id]
          </pre>
          <p>
            This should create an <code>input.txt</code> file for testing with
            your solution scripts.
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
                className="bg-#272822 p-2 rounded h-40vh overflow-auto text-sm"
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

export default PythonForgeEditorPanel;
