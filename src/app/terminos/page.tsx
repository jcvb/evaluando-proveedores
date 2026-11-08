import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, buildPageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Términos y condiciones",
  description: `Términos y condiciones de uso de ${SITE.name}, plataforma de opiniones sobre oficios y talleres en México.`,
  path: "/terminos",
});

const UPDATED = "7 de noviembre de 2026";

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones de uso" updatedAt={UPDATED}>
      <p>
        Estos Términos y condiciones (los “Términos”) regulan el acceso y uso del sitio web{" "}
        <Link href="/" className="text-primary underline">
          {absoluteUrl("/")}
        </Link>{" "}
        y de los servicios asociados de <strong>{SITE.name}</strong> (el “Sitio” o la “Plataforma”),
        orientado a la publicación y consulta de opiniones sobre maestros de oficio, talleres y negocios
        afines en los Estados Unidos Mexicanos.
      </p>
      <p>
        Al crear una cuenta, publicar contenido o simplemente navegar el Sitio, usted (el “Usuario”)
        acepta estos Términos. Si no está de acuerdo, absténgase de usar la Plataforma.
      </p>
      <p className="rounded-xl bg-muted px-4 py-3 text-sm">
        Este documento es un marco contractual de uso de una plataforma digital de contenido generado
        por usuarios. No constituye asesoría jurídica personalizada. Para disputas específicas entre
        clientes y proveedores, aplique la legislación civil, mercantil y de protección al consumidor
        que corresponda.
      </p>

      <h2>1. Identidad del responsable del Sitio</h2>
      <p>
        El Sitio es operado bajo la denominación <strong>{SITE.name}</strong>. Para notificaciones
        relacionadas con estos Términos:{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>
        . El tratamiento de datos personales se rige por el{" "}
        <Link href="/aviso-privacidad" className="text-primary underline">
          Aviso de privacidad
        </Link>
        .
      </p>

      <h2>2. Objeto del servicio</h2>
      <p>{SITE.name} es una plataforma informativa que permite, entre otras cosas:</p>
      <ul>
        <li>Consultar fichas de negocios y opiniones publicadas por otros Usuarios.</li>
        <li>Publicar opiniones sobre experiencias de contratación de oficios, con evidencia fotográfica.</li>
        <li>Que el titular o representante de un negocio reclame su ficha y responda a opiniones.</li>
        <li>Facilitar la toma de decisiones previas a contratar un servicio.</li>
      </ul>
      <p>
        El Sitio <strong>no</strong> es intermediario de contratos de obra o servicios, no garantiza
        la calidad de los trabajos contratados fuera de la Plataforma, no cobra comisiones por
        contrataciones entre Usuarios y proveedores, y no sustituye a burós de crédito, registros
        públicos ni organismos de conciliación (PROFECO u otros).
      </p>

      <h2>3. Elegibilidad y cuenta</h2>
      <ol>
        <li>Debe tener al menos 18 años y capacidad legal conforme a la legislación mexicana.</li>
        <li>
          Es responsable de la veracidad de los datos de registro y de custodiar sus credenciales de
          acceso.
        </li>
        <li>
          Queda prohibido suplantar identidades, crear cuentas automatizadas abusivas o usar el Sitio
          para hostigar, extorsionar o dañar la reputación de terceros de forma ilícita.
        </li>
        <li>
          Podemos suspender o cancelar cuentas ante incumplimiento de estos Términos, fraude, abuso
          reiterado o requerimiento de autoridad competente.
        </li>
      </ol>

      <h2>4. Opiniones y contenido generado por el Usuario</h2>
      <h3>4.1 Naturaleza del contenido</h3>
      <p>
        Las opiniones, calificaciones, fotografías, títulos, descripciones, etiquetas y respuestas
        del negocio (en conjunto, el “Contenido”) son responsabilidad exclusiva de quien las publica.
        {SITE.name} actúa como medio de alojamiento y difusión, sin adoptar como propios los
        juicios de valor de los Usuarios.
      </p>
      <h3>4.2 Reglas de publicación</h3>
      <p>Al publicar, usted declara y se obliga a que el Contenido:</p>
      <ul>
        <li>Se basa en una experiencia real de contratación o intento de contratación.</li>
        <li>Incluye al menos una fotografía pertinente (trabajo, problema, comprobante o evidencia).</li>
        <li>
          No incluye datos personales sensibles ajenos, números de cuentas bancarias, documentos
          oficiales completos de terceros, ni información de menores de edad.
        </li>
        <li>
          No es difamatorio doloso, engañoso, discriminatorio, obsceno, ni constituye amenaza,
          calumnia o delito tipificado en el Código Penal Federal o códigos locales.
        </li>
        <li>No infringe derechos de autor, marcas u otros derechos de propiedad intelectual.</li>
        <li>
          No se usa para competencia desleal, publicidad encubierta pagada sin revelarlo, ni para
          eliminar o manipular opiniones a cambio de dinero fuera de los mecanismos del Sitio.
        </li>
      </ul>
      <h3>4.3 Permanencia y no borrado por el negocio</h3>
      <p>
        Una característica central del Sitio es que el negocio puede responder a una opinión, pero{" "}
        <strong>no puede borrarla unilateralmente</strong>. El autor puede, en los casos que el
        sistema permita, marcar una situación como resuelta; la historia permanece visible para
        transparencia. El Sitio podrá ocultar, editar mínimamente (p. ej. datos personales expuestos
        por error) o retirar Contenido cuando:
      </p>
      <ul>
        <li>Viole estos Términos o la ley aplicable.</li>
        <li>Exista orden de autoridad judicial o administrativa competente.</li>
        <li>Se acredite de forma razonable usurpación, fraude o contenido claramente falso.</li>
        <li>Sea necesario por seguridad, moderación o protección de derechos de terceros.</li>
      </ul>
      <h3>4.4 Licencia sobre el Contenido</h3>
      <p>
        Usted conserva la titularidad de su Contenido. Al publicarlo, otorga a {SITE.name} una
        licencia no exclusiva, gratuita, mundial, transferible y sublicenciable para alojar,
        reproducir, comunicar públicamente, adaptar el formato (p. ej. miniaturas) y difundir el
        Contenido en el Sitio, feeds, mapas para agentes de IA y canales de promoción del propio
        servicio, mientras el Contenido permanezca publicado conforme a estas reglas.
      </p>

      <h2>5. Reclamo de fichas de negocio</h2>
      <p>
        Quien reclame un perfil declara ser el titular, representante legal o persona autorizada del
        negocio. El Sitio puede pedir datos de verificación y rechazar o revocar el reclamo ante
        indicios de fraude. El acceso de “proveedor” permite responder opiniones; no implica
        certificación oficial de calidad ni aval gubernamental.
      </p>

      <h2>6. Uso aceptable</h2>
      <p>Queda prohibido, entre otros:</p>
      <ul>
        <li>Extraer masivamente datos (scraping abusivo) con fines comerciales no autorizados.</li>
        <li>Intentar vulnerar la seguridad, eludir controles o alterar calificaciones.</li>
        <li>Usar el Sitio para spam, phishing o envío de malware.</li>
        <li>
          Presentar las opiniones del Sitio como dictámenes periciales, sentencias o actos de
          autoridad.
        </li>
      </ul>

      <h2>7. Propiedad intelectual del Sitio</h2>
      <p>
        Marcas, tipografías, diseño, software, bases de datos de catálogo (p. ej. oficios) y demás
        elementos propios de {SITE.name} están protegidos por la Ley Federal del Derecho de Autor y
        demás legislación aplicable. Queda prohibida su reproducción no autorizada fuera del uso
        legítimo del servicio.
      </p>

      <h2>8. Exención y limitación de responsabilidad</h2>
      <ol>
        <li>
          Las opiniones reflejan experiencias subjetivas. Verifique por su cuenta referencias,
          contratos, garantías y cotizaciones antes de contratar.
        </li>
        <li>
          En la medida máxima permitida por la ley mexicana, {SITE.name} no responde por daños
          indirectos, lucro cesante, pérdida de chance o perjuicios derivados de confiar
          exclusivamente en el Contenido publicado por terceros.
        </li>
        <li>
          El Sitio se ofrece “tal cual” y “según disponibilidad”. Pueden existir interrupciones,
          errores o demoras técnicas.
        </li>
        <li>
          Nada en estos Términos limita derechos irrenunciables del consumidor conforme a la Ley
          Federal de Protección al Consumidor, cuando resulte aplicable a la relación con el
          operador del Sitio (no a la relación Usuario–proveedor externo).
        </li>
      </ol>

      <h2>9. Enlaces y servicios de terceros</h2>
      <p>
        El Sitio puede mostrar enlaces a Google Maps, redes sociales, autenticación o almacenamiento
        (p. ej. proveedores de nube). Su uso se rige también por los términos de esos terceros.
      </p>

      <h2>10. Moderación y reportes</h2>
      <p>
        Puede reportar Contenido ilícito o que infrinja estos Términos al correo{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>
        , indicando URL, motivo y, de ser posible, pruebas. Atenderemos reportes de buena fe en
        plazos razonables, sin obligación de dar trámite a denuncias anónimas abusivas o reiteradas
        sin fundamento.
      </p>

      <h2>11. Protección de datos personales</h2>
      <p>
        El tratamiento de datos personales se describe en el{" "}
        <Link href="/aviso-privacidad" className="text-primary underline">
          Aviso de privacidad
        </Link>
        , elaborado conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
        Particulares (LFPDPPP), su Reglamento y Lineamientos del INAI.
      </p>

      <h2>12. Modificaciones</h2>
      <p>
        Podemos actualizar estos Términos. La fecha de “Última actualización” indica la vigencia.
        El uso continuado del Sitio tras cambios relevantes implica aceptación, salvo que la ley
        exija un consentimiento distinto.
      </p>

      <h2>13. Legislación aplicable y jurisdicción</h2>
      <p>
        Estos Términos se interpretan conforme a las leyes de los Estados Unidos Mexicanos. Para
        controversias derivadas del uso del Sitio, las partes se someten a los tribunales
        competentes en México, sin perjuicio de fueros protectores del consumidor cuando procedan.
      </p>

      <h2>14. Contacto</h2>
      <p>
        Dudas sobre estos Términos:{" "}
        <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">
          {SITE.legalEmail}
        </a>
        .
      </p>
    </LegalPage>
  );
}
