// import { Thing, WithContext } from 'schema-dts';

interface JsonLdProps {
  data: any; // Relaxed type for flexibility
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
