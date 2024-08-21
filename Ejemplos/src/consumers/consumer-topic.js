const amqp = require('amqplib');
const exchangeName = process.env.EXCHANGE || 'custom-topic';
const pattern = process.env.PATTERN || 'log.*'; //log.#
const exchangeType = 'topic';
const queue =  process.env.QUEUE || 'custom-topic-cola1';

console.log({exchangeName, queue, pattern});

const intensiveOperation = () => {
  let i = 1e9;
  while(i--){}
}

const susbcriber = async () => {

  const connection = await amqp.connect('amqp://localhost');
  const channel =  await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });
  await channel.assertExchange(exchangeName, exchangeType);
  await channel.bindQueue(queue, exchangeName, pattern);

  channel.consume(queue, message => {
    const content = JSON.parse(message.content.toString());

    console.log(`Received message from ${queue} queue`, content);
    intensiveOperation();
    channel.ack(message);
  });
}

susbcriber()
.catch(error => {
  console.log(error);
  process.exit(0);
})

/*
NOTA: BINDING TOPIC

1. En los BINDING TOPIC el routerKey (producer) y el pattern (consumer) 
deben coincidir en algo log.* o log.warn.*

2. Si hay varios consumer, misma cola, diferente pattern, se realiza roundrobin
---------------------------------------
producer:
EXCHANGE: my-topic, ROUTING_KEY: pattern.A.*, 
----------------------------------------
consumer:
cola1  - pattern.A.B.*
cola1  - pattern.A.*
----------------------------------------
Importante: si la cola es igual, realiza el roundrobin

3. Si hay varios consumer, diferente cola, el pattern coincide en algo,
se envia mensajes a la cola que coincida con el pattern.
---------------------------------------
producer:
EXCHANGE: my-topic, ROUTING_KEY: pattern.A.*, 
----------------------------------------
consumer:
cola1  - pattern.A.*
cola2  - pattern.A.B.*
----------------------------------------

4. Las partes de un patter van separados por puntos.
--------------------------------------------------------
* => solo cubre la siguiente parte del pattern
# => cubre todas las partes del pattern

parte1.parte2.parte3.parte4.etc...

---------------------------------------
producer:
EXCHANGE: my-topic, ROUTING_KEY: pattern.A.B, 
----------------------------------------
consumer:
cola1  - pattern.*
cola2  - pattern.A.*
cola2  - pattern.#
----------------------------------------
Importante: si la cola es igual, realiza el roundrobin


*/
