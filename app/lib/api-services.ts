/**
 * OpenAPI specs rendered by the API reference (app/routes/api-reference.tsx).
 * Also read by react-router.config.ts to prerender one page per service.
 *
 * Served raw from the lamassuiot repo's default branch (HEAD): the old
 * www.lamassu.io/lamassuiot/ GitHub Pages site has been retired.
 */
export const API_SERVICES = [
  {
    id: 'ca',
    label: 'CA',
    description: 'Certificate Authority',
    url: 'https://raw.githubusercontent.com/lamassuiot/lamassuiot/HEAD/docs/ca-openapi.yaml',
  },
  {
    id: 'va',
    label: 'VA',
    description: 'Validation Authority',
    url: 'https://raw.githubusercontent.com/lamassuiot/lamassuiot/HEAD/docs/va-openapi.yaml',
  },
  {
    id: 'device-manager',
    label: 'Device Manager',
    description: 'Device lifecycle management',
    url: 'https://raw.githubusercontent.com/lamassuiot/lamassuiot/HEAD/docs/device-manager-openapi.yaml',
  },
  {
    id: 'dms-manager',
    label: 'DMS Manager',
    description: 'Device Manufacturing Service',
    url: 'https://raw.githubusercontent.com/lamassuiot/lamassuiot/HEAD/docs/dms-manager-openapi.yaml',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    description: 'Alerting & notifications',
    url: 'https://raw.githubusercontent.com/lamassuiot/lamassuiot/HEAD/docs/alerts-openapi.yaml',
  },
  {
    id: 'enroll-reenroll-webhook',
    label: 'Enroll/Reenroll Webhook',
    description: 'External EST enrollment authorization webhook',
    url: 'https://raw.githubusercontent.com/lamassuiot/lamassuiot/HEAD/docs/enroll-reenroll-webhook-openapi.yaml',
  },
] as const;
