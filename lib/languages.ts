// 🎯 Map your 12 supported languages to OnlineCompiler.com / Judge0 language IDs
// Replace these IDs with your provider's exact language identifiers.
export const SUPPORTED_LANGUAGES = [
  { id: 50, name: 'C (GCC 9.2.0)', extension: 'c', starter: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}' },
  { id: 54, name: 'C++ (GCC 9.2.0)', extension: 'cpp', starter: '#include <iostream>\n\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)', extension: 'java', starter: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}' },
  { id: 71, name: 'Python (3.8.1)', extension: 'py', starter: '# Write your code here\npass' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)', extension: 'js', starter: '// Write your code here\nconsole.log("Hello, World!");' },
  { id: 51, name: 'C# (Mono 6.6.0.161)', extension: 'cs', starter: 'using System;\n\npublic class Program {\n    public static void Main() {\n        // Write your code here\n    }\n}' },
  { id: 60, name: 'Go (1.13.5)', extension: 'go', starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n}' },
  { id: 73, name: 'Rust (1.40.0)', extension: 'rs', starter: 'fn main() {\n    // Write your code here\n}' },
  { id: 68, name: 'PHP (7.4.1)', extension: 'php', starter: '<?php\n// Write your code here\n' },
  { id: 72, name: 'Ruby (2.7.0)', extension: 'rb', starter: '# Write your code here\nputs "Hello, World!"' },
  { id: 78, name: 'Kotlin (1.3.70)', extension: 'kt', starter: 'fun main() {\n    // Write your code here\n}' },
  { id: 83, name: 'Swift (5.2.3)', extension: 'swift', starter: 'print("Hello, World!")\n' },
];

export function getLanguageConfig(langName: string) {
  return SUPPORTED_LANGUAGES.find(l => l.name === langName) || SUPPORTED_LANGUAGES[1]; // Default to C++
}