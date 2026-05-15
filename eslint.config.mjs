import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const ignored = [
  '.next/**',
  'node_modules/**',
  'public/**',
  'supabase/**',
  '*.md',
  '*.sql',
];

export default [
  { ignores: ignored },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];
