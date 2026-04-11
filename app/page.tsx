import App from '@/src/app/App';
import { RootJsonLd } from '@/src/app/components/RootJsonLd';

export default function HomePage() {
  return (
    <>
      <RootJsonLd />
      <App />
    </>
  );
}
