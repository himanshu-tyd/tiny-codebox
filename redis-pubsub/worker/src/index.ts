import { createClient } from "redis";

const client = createClient();

async function main() {
    startServer()

    const res=await client.brPop('submission',  0)

    console.log(res)

    await new Promise((resolve)=>setTimeout(resolve , 1000))

    console.log('prccess user submisson code')
}



async function startServer() {
  try {
    await client.connect();

    console.log("redis client connected");
  } catch (e) {
    console.log("error in connect client", e);
    return;
  }
}

main()
