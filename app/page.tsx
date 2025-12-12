"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Plus, Folder, File, ChevronRight, ChevronDown, Save, Trash2, Loader2, 
  PenTool, Image as ImageIcon, Type, Code as CodeIcon, ArrowUp, ArrowDown, X, 
  CheckCircle, AlertCircle, MoreVertical 
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- TYPES ---
type BlockType = 'text' | 'image' | 'code' | 'drawing';

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Text content, Image URL (base64), or Code string
  language?: string;
}

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'nickpad';
  parent_id: string | null;
  language?: string;
  question?: string;
  code?: string; // For NickPad, this stores JSON string of the Blocks Array
  output?: string;
  children?: FileNode[]; 
}

// --- HELPER COMPONENTS ---

const DrawingBlock = ({ content, onSave }: { content: string, onSave: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(!content); 
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isEditing && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 400);
        if (content) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = content;
        }
      }
    }
  }, [isEditing]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: any) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoords(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoords(e);
    if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(x, y);
        ctx.stroke();
    }
  };

  const saveDrawing = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="relative group border border-gray-700 rounded-lg overflow-hidden bg-white w-full">
        <img src={content} alt="Diagram" className="w-full h-auto max-h-[500px] object-contain" />
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        >
          Edit Diagram
        </button>
      </div>
    );
  }

  return (
    <div className="border border-blue-500 rounded-lg p-2 bg-gray-800 w-full">
      <div className="text-xs text-gray-400 mb-2 flex justify-between">
        <span>Draw your diagram below</span>
        <button onClick={saveDrawing} className="text-green-400 font-bold hover:underline">Done</button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full bg-white rounded cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={() => setIsDrawing(false)}
      />
    </div>
  );
};

// --- MAIN COMPONENT ---

const CodeEditor = () => {
  // --- STATE ---
  const [folders, setFolders] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  
  // Editor State
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // NickPad State (Block Editor)
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // Modals & Popups
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'folder' | 'file' | 'nickpad'>('folder');
  const [newItemName, setNewItemName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('python');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  // --- HELPER: Notifications ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- DATA LOADING ---
  const buildTree = (data: FileNode[]): FileNode[] => {
    const idMapping: Record<string, FileNode> = data.reduce((acc, el) => {
      acc[el.id] = { ...el, children: [] };
      return acc;
    }, {} as Record<string, FileNode>);
    const rootNodes: FileNode[] = [];
    data.forEach(el => {
      if (el.parent_id && idMapping[el.parent_id]) {
        idMapping[el.parent_id].children?.push(idMapping[el.id]);
      } else {
        rootNodes.push(idMapping[el.id]);
      }
    });
    return rootNodes;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('type', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      setFolders(buildTree(data as FileNode[]));
    } catch (error: any) {
      showNotification('Error fetching files', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- SELECTION LOGIC ---
  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type === 'nickpad') {
        try {
          // Robust parsing logic
          let content = [];
          if (selectedFile.code && selectedFile.code.trim() !== '') {
            content = JSON.parse(selectedFile.code);
          }
          
          if (Array.isArray(content) && content.length > 0) {
            setBlocks(content);
          } else {
            setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
          }
        } catch (e) {
          console.error("Error parsing NickPad blocks", e);
          setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
        }
      } else {
        // Normal Code File
        setQuestion(selectedFile.question || '');
        setCode(selectedFile.code || '');
        setOutput(selectedFile.output || '');
      }
    }
  }, [selectedFile]);

  // --- NICKPAD BLOCK ACTIONS ---
  
  const addBlock = (type: BlockType, index: number) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, content: string, language?: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content, language } : b));
  };

  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) return;
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) updateBlock(blockId, ev.target!.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- ACTIONS ---
  const addNewItem = async () => {
    if (!newItemName.trim()) return;
    try {
      const newItem = {
        name: newItemName,
        type: newItemType,
        parent_id: selectedFolderId,
        language: newItemType === 'file' ? newFileLanguage : null, 
        question: '',
        code: '',
        output: ''
      };
      const { error } = await supabase.from('files').insert([newItem]);
      if (error) throw error;
      await fetchData();
      if (selectedFolderId) setExpandedFolders(prev => ({ ...prev, [selectedFolderId]: true }));
      setShowNewItemModal(false);
      setNewItemName('');
      showNotification(`${newItemType} created!`, 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    try {
      let dataToSave = {};
      
      if (selectedFile.type === 'nickpad') {
        // Safe stringify
        const jsonContent = JSON.stringify(blocks);
        dataToSave = { code: jsonContent };
        
        // Update local state temporarily
        setSelectedFile({ ...selectedFile, code: jsonContent });
      } else {
        dataToSave = { question, code, output };
        setSelectedFile({ ...selectedFile, question, code, output });
      }

      const { error } = await supabase.from('files').update(dataToSave).eq('id', selectedFile.id);
      
      if (error) throw error;

      // CRITICAL: Re-fetch data to ensure the sidebar source-of-truth is updated
      // This fixes the issue where data isn't "saving" when you switch away
      await fetchData();
      
      showNotification('Saved successfully!', 'success');
    } catch (error: any) {
      console.error(error);
      showNotification('Error saving: ' + error.message, 'error');
    }
  };

  const executeDelete = async () => {
    if (!itemToDeleteId) return;
    try {
        const { error } = await supabase.from('files').delete().eq('id', itemToDeleteId);
        if (error) throw error;
        if (selectedFile?.id === itemToDeleteId) setSelectedFile(null);
        await fetchData();
        showNotification('Deleted successfully', 'success');
    } catch (error:any) {
        showNotification(error.message, 'error');
    } finally {
        setItemToDeleteId(null);
    }
  };

  const runCode = async () => {
    if (!selectedFile || selectedFile.type !== 'file') return;
    setIsRunning(true);
    setOutput('Running...');
    try {
      const lang = selectedFile.language === 'python' ? 'python' : 'java';
      const fileName = selectedFile.language === 'python' ? 'main.py' : 'Main.java';
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, version: '*', files: [{ name: fileName, content: code }] })
      });
      const result = await response.json();
      setOutput(result.run.output || result.run.stderr || 'No output');
    } catch (error: any) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  // --- RENDERERS ---
  const renderTree = (items: FileNode[], level: number = 0) => {
    return items.map(item => (
      <div key={item.id} style={{ marginLeft: `${level * 16}px` }}>
        {item.type === 'folder' ? (
          <div>
            <div 
              className="flex items-center justify-between group px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
              onClick={() => setExpandedFolders(p => ({ ...p, [item.id]: !p[item.id] }))}
            >
              <div className="flex items-center gap-2 flex-1">
                {expandedFolders[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Folder size={16} className="text-yellow-500" />
                <span className="text-sm truncate">{item.name}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedFolderId(item.id); setShowNewItemModal(true); }} className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"><Plus size={14} /></button>
            </div>
            {expandedFolders[item.id] && item.children && renderTree(item.children, level + 1)}
          </div>
        ) : (
          <div 
            onClick={() => setSelectedFile(item)}
            className={`flex items-center justify-between group px-3 py-2 hover:bg-gray-700 rounded cursor-pointer ${selectedFile?.id === item.id ? 'bg-gray-700' : ''}`}
          >
            <div className={`flex items-center gap-2 flex-1 ${selectedFile?.id === item.id ? 'text-blue-400' : ''}`}>
              {item.type === 'nickpad' ? <PenTool size={16} className="text-green-400"/> : <File size={16} className="text-blue-400" />}
              <span className="text-sm truncate">{item.name}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setItemToDeleteId(item.id); }} className="p-1 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col relative">
      {/* Header - Centered Title */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-center relative">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
          Code & NickPad
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col shrink-0">
          <div className="p-4 space-y-2">
            <button
              onClick={() => { setNewItemType('folder'); setShowNewItemModal(true); setSelectedFolderId(null); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus size={16} /> <span className="text-sm">New Folder</span>
            </button>
            <button
              onClick={() => { setNewItemType('nickpad'); setShowNewItemModal(true); setSelectedFolderId(null); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <PenTool size={16} /> <span className="text-sm">New NickPad</span>
            </button>
          </div>
          <div className="px-2 flex-1">{loading ? <div className="text-center p-4"><Loader2 className="animate-spin inline" /></div> : renderTree(folders)}</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {selectedFile ? (
            <>
              {/* Toolbar */}
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                   {selectedFile.type === 'nickpad' ? <PenTool size={18} className="text-green-400"/> : <File size={18} className="text-blue-400"/>}
                   <span className="font-medium">{selectedFile.name}</span>
                   {selectedFile.type === 'file' && <span className="text-xs bg-gray-700 px-2 py-1 rounded">{selectedFile.language}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={saveFile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"><Save size={16} /> Save</button>
                  {selectedFile.type === 'file' && (
                    <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                      {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-900 relative">
                
                {/* --- NICKPAD BLOCK EDITOR (Full Width) --- */}
                {selectedFile.type === 'nickpad' && (
                  <div className="px-4 py-6 w-full pb-48"> 
                    {blocks.map((block, index) => (
                      <div key={block.id} className="mb-4 group relative pl-8 w-full">
                        
                        {/* Block Controls */}
                        <div className="absolute left-0 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-gray-700 rounded text-gray-400"><ArrowUp size={12} /></button>
                          <button onClick={() => deleteBlock(index)} className="p-1 hover:bg-red-900 rounded text-red-400"><Trash2 size={12} /></button>
                          <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-gray-700 rounded text-gray-400"><ArrowDown size={12} /></button>
                        </div>

                        {/* RENDER BASED ON TYPE */}
                        {block.type === 'text' && (
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            placeholder="Type something..."
                            className="w-full bg-transparent text-gray-200 resize-none outline-none border-l-2 border-transparent focus:border-blue-500 pl-2 py-2"
                            style={{ minHeight: '3rem', height: 'auto' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                          />
                        )}

                        {block.type === 'code' && (
                           <div className="bg-gray-950 border border-gray-700 rounded-lg overflow-hidden w-full">
                              <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400 border-b border-gray-700 flex justify-between">
                                 <span>Code Snippet</span>
                                 <input 
                                    value={block.language || 'javascript'} 
                                    onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
                                    className="bg-transparent text-right outline-none text-blue-400 w-24"
                                 />
                              </div>
                              <textarea
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                className="w-full bg-transparent p-3 font-mono text-sm text-green-400 outline-none resize-y min-h-[100px]"
                                placeholder="// Write your code here"
                              />
                           </div>
                        )}

                        {block.type === 'image' && (
                           <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-gray-800 transition-colors w-full">
                              {block.content ? (
                                 <div className="relative inline-block max-w-full">
                                    <img src={block.content} alt="Block" className="max-h-[600px] rounded object-contain" />
                                    <button onClick={() => updateBlock(block.id, '')} className="absolute top-2 right-2 bg-red-600 p-1 rounded-full"><X size={12}/></button>
                                 </div>
                              ) : (
                                 <label className="cursor-pointer block p-4">
                                    <ImageIcon className="mx-auto mb-2 text-gray-500" />
                                    <span className="text-sm text-gray-400">Click to upload image</span>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, block.id)} className="hidden" />
                                 </label>
                              )}
                           </div>
                        )}

                        {block.type === 'drawing' && (
                           <DrawingBlock 
                              content={block.content} 
                              onSave={(data) => updateBlock(block.id, data)}
                           />
                        )}

                        {/* ADD BUTTONS */}
                        <div className="h-4 -mb-4 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity relative z-10 mt-2">
                           <div className="bg-gray-800 rounded-full shadow-lg flex border border-gray-700 scale-75 hover:scale-100 transition-transform">
                              <button onClick={() => addBlock('text', index)} className="p-2 hover:bg-gray-700 rounded-l-full text-blue-400" title="Add Text"><Type size={16} /></button>
                              <button onClick={() => addBlock('code', index)} className="p-2 hover:bg-gray-700 text-yellow-400" title="Add Code"><CodeIcon size={16} /></button>
                              <button onClick={() => addBlock('image', index)} className="p-2 hover:bg-gray-700 text-purple-400" title="Add Image"><ImageIcon size={16} /></button>
                              <button onClick={() => addBlock('drawing', index)} className="p-2 hover:bg-gray-700 rounded-r-full text-green-400" title="Add Diagram"><PenTool size={16} /></button>
                           </div>
                        </div>

                      </div>
                    ))}

                    {blocks.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="mb-4">Document is empty</p>
                        <button onClick={() => addBlock('text', -1)} className="px-4 py-2 bg-blue-600 text-white rounded">Start Writing</button>
                      </div>
                    )}
                  </div>
                )}

                {/* --- STANDARD CODE EDITOR VIEW --- */}
                {selectedFile.type === 'file' && (
                  <div className="p-4 space-y-4 w-full">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Question / Notes</label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Write your question or requirements here..."
                        className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Code</label>
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-96 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                        spellCheck="false"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Output</label>
                      <div className="w-full h-48 px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                        {output || 'Output will appear here...'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <File size={64} className="mx-auto mb-4 opacity-20" />
                <p>Select a file to start</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white z-50 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {itemToDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Confirm Deletion</h2>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setItemToDeleteId(null)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={executeDelete} className="flex-1 px-4 py-2 bg-red-600 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New {newItemType}</h2>
            {newItemType !== 'nickpad' && (
              <div className="flex gap-2 mb-4">
                  <button onClick={() => setNewItemType('folder')} className={`flex-1 py-2 rounded ${newItemType === 'folder' ? 'bg-blue-600' : 'bg-gray-700'}`}>Folder</button>
                  <button onClick={() => setNewItemType('file')} className={`flex-1 py-2 rounded ${newItemType === 'file' ? 'bg-blue-600' : 'bg-gray-700'}`}>File</button>
              </div>
            )}
            {newItemType === 'file' && (
               <select value={newFileLanguage} onChange={(e) => setNewFileLanguage(e.target.value)} className="w-full mb-4 px-4 py-2 bg-gray-700 rounded-lg">
                  <option value="python">Python</option>
                  <option value="java">Java</option>
               </select>
            )}
            <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 bg-gray-700 rounded-lg mb-4" autoFocus />
            <div className="flex gap-2">
              <button onClick={addNewItem} className="flex-1 py-2 bg-blue-600 rounded-lg">Create</button>
              <button onClick={() => setShowNewItemModal(false)} className="flex-1 py-2 bg-gray-700 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;