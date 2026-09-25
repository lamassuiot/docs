/**
 * OpenAPI specs rendered by the API reference (app/routes/api-reference.tsx).
 * Also read by react-router.config.ts to prerender one page per service.
 */
export const API_SERVICES = [
  {
    id: 'ca',
    label: 'CA',
    description: 'Certificate Authority',
    url: 'https://www.lamassu.io/lamassuiot/ca-openapi.yaml',
  },
  {
    id: 'va',
    label: 'VA',
    description: 'Validation Authority',
    url: 'https://www.lamassu.io/lamassuiot/va-openapi.yaml',
  },
  {
    id: 'device-manager',
    label: 'Device Manager',
    description: 'Device lifecycle management',
    url: 'https://www.lamassu.io/lamassuiot/device-manager-openapi.yaml',
  },
  {
    id: 'dms-manager',
    label: 'DMS Manager',
    description: 'Device Manufacturing Service',
    url: 'https://www.lamassu.io/lamassuiot/dms-manager-openapi.yaml',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    description: 'Alerting & notifications',
    url: 'https://www.lamassu.io/lamassuiot/alerts-openapi.yaml',
  },
  {
    id: 'enroll-reenroll-webhook',
    label: 'Enroll/Reenroll Webhook',
    description: 'External EST enrollment authorization webhook',
    url: 'https://www.lamassu.io/lamassuiot/enroll-reenroll-webhook-openapi.yaml',
  },
] as const;
