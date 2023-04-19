const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
// const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
// const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { BatchSpanProcessor } = require('@opentelemetry/tracing');
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
//Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { OTTracePropagator } = require('@opentelemetry/propagator-ot-trace');
const options = {
    tags: [], 
    endpoint: 'http://localhost:14268/api/traces',
}

//Exporter
module.exports = (serviceName) => {

    const exporter = new JaegerExporter(options);
    // const exporter = new ConsoleSpanExporter();
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });
    // provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    provider.register({ propagator: new OTTracePropagator});

    console.log('tracing initialized');

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    const tracer = provider.getTracer(serviceName);

    return { tracer };
};