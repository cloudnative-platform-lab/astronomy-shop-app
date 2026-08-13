// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials, Metadata } from '@grpc/grpc-js';
import { ListRecommendationsResponse, RecommendationServiceClient } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new RecommendationServiceClient(runtimeAddress('RECOMMENDATION_ADDR'), ChannelCredentials.createInsecure());
const recommendationDeadlineMs = 5000;

type RecommendationResult = {
  response: ListRecommendationsResponse;
  servingRevision?: string;
};

const RecommendationsGateway = () => ({
  listRecommendations(userId: string, productIds: string[]) {
    return new Promise<RecommendationResult>((resolve, reject) => {
      let recommendationResponse: ListRecommendationsResponse | undefined;
      let settled = false;
      const recommendationClient = client();

      const complete = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        recommendationClient.close();
        callback();
      };

      const call = recommendationClient.listRecommendations(
        { userId, productIds },
        new Metadata(),
        { deadline: new Date(Date.now() + recommendationDeadlineMs) },
        (error, response) => {
        if (error) {
          complete(() => reject(error));
          return;
        }

        if (!response) {
          complete(() => reject(new Error('Recommendation service returned no response')));
          return;
        }

        recommendationResponse = response;
        }
      );

      call.on('status', (status) => {
        const response = recommendationResponse;
        if (!response) {
          return;
        }

        const servingRevision = status.metadata
          .get('x-astronomy-shop-recommendation-revision')
          .find((value): value is string => typeof value === 'string');

        complete(() => resolve({ response, servingRevision }));
      });
    });
  },
});

export default RecommendationsGateway();
