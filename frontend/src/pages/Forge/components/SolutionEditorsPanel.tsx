import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import PythonDecryptEditorPanel from "./PythonDecryptEditorPanel";
import PythonUnveilEditorPanel from "./PythonUnveilEditorPanel";

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
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Solution Editors</h3>

      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="decrypt.py (Part 1)">
          <PythonDecryptEditorPanel
            pythonCode={decryptCode}
            setPythonCode={setDecryptCode}
          />
        </TabPanel>

        <TabPanel header="unveil.py (Part 2)">
          <PythonUnveilEditorPanel
            pythonCode={unveilCode}
            setPythonCode={setUnveilCode}
          />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default SolutionEditorsPanel;
