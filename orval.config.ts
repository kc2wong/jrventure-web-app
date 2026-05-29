import { defineConfig, type OpenApiDocument } from 'orval';

// Class is a JS reserved word — rename to SchoolClass before orval processes it
const classTransformer = (spec: OpenApiDocument): OpenApiDocument => {
  const raw = JSON.stringify(spec);
  const renamed = raw.replace(/"#\/components\/schemas\/Class"/g, '"#/components/schemas/SchoolClass"');
  const newSpec = JSON.parse(renamed) as OpenApiDocument;
  if (newSpec.components?.schemas?.['Class']) {
    newSpec.components.schemas['SchoolClass'] = newSpec.components.schemas['Class'];
    delete newSpec.components.schemas['Class'];
  }
  return newSpec;
};


export default defineConfig({
  'openapi-client': {
    input: {
      target: 'https://raw.githubusercontent.com/kc2wong/jrventure-web-api/refs/heads/main/resources/openapi/api-spec.yaml',
      override: { transformer: classTransformer },
    },
    output: {
      mode: 'tags',
      client: 'axios',
      target: './src/__generated__/openapi-client/index.ts',
      override: {
        mutator: {
          path: './src/utils/backend-client.ts',
          name: 'backendMutator',
        },
      },
    },
  },
});
