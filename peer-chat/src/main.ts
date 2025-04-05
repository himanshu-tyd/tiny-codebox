import AgoraRTM, { RTMConfig } from 'agora-rtm-sdk';
import './style.css'

//steps
//1. let localstreaData
//2. get access of video and audio
//3. display video in frame

//4 create RTCpeerConnection()
//5 make  offer and make connection
//6 access the mediaStrema and set to remoteStream
//7 create offer and set peerconnection and setDescription
//8 create stun server
//9 now just pass server to our peerconnection
//10 get the local tranks and add them to connection so peerconnection get it from there
//12 listen ther peerconnetion has trancks
//13 generate ICE candidate of peerconnection
//14 use signaling to transfer data make own if you want
//15 creat User UID
//16 getClient that we are login right now mean browser
//17 crate channle we can identify wher use shoudl join

let localStream:MediaStream
let remoteStream:MediaStream
let APP_ID = "f47c9dcfe7714ae595215f905d5d0410";
let token ='007eJxTYMhSEtGUieMy7dBb3WxXXyfIllDc3Pz2wz3re5oMl1PdjyswpJmYJ1umJKelmpsbmiSmmlqaGhmaplkamKaYphiYGBrEyH5MbwhkZLgnUsvCyACBID4LQ25iZh4DAwA/xxxD'
let uid = String(Math.floor(Math.random()*1000));
let client;
let channel;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const init = async () => {
  try {

    const { RTM   } = AgoraRTM;

    const rtmConfig:RTMConfig = {
      cipherKey: "yourCipherKey",
      presenceTimeout: 300,
      logUpload: true,
      logLevel: "debug",
      cloudProxy: false,
      useStringUserId: false,
    //   privateConfig: {
    //     serviceType: ["MESSAGE", "STREAM"],
    //   },
      heartbeatInterval: 5,
    };
    client = new RTM(APP_ID, uid, rtmConfig);

    // Login to RTM
    const result=await client.login({token : token});

    console.log(result)
    if(result){
        console.log("RTM login success");
    }

    // Create a channel
    channel = await client.createChannel("main");
    await channel.subscribe();
    console.log("Channel joined");
    channel;

    channel.on("MemberJoined", handleJoined);

    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    document.getElementById("user-1").srcObject = localStream;

    createOffer();
  } catch (e) {
    console.error("Init error:", e);
  }
};

const handleJoined = async (id) => {
  console.log("A new user joined", id);
};  

let createOffer = async () => {
  const peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  const remoteUser:HTMLVideoElement=document.getElementById("user-2")

  remoteUser.srcObject = remoteStream;

  //add all localstream tracks in to peeerconnection
  localStream.getTracks().forEach((tracks) => {
    peerConnection.addTrack(tracks, localStream);
  });

  //listen tracks and add theme into remotestream
  peerConnection.addEventListener("track", (e) => {
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  });

  peerConnection.addEventListener("icecandidate", (e) => {
    if (e.candidate) {
      console.log("New ice candidate:", e.candidate);
    }
  });

  let offer = await peerConnection.createOffer();

  //whenever we set description it start to request to stun server and send ice candidates
  await peerConnection.setLocalDescription(offer);

  console.log("offer :", offer);
};

init();
