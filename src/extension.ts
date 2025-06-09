// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Interface for storing complexity results
interface ComplexityResult {
	timeComplexity: string;
	spaceComplexity: string;
	timestamp: string;
}

// Map to store complexity results for functions
const complexityResults = new Map<string, ComplexityResult>();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "analyze-complexity" is now active!');

	// Create and register the CodeLens provider
	const codeLensProvider = new ComplexityCodeLensProvider();
	const codeLensDisposable = vscode.languages.registerCodeLensProvider(
		{ scheme: 'file', language: '*' },
		codeLensProvider
	);

	// Command to analyze function complexity
	const analyzeComplexityDisposable = vscode.commands.registerCommand(
		'analyze-complexity.analyzeFunctionComplexity',
		(functionName: string, startLine: number, endLine: number, uri: vscode.Uri) => {
			try {
				// Add parameter validation
				if (!functionName || typeof startLine !== 'number' || typeof endLine !== 'number' || !uri) {
					console.error('Invalid parameters passed to analyzeFunctionComplexity', { functionName, startLine, endLine, uri });
					vscode.window.showErrorMessage('Invalid parameters for complexity analysis');
					return;
				}

				const editor = vscode.window.activeTextEditor;
				if (!editor || editor.document.uri.toString() !== uri.toString()) {
					vscode.window.showErrorMessage('Active editor does not match the selected file');
					return;
				}

				// Get the function code
				const functionCode = getFunctionCode(editor.document, startLine, endLine);
				const analysis = analyzeComplexity(functionCode);
				
				// Store the result with timestamp
				const key = `${uri.toString()}:${functionName}:${startLine}`;
				complexityResults.set(key, {
					timeComplexity: analysis.timeComplexity,
					spaceComplexity: analysis.spaceComplexity,
					timestamp: new Date().toLocaleTimeString()
				});

				// Refresh CodeLens
				codeLensProvider.refresh();

				// Show success message
				vscode.window.showInformationMessage(
					`Complexity analysis complete for ${functionName}: ${analysis.timeComplexity} time, ${analysis.spaceComplexity} space`
				);
			} catch (error) {
				console.error('Error in analyzeFunctionComplexity:', error);
				vscode.window.showErrorMessage(`Error analyzing function complexity: ${error}`);
			}
		}
	);

	context.subscriptions.push(codeLensDisposable, analyzeComplexityDisposable);
}

class ComplexityCodeLensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

	public refresh(): void {
		this._onDidChangeCodeLenses.fire();
	}

	// JavaScript/TypeScript function patterns
	private getJavaScriptRegexes(): RegExp[] {
		return [
			/^\s*function\s+(\w+)\s*\(/,                          // function name()
			/^\s*const\s+(\w+)\s*=\s*function/,                  // const name = function
			/^\s*let\s+(\w+)\s*=\s*function/,                    // let name = function
			/^\s*var\s+(\w+)\s*=\s*function/,                    // var name = function
			/^\s*const\s+(\w+)\s*=\s*async\s+function/,          // const name = async function
			/^\s*let\s+(\w+)\s*=\s*async\s+function/,            // let name = async function
			/^\s*var\s+(\w+)\s*=\s*async\s+function/,            // var name = async function
			/^\s*const\s+(\w+)\s*=\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,  // const name = (...): type => (with optional type annotation)
			/^\s*let\s+(\w+)\s*=\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,    // let name = (...): type => (with optional type annotation)
			/^\s*var\s+(\w+)\s*=\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,    // var name = (...): type => (with optional type annotation)
			/^\s*const\s+(\w+)\s*=\s*async\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,  // const name = async (...): type =>
			/^\s*let\s+(\w+)\s*=\s*async\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,    // let name = async (...): type =>
			/^\s*var\s+(\w+)\s*=\s*async\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,    // var name = async (...): type =>
			/^\s*(\w+)\s*:\s*function/,                           // name: function (object method)
			/^\s*(\w+)\s*:\s*async\s*function/,                   // name: async function (object method)
			/^\s*(\w+)\s*:\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,     // name: (...): type => (object method with optional type)
			/^\s*(\w+)\s*:\s*async\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,  // name: async (...): type => (object method)
			/^\s*(?!if|while|for|switch|catch|with)\b(\w+)\s*\(.*?\)\s*{/,  // name(...) { (method) - excluding control flow
			/^\s*async\s+(?!if|while|for|switch|catch|with)\b(\w+)\s*\(.*?\)\s*{/,  // async name(...) { (async method) - excluding control flow
			/^\s*async\s+function\s+(\w+)\s*\(/,                 // async function name()
			/^\s*export\s+function\s+(\w+)\s*\(/,                // export function name()
			/^\s*export\s+async\s+function\s+(\w+)\s*\(/,        // export async function name()
			/^\s*export\s+const\s+(\w+)\s*=\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,  // export const name = (...): type =>
			/^\s*export\s+const\s+(\w+)\s*=\s*async\s*\(.*?\)\s*(?::\s*[^=]+)?\s*=>/,  // export const name = async (...): type =>
			/^\s*class\s+(\w+)/,                                 // class Name
			/^\s*export\s+class\s+(\w+)/,                        // export class Name
		];
	}

	// Python function patterns
	private getPythonRegexes(): RegExp[] {
		return [
			/^\s*def\s+(\w+)\s*\(/,           // def name()
			/^\s*async\s+def\s+(\w+)\s*\(/,   // async def name()
			/^\s*class\s+(\w+)/,              // class Name
		];
	}

	// Detect language from document
	private getDocumentLanguage(document: vscode.TextDocument): 'javascript' | 'python' | 'unknown' {
		const languageId = document.languageId;
		
		// Check VS Code language ID first
		if (['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(languageId)) {
			return 'javascript';
		}
		if (languageId === 'python') {
			return 'python';
		}
		
		// Fallback: check file extension
		const fileName = document.fileName.toLowerCase();
		if (fileName.endsWith('.js') || fileName.endsWith('.ts') || 
			fileName.endsWith('.jsx') || fileName.endsWith('.tsx') ||
			fileName.endsWith('.mjs') || fileName.endsWith('.cjs')) {
			return 'javascript';
		}
		if (fileName.endsWith('.py') || fileName.endsWith('.pyw')) {
			return 'python';
		}
		
		return 'unknown';
	}

	// Get appropriate regex patterns based on language
	private getFunctionRegexes(document: vscode.TextDocument): RegExp[] {
		const language = this.getDocumentLanguage(document);
		
		switch (language) {
			case 'javascript':
				return this.getJavaScriptRegexes();
			case 'python':
				return this.getPythonRegexes();
			case 'unknown':
			default:
				// For unknown languages, combine both sets
				return [...this.getJavaScriptRegexes(), ...this.getPythonRegexes()];
		}
	}

	public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
		const codeLenses: vscode.CodeLens[] = [];
		const text = document.getText();
		const lines = text.split('\n');

		// Get language-specific function regexes
		const functionRegexes = this.getFunctionRegexes(document);

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			
			for (const regex of functionRegexes) {
				const match = line.match(regex);
				if (match && match[1]) {
					const functionName = match[1];
					const startLine = i;
					const endLine = findFunctionEnd(lines, startLine);
					
					if (endLine > startLine) {
						const range = new vscode.Range(startLine, 0, startLine, line.length);
						
						// Create analyze button
						const analyzeCommand: vscode.Command = {
							title: '🔍 Analyze Complexity',
							command: 'analyze-complexity.analyzeFunctionComplexity',
							arguments: [functionName, startLine, endLine, document.uri]
						};
						
						codeLenses.push(new vscode.CodeLens(range, analyzeCommand));
						
						// Add result display if available
						const key = `${document.uri.toString()}:${functionName}:${startLine}`;
						const result = complexityResults.get(key);
						if (result) {
							const resultRange = new vscode.Range(startLine, line.length, startLine, line.length);
							const resultCommand: vscode.Command = {
								title: `⏱️ ${result.timeComplexity} | 💾 ${result.spaceComplexity} | 🕒 ${result.timestamp}`,
								command: ''
							};
							codeLenses.push(new vscode.CodeLens(resultRange, resultCommand));
						}
					}
					break;
				}
			}
		}

		return codeLenses;
	}
}

function getFunctionCode(document: vscode.TextDocument, startLine: number, endLine: number): string {
	const range = new vscode.Range(startLine, 0, endLine, 0);
	return document.getText(range);
}

function findFunctionEnd(lines: string[], startLine: number): number {
	let braceCount = 0;
	let inFunction = false;
	
	for (let i = startLine; i < lines.length; i++) {
		const line = lines[i];
		
		// Count opening braces
		const openBraces = (line.match(/{/g) || []).length;
		const closeBraces = (line.match(/}/g) || []).length;
		
		if (openBraces > 0) {
			inFunction = true;
		}
		
		braceCount += openBraces - closeBraces;
		
		if (inFunction && braceCount === 0) {
			return i + 1;
		}
	}
	
	// If no closing brace found, return a reasonable default
	return Math.min(startLine + 50, lines.length - 1);
}

function analyzeComplexity(code: string) {
	let timeComplexity = 'O(1)';
	let spaceComplexity = 'O(1)';
	
	// Remove comments and strings for better analysis
	const cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\/\/.*$/gm, '')
		.replace(/'[^']*'/g, '""')
		.replace(/"[^"]*"/g, '""');
	
	// Analyze nested loops
	const nestedLoopDepth = analyzeNestedLoops(cleanCode);
	if (nestedLoopDepth > 0) {
		if (nestedLoopDepth === 1) {
			timeComplexity = 'O(n)';
		} else if (nestedLoopDepth === 2) {
			timeComplexity = 'O(n²)';
		} else {
			timeComplexity = `O(n^${nestedLoopDepth})`;
		}
	}
	
	// Analyze recursion
	const recursiveFunctions = analyzeRecursion(cleanCode);
	if (recursiveFunctions.length > 0) {
		if (timeComplexity === 'O(1)') {
			timeComplexity = 'O(2^n)';
		}
	}
	
	// Analyze data structures for space complexity
	const dataStructures = analyzeDataStructures(cleanCode);
	if (dataStructures.some(ds => ds.includes('Array') || ds.includes('List') || ds.includes('Map'))) {
		spaceComplexity = 'O(n)';
	}
	
	// Analyze sorting algorithms
	if (/\.sort\(|bubbleSort|selectionSort|insertionSort/.test(cleanCode)) {
		if (timeComplexity === 'O(1)' || timeComplexity === 'O(n)') {
			timeComplexity = 'O(n²)';
		}
	}
	if (/quickSort|mergeSort/.test(cleanCode)) {
		timeComplexity = 'O(n log n)';
	}
	
	// Analyze binary search patterns
	if (cleanCode.includes('binary') || /while.*<.*\/.*2/g.test(cleanCode)) {
		if (timeComplexity === 'O(1)') {
			timeComplexity = 'O(log n)';
		}
	}
	
	return {
		timeComplexity,
		spaceComplexity
	};
}

function analyzeNestedLoops(code: string): number {
	const loopPatterns = [
		/for\s*\(/g,
		/while\s*\(/g,
		/do\s*{/g,
		/forEach\s*\(/g,
		/map\s*\(/g,
		/filter\s*\(/g,
		/reduce\s*\(/g
	];
	
	let maxDepth = 0;
	let currentDepth = 0;
	
	// Simple heuristic: count opening and closing braces to estimate nesting
	const lines = code.split('\n');
	for (const line of lines) {
		const hasLoop = loopPatterns.some(pattern => pattern.test(line));
		if (hasLoop) {
			currentDepth++;
			maxDepth = Math.max(maxDepth, currentDepth);
		}
		
		// Count closing braces (simplified)
		const closingBraces = (line.match(/}/g) || []).length;
		currentDepth = Math.max(0, currentDepth - closingBraces);
	}
	
	return maxDepth;
}

function analyzeRecursion(code: string): string[] {
	const functionNames = [];
	const functionMatches = code.match(/function\s+(\w+)|(\w+)\s*=\s*function|def\s+(\w+)/g);
	
	if (functionMatches) {
		for (const match of functionMatches) {
			const name = match.match(/\w+/g)?.pop();
			if (name && code.includes(name + '(') && 
				code.indexOf(name + '(', code.indexOf(match)) > code.indexOf(match)) {
				functionNames.push(name);
			}
		}
	}
	
	return functionNames;
}

function analyzeDataStructures(code: string): string[] {
	const structures = [];
	
	if (/new\s+Array|new\s+\w*Array|\[\]|\[.*\]/.test(code)) {
		structures.push('Array');
	}
	if (/new\s+Map|new\s+HashMap|new\s+Dictionary|\{\}|\{.*\}/.test(code)) {
		structures.push('Hash Map/Object');
	}
	if (/new\s+Set/.test(code)) {
		structures.push('Set');
	}
	if (/new\s+Stack|push.*pop/.test(code)) {
		structures.push('Stack');
	}
	if (/new\s+Queue|enqueue.*dequeue/.test(code)) {
		structures.push('Queue');
	}
	if (/LinkedList|TreeNode|BinaryTree/.test(code)) {
		structures.push('Tree/LinkedList');
	}
	
	return structures;
}

// This method is called when your extension is deactivated
export function deactivate() {}
