// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials } from '@grpc/grpc-js';
import { CheckoutServiceClient, PlaceOrderRequest, PlaceOrderResponse } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new CheckoutServiceClient(runtimeAddress('CHECKOUT_ADDR'), ChannelCredentials.createInsecure());

const CheckoutGateway = () => ({
  placeOrder(order: PlaceOrderRequest) {
    return new Promise<PlaceOrderResponse>((resolve, reject) =>
      client().placeOrder(order, (error, response) => (error ? reject(error) : resolve(response)))
    );
  },
});

export default CheckoutGateway();
