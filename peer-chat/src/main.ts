import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import "./style.css";
import { db } from "./firebaseConfig";

// WebRTC + Firestore Signaling Setup with Enhanced Logging

// Media stream declarations
let localStream: MediaStream;
let remoteStream: MediaStream;

// Connection identifiers

const contrains: MediaStreamConstraints = {
  video: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
    facingMode: "user",
  },
  audio: true,
};

const ansEl = document.getElementById("ans");
const call_id = document.getElementById("call_id") as HTMLInputElement;
let ansId: string;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
console.log("querstinr", JSON.stringify(urlParams));

// ICE server configuration
const servers = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

// Create peer connection
const peerConnection = new RTCPeerConnection(servers);

/**
 * Initialize the WebRTC connection
 * - Creates a unique call document in Firestore
 * - Sets up local media stream
 * - Initiates offer creation process
 */
const init = async () => {
  try {
    // Create unique call document
    const callDoc = doc(db, "calls", crypto.randomUUID());
    ansId=callDoc.id

    document.getElementById('ans-id')!.innerHTML=callDoc.id

  

    console.log("🎥 Requesting local media stream...");
    localStream = await navigator.mediaDevices.getUserMedia(contrains);
    console.log("✅ Local media stream received");

    // Display local video stream
    const localUser = document.getElementById("user-1") as HTMLVideoElement;
    if (!localUser) {
      console.error("❌ Local video element not found");
      return;
    }
    localUser.srcObject = localStream;

    // Setup offer creation process
    console.log("📞 Creating offer...");
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    await createOffer(callDoc, offerCandidates, answerCandidates);
  } catch (e) {
    console.error("❌ Init error:", e);
  }
};



//handles

const handleCopyId=(id:string)=>{
  navigator.clipboard.writeText(id)
  alert('copied')
}

document.getElementById('copy')!.onclick=()=>handleCopyId(ansId)

document.getElementById('mic')!.onclick=()=>{
  //get start form here
}




/**
 * Create and send an offer
 * - Sets up remote stream container
 * - Adds local tracks to peer connection
 * - Handles ICE candidates
 * - Creates and stores offer in Firestore
 */
const createOffer = async (
  callDoc: DocumentReference<DocumentData, DocumentData>,
  offerCandidates: CollectionReference<DocumentData>,
  answerCandidates: CollectionReference<DocumentData>
) => {
  console.log("🔧 Creating RTCPeerConnection...");

  // Set up remote stream container
  remoteStream = new MediaStream();
  const remoteUser = document.getElementById("user-2") as HTMLVideoElement;

  if (!remoteUser) {
    console.error("❌ Remote video element #user-2 not found");
    return;
  }

  remoteUser.srcObject = remoteStream;

  // Add local tracks to peer connection
  console.log("🎤 Adding local tracks to PeerConnection...");
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
    console.log("➕ Track added:", track.kind);
  });

  // Handle incoming remote tracks
  peerConnection.addEventListener("track", (e) => {
    console.log("📡 Remote track received:", e.streams);
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
      console.log("🎬 Track added to remote stream:", track.kind);
    });
  });

  // Handle and store ICE candidates
  peerConnection.addEventListener("icecandidate", async (e) => {
    if (e.candidate) {
      console.log("❄️ New ICE candidate generated:", e.candidate);
      try {
        await addDoc(offerCandidates, e.candidate.toJSON());
        console.log("✅ ICE candidate stored in Firestore");
      } catch (error) {
        console.error("🔥 Error storing ICE candidate:", error);
      }
    }
  });

  // Create and set local description (offer)
  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  console.log(
    "📨 Offer created and set as local description:",
    offerDescription
  );

  // Format and store offer in Firestore
  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDoc, { offer });
  console.log("📝 Offer saved to Firestore");

  // Listen for answer from remote peer
  onSnapshot(callDoc, (snapshot: DocumentSnapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection
        .setRemoteDescription(answerDescription)
        .then(() => {
          console.log("📥 Answer set as remote description");
          remoteUser.style.display = "block";
        })
        .catch((err) =>
          console.error("❌ Error setting remote description:", err)
        );
    }
  });

  // Listen for ICE candidates from remote peer
  onSnapshot(answerCandidates, (snapshot: QuerySnapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidateData = change.doc.data();
        const candidate = new RTCIceCandidate(candidateData);
        peerConnection
          .addIceCandidate(candidate)
          .then(() => {
            console.log("✅ Answer-side ICE candidate added");
          })
          .catch((err) =>
            console.error("❌ Failed to add answer ICE candidate:", err)
          );
      }
    });
  });
};

/**
 * Handle answering an incoming call
 * - Retrieves call data from Firestore
 * - Creates and sends answer
 * - Processes ICE candidates
 */
const handleAnswer = async (callId: string) => {
  console.log("📞 Handling answer for call:", callId);

  document.getElementById("user-2")!.style.display = "block";
  document.getElementById("user-1")?.classList.add("smallFrame");

  // Get call document
  const callDoc = doc(db, "calls", callId);
  const answerCandidates = collection(callDoc, "answerCandidates");
  const offerCandidates = collection(callDoc, "offerCandidates");

  // Check if call exists
  const callSnap = await getDoc(callDoc);
  if (!callSnap.exists()) {
    console.error("❌ Call not found with ID:", callId);
    return alert("Call not found");
  }

  // Process offer from caller
  const callData = callSnap.data();
  const offerDescription = callData.offer;
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offerDescription)
  );
  console.log("📥 Offer set as remote description");

  // Create and set answer
  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);
  console.log("📤 Answer created and set as local description");

  // Format and store answer in Firestore
  const answer = {
    sdp: answerDescription.sdp,
    type: answerDescription.type,
  };

  await updateDoc(callDoc, { answer });
  console.log("📝 Answer saved to Firestore");

  // Listen for and process ICE candidates from caller
  onSnapshot(offerCandidates, (snapshot: QuerySnapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        peerConnection
          .addIceCandidate(new RTCIceCandidate(data))
          .then(() => console.log("✅ Offer-side ICE candidate added"))
          .catch((err) =>
            console.error("❌ Failed to add offer ICE candidate:", err)
          );
      }
    });
  });
};

ansEl?.addEventListener("click", async () => {
  const id = call_id.value;

  if (!id) return;

  await handleAnswer(call_id.value);
});

window.addEventListener("beforeunload", () => {
  document.getElementById("user-2")!.style.display = "none";
});

init();

// Initialize the applicatio

