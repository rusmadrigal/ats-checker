import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aviso legal | ATS Resume Checker',
  description: 'Información legal sobre el titular del sitio ATS Resume Checker.',
};

export default function AvisoLegalPage() {
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
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Aviso legal</h1>
        <p className="text-muted-foreground mb-10 text-sm">Última actualización: 10 de abril de 2026</p>

        <div className="space-y-8 text-sm leading-relaxed sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Datos identificativos</h2>
            <p className="text-muted-foreground">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la
              sociedad de la información y de comercio electrónico, se informa de que el titular del sitio
              web ATS Resume Checker debe completar en este apartado su denominación social o nombre y
              apellidos, NIF/CIF, domicilio, correo electrónico y, en su caso, datos registrales.{' '}
              <strong className="text-foreground">
                Si eres quien despliega esta aplicación, sustituye este párrafo por tus datos reales.
              </strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Objeto y condiciones de uso</h2>
            <p className="text-muted-foreground">
              El sitio ofrece una herramienta de análisis orientativa de currículum respecto a buenas
              prácticas frecuentes en sistemas ATS (Applicant Tracking Systems). El resultado es informativo
              y no constituye asesoramiento laboral, jurídico ni garantía de selección. El uso del sitio
              implica la aceptación de este aviso y de las políticas vinculadas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Propiedad intelectual e industrial</h2>
            <p className="text-muted-foreground">
              Los contenidos del sitio (textos, diseño, logotipos, código y recursos) están protegidos por
              la normativa aplicable. Queda prohibida su reproducción o distribución sin autorización,
              salvo lo permitido por la ley.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Responsabilidad</h2>
            <p className="text-muted-foreground">
              El titular no se responsabiliza del mal uso del sitio ni de los daños derivados del uso de la
              información generada. El usuario es responsable de la licitud del contenido que sube y de no
              infringir derechos de terceros. Se adoptan medidas razonables de seguridad, sin que ello
              implique garantía absoluta frente a incidentes ajenos al ámbito de control del titular.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Enlaces</h2>
            <p className="text-muted-foreground">
              El sitio puede incluir enlaces a terceros. El titular no controla esos sitios y no se hace
              responsable de sus contenidos o políticas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Legislación aplicable</h2>
            <p className="text-muted-foreground">
              Las relaciones derivadas del uso del sitio se regirán por la legislación española. Los
              tribunales competentes serán los que correspondan legalmente, sin perjuicio de normas
              imperativas del consumidor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Documentos relacionados</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-2">
              <li>
                <Link href="/privacidad" className="text-primary font-medium underline underline-offset-2">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-primary font-medium underline underline-offset-2">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
