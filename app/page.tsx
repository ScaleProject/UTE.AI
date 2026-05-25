"use client";
import { useEffect, useState, useRef, useCallback, createContext, useContext } from "react";
import Image from "next/image";

const UTE_LOGO    = "https://ute.edu.ec/wp-content/uploads/2025/09/logo-univ-ute_blanco.png";
const METRICS_URL = "https://scale-project-n8n.jfigq5.easypanel.host/webhook/sky-metricas";
const CONVOS_URL  = "https://scale-project-n8n.jfigq5.easypanel.host/webhook/sky-conversaciones";
const MAT_USD     = 3200;

interface BPCtx { isMobile: boolean; isTablet: boolean; }
const BP = createContext<BPCtx>({ isMobile: false, isTablet: false });
const useBP = () => useContext(BP);

interface Metrics {
  conversaciones_hoy: number; leads_calificados: number;
  visitas_solicitadas: number; matriculas_iniciadas: number;
  total_leads: number; tasa_calificacion: number;
  leads_escribieron: number; conversaciones_sky: number;
}
interface ConvoMsg { type:"in"|"out"; content:string; created_at:string; }
interface Convo { id:number; contact_name:string; status:string; created_at:string; messages:ConvoMsg[]; response_time_s:number; }

const NAV = [
  { id:"stats",   icon:"📊", label:"Estadísticas en vivo", mLabel:"Live",    badge:"LIVE" },
  { id:"charts",  icon:"📈", label:"Gráficos & CAC",       mLabel:"Gráficos"              },
  { id:"sky",     icon:"🤖", label:"Funciones de SKY",     mLabel:"SKY"                   },
  { id:"convo",   icon:"💬", label:"Conversaciones",        mLabel:"Chats"                 },
  { id:"roi",     icon:"💰", label:"ROI & Proyecciones",   mLabel:"ROI"                   },
  { id:"funnel",  icon:"🎯", label:"Pipeline de leads",    mLabel:"Pipeline"              },
  { id:"compare", icon:"⚡", label:"Antes vs Ahora",        mLabel:"Impacto"               },
];

/* ── HOOKS ── */
function useWindowSize() {
  const [w, setW] = useState(1200);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}
function useCountUp(target:number, ms=1300) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps=55, inc=target/steps, delay=ms/steps;
    let cur=0;
    const t=setInterval(()=>{cur=Math.min(cur+inc,target);setV(Math.floor(cur));if(cur>=target)clearInterval(t);},delay);
    return ()=>clearInterval(t);
  },[target,ms]);
  return v;
}
function useConversations() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const fetch_ = useCallback(async()=>{
    try{ const r=await fetch(CONVOS_URL,{cache:"no-store"});const d=await r.json();setConvos(d.conversations??[]); }catch{}
  },[]);
  useEffect(()=>{fetch_();const t=setInterval(fetch_,30000);return()=>clearInterval(t);},[fetch_]);
  return convos;
}
function useClock() {
  const [t, setT] = useState("");
  useEffect(()=>{
    const f=()=>new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    setT(f());const id=setInterval(()=>setT(f()),1000);return()=>clearInterval(id);
  },[]);
  return t;
}
function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics|null>(null);
  const [countdown, setCountdown] = useState(15);
  const [lastSync, setLastSync] = useState("");
  const fetch_=useCallback(async()=>{
    try{ const r=await fetch(METRICS_URL,{cache:"no-store"});const d=await r.json();setMetrics(d);setLastSync(new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}));setCountdown(15); }catch{}
  },[]);
  useEffect(()=>{fetch_();const t=setInterval(fetch_,15000);return()=>clearInterval(t);},[fetch_]);
  useEffect(()=>{const t=setInterval(()=>setCountdown(c=>c<=1?15:c-1),1000);return()=>clearInterval(t);},[]);
  return {metrics,countdown,lastSync};
}

/* ── MOBILE BOTTOM NAV ── */
function MobileBottomNav({active, onSelect}:{active:string; onSelect:(id:string)=>void}) {
  return (
    <nav className="mobile-bottom-nav">
      {NAV.map(item => {
        const on = active === item.id;
        return (
          <button key={item.id} onClick={()=>onSelect(item.id)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:3,padding:"7px 13px",minWidth:58,flexShrink:0,
            background:"none",border:"none",cursor:"pointer",
            borderTop: on ? "2.5px solid var(--ute-green)" : "2.5px solid transparent",
            paddingTop: on ? 4.5 : 7, position:"relative",
          }}>
            <span style={{fontSize:"1.1rem",lineHeight:1}}>{item.icon}</span>
            <span style={{fontSize:".47rem",fontWeight:on?700:500,color:on?"var(--ute-green)":"rgba(255,255,255,.5)",lineHeight:1.2,textAlign:"center",whiteSpace:"nowrap"}}>
              {item.mLabel}
            </span>
            {item.badge && on && (
              <div style={{position:"absolute",top:4,right:8,width:6,height:6,borderRadius:"50%",background:"var(--ute-green)",boxShadow:"0 0 6px rgba(153,202,60,.8)"}}/>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ── FLOW DIAGRAM ── */
function FlowDiagram() {
  const [active, setActive] = useState(0);
  const steps = [
    {i:"💬",l:"WhatsApp",  s:"Mensaje del prospecto", c:"#25D366"},
    {i:"🤖",l:"SKY · IA",  s:"Claude procesa",         c:"#0256A0"},
    {i:"⚡",l:"Responde",   s:"En menos de 10s",         c:"#0256A0"},
    {i:"📊",l:"CRM",        s:"Lead actualizado",         c:"#FF5421"},
    {i:"🔔",l:"Equipo UTE", s:"Notificación",             c:"#99CA3C"},
  ];
  useEffect(()=>{const t=setInterval(()=>setActive(a=>(a+1)%steps.length),1800);return()=>clearInterval(t);},[]);
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",alignItems:"center",minWidth:460}}>
        {steps.flatMap((s,i)=>{
          const isActive=active===i;
          const items=[
            <div key={s.l} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:6,
              padding:"14px 10px",borderRadius:12,minWidth:90,textAlign:"center",flexShrink:0,
              background:isActive?`${s.c}10`:"var(--bg)",
              border:`1.5px solid ${isActive?s.c:"var(--border)"}`,
              boxShadow:isActive?`0 4px 18px ${s.c}20`:"none",
              transition:"all .4s ease",
            }}>
              <div style={{fontSize:"1.2rem"}}>{s.i}</div>
              <div style={{fontSize:".7rem",fontWeight:700,color:isActive?s.c:"var(--text)"}}>{s.l}</div>
              <div style={{fontSize:".57rem",color:"var(--text-sub)",lineHeight:1.4}}>{s.s}</div>
            </div>
          ];
          if(i<steps.length-1) items.push(
            <div key={`a${i}`} style={{flex:"0 0 20px",display:"flex",alignItems:"center",justifyContent:"center",
              color:isActive?"var(--ute-blue)":"var(--border-d)",fontSize:"1.1rem",fontWeight:700,transition:"color .4s",flexShrink:0}}>›</div>
          );
          return items;
        })}
      </div>
    </div>
  );
}

/* ── TOP BAR ── */
function TopBar({title,sub,right}:{title:string;sub:string;right?:React.ReactNode}) {
  const {isMobile} = useBP();
  return (
    <div className="page-header">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
        <div style={{minWidth:0}}>
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
        {right && !isMobile && <div style={{flexShrink:0}}>{right}</div>}
        {right && isMobile && (
          <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:99,background:"rgba(153,202,60,.1)",border:"1px solid rgba(153,202,60,.28)"}}>
            <div className="live-dot" style={{width:5,height:5}}/>
            <span style={{fontSize:".58rem",fontWeight:800,color:"#4a8c00"}}>EN VIVO</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── VIEW: ESTADÍSTICAS ── */
function ViewStats({metrics,countdown,lastSync}:{metrics:Metrics|null;countdown:number;lastSync:string}) {
  const {isMobile} = useBP();
  const leads = useCountUp(metrics?.leads_calificados??0,1500);
  const vis   = useCountUp(metrics?.visitas_solicitadas??0,1700);
  const mats  = useCountUp(metrics?.matriculas_iniciadas??0,1900);
  const esc   = useCountUp(metrics?.leads_escribieron??0,1100);
  const sky   = useCountUp(metrics?.conversaciones_sky??0,1100);
  const [bar,setBar] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setBar(true),500);return()=>clearTimeout(t);},[]);

  const tiles = [
    {l:"Leads calificados",  v:leads, c:"#5a9200", i:"✅", s:"5 preguntas completadas"},
    {l:"Visitas agendadas",  v:vis,   c:"#c87000", i:"🗓", s:"Campus Quito Matriz"},
    {l:"Procesos matrícula", v:mats,  c:"#6d3bbd", i:"🚀", s:"Estudiantes confirmados"},
  ];
  const numSz = isMobile ? "1.7rem" : "2.2rem";

  return (
    <div>
      <TopBar title="Estadísticas en vivo"
        sub={`Período 2026-2 · Datos en tiempo real${lastSync?` · ${lastSync}`:""}`}
        right={
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div className="countdown-badge">⏱ {countdown}s</div>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:"rgba(153,202,60,.1)",border:"1px solid rgba(153,202,60,.28)"}}>
              <div className="live-dot"/>
              <span style={{fontSize:".6rem",fontWeight:800,color:"#4a8c00",letterSpacing:".08em"}}>EN VIVO</span>
            </div>
          </div>
        }
      />
      <div className="page-body">
        {(()=>{
          const rawEsc=metrics?.leads_escribieron??0;
          const rawSky=metrics?.conversaciones_sky??0;
          const equal=rawEsc>0&&rawEsc===rawSky;
          return (
            <div className="fade-in d1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div className="metric-tile" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 14px",border:"1.5px solid #0256A020",background:"#0256A004"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:numSz,fontWeight:900,letterSpacing:"-.04em",color:"#0256A0",lineHeight:1}}>{esc.toLocaleString()}</div>
                  <div style={{fontSize:isMobile?".7rem":".78rem",fontWeight:600,color:"var(--text)",marginTop:5}}>Leads que escribieron</div>
                  <div style={{fontSize:".62rem",color:"var(--text-sub)",marginTop:2}}>Mensajes entrantes</div>
                </div>
                {!isMobile && <div style={{fontSize:"1.7rem",flexShrink:0}}>📩</div>}
              </div>
              <div className="metric-tile" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 14px",border:"1.5px solid #4a8c0020",background:"#4a8c0004"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:numSz,fontWeight:900,letterSpacing:"-.04em",color:"#4a8c00",lineHeight:1}}>{sky.toLocaleString()}</div>
                  <div style={{fontSize:isMobile?".7rem":".78rem",fontWeight:600,color:"var(--text)",marginTop:5}}>Conversaciones SKY</div>
                  <div style={{fontSize:".62rem",color:"var(--text-sub)",marginTop:2}}>SKY respondió</div>
                </div>
                <div style={{flexShrink:0,textAlign:"center"}}>
                  {!isMobile && <div style={{fontSize:"1.7rem"}}>🤖</div>}
                  {equal&&<div style={{marginTop:isMobile?0:5,fontSize:".55rem",fontWeight:800,padding:"2px 7px",borderRadius:99,background:"rgba(153,202,60,.12)",border:"1px solid rgba(153,202,60,.3)",color:"#4a8c00",whiteSpace:"nowrap"}}>✓ IGUALES</div>}
                  {!equal&&rawEsc>0&&<div style={{marginTop:isMobile?0:5,fontSize:".55rem",fontWeight:800,padding:"2px 7px",borderRadius:99,background:"rgba(255,84,33,.1)",border:"1px solid rgba(255,84,33,.25)",color:"var(--ute-orange)",whiteSpace:"nowrap"}}>⚠ REVISAR</div>}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:12,marginBottom:16}}>
          {tiles.map((t,i)=>(
            <div key={t.l} className={`metric-tile fade-in d${i+1}`}>
              <div style={{fontSize:"1.3rem",marginBottom:10}}>{t.i}</div>
              <div className="tile-num" style={{color:t.c,marginBottom:6}}>{t.v.toLocaleString()}</div>
              <div style={{fontSize:isMobile?".7rem":".8rem",fontWeight:600,color:"var(--text)"}}>{t.l}</div>
              <div style={{fontSize:".64rem",color:"var(--text-sub)",marginTop:2}}>{t.s}</div>
            </div>
          ))}
        </div>

        <div className="card fade-in d3" style={{padding:isMobile?"14px 14px":"22px 24px"}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:18}}>EMBUDO DE CONVERSIÓN</div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[
              {l:"Leads que escribieron",v:metrics?.leads_escribieron??0,max:metrics?.leads_escribieron??1,c:"#0256A0",p:100},
              {l:"Leads calificados",    v:metrics?.leads_calificados??0, max:metrics?.leads_escribieron??1,c:"#99CA3C"},
              {l:"Visitas agendadas",    v:metrics?.visitas_solicitadas??0,max:metrics?.leads_calificados??1,c:"#FF5421"},
              {l:"Matrículas iniciadas", v:metrics?.matriculas_iniciadas??0,max:metrics?.visitas_solicitadas??1,c:"#6d3bbd"},
            ].map(row=>{
              const p=row.p??(row.max>0?Math.min(Math.round(row.v/row.max*100),100):0);
              return(
                <div key={row.l}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontSize:".74rem",color:"var(--text-sub)"}}>{row.l}</span>
                    <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                      <span style={{fontSize:".9rem",fontWeight:800,color:row.c}}>{row.v}</span>
                      <span style={{fontSize:".6rem",color:"var(--text-light)"}}>{p}%</span>
                    </div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:bar?`${p}%`:"0%",background:`linear-gradient(90deg,${row.c}60,${row.c})`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: FUNCIONES ── */
function ViewSky() {
  const {isMobile} = useBP();
  const feats = [
    {i:"⚡",t:"Responde en < 10 segundos",d:"Responde a cada lead de WhatsApp en menos de 10 segundos, los 365 días del año, a cualquier hora."},
    {i:"🎯",t:"Calificación conversacional",d:"5 preguntas naturales para identificar carrera, horario, forma de pago y nivel de interés del prospecto."},
    {i:"🗓",t:"Agenda visitas al campus",d:"Detecta cuando un lead quiere visitar y ofrece slots (lunes y martes 4-6PM). Crea el evento automáticamente."},
    {i:"📋",t:"CRM automático — Pipedrive",d:"Crea persona y deal en Pipedrive automáticamente. Actualiza la etapa según el avance de cada lead."},
    {i:"🔔",t:"Notificaciones al equipo",d:"Cuando hay visita o inicio de matrícula, notifica al grupo de WhatsApp del equipo de admisiones."},
    {i:"🔄",t:"Follow-ups D+1, D+3, D+7",d:"SKY hace seguimiento a leads inactivos con mensajes personalizados por carrera de interés."},
    {i:"🧠",t:"Memoria de conversación",d:"Recuerda nombre, carrera y contexto de cada lead en conversaciones futuras. Nunca pregunta dos veces."},
    {i:"🌙",t:"Disponible 24/7 sin pausas",d:"Fines de semana, feriados, madrugadas. SKY nunca se cansa ni hace esperar a un prospecto."},
  ];
  return (
    <div>
      <TopBar title="Funciones de SKY" sub="Todo lo que el agente hace por el equipo de admisiones UTE"/>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:18}}>
          {feats.map((f,i)=>(
            <div key={f.t} className={`feat-item fade-in d${(i%4)+1}`}>
              <div className="feat-icon">{f.i}</div>
              <div>
                <div style={{fontSize:".86rem",fontWeight:700,color:"var(--text)",marginBottom:4}}>{f.t}</div>
                <div style={{fontSize:".72rem",color:"var(--text-sub)",lineHeight:1.6}}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card fade-in d3" style={{padding:isMobile?"14px 14px":"22px 24px"}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:4}}>FLUJO EN TIEMPO REAL</div>
          <div style={{fontSize:".71rem",color:"var(--text-light)",marginBottom:16}}>Así procesa SKY cada mensaje en menos de 10 segundos</div>
          <FlowDiagram/>
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: CONVERSACIONES ── */
function PhoneFeed({messages}:{messages:ConvoMsg[]}) {
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{if(feedRef.current)feedRef.current.scrollTop=feedRef.current.scrollHeight;},[messages]);
  return (
    <div className="phone-shell">
      <div className="phone-notch"/>
      <div className="phone-wa-bar">
        <div className="wa-avatar">🎓</div>
        <div>
          <div style={{fontSize:".68rem",fontWeight:700,color:"#fff"}}>SKY · UTE Admisiones</div>
          <div style={{fontSize:".58rem",color:"rgba(255,255,255,.6)"}}>en línea</div>
        </div>
      </div>
      <div ref={feedRef} style={{background:"#0d1520",backgroundImage:"radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px)",backgroundSize:"18px 18px",height:360,overflowY:"auto",padding:"12px 10px",display:"flex",flexDirection:"column",gap:7}}>
        {messages.length===0&&<div style={{color:"rgba(255,255,255,.2)",fontSize:".65rem",textAlign:"center",marginTop:140}}>Sin mensajes aún</div>}
        {messages.map((m,i)=>(
          <div key={i} className="msg-anim">
            {m.type==="in"&&<div className="b-in">{m.content}</div>}
            {m.type==="out"&&<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><div className="b-out">{m.content}</div></div>}
          </div>
        ))}
      </div>
      <div style={{background:"#1a2030",padding:"8px 10px",display:"flex",gap:7,alignItems:"center",borderTop:"1px solid rgba(255,255,255,.05)"}}>
        <div style={{flex:1,background:"#2a3040",borderRadius:18,padding:"6px 10px",fontSize:".6rem",color:"rgba(255,255,255,.2)"}}>Mensaje...</div>
        <div style={{width:26,height:26,borderRadius:"50%",background:"#128C7E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".75rem"}}>🎙</div>
      </div>
    </div>
  );
}

function ConvoCard({c,isSelected,onClick,slim}:{c:Convo;isSelected:boolean;onClick:()=>void;slim?:boolean}) {
  const fmt=(iso:string)=>{try{return new Date(iso).toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});}catch{return "";}};
  const statusColor=(s:string)=>s==="open"?"#4a8c00":s==="resolved"?"#0256A0":"#c87000";
  const statusLabel=(s:string)=>s==="open"?"Abierta":s==="resolved"?"Resuelta":"Pendiente";
  return (
    <div onClick={onClick} className="card fade-in" style={{marginBottom:10,cursor:"pointer",border:isSelected?"1.5px solid #0256A040":"1px solid var(--border)",background:isSelected?"rgba(2,86,160,.03)":"var(--surface)"}}>
      <div style={{padding:slim?"12px 14px":"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:slim?8:10,marginBottom:8}}>
          <div style={{width:slim?30:34,height:slim?30:34,borderRadius:"50%",background:"rgba(2,86,160,.08)",border:"1px solid rgba(2,86,160,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:slim?".85rem":".9rem",flexShrink:0}}>👤</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:slim?".8rem":".84rem",fontWeight:700,color:"var(--text)"}}>{c.contact_name}</span>
              <span style={{fontSize:".56rem",fontWeight:700,padding:"1px 6px",borderRadius:99,background:`${statusColor(c.status)}15`,border:`1px solid ${statusColor(c.status)}30`,color:statusColor(c.status),whiteSpace:"nowrap"}}>{statusLabel(c.status)}</span>
            </div>
            <div style={{fontSize:".6rem",color:"var(--text-light)",marginTop:1}}>#{c.id} · {fmt(c.created_at)}</div>
          </div>
          {c.response_time_s>0&&<div style={{flexShrink:0,fontSize:".58rem",fontWeight:800,padding:"2px 7px",borderRadius:99,background:"rgba(153,202,60,.1)",border:"1px solid rgba(153,202,60,.25)",color:"#4a8c00",whiteSpace:"nowrap"}}>⚡ {c.response_time_s}s</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {c.messages.slice(slim?-2:-3).map((m,j)=>(
            <div key={j} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
              <span style={{fontSize:".58rem",fontWeight:700,color:m.type==="out"?"#4a8c00":"var(--ute-blue)",flexShrink:0,marginTop:1}}>{m.type==="out"?"SKY":"Lead"}</span>
              <span style={{fontSize:".72rem",color:"var(--text-sub)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{m.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewConvo() {
  const {isMobile} = useBP();
  const convos = useConversations();
  const [selected, setSelected] = useState(0);
  const active = convos[selected] ?? null;

  if (isMobile) {
    return (
      <div>
        <TopBar title="Conversaciones" sub="Datos reales de SKY en Chatwoot · Inbox UTE" right={<div/>}/>
        <div className="page-body" style={{paddingTop:12}}>
          <div style={{fontSize:".72rem",color:"#4a8c00",fontWeight:700,marginBottom:12}}>● {convos.length} conversaciones en Chatwoot</div>
          {convos.length===0&&<div className="card" style={{padding:"32px",textAlign:"center",color:"var(--text-sub)",fontSize:".82rem"}}>Cargando conversaciones...</div>}
          {convos.map((c,i)=>(
            <ConvoCard key={c.id} c={c} isSelected={selected===i} onClick={()=>setSelected(i)} slim/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex",height:"100%"}}>
      <div style={{width:300,padding:"20px 16px",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:14,flexShrink:0,background:"var(--surface)",overflowY:"auto"}}>
        <div>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)",marginBottom:4}}>CONVERSACIONES REALES</div>
          <div style={{fontSize:".72rem",color:"#4a8c00",fontWeight:700}}>● {convos.length} en Chatwoot — inbox UTE</div>
        </div>
        <PhoneFeed messages={active?.messages??[]}/>
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        <TopBar title="Conversaciones" sub="Datos reales de SKY en Chatwoot · Inbox UTE"/>
        <div className="page-body" style={{paddingTop:16}}>
          {convos.length===0&&<div className="card" style={{padding:"32px",textAlign:"center",color:"var(--text-sub)",fontSize:".82rem"}}>Cargando conversaciones desde Chatwoot...</div>}
          {convos.map((c,i)=>(
            <ConvoCard key={c.id} c={c} isSelected={selected===i} onClick={()=>setSelected(i)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CHART: BARS ── */
function BarChart({data}:{data:{label:string;value:number;color:string}[]}) {
  const [go,setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),380);return()=>clearTimeout(t);},[]);
  const max=Math.max(...data.map(d=>d.value));
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:5,height:132,paddingBottom:2}}>
      {data.map((d,i)=>(
        <div key={d.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
          <span style={{fontSize:".6rem",fontWeight:800,color:d.color,opacity:go?1:0,transition:"opacity .3s"}}>{d.value}</span>
          <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:`linear-gradient(to top,${d.color},${d.color}bb)`,height:go?`${Math.max(Math.round((d.value/max)*84),3)}%`:"2%",transition:`height .85s cubic-bezier(.4,0,.2,1) ${i*.07}s`}}/>
          <span style={{fontSize:".57rem",color:"var(--text-sub)",whiteSpace:"nowrap"}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── CHART: DONUT ── */
function DonutChart({slices,centerTop,centerBot}:{slices:{label:string;pct:number;color:string}[];centerTop:string;centerBot:string}) {
  const [go,setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),420);return()=>clearTimeout(t);},[]);
  const r=52,cx=70,cy=70,circ=2*Math.PI*r;
  let cum=0;
  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <svg viewBox="0 0 140 140" style={{width:130,height:130,flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg)" strokeWidth={20}/>
        {slices.map((s,i)=>{
          const seg=go?(s.pct/100)*circ:0,rot=(cum/100)*360-90;cum+=s.pct;
          return <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={20} strokeDasharray={`${seg} ${circ}`} transform={`rotate(${rot} ${cx} ${cy})`} style={{transition:`stroke-dasharray .9s cubic-bezier(.4,0,.2,1) ${i*.08}s`}}/>;
        })}
        <text x={cx} y={cy-5} textAnchor="middle" style={{fontSize:"14px",fontWeight:900,fill:"var(--ute-blue)"}}>{centerTop}</text>
        <text x={cx} y={cy+11} textAnchor="middle" style={{fontSize:"8px",fill:"var(--text-sub)"}}>{centerBot}</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:7,flex:1}}>
        {slices.map(s=>(
          <div key={s.label} style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:".67rem",color:"var(--text-sub)",flex:1}}>{s.label}</span>
            <span style={{fontSize:".7rem",fontWeight:700,color:s.color}}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CHART: LINE ── */
function LineChart({points}:{points:{label:string;value:number}[]}) {
  const [go,setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),450);return()=>clearTimeout(t);},[]);
  const W=360,H=90,pad=22;
  const max=Math.max(...points.map(p=>p.value))*1.18;
  const step=(W-pad*2)/(points.length-1);
  const coords=points.map((p,i)=>({x:pad+i*step,y:H-((p.value/max)*(H-pad)),...p}));
  const line=coords.map((c,i)=>`${i===0?"M":"L"} ${c.x} ${c.y}`).join(" ");
  const area=`${line} L ${W-pad} ${H} L ${pad} ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H+20}`} style={{width:"100%",overflow:"visible"}}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0256A0" stopOpacity=".18"/>
          <stop offset="100%" stopColor="#0256A0" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg1)" opacity={go?1:0} style={{transition:"opacity .7s"}}/>
      <path d={line} fill="none" stroke="#0256A0" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={go?1:0} style={{transition:"opacity .7s"}}/>
      {coords.map((c,i)=>(
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r={4} fill="#fff" stroke="#0256A0" strokeWidth={2.5} opacity={go?1:0} style={{transition:`opacity .3s ${i*.1}s`}}/>
          <text x={c.x} y={c.y-10} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0256A0" opacity={go?1:0} style={{transition:`opacity .3s ${i*.1}s`}}>{c.value}</text>
          <text x={c.x} y={H+15} textAnchor="middle" style={{fontSize:"8px",fill:"var(--text-sub)"}}>{c.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── VIEW: GRÁFICOS & CAC ── */
function ViewCharts({metrics}:{metrics:Metrics|null}) {
  const {isMobile} = useBP();
  const [bar,setBar] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setBar(true),500);return()=>clearTimeout(t);},[]);

  const total   = metrics?.total_leads ?? 0;
  const calif   = metrics?.leads_calificados ?? 0;
  const visitas = metrics?.visitas_solicitadas ?? 0;
  const mats    = metrics?.matriculas_iniciadas ?? 0;
  const escrib  = metrics?.leads_escribieron ?? 0;
  const tasa    = metrics?.tasa_calificacion ?? 0;

  const skyMes  = 597;
  const cacReal = total > 0 ? (skyMes / total).toFixed(2) : "—";
  const tasaV   = calif > 0 ? Math.round(visitas / calif * 100) : 0;
  const tasaM   = visitas > 0 ? Math.round(mats / visitas * 100) : 0;

  const pad = isMobile ? "14px 14px" : "22px 24px";

  const realCards = [
    {l:"Leads en CRM",         v: total > 0 ? String(total) : "—",       c:"#0256A0", i:"👥", s:"Registrados en Pipedrive"},
    {l:"CAC real con SKY",     v: total > 0 ? `$${cacReal}` : "—",        c:"#4a8c00", i:"🎯", s:`$${skyMes} ÷ ${total || "?"} leads`},
    {l:"Tasa de calificación", v: escrib > 0 ? `${tasa}%` : "—",          c:"#6d3bbd", i:"📊", s:"Leads calificados / total"},
    {l:"De visita a matrícula",v: tasaM > 0 ? `${tasaM}%` : "—",          c:"#c87000", i:"🎓", s:"Conversión en matrícula"},
  ];

  const funnelSteps = [
    {l:"Escribieron a SKY",    v:escrib,  c:"#0256A0", max:escrib||1},
    {l:"Calificados (5 preg)", v:calif,   c:"#99CA3C", max:escrib||1},
    {l:"Visita solicitada",    v:visitas, c:"#FF5421", max:calif||1},
    {l:"Matrícula iniciada",   v:mats,    c:"#6d3bbd", max:visitas||1},
  ];

  return (
    <div>
      <TopBar title="Métricas reales" sub="Datos calculados en tiempo real desde Pipedrive CRM · Sin datos inventados"/>
      <div className="page-body">

        {/* 4 tiles — all real */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:16}}>
          {realCards.map((c,i)=>(
            <div key={c.l} className={`metric-tile fade-in d${i+1}`}>
              <div style={{fontSize:"1.25rem",marginBottom:10}}>{c.i}</div>
              <div style={{fontSize:isMobile?"1.5rem":"1.9rem",fontWeight:900,letterSpacing:"-.04em",color:c.c,marginBottom:4,lineHeight:1}}>{c.v}</div>
              <div style={{fontSize:isMobile?".7rem":".78rem",fontWeight:600,color:"var(--text)"}}>{c.l}</div>
              <div style={{fontSize:".62rem",color:"var(--text-sub)",marginTop:2}}>{c.s}</div>
            </div>
          ))}
        </div>

        {/* Conversion funnel — real data */}
        <div className="card fade-in d2" style={{padding:pad,marginBottom:12}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:4}}>TASAS DE CONVERSIÓN — DATOS REALES</div>
          <div style={{fontSize:".71rem",color:"var(--text-light)",marginBottom:18}}>Calculado desde Pipedrive · Se actualiza cada 15 segundos</div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {funnelSteps.map(row=>{
              const p = row.max > 0 ? Math.min(Math.round(row.v / row.max * 100), 100) : 0;
              return (
                <div key={row.l}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{row.l}</span>
                    <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                      <span style={{fontSize:".92rem",fontWeight:800,color:row.c}}>{row.v}</span>
                      <span style={{fontSize:".6rem",color:"var(--text-light)"}}>{p}%</span>
                    </div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:bar?`${p}%`:"0%",background:`linear-gradient(90deg,${row.c}55,${row.c})`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion rate cards */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:12,marginBottom:12}}>
          {[
            {l:"Resp. → Calificado",  num:calif,  den:escrib,  c:"#0256A0", desc:"De los que escriben, cuántos completan las 5 preguntas"},
            {l:"Calificado → Visita", num:visitas, den:calif,   c:"#FF5421", desc:"De los calificados, cuántos agendan visita al campus"},
            {l:"Visita → Matrícula",  num:mats,    den:visitas, c:"#6d3bbd", desc:"De las visitas agendadas, cuántos inician matrícula"},
          ].map((r,i)=>{
            const p = r.den > 0 ? Math.round(r.num / r.den * 100) : 0;
            const sinDatos = r.den === 0;
            return (
              <div key={r.l} className={`card fade-in d${i+1}`} style={{padding:pad}}>
                <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)",marginBottom:12}}>{r.l.toUpperCase()}</div>
                {sinDatos ? (
                  <div style={{fontSize:".72rem",color:"var(--text-light)",fontStyle:"italic",lineHeight:1.6,marginBottom:6}}>Sin estadísticas disponibles temporalmente</div>
                ) : (
                  <>
                    <div style={{fontSize:"2.4rem",fontWeight:900,letterSpacing:"-.04em",color:r.c,lineHeight:1,marginBottom:6}}>{p}%</div>
                    <div style={{fontSize:".72rem",color:"var(--text-sub)",lineHeight:1.5}}>{r.desc}</div>
                    <div style={{marginTop:10,fontSize:".62rem",color:"var(--text-light)"}}>{r.num} de {r.den} leads</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance summary — real data only */}
        <div className="card card-blue fade-in d3" style={{padding:pad}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--ute-blue)",marginBottom:14}}>RESUMEN DE RENDIMIENTO — DATOS REALES</div>
          {[
            {l:"Leads atendidos (Pipedrive)",  v: total > 0 ? String(total) : "Sin estadísticas disponibles temporalmente"},
            {l:"Costo por lead (CAC real)",    v: total > 0 ? `$${cacReal}` : "Sin estadísticas disponibles temporalmente"},
            {l:"Tasa de calificación",         v: escrib > 0 ? `${tasa}%` : "Sin estadísticas disponibles temporalmente"},
            {l:"Calificado → Visita",          v: tasaV > 0 ? `${tasaV}%` : "Sin estadísticas disponibles temporalmente"},
            {l:"Visita → Matrícula",           v: tasaM > 0 ? `${tasaM}%` : "Sin estadísticas disponibles temporalmente"},
          ].map((r,i,arr)=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<arr.length-1?"1px solid rgba(2,86,160,.08)":"none",flexWrap:"wrap",gap:4}}>
              <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{r.l}</span>
              <span style={{fontSize:r.v.startsWith("Sin")?".66rem":".82rem",fontWeight:700,color:r.v.startsWith("Sin")?"var(--text-light)":"var(--ute-blue)",fontStyle:r.v.startsWith("Sin")?"italic":"normal"}}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: ROI ── */
function ViewROI({metrics}:{metrics:Metrics|null}) {
  const {isMobile} = useBP();
  const q  = metrics?.leads_calificados ?? 0;
  const v  = metrics?.visitas_solicitadas ?? 0;
  const m  = metrics?.matriculas_iniciadas ?? 0;
  const esc = metrics?.leads_escribieron ?? 0;
  const noData = !metrics || q === 0;
  const pad = isMobile ? "14px 14px" : "22px 24px";

  const noStat = "Sin estadísticas disponibles temporalmente";

  return (
    <div>
      <TopBar title="ROI & Proyecciones" sub="Datos reales de SKY · Las proyecciones se calculan desde métricas reales"/>
      <div className="page-body">

        {/* Real metrics tiles */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:16}}>
          {[
            {l:"Leads calificados",   v: q > 0 ? String(q) : "—",   c:"#0256A0", i:"✅", s:"Completaron las 5 preguntas"},
            {l:"Visitas agendadas",   v: v > 0 ? String(v) : "—",   c:"#FF5421", i:"🗓", s:"Campus Quito Matriz"},
            {l:"Matrículas iniciadas",v: m > 0 ? String(m) : "—",   c:"#6d3bbd", i:"🚀", s:"En proceso de matrícula"},
            {l:"Tasa de cierre",      v: q > 0 && m > 0 ? `${Math.round(m/q*100)}%` : "—", c:"#4a8c00", i:"💹", s:"Leads → Matrícula"},
          ].map((c,i)=>(
            <div key={c.l} className={`metric-tile fade-in d${i+1}`}>
              <div style={{fontSize:"1.3rem",marginBottom:10}}>{c.i}</div>
              <div style={{fontSize:isMobile?"1.9rem":"2.4rem",fontWeight:900,letterSpacing:"-.03em",color:c.c,lineHeight:1,marginBottom:6}}>{c.v}</div>
              <div style={{fontSize:isMobile?".7rem":".78rem",fontWeight:600,color:"var(--text)"}}>{c.l}</div>
              <div style={{fontSize:".64rem",color:"var(--text-sub)",marginTop:2}}>{c.s}</div>
            </div>
          ))}
        </div>

        {/* Funnel conversion rates — real */}
        <div className="card fade-in d2" style={{padding:pad,marginBottom:14}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:4}}>CONVERSIÓN REAL POR ETAPA</div>
          <div style={{fontSize:".71rem",color:"var(--text-light)",marginBottom:18}}>Calculado desde Pipedrive en tiempo real</div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[
              {l:"Escribieron → Calificado", num:q,   den:esc,  c:"#0256A0"},
              {l:"Calificado → Visita",      num:v,   den:q,    c:"#FF5421"},
              {l:"Visita → Matrícula",       num:m,   den:v,    c:"#6d3bbd"},
            ].map(row=>{
              const p = row.den > 0 ? Math.min(Math.round(row.num / row.den * 100), 100) : 0;
              return (
                <div key={row.l}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{row.l}</span>
                    {row.den > 0
                      ? <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                          <span style={{fontSize:".92rem",fontWeight:800,color:row.c}}>{row.num}</span>
                          <span style={{fontSize:".6rem",color:"var(--text-light)"}}>{p}%</span>
                        </div>
                      : <span style={{fontSize:".66rem",color:"var(--text-light)",fontStyle:"italic"}}>{noStat}</span>
                    }
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${p}%`,background:`linear-gradient(90deg,${row.c}55,${row.c})`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note about projections */}
        <div style={{padding:"14px 18px",borderRadius:12,background:"rgba(2,86,160,.04)",border:"1px solid rgba(2,86,160,.12)",fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.7}}>
          ℹ️ Las métricas anteriores son <strong>datos reales</strong> de Pipedrive. Para proyecciones de ingresos, consulte directamente con el equipo de Scale Solutions con los datos actualizados del período.
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: PIPELINE ── */
function ViewFunnel({metrics}:{metrics:Metrics|null}) {
  const {isMobile} = useBP();
  const [bar,setBar]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setBar(true),400);return()=>clearTimeout(t);},[]);
  const stages=[
    {l:"Lead entra",      v:metrics?.conversaciones_hoy??0,  c:"#0256A0",i:"📥"},
    {l:"Calificado",      v:metrics?.leads_calificados??0,   c:"#99CA3C",i:"✅"},
    {l:"Visita agendada", v:metrics?.visitas_solicitadas??0, c:"#FF5421",i:"🗓"},
    {l:"En matrícula",    v:metrics?.matriculas_iniciadas??0,c:"#6d3bbd",i:"🚀"},
  ];
  const max=stages[0].v||1;
  return (
    <div>
      <TopBar title="Pipeline de leads" sub="Flujo acumulado de prospectos por etapa SKY"/>
      <div className="page-body">
        <div className="card fade-in" style={{padding:isMobile?"14px 14px":"24px",marginBottom:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {stages.map((s,i)=>{
              const p=Math.min(Math.round(s.v/max*100),100),w=100-i*15;
              return(
                <div key={s.l} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:34,height:34,borderRadius:9,background:`${s.c}12`,border:`1.5px solid ${s.c}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.i}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                      <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{s.l}</span>
                      <span style={{fontSize:".86rem",fontWeight:800,color:s.c}}>{s.v} <span style={{fontSize:".6rem",color:"var(--text-light)"}}>({p}%)</span></span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{width:bar?`${w}%`:"0%",background:`linear-gradient(90deg,${s.c}50,${s.c})`,transitionDelay:`${i*.1}s`}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12}}>
          {stages.map((s,i)=>(
            <div key={s.l} className={`metric-tile fade-in d${i+1}`} style={{textAlign:"center"}}>
              <div style={{fontSize:"1.4rem",marginBottom:10}}>{s.i}</div>
              <div style={{fontSize:isMobile?"1.9rem":"2.2rem",fontWeight:900,letterSpacing:"-.04em",color:s.c,marginBottom:5}}>{s.v}</div>
              <div style={{fontSize:".7rem",color:"var(--text-sub)"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: ANTES vs AHORA ── */
function ViewCompare() {
  const {isMobile} = useBP();
  const rows=[
    {l:"Tiempo de respuesta",   b:"Horas o días",           a:"< 10 segundos"},
    {l:"Cobertura horaria",     b:"Horario de oficina",      a:"24/7 · 365 días"},
    {l:"Calificación de leads", b:"Solo por llamada/visita", a:"Automático en WhatsApp"},
    {l:"Registro en CRM",       b:"Manual o no se hace",     a:"Automático en cada mensaje"},
    {l:"Seguimiento",           b:"No sistemático",          a:"D+1, D+3, D+7 automático"},
    {l:"Agenda de visitas",     b:"Coordinar manualmente",   a:"SKY agenda en la conversación"},
    {l:"Notificaciones equipo", b:"No existe",               a:"Alerta inmediata por WhatsApp"},
  ];
  return (
    <div>
      <TopBar title="Antes vs Ahora" sub="Capacidades del proceso manual vs SKY automatizado"/>
      <div className="page-body">

        {/* Disclaimer */}
        <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(255,84,33,.04)",border:"1px solid rgba(255,84,33,.15)",fontSize:".72rem",color:"var(--text-sub)",lineHeight:1.6,marginBottom:14}}>
          ℹ️ La columna <strong>"Sin SKY"</strong> describe el proceso manual estándar de admisiones — no datos históricos específicos de UTE. La columna <strong>"Con SKY"</strong> describe las capacidades reales del sistema activo.
        </div>

        <div className="card fade-in" style={{overflow:"hidden",marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1.5fr 1fr 1fr":"1.8fr 1fr 1fr",padding:isMobile?"10px 12px":"12px 24px",background:"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)"}}>CAPACIDAD</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--ute-orange)"}}>SIN AUTOMATIZAR</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"#4a8c00"}}>CON SKY</span>
          </div>
          {rows.map((r,i)=>(
            <div key={r.l} style={{display:"grid",gridTemplateColumns:isMobile?"1.5fr 1fr 1fr":"1.8fr 1fr 1fr",padding:isMobile?"10px 12px":"15px 24px",borderBottom:i<rows.length-1?"1px solid var(--border)":"none",background:i%2?"var(--bg)":"var(--surface)",transition:"background .15s"}}>
              <span style={{fontSize:isMobile?".72rem":".82rem",color:"var(--text-sub)"}}>{r.l}</span>
              <span style={{fontSize:isMobile?".72rem":".82rem",fontWeight:600,color:"var(--ute-orange)"}}>{r.b}</span>
              <span style={{fontSize:isMobile?".72rem":".82rem",fontWeight:700,color:"#4a8c00"}}>{r.a}</span>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
          <div className="card card-orange" style={{padding:isMobile?"20px 16px":"28px 24px",textAlign:"center"}}>
            <div style={{fontSize:isMobile?"2.4rem":"3rem",fontWeight:900,color:"var(--ute-orange)",letterSpacing:"-.04em",marginBottom:8}}>Horas</div>
            <div style={{fontSize:".88rem",fontWeight:700,color:"var(--text)",marginBottom:6}}>Sin automatización</div>
            <div style={{fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.6}}>Un lead que no recibe respuesta rápida busca otra opción. El tiempo de respuesta define la conversión.</div>
          </div>
          <div className="card card-green" style={{padding:isMobile?"20px 16px":"28px 24px",textAlign:"center"}}>
            <div style={{fontSize:isMobile?"2.4rem":"3rem",fontWeight:900,color:"#4a8c00",letterSpacing:"-.04em",marginBottom:8}}>{"< 10s"}</div>
            <div style={{fontSize:".88rem",fontWeight:700,color:"var(--text)",marginBottom:6}}>Con SKY activo</div>
            <div style={{fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.6}}>SKY responde en menos de 10 segundos, califica el lead y lo registra en CRM automáticamente.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({active,onSelect}:{active:string;onSelect:(id:string)=>void}) {
  const clock=useClock();
  const {isTablet}=useBP();
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        {isTablet ? (
          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>🎓</div>
        ) : (
          <>
            <div style={{marginBottom:14}}>
              <Image src={UTE_LOGO} alt="Universidad UTE" width={108} height={40} style={{objectFit:"contain",objectPosition:"left"}} unoptimized priority/>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:".62rem",fontWeight:700,color:"var(--sb-muted)",letterSpacing:".06em"}}>SKY Intelligence</span>
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:99,background:"rgba(0,0,0,.18)",border:"1px solid rgba(255,255,255,.1)"}}>
                <div className="live-dot" style={{width:5,height:5}}/>
                <span style={{fontFamily:"monospace",fontSize:".6rem",color:"var(--ute-green)",fontWeight:700}}>{clock}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:10}}>
        {!isTablet && <div className="sidebar-section-label">Panel de Control</div>}
        {NAV.map(item=>(
          <button key={item.id} className={`nav-item ${active===item.id?"active":""}`} onClick={()=>onSelect(item.id)} title={isTablet?item.label:undefined}>
            <div className="nav-icon">{item.icon}</div>
            {!isTablet && <span>{item.label}</span>}
            {!isTablet && item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      <div className="sb-footer">
        <div style={{display:"flex",alignItems:"center",gap:7,justifyContent:isTablet?"center":"flex-start",marginBottom:isTablet?0:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"var(--ute-green)",boxShadow:"0 0 8px rgba(153,202,60,.6)",flexShrink:0}}/>
          {!isTablet && <span style={{fontSize:".68rem",fontWeight:700,color:"var(--ute-green)"}}>SKY operativo 24/7</span>}
        </div>
        {!isTablet && (
          <div className="sb-footer-text" style={{fontSize:".58rem",color:"var(--sb-muted)",lineHeight:1.7}}>
            Powered by Scale Solutions Ecuador
          </div>
        )}
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  const [view,setView] = useState("stats");
  const {metrics,countdown,lastSync} = useMetrics();
  const w = useWindowSize();
  const isMobile = w < 640;
  const isTablet = w >= 640 && w < 1024;

  const renderView = () => {
    switch(view) {
      case "stats":   return <ViewStats metrics={metrics} countdown={countdown} lastSync={lastSync}/>;
      case "charts":  return <ViewCharts metrics={metrics}/>;
      case "sky":     return <ViewSky/>;
      case "convo":   return <ViewConvo/>;
      case "roi":     return <ViewROI metrics={metrics}/>;
      case "funnel":  return <ViewFunnel metrics={metrics}/>;
      case "compare": return <ViewCompare/>;
      default: return null;
    }
  };

  return (
    <BP.Provider value={{isMobile,isTablet}}>
      <div className="app-shell">
        <Sidebar active={view} onSelect={setView}/>
        <main className="main-content" key={view}>{renderView()}</main>
      </div>
      <MobileBottomNav active={view} onSelect={setView}/>
    </BP.Provider>
  );
}
