export interface HttpsPersonaldataDevSchemasV0EntitiesPolicyVersionSchemaJson {
  id: string;
  controllerId: string;
  /**
   * @minItems 1
   */
  purposes: [PurposeReference, ...PurposeReference[]];
  publishedAt: string;
  informationBlock: {
    [k: string]: unknown;
  };
}

export interface PurposeReference {
  purposeId: string;
  purposeVersion: number;
}

export interface HttpsPersonaldataDevSchemasV0EntitiesPurposeSchemaJson {
  id: string;
  version: number;
  controllerId: string;
  name: string;
  displayName: string;
  description: string;
  /**
   * @minItems 1
   */
  dataCategories: [string, ...string[]];
  retention:
    | {
        kind: 'fixed';
        duration: string;
      }
    | {
        kind: 'conditional';
        description: string;
      };
  legalBasis: 'consent';
  status: 'active' | 'deprecated';
  createdAt: string;
  supersedes?: VersionReference;
}

export interface VersionReference {
  id: string;
  version: number;
}

export type HttpsPersonaldataDevSchemasV0EventsConsentGrantedSchemaJson =
  HttpsPersonaldataDevSchemasV0EventsEventBaseSchemaJson & {
    eventType?: 'consent_granted';
    payload: ConsentGrantedPayload;
  };

export interface HttpsPersonaldataDevSchemasV0EventsEventBaseSchemaJson {
  eventId: string;
  eventType:
    | 'policy_published'
    | 'information_presented'
    | 'consent_granted'
    | 'consent_revoked'
    | 'consent_superseded';
  sequenceNumber: number;
  controllerId: string;
  timestamp: string;
  prevEventHash: string | null;
  payloadHash: string;
  currentHash: string;
  payload: {};
}

export interface ConsentGrantedPayload {
  subjectId: string;
  purposeId: string;
  purposeVersion: number;
  policyVersionId: string;
  mechanism:
    | 'web_checkbox'
    | 'web_button'
    | 'written_signature'
    | 'electronic_signature'
    | 'verbal_recorded'
    | 'api_explicit';
  evidence: HttpsPersonaldataDevSchemasV0SharedEvidenceSchemaJson;
}

export interface HttpsPersonaldataDevSchemasV0SharedEvidenceSchemaJson {
  recordedAt: string;
  contentHash: string;
  [k: string]: unknown;
}

export type HttpsPersonaldataDevSchemasV0EventsConsentRevokedSchemaJson =
  HttpsPersonaldataDevSchemasV0EventsEventBaseSchemaJson & {
    eventType?: 'consent_revoked';
    payload: ConsentRevokedPayload;
  };

export interface ConsentRevokedPayload {
  subjectId: string;
  grantedEventId: string;
  mechanism:
    | 'web_checkbox'
    | 'web_button'
    | 'written_signature'
    | 'electronic_signature'
    | 'verbal_recorded'
    | 'api_explicit';
  evidence: HttpsPersonaldataDevSchemasV0SharedEvidenceSchemaJson;
}

export type HttpsPersonaldataDevSchemasV0EventsConsentSupersededSchemaJson =
  HttpsPersonaldataDevSchemasV0EventsEventBaseSchemaJson & {
    eventType?: 'consent_superseded';
    payload: ConsentSupersededPayload;
  };

export interface ConsentSupersededPayload {
  subjectId: string;
  previousGrantedEventId: string;
  newGrantedEventId: string;
}

export type HttpsPersonaldataDevSchemasV0EventsInformationPresentedSchemaJson =
  HttpsPersonaldataDevSchemasV0EventsEventBaseSchemaJson & {
    eventType?: 'information_presented';
    payload: InformationPresentedPayload;
  };

export interface InformationPresentedPayload {
  subjectId: string;
  policyVersionId: string;
  presentedAt: string;
  contentHash: string;
}

export type HttpsPersonaldataDevSchemasV0EventsPolicyPublishedSchemaJson =
  HttpsPersonaldataDevSchemasV0EventsEventBaseSchemaJson & {
    eventType?: 'policy_published';
    payload: PolicyPublishedPayload;
  };

export interface PolicyPublishedPayload {
  policyVersionId: string;
  /**
   * @minItems 1
   */
  purposes: [PurposeReference, ...PurposeReference[]];
}

export interface HttpsPersonaldataDevSchemasV0SharedEnumsSchemaJson {
  [k: string]: unknown;
}

export interface HttpsPersonaldataDevSchemasV0SharedHashSchemaJson {
  [k: string]: unknown;
}

export interface HttpsPersonaldataDevSchemasV0SharedPrimitivesSchemaJson {
  [k: string]: unknown;
}
