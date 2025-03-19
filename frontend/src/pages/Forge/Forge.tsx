import { useState, useRef, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { createEditorTemplate } from "./utils/htmlConverter";
import HtmlEditorPanel from "./components/HtmlEditorPanel";
import PythonForgeEditorPanel from "./components/PythonForgeEditorPanel";
import SolutionEditorsPanel from "./components/SolutionEditorsPanel";

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

  const handleValidatePuzzle = () => {
    const issues = [];

    // Validate HTML
    if (!isValidHtml) {
      issues.push("HTML must contain an <article> tag");
    }

    // Validate forge.py code
    if (
      !(
        pythonForgeCode.includes("class Forge") &&
        pythonForgeCode.includes("def __init__(") &&
        pythonForgeCode.includes("def run(") &&
        pythonForgeCode.includes("def generate_line(")
      )
    ) {
      issues.push("forge.py must contain class Forge with proper methods");
    }

    // Validate decrypt.py code
    if (
      !(
        pythonDecryptCode.includes("class Decrypt") &&
        pythonDecryptCode.includes("def __init__(self, lines") &&
        pythonDecryptCode.includes("def run(self)")
      )
    ) {
      issues.push("decrypt.py must contain class Decrypt with proper methods");
    }

    // Validate unveil.py code
    if (
      !(
        pythonUnveilCode.includes("class Unveil") &&
        pythonUnveilCode.includes("def __init__(self, lines") &&
        pythonUnveilCode.includes("def run(self)")
      )
    ) {
      issues.push("unveil.py must contain class Unveil with proper methods");
    }

    if (issues.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: issues.join(". "),
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
