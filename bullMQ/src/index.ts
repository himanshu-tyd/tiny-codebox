import { Queue } from "bullmq";

const emailQueue = new Queue("email-queue");

async function init() {
  const res = await emailQueue.add("sender", {
    message: 'data processiing....'
  });
  console.log("process id: ", res.id);
}



setInterval(() => {
    init();
}, 1000);
