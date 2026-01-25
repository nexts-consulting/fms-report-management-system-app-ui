import type { OpenNextConfig } from '@opennextjs/cloudflare';

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      incrementalCache: 's3-lite',
      queue: 'sqs-lite',
      tagCache: 'dummy',
    },
  },
};

export default config;

