const { Worker } = require("worker_threads");

function chunkify(array, n) {
  let chunks = [];
  for (let i = n; i > 0; i--) {
    chunks.push(array.splice(0, Math.ceil(array.length / i)));
  }

  return chunks
}

function run(jobs, currentWorker) {

    const tick=performance.now()
    let completedWorker=0

    const chunks=chunkify(jobs, currentWorker)

    chunks.forEach((data, i)=>{
        const worker=new Worker("./worker.js")
        worker.postMessage(data)
        worker.on("message" ,()=>{

            completedWorker++
            if(completedWorker===currentWorker){
                console.log(`${currentWorker} worker took ${performance.now()-tick}`)
                process.exit()
            }

            console.log(`worker ${i} compeled`)
        })
    })
    
}


const jobs=Array.from({length:100}, ()=>1000000000)


run(jobs, 12)