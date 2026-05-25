export default function DeleteData() {
  return (
    <div style={{maxWidth:640,margin:"0 auto",padding:"60px 32px 80px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#171F32",lineHeight:1.7}}>
      <div style={{marginBottom:40}}>
        <div style={{fontSize:".72rem",fontWeight:700,letterSpacing:".12em",color:"#0256A0",marginBottom:8}}>SCALE SOLUTIONS</div>
        <h1 style={{fontSize:"2rem",fontWeight:900,letterSpacing:"-.03em",marginBottom:8}}>Eliminación de Datos</h1>
        <p style={{color:"#4a5568",fontSize:".88rem"}}>Solicitud de eliminación de datos personales</p>
      </div>

      <div style={{padding:"24px",borderRadius:12,background:"#F0F4F8",border:"1px solid #E2E8F0",marginBottom:32}}>
        <h2 style={{fontSize:"1rem",fontWeight:700,color:"#0256A0",marginBottom:12}}>¿Cómo solicitar la eliminación de tus datos?</h2>
        <p style={{fontSize:".88rem",color:"#4a5568",marginBottom:16}}>
          Para solicitar la eliminación de todos tus datos personales de nuestros sistemas, envía un correo electrónico con el asunto <strong>"Eliminación de datos"</strong> incluyendo:
        </p>
        <ul style={{paddingLeft:20,fontSize:".88rem",color:"#4a5568"}}>
          <li>Tu nombre completo</li>
          <li>Tu número de teléfono registrado</li>
          <li>Descripción breve de los datos que deseas eliminar</li>
        </ul>
      </div>

      <div style={{padding:"20px 24px",borderRadius:12,background:"#fff",border:"1.5px solid #0256A020",marginBottom:32}}>
        <div style={{fontSize:".72rem",fontWeight:700,letterSpacing:".1em",color:"#0256A0",marginBottom:8}}>CONTACTO</div>
        <div style={{fontSize:".92rem",fontWeight:600,color:"#171F32"}}>privacidad@scalesolutions.ec</div>
        <div style={{fontSize:".8rem",color:"#4a5568",marginTop:4}}>Tiempo de respuesta: máximo 72 horas hábiles</div>
      </div>

      <p style={{fontSize:".82rem",color:"#4a5568"}}>
        Una vez recibida tu solicitud, eliminaremos todos tus datos personales de nuestros sistemas en un plazo máximo de <strong>30 días</strong>, conforme a nuestra <a href="/privacy" style={{color:"#0256A0"}}>Política de Privacidad</a>.
      </p>

      <div style={{marginTop:48,paddingTop:24,borderTop:"1px solid #E2E8F0",fontSize:".75rem",color:"#8a9bb5"}}>
        © 2026 Scale Solutions. Todos los derechos reservados.
      </div>
    </div>
  );
}
