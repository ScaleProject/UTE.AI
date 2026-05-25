export default function Privacy() {
  return (
    <div style={{maxWidth:720,margin:"0 auto",padding:"60px 32px 80px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#171F32",lineHeight:1.7}}>
      <div style={{marginBottom:40}}>
        <div style={{fontSize:".72rem",fontWeight:700,letterSpacing:".12em",color:"#0256A0",marginBottom:8}}>SCALE SOLUTIONS</div>
        <h1 style={{fontSize:"2rem",fontWeight:900,letterSpacing:"-.03em",marginBottom:8}}>Política de Privacidad</h1>
        <p style={{color:"#4a5568",fontSize:".88rem"}}>Última actualización: 23 de mayo de 2026</p>
      </div>

      <Section title="1. Información General">
        Esta política de privacidad describe cómo <strong>Scale Solutions</strong> ("nosotros", "nuestra aplicación") recopila, usa y protege la información que los usuarios proporcionan al interactuar con nuestros servicios de automatización vía WhatsApp Business API y plataformas conectadas.
      </Section>

      <Section title="2. Datos que Recopilamos">
        <p>Al interactuar con nuestros agentes de WhatsApp recopilamos:</p>
        <ul style={{paddingLeft:20,marginTop:8}}>
          <li>Número de teléfono de WhatsApp</li>
          <li>Nombre y apellido (cuando el usuario lo proporciona voluntariamente)</li>
          <li>Contenido de los mensajes enviados al agente</li>
          <li>Carrera o servicio de interés</li>
          <li>Preferencias de horario y forma de pago (cuando aplica)</li>
          <li>Fecha y hora de la interacción</li>
        </ul>
      </Section>

      <Section title="3. Cómo Usamos los Datos">
        <p>Los datos recopilados se utilizan exclusivamente para:</p>
        <ul style={{paddingLeft:20,marginTop:8}}>
          <li>Responder consultas y brindar información relevante al usuario</li>
          <li>Agendar visitas o citas solicitadas por el usuario</li>
          <li>Registrar el interés del usuario en nuestro CRM interno</li>
          <li>Enviar seguimientos relacionados con la consulta original</li>
          <li>Mejorar la calidad de nuestras respuestas automatizadas</li>
        </ul>
        <p style={{marginTop:12}}>No vendemos, alquilamos ni compartimos datos personales con terceros con fines comerciales.</p>
      </Section>

      <Section title="4. Almacenamiento y Seguridad">
        Los datos se almacenan en servidores seguros ubicados en la Unión Europea (Hetzner Cloud) y en servicios de terceros de confianza (n8n, Pipedrive) que cumplen con estándares de seguridad internacionales. Implementamos medidas técnicas y organizativas para proteger la información contra acceso no autorizado.
      </Section>

      <Section title="5. Retención de Datos">
        Los datos de conversación se conservan por un período máximo de <strong>12 meses</strong> desde la última interacción. Los datos de CRM se conservan mientras el usuario sea considerado un prospecto activo o cliente.
      </Section>

      <Section title="6. Derechos del Usuario">
        <p>Usted tiene derecho a:</p>
        <ul style={{paddingLeft:20,marginTop:8}}>
          <li><strong>Acceder</strong> a los datos que tenemos sobre usted</li>
          <li><strong>Corregir</strong> información inexacta</li>
          <li><strong>Eliminar</strong> sus datos de nuestros sistemas</li>
          <li><strong>Oponerse</strong> al procesamiento de sus datos</li>
        </ul>
        <p style={{marginTop:12}}>Para ejercer estos derechos, contáctenos en <strong>privacidad@scalesolutions.ec</strong></p>
      </Section>

      <Section title="7. WhatsApp y Meta">
        Esta aplicación utiliza la API de WhatsApp Business de Meta Platforms, Inc. El uso de WhatsApp está sujeto a los <a href="https://www.whatsapp.com/legal/terms-of-service" style={{color:"#0256A0"}}>Términos de Servicio de WhatsApp</a> y la <a href="https://www.facebook.com/privacy/policy" style={{color:"#0256A0"}}>Política de Privacidad de Meta</a>. No almacenamos el contenido de mensajes más allá de lo necesario para procesar la respuesta automatizada.
      </Section>

      <Section title="8. Cookies y Tecnologías de Seguimiento">
        Nuestro dashboard web utiliza cookies de sesión estrictamente necesarias para el funcionamiento. No utilizamos cookies de rastreo de terceros ni publicidad.
      </Section>

      <Section title="9. Cambios a esta Política">
        Nos reservamos el derecho de actualizar esta política en cualquier momento. Los cambios materiales serán notificados con al menos 30 días de anticipación. El uso continuado de nuestros servicios tras la notificación implica aceptación de los cambios.
      </Section>

      <Section title="10. Contacto">
        <p>Para consultas sobre privacidad, solicitudes de eliminación de datos o cualquier pregunta relacionada:</p>
        <div style={{marginTop:12,padding:"16px 20px",borderRadius:10,background:"#F0F4F8",border:"1px solid #E2E8F0"}}>
          <div><strong>Scale Solutions</strong></div>
          <div style={{color:"#4a5568",marginTop:4}}>Email: privacidad@scalesolutions.ec</div>
          <div style={{color:"#4a5568"}}>País: Ecuador</div>
        </div>
      </Section>

      <div style={{marginTop:48,paddingTop:24,borderTop:"1px solid #E2E8F0",fontSize:".75rem",color:"#8a9bb5"}}>
        © 2026 Scale Solutions. Todos los derechos reservados.
      </div>
    </div>
  );
}

function Section({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{marginBottom:32}}>
      <h2 style={{fontSize:"1rem",fontWeight:700,color:"#0256A0",marginBottom:10,paddingBottom:8,borderBottom:"1px solid #E2E8F0"}}>{title}</h2>
      <div style={{fontSize:".88rem",color:"#4a5568"}}>{children}</div>
    </div>
  );
}
