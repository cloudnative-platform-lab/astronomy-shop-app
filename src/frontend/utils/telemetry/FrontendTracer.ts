// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource, browserDetector } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SessionIdProcessor } from './SessionIdProcessor';
import { detectResourcesSync } from '@opentelemetry/resources/build/src/detect-resources';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const runtimeEnvironment = typeof window !== 'undefined' ? window.ENV ?? {} : {};

const {
  NEXT_PUBLIC_OTEL_SERVICE_NAME = '',
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  IS_SYNTHETIC_REQUEST = '',
} = runtimeEnvironment;

const FrontendTracer = () => {
  const configuredEndpoint = NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT.trim();
  const endpoint = configuredEndpoint && configuredEndpoint !== 'undefined' && configuredEndpoint !== 'null'
    ? configuredEndpoint
    : typeof window !== 'undefined'
      ? `${window.location.origin}/otlp-http/v1/traces`
      : '';

  if (!endpoint) {
    return;
  }

  try {
    let resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: NEXT_PUBLIC_OTEL_SERVICE_NAME,
    });

    const detectedResources = detectResourcesSync({ detectors: [browserDetector] });
    resource = resource.merge(detectedResources);
    const provider = new WebTracerProvider({ resource });

    provider.addSpanProcessor(new SessionIdProcessor());

    provider.addSpanProcessor(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: endpoint,
        }),
        {
          scheduledDelayMillis: 500,
        }
      )
    );

    const contextManager = new ZoneContextManager();

    provider.register({
      contextManager,
      propagator: new CompositePropagator({
        propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
      }),
    });

    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [
        getWebAutoInstrumentations({
          '@opentelemetry/instrumentation-fetch': {
            propagateTraceHeaderCorsUrls: /.*/,
            clearTimingResources: true,
            applyCustomAttributesOnSpan(span) {
              span.setAttribute('app.synthetic_request', IS_SYNTHETIC_REQUEST);
            },
          },
        }),
      ],
    });
  } catch {
    return;
  }
};

export default FrontendTracer;
