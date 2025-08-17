import JSZip from 'jszip';

export const parseJsonToFileTree = (jsonData) => {
  try {
    const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    const processNode = (obj, path = '') => {
      const nodes = [];
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const itemPath = path ? `${path}[${index}]` : `[${index}]`;
          if (typeof item === 'object' && item !== null) {
            nodes.push({
              id: `${itemPath}`,
              name: `Item ${index}`,
              type: 'folder',
              path: itemPath,
              children: processNode(item, itemPath)
            });
          } else {
            nodes.push({
              id: `${itemPath}`,
              name: `Item ${index}`,
              type: 'file',
              path: itemPath,
              value: item,
              content: String(item)
            });
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const itemPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            nodes.push({
              id: itemPath,
              name: key,
              type: Array.isArray(value) ? 'folder' : 'folder',
              path: itemPath,
              children: processNode(value, itemPath)
            });
          } else {
            nodes.push({
              id: itemPath,
              name: key,
              type: 'file',
              path: itemPath,
              value: value,
              content: String(value)
            });
          }
        });
      }
      
      return nodes;
    };
    
    return processNode(parsed);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid JSON format');
  }
};

export const convertToZip = async (fileTree, selectedFiles = new Set()) => {
  try {
    const zip = new JSZip();
    
    const addToZip = (nodes, currentPath = '') => {
      nodes.forEach(node => {
        if (selectedFiles.size === 0 || selectedFiles.has(node.id)) {
          const filePath = currentPath ? `${currentPath}/${node.name}` : node.name;
          
          if (node.type === 'file') {
            // Add file to zip with its content
            const content = node.content || String(node.value || '');
            zip.file(`${filePath}.txt`, content);
          } else if (node.type === 'folder' && node.children) {
            // Create folder and process children
            if (node.children.length === 0) {
              // Empty folder
              zip.folder(filePath);
            } else {
              // Process children recursively
              addToZip(node.children, filePath);
            }
          }
        } else if (node.type === 'folder' && node.children) {
          // Even if folder is not selected, check if any children are selected
          const hasSelectedChildren = node.children.some(child => 
            selectedFiles.has(child.id) || 
            (child.children && hasSelectedDescendants(child, selectedFiles))
          );
          
          if (hasSelectedChildren) {
            addToZip(node.children, currentPath ? `${currentPath}/${node.name}` : node.name);
          }
        }
      });
    };
    
    const hasSelectedDescendants = (node, selectedFiles) => {
      if (selectedFiles.has(node.id)) return true;
      if (node.children) {
        return node.children.some(child => hasSelectedDescendants(child, selectedFiles));
      }
      return false;
    };
    
    addToZip(fileTree);
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
    
    return zipBlob;
  } catch (error) {
    console.error('Error creating zip file:', error);
    throw new Error('Failed to create zip file');
  }
};

export const downloadZip = (zipBlob, filename = 'converted-files.zip') => {
  try {
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading zip file:', error);
    throw new Error('Failed to download zip file');
  }
};

export const validateJsonStructure = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Check if it's a valid structure for file conversion
    if (parsed === null || parsed === undefined) {
      return { isValid: false, error: 'JSON cannot be null or undefined' };
    }
    
    if (typeof parsed !== 'object') {
      return { isValid: false, error: 'JSON must be an object or array at root level' };
    }
    
    return { isValid: true, data: parsed };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Invalid JSON syntax: ${error.message}` 
    };
  }
};

export const getFileTreeStats = (fileTree) => {
  let totalFiles = 0;
  let totalFolders = 0;
  let maxDepth = 0;
  
  const traverse = (nodes, depth = 0) => {
    maxDepth = Math.max(maxDepth, depth);
    
    nodes.forEach(node => {
      if (node.type === 'file') {
        totalFiles++;
      } else if (node.type === 'folder') {
        totalFolders++;
        if (node.children && node.children.length > 0) {
          traverse(node.children, depth + 1);
        }
      }
    });
  };
  
  traverse(fileTree);
  
  return {
    totalFiles,
    totalFolders,
    maxDepth,
    totalNodes: totalFiles + totalFolders
  };
};