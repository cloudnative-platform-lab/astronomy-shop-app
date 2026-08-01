// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import type { NextApiRequest, NextApiResponse } from 'next';
import InstrumentationMiddleware from '../../utils/telemetry/InstrumentationMiddleware';
import { Ad, Empty } from '../../protos/demo';

type TResponse = Ad[] | Empty;

const handler = async ({ method, query }: NextApiRequest, res: NextApiResponse<TResponse>) => {
  switch (method) {
    case 'GET': {
      if (!process.env.AD_ADDR) {
        return res.status(200).json([]);
      }

      const { default: AdGateway } = await import('../../gateways/rpc/Ad.gateway');
      const { contextKeys = [] } = query;
      const { ads: adList } = await AdGateway.listAds(Array.isArray(contextKeys) ? contextKeys : contextKeys.split(','));

      return res.status(200).json(adList);
    }

    default: {
      return res.status(405).send('');
    }
  }
};

export default InstrumentationMiddleware(handler);
