const amqp = require("amqplib");
const queue = process.env.QUEUE || "custom-fanout-cola1";
const exchangeName = process.env.EXCHANGE || "custom-fanout";
const exchangeType = "fanout";

console.log({ exchangeName, queue });

const intensiveOperation = () => {
  let i = 1e9;
  while (i--) {}
};

const susbcriber = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });
  await channel.assertExchange(exchangeName, exchangeType);
  await channel.bindQueue(queue, exchangeName);

  channel.consume(queue, (message) => {
    const content = JSON.parse(message.content.toString());

    console.log(`Received message from ${queue} queue`, content);
    intensiveOperation();
    channel.ack(message);
  });
};

susbcriber().catch((error) => {
  console.log(error);
  process.exit(0);
});

/*
NOTA: BINDING FANOUT

- El BINDING FANOUT envia los mismos mensajes a todas las colas asociadas al exchange.
- Una cola puede tener varios exchange.
- Un exchange puede tener varias colas.
- Si hay dos o mas consumers  misma cola , hace roundrobin.
- Revisar los binding del exchange con las colas en el adminitrador.
- Es importante primero hacer un binding con el exchange 
  antes de enviar mensajes del producer
*/
