// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials } from '@grpc/grpc-js';
import { ListRecommendationsResponse, RecommendationServiceClient } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new RecommendationServiceClient(runtimeAddress('RECOMMENDATION_ADDR'), ChannelCredentials.createInsecure());

type RecommendationResult = {
  response: ListRecommendationsResponse;
  servingRevision?: string;
};

const RecommendationsGateway = () => ({
  listRecommendations(userId: string, productIds: string[]) {
    return new Promise<RecommendationResult>((resolve, reject) => {
      let recommendationResponse: ListRecommendationsResponse | undefined;

      const call = client().listRecommendations({ userId, productIds }, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        if (!response) {
          reject(new Error('Recommendation service returned no response'));
          return;
        }

        recommendationResponse = response;
      });

      call.on('status', (status) => {
        if (!recommendationResponse) {
          return;
        }

        const servingRevision = status.metadata
          .get('x-astronomy-shop-recommendation-revision')
          .find((value): value is string => typeof value === 'string');

        resolve({ response: recommendationResponse, servingRevision });
      })
    });
  },
});

export default RecommendationsGateway();
