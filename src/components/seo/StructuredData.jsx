'use client';
import { toJsonLd } from '@/lib/json-ld';

const StructuredData = ({ data }) => {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(data) }}
    />
  );
};

export default StructuredData;
