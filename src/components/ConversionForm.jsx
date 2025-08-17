import { useState } from 'react';
import { convertToZip } from '../utils/fileUtils.js';

export default function ConversionForm() {
  const [jsonInput, setJsonInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConvert = async () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      return;
    }

    setIsConverting(true);
    setError('');
    setSuccess(false);

    try {
      // Validate JSON
      JSON.parse(jsonInput);
      
      // Convert to ZIP
      await convertToZip(jsonInput);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your input.');
      } else {
        setError('Failed to convert JSON to ZIP. Please try again.');
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setError('');
    setSuccess(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonInput(e.target.result);
        setError('');
        setSuccess(false);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid JSON file');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">JSON to ZIP Converter</h2>
            <p className="text-gray-300">
              Convert your JSON data into a downloadable ZIP file with organized file structure
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Upload JSON File (Optional)
            </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer bg-gray-800/50 border border-gray-600 rounded-lg"
            />
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <label htmlFor="json-input" className="block text-sm font-medium text-gray-200">
              JSON Data
            </label>
            <textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Enter your JSON data here, for example:
{
  "src": {
    "components": {
      "Header.jsx": "import React from 'react';\\n\\nexport default function Header() {\\n  return <header>My App</header>;\\n}",
      "Footer.jsx": "import React from 'react';\\n\\nexport default function Footer() {\\n  return <footer>© 2024</footer>;\\n}"
    },
    "utils": {
      "helpers.js": "export const formatDate = (date) => {\\n  return date.toLocaleDateString();\\n};"
    }
  },
  "package.json": "{\\"name\\": \\"my-app\\", \\"version\\": \\"1.0.0\\"}"
}`}
              rows={12}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>ZIP file generated and downloaded successfully!</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConvert}
              disabled={isConverting || !jsonInput.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isConverting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Convert to ZIP</span>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-400 bg-gray-800/30 rounded-lg p-4">
            <h4 className="font-medium text-gray-300 mb-2">How to use:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Enter JSON data representing your file structure</li>
              <li>Use object keys as folder/file names and values as file contents</li>
              <li>Nested objects create folder hierarchies</li>
              <li>String values become file contents</li>
              <li>Click "Convert to ZIP" to download your files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}