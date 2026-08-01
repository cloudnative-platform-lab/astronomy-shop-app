// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials } from '@grpc/grpc-js';
import { ListProductsResponse, Product, ProductCatalogServiceClient } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new ProductCatalogServiceClient(runtimeAddress('PRODUCT_CATALOG_ADDR'), ChannelCredentials.createInsecure());

const ProductCatalogGateway = () => ({
  listProducts() {
    return new Promise<ListProductsResponse>((resolve, reject) =>
      client().listProducts({}, (error, response) => (error ? reject(error) : resolve(response)))
    );
  },
  getProduct(id: string) {
    return new Promise<Product>((resolve, reject) =>
      client().getProduct({ id }, (error, response) => (error ? reject(error) : resolve(response)))
    );
  },
});

export default ProductCatalogGateway();
