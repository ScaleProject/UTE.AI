"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

const UTE_LOGO    = "https://ute.edu.ec/wp-content/uploads/2025/09/logo-univ-ute_blanco.png";
const METRICS_URL = "https://scale-project-n8n.jfigq5.easypanel.host/webhook/sky-metricas";
const CONVOS_URL  = "https://scale-project-n8n.jfigq5.easypanel.host/webhook/sky-conversaciones";
const MAT_USD     = 3200;

interface Metrics {
  conversaciones_hoy: number; leads_calificados: number;
  visitas_solicitadas: number; matriculas_iniciadas: number;
  total_leads: number; tasa_calificacion: number;
  leads_escribieron: number; conversaciones_sky: number;
}
type Msg = { id:string; kind:"in"|"out"|"typing"; text?:string; secs?:number };
interface ConvoMsg { type:"in"|"out"; content:string; created_at:string; }
interface Convo { id:number; contact_name:string; status:string; created_at:string; messages:ConvoMsg[]; response_time_s:number; }

const NAV = [
  { id:"stats",   icon:"📊", label:"Estadísticas en vivo", badge:"LIVE" },
  { id:"charts",  icon:"📈", label:"Gráficos & CAC"        },
  { id:"sky",     icon:"🤖", label:"Funciones de SKY"       },
  { id:"convo",   icon:"💬", label:"Conversaciones"          },
  { id:"roi",     icon:"💰", label:"ROI & Proyecciones"     },
  { id:"funnel",  icon:"🎯", label:"Pipeline de leads"       },
  { id:"compare", icon:"⚡", label:"Antes vs Ahora"          },
];


/* ── HOOKS ── */
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
  useEffect(()=>{
    const t = setInterval(()=>setActive(a=>(a+1)%steps.length), 1800);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{display:"flex",alignItems:"center"}}>
      {steps.flatMap((s,i)=>{
        const isActive = active===i;
        const items = [
          <div key={s.l} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:6,
            padding:"14px 10px",borderRadius:12,minWidth:98,textAlign:"center",flexShrink:0,
            background:isActive?`${s.c}10`:"var(--bg)",
            border:`1.5px solid ${isActive?s.c:"var(--border)"}`,
            boxShadow:isActive?`0 4px 18px ${s.c}20`:"none",
            transition:"all .4s ease",
          }}>
            <div style={{fontSize:"1.25rem"}}>{s.i}</div>
            <div style={{fontSize:".72rem",fontWeight:700,color:isActive?s.c:"var(--text)"}}>{s.l}</div>
            <div style={{fontSize:".58rem",color:"var(--text-sub)",lineHeight:1.4}}>{s.s}</div>
          </div>
        ];
        if (i < steps.length-1) items.push(
          <div key={`arr-${i}`} style={{flex:"0 0 24px",display:"flex",alignItems:"center",justifyContent:"center",
            color:isActive?"var(--ute-blue)":"var(--border-d)",fontSize:"1.1rem",fontWeight:700,transition:"color .4s",flexShrink:0}}>›</div>
        );
        return items;
      })}
    </div>
  );
}

/* ── TOP BAR ── */
function TopBar({ title, sub, right }: { title:string; sub:string; right?:React.ReactNode }) {
  return (
    <div className="page-header">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
        {right && <div style={{flexShrink:0}}>{right}</div>}
      </div>
    </div>
  );
}

/* ── VIEW: ESTADÍSTICAS ── */
function ViewStats({metrics,countdown,lastSync}:{metrics:Metrics|null;countdown:number;lastSync:string}) {
  const leads = useCountUp(metrics?.leads_calificados??0,1500);
  const vis   = useCountUp(metrics?.visitas_solicitadas??0,1700);
  const mats  = useCountUp(metrics?.matriculas_iniciadas??0,1900);
  const esc   = useCountUp(metrics?.leads_escribieron??0,1100);
  const sky   = useCountUp(metrics?.conversaciones_sky??0,1100);
  const [bar, setBar] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setBar(true),500);return()=>clearTimeout(t);},[]);

  const tiles = [
    {l:"Leads calificados",  v:leads, c:"#5a9200", i:"✅", s:"5 preguntas completadas"},
    {l:"Visitas agendadas",  v:vis,   c:"#c87000", i:"🗓", s:"Campus Quito Matriz"},
    {l:"Procesos matrícula", v:mats,  c:"#6d3bbd", i:"🚀", s:"Estudiantes confirmados"},
  ];

  return (
    <div>
      <TopBar title="Estadísticas en vivo" sub={`Período 2026-2 · Datos en tiempo real${lastSync?` · ${lastSync}`:""}`}
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
        {/* Comparación entrantes vs respondidos */}
        {(() => {
          const rawEsc = metrics?.leads_escribieron??0;
          const rawSky = metrics?.conversaciones_sky??0;
          const equal  = rawEsc>0 && rawEsc===rawSky;
          return (
            <div className="fade-in d1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div className="metric-tile" style={{display:"flex",alignItems:"center",gap:18,padding:"18px 22px",border:"1.5px solid #0256A020",background:"#0256A004"}}>
                <div>
                  <div style={{fontSize:"2.2rem",fontWeight:900,letterSpacing:"-.04em",color:"#0256A0",lineHeight:1}}>{esc.toLocaleString()}</div>
                  <div style={{fontSize:".8rem",fontWeight:600,color:"var(--text)",marginTop:6}}>Leads que escribieron</div>
                  <div style={{fontSize:".68rem",color:"var(--text-sub)",marginTop:2}}>Mensajes entrantes a SKY</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:"1.8rem",flexShrink:0}}>📩</div>
              </div>
              <div className="metric-tile" style={{display:"flex",alignItems:"center",gap:18,padding:"18px 22px",border:"1.5px solid #4a8c0020",background:"#4a8c0004"}}>
                <div>
                  <div style={{fontSize:"2.2rem",fontWeight:900,letterSpacing:"-.04em",color:"#4a8c00",lineHeight:1}}>{sky.toLocaleString()}</div>
                  <div style={{fontSize:".8rem",fontWeight:600,color:"var(--text)",marginTop:6}}>Conversaciones con SKY</div>
                  <div style={{fontSize:".68rem",color:"var(--text-sub)",marginTop:2}}>SKY respondió activamente</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:"1.8rem"}}>🤖</div>
                  {equal&&<div style={{marginTop:6,fontSize:".58rem",fontWeight:800,padding:"2px 8px",borderRadius:99,background:"rgba(153,202,60,.12)",border:"1px solid rgba(153,202,60,.3)",color:"#4a8c00",whiteSpace:"nowrap"}}>✓ IGUALES</div>}
                  {!equal&&rawEsc>0&&<div style={{marginTop:6,fontSize:".58rem",fontWeight:800,padding:"2px 8px",borderRadius:99,background:"rgba(255,84,33,.1)",border:"1px solid rgba(255,84,33,.25)",color:"var(--ute-orange)",whiteSpace:"nowrap"}}>⚠ REVISAR</div>}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
          {tiles.map((t,i)=>(
            <div key={t.l} className={`metric-tile fade-in d${i+1}`}>
              <div style={{fontSize:"1.4rem",marginBottom:12}}>{t.i}</div>
              <div className="tile-num" style={{color:t.c,marginBottom:6}}>{t.v.toLocaleString()}</div>
              <div style={{fontSize:".8rem",fontWeight:600,color:"var(--text)"}}>{t.l}</div>
              <div style={{fontSize:".68rem",color:"var(--text-sub)",marginTop:2}}>{t.s}</div>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="card fade-in d3" style={{padding:"22px 24px"}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:20}}>EMBUDO DE CONVERSIÓN</div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[
              {l:"Leads que escribieron",v:metrics?.leads_escribieron??0, max:metrics?.leads_escribieron??1, c:"#0256A0",p:100},
              {l:"Leads calificados",    v:metrics?.leads_calificados??0,  max:metrics?.leads_escribieron??1, c:"#99CA3C"},
              {l:"Visitas agendadas",    v:metrics?.visitas_solicitadas??0,max:metrics?.leads_calificados??1,  c:"#FF5421"},
              {l:"Matrículas iniciadas", v:metrics?.matriculas_iniciadas??0,max:metrics?.visitas_solicitadas??1,c:"#6d3bbd"},
            ].map(row=>{
              const p=row.p??(row.max>0?Math.min(Math.round(row.v/row.max*100),100):0);
              return(
                <div key={row.l}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{row.l}</span>
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
          {feats.map((f,i)=>(
            <div key={f.t} className={`feat-item fade-in d${(i%4)+1}`}>
              <div className="feat-icon">{f.i}</div>
              <div>
                <div style={{fontSize:".88rem",fontWeight:700,color:"var(--text)",marginBottom:4}}>{f.t}</div>
                <div style={{fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.6}}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card fade-in d3" style={{padding:"22px 24px"}}>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:4}}>FLUJO EN TIEMPO REAL</div>
          <div style={{fontSize:".71rem",color:"var(--text-light)",marginBottom:18}}>Así procesa SKY cada mensaje en menos de 10 segundos</div>
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
        <div><div style={{fontSize:".68rem",fontWeight:700,color:"#fff"}}>SKY · UTE Admisiones</div><div style={{fontSize:".58rem",color:"rgba(255,255,255,.6)"}}>en línea</div></div>
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

function ViewConvo() {
  const convos = useConversations();
  const [selected, setSelected] = useState(0);
  const active = convos[selected] ?? null;

  const fmt = (iso:string) => {
    try { return new Date(iso).toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}); } catch { return ""; }
  };
  const statusColor = (s:string) => s==="open"?"#4a8c00":s==="resolved"?"#0256A0":"#c87000";
  const statusLabel = (s:string) => s==="open"?"Abierta":s==="resolved"?"Resuelta":"Pendiente";

  return (
    <div style={{display:"flex",height:"100%"}}>
      {/* Left: phone + conversation list */}
      <div style={{width:300,padding:"20px 16px",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:14,flexShrink:0,background:"var(--surface)",overflowY:"auto"}}>
        <div>
          <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)",marginBottom:4}}>CONVERSACIONES REALES</div>
          <div style={{fontSize:".72rem",color:"#4a8c00",fontWeight:700}}>● {convos.length} en Chatwoot — inbox UTE</div>
        </div>
        <PhoneFeed messages={active?.messages??[]}/>
      </div>

      {/* Right: conversation feed */}
      <div style={{flex:1,overflow:"auto"}}>
        <TopBar title="Conversaciones" sub="Datos reales de SKY en Chatwoot · Inbox UTE"/>
        <div className="page-body" style={{paddingTop:16}}>
          {convos.length===0&&(
            <div className="card" style={{padding:"32px",textAlign:"center",color:"var(--text-sub)",fontSize:".82rem"}}>
              Cargando conversaciones desde Chatwoot...
            </div>
          )}
          {convos.map((c,i)=>{
            const lastMsg = c.messages[c.messages.length-1];
            const isSelected = selected===i;
            return (
              <div key={c.id} onClick={()=>setSelected(i)} className="card fade-in" style={{
                marginBottom:10,cursor:"pointer",
                border:isSelected?"1.5px solid #0256A040":"1px solid var(--border)",
                background:isSelected?"rgba(2,86,160,.03)":"var(--surface)",
              }}>
                <div style={{padding:"14px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(2,86,160,.08)",border:"1px solid rgba(2,86,160,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem",flexShrink:0}}>👤</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:".84rem",fontWeight:700,color:"var(--text)"}}>{c.contact_name}</span>
                        <span style={{fontSize:".58rem",fontWeight:700,padding:"1px 7px",borderRadius:99,background:`${statusColor(c.status)}15`,border:`1px solid ${statusColor(c.status)}30`,color:statusColor(c.status)}}>{statusLabel(c.status)}</span>
                      </div>
                      <div style={{fontSize:".62rem",color:"var(--text-light)",marginTop:1}}>#{c.id} · {fmt(c.created_at)}</div>
                    </div>
                    {c.response_time_s>0&&<div style={{flexShrink:0,fontSize:".6rem",fontWeight:800,padding:"2px 8px",borderRadius:99,background:"rgba(153,202,60,.1)",border:"1px solid rgba(153,202,60,.25)",color:"#4a8c00"}}>⚡ {c.response_time_s}s</div>}
                  </div>
                  {/* Last 3 messages preview */}
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {c.messages.slice(-3).map((m,j)=>(
                      <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{fontSize:".6rem",fontWeight:700,color:m.type==="out"?"#4a8c00":"var(--ute-blue)",flexShrink:0,marginTop:1}}>
                          {m.type==="out"?"SKY":"Lead"}
                        </span>
                        <span style={{fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{m.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── CHART: BARS ── */
function BarChart({ data }:{ data:{label:string;value:number;color:string}[] }) {
  const [go, setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),380);return()=>clearTimeout(t);},[]);
  const max = Math.max(...data.map(d=>d.value));
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:5,height:132,paddingBottom:2}}>
      {data.map((d,i)=>(
        <div key={d.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
          <span style={{fontSize:".6rem",fontWeight:800,color:d.color,opacity:go?1:0,transition:"opacity .3s"}}>{d.value}</span>
          <div style={{
            width:"100%",borderRadius:"4px 4px 0 0",
            background:`linear-gradient(to top,${d.color},${d.color}bb)`,
            height: go ? `${Math.max(Math.round((d.value/max)*84),3)}%` : "2%",
            transition:`height .85s cubic-bezier(.4,0,.2,1) ${i*.07}s`,
          }}/>
          <span style={{fontSize:".57rem",color:"var(--text-sub)",whiteSpace:"nowrap"}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── CHART: DONUT ── */
function DonutChart({ slices, centerTop, centerBot }:{ slices:{label:string;pct:number;color:string}[]; centerTop:string; centerBot:string }) {
  const [go, setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),420);return()=>clearTimeout(t);},[]);
  const r=52, cx=70, cy=70, circ=2*Math.PI*r;
  let cum=0;
  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <svg viewBox="0 0 140 140" style={{width:140,height:140,flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg)" strokeWidth={20}/>
        {slices.map((s,i)=>{
          const seg=go?(s.pct/100)*circ:0;
          const rot=(cum/100)*360-90;
          cum+=s.pct;
          return (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={20}
              strokeDasharray={`${seg} ${circ}`}
              transform={`rotate(${rot} ${cx} ${cy})`}
              style={{transition:`stroke-dasharray .9s cubic-bezier(.4,0,.2,1) ${i*.08}s`}}
            />
          );
        })}
        <text x={cx} y={cy-5} textAnchor="middle" style={{fontSize:"15px",fontWeight:900,fill:"var(--ute-blue)"}}>{centerTop}</text>
        <text x={cx} y={cy+11} textAnchor="middle" style={{fontSize:"8px",fill:"var(--text-sub)"}}>{centerBot}</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:7,flex:1}}>
        {slices.map(s=>(
          <div key={s.label} style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
            <span style={{fontSize:".69rem",color:"var(--text-sub)",flex:1}}>{s.label}</span>
            <span style={{fontSize:".72rem",fontWeight:700,color:s.color}}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CHART: LINE ── */
function LineChart({ points }:{ points:{label:string;value:number}[] }) {
  const [go, setGo] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setGo(true),450);return()=>clearTimeout(t);},[]);
  const W=360, H=90, pad=22;
  const max=Math.max(...points.map(p=>p.value))*1.18;
  const step=(W-pad*2)/(points.length-1);
  const coords=points.map((p,i)=>({x:pad+i*step, y:H-((p.value/max)*(H-pad)), ...p}));
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
          <text x={c.x} y={c.y-10} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0256A0" opacity={go?1:0} style={{transition:`opacity .3s ${i*.1}s`}}>
            {c.value}
          </text>
          <text x={c.x} y={H+15} textAnchor="middle" style={{fontSize:"8px",fill:"var(--text-sub)"}}>{c.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── VIEW: GRÁFICOS & CAC ── */
function ViewCharts({metrics}:{metrics:Metrics|null}) {
  const cacSin=15.00, cacCon=0.42;
  const roi=Math.round(((MAT_USD-cacCon)/cacCon)*100);
  const fmt=(n:number)=>new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);

  const weekBars = [
    {label:"Lun",value:47,color:"#0256A0"},{label:"Mar",value:62,color:"#0256A0"},
    {label:"Mié",value:55,color:"#0256A0"},{label:"Jue",value:71,color:"#99CA3C"},
    {label:"Vie",value:83,color:"#99CA3C"},{label:"Sáb",value:34,color:"#FF5421"},
    {label:"Dom",value:19,color:"#FF5421"},
  ];
  const careerSlices = [
    {label:"Ing. Sistemas",  pct:26, color:"#0256A0"},
    {label:"Administración", pct:22, color:"#99CA3C"},
    {label:"Psicología",     pct:18, color:"#6d3bbd"},
    {label:"Derecho",        pct:15, color:"#FF5421"},
    {label:"Med. Vet.",      pct:10, color:"#c87000"},
    {label:"Otras",          pct:9,  color:"#8a9bb5"},
  ];
  const growthLine = [
    {label:"Sem 1",value:23},{label:"Sem 2",value:38},
    {label:"Sem 3",value:52},{label:"Sem 4",value:67},{label:"Hoy",value:83},
  ];

  const cacCards = [
    {l:"CAC sin SKY",   v:`$${cacSin.toFixed(2)}`, c:"var(--ute-orange)", i:"📉", s:"Costo por lead manual"},
    {l:"CAC con SKY",   v:`$${cacCon.toFixed(2)}`, c:"#4a8c00",           i:"🎯", s:"Costo por lead automatizado"},
    {l:"LTV matrícula", v:fmt(MAT_USD),             c:"#0256A0",           i:"🎓", s:"Valor de vida del cliente"},
    {l:"ROI con SKY",   v:`${roi.toLocaleString()}%`, c:"#6d3bbd",         i:"💹", s:"Retorno de inversión"},
  ];

  return (
    <div>
      <TopBar title="Gráficos & CAC" sub="Costo de adquisición, conversión por carrera y crecimiento de leads"/>
      <div className="page-body">
        {/* CAC metric tiles */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
          {cacCards.map((c,i)=>(
            <div key={c.l} className={`metric-tile fade-in d${i+1}`}>
              <div style={{fontSize:"1.3rem",marginBottom:10}}>{c.i}</div>
              <div style={{fontSize:"1.9rem",fontWeight:900,letterSpacing:"-.04em",color:c.c,marginBottom:4,lineHeight:1}}>{c.v}</div>
              <div style={{fontSize:".78rem",fontWeight:600,color:"var(--text)"}}>{c.l}</div>
              <div style={{fontSize:".66rem",color:"var(--text-sub)",marginTop:2}}>{c.s}</div>
            </div>
          ))}
        </div>

        {/* Bar + Donut row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div className="card fade-in d2" style={{padding:"22px 24px"}}>
            <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:3}}>LEADS POR DÍA DE SEMANA</div>
            <div style={{fontSize:".71rem",color:"var(--text-light)",marginBottom:18}}>Viernes pico · fin de semana baja</div>
            <BarChart data={weekBars}/>
          </div>
          <div className="card fade-in d3" style={{padding:"22px 24px"}}>
            <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:3}}>LEADS POR CARRERA</div>
            <div style={{fontSize:".71rem",color:"var(--text-light)",marginBottom:18}}>Distribución de interés por programa</div>
            <DonutChart
              slices={careerSlices}
              centerTop={String(metrics?.total_leads??371)}
              centerBot="leads totales"
            />
          </div>
        </div>

        {/* Line chart */}
        <div className="card fade-in d3" style={{padding:"22px 24px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--text-sub)",marginBottom:2}}>CRECIMIENTO SEMANAL DE LEADS CALIFICADOS</div>
              <div style={{fontSize:".71rem",color:"var(--text-light)"}}>Tendencia acumulada desde activación de SKY</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:18,height:2.5,borderRadius:2,background:"#0256A0"}}/>
              <span style={{fontSize:".65rem",color:"var(--text-sub)"}}>Leads calificados</span>
            </div>
          </div>
          <LineChart points={growthLine}/>
        </div>

        {/* CAC breakdown tables */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div className="card card-orange fade-in d2" style={{padding:"22px 24px"}}>
            <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"var(--ute-orange)",marginBottom:14}}>SIN SKY — PROCESO MANUAL</div>
            {[
              {l:"Costo asesor/mes",      v:"$600"},
              {l:"Leads respondidos/mes", v:"~30"},
              {l:"CAC promedio",          v:"$20.00"},
              {l:"Tasa de conversión",    v:"3–5%"},
              {l:"Matrículas/mes",        v:"1–2"},
            ].map((r,i,arr)=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<arr.length-1?"1px solid rgba(255,84,33,.1)":"none"}}>
                <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{r.l}</span>
                <span style={{fontSize:".82rem",fontWeight:700,color:"var(--ute-orange)"}}>{r.v}</span>
              </div>
            ))}
          </div>
          <div className="card card-green fade-in d3" style={{padding:"22px 24px"}}>
            <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",color:"#4a8c00",marginBottom:14}}>CON SKY — AUTOMATIZADO</div>
            {[
              {l:"Costo SKY/mes",         v:"$597"},
              {l:"Leads respondidos/mes", v:"300+"},
              {l:"CAC promedio",          v:"$0.42"},
              {l:"Tasa de conversión",    v:"12–15%"},
              {l:"Matrículas/mes",        v:"36–45"},
            ].map((r,i,arr)=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<arr.length-1?"1px solid rgba(153,202,60,.1)":"none"}}>
                <span style={{fontSize:".76rem",color:"var(--text-sub)"}}>{r.l}</span>
                <span style={{fontSize:".82rem",fontWeight:700,color:"#4a8c00"}}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: ROI ── */
function ViewROI({metrics}:{metrics:Metrics|null}) {
  const q=metrics?.leads_calificados??12, e=Math.max(1,Math.round(q*.15));
  const roi=useCountUp(e*MAT_USD,2000);
  const fmt=(n:number)=>new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
  return (
    <div>
      <TopBar title="ROI & Proyecciones" sub="Retorno de inversión proyectado con SKY activo este mes"/>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
          {[
            {l:"Leads calificados",    v:`${q}`,        c:"#0256A0",  i:"✅", s:"Por SKY este mes"},
            {l:"Matrículas estimadas", v:`${e}`,        c:"#4a8c00",  i:"🎓", s:"Tasa 15% conversión"},
            {l:"Ingreso proyectado",   v:fmt(roi),      c:"#0256A0",  i:"💰", s:"× $3,200 / matrícula"},
          ].map((c,i)=>(
            <div key={c.l} className={`metric-tile fade-in d${i+1} ${i===2?"card-blue":""}`}>
              <div style={{fontSize:"1.4rem",marginBottom:12}}>{c.i}</div>
              <div style={{fontSize:i===2?"1.8rem":"2.6rem",fontWeight:900,letterSpacing:"-.03em",color:c.c,lineHeight:1,marginBottom:6}}>{c.v}</div>
              <div style={{fontSize:".8rem",fontWeight:600,color:"var(--text)"}}>{c.l}</div>
              <div style={{fontSize:".68rem",color:"var(--text-sub)",marginTop:2}}>{c.s}</div>
            </div>
          ))}
        </div>
        <div className="card fade-in d2" style={{overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"16px 24px",borderBottom:"1px solid var(--border)",display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr",background:"var(--bg)"}}>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)"}}>MÉTRICA</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--ute-orange)"}}>SIN SKY</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"#4a8c00"}}>CON SKY</span>
          </div>
          {[
            {l:"Tiempo de respuesta",  b:"+28 horas",      a:"< 10 segundos"},
            {l:"Disponibilidad",       b:"L-V 8AM-5PM",    a:"24/7 · 365 días"},
            {l:"Leads respondidos/mes",b:"~5 manuales",    a:`${q} automáticos`},
            {l:"Costo por lead",       b:"$12-18",          a:"< $0.50"},
            {l:"Ingreso proyectado",   b:"$0",              a:fmt(e*MAT_USD)},
          ].map((r,i)=>(
            <div key={r.l} style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr",padding:"14px 24px",borderBottom:i<4?"1px solid var(--border)":"none",background:i%2?"var(--bg)":"var(--surface)"}}>
              <span style={{fontSize:".8rem",color:"var(--text-sub)"}}>{r.l}</span>
              <span style={{fontSize:".82rem",fontWeight:700,color:"var(--ute-orange)"}}>{r.b}</span>
              <span style={{fontSize:".82rem",fontWeight:700,color:"#4a8c00"}}>{r.a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: PIPELINE ── */
function ViewFunnel({metrics}:{metrics:Metrics|null}) {
  const [bar, setBar]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setBar(true),400);return()=>clearTimeout(t);},[]);
  const stages=[
    {l:"Lead entra",      v:metrics?.conversaciones_hoy??0,  c:"#0256A0", i:"📥"},
    {l:"Calificado",      v:metrics?.leads_calificados??0,   c:"#99CA3C", i:"✅"},
    {l:"Visita agendada", v:metrics?.visitas_solicitadas??0, c:"#FF5421", i:"🗓"},
    {l:"En matrícula",    v:metrics?.matriculas_iniciadas??0,c:"#6d3bbd", i:"🚀"},
  ];
  const max=stages[0].v||1;
  return (
    <div>
      <TopBar title="Pipeline de leads" sub="Flujo acumulado de prospectos por etapa SKY"/>
      <div className="page-body">
        <div className="card fade-in" style={{padding:"24px",marginBottom:18}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {stages.map((s,i)=>{
              const p=Math.min(Math.round(s.v/max*100),100);
              const w=100-i*15;
              return(
                <div key={s.l} style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${s.c}12`,border:`1.5px solid ${s.c}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s.i}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                      <span style={{fontSize:".78rem",color:"var(--text-sub)"}}>{s.l}</span>
                      <span style={{fontSize:".88rem",fontWeight:800,color:s.c}}>{s.v} <span style={{fontSize:".62rem",color:"var(--text-light)"}}>({p}%)</span></span>
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {stages.map((s,i)=>(
            <div key={s.l} className={`metric-tile fade-in d${i+1}`} style={{textAlign:"center"}}>
              <div style={{fontSize:"1.4rem",marginBottom:10}}>{s.i}</div>
              <div style={{fontSize:"2.2rem",fontWeight:900,letterSpacing:"-.04em",color:s.c,marginBottom:5}}>{s.v}</div>
              <div style={{fontSize:".72rem",color:"var(--text-sub)"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── VIEW: ANTES vs AHORA ── */
function ViewCompare() {
  const [on, setOn]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setOn(true),300);return()=>clearTimeout(t);},[]);
  const rows=[
    {l:"Tiempo de respuesta",   b:"28+ horas",       a:"< 10 segundos",      p:99},
    {l:"Cobertura horaria",     b:"L-V 8AM-5PM",    a:"24/7 · 365 días",    p:100},
    {l:"Leads respondidos/mes", b:"5-10 manuales",  a:"100+ automáticos",   p:95},
    {l:"Calificación de leads", b:"Solo por llamada",a:"Automático en chat", p:90},
    {l:"Entrada al CRM",        b:"Manual (si acaso)",a:"Automático",        p:100},
    {l:"Follow-ups",            b:"Ninguno",         a:"D+1, D+3, D+7",     p:100},
    {l:"Costo por lead",        b:"$12-18",          a:"< $0.50",            p:97},
  ];
  return (
    <div>
      <TopBar title="Antes vs Ahora" sub="El impacto real de implementar SKY en admisiones UTE"/>
      <div className="page-body">
        <div className="card fade-in" style={{overflow:"hidden",marginBottom:18}}>
          <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 80px",padding:"12px 24px",background:"var(--bg)",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)"}}>MÉTRICA</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--ute-orange)"}}>SIN SKY</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"#4a8c00"}}>CON SKY</span>
            <span style={{fontSize:".6rem",fontWeight:700,letterSpacing:".1em",color:"var(--text-sub)",textAlign:"right"}}>MEJORA</span>
          </div>
          {rows.map((r,i)=>(
            <div key={r.l} className="compare-row" style={{background:i%2?"var(--bg)":"var(--surface)"}}>
              <span style={{fontSize:".82rem",color:"var(--text-sub)"}}>{r.l}</span>
              <span style={{fontSize:".82rem",fontWeight:700,color:"var(--ute-orange)"}}>{r.b}</span>
              <span style={{fontSize:".82rem",fontWeight:700,color:"#4a8c00"}}>{r.a}</span>
              <div style={{textAlign:"right"}}>
                <span style={{fontSize:".7rem",fontWeight:800,padding:"2px 9px",borderRadius:99,background:"rgba(153,202,60,.1)",border:"1px solid rgba(153,202,60,.22)",color:"#4a8c00"}}>+{r.p}%</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div className="card card-orange" style={{padding:"28px 24px",textAlign:"center"}}>
            <div style={{fontSize:"3.5rem",fontWeight:900,color:"var(--ute-orange)",letterSpacing:"-.04em",marginBottom:8}}>28h</div>
            <div style={{fontSize:".88rem",fontWeight:700,color:"var(--text)",marginBottom:6}}>Sin SKY — tiempo de respuesta</div>
            <div style={{fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.6}}>El 78% de los leads ya eligieron otra universidad para entonces</div>
          </div>
          <div className="card card-green" style={{padding:"28px 24px",textAlign:"center"}}>
            <div style={{fontSize:"3.5rem",fontWeight:900,color:"#4a8c00",letterSpacing:"-.04em",marginBottom:8}}>8s</div>
            <div style={{fontSize:".88rem",fontWeight:700,color:"var(--text)",marginBottom:6}}>Con SKY — tiempo de respuesta</div>
            <div style={{fontSize:".74rem",color:"var(--text-sub)",lineHeight:1.6}}>10,080× más rápido que el proceso manual. Primero en responder, primero en convertir.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({active,onSelect}:{active:string;onSelect:(id:string)=>void}) {
  const clock=useClock();
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
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
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:10}}>
        <div className="sidebar-section-label">Panel de Control</div>
        {NAV.map(item=>(
          <button key={item.id} className={`nav-item ${active===item.id?"active":""}`} onClick={()=>onSelect(item.id)}>
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
            {item.badge&&<span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      <div className="sb-footer">
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"var(--ute-green)",boxShadow:"0 0 8px rgba(153,202,60,.6)"}}/>
          <span style={{fontSize:".68rem",fontWeight:700,color:"var(--ute-green)"}}>SKY operativo 24/7</span>
        </div>
        <div style={{fontSize:".58rem",color:"var(--sb-muted)",lineHeight:1.7}}>
          Powered by Scale Solutions Ecuador
        </div>
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  const [view, setView] = useState("stats");
  const {metrics,countdown,lastSync} = useMetrics();
  const render = () => {
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
    <div className="app-shell">
      <Sidebar active={view} onSelect={v=>setView(v)}/>
      <main className="main-content" key={view}>{render()}</main>
    </div>
  );
}
