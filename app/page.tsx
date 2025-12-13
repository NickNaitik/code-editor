// "use client";
// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Play, Plus, Folder, File, ChevronRight, ChevronDown, Save, Trash2, Loader2, 
//   PenTool, Image as ImageIcon, Type, Code as CodeIcon, ArrowUp, ArrowDown, X, 
//   CheckCircle, AlertCircle, LogOut, Lock
// } from 'lucide-react';
// import { supabase } from './lib/supabase';

// // --- TYPES ---
// type BlockType = 'text' | 'image' | 'code' | 'drawing';
// type UserRole = 'admin' | 'read_only';

// interface ContentBlock {
//   id: string;
//   type: BlockType;
//   content: string; 
//   language?: string;
// }

// interface FileNode {
//   id: string;
//   name: string;
//   type: 'folder' | 'file' | 'nickpad';
//   parent_id: string | null;
//   language?: string;
//   question?: string;
//   code?: string;
//   output?: string;
//   children?: FileNode[]; 
// }

// // --- HELPER: Session Timer Hook ---
// const useAutoLogout = (logoutFn: () => void) => {
//   useEffect(() => {
//     let timeout: NodeJS.Timeout;
//     const TIMEOUT_DURATION = 6 * 60 * 60 * 1000; 

//     const resetTimer = () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => {
//         console.log("Session expired due to inactivity");
//         logoutFn();
//       }, TIMEOUT_DURATION);
//     };

//     window.addEventListener('mousemove', resetTimer);
//     window.addEventListener('keypress', resetTimer);
//     window.addEventListener('click', resetTimer);
    
//     resetTimer(); 

//     return () => {
//       clearTimeout(timeout);
//       window.removeEventListener('mousemove', resetTimer);
//       window.removeEventListener('keypress', resetTimer);
//       window.removeEventListener('click', resetTimer);
//     };
//   }, [logoutFn]);
// };

// // --- COMPONENT: LOGIN SCREEN ---
// const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     const { error } = await supabase.auth.signInWithPassword({ email, password });

//     if (error) {
//       setError(error.message);
//       setLoading(false);
//     } else {
//       onLogin(); 
//     }
//   };

//   return (
//     <div className="h-screen bg-gray-900 flex items-center justify-center text-gray-100">
//       <div className="w-96 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-2xl">
//         <div className="flex justify-center mb-6">
//             <div className="bg-blue-600 p-3 rounded-full">
//                 <Lock size={32} className="text-white" />
//             </div>
//         </div>
//         <h2 className="text-2xl font-bold text-center mb-6">Secure Access</h2>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm text-gray-400 mb-1">Email</label>
//             <input 
//               type="email" 
//               required
//               value={email} 
//               onChange={e => setEmail(e.target.value)}
//               className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-400 mb-1">Password</label>
//             <input 
//               type="password" 
//               required
//               value={password} 
//               onChange={e => setPassword(e.target.value)}
//               className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
//             />
//           </div>
//           {error && <p className="text-red-400 text-sm text-center">{error}</p>}
//           <button 
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition-colors disabled:opacity-50"
//           >
//             {loading ? 'Authenticating...' : 'Login'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- HELPER COMPONENT: DRAWING ---
// const DrawingBlock = ({ content, onSave, readOnly }: { content: string, onSave: (data: string) => void, readOnly: boolean }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isEditing, setIsEditing] = useState(!content && !readOnly); 
//   const [isDrawing, setIsDrawing] = useState(false);

//   useEffect(() => {
//     if (isEditing && canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       if (ctx) {
//         ctx.fillStyle = '#ffffff';
//         ctx.fillRect(0, 0, 800, 400);
//         if (content) {
//             const img = new Image();
//             img.onload = () => ctx.drawImage(img, 0, 0);
//             img.src = content;
//         }
//       }
//     }
//   }, [isEditing]);

//   const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
//     const rect = canvasRef.current!.getBoundingClientRect();
//     const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
//     const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
//     return { x: clientX - rect.left, y: clientY - rect.top };
//   };

//   const startDraw = (e: any) => {
//     if (readOnly) return;
//     setIsDrawing(true);
//     const ctx = canvasRef.current?.getContext('2d');
//     const { x, y } = getCoords(e);
//     ctx?.beginPath();
//     ctx?.moveTo(x, y);
//   };

//   const draw = (e: any) => {
//     if (!isDrawing || readOnly) return;
//     e.preventDefault();
//     const ctx = canvasRef.current?.getContext('2d');
//     const { x, y } = getCoords(e);
//     if (ctx) {
//         ctx.lineWidth = 2;
//         ctx.lineCap = 'round';
//         ctx.strokeStyle = '#000';
//         ctx.lineTo(x, y);
//         ctx.stroke();
//     }
//   };

//   const saveDrawing = () => {
//     if (canvasRef.current) {
//       onSave(canvasRef.current.toDataURL());
//       setIsEditing(false);
//     }
//   };

//   if (!isEditing) {
//     return (
//       <div className="relative group border border-gray-700 rounded-lg overflow-hidden bg-white w-full">
//         <img src={content} alt="Diagram" className="w-full h-auto max-h-[500px] object-contain" />
//         {!readOnly && (
//           <button 
//             onClick={() => setIsEditing(true)}
//             className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs"
//           >
//             Edit Diagram
//           </button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="border border-blue-500 rounded-lg p-2 bg-gray-800 w-full">
//       <div className="text-xs text-gray-400 mb-2 flex justify-between">
//         <span>Draw your diagram below</span>
//         <button onClick={saveDrawing} className="text-green-400 font-bold hover:underline">Done</button>
//       </div>
//       <canvas
//         ref={canvasRef}
//         width={800}
//         height={400}
//         className="w-full bg-white rounded cursor-crosshair touch-none"
//         onMouseDown={startDraw}
//         onMouseMove={draw}
//         onMouseUp={() => setIsDrawing(false)}
//         onMouseLeave={() => setIsDrawing(false)}
//         onTouchStart={startDraw}
//         onTouchMove={draw}
//         onTouchEnd={() => setIsDrawing(false)}
//       />
//     </div>
//   );
// };

// // --- MAIN COMPONENT ---
// const CodeEditor = () => {
//   // --- AUTH STATE ---
//   const [session, setSession] = useState<any>(null);
//   const [userRole, setUserRole] = useState<UserRole>('read_only');
//   const [authLoading, setAuthLoading] = useState(true);

//   // --- APP STATE ---
//   const [folders, setFolders] = useState<FileNode[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
//   const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  
//   // Editor State
//   const [question, setQuestion] = useState('');
//   const [code, setCode] = useState('');
//   const [output, setOutput] = useState('');
//   const [isRunning, setIsRunning] = useState(false);

//   // NickPad State
//   const [blocks, setBlocks] = useState<ContentBlock[]>([]);

//   // UI State
//   const [showNewItemModal, setShowNewItemModal] = useState(false);
//   const [newItemType, setNewItemType] = useState<'folder' | 'file' | 'nickpad'>('folder');
//   const [newItemName, setNewItemName] = useState('');
//   const [newFileLanguage, setNewFileLanguage] = useState('python');
//   const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

//   // --- AUTH CHECK ---
//   useEffect(() => {
//     checkSession();
//   }, []);

//   const checkSession = async () => {
//     const { data: { session } } = await supabase.auth.getSession();
//     setSession(session);
    
//     if (session) {
//       const { data } = await supabase
//         .from('user_roles')
//         .select('role')
//         .eq('user_id', session.user.id)
//         .single();
      
//       if (data) {
//         setUserRole(data.role as UserRole);
//       }
//     }
//     setAuthLoading(false);
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setSession(null);
//     setUserRole('read_only');
//   };

//   useAutoLogout(session ? handleLogout : () => {});

//   // --- DATA LOADING ---
//   const buildTree = (data: FileNode[]): FileNode[] => {
//     const idMapping: Record<string, FileNode> = data.reduce((acc, el) => {
//       acc[el.id] = { ...el, children: [] };
//       return acc;
//     }, {} as Record<string, FileNode>);
//     const rootNodes: FileNode[] = [];
//     data.forEach(el => {
//       if (el.parent_id && idMapping[el.parent_id]) {
//         idMapping[el.parent_id].children?.push(idMapping[el.id]);
//       } else {
//         rootNodes.push(idMapping[el.id]);
//       }
//     });
//     return rootNodes;
//   };

//   const fetchData = async () => {
//     if (!session) return;
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('files')
//         .select('*')
//         .order('type', { ascending: false })
//         .order('name', { ascending: true });
//       if (error) throw error;
//       setFolders(buildTree(data as FileNode[]));
//     } catch (error: any) {
//       showNotification('Error fetching: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (session) fetchData();
//   }, [session]);

//   // --- SELECTION LOGIC ---
//   useEffect(() => {
//     if (selectedFile) {
//       if (selectedFile.type === 'nickpad') {
//         try {
//           let content = [];
//           if (selectedFile.code && selectedFile.code.trim() !== '') {
//             content = JSON.parse(selectedFile.code);
//           }
//           if (Array.isArray(content) && content.length > 0) {
//             setBlocks(content);
//           } else {
//             setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
//           }
//         } catch (e) {
//           setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
//         }
//       } else {
//         setQuestion(selectedFile.question || '');
//         setCode(selectedFile.code || '');
//         setOutput(selectedFile.output || '');
//       }
//     }
//   }, [selectedFile]);

//   // --- NOTIFICATIONS ---
//   const showNotification = (message: string, type: 'success' | 'error') => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   // --- BLOCK ACTIONS ---
//   const addBlock = (type: BlockType, index: number) => {
//     const newBlock: ContentBlock = {
//       id: Date.now().toString(),
//       type,
//       content: '',
//       language: type === 'code' ? 'javascript' : undefined
//     };
//     if (index === -1) {
//       setBlocks(prev => [...prev, newBlock]);
//     } else {
//       const newBlocks = [...blocks];
//       newBlocks.splice(index + 1, 0, newBlock);
//       setBlocks(newBlocks);
//     }
//   };

//   const updateBlock = (id: string, content: string, language?: string) => {
//     setBlocks(prev => prev.map(b => b.id === id ? { ...b, content, language } : b));
//   };

//   const deleteBlock = (index: number) => {
//     if (blocks.length <= 1) return;
//     const newBlocks = [...blocks];
//     newBlocks.splice(index, 1);
//     setBlocks(newBlocks);
//   };

//   const moveBlock = (index: number, direction: 'up' | 'down') => {
//     const newBlocks = [...blocks];
//     const swapIndex = direction === 'up' ? index - 1 : index + 1;
//     if (swapIndex >= 0 && swapIndex < newBlocks.length) {
//         [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
//         setBlocks(newBlocks);
//     }
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
//     if (e.target.files && e.target.files[0]) {
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         if (ev.target?.result) updateBlock(blockId, ev.target!.result as string);
//       };
//       reader.readAsDataURL(e.target.files[0]);
//     }
//   };

//   // --- DB ACTIONS ---
//   const addNewItem = async () => {
//     if (userRole !== 'admin') return; 

//     if (!newItemName.trim()) return;
//     try {
//       const newItem = {
//         name: newItemName,
//         type: newItemType,
//         parent_id: selectedFolderId,
//         language: newItemType === 'file' ? newFileLanguage : null, 
//         question: '',
//         code: '',
//         output: ''
//       };
//       const { error } = await supabase.from('files').insert([newItem]);
//       if (error) throw error;
//       await fetchData();
//       if (selectedFolderId) setExpandedFolders(prev => ({ ...prev, [selectedFolderId]: true }));
//       setShowNewItemModal(false);
//       setNewItemName('');
//       showNotification(`${newItemType} created!`, 'success');
//     } catch (error: any) {
//       showNotification(error.message, 'error');
//     }
//   };

//   const saveFile = async () => {
//     if (userRole !== 'admin') return; 

//     if (!selectedFile) return;
//     try {
//       let dataToSave = {};
//       if (selectedFile.type === 'nickpad') {
//         const jsonContent = JSON.stringify(blocks);
//         dataToSave = { code: jsonContent };
//         setSelectedFile({ ...selectedFile, code: jsonContent });
//       } else {
//         dataToSave = { question, code, output };
//         setSelectedFile({ ...selectedFile, question, code, output });
//       }
//       const { error } = await supabase.from('files').update(dataToSave).eq('id', selectedFile.id);
//       if (error) throw error;
//       await fetchData();
//       showNotification('Saved successfully!', 'success');
//     } catch (error: any) {
//       showNotification(error.message, 'error');
//     }
//   };

//   const executeDelete = async () => {
//     if (userRole !== 'admin') return; 
//     if (!itemToDeleteId) return;
//     try {
//         const { error } = await supabase.from('files').delete().eq('id', itemToDeleteId);
//         if (error) throw error;
//         if (selectedFile?.id === itemToDeleteId) setSelectedFile(null);
//         await fetchData();
//         showNotification('Deleted successfully', 'success');
//     } catch (error:any) {
//         showNotification(error.message, 'error');
//     } finally {
//         setItemToDeleteId(null);
//     }
//   };

//   const runCode = async () => {
//     if (userRole !== 'admin') return; 
    
//     if (!selectedFile || selectedFile.type !== 'file') return;
//     setIsRunning(true);
//     setOutput('Running...');
//     try {
//       const lang = selectedFile.language === 'python' ? 'python' : 'java';
//       const fileName = selectedFile.language === 'python' ? 'main.py' : 'Main.java';
//       const response = await fetch('https://emkc.org/api/v2/piston/execute', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ language: lang, version: '*', files: [{ name: fileName, content: code }] })
//       });
//       const result = await response.json();
//       setOutput(result.run.output || result.run.stderr || 'No output');
//     } catch (error: any) {
//       setOutput('Error: ' + error.message);
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   // --- RENDERERS ---
//   const renderTree = (items: FileNode[], level: number = 0) => {
//     return items.map(item => (
//       <div key={item.id} style={{ marginLeft: `${level * 16}px` }}>
//         {item.type === 'folder' ? (
//           <div>
//             <div 
//               className="flex items-center justify-between group px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
//               onClick={() => setExpandedFolders(p => ({ ...p, [item.id]: !p[item.id] }))}
//             >
//               <div className="flex items-center gap-2 flex-1">
//                 {expandedFolders[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//                 <Folder size={16} className="text-yellow-500" />
//                 <span className="text-sm truncate">{item.name}</span>
//               </div>
              
//               {/* ADMIN ACTIONS FOR FOLDER */}
//               {userRole === 'admin' && (
//                 <div className="flex gap-1">
//                   <button 
//                     onClick={(e) => { e.stopPropagation(); setSelectedFolderId(item.id); setShowNewItemModal(true); }} 
//                     className="p-1 text-gray-500 hover:text-white rounded"
//                   >
//                     <Plus size={14} />
//                   </button>
//                   {/* Added Delete Button for Folders */}
//                   <button 
//                     onClick={(e) => { e.stopPropagation(); setItemToDeleteId(item.id); }} 
//                     className="p-1 text-gray-500 hover:text-red-500 rounded"
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               )}
//             </div>
//             {expandedFolders[item.id] && item.children && renderTree(item.children, level + 1)}
//           </div>
//         ) : (
//           <div 
//             onClick={() => setSelectedFile(item)}
//             className={`flex items-center justify-between group px-3 py-2 hover:bg-gray-700 rounded cursor-pointer ${selectedFile?.id === item.id ? 'bg-gray-700' : ''}`}
//           >
//             <div className={`flex items-center gap-2 flex-1 ${selectedFile?.id === item.id ? 'text-blue-400' : ''}`}>
//               {item.type === 'nickpad' ? <PenTool size={16} className="text-green-400"/> : <File size={16} className="text-blue-400" />}
//               <span className="text-sm truncate">{item.name}</span>
//             </div>
//             {/* ADMIN ACTIONS FOR FILE */}
//             {userRole === 'admin' && (
//               <button 
//                 onClick={(e) => { e.stopPropagation(); setItemToDeleteId(item.id); }} 
//                 className="p-1 text-gray-500 hover:text-red-500 rounded"
//               >
//                 <Trash2 size={14} />
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     ));
//   };

//   if (authLoading) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> checking session...</div>;
//   if (!session) return <LoginScreen onLogin={checkSession} />;

//   return (
//     <div className="h-screen bg-gray-900 text-gray-100 flex flex-col relative">
//       {/* Header */}
//       <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between relative">
//         <div className="flex items-center gap-2">
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//             Code & NickPad
//             </h1>
//             {userRole === 'read_only' && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full border border-gray-600">Read Only</span>}
//         </div>
        
//         <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
//             <LogOut size={16} /> Logout
//         </button>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar */}
//         <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col shrink-0">
//           {/* Hide Add Buttons if Read Only */}
//           {userRole === 'admin' && (
//             <div className="p-4 space-y-2">
//                 <button
//                 onClick={() => { setNewItemType('folder'); setShowNewItemModal(true); setSelectedFolderId(null); }}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
//                 >
//                 <Plus size={16} /> <span className="text-sm">New Folder</span>
//                 </button>
//                 <button
//                 onClick={() => { setNewItemType('nickpad'); setShowNewItemModal(true); setSelectedFolderId(null); }}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
//                 >
//                 <PenTool size={16} /> <span className="text-sm">New NickPad</span>
//                 </button>
//             </div>
//           )}
//           <div className="px-2 flex-1 mt-2">{loading ? <div className="text-center p-4"><Loader2 className="animate-spin inline" /></div> : renderTree(folders)}</div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col overflow-hidden relative">
//           {selectedFile ? (
//             <>
//               {/* Toolbar */}
//               <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between z-10 shrink-0">
//                 <div className="flex items-center gap-3">
//                    {selectedFile.type === 'nickpad' ? <PenTool size={18} className="text-green-400"/> : <File size={18} className="text-blue-400"/>}
//                    <span className="font-medium">{selectedFile.name}</span>
//                    {selectedFile.type === 'file' && <span className="text-xs bg-gray-700 px-2 py-1 rounded">{selectedFile.language}</span>}
//                 </div>
//                 {/* Hide Actions if Read Only */}
//                 {userRole === 'admin' && (
//                     <div className="flex gap-2">
//                         <button onClick={saveFile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"><Save size={16} /> Save</button>
//                         {selectedFile.type === 'file' && (
//                             <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
//                             {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run
//                             </button>
//                         )}
//                     </div>
//                 )}
//               </div>

//               <div className="flex-1 overflow-y-auto bg-gray-900 relative">
                
//                 {/* --- NICKPAD VIEW --- */}
//                 {selectedFile.type === 'nickpad' && (
//                   <div className="px-4 py-6 w-full pb-48"> 
//                     {blocks.map((block, index) => (
//                       <div key={block.id} className="mb-4 group relative pl-8 w-full">
                        
//                         {/* Only Admin can Move/Delete blocks */}
//                         {userRole === 'admin' && (
//                             <div className="absolute left-0 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
//                             <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-gray-700 rounded text-gray-400"><ArrowUp size={12} /></button>
//                             <button onClick={() => deleteBlock(index)} className="p-1 hover:bg-red-900 rounded text-red-400"><Trash2 size={12} /></button>
//                             <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-gray-700 rounded text-gray-400"><ArrowDown size={12} /></button>
//                             </div>
//                         )}

//                         {block.type === 'text' && (
//                           <textarea
//                             value={block.content}
//                             readOnly={userRole !== 'admin'}
//                             onChange={(e) => updateBlock(block.id, e.target.value)}
//                             placeholder="Type something..."
//                             className="w-full bg-transparent text-gray-200 resize-none outline-none border-l-2 border-transparent focus:border-blue-500 pl-2 py-2"
//                             style={{ minHeight: '3rem', height: 'auto' }}
//                             onInput={(e) => {
//                                 const target = e.target as HTMLTextAreaElement;
//                                 target.style.height = 'auto';
//                                 target.style.height = target.scrollHeight + 'px';
//                             }}
//                           />
//                         )}

//                         {block.type === 'code' && (
//                            <div className="bg-gray-950 border border-gray-700 rounded-lg overflow-hidden w-full">
//                               <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400 border-b border-gray-700 flex justify-between">
//                                  <span>Code Snippet</span>
//                                  <input 
//                                     value={block.language || 'javascript'} 
//                                     readOnly={userRole !== 'admin'}
//                                     onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
//                                     className="bg-transparent text-right outline-none text-blue-400 w-24"
//                                  />
//                               </div>
//                               <textarea
//                                 value={block.content}
//                                 readOnly={userRole !== 'admin'}
//                                 onChange={(e) => updateBlock(block.id, e.target.value)}
//                                 className="w-full bg-transparent p-3 font-mono text-sm text-green-400 outline-none resize-y min-h-[100px]"
//                                 placeholder="// Write your code here"
//                               />
//                            </div>
//                         )}

//                         {block.type === 'image' && (
//                            <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-gray-800 transition-colors w-full">
//                               {block.content ? (
//                                  <div className="relative inline-block max-w-full">
//                                     <img src={block.content} alt="Block" className="max-h-[600px] rounded object-contain" />
//                                     {userRole === 'admin' && (
//                                         <button onClick={() => updateBlock(block.id, '')} className="absolute top-2 right-2 bg-red-600 p-1 rounded-full"><X size={12}/></button>
//                                     )}
//                                  </div>
//                               ) : (
//                                  <label className={`cursor-pointer block p-4 ${userRole !== 'admin' ? 'pointer-events-none' : ''}`}>
//                                     <ImageIcon className="mx-auto mb-2 text-gray-500" />
//                                     <span className="text-sm text-gray-400">{userRole === 'admin' ? 'Click to upload image' : 'Empty Image Block'}</span>
//                                     {userRole === 'admin' && <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, block.id)} className="hidden" />}
//                                  </label>
//                               )}
//                            </div>
//                         )}

//                         {block.type === 'drawing' && (
//                            <DrawingBlock 
//                               content={block.content} 
//                               readOnly={userRole !== 'admin'}
//                               onSave={(data) => updateBlock(block.id, data)}
//                            />
//                         )}

//                         {/* Inline Add (Admin Only) */}
//                         {userRole === 'admin' && (
//                             <div className="h-4 -mb-4 opacity-30 hover:opacity-100 flex items-center justify-center gap-2 transition-opacity relative z-10 mt-2">
//                             <div className="bg-gray-800 rounded-full shadow-lg flex border border-gray-700 scale-75 hover:scale-100 transition-transform">
//                                 <button onClick={() => addBlock('text', index)} className="p-2 hover:bg-gray-700 rounded-l-full text-blue-400"><Type size={16} /></button>
//                                 <button onClick={() => addBlock('code', index)} className="p-2 hover:bg-gray-700 text-yellow-400"><CodeIcon size={16} /></button>
//                                 <button onClick={() => addBlock('image', index)} className="p-2 hover:bg-gray-700 text-purple-400"><ImageIcon size={16} /></button>
//                                 <button onClick={() => addBlock('drawing', index)} className="p-2 hover:bg-gray-700 rounded-r-full text-green-400"><PenTool size={16} /></button>
//                             </div>
//                             </div>
//                         )}

//                       </div>
//                     ))}
//                   </div>
//                 )}
                
//                 {/* Floating Toolbar (Admin Only) */}
//                 {selectedFile.type === 'nickpad' && userRole === 'admin' && (
//                   <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 shadow-2xl rounded-full px-6 py-3 flex gap-6 z-50">
//                     <button onClick={() => addBlock('text', -1)} className="flex flex-col items-center gap-1 text-blue-400 hover:text-blue-300">
//                       <Type size={20} /> <span className="text-[10px]">Text</span>
//                     </button>
//                     <button onClick={() => addBlock('code', -1)} className="flex flex-col items-center gap-1 text-yellow-400 hover:text-yellow-300">
//                       <CodeIcon size={20} /> <span className="text-[10px]">Code</span>
//                     </button>
//                     <button onClick={() => addBlock('image', -1)} className="flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300">
//                       <ImageIcon size={20} /> <span className="text-[10px]">Image</span>
//                     </button>
//                     <button onClick={() => addBlock('drawing', -1)} className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300">
//                       <PenTool size={20} /> <span className="text-[10px]">Draw</span>
//                     </button>
//                   </div>
//                 )}

//                 {/* --- STANDARD CODE EDITOR VIEW --- */}
//                 {selectedFile.type === 'file' && (
//                   <div className="p-4 space-y-4 w-full">
//                     <div>
//                       <label className="block text-sm font-medium mb-2 text-gray-300">Question / Notes</label>
//                       <textarea
//                         value={question}
//                         readOnly={userRole !== 'admin'}
//                         onChange={(e) => setQuestion(e.target.value)}
//                         placeholder="Write your question or requirements here..."
//                         className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-2 text-gray-300">Code</label>
//                       <textarea
//                         value={code}
//                         readOnly={userRole !== 'admin'}
//                         onChange={(e) => setCode(e.target.value)}
//                         className="w-full h-96 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
//                         spellCheck="false"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-2 text-gray-300">Output</label>
//                       <div className="w-full h-48 px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg font-mono text-sm overflow-y-auto whitespace-pre-wrap">
//                         {output || 'Output will appear here...'}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-gray-500">
//               <div className="text-center">
//                 <File size={64} className="mx-auto mb-4 opacity-20" />
//                 <p>Select a file to start</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {notification && (
//         <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white z-50 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
//           {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//           <span>{notification.message}</span>
//         </div>
//       )}

//       {/* Delete Confirmation (Admin Only) */}
//       {itemToDeleteId && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 text-center">
//             <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
//             <h2 className="text-xl font-bold mb-2">Confirm Deletion</h2>
//             <div className="flex gap-3 mt-6">
//               <button onClick={() => setItemToDeleteId(null)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
//               <button onClick={executeDelete} className="flex-1 px-4 py-2 bg-red-600 rounded-lg">Delete</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Modal (Admin Only) */}
//       {showNewItemModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
//             <h2 className="text-xl font-bold mb-4">Create New {newItemType}</h2>
//             {newItemType !== 'nickpad' && (
//               <div className="flex gap-2 mb-4">
//                   <button onClick={() => setNewItemType('folder')} className={`flex-1 py-2 rounded ${newItemType === 'folder' ? 'bg-blue-600' : 'bg-gray-700'}`}>Folder</button>
//                   <button onClick={() => setNewItemType('file')} className={`flex-1 py-2 rounded ${newItemType === 'file' ? 'bg-blue-600' : 'bg-gray-700'}`}>File</button>
//               </div>
//             )}
//             {newItemType === 'file' && (
//                <select value={newFileLanguage} onChange={(e) => setNewFileLanguage(e.target.value)} className="w-full mb-4 px-4 py-2 bg-gray-700 rounded-lg">
//                   <option value="python">Python</option>
//                   <option value="java">Java</option>
//                </select>
//             )}
//             <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 bg-gray-700 rounded-lg mb-4" autoFocus />
//             <div className="flex gap-2">
//               <button onClick={addNewItem} className="flex-1 py-2 bg-blue-600 rounded-lg">Create</button>
//               <button onClick={() => setShowNewItemModal(false)} className="flex-1 py-2 bg-gray-700 rounded-lg">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CodeEditor;


"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Plus, Folder, File, ChevronRight, ChevronDown, Save, Trash2, Loader2, 
  PenTool, Image as ImageIcon, Type, Code as CodeIcon, ArrowUp, ArrowDown, X, 
  CheckCircle, AlertCircle, LogOut, Lock
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- TYPES ---
type BlockType = 'text' | 'image' | 'code' | 'drawing';
type UserRole = 'admin' | 'read_only';

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; 
  language?: string;
}

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'nickpad';
  parent_id: string | null;
  language?: string;
  // Made optional for Lazy Loading
  question?: string;
  code?: string;
  output?: string;
  children?: FileNode[]; 
}

// --- HELPER: Session Timer Hook ---
const useAutoLogout = (logoutFn: () => void) => {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const TIMEOUT_DURATION = 6 * 60 * 60 * 1000; 

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log("Session expired due to inactivity");
        logoutFn();
      }, TIMEOUT_DURATION);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer(); 

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [logoutFn]);
};

// --- COMPONENT: LOGIN SCREEN ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLogin(); 
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center text-gray-100">
      <div className="w-96 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-2xl">
        <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
                <Lock size={32} className="text-white" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Secure Access</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: DRAWING (Optimized with React.memo) ---
const DrawingBlock = React.memo(({ content, onSave, readOnly }: { content: string, onSave: (data: string) => void, readOnly: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(!content && !readOnly); 
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
    if (readOnly) return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoords(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing || readOnly) return;
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
        {!readOnly && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            Edit Diagram
          </button>
        )}
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
});

// --- MAIN COMPONENT ---
const CodeEditor = () => {
  // --- AUTH STATE ---
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('read_only');
  const [authLoading, setAuthLoading] = useState(true);

  // --- APP STATE ---
  const [folders, setFolders] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Selection & Content Loading State
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  
  // Editor State
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // NickPad State
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // UI State
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'folder' | 'file' | 'nickpad'>('folder');
  const [newItemName, setNewItemName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('python');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  // --- AUTH CHECK ---
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (data) {
        setUserRole(data.role as UserRole);
      }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('read_only');
  };

  useAutoLogout(session ? handleLogout : () => {});

  // --- DATA LOADING (OPTIMIZED) ---
  const buildTree = useCallback((data: FileNode[]): FileNode[] => {
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
  }, []);

  const fetchData = async () => {
    if (!session) return;
    try {
      setLoading(true);
      // OPTIMIZATION: ONLY FETCH LIGHTWEIGHT DATA (No 'code' column)
      const { data, error } = await supabase
        .from('files')
        .select('id, name, type, parent_id, language') 
        .order('type', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      setFolders(buildTree(data as FileNode[]));
    } catch (error: any) {
      showNotification('Error fetching: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  // --- LAZY LOAD CONTENT LOGIC ---
  const handleFileSelect = async (item: FileNode) => {
    setSelectedFile(item);
    setFileContentLoading(true);

    try {
        // Fetch heavy content ONLY for this file
        const { data, error } = await supabase
            .from('files')
            .select('code, question, output')
            .eq('id', item.id)
            .single();

        if (error) throw error;

        // Set state based on type
        if (item.type === 'nickpad') {
            try {
                let content = [];
                if (data.code && data.code.trim() !== '') content = JSON.parse(data.code);
                setBlocks((Array.isArray(content) && content.length > 0) ? content : [{ id: Date.now().toString(), type: 'text', content: '' }]);
            } catch (e) {
                setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
            }
        } else {
            setQuestion(data.question || '');
            setCode(data.code || '');
            setOutput(data.output || '');
        }

        // Merge fetched data into selectedFile state so Save works
        setSelectedFile(prev => prev ? { ...prev, ...data } : null);

    } catch (error: any) {
        showNotification('Error loading content', 'error');
    } finally {
        setFileContentLoading(false);
    }
  };


  // --- NOTIFICATIONS ---
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // --- BLOCK ACTIONS ---
  const addBlock = (type: BlockType, index: number) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined
    };
    if (index === -1) {
      setBlocks(prev => [...prev, newBlock]);
    } else {
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    }
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
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < newBlocks.length) {
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    }
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

  // --- DB ACTIONS ---
  const addNewItem = async () => {
    if (userRole !== 'admin') return; 

    if (!newItemName.trim()) return;
    try {
      const newItem = {
        name: newItemName,
        type: newItemType,
        parent_id: selectedFolderId,
        language: newItemType === 'file' ? newFileLanguage : null
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
    if (userRole !== 'admin') return; 

    if (!selectedFile) return;
    try {
      let dataToSave = {};
      if (selectedFile.type === 'nickpad') {
        const jsonContent = JSON.stringify(blocks);
        dataToSave = { code: jsonContent };
      } else {
        dataToSave = { question, code, output };
      }
      
      // Use promise to prevent blocking UI
      supabase.from('files').update(dataToSave).eq('id', selectedFile.id).then(({ error }) => {
          if (error) showNotification('Error saving', 'error');
          else showNotification('Saved successfully!', 'success');
      });
      
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const executeDelete = async () => {
    if (userRole !== 'admin') return; 
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
    if (userRole !== 'admin') return; 
    
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
              
              {/* ADMIN ACTIONS FOR FOLDER */}
              {userRole === 'admin' && (
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFolderId(item.id); setShowNewItemModal(true); }} 
                    className="p-1 text-gray-500 hover:text-white rounded"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setItemToDeleteId(item.id); }} 
                    className="p-1 text-gray-500 hover:text-red-500 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            {expandedFolders[item.id] && item.children && renderTree(item.children, level + 1)}
          </div>
        ) : (
          <div 
            onClick={() => handleFileSelect(item)} // CHANGED: Use Lazy Load function
            className={`flex items-center justify-between group px-3 py-2 hover:bg-gray-700 rounded cursor-pointer ${selectedFile?.id === item.id ? 'bg-gray-700' : ''}`}
          >
            <div className={`flex items-center gap-2 flex-1 ${selectedFile?.id === item.id ? 'text-blue-400' : ''}`}>
              {item.type === 'nickpad' ? <PenTool size={16} className="text-green-400"/> : <File size={16} className="text-blue-400" />}
              <span className="text-sm truncate">{item.name}</span>
            </div>
            {/* ADMIN ACTIONS FOR FILE */}
            {userRole === 'admin' && (
              <button 
                onClick={(e) => { e.stopPropagation(); setItemToDeleteId(item.id); }} 
                className="p-1 text-gray-500 hover:text-red-500 rounded"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    ));
  };

  if (authLoading) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> checking session...</div>;
  if (!session) return <LoginScreen onLogin={checkSession} />;

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col relative">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Code & NickPad
            </h1>
            {userRole === 'read_only' && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full border border-gray-600">Read Only</span>}
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col shrink-0">
          {/* Hide Add Buttons if Read Only */}
          {userRole === 'admin' && (
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
          )}
          <div className="px-2 flex-1 mt-2">{loading ? <div className="text-center p-4"><Loader2 className="animate-spin inline" /></div> : renderTree(folders)}</div>
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
                {/* Hide Actions if Read Only */}
                {userRole === 'admin' && (
                    <div className="flex gap-2">
                        <button onClick={saveFile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"><Save size={16} /> Save</button>
                        {selectedFile.type === 'file' && (
                            <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run
                            </button>
                        )}
                    </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-900 relative">
                
                {/* LOADING SPINNER */}
                {fileContentLoading && (
                    <div className="absolute inset-0 bg-gray-900 z-50 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-400">Loading content...</p>
                        </div>
                    </div>
                )}

                {/* --- NICKPAD VIEW --- */}
                {!fileContentLoading && selectedFile.type === 'nickpad' && (
                  <div className="px-4 py-6 w-full pb-48"> 
                    {blocks.map((block, index) => (
                      <div key={block.id} className="mb-4 group relative pl-8 w-full">
                        
                        {/* Only Admin can Move/Delete blocks */}
                        {userRole === 'admin' && (
                            <div className="absolute left-0 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-gray-700 rounded text-gray-400"><ArrowUp size={12} /></button>
                            <button onClick={() => deleteBlock(index)} className="p-1 hover:bg-red-900 rounded text-red-400"><Trash2 size={12} /></button>
                            <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-gray-700 rounded text-gray-400"><ArrowDown size={12} /></button>
                            </div>
                        )}

                        {block.type === 'text' && (
                          <textarea
                            value={block.content}
                            readOnly={userRole !== 'admin'}
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
                                    readOnly={userRole !== 'admin'}
                                    onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
                                    className="bg-transparent text-right outline-none text-blue-400 w-24"
                                 />
                              </div>
                              <textarea
                                value={block.content}
                                readOnly={userRole !== 'admin'}
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
                                    {userRole === 'admin' && (
                                        <button onClick={() => updateBlock(block.id, '')} className="absolute top-2 right-2 bg-red-600 p-1 rounded-full"><X size={12}/></button>
                                    )}
                                 </div>
                              ) : (
                                 <label className={`cursor-pointer block p-4 ${userRole !== 'admin' ? 'pointer-events-none' : ''}`}>
                                    <ImageIcon className="mx-auto mb-2 text-gray-500" />
                                    <span className="text-sm text-gray-400">{userRole === 'admin' ? 'Click to upload image' : 'Empty Image Block'}</span>
                                    {userRole === 'admin' && <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, block.id)} className="hidden" />}
                                 </label>
                              )}
                           </div>
                        )}

                        {block.type === 'drawing' && (
                           <DrawingBlock 
                              content={block.content} 
                              readOnly={userRole !== 'admin'}
                              onSave={(data) => updateBlock(block.id, data)}
                           />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Floating Toolbar (Admin Only) */}
                {!fileContentLoading && selectedFile.type === 'nickpad' && userRole === 'admin' && (
                  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 shadow-2xl rounded-full px-6 py-3 flex gap-6 z-50">
                    <button onClick={() => addBlock('text', -1)} className="flex flex-col items-center gap-1 text-blue-400 hover:text-blue-300">
                      <Type size={20} /> <span className="text-[10px]">Text</span>
                    </button>
                    <button onClick={() => addBlock('code', -1)} className="flex flex-col items-center gap-1 text-yellow-400 hover:text-yellow-300">
                      <CodeIcon size={20} /> <span className="text-[10px]">Code</span>
                    </button>
                    <button onClick={() => addBlock('image', -1)} className="flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300">
                      <ImageIcon size={20} /> <span className="text-[10px]">Image</span>
                    </button>
                    <button onClick={() => addBlock('drawing', -1)} className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300">
                      <PenTool size={20} /> <span className="text-[10px]">Draw</span>
                    </button>
                  </div>
                )}

                {/* --- STANDARD CODE EDITOR VIEW --- */}
                {!fileContentLoading && selectedFile.type === 'file' && (
                  <div className="p-4 space-y-4 w-full">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Question / Notes</label>
                      <textarea
                        value={question}
                        readOnly={userRole !== 'admin'}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Write your question or requirements here..."
                        className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Code</label>
                      <textarea
                        value={code}
                        readOnly={userRole !== 'admin'}
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

      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white z-50 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation (Admin Only) */}
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

      {/* Create Modal (Admin Only) */}
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