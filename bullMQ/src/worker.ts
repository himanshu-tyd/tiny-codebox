import { Worker, type WorkerOptions } from "bullmq";
import IORedis from 'ioredis';


const connection = new IORedis({ maxRetriesPerRequest: null });

const emailSend = () =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, 500);
  });

const workerOption: WorkerOptions = {
 connection
};

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log("job reciever:", job.id);
    console.log("job data: ", job.data);

    emailSend();

    console.log("work done");
  },
  workerOption
);


