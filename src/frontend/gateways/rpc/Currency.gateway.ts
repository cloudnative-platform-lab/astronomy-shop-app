// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials } from '@grpc/grpc-js';
import { GetSupportedCurrenciesResponse, CurrencyServiceClient, Money } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new CurrencyServiceClient(runtimeAddress('CURRENCY_ADDR'), ChannelCredentials.createInsecure());

const CurrencyGateway = () => ({
  convert(from: Money, toCode: string) {
    return new Promise<Money>((resolve, reject) =>
      client().convert({ from, toCode }, (error, response) => (error ? reject(error) : resolve(response)))
    );
  },
  getSupportedCurrencies() {
    return new Promise<GetSupportedCurrenciesResponse>((resolve, reject) =>
      client().getSupportedCurrencies({}, (error, response) => (error ? reject(error) : resolve(response)))
    );
  },
});

export default CurrencyGateway();
