// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials, Metadata } from '@grpc/grpc-js';
import { ListRecommendationsResponse, RecommendationServiceClient } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new RecommendationServiceClient(runtimeAddress('RECOMMENDATION_ADDR'), ChannelCredentials.createInsecure());

type RecommendationResult = {
  response: ListRecommendationsResponse;
  servingRevision?: string;
};

const RecommendationsGateway = () => ({
  listRecommendations(userId: string, productIds: string[]) {
    return new Promise<RecommendationResult>((resolve, reject) =>
      client().listRecommendations({ userId, productIds }, (error, response, trailers: Metadata) => {
        if (error) {
          reject(error);
          return;
        }

        if (!response) {
          reject(new Error('Recommendation service returned no response'));
          return;
        }

        const servingRevision = trailers
          .get('x-astronomy-shop-recommendation-revision')
          .find((value): value is string => typeof value === 'string');

        resolve({ response, servingRevision });
      })
    );
  },
});

export default RecommendationsGateway();
