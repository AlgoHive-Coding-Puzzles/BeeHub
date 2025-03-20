import { useState, useRef, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { createEditorTemplate } from "./utils/htmlConverter";
import HtmlEditorPanel from "./components/HtmlEditorPanel";
import PythonForgeEditorPanel from "./components/PythonForgeEditorPanel";
import SolutionEditorsPanel from "./components/SolutionEditorsPanel";
import PropertiesFormPanel from "./components/PropertiesFormPanel";
import HelpDocumentationPanel from "./components/HelpDocumentationPanel";

const Forge = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [html, setHtml] = useState(createEditorTemplate());
  const [richTextContent, setRichTextContent] = useState(html);
  const [fileName, setFileName] = useState("unknown.html");
  const [isValidHtml, setIsValidHtml] = useState(true);

  // Python code states
  const [pythonForgeCode, setPythonForgeCode] =
    useState(`# forge.py initial content
class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id

    def run(self) -> list:
        # TODO
        return []

    def generate_line(self, index: int) -> str:
        # TODO
        pass
`);

  const [pythonDecryptCode, setPythonDecryptCode] =
    useState(`# decrypt.py - Solves the first part of the puzzle
class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # TODO: Implement solution for part 1
        pass

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
`);

  const [pythonUnveilCode, setPythonUnveilCode] =
    useState(`# unveil.py - Solves the second part of the puzzle
class Unveil:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # TODO: Implement solution for part 2
        pass

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
    print(solution)
`);

  // Properties form states
  const [authorName, setAuthorName] = useState("");
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("MEDIUM");

  const toast = useRef<Toast>(null);

  // Validate HTML according to specifications
  const validateHtml = (html: string): boolean => {
    // Check if HTML contains an <article> tag
    const articleRegex = /<article[^>]*>[\s\S]*<\/article>/i;
    return articleRegex.test(html);
  };

  // Validate HTML whenever it changes
  useEffect(() => {
    setIsValidHtml(validateHtml(html));
  }, [html]);

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
      issues.push("Missing or incorrect constructor method in forge.py");
    }

    if (!code.includes("def run(self)")) {
      issues.push("Missing 'run' method in forge.py");
    }

    if (!code.includes("def generate_line(self, index: int)")) {
      issues.push("Missing 'generate_line' method in forge.py");
    }

    // Check for return types
    if (!code.includes("def run(self) -> list")) {
      issues.push(
        "'run' method should specify return type -> list in forge.py"
      );
    }

    if (!code.includes("def generate_line(self, index: int) -> str")) {
      issues.push(
        "'generate_line' method should specify return type -> str in forge.py"
      );
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
      issues.push("Missing or incorrect constructor method in decrypt.py");
    }

    if (!code.includes("def run(self)")) {
      issues.push("Missing 'run' method in decrypt.py");
    }

    // Check if implementation exists (not just placeholder)
    if (code.includes("# TODO") && code.includes("pass")) {
      issues.push(
        "Implementation needed: 'run' method in decrypt.py contains placeholder code"
      );
    }

    return {
      valid: issues.length === 0,
      issues,
    };
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
      issues.push("Missing or incorrect constructor method in unveil.py");
    }

    if (!code.includes("def run(self)")) {
      issues.push("Missing 'run' method in unveil.py");
    }

    // Check if implementation exists (not just placeholder)
    if (code.includes("# TODO") && code.includes("pass")) {
      issues.push(
        "Implementation needed: 'run' method in unveil.py contains placeholder code"
      );
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  };

  const handleValidatePuzzle = () => {
    let allIssues = [];
    let hasWarnings = false;

    // Validate HTML
    if (!isValidHtml) {
      allIssues.push("HTML must contain an <article> tag");
    }

    // Validate forge.py code with detailed validation
    const forgeValidation = validateForgeClass(pythonForgeCode);
    if (!forgeValidation.valid) {
      allIssues = [...allIssues, ...forgeValidation.issues];
    }

    // Validate decrypt.py code with detailed validation
    const decryptValidation = validateDecryptClass(pythonDecryptCode);
    if (!decryptValidation.valid) {
      allIssues = [...allIssues, ...decryptValidation.issues];
    }

    // Validate unveil.py code with detailed validation
    const unveilValidation = validateUnveilClass(pythonUnveilCode);
    if (!unveilValidation.valid) {
      allIssues = [...allIssues, ...unveilValidation.issues];
    }

    // Validate properties
    if (!authorName.trim()) {
      allIssues.push("Author name is required in Properties tab");
    }

    // Check for TODO or pass (warnings but not errors)
    if (
      pythonForgeCode.includes("# TODO") &&
      pythonForgeCode.includes("pass")
    ) {
      hasWarnings = true;
    }
    if (
      pythonDecryptCode.includes("# TODO") &&
      pythonDecryptCode.includes("pass")
    ) {
      hasWarnings = true;
    }
    if (
      pythonUnveilCode.includes("# TODO") &&
      pythonUnveilCode.includes("pass")
    ) {
      hasWarnings = true;
    }

    if (allIssues.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Failed",
        detail: allIssues.join(". "),
        life: 5000,
      });
    } else if (hasWarnings) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Passed with Warnings",
        detail:
          "Puzzle structure is valid but contains TODO comments or placeholder code. Remember to implement all required functionality.",
        life: 5000,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Validation Passed",
        detail: "Puzzle is valid according to HELP.md requirements.",
        life: 3000,
      });
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <h2 className="text-2xl font-bold mb-4">Forge</h2>

      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="HTML Editor">
          <HtmlEditorPanel
            html={html}
            setHtml={setHtml}
            richTextContent={richTextContent}
            setRichTextContent={setRichTextContent}
            fileName={fileName}
            setFileName={setFileName}
            isValidHtml={isValidHtml}
            toast={toast as React.RefObject<Toast>}
          />
        </TabPanel>

        <TabPanel header="forge.py Editor">
          <PythonForgeEditorPanel
            pythonCode={pythonForgeCode}
            setPythonCode={setPythonForgeCode}
          />
        </TabPanel>

        <TabPanel header="Solution Editors">
          <SolutionEditorsPanel
            decryptCode={pythonDecryptCode}
            setDecryptCode={setPythonDecryptCode}
            unveilCode={pythonUnveilCode}
            setUnveilCode={setPythonUnveilCode}
          />
        </TabPanel>

        <TabPanel header="Properties">
          <PropertiesFormPanel
            authorName={authorName}
            setAuthorName={setAuthorName}
            language={language}
            setLanguage={setLanguage}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </TabPanel>

        <TabPanel header="Help Documentation">
          <HelpDocumentationPanel />
        </TabPanel>
      </TabView>

      <div className="mt-4">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={handleValidatePuzzle}
        >
          Validate Puzzle
        </button>
      </div>
    </div>
  );
};

export default Forge;
