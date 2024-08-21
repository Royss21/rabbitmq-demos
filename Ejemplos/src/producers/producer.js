const amqp = require("amqplib");
const queue = "hello";
const messagesAmount = 10;
const wait = 500;

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

const susbcriber = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  //para que se mantenga la cola en caso de reinicio de servidor
  await channel.assertQueue(queue, { durable: true });

  sleepLoop(messagesAmount, async () => {

  const message = {
    id: Math.random().toString(32).slice(2, 6),
    text: "hello world",
  };

  const sent = await channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    {
        //persisitir mensaje en memoria
      persistent: true
    }
  );

  sent
    ? console.log(`Sent to ${queue} queue`, message)
    : console.log("Failed message");
  })
};

susbcriber().catch((error) => {
  console.log(error);
  process.exit(0);
});

exiAfterSend();
