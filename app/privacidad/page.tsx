import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de privacidad | ATS Resume Checker',
  description:
    'Información sobre el tratamiento de datos personales al usar el analizador de currículum ATS Resume Checker.',
};

export default function PrivacidadPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border/80 bg-background/90 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-32">
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Política de privacidad
        </h1>
        <p className="text-muted-foreground mb-10 text-sm">
          Última actualización: 10 de abril de 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Responsable del tratamiento</h2>
            <p className="text-muted-foreground">
              El responsable del sitio web y de las herramientas ofrecidas en ATS Resume Checker es
              quien opera el dominio y la infraestructura donde se aloja esta aplicación (en
              adelante, «nosotros» o «el responsable»). Para ejercer tus derechos o resolver dudas
              sobre privacidad, utiliza los medios de contacto publicados en el{' '}
              <Link
                href="/aviso-legal"
                className="text-primary font-medium underline underline-offset-2"
              >
                aviso legal
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Finalidad y base legal</h2>
            <p className="text-muted-foreground">
              Tratamos los datos que nos facilitas exclusivamente para permitirte utilizar el
              servicio de análisis y mejora de currículum: extraer texto del archivo que subes (PDF
              o DOCX), ejecutar comprobaciones automáticas, generar sugerencias y, cuando
              corresponda, invocar procesamiento con IA en el servidor para la vista previa
              estructurada o la exportación. La base legal es la ejecución del servicio solicitado
              por ti (art. 6.1.b RGPD) y, en su caso, tu consentimiento cuando la ley lo exija (p.
              ej. cookies no esenciales).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Categorías de datos</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-1">
              <li>
                Datos incluidos en el CV que envías (p. ej. nombre, contacto, historial laboral,
                formación).
              </li>
              <li>
                Metadatos técnicos necesarios para la prestación del servicio (p. ej. tipo de
                archivo, logs técnicos breves en el servidor).
              </li>
              <li>
                Datos almacenados localmente en tu dispositivo cuando la aplicación guarda una
                sesión en el navegador (por ejemplo, resultados en{' '}
                <code className="text-foreground text-xs">sessionStorage</code>
                ), sin que ello implique una cuenta de usuario en nuestros sistemas.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Conservación</h2>
            <p className="text-muted-foreground">
              Los archivos y el texto extraído se procesan para atender tu solicitud en el momento.
              No conservamos copias de tus CV con fines de elaboración de perfiles comerciales ni
              para cederlos a terceros. Los proveedores de infraestructura o de modelos de IA pueden
              aplicar sus propias políticas de retención transitoria conforme a sus condiciones; te
              recomendamos revisar la configuración de tu proveedor de IA si utilizas claves
              propias.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Destinatarios y encargados del tratamiento</h2>
            <p className="text-muted-foreground">
              Podemos utilizar proveedores de alojamiento, analítica (si la activas) y, cuando
              configures integración con IA, el proveedor de dicho servicio actuará como encargado o
              subencargado en la medida en que procese datos por nuestra cuenta. No vendemos tus
              datos personales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Transferencias internacionales</h2>
            <p className="text-muted-foreground">
              Si algún proveedor trata datos fuera del Espacio Económico Europeo, aplicaremos las
              garantías previstas en el RGPD (decisiones de adecuación, cláusulas tipo u otras
              medidas válidas).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Tus derechos</h2>
            <p className="text-muted-foreground">
              Puedes ejercer los derechos de acceso, rectificación, supresión, limitación, oposición
              y portabilidad cuando correspondan, así como retirar el consentimiento en cualquier
              momento, dirigiéndote al responsable. Tienes derecho a reclamar ante la autoridad de
              control (en España, la AEPD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Menores</h2>
            <p className="text-muted-foreground">
              El servicio no está dirigido a menores de 16 años. Si detectamos que se han tratado
              datos de menores sin el consentimiento adecuado, procederemos a su eliminación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Cambios</h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta política para reflejar cambios legales o del servicio.
              Publicaremos la versión vigente en esta página con su fecha de actualización.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
