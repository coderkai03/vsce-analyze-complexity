# Analyze Complexity

A VS Code extension that provides automatic time and space complexity analysis for your functions. Get instant Big O notation insights directly in your editor with CodeLens integration.

## Features

### 🔍 **Automatic Function Detection**
- Detects functions in JavaScript, TypeScript, and Python files
- Supports various function declarations:
  - Regular functions: `function name()`, `def name()`
  - Arrow functions: `const name = () =>`
  - Async functions: `async function name()`, `async def name()`
  - Class methods and object methods
  - Export functions

### ⏱️ **Time Complexity Analysis**
- **O(1)** - Constant time operations
- **O(log n)** - Binary search patterns
- **O(n)** - Single loops, linear iterations
- **O(n²)** - Nested loops, bubble/selection sort
- **O(n log n)** - Merge sort, quick sort patterns
- **O(2^n)** - Recursive algorithms

### 💾 **Space Complexity Analysis**
- **O(1)** - Constant space usage
- **O(n)** - Arrays, maps, sets, and other data structures
- Detects common data structures: Arrays, Hash Maps, Sets, Stacks, Queues, Trees

### 🎯 **CodeLens Integration**
- Click "🔍 Analyze Complexity" button above any function
- View results inline: `⏱️ O(n) | 💾 O(1) | 🕒 2:30:45 PM`
- Non-intrusive display that doesn't clutter your code

### 🧠 **Smart Algorithm Detection**
- Identifies nested loops and calculates complexity accordingly
- Recognizes recursion patterns
- Detects sorting algorithms (bubble, selection, insertion, merge, quick)
- Analyzes data structure usage patterns

## Usage

1. Open any JavaScript, TypeScript, or Python file
2. Look for the "🔍 Analyze Complexity" CodeLens above your functions
3. Click the button to analyze the function's complexity
4. View the results displayed inline with timestamp

## Supported Languages

- **JavaScript** (`.js`, `.mjs`, `.cjs`)
- **TypeScript** (`.ts`)
- **React** (`.jsx`, `.tsx`)
- **Python** (`.py`, `.pyw`)

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Analyze Complexity"
4. Click Install

## How It Works

The extension uses sophisticated pattern matching and static analysis to:

1. **Parse function structures** - Identifies function boundaries and extracts code
2. **Analyze control flow** - Detects loops, recursion, and branching patterns
3. **Evaluate data structures** - Identifies space-consuming operations
4. **Calculate complexity** - Applies Big O analysis rules to determine time/space complexity

### Analysis Patterns

- **Nested Loops**: Automatically detects loop nesting depth (O(n), O(n²), O(n³), etc.)
- **Recursion**: Identifies recursive calls and applies exponential complexity
- **Data Structures**: Recognizes array/object creation and usage
- **Sorting**: Detects built-in sort methods and common sorting algorithms
- **Search**: Identifies binary search and linear search patterns

## Examples

```javascript
// O(n²) time, O(1) space
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {        // Outer loop: O(n)
        for (let j = 0; j < arr.length - 1; j++) { // Inner loop: O(n)
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// O(2^n) time, O(n) space (recursion stack)
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);  // Recursive calls
}

// O(n) time, O(n) space
function createHashMap(arr) {
    const map = new Map();  // O(n) space
    for (let item of arr) { // O(n) time
        map.set(item, true);
    }
    return map;
}
```

## Limitations

- Analysis is based on static code patterns and may not account for all runtime complexities
- Does not analyze external library function calls
- Best effort estimation for complex algorithmic patterns
- Cannot analyze dynamic code generation or eval statements

## Requirements

- VS Code 1.95.0 or higher
- No additional dependencies required

## Extension Settings

This extension doesn't add any VS Code settings currently. All functionality is available through CodeLens integration.

## Known Issues

- Very complex nested structures might not be analyzed perfectly
- Some edge cases in function detection for unconventional syntax
- Analysis results are estimates based on static analysis

## Release Notes

### 0.0.1

- Initial release of Analyze Complexity
- Support for JavaScript, TypeScript, and Python
- CodeLens integration for function complexity analysis
- Time and space complexity detection
- Algorithm pattern recognition

## Contributing

Found a bug or have a feature request? Please file an issue on our [GitHub repository](https://github.com/your-username/vsce-analyze-complexity).

## License

This extension is released under the MIT License.

---

**Enjoy analyzing your code complexity!** 🚀

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
