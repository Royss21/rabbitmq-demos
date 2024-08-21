const amqp = require("amqplib");
const exchangeName = process.env.EXCHANGE || "custom-direct";
const routingkey = process.env.ROUTING_KEY || "abc";
const exchangeType = "direct";
const messagesAmount = 6;
const wait = 500;

console.log({ exchangeName, exchangeType, routingkey });

const sleep = (ms) => {
  return new Promise((resolver) => {
    setTimeout(resolver, ms);
  });
};

const sleepLoop = async (number, cb) => {
  while (number--) {
    await sleep(wait);
    await cb();
  }
};

const exiAfterSend = async () => {
  await sleep(messagesAmount * wait * 1.2);
  process.exit(0);
};

const publisher = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, exchangeType);

  sleepLoop(messagesAmount, async () => {
    const message = {
      id: Math.random().toString(32).slice(2, 6),
      text: "hello world",
    };

    const sent = await channel.publish(
      exchangeName,
      routingkey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );

    sent
      ? console.log(`Sent to ${exchangeName} exchange`, message)
      : console.log("Failed message");
  });
};

publisher().catch((error) => {
  console.log(error);
  process.exit(0);
});

exiAfterSend();
