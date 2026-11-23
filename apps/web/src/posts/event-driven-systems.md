## Kafka

When I started working with Kafka, it initially seemed like just another message pub-sub system similar to SQS or RabbitMQ. However, after deeper exploration, I discovered it offers considerably more functionality. The combination of topics, partitions, consumers, and consumer groups provides enhanced control and coordination for real-time data storage and retrieval.

### Kafka as a Source of Truth

> Kafka can become a source of truth for all the data in an organisation.

In microservices architectures, services often create customized data views from larger datasets to solve specific business problems. Once data is transformed, accessing the original form becomes difficult if issues arise, potentially causing data loss. Kafka solves this by maintaining historical data and enabling message replay through offset adjustments.

## Kafka Integration in Microservices

### Simple Integration

The most straightforward approach uses a Kafka client library. For Go, Shopify's Sarama is commonly used. Configuration involves passing parameters like address (URL), consumer group, consumer topic, and producer topic.

### Advanced Pipeline Architecture

This simple method works for basic architectures with one or two services. However, complex data pipelines with many publishing and consuming services benefit from a sidecar container approach.

Benthos automates fetching data from appropriate Kafka topics, calling microservices, and publishing results to relevant topics. This tool shifts Kafka dependencies from services to the sidecar. When deployed alongside a service pod, Benthos listens to configured topics, invokes REST or gRPC endpoints, allows processing and local storage, then publishes results downstream — creating decoupled, efficient data pipelines.

This architecture simplifies message management across complex, multi-service environments.
