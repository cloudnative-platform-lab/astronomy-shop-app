module github.com/open-telemetry/opentelemetry-demo/src/email

go 1.24.0

require (
  github.com/open-telemetry/opentelemetry-demo/src/checkout v0.0.0
  google.golang.org/grpc v1.69.0
)

replace github.com/open-telemetry/opentelemetry-demo/src/checkout => ../checkout
