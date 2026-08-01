package main

import (
  "context"
  "log"
  "net"
  "os"

  pb "github.com/open-telemetry/opentelemetry-demo/src/checkout/genproto/oteldemo"
  "google.golang.org/grpc"
)

type emailServer struct {
  pb.UnimplementedEmailServiceServer
}

func (emailServer) SendOrderConfirmation(_ context.Context, request *pb.SendOrderConfirmationRequest) (*pb.Empty, error) {
  log.Printf("accepted order confirmation for email=%q order_id=%q", request.GetEmail(), request.GetOrder().GetOrderId())
  return &pb.Empty{}, nil
}

func main() {
  port := os.Getenv("EMAIL_PORT")
  if port == "" {
    log.Fatal("EMAIL_PORT environment variable is required")
  }

  listener, err := net.Listen("tcp", ":"+port)
  if err != nil {
    log.Fatalf("listen on %s: %v", port, err)
  }

  server := grpc.NewServer()
  pb.RegisterEmailServiceServer(server, emailServer{})
  log.Printf("email gRPC server listening on %s", port)
  log.Fatal(server.Serve(listener))
}
