import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileText, Folder, AlertCircle, CheckCircle } from 'lucide-react';
import FileTree from '../components/FileTree.jsx';
import ConversionForm from '../components/ConversionForm.jsx';
import { convertToZip } from '../utils/fileUtils.js';

const ConvertPage = () => {
  const [jsonData, setJsonData] = useState(null);
  const [fileTree, setFileTree] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleJsonUpload = useCallback((data, tree) => {
    setJsonData(data);
    setFileTree(tree);
    setError(null);
    setConversionStatus(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!jsonData || !fileTree) {
      setError('Please upload a valid JSON file first');
      return;
    }

    setIsConverting(true);
    setError(null);
    setConversionStatus(null);

    try {
      await convertToZip(jsonData, fileTree);
      setConversionStatus('success');
    } catch (err) {
      setError(err.message || 'Failed to convert JSON to ZIP');
      setConversionStatus('error');
    } finally {
      setIsConverting(false);
    }
  }, [jsonData, fileTree]);

  const handleReset = useCallback(() => {
    setJsonData(null);
    setFileTree(null);
    setError(null);
    setConversionStatus(null);
    setIsConverting(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white mr-4">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              JSON to ZIP Converter
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your JSON file and convert it to a downloadable ZIP archive with a visual file tree preview
          </p>
        </motion.div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {conversionStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-700">ZIP file has been generated and downloaded successfully!</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Convert */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Upload JSON File</h2>
              </div>
              <ConversionForm onJsonUpload={handleJsonUpload} />
            </div>

            {/* Convert Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Convert to ZIP</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  {jsonData ? 'Your JSON file is ready for conversion.' : 'Upload a JSON file to begin conversion.'}
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleConvert}
                    disabled={!jsonData || isConverting}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      !jsonData || isConverting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isConverting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Converting...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Download className="w-5 h-5 mr-2" />
                        Convert to ZIP
                      </div>
                    )}
                  </button>
                  
                  {jsonData && (
                    <button
                      onClick={handleReset}
                      disabled={isConverting}
                      className="py-3 px-6 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - File Tree Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <Folder className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">File Tree Preview</h2>
            </div>
            
            <div className="min-h-[400px]">
              {fileTree ? (
                <FileTree data={fileTree} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Folder className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">No file tree to display</p>
                  <p className="text-sm text-center">
                    Upload a JSON file to see the file structure preview
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="p-2 bg-blue-500 text-white rounded-full mr-3 mt-1">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Upload JSON</h4>
                <p className="text-sm text-gray-600">Select or drag & drop your JSON file</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="p-2 bg-indigo-500 text-white rounded-full mr-3 mt-1">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Preview Structure</h4>
                <p className="text-sm text-gray-600">View the generated file tree structure</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="p-2 bg-purple-500 text-white rounded-full mr-3 mt-1">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Download ZIP</h4>
                <p className="text-sm text-gray-600">Convert and download as ZIP archive</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConvertPage;