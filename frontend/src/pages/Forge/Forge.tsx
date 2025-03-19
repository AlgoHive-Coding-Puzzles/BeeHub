import { useState, useRef, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { createEditorTemplate } from "./utils/htmlConverter";
import HtmlEditorPanel from "./components/HtmlEditorPanel";

const Forge = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [html, setHtml] = useState(createEditorTemplate());
  const [richTextContent, setRichTextContent] = useState(html);
  const [fileName, setFileName] = useState("unknown.html");
  const [isValidHtml, setIsValidHtml] = useState(true);

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

        <TabPanel header="Tab 2">
          <p>Second tab content will be implemented later.</p>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Forge;
