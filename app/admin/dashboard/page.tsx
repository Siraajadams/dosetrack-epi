"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Staff = { id: string; full_name: string; email: string; role: string; is_active: boolean; approval_status: string; professional_category: string | null; sanc_number: string | null; rejection_reason: string | null; email_confirmed: boolean; is_admin: boolean };
type Clinic = { id: string; site_name: string; province: string | null; city: string | null; address: string | null; is_active: boolean };
type Assignment = { nurse_id: string; site_id: string; assigned_at: string };
type Directory = { staff: Staff[]; sites: Clinic[]; assignments: Assignment[] };
type DataRow = Record<string, string | number | boolean | null>;
type Tab = "home" | "staff" | "approval" | "clinics" | "allocation" | "roles" | "catalogue" | "schedule" | "reports" | "stock" | "settings";
const modules: {key: Tab; icon: string; title: string; description: string}[] = [
  {key:"staff",icon:"👥",title:"Healthcare Worker Register",description:"View and correct professional registration numbers"},
  {key:"approval",icon:"✅",title:"Healthcare Worker Approval",description:"Approve or reject pending applications"},
  {key:"clinics",icon:"🏥",title:"Clinic Register",description:"Register and edit participating clinics"},
  {key:"allocation",icon:"🔗",title:"Clinic Allocation",description:"Assign and remove clinic access"},
  {key:"roles",icon:"🛡️",title:"Roles and Permissions",description:"Review shared account roles and access"},
  {key:"catalogue",icon:"💉",title:"Vaccine Catalogue",description:"Correct product names and ICNs; review vial rules"},
  {key:"schedule",icon:"📅",title:"EPI Schedule",description:"Schedule configuration status"},
  {key:"reports",icon:"📊",title:"National Reports",description:"Monthly vaccine usage by clinic, province or nationally"},
  {key:"stock",icon:"📦",title:"National Stock Overview",description:"Vaccine inventory across clinics"},
  {key:"settings",icon:"⚙️",title:"System Settings",description:"Review account and configuration status"},
];
const ui: Record<string,CSSProperties> = {
  main:{minHeight:"100vh",background:"#f5f8fa",color:"#183646",fontFamily:"Arial,sans-serif"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,padding:"20px 5%",background:"white",borderBottom:"1px solid #e2e8f0"},
  wrap:{maxWidth:1400,margin:"auto",padding:24},
  banner:{background:"linear-gradient(135deg,#075762,#1599a7)",color:"white",padding:28,borderRadius:18,marginBottom:24},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:16,margin:"18px 0 32px"},
  card:{padding:22,border:"1px solid #dce5e9",borderRadius:15,background:"white",textAlign:"left",color:"#183646",cursor:"pointer",fontFamily:"inherit"},
  panel:{background:"white",border:"1px solid #dce5e9",padding:20,borderRadius:14,marginBottom:18},
  btn:{padding:"10px 16px",border:0,borderRadius:8,background:"#087e89",color:"white",cursor:"pointer",fontWeight:600,fontSize:14},
  secondary:{padding:"10px 16px",border:"1px solid #b9cdd3",borderRadius:8,background:"white",color:"#075762",cursor:"pointer",fontWeight:600,fontSize:14},
  danger:{padding:"10px 16px",border:"1px solid #f2b5b5",borderRadius:8,background:"#fff5f5",color:"#a32121",cursor:"pointer",fontWeight:600,fontSize:14},
  field:{width:"100%",padding:11,border:"1px solid #cbd5e1",borderRadius:8,boxSizing:"border-box",color:"#183646",background:"white",fontSize:14},
  label:{display:"block",fontSize:13,fontWeight:600,marginBottom:5},
  row:{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"},
  table:{width:"100%",borderCollapse:"collapse",fontSize:14,textAlign:"left"},
  cell:{padding:12,borderBottom:"1px solid #e2e8f0",verticalAlign:"top",textAlign:"left"},
  muted:{color:"#64748b",fontSize:14,lineHeight:1.6},
};
const empty: Directory={staff:[],sites:[],assignments:[]};
const blankClinic={site_name:"",province:"",city:"",address:""};
const provinces=["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
function dateToday(){const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Johannesburg",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());return `${parts.find(x=>x.type==="year")?.value}-${parts.find(x=>x.type==="month")?.value}-${parts.find(x=>x.type==="day")?.value}`;}
function display(value:DataRow[string] | undefined){return value==null?"—":typeof value==="boolean"?(value?"Yes":"No"):String(value);}
function Table({columns,rows}:{columns:[string,string][];rows:DataRow[]}){return <div style={{overflowX:"auto"}}><table style={ui.table}><thead><tr>{columns.map(([key,label])=><th key={key} style={ui.cell}>{label}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{columns.map(([key])=><td key={key} style={ui.cell}>{display(r[key])}</td>)}</tr>)}</tbody></table>{rows.length===0&&<p style={ui.muted}>No records found.</p>}</div>;}

export default function AdminDashboardPage(){
  const router=useRouter();
  const [tab,setTab]=useState<Tab>("home");
  const [directory,setDirectory]=useState<Directory>(empty);
  const [email,setEmail]=useState("");
  const [loading,setLoading]=useState(true);
  const [allowed,setAllowed]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [search,setSearch]=useState("");
  const [staffId,setStaffId]=useState("");
  const [pendingAllocationId,setPendingAllocationId]=useState("");
  const [staffView,setStaffView]=useState<"approved"|"pending">("approved");
  const [stockDiag,setStockDiag]=useState<Record<string,number>|null>(null);
  const [productEdit,setProductEdit]=useState<DataRow|null>(null);
  const [productName,setProductName]=useState("");
  const [productIcn,setProductIcn]=useState("");
  const [productReason,setProductReason]=useState("");
  const [siteId,setSiteId]=useState("");
  const [reviewId,setReviewId]=useState("");
  const [verified,setVerified]=useState(false);
  const [reason,setReason]=useState("");
  const [editId,setEditId]=useState("");
  const [clinic,setClinic]=useState(blankClinic);
  const [rows,setRows]=useState<DataRow[]>([]);
  const [month,setMonth]=useState(()=>dateToday().slice(0,7));
  const [reportProvince,setReportProvince]=useState("");
  const [reportSite,setReportSite]=useState("");
  const [groupBy,setGroupBy]=useState<"clinic"|"province"|"national">("clinic");
  const [reportReady,setReportReady]=useState(false);
  const [registrationEdit,setRegistrationEdit]=useState<Staff|null>(null);
  const [registrationNumber,setRegistrationNumber]=useState("");
  const [registrationReason,setRegistrationReason]=useState("");
  const [registrationVerified,setRegistrationVerified]=useState(false);
  function clearReport(){setRows([]);setReportReady(false);setError("");}
  function beginRegistration(s:Staff){setRegistrationEdit(s);setRegistrationNumber(s.sanc_number||"");setRegistrationReason("");setRegistrationVerified(false);setError("");setMessage("");}
  async function saveRegistration(e:FormEvent){
    e.preventDefault();if(busy||!registrationEdit||!registrationVerified)return;
    setBusy(true);setError("");setMessage("");
    try{
      const {error:e}=await supabase.rpc("epi_admin_update_registration",{p_staff_id:registrationEdit.id,p_registration_number:registrationNumber,p_expected_old:registrationEdit.sanc_number,p_reason:registrationReason,p_verified:registrationVerified});
      if(e)throw new Error(e.message);
      setRegistrationEdit(null);setMessage("Registration number saved. Approval and role are unchanged.");
      try{await refresh();}catch{setError("Saved, but directory refresh failed. Reload before editing again.");}
    }catch(e){setError(e instanceof Error?e.message:"Unable to save registration number");}finally{setBusy(false);}
  }

  async function rpc(action:string,payload:Record<string,unknown>={}){
    const {data,error:e}=await supabase.rpc("epi_admin_portal",{p_action:action,p_payload:payload});
    if(e)throw new Error(e.message);
    return data;
  }
  async function refresh(){setDirectory(await rpc("directory") as Directory);}
  useEffect(()=>{
    let stopped=false;
    async function init(){
      try{
        const {data,error:e}=await supabase.auth.getUser();
        if(stopped)return;
        if(e||!data.user){router.replace("/admin/login");return;}
        const {data:isAdmin,error:roleError}=await supabase.rpc("dt_is_super_admin");
        if(stopped)return;
        if(roleError||isAdmin!==true){router.replace("/admin/login");return;}
        const d=await rpc("directory") as Directory;
        if(stopped)return;
        setDirectory(d);setEmail(data.user.email||"");setAllowed(true);
      }catch(e){if(!stopped)setError(e instanceof Error?e.message:"Unable to load administration");}
      finally{if(!stopped)setLoading(false);}
    }
    void init();return()=>{stopped=true;};
  },[router]);
  async function logout(){
    const {error:e}=await supabase.auth.signOut();
    if(e){setError(e.message);return;}
    setAllowed(false);localStorage.removeItem("epi_selected_site_id");router.replace("/admin/login");
  }
  async function open(next:Tab, preselectStaff="", pendingId=""){
    if(busy)return;
    setTab(next);setSearch("");setRows([]);setError("");setMessage("");setReviewId("");setVerified(false);setReason("");setEditId("");setClinic(blankClinic);setRegistrationEdit(null);setReportReady(false);setStaffId(preselectStaff);setSiteId("");setPendingAllocationId(pendingId);setStaffView("approved");setStockDiag(null);setProductEdit(null);
    if(next==="catalogue"||next==="stock"){
      setBusy(true);
      try{setRows(await rpc(next) as DataRow[]);if(next==="stock")setStockDiag(await rpc("stock_diagnostics") as Record<string,number>);}catch(e){setError(e instanceof Error?e.message:"Unable to load module");}finally{setBusy(false);}
    }
  }
  async function mutate(action:string,payload:Record<string,unknown>,success:string){
    if(busy)return false;
    setBusy(true);setError("");setMessage("");
    try{await rpc(action,payload);setMessage(success);}catch(e){setError(e instanceof Error?e.message:"Action failed");setBusy(false);return false;}
    try{await refresh();}catch(e){setError("Saved, but refresh failed. Reload the page before making further changes.");}
    finally{setBusy(false);}
    return true;
  }
  async function report(e:FormEvent){
    e.preventDefault();if(busy)return;setBusy(true);clearReport();
    try{const {data,error:e}=await supabase.rpc("epi_admin_monthly_usage",{p_month:month+"-01",p_province:reportProvince||null,p_site_id:reportSite||null,p_group_by:groupBy});if(e)throw new Error(e.message);setRows(data as DataRow[]);setReportReady(true);}
    catch(e){setError(e instanceof Error?e.message:"Unable to load report");}finally{setBusy(false);}
  }
  function exportCsv(){
    if(!rows.length)return;
    const keys=Object.keys(rows[0]);
    const quote=(x:unknown)=>{let s=String(x??"");if(/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    const csv=[keys.map(quote).join(","),...rows.map(r=>keys.map(k=>quote(r[k])).join(","))].join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=tab==="reports"?`epi-usage-${month}-${groupBy}.csv`:`epi-${tab}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const eligible=directory.staff.filter(s=>!s.is_admin&&["nurse","healthcare_worker"].includes(s.role.trim().toLowerCase())&&(s.approval_status==="pending"||(s.approval_status==="approved"&&s.is_active===true)));
  const approved=eligible.filter(s=>s.approval_status==="approved"&&s.is_active===true);
  const pending=eligible.filter(s=>s.approval_status==="pending");
  const allocationStaff=[...approved,...pending.filter(s=>s.id===pendingAllocationId)];
  const activeSites=directory.sites.filter(s=>s.is_active===true);
  const match=(...values:(string|null|undefined)[])=>values.some(v=>(v||"").toLowerCase().includes(search.toLowerCase()));
  const nameOf=(id:string)=>directory.sites.find(s=>s.id===id)?.site_name||id;
  const selected=eligible.find(s=>s.id===reviewId);
  const selectedAssignments=directory.assignments.filter(a=>a.nurse_id===staffId);
  const staffRows=(staffView==="pending"?pending:approved).filter(s=>match(s.full_name,s.email,s.role,s.approval_status,s.sanc_number));
  const roleRows=directory.staff.filter(s=>s.approval_status==="approved"&&s.is_active===true&&(s.is_admin||approved.some(w=>w.id===s.id))&&match(s.full_name,s.email,s.role,s.sanc_number));
  const reportProvinces=Array.from(new Set([...provinces,...directory.sites.map(s=>s.province?.trim()||"Not recorded")])).sort();
  const reportSites=directory.sites.filter(s=>!reportProvince||(s.province?.trim()||"Not recorded").toLowerCase()===reportProvince.toLowerCase());
  const reportColumns:[string,string][]=[["month","Month"],...(groupBy!=="national"?[["province","Province"] as [string,string]]:[]),...(groupBy==="clinic"?[["site_name","Clinic"] as [string,string]]:[]),["icn","ICN"],["vaccine","Vaccine"],["funding_source","Funding"],["administration_records","Records"],["doses","Doses administered"]];
  const current=modules.find(m=>m.key===tab);
  if(loading)return <main style={{padding:40}}>Verifying administrator access…</main>;
  if(!allowed)return <main style={{padding:40}}><h2>Access unavailable</h2><p role="alert">{error||"Administrator sign in required."}</p><a href="/admin/login">Return to administrator login</a></main>;
  return <main style={ui.main}>
    <header style={ui.header}><h1 style={{fontSize:28,margin:0}}>DoseTrack <span style={{color:"#087e89"}}>EPI</span></h1><div style={ui.row}><button style={ui.secondary} disabled={busy} onClick={()=>void open("home")}>Dashboard</button><button style={ui.btn} onClick={()=>void logout()}>Sign Out</button></div></header>
    <div style={ui.wrap}>
      <section style={ui.banner}><p style={{fontSize:12,letterSpacing:2}}>EXPANDED PROGRAMME ON IMMUNISATION</p><h1 style={{color:"white",margin:"10px 0"}}>Super Administrator Dashboard</h1><p>{email}</p><p>National programme administration</p></section>
      {error&&<p role="alert" style={{...ui.panel,color:"#a32121",background:"#fff5f5"}}>{error}</p>}
      {message&&<p role="status" style={{...ui.panel,color:"#086b42"}}>{message}</p>}
      {tab==="home"?<>
        <div style={ui.grid}>{[["Approved active healthcare workers",approved.length],["Pending approval",pending.length],["Active clinics",activeSites.length],["Clinic allocations",directory.assignments.length]].map(([label,n])=><div style={ui.panel} key={label}><div style={ui.muted}>{label}</div><h2>{n}</h2></div>)}</div>
        {[["Healthcare Worker and Clinic Management",modules.slice(0,5)],["Programme Administration",modules.slice(5)]].map(([title,list])=><section key={String(title)}><h2>{String(title)}</h2><div style={ui.grid}>{(list as typeof modules).map(m=><button key={m.key} style={ui.card} onClick={()=>void open(m.key)} disabled={busy}><div style={{fontSize:28}}>{m.icon}</div><h3>{m.title}</h3><p style={ui.muted}>{m.description}</p><span style={{color:"#087e89",fontWeight:600}}>Open module →</span></button>)}</div></section>)}
      </>:<>
        <div style={{...ui.row,marginBottom:16}}><button style={ui.secondary} disabled={busy} onClick={()=>void open("home")}>← Back to dashboard</button><h2>{current?.title}</h2></div>
        {busy&&<p role="status">Loading or saving…</p>}
        {(tab==="staff"||tab==="roles"||tab==="clinics"||tab==="catalogue"||tab==="stock")&&<input style={{...ui.field,marginBottom:18}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records" aria-label="Search records"/>}
        {tab==="staff"&&<section style={ui.panel}>
          <div style={ui.row}><button style={staffView==="approved"?ui.btn:ui.secondary} disabled={busy} onClick={()=>{setStaffView("approved");setRegistrationEdit(null);}}>Approved active ({approved.length})</button><button style={staffView==="pending"?ui.btn:ui.secondary} disabled={busy} onClick={()=>{setStaffView("pending");setRegistrationEdit(null);}}>Pending ({pending.length})</button></div><p style={ui.muted}>Rejected and inactive accounts are excluded. Historical records remain in Supabase.</p>
          {registrationEdit&&<form style={{...ui.panel,background:"#f0f9fa"}} onSubmit={saveRegistration}>
            <h3>Correct professional registration number</h3><p>{registrationEdit.full_name} — {registrationEdit.email}</p><p>Current number: {registrationEdit.sanc_number||"Not recorded"}</p>
            <label><span style={ui.label}>New registration number</span><input style={ui.field} required maxLength={100} value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} disabled={busy}/></label>
            <label><span style={{...ui.label,marginTop:12}}>Reason for correction</span><textarea style={ui.field} required maxLength={1000} value={registrationReason} onChange={e=>setRegistrationReason(e.target.value)} disabled={busy}/></label>
            <p><label><input type="checkbox" checked={registrationVerified} onChange={e=>setRegistrationVerified(e.target.checked)} disabled={busy}/> I have independently verified the corrected number with the relevant professional regulator.</label></p>
            <p style={ui.muted}>This updates the shared DoseTrack staff profile, including Family Planning. It does not approve, reactivate or change the role of this worker. The correction is audited.</p>
            <div style={ui.row}><button style={ui.btn} disabled={busy||!registrationVerified||!registrationNumber.trim()||!registrationReason.trim()}>Save registration number</button><button type="button" style={ui.secondary} disabled={busy} onClick={()=>setRegistrationEdit(null)}>Cancel</button></div>
          </form>}
          <div style={{overflowX:"auto"}}><table style={ui.table}><thead><tr>{["Name","Email","Profession","Registration no.","Status","Email verified","Active","Action"].map(h=><th key={h} style={ui.cell}>{h}</th>)}</tr></thead><tbody>{staffRows.map(s=><tr key={s.id}>{[s.full_name,s.email,s.professional_category,s.sanc_number,s.approval_status,s.email_confirmed,s.is_active].map((v,i)=><td key={i} style={ui.cell}>{display(v)}</td>)}<td style={ui.cell}>{eligible.some(w=>w.id===s.id)?<button style={ui.secondary} disabled={busy} onClick={()=>{beginRegistration(s);window.scrollTo({top:0,behavior:"smooth"});}}>Edit</button>:"—"}</td></tr>)}</tbody></table>{!staffRows.length&&<p>No records found.</p>}</div>
          <button style={ui.btn} disabled={busy} onClick={()=>void open("approval")}>Review pending applications</button>
        </section>}
        {tab==="approval"&&<section style={ui.panel}><p style={ui.muted}>Verify professional registration with the relevant regulator. Assign an active clinic before approving a verified email account. Changes affect the shared DoseTrack staff profile.</p><label style={ui.label}>Pending healthcare worker</label><select style={ui.field} value={reviewId} onChange={e=>{setReviewId(e.target.value);setVerified(false);setReason("");}}><option value="">Select applicant ({pending.length})</option>{pending.map(s=><option value={s.id} key={s.id}>{s.full_name} — {s.email}</option>)}</select>{selected&&selected.approval_status==="pending"&&<div style={{marginTop:18}}><h3>{selected.full_name}</h3><p>Email verified: {selected.email_confirmed?"Yes":"No"}</p><p>Profession: {selected.professional_category||"Not recorded"} | Registration: {selected.sanc_number||"Not recorded"}</p><p>Assigned clinics: {directory.assignments.filter(a=>a.nurse_id===selected.id).map(a=>nameOf(a.site_id)).join(", ")||"None"}</p><button style={ui.secondary} disabled={busy} onClick={()=>{void open("allocation",selected.id,selected.id);}}>Allocate clinic</button><p><label><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/> I have independently verified this worker’s professional registration.</label></p><button style={ui.btn} disabled={busy||!verified||!selected.email_confirmed||!directory.assignments.some(a=>a.nurse_id===selected.id&&activeSites.some(s=>s.id===a.site_id))} onClick={()=>void mutate("approve",{staff_id:selected.id,registration_verified:verified},"Healthcare worker approved.")}>Approve healthcare worker</button><hr style={{margin:"24px 0",border:0,borderTop:"1px solid #e2e8f0"}}/><label style={ui.label}>Reason for rejection</label><textarea style={ui.field} value={reason} onChange={e=>setReason(e.target.value)} /><button style={ui.danger} disabled={busy||!reason.trim()} onClick={()=>{if(window.confirm("Reject this pending application in the shared DoseTrack account register?"))void mutate("reject",{staff_id:selected.id,reason},"Application rejected.");}}>Reject application</button></div>}</section>}
        {tab==="clinics"&&<><form style={ui.panel} onSubmit={async e=>{e.preventDefault();if(await mutate(editId?"update_clinic":"create_clinic",{...clinic,site_id:editId||undefined},"Clinic saved.")){setClinic(blankClinic);setEditId("");}}}><h3>{editId?"Edit clinic":"Register clinic"}</h3><p style={ui.muted}>This is the shared clinic master register.</p><div style={ui.grid}>{([["site_name","Clinic name"],["city","City"],["address","Address"]] as const).map(([key,label])=><label key={key}><span style={ui.label}>{label}</span><input required={key==="site_name"} style={ui.field} value={clinic[key]} onChange={e=>setClinic({...clinic,[key]:e.target.value})}/></label>)}<label><span style={ui.label}>Province</span><select style={ui.field} value={clinic.province} onChange={e=>setClinic({...clinic,province:e.target.value})}><option value="">Select province</option>{Array.from(new Set([...provinces,...(clinic.province?[clinic.province]:[])])).map(p=><option key={p}>{p}</option>)}</select></label></div><div style={ui.row}><button style={ui.btn} disabled={busy}>Save clinic</button>{editId&&<button type="button" style={ui.secondary} onClick={()=>{setEditId("");setClinic(blankClinic);}}>Cancel editing</button>}</div></form><section style={ui.panel}><h3>Clinic register ({directory.sites.length})</h3><div style={{overflowX:"auto"}}><table style={ui.table}><thead><tr>{["Clinic","Province","City","Active","Action"].map(v=><th style={ui.cell} key={v}>{v}</th>)}</tr></thead><tbody>{directory.sites.filter(s=>match(s.site_name,s.province,s.city)).map(s=><tr key={s.id}><td style={ui.cell}>{s.site_name}</td><td style={ui.cell}>{s.province}</td><td style={ui.cell}>{s.city}</td><td style={ui.cell}>{s.is_active?"Yes":"No"}</td><td style={ui.cell}><button style={ui.secondary} disabled={busy} onClick={()=>{setEditId(s.id);setClinic({site_name:s.site_name,city:s.city||"",province:s.province||"",address:s.address||""});window.scrollTo({top:0,behavior:"smooth"});}}>Edit</button></td></tr>)}</tbody></table></div></section></>}
        {tab==="allocation"&&<section style={ui.panel}><p style={ui.muted}>Only approved active workers are listed. A pending applicant is available here only when opened from the approval workflow. Changes use the shared clinic allocation table.</p><div style={ui.grid}><label><span style={ui.label}>Healthcare worker</span><select style={ui.field} value={staffId} onChange={e=>setStaffId(e.target.value)}><option value="">Select healthcare worker</option>{allocationStaff.map(s=><option value={s.id} key={s.id}>{s.full_name} ({s.approval_status})</option>)}</select></label><label><span style={ui.label}>Clinic</span><select style={ui.field} value={siteId} onChange={e=>setSiteId(e.target.value)}><option value="">Select active clinic</option>{activeSites.map(s=><option key={s.id} value={s.id}>{s.site_name} — {s.city||s.province||""}</option>)}</select></label></div><button style={ui.btn} disabled={busy||!allocationStaff.some(s=>s.id===staffId)||!siteId} onClick={()=>void mutate("assign",{staff_id:staffId,site_id:siteId},"Clinic allocated.")}>Allocate healthcare worker</button><h3>Current allocations</h3>{staffId&&selectedAssignments.length===0&&<p>No clinics assigned.</p>}{selectedAssignments.map(a=><div key={a.site_id} style={{...ui.row,padding:"12px 0",borderBottom:"1px solid #e2e8f0",justifyContent:"space-between"}}><span>{nameOf(a.site_id)}</span><button style={ui.danger} disabled={busy} onClick={()=>{if(window.confirm("Remove this shared clinic allocation?"))void mutate("unassign",{staff_id:staffId,site_id:a.site_id},"Clinic allocation removed.");}}>Remove</button></div>)}<p><button style={ui.secondary} disabled={busy} onClick={()=>void open("approval")}>Return to approvals</button></p></section>}
        {tab==="roles"&&<section style={ui.panel}><p style={ui.muted}>Active approved healthcare workers and administrators only. Clinical access is managed through clinic allocation. Shared role changes and administrator promotion are not enabled here.</p><Table columns={[["full_name","Name"],["email","Email"],["role","Stored role"],["is_admin","Administrator"],["approval_status","Approval"],["is_active","Active"]]} rows={roleRows}/><h3>Manage clinical access</h3><div style={{overflowX:"auto"}}><table style={ui.table}><thead><tr><th style={ui.cell}>Worker</th><th style={ui.cell}>Assigned clinics</th><th style={ui.cell}>Action</th></tr></thead><tbody>{approved.filter(s=>match(s.full_name,s.email,s.sanc_number)).map(s=><tr key={s.id}><td style={ui.cell}>{s.full_name}</td><td style={ui.cell}>{directory.assignments.filter(a=>a.nurse_id===s.id).map(a=>nameOf(a.site_id)).join(", ")||"None"}</td><td style={ui.cell}><button style={ui.secondary} disabled={busy} onClick={()=>void open("allocation",s.id)}>Manage clinic access</button></td></tr>)}</tbody></table></div></section>}
        {tab==="catalogue"&&<section style={ui.panel}>
          <p style={ui.muted}>Correct product identity only (name and ICN). Changes affect labels in historical reports. Do not repurpose a product for a different vaccine. Activation, dose counts and vial rules require separate clinical validation.</p>
          {productEdit&&<form style={ui.panel} onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError("");setMessage("");try{await rpc("update_catalogue_identity",{product_id:productEdit.id,expected_name:productEdit.name,expected_icn:productEdit.icn,name:productName,icn:productIcn,reason:productReason});setProductEdit(null);setMessage("Product identity saved.");try{setRows(await rpc("catalogue") as DataRow[]);}catch{setError("Saved, but refresh failed. Reopen the catalogue.");}}catch(e){setError(e instanceof Error?e.message:"Unable to save product");}finally{setBusy(false);}}}>
            <h3>Correct catalogue identity</h3><label style={ui.label}>Product name<input style={ui.field} required maxLength={200} value={productName} onChange={e=>setProductName(e.target.value)} disabled={busy}/></label><label style={ui.label}>ICN<input style={ui.field} maxLength={100} value={productIcn} onChange={e=>setProductIcn(e.target.value)} disabled={busy}/></label><label style={ui.label}>Reason for correction<textarea style={ui.field} required maxLength={1000} value={productReason} onChange={e=>setProductReason(e.target.value)} disabled={busy}/></label><div style={ui.row}><button style={ui.btn} disabled={busy||!productName.trim()||!productReason.trim()}>Save correction</button><button type="button" style={ui.secondary} disabled={busy} onClick={()=>setProductEdit(null)}>Cancel</button></div>
          </form>}
          <p>Active products: {rows.filter(r=>r.active===true).length} / {rows.length}</p>
          <div style={{overflowX:"auto"}}><table style={ui.table}><thead><tr>{["ICN","Product","Stock unit","Doses/unit","Active","Open vial minutes","Vial rules verified","Reference","Action"].map(h=><th key={h} style={ui.cell}>{h}</th>)}</tr></thead><tbody>{rows.filter(r=>match(String(r.name||""),String(r.icn||""))).map(r=><tr key={String(r.id)}>{[r.icn,r.name,r.stock_unit,r.doses_per_unit,r.active,r.open_vial_minutes,r.vial_rules_verified,r.vial_rules_reference].map((v,i)=><td key={i} style={ui.cell}>{display(v)}</td>)}<td style={ui.cell}><button style={ui.secondary} disabled={busy} onClick={()=>{setProductEdit(r);setProductName(String(r.name||""));setProductIcn(String(r.icn||""));setProductReason("");window.scrollTo({top:0,behavior:"smooth"});}}>Edit</button></td></tr>)}</tbody></table></div><button style={ui.secondary} disabled={busy||!rows.length} onClick={exportCsv}>Export catalogue CSV</button></section>}
        {tab==="schedule"&&<section style={ui.panel}><h3>Schedule configuration not connected</h3><p>No dedicated EPI schedule table was present in the supplied schema. The existing administration workflow accepts the next appointment date. This module will require a versioned, clinically verified schedule and integration with that workflow before automatic scheduling is enabled.</p></section>}
        {tab==="reports"&&<section style={ui.panel}>
          <h3>Monthly vaccine usage report</h3>
          <form onSubmit={report}>
            <div style={ui.grid}>
              <label><span style={ui.label}>Reporting month</span><input type="month" required style={ui.field} value={month} disabled={busy} onChange={e=>{setMonth(e.target.value);clearReport();}}/></label>
              <label><span style={ui.label}>Province</span><select style={ui.field} value={reportProvince} disabled={busy} onChange={e=>{setReportProvince(e.target.value);setReportSite("");clearReport();}}><option value="">All provinces</option>{reportProvinces.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
              <label><span style={ui.label}>Clinic</span><select style={ui.field} value={reportSite} disabled={busy} onChange={e=>{setReportSite(e.target.value);clearReport();}}><option value="">All clinics</option>{reportSites.map(s=><option key={s.id} value={s.id}>{s.site_name} — {s.province||"Not recorded"}</option>)}</select></label>
              <label><span style={ui.label}>Group report by</span><select style={ui.field} value={groupBy} disabled={busy} onChange={e=>{setGroupBy(e.target.value as typeof groupBy);clearReport();}}><option value="clinic">Clinic</option><option value="province">Province totals</option><option value="national">Combined totals</option></select></label>
            </div>
            <div style={ui.row}><button style={ui.btn} disabled={busy}>Run usage report</button><button type="button" style={ui.secondary} disabled={busy||!reportReady||!rows.length} onClick={exportCsv}>Export CSV</button></div>
          </form>
          {reportReady&&<><div style={ui.grid}>{[["Total doses administered",rows.reduce((sum,r)=>sum+Number(r.doses||0),0)],["Administration records",rows.reduce((sum,r)=>sum+Number(r.administration_records||0),0)]].map(([label,n])=><div style={ui.panel} key={label}><p style={ui.muted}>{label}</p><h2>{n}</h2></div>)}</div><p><strong>{month}</strong> | {reportProvince||"All provinces"} | {reportSite?nameOf(reportSite):"All clinics"}</p><Table columns={reportColumns} rows={rows}/>{!rows.length&&<p>No vaccine administrations were recorded for this selection.</p>}</>}
          {!reportReady&&!busy&&<p style={ui.muted}>Select your month and reporting scope, then run the report.</p>}
          <p style={ui.muted}>Usage is the quantity of recorded administrations during the selected calendar month (South African local time). This is not stock received, stock wasted, unique patients or population coverage. Clinics with no recorded administrations do not appear in the detail rows. Historical records use the clinic’s current province. No patient identifiers are returned.</p>
        </section>}
        {tab==="stock"&&<section style={ui.panel}>
          <button style={ui.secondary} disabled={busy} onClick={()=>void open("stock")}>Refresh stock overview</button>
          {stockDiag&&<><div style={ui.grid}>{[["Stock batches",stockDiag.batches],["Stock movements",stockDiag.movements],["Summary rows",stockDiag.summary_rows],["Active products",stockDiag.active_products]].map(([label,n])=><div key={label} style={ui.panel}><p style={ui.muted}>{label}</p><h2>{n}</h2></div>)}</div>{stockDiag.summary_rows===0&&<p role="status" style={ui.muted}>{stockDiag.batches===0&&stockDiag.movements===0?"No EPI stock batches or movements are recorded. Receive verified vaccine stock in the clinical portal before reporting balances.":"Stock records exist but the summary returns no rows. Check the stock summary view and reporting permissions before relying on these balances."}</p>}{stockDiag.active_products===0&&<p style={ui.muted}>No catalogue products are active. Clinical validation and activation are required before stock can be received.</p>}</>}
<p style={ui.muted}>Stock quantities use each product’s stock unit. Nominal doses are not the same as usable doses in open vials.</p><Table columns={[["site_name","Clinic"],["province","Province"],["product_name","Vaccine"],["funding_source","Funding"],["stock_unit","Unit"],["closing_balance","Closing"],["available_units","Available"],["available_nominal_doses","Nominal doses"],["expired_units","Expired"],["expiring_units","Expiring"]]} rows={rows.filter(r=>match(String(r.site_name||""),String(r.product_name||""),String(r.province||"")))}/><button style={ui.secondary} disabled={busy||!rows.length} onClick={exportCsv}>Export stock CSV</button></section>}
        {tab==="settings"&&<section style={ui.panel}><h3>Current configuration</h3><p>Signed-in administrator: {email}</p><p>Approved active healthcare workers: {approved.length}</p><p>Pending applications: {pending.length}</p><p>Active approved administrators: {directory.staff.filter(s=>s.is_admin&&s.is_active&&s.approval_status==="approved").length}</p><p>Active clinic records: {activeSites.length}</p><p>Clinical portal: <a href="/dashboard">/dashboard</a></p><p>Authentication, staff and clinics: shared DoseTrack records</p><p>EPI clinical records and stock: separate EPI tables</p><p style={ui.muted}>Configuration summary. No credentials or privileged role settings are exposed.</p><button style={ui.secondary} disabled={busy} onClick={async()=>{setBusy(true);setError("");setMessage("");try{await refresh();setMessage("Configuration refreshed.");}catch(e){setError(e instanceof Error?e.message:"Refresh failed");}finally{setBusy(false);}}}>Refresh configuration</button></section>}
      </>}
      <footer style={{...ui.muted,textAlign:"center",padding:20}}>DoseTrack EPI | National Administration</footer>
    </div>
  </main>;
}
