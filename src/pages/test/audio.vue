<template>
<h2>Audio Recorder</h2>
  <button ref="startBtn" @click="startRecording">Start Recording</button>
  <button ref="stopBtn" @click="stopRecording" disabled>Stop Recording</button>
  <audio ref="audioPlayer" controls></audio>
</template>
<script setup>
let mediaRecorder = null;
let audioChunks = [];

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayer.value.src = audioUrl;

    // Send to backend
    uploadAudio(audioBlob);

    // Reset chunks
    audioChunks = [];
  };

  mediaRecorder.start();
  startBtn.value.disabled = true;
  stopBtn.value.disabled = false;
};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    startBtn.value.disabled = false;
    stopBtn.value.disabled = true;
  }
};

const uploadAudio = (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.wav");

  fetch("https://your-backend-url.com/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => console.log("Upload successful:", data))
    .catch((error) => console.error("Error uploading audio:", error));
};

</script>
