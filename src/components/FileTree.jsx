import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FileTreeNode = ({ node, path = '', onNodeClick, expandedNodes, onToggleExpand }) => {
  const isExpanded = expandedNodes.has(path)
  const isFolder = node.type === 'folder'
  const hasChildren = isFolder && node.children && Object.keys(node.children).length > 0

  const handleToggle = (e) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggleExpand(path)
    }
  }

  const handleClick = () => {
    onNodeClick(node, path)
    if (hasChildren && !isExpanded) {
      onToggleExpand(path)
    }
  }

  const nodeVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  }

  const childrenVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.15, delay: 0.05 }
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: {
        opacity: { duration: 0.1 },
        height: { duration: 0.2, delay: 0.05 }
      }
    }
  }

  return (
    <motion.div
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="select-none"
    >
      <div
        className={`flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 group ${
          isFolder ? 'font-medium' : 'font-normal'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren && (
            <motion.button
              onClick={handleToggle}
              className="flex-shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={14} className="text-gray-500" />
              </motion.div>
            </motion.button>
          )}
          
          {!hasChildren && isFolder && (
            <div className="w-5 mr-1" />
          )}

          <div className="flex-shrink-0 mr-2">
            {isFolder ? (
              isExpanded ? (
                <FolderOpen size={16} className="text-blue-500" />
              ) : (
                <Folder size={16} className="text-blue-500" />
              )
            ) : (
              <File size={16} className="text-gray-500" />
            )}
          </div>

          <span className="truncate text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
            {node.name}
          </span>

          {!isFolder && node.size && (
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            variants={childrenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2 overflow-hidden"
          >
            {Object.entries(node.children).map(([name, childNode]) => (
              <FileTreeNode
                key={name}
                node={childNode}
                path={path ? `${path}/${name}` : name}
                onNodeClick={onNodeClick}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const FileTree = ({ data, onNodeClick, className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    // Auto-expand root level folders by default
    if (data) {
      const rootExpanded = new Set()
      Object.keys(data).forEach(key => {
        if (data[key].type === 'folder') {
          rootExpanded.add(key)
        }
      })
      setExpandedNodes(rootExpanded)
    }
  }, [data])

  const handleToggleExpand = (path) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  const handleNodeClick = (node, path) => {
    setSelectedNode(path)
    if (onNodeClick) {
      onNodeClick(node, path)
    }
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <File size={48} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No files to display</p>
        <p className="text-xs mt-1">Upload a JSON file to see the file tree structure</p>
      </div>
    )
  }

  return (
    <div className={`p-2 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        {Object.entries(data).map(([name, node]) => (
          <FileTreeNode
            key={name}
            node={node}
            path={name}
            onNodeClick={handleNodeClick}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </motion.div>
      
      {Object.keys(data).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{Object.keys(data).length} items</span>
            <span>{expandedNodes.size} expanded</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FileTree