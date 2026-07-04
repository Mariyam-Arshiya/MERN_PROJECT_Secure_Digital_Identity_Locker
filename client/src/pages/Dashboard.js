import React,{useContext,useEffect,useMemo,useState} from "react";

import API from "../api/axios";

import {AuthContext} from "../context/AuthContext";

const emptyForm={
title:"",
type:"Aadhar",
fileUrl:"",
content:"",
notes:"",
category:"Government",
tags:"",
expiresAt:""
};

function Dashboard(){

const {user,setUser}=useContext(AuthContext);

const [documents,setDocuments]=useState([]);
const [logs,setLogs]=useState([]);
const [form,setForm]=useState(emptyForm);
const [editingId,setEditingId]=useState("");
const [loading,setLoading]=useState(false);
const [toast,setToast]=useState("");
const [mask,setMask]=useState(true);
const [search,setSearch]=useState("");
const [category,setCategory]=useState("");
const [sortBy,setSortBy]=useState("createdAt");
const [page,setPage]=useState(1);
const [pages,setPages]=useState(1);
const [uploadProgress,setUploadProgress]=useState(0);
const [unlockPassword,setUnlockPassword]=useState("");
const [shareLink,setShareLink]=useState("");

const vaultLocked=user?.vaultLocked;

const stats=useMemo(()=>{
return {
total:documents.length,
expiring:documents.filter((item)=>item.expiresAt).length,
files:documents.filter((item)=>item.fileUrl).length
};
},[documents]);

useEffect(()=>{
if(!vaultLocked){
loadDocuments();
loadLogs();
}
// eslint-disable-next-line react-hooks/exhaustive-deps
},[page,search,category,sortBy,vaultLocked]);

useEffect(()=>{
if(!toast) return;
const timeout=setTimeout(()=>setToast(""),3000);
return ()=>clearTimeout(timeout);
},[toast]);

const loadDocuments=async()=>{
setLoading(true);
try{
const res=await API.get("/documents",{
params:{
page,
search,
category,
sortBy,
limit:8
}
});
setDocuments(res.data.documents);
setPages(res.data.pages || 1);
}catch(error){
setToast(error.response?.data?.message || "Could not load vault");
}
setLoading(false);
};

const loadLogs=async()=>{
try{
const res=await API.get("/logs");
setLogs(res.data.logs);
}catch(error){
setLogs([]);
}
};

const saveDocument=async(e)=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
tags:form.tags.split(",").map((tag)=>tag.trim()).filter(Boolean),
expiresAt:form.expiresAt || null
};

if(editingId){
await API.put(`/documents/${editingId}`,payload);
setToast("Document updated securely");
}else{
await API.post("/documents",payload);
setToast("Document added to encrypted vault");
}

setForm(emptyForm);
setEditingId("");
loadDocuments();
loadLogs();
}catch(error){
setToast(error.response?.data?.message || "Save failed");
}
setLoading(false);
};

const editDocument=(doc)=>{
setEditingId(doc.id);
setForm({
title:doc.title,
type:doc.type,
fileUrl:doc.fileUrl || "",
content:doc.content || "",
notes:doc.notes || "",
category:doc.category || "Personal",
tags:(doc.tags || []).join(", "),
expiresAt:doc.expiresAt ? doc.expiresAt.slice(0,16) : ""
});
window.scrollTo({top:0,behavior:"smooth"});
};

const deleteDocument=async(id)=>{
await API.delete(`/documents/${id}`);
setToast("Document deleted");
loadDocuments();
loadLogs();
};

const lockVault=async()=>{
const res=await API.post("/auth/vault/lock");
setUser(res.data.user);
setToast("Vault locked");
};

const unlockVault=async(e)=>{
e.preventDefault();
try{
const res=await API.post("/auth/vault/unlock",{password:unlockPassword});
setUser(res.data.user);
setUnlockPassword("");
setToast("Vault unlocked");
}catch(error){
setToast(error.response?.data?.message || "Unlock failed");
}
};

const togglePrivateMode=async()=>{
const res=await API.patch("/auth/private-mode",{privateMode:!user.privateMode});
setUser(res.data.user);
setToast(res.data.user.privateMode ? "Private mode enabled" : "Private mode disabled");
loadLogs();
};

const uploadFile=async(file)=>{
if(!file) return;

const body=new FormData();
body.append("file",file);
setUploadProgress(5);

try{
const res=await API.post("/documents/upload",body,{
headers:{
"Content-Type":"multipart/form-data"
},
onUploadProgress:(event)=>{
const percent=Math.round((event.loaded * 100) / event.total);
setUploadProgress(percent);
}
});
setForm((current)=>({
...current,
fileUrl:res.data.fileUrl,
title:current.title || res.data.originalName
}));
setToast("File uploaded");
}catch(error){
setToast(error.response?.data?.message || "Upload failed");
}
};

const createShareLink=async(id)=>{
const res=await API.post(`/documents/${id}/share`,{
minutes:15,
maxViews:1
});
setShareLink(res.data.shareUrl);
setToast("One-time secure share link created");
};

const maskValue=(value,type)=>{
if(!mask || !value) return value;
if(type === "Aadhar") return value.replace(/\d(?=\d{4})/g,"X");
if(value.length <= 4) return "XXXX";
return `${"X".repeat(Math.max(value.length - 4,4))}${value.slice(-4)}`;
};

return(
<main className="locker-page">

{toast && <div className="toast">{toast}</div>}

<section className="dashboard-header">
<div>
<span className="eyebrow">Encrypted MERN Vault</span>
<h1>Secure Digital Identity Locker</h1>
<p>Store, mask, search, expire and share sensitive identity documents with user-level access control.</p>
</div>

<div className="header-actions">
<button type="button" className="secondary-button" onClick={()=>setMask(!mask)}>
{mask ? "Show Sensitive Data" : "Mask Sensitive Data"}
</button>
<button type="button" className="secondary-button" onClick={togglePrivateMode}>
{user?.privateMode ? "Disable Private Mode" : "Enable Private Mode"}
</button>
<button type="button" onClick={lockVault}>Lock Vault</button>
</div>
</section>

{vaultLocked ? (
<section className="locked-panel">
<h2>Vault locked</h2>
<p>Password re-entry is required before encrypted document data can be viewed.</p>
<form onSubmit={unlockVault} className="unlock-form">
<input
type="password"
placeholder="Re-enter password"
value={unlockPassword}
onChange={(e)=>setUnlockPassword(e.target.value)}
/>
<button type="submit">Unlock Vault</button>
</form>
</section>
) : (
<>
<section className="stat-grid">
<div>
<span>Total Documents</span>
<strong>{stats.total}</strong>
</div>
<div>
<span>Self-Destruct Enabled</span>
<strong>{stats.expiring}</strong>
</div>
<div>
<span>Uploaded Files</span>
<strong>{stats.files}</strong>
</div>
<div>
<span>Private Mode</span>
<strong>{user?.privateMode ? "On" : "Off"}</strong>
</div>
</section>

<section className="workspace">
<form className="document-form" onSubmit={saveDocument}>
<h2>{editingId ? "Edit Document" : "Add Document"}</h2>

<div className="form-grid">
<input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required/>
<select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
<option>Aadhar</option>
<option>Passport</option>
<option>Certificate</option>
<option>License</option>
<option>Bank</option>
<option>Other</option>
</select>
<select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
<option>Government</option>
<option>Education</option>
<option>Personal</option>
<option>Finance</option>
<option>Medical</option>
</select>
<input type="datetime-local" value={form.expiresAt} onChange={(e)=>setForm({...form,expiresAt:e.target.value})}/>
</div>

<textarea placeholder="Document content or identity number" value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})}/>
<textarea placeholder="Private notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/>
<input placeholder="Tags separated by comma" value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})}/>

<label
className="drop-zone"
onDragOver={(e)=>e.preventDefault()}
onDrop={(e)=>{
e.preventDefault();
uploadFile(e.dataTransfer.files[0]);
}}
>
<input type="file" accept="image/*,.pdf,.doc,.docx" capture="environment" onChange={(e)=>uploadFile(e.target.files[0])}/>
<span>Drag and drop upload, choose file, or use camera on supported devices</span>
{form.fileUrl && <b>{form.fileUrl}</b>}
{uploadProgress > 0 && uploadProgress < 100 && <progress value={uploadProgress} max="100"/>}
</label>

<div className="form-actions">
<button type="submit" disabled={loading}>{editingId ? "Update Document" : "Save Document"}</button>
{editingId && <button type="button" className="secondary-button" onClick={()=>{setEditingId("");setForm(emptyForm);}}>Cancel</button>}
</div>
</form>

<aside className="activity-panel">
<h2>Access Logs</h2>
{logs.length === 0 ? <p>No activity logs available.</p> : logs.map((log)=>(
<div className="log-row" key={log._id}>
<strong>{log.action}</strong>
<span>{new Date(log.createdAt).toLocaleString()}</span>
<small>{log.ipAddress}</small>
</div>
))}
</aside>
</section>

<section className="filters">
<input placeholder="Search by title, type, tags or notes" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
<select value={category} onChange={(e)=>{setCategory(e.target.value);setPage(1);}}>
<option value="">All Categories</option>
<option>Government</option>
<option>Education</option>
<option>Personal</option>
<option>Finance</option>
<option>Medical</option>
</select>
<select value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
<option value="createdAt">Newest</option>
<option value="title">Title</option>
<option value="type">Type</option>
<option value="expiresAt">Expiration</option>
</select>
</section>

{shareLink && (
<section className="share-banner">
<span>One-time link:</span>
<input readOnly value={shareLink}/>
</section>
)}

<section className="document-grid">
{loading ? <div className="page-state">Loading vault...</div> : documents.map((doc)=>(
<article className="document-card" key={doc.id}>
<div className="card-top">
<span>{doc.type}</span>
<small>{doc.category}</small>
</div>
<h3>{doc.title}</h3>
<p>{maskValue(doc.content,doc.type)}</p>
<p className="notes">{mask ? "Private notes hidden" : doc.notes}</p>
<div className="tag-row">
{doc.tags.map((tag)=><span key={tag}>{tag}</span>)}
</div>
{doc.fileUrl && <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noreferrer">Open uploaded file</a>}
{doc.expiresAt && <small>Expires {new Date(doc.expiresAt).toLocaleString()}</small>}
<div className="card-actions">
<button type="button" className="secondary-button" onClick={()=>editDocument(doc)}>Edit</button>
<button type="button" className="secondary-button" onClick={()=>createShareLink(doc.id)}>Share</button>
<button type="button" className="danger-button" onClick={()=>deleteDocument(doc.id)}>Delete</button>
</div>
</article>
))}
</section>

<div className="pagination">
<button type="button" className="secondary-button" disabled={page === 1} onClick={()=>setPage(page - 1)}>Previous</button>
<span>Page {page} of {pages}</span>
<button type="button" className="secondary-button" disabled={page === pages} onClick={()=>setPage(page + 1)}>Next</button>
</div>
</>
)}

</main>
);

}

export default Dashboard;
