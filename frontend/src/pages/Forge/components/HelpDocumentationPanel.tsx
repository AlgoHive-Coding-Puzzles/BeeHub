import { Accordion, AccordionTab } from "primereact/accordion";
import { Card } from "primereact/card";

const HelpDocumentationPanel = () => {
  return (
    <div className="help-documentation p-4">
      <Card title="Creating a New Puzzle" className="mb-4">
        <p>
          This guide will help you create a complete puzzle that follows
          AlgoHive's requirements. Your puzzle should contain several files with
          specific structures as detailed below.
        </p>
      </Card>

      <Accordion multiple activeIndex={[0]} className="mb-4">
        <AccordionTab header="File Structure Overview">
          <div className="p-3">
            <h4 className="text-xl mb-3">Contents of a Puzzle</h4>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="">
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">
                      <code>forge.py</code>
                    </td>
                    <td className="border p-2">
                      Generates unique input for a given seed for the puzzle
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>decrypt.py</code>
                    </td>
                    <td className="border p-2">
                      Solves the first part of the puzzle
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>unveil.py</code>
                    </td>
                    <td className="border p-2">
                      Solves the second part of the puzzle
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>cipher.html</code>
                    </td>
                    <td className="border p-2">
                      The puzzle's first part text and examples
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>unveil.html</code>
                    </td>
                    <td className="border p-2">
                      The puzzle's second part text and examples
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>props/</code>
                    </td>
                    <td className="border p-2">
                      Directory for puzzle properties
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>props/meta.xml</code>
                    </td>
                    <td className="border p-2">
                      Contains meta properties (author, dates)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">
                      <code>props/desc.xml</code>
                    </td>
                    <td className="border p-2">
                      Contains puzzle description (difficulty, language)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="forge.py - Input Generator">
          <div className="p-3">
            <p className="mb-3">
              This file generates unique puzzle inputs based on a seed value.
              When users play your puzzle, this code creates their specific
              puzzle instance.
            </p>

            <h4 className="font-bold mb-2">Required Structure</h4>
            <p className="mb-2">
              The file must contain a class called <code>Forge</code> with the
              following methods:
            </p>

            <div className="code-block  p-3 mb-4 rounded overflow-auto">
              <pre>{`# forge.py - Génère input.txt
import sys
import random

class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id

    def run(self) -> list:
        random.seed(self.unique_id)
        lines = []
        for _ in range(self.lines_count):
            lines.append(self.generate_line(_))
        return lines

    def generate_line(self, index: int) -> str:
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    lines_count = int(sys.argv[1])
    unique_id = sys.argv[2]
    forge = Forge(lines_count, unique_id)
    lines = forge.run()
    with open('input.txt', 'w') as f:
        f.write('\\n'.join(lines))
`}</pre>
            </div>

            <p className="mb-2">
              Using this template allows you to focus on implementing the{" "}
              <code>generate_line</code> method to generate the input for your
              puzzle.
            </p>
          </div>
        </AccordionTab>

        <AccordionTab header="decrypt.py - Part 1 Solution">
          <div className="p-3">
            <p className="mb-3">
              This file implements the solution for the first part of your
              puzzle. It should process the input data and produce the answer
              for Part 1.
            </p>

            <h4 className="font-bold mb-2">Required Structure</h4>
            <div className="code-block  p-3 mb-3 rounded overflow-auto">
              <pre>{`class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
`}</pre>
            </div>

            <p>
              The file should be executable and should read the input from{" "}
              <code>input.txt</code>, process it using the <code>Decrypt</code>{" "}
              class, and print the solution.
            </p>
          </div>
        </AccordionTab>

        <AccordionTab header="unveil.py - Part 2 Solution">
          <div className="p-3">
            <p className="mb-3">
              This file implements the solution for the second part of your
              puzzle. It should process the input data and produce the answer
              for Part 2.
            </p>

            <h4 className="font-bold mb-2">Required Structure</h4>
            <div className="code-block  p-3 mb-3 rounded overflow-auto">
              <pre>{`class Unveil:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
    print(solution)
`}</pre>
            </div>

            <p>
              The file should be executable and should read the input from{" "}
              <code>input.txt</code>, process it using the <code>Unveil</code>{" "}
              class, and print the solution.
            </p>
          </div>
        </AccordionTab>

        <AccordionTab header="HTML Files - Puzzle Description">
          <div className="p-3">
            <h4 className="font-bold mb-2">cipher.html</h4>
            <p className="mb-3">
              This HTML file contains the text and examples for the first part
              of your puzzle. It must contain an <code>&lt;article&gt;</code>{" "}
              tag surrounding the content.
            </p>

            <div className="code-block  p-3 mb-4 rounded overflow-auto">
              <pre>{`<article>
  <h2>First part of the puzzle</h2>

  <p>I'm a paragraph</p>

  <code>
    <pre>
      I'm a code block
    </pre>
  </code>
</article>
`}</pre>
            </div>

            <h4 className="font-bold mb-2">unveil.html</h4>
            <p className="mb-3">
              This HTML file contains the text and examples for the second part
              of your puzzle. It must also contain an{" "}
              <code>&lt;article&gt;</code> tag surrounding the content.
            </p>

            <div className="code-block  p-3 mb-3 rounded overflow-auto">
              <pre>{`<article>
  <h2>Second part of the puzzle</h2>

  <p>I'm a paragraph</p>

  <code>
    <pre>
      I'm a code block
    </pre>
  </code>
</article>
`}</pre>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="Properties Files">
          <div className="p-3">
            <h4 className="font-bold mb-2">props/meta.xml</h4>
            <p className="mb-3">
              This XML file contains metadata about the puzzle, including author
              information and creation/modification dates.
            </p>

            <div className="code-block  p-3 mb-4 rounded overflow-auto">
              <pre>{`<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>$AUTHOR</author>
    <created>$CREATED</created>
    <modified>$MODIFIED</modified>
    <title>Meta</title>
</Properties>
`}</pre>
            </div>

            <h4 className="font-bold mb-2">props/desc.xml</h4>
            <p className="mb-3">
              This XML file contains description information for the puzzle,
              such as difficulty level and language.
            </p>

            <div className="code-block  p-3 mb-3 rounded overflow-auto">
              <pre>{`<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>$DIFFICULTY</difficulty>
    <language>$LANGUAGE</language>
</Properties>
`}</pre>
            </div>
          </div>
        </AccordionTab>
      </Accordion>

      <Card title="Testing and Compilation" className="mb-4">
        <p className="mb-3">
          After creating all required files, you can use the following commands
          to test and compile your puzzle:
        </p>

        <p>Install</p>

        <div className="code-block  p-3 mb-3 rounded overflow-auto">
          <pre>{`git clone https://github.com/AlgoHive-Coding-Puzzles/BeeLine.git`}</pre>
          <pre>{`pip install -r requirements.txt`}</pre>
        </div>

        <p>Run</p>

        <div className="code-block  p-3 mb-3 rounded overflow-auto">
          <pre>{`# To test your puzzle
python3 beeline.py test <folder>

# To compile your puzzle
python3 beeline.py compile <folder>
`}</pre>
        </div>

        <p>
          The compiled puzzle will be saved as a .alghive file that can be
          uploaded to AlgoHive.
        </p>
      </Card>
    </div>
  );
};

export default HelpDocumentationPanel;
