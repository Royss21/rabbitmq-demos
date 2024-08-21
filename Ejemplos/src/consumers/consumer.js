var amqp = require("amqplib");
const queue = "hello";

const intensiveOperation = () => {
  let i = 1e9;
  while (i--) {}
};

const susbcriber = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, (message) => {
    const content = JSON.parse(message.content.toString());

    console.log(`Received message from ${queue} queue`, content);
    intensiveOperation();
    channel.ack(message);
    // console.log(`Process message`, content)
  });
};

susbcriber().catch((error) => {
  console.log(error);
  process.exit(0);
});
