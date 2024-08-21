# RabbitMQ FANOUT Exchange Node.js Lab

## Prepare project

### Install dependencies

```bash
yarn install
```

### Run RabbitMQ container (docker is required)

Rabbit on 5672 port and management on 8081.

Management user and password are "**guest**" without quotes.

```bash
docker run -d -v ${PWD}/rabbit-db:/var/lib/rabbitmq --hostname yt-rabbit -p 5672:5672 -p 8081:15672 --name yt-rabbit rabbitmq:3-management
```

## Fanout Exchanges Theory
Fanout exchanges ignore `Routing Keys` and `Patterns`, send messages to all queues bound to the exchange.

## Same Exchange and Match Pattern, different queue

All subscribers receive all messages.

### Subscribers (Run commands in different terminals)

```bash
PATTERN=other_company.v2.pdf.generate QUEUE=first EXCHANGE=my-fanout node subscriber/fanout-exchange.js

PATTERN=company.v1.pdf.generate QUEUE=second EXCHANGE=my-fanout node subscriber/fanout-exchange.js
```

### Publishers

```bash
ROUTING_KEY=company.v1.pdf.generate EXCHANGE=my-fanout node publisher/fanout-exchange.js
```

## Same Exchange and Match Pattern and queue

All subscribers receive messages using round-robin.

### Subscribers (Run commands in different terminals)

```bash
PATTERN=other_company.v2.pdf.generate QUEUE=first EXCHANGE=my-fanout node subscriber/fanout-exchange.js

PATTERN=company.v1.pdf.generate QUEUE=first EXCHANGE=my-fanout node subscriber/fanout-exchange.js
```

### Publishers

```bash
ROUTING_KEY=company.v1.pdf.generate EXCHANGE=my-fanout node publisher/fanout-exchange.js
```

## Different Exchange, same Match Pattern and queue

All subscribers receive messages using round-robin.

**This happens because queue is bound to both exchanges.

### Subscribers (Run commands in different terminals)

```bash
PATTERN=other_company.v2.pdf.generate QUEUE=second EXCHANGE=my-fanout-2 node subscriber/fanout-exchange.js

PATTERN=company.v1.pdf.generate QUEUE=second EXCHANGE=my-fanout node subscriber/fanout-exchange.js
```

### Publishers

```bash
ROUTING_KEY=company.v1.pdf.generate EXCHANGE=my-fanout node publisher/fanout-exchange.js
```

## Keep messages after RabbitMQ restart
### Durability and persistence
It is necessary to set exchange and queue as **durable** and messages
as **persistent** when they are published.
#### Add exchange as "durable"

```js
channel.assertExchange(exchangeName, exchangeType, {
    durable: true
})
```

#### Add queue as "durable"

```js
await channel.assertQueue(queue, {
    durable: true
})
```

#### Add publish "persistent" option as true (default is false)

```js
const sent = channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    {
        persistent: true
    }
)
```
