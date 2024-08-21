const amqp = require('amqplib');
const exchangeName = process.env.EXCHANGE || 'custom-direct';
const pattern = process.env.PATTERN || 'abc';
const exchangeType = 'direct';
const queue =  process.env.QUEUE || 'custom-direct-cola1';

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
NOTA: BINDING DIRECT

1. En los BINDING DIRECT el routerKey (producer) y el pattern (consumer) deben ser iguales.

2. El pattern puede tener varias colas.
3. Una cola puede tener varios pattern.
----------------------------------------
consumer:
cola1  - patternABC
cola1  - patternABCD
cola2  - patternABC
----------------------------------------

4. Si hay varios consumer, misma cola, diferente pattern, se realiza roundrobin
---------------------------------------
producer:
EXCHANGE: my-direct, ROUTING_KEY: patternABC, 
----------------------------------------
consumer:
cola1  - patternABC
cola1  - patternABCD
----------------------------------------
Importante: si la cola es igual, realiza el roundrobin

5. Si hay varios consumer, diferente cola, mismo pattern, NO realiza roundrobin
se envian los mensajes por igual.
---------------------------------------
producer:
EXCHANGE: my-direct, ROUTING_KEY: patternABC, 
----------------------------------------
consumer:
cola1  - patternABC
cola2  - patternABC
----------------------------------------

6. Para realizar roundrobin siempre usar mismas colas en cada consumer, 
en caso contrario cambiar de colas para recibir misma cantidad de mensajes.

*/
