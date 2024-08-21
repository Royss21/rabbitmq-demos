# RabbitMQ HEADERS Exchange Node.js Lab

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

## Same Exchange and Match Headers, different queue
All subscribers receive all messages.

### Subscribers (Run commands in different terminals)

```bash
HEADERS='domain=http://localhost.com' QUEUE=first EXCHANGE=my-headers node subscriber/headers-exchange.js

HEADERS='domain=http://localhost.com' QUEUE=second EXCHANGE=my-headers node subscriber/headers-exchange.js
```

### Publishers

```bash
HEADERS='domain=http://localhost.com' EXCHANGE=my-headers node publisher/headers-exchange.js
```

## Same Exchange and Match Headers and queue
All subscribers receive messages using round-robin.


### Subscribers (Run commands in different terminals)

```bash
HEADERS='domain=http://localhost.com' QUEUE=first EXCHANGE=my-headers node subscriber/headers-exchange.js

HEADERS='domain=http://localhost.com' QUEUE=first EXCHANGE=my-headers node subscriber/headers-exchange.js
```

### Publishers

```bash
HEADERS='domain=http://localhost.com' EXCHANGE=my-headers node publisher/headers-exchange.js
```

## Different Exchange, same Match Headers and queue
All subscribers receive messages using round-robin.

**This happens because queue is bound to both exchanges.

### Subscribers (Run commands in different terminals)

```bash
HEADERS='domain=http://localhost.com' QUEUE=first EXCHANGE=my-headers node subscriber/headers-exchange.js

HEADERS='domain=http://localhost.com' QUEUE=first EXCHANGE=my-headers-2 node subscriber/headers-exchange.js
```

### Publishers

```bash
HEADERS='domain=http://localhost.com' EXCHANGE=my-headers node publisher/headers-exchange.js
```

## x-match
It is required when we want to match several headers.

### Values
* **any:** get a match with only one matching header.
* **all:** get a match when all the headers match.

## x-match=any
Subscribers receive messages when any of the headers match.

### Subscribers (Run commands in different terminals)
Match `domain` but no `IP`.

```bash
HEADERS='domain=http://localhost.com&IP=76.45.140.44&x-match=any' QUEUE=first EXCHANGE=my-headers node subscriber/headers-exchange.js

HEADERS='domain=http://localhost.com&IP=76.45.140.44&x-match=any' QUEUE=second EXCHANGE=my-headers node subscriber/headers-exchange.js
```

### Publishers

```bash
HEADERS='domain=http://localhost.com&IP=76.45.140.43' EXCHANGE=my-headers node publisher/headers-exchange.js
```

## x-match=all
Subscribers receive messages when all the headers match.

### Subscribers (Run commands in different terminals)
Match `domain` and `IP`.

```bash
HEADERS='domain=http://localhost.com&IP=76.45.140.44&x-match=all' QUEUE=first EXCHANGE=my-headers node subscriber/headers-exchange.js

HEADERS='domain=http://localhost.com&IP=76.45.140.44&x-match=all' QUEUE=second EXCHANGE=my-headers node subscriber/headers-exchange.js
```

### Publishers

```bash
HEADERS='domain=http://localhost.com&IP=76.45.140.44' EXCHANGE=my-headers node publisher/headers-exchange.js
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
