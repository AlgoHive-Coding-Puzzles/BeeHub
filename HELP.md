#### Contents of the file

The file contains the following directories and files:

| Name             | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `forge.py`       | This executable python file will generate a unique input for a given seed for the puzzle.                    |
| `decrypt.py`     | This executable python file will decrypt the input and output the solution for the first part of the puzzle  |
| `unveil.py`      | This executable python file will decrypt the input and output the solution for the second part of the puzzle |
| `cipher.html`    | This HTML file contains the puzzle's first part text and example input/output.                               |
| `unveil.html`    | This HTML file contains the puzzle's second part text and example input/output.                              |
| `props/`         | This directory contains the properties of the puzzle, such as the author, creation date and difficulty.      |
| `props/meta.xml` | This XML file contains the meta properties of the file                                                       |
| `props/desc.xml` | This markdown file contains the description of the puzzle.                                                   |

##### `forge.py`

This file is an executable python file that will generate a unique input for a given seed for the puzzle. The file should contain a class called `Forge` that has a method constructor `__init__` that takes a lines_count and a seed as arguments. The class should have a method called `run` that returns a list of strings that will be the input for the puzzle. The implementation should be inside the `generate_line` method that contains an index as an argument and returns a string. The python file should be executable and should generate the input file `input.txt` for debugging purposes.

```python
# forge.py - Génère input.txt
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
        f.write('\n'.join(lines))
```

> Using this template will allow to just focus on the `generate_line` method to generate the input for the puzzle.

##### `decrypt.py`

This file is an executable python file that will decrypt the input and output the solution for the first part of the puzzle. The file should contain a class called `Decrypt` that has a method constructor `__init__` that takes a list of lines as arguments. The class should have a method called `run` that, given the previously setup lines, return a string or a number that is the solution for the first part of the puzzle. The python file should be executable.

```python
class Decrypt:
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
```

##### `unveil.py`

This file is an executable python file that will decrypt the input and output the solution for the second part of the puzzle. The file should contain a class called `Unveil` that has a method constructor `__init__` that takes a list of lines as arguments. The class should have
a method called `run` that, given the previously setup lines, return a string or a number that is the solution for the second part of the puzzle. The python file should be executable.

```python
class Unveil:
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
```

##### `cipher.html`

This file is an HTML file that contains the puzzle's first part text and example input/output. The file must contain a `<article>` surrounding the content. The content can be written using `<p>` tags for paragraphs and `<pre>` or `<code>` tags for code blocks. This file should contain basic examples of the input and output of the puzzle.

```html
<article>
  <h2>First part of the puzzle</h2>

  <p>I'm a paragraph</p>

  <code>
    <pre>
      I'm a code block
    </pre>
  </code>
</article>
```

##### `unveil.html`

This file is an HTML file that contains the puzzle's second part text and example input/output. The file must contain a `<article>` surrounding the content. The content can be written using `<p>` tags for paragraphs and `<pre>` or `<code>` tags for code blocks. This file should contain basic examples of the input and output of the puzzle.

```html
<article>
  <h2>Second part of the puzzle</h2>

  <p>I'm a paragraph</p>

  <code>
    <pre>
      I'm a code block
    </pre>
  </code>
</article>
```

##### `props/meta.xml`

This file is an XML file that contains the meta properties of the file. The file should contain the following properties:

```xml
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>$AUTHOR</author>
    <created>$CREATED</created>
    <modified>$MODIFIED</modified>
    <title>Meta</title>
</Properties>
```

> This file will allow to be able to define the author, the creation date and the modification date of the puzzle.

##### `props/desc.xml`

This file is an XML file that contains the description of the puzzle. The file should contain the following properties:

```xml
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>$DIFFICULTY</difficulty>
    <language>$LANGUAGE</language>
</Properties>
```
