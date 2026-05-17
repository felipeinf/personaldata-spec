import { randomUUID } from 'node:crypto';
import {
  computeCurrentHash,
  computePayloadHash,
} from '../hash-chain/index.js';
import { validateAgainstSchema } from '../validators/schema-validator.js';
import { SchemaIds } from '../schema-ids.js';
import type {
  ConsentGrantedEvent,
  ConsentRevokedEvent,
  ConsentSupersededEvent,
  InformationPresentedEvent,
  PolicyPublishedEvent,
} from '../generated/aliases.js';

interface BaseBuildInput {
  readonly controllerId: string;
  readonly prevEventHash: string | null;
  readonly sequenceNumber: number;
}

function buildEvent<T>(
  schemaId: string,
  eventType: string,
  input: BaseBuildInput,
  payload: object,
): T {
  const eventId = randomUUID();
  const timestamp = new Date().toISOString();
  const payloadHash = computePayloadHash(payload);
  const currentHash = computeCurrentHash({
    eventId,
    eventType,
    sequenceNumber: input.sequenceNumber,
    controllerId: input.controllerId,
    timestamp,
    prevEventHash: input.prevEventHash,
    payload,
  });
  const event = {
    eventId,
    eventType,
    sequenceNumber: input.sequenceNumber,
    controllerId: input.controllerId,
    timestamp,
    prevEventHash: input.prevEventHash,
    payloadHash,
    currentHash,
    payload,
  };
  validateAgainstSchema(schemaId, event);
  return Object.freeze(event) as unknown as T;
}

export interface BuildConsentGrantedInput extends BaseBuildInput {
  readonly subjectId: string;
  readonly purposeId: string;
  readonly purposeVersion: number;
  readonly policyVersionId: string;
  readonly mechanism: ConsentGrantedEvent['payload']['mechanism'];
  readonly evidence: ConsentGrantedEvent['payload']['evidence'];
}

export interface BuildConsentRevokedInput extends BaseBuildInput {
  readonly subjectId: string;
  readonly grantedEventId: string;
  readonly mechanism: ConsentRevokedEvent['payload']['mechanism'];
  readonly evidence: ConsentRevokedEvent['payload']['evidence'];
}

export interface BuildConsentSupersededInput extends BaseBuildInput {
  readonly subjectId: string;
  readonly previousGrantedEventId: string;
  readonly newGrantedEventId: string;
}

export interface BuildPolicyPublishedInput extends BaseBuildInput {
  readonly policyVersionId: string;
  readonly purposes: PolicyPublishedEvent['payload']['purposes'];
}

export interface BuildInformationPresentedInput extends BaseBuildInput {
  readonly subjectId: string;
  readonly policyVersionId: string;
  readonly presentedAt: string;
  readonly contentHash: string;
}

export const EventBuilder = {
  consentGranted(input: BuildConsentGrantedInput): ConsentGrantedEvent {
    return buildEvent<ConsentGrantedEvent>(
      SchemaIds.consentGranted,
      'consent_granted',
      input,
      {
        subjectId: input.subjectId,
        purposeId: input.purposeId,
        purposeVersion: input.purposeVersion,
        policyVersionId: input.policyVersionId,
        mechanism: input.mechanism,
        evidence: input.evidence,
      },
    );
  },

  consentRevoked(input: BuildConsentRevokedInput): ConsentRevokedEvent {
    return buildEvent<ConsentRevokedEvent>(SchemaIds.consentRevoked, 'consent_revoked', input, {
      subjectId: input.subjectId,
      grantedEventId: input.grantedEventId,
      mechanism: input.mechanism,
      evidence: input.evidence,
    });
  },

  consentSuperseded(
    input: BuildConsentSupersededInput,
  ): ConsentSupersededEvent {
    return buildEvent<ConsentSupersededEvent>(SchemaIds.consentSuperseded, 'consent_superseded', input, {
      subjectId: input.subjectId,
      previousGrantedEventId: input.previousGrantedEventId,
      newGrantedEventId: input.newGrantedEventId,
    });
  },

  policyPublished(input: BuildPolicyPublishedInput): PolicyPublishedEvent {
    return buildEvent<PolicyPublishedEvent>(SchemaIds.policyPublished, 'policy_published', input, {
      policyVersionId: input.policyVersionId,
      purposes: [...input.purposes],
    });
  },

  informationPresented(
    input: BuildInformationPresentedInput,
  ): InformationPresentedEvent {
    return buildEvent<InformationPresentedEvent>(
      SchemaIds.informationPresented,
      'information_presented',
      input,
      {
        subjectId: input.subjectId,
        policyVersionId: input.policyVersionId,
        presentedAt: input.presentedAt,
        contentHash: input.contentHash,
      },
    );
  },
};

export interface ConsentSelection {
  readonly purposeId: string;
  readonly purposeVersion: number;
  readonly accepted: boolean;
}

export interface BuildConsentBatchInput {
  readonly controllerId: string;
  readonly subjectId: string;
  readonly policyVersionId: string;
  readonly selections: ReadonlyArray<ConsentSelection>;
  readonly mechanism: ConsentGrantedEvent['payload']['mechanism'];
  readonly evidence: ConsentGrantedEvent['payload']['evidence'];
  readonly prevEventHash: string | null;
  readonly nextSequenceNumber: number;
}

export function buildConsentBatch(
  input: BuildConsentBatchInput,
): ReadonlyArray<ConsentGrantedEvent> {
  const accepted = input.selections.filter((s) => s.accepted);
  const events: ConsentGrantedEvent[] = [];
  let prevHash = input.prevEventHash;
  let seq = input.nextSequenceNumber;

  for (const selection of accepted) {
    const event = EventBuilder.consentGranted({
      controllerId: input.controllerId,
      subjectId: input.subjectId,
      purposeId: selection.purposeId,
      purposeVersion: selection.purposeVersion,
      policyVersionId: input.policyVersionId,
      mechanism: input.mechanism,
      evidence: input.evidence,
      prevEventHash: prevHash,
      sequenceNumber: seq,
    });
    events.push(event);
    prevHash = event.currentHash;
    seq += 1;
  }

  return events;
}
