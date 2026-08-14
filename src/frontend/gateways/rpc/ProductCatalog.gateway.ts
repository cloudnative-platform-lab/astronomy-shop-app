// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials, Metadata } from '@grpc/grpc-js';
import { ListProductsResponse, Product, ProductCatalogServiceClient } from '../../protos/demo';
import { runtimeAddress } from './runtime';

const client = () => new ProductCatalogServiceClient(runtimeAddress('PRODUCT_CATALOG_ADDR'), ChannelCredentials.createInsecure());
const productCatalogDeadlineMs = 5000;

const ProductCatalogGateway = () => ({
  listProducts() {
    const productCatalogClient = client();
    return new Promise<ListProductsResponse>((resolve, reject) =>
      productCatalogClient.listProducts(
        {},
        new Metadata(),
        { deadline: new Date(Date.now() + productCatalogDeadlineMs) },
        (error, response) => {
          productCatalogClient.close();
          error ? reject(error) : resolve(response);
        }
      )
    );
  },
  getProduct(id: string) {
    const productCatalogClient = client();
    return new Promise<Product>((resolve, reject) =>
      productCatalogClient.getProduct(
        { id },
        new Metadata(),
        { deadline: new Date(Date.now() + productCatalogDeadlineMs) },
        (error, response) => {
          productCatalogClient.close();
          error ? reject(error) : resolve(response);
        }
      )
    );
  },
});

export default ProductCatalogGateway();
