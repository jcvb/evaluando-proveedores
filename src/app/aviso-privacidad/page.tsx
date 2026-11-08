import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, buildPageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Aviso de privacidad",
  description: `Aviso de privacidad de ${SITE.name} conforme a la LFPDPPP: datos que recabamos, finalidades, derechos ARCO y cookies.`,
  path: "/aviso-privacidad",
});

const UPDATED = "7 de noviembre de 2026";

export default function AvisoPrivacidadPage() {
  return (
    <LegalPage title="Aviso de privacidad integral" updatedAt={UPDATED}>
      <p>
        En cumplimiento de la <strong>Ley Federal de Protección de Datos Personales en Posesión de
        los Particulares</strong> (LFPDPPP), su Reglamento y los Lineamientos del Instituto Nacional
        de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI),{" "}
        <strong>{SITE.name}</strong> (el “Responsable”) pone a su disposición el presente Aviso de
        privacidad.
      </p>
      <p className="rounded-xl bg-muted px-4 py-3 text-sm">
        Este aviso aplica al sitio{" "}
        <Link href="/" className="text-primary underline">
          {absoluteUrl("/")}
        </Link>{" "}
        y a los servicios digitales asociados (cuentas, opiniones, reclamo de fichas, respuestas del
        negocio y moderación). Complementa los{" "}
        <Link href="/terminos" className="text-primary underline">
          Términos y condiciones
        </Link>
        .
      </p>

      <h2>1. Identidad y domicilio del Responsable</h2>
      <p>
        <strong>Responsable:</strong> {SITE.name}
        <br />
        <strong>Medio de contacto para privacidad y derechos ARCO:</strong>{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>
        <br />
        <strong>Sitio web:</strong> {absoluteUrl("/")}
      </p>
      <p>
        Si el Responsable cuenta con domicilio físico distinto para notificaciones formales, podrá
        comunicarlo mediante actualización de este Aviso. Mientras tanto, el canal principal es el
        correo indicado.
      </p>

      <h2>2. Datos personales que recabamos</h2>
      <p>Según el uso que haga del Sitio, podemos tratar las siguientes categorías:</p>
      <h3>2.1 Datos de identificación y contacto</h3>
      <ul>
        <li>Nombre o nombre visible en la cuenta.</li>
        <li>Correo electrónico.</li>
        <li>Contraseña (almacenada de forma cifrada o gestionada por el proveedor de autenticación).</li>
        <li>Rol en la plataforma (cliente, proveedor o administrador).</li>
      </ul>
      <h3>2.2 Datos relacionados con opiniones y fichas</h3>
      <ul>
        <li>
          Contenido de la opinión: título, descripción, calificación, veredicto, etiquetas, fechas
          de servicio, rangos de costo, datos de anticipo/contrato (sí/no o porcentajes).
        </li>
        <li>
          Datos de ubicación del servicio: código postal, estado, municipio, colonia,
          fraccionamiento y calle (cuando los proporcione).
        </li>
        <li>Fotografías y archivos que usted cargue como evidencia.</li>
        <li>
          Datos del negocio evaluado: nombre comercial, teléfonos, oficios, enlaces públicos,
          identificadores de mapas (p. ej. Google Place) cuando existan.
        </li>
        <li>Respuestas del negocio y evidencias que adjunte.</li>
      </ul>
      <h3>2.3 Datos técnicos y de navegación</h3>
      <ul>
        <li>Dirección IP, tipo de dispositivo/navegador, páginas visitadas y registros de seguridad.</li>
        <li>Cookies y tecnologías similares (ver sección 9).</li>
      </ul>
      <h3>2.4 Datos personales sensibles</h3>
      <p>
        El Sitio <strong>no solicita de forma intencional</strong> datos personales sensibles
        (p. ej. origen racial, estado de salud, creencias religiosas, datos biométricos). Le pedimos
        no incluirlos en opiniones ni fotos. Si por error quedan incluidos, podrá solicitar su
        eliminación o disociación conforme a la sección 6.
      </p>
      <h3>2.5 Datos de terceros</h3>
      <p>
        Si menciona a otras personas en una opinión o sube imágenes donde aparecen terceros, usted
        declara contar con legitimación o consentimiento cuando la ley lo exija, y asume la
        responsabilidad frente a ellos.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <h3>3.1 Finalidades primarias (necesarias para el servicio)</h3>
      <ul>
        <li>Crear y administrar su cuenta de Usuario.</li>
        <li>Permitir la publicación, visualización y moderación de opiniones y respuestas.</li>
        <li>Verificar reclamos de fichas de negocio y prevenir fraude o usurpación.</li>
        <li>Operar búsquedas, fichas públicas, feeds y mapas de contenido para descubrimiento.</li>
        <li>Atender reportes, ejercer moderación y cumplir obligaciones legales.</li>
        <li>Mantener seguridad, auditoría técnica y continuidad del servicio.</li>
        <li>Contactarlo respecto a su cuenta, opiniones o solicitudes ARCO.</li>
      </ul>
      <h3>3.2 Finalidades secundarias (opcionales)</h3>
      <ul>
        <li>Enviar avisos sobre novedades del Sitio o mejoras del servicio (si aplica).</li>
        <li>Elaborar estadísticas agregadas y no identificables sobre uso del Sitio.</li>
      </ul>
      <p>
        Si no desea que sus datos se usen para finalidades secundarias, puede oponerse enviando un
        correo a{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>{" "}
        con el asunto “Oposición a finalidades secundarias”. La negativa no afectará las
        finalidades primarias necesarias para prestar el servicio.
      </p>

      <h2>4. Información pública en el Sitio</h2>
      <p>
        Por la naturaleza de un directorio de opiniones, <strong>ciertos datos se hacen públicos</strong>{" "}
        al publicar o reclamar un perfil, entre ellos: nombre del negocio, teléfonos de contacto del
        negocio, ubicación general, oficios, calificaciones, texto de la opinión, fotografías
        aportadas y respuestas del negocio.
      </p>
      <p>
        En las fichas públicas, el Sitio procura <strong>no mostrar el nombre del autor</strong> de
        la opinión (“Escrito por”). Aun así, el contenido de la opinión podría permitir
        inferencias; publíquela con prudencia.
      </p>

      <h2>5. Transferencias de datos</h2>
      <p>Podemos transferir datos personales a:</p>
      <ul>
        <li>
          <strong>Proveedores de servicios tecnológicos</strong> (alojamiento, base de datos,
          autenticación, almacenamiento de archivos, correo o analítica), actuando como
          encargados conforme a la LFPDPPP, solo para las finalidades de este Aviso.
        </li>
        <li>
          <strong>Autoridades competentes</strong> cuando exista fundamento legal, requerimiento
          fundado y motivado, o para salvaguardar derechos del Responsable o de terceros.
        </li>
      </ul>
      <p>
        No vendemos bases de datos de Usuarios. Cualquier transferencia adicional que requiera
        consentimiento se le informará oportunamente.
      </p>

      <h2>6. Derechos ARCO y revocación del consentimiento</h2>
      <p>
        Usted puede ejercer los derechos de <strong>Acceso, Rectificación, Cancelación y
        Oposición</strong> (ARCO), así como revocar el consentimiento para el tratamiento, en los
        términos de la LFPDPPP.
      </p>
      <p>
        <strong>Cómo ejercerlos:</strong> envíe un correo a{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>{" "}
        con el asunto “Derechos ARCO”, incluyendo:
      </p>
      <ul>
        <li>Nombre completo y medio para notificarle la respuesta.</li>
        <li>Descripción clara del derecho que desea ejercer y de los datos involucrados.</li>
        <li>
          Documento o información que acredite su identidad (y, en su caso, la representación
          legal).
        </li>
        <li>Cualquier elemento que facilite la localización de los datos.</li>
      </ul>
      <p>
        Responderemos en los plazos previstos por la LFPDPPP y su Reglamento. Si la solicitud es
        sobre Contenido publicado (opiniones/fotos), evaluaremos la procedencia conforme a la ley,
        estos intereses legítimos de transparencia del Sitio y los{" "}
        <Link href="/terminos" className="text-primary underline">
          Términos y condiciones
        </Link>
        ; en algunos casos la cancelación puede consistir en disociación, ocultamiento parcial o
        limitación de visibilidad, cuando la eliminación total afecte derechos de terceros o
        registros necesarios.
      </p>
      <p>
        También puede presentar una denuncia o queja ante el <strong>INAI</strong> (
        <a href="https://home.inai.org.mx/" className="text-primary underline" target="_blank" rel="noreferrer">
          home.inai.org.mx
        </a>
        ) si considera que su derecho a la protección de datos ha sido vulnerado.
      </p>

      <h2>7. Limitación de uso o divulgación</h2>
      <p>
        Para solicitar la limitación del uso o divulgación de sus datos (cuando proceda), utilice el
        mismo canal de la sección 6, indicando la medida concreta que solicita y su fundamento.
      </p>

      <h2>8. Conservación</h2>
      <p>
        Conservaremos los datos mientras exista la cuenta, mientras el Contenido permanezca
        publicado conforme a las reglas del Sitio, y por los plazos adicionales necesarios para
        obligaciones legales, defensa de reclamos, seguridad y auditoría. Los registros técnicos
        suelen conservarse por periodos más cortos, salvo incidente de seguridad o requerimiento
        legal.
      </p>

      <h2>9. Cookies y tecnologías similares</h2>
      <p>El Sitio puede utilizar cookies propias y de terceros para:</p>
      <ul>
        <li>Mantener la sesión autenticada y preferencias básicas.</li>
        <li>Seguridad (prevención de abuso y fraude).</li>
        <li>Medición agregada de audiencia o rendimiento, si se habilita.</li>
      </ul>
      <p>
        Puede configurar su navegador para rechazar cookies. Algunas funciones (p. ej. iniciar
        sesión) podrían no operar correctamente sin ellas.
      </p>

      <h2>10. Medidas de seguridad</h2>
      <p>
        Implementamos medidas administrativas, técnicas y físicas razonables para proteger los datos
        personales contra daño, pérdida, alteración, destrucción o uso no autorizado. Ningún
        sistema es 100% invulnerable; ante una vulneración relevante que afecte sus datos, se
        seguirán los procedimientos aplicables de la normativa mexicana.
      </p>

      <h2>11. Menores de edad</h2>
      <p>
        El Sitio está dirigido a personas mayores de 18 años. No recabamos de forma consciente datos
        de menores. Si usted identifica datos de un menor, contáctenos para su atención.
      </p>

      <h2>12. Cambios al Aviso de privacidad</h2>
      <p>
        Cualquier modificación al presente Aviso se publicará en esta página con la fecha de
        actualización. Cuando el cambio sea sustancial, podremos avisarlo por medios visibles en el
        Sitio o por correo, según corresponda.
      </p>

      <h2>13. Consentimiento</h2>
      <p>
        Al usar el Sitio, crear una cuenta o proporcionar datos personales, usted reconoce haber
        leído este Aviso y otorga su consentimiento para el tratamiento conforme a las finalidades
        primarias. Para finalidades secundarias, podrá oponerse en los términos de la sección 3.2.
      </p>

      <h2>14. Contacto</h2>
      <p>
        Privacidad y ARCO:{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>
      </p>
    </LegalPage>
  );
}
