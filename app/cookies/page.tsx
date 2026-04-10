import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de cookies | ATS Resume Checker',
  description: 'Uso de cookies y tecnologías similares en ATS Resume Checker.',
};

export default function CookiesPage() {
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
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Política de cookies</h1>
        <p className="text-muted-foreground mb-10 text-sm">Última actualización: 10 de abril de 2026</p>

        <div className="space-y-8 text-sm leading-relaxed sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Qué son las cookies</h2>
            <p className="text-muted-foreground">
              Las cookies son pequeños archivos que los sitios web almacenan en tu navegador para recordar
              preferencias, mantener sesiones o medir el uso. También existen tecnologías similares (p.
              ej. almacenamiento local del navegador).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Cómo usamos cookies y almacenamiento local</h2>
            <p className="text-muted-foreground">
              Esta aplicación está pensada para funcionar con el mínimo indispensable. Es posible que
              utilicemos:
            </p>
            <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-1">
              <li>
                <strong className="text-foreground">Cookies técnicas / necesarias:</strong> para el correcto
                funcionamiento del sitio, seguridad o equilibrio de carga.
              </li>
              <li>
                <strong className="text-foreground">Almacenamiento en el navegador (sessionStorage):</strong>{' '}
                para recordar en la pestaña actual el resultado del análisis y la vista previa, de modo que
                no pierdas el trabajo al refrescar. Estos datos no se envían automáticamente a nuestros
                servidores como «cookies»; permanecen en tu dispositivo hasta que cierres la pestaña o los
                borres.
              </li>
              <li>
                <strong className="text-foreground">Cookies de análisis o de terceros:</strong> solo si en
                el futuro se integran y se te solicita consentimiento de forma explícita conforme a la
                normativa aplicable.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Gestión de preferencias</h2>
            <p className="text-muted-foreground">
              Puedes bloquear o eliminar cookies desde la configuración de tu navegador. Ten en cuenta que,
              si desactivas cookies técnicas necesarias, algunas partes del sitio podrían no funcionar
              correctamente. Para borrar el contenido guardado de la sesión de análisis en esta aplicación,
              puedes usar la opción de quitar vista previa o limpiar los datos del sitio en tu
              navegador.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Más información</h2>
            <p className="text-muted-foreground">
              Para el tratamiento de datos personales derivado del uso del servicio, consulta nuestra{' '}
              <Link href="/privacidad" className="text-primary font-medium underline underline-offset-2">
                política de privacidad
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
