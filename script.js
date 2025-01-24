
    // Get the video element and buttons
    const video = document.getElementById("video");
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");

    let stream; // Variable to store the camera stream
    let model; // Variable to store the pre-trained coco-ssd model
    let audio = new Audio("Assets/sound system.mp3"); // Correct file path for audio
    let isAudioPlaying = false; // Flag to track if audio is already playing

    // Function to load the object detection model
    const loadModel = async () => {
      try {
        console.log("Loading model...");
        model = await cocoSsd.load();
        console.log("Model loaded!");
      } catch (error) {
        console.error("Error loading model: ", error);
      }
    };

    // Function to start the camera
    const startCamera = async () => {
      console.log("Start Camera button clicked.");
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Camera not supported on this browser.");
          return;
        }

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        startButton.disabled = true;
        stopButton.disabled = false;
        console.log("Camera started successfully");

        // Start object detection after the camera starts
        detectObjects();
      } catch (err) {
        console.error("Error accessing the camera: ", err);
        alert("Could not access the camera. Please make sure permissions are granted.");
      }
    };

    // Function to stop the camera
    const stopCamera = () => {
      console.log("Stop Camera button clicked.");
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }
      startButton.disabled = false;
      stopButton.disabled = true;
    };

    // Function to detect objects in the camera feed
    const detectObjects = async () => {
      if (!model) {
        console.error("Model not loaded yet.");
        return;
      }

      try {
        const predictions = await model.detect(video); // Detect objects in the video stream
        console.log("Predictions: ", predictions);

        // Check for a bird in the predictions
        const birdDetected = predictions.some(
          (prediction) => prediction.class === "bird"
        );

        if (birdDetected) {
          console.log("Bird detected!");
          playSound(); // Play sound if a bird is detected
        } else {
          console.log("No bird detected.");
        }
      } catch (error) {
        console.error("Error detecting objects: ", error);
      }

      // Continuously call detectObjects to update detection
      requestAnimationFrame(detectObjects);
    };

    // Function to play the sound and stop automatically after 2 minutes
    const playSound = () => {
      if (!isAudioPlaying) {
        isAudioPlaying = true; // Mark audio as playing
        audio.currentTime = 0; // Reset audio playback to the start
        audio
          .play()
          .then(() => {
            console.log("Audio playback started successfully.");
            setTimeout(() => {
              stopSound(); // Stop the audio after 2 minutes
            }, 120000); // 120000 milliseconds = 2 minutes
          })
          .catch((error) => {
            console.error("Audio playback failed: ", error);
            alert("Audio playback failed. Please ensure the sound file is accessible.");
            isAudioPlaying = false; // Reset the flag if playback fails
          });
      } else {
        console.log("Audio is already playing.");
      }
    };

    // Function to stop the sound
    const stopSound = () => {
      if (isAudioPlaying) {
        audio.pause(); // Pause the audio
        audio.currentTime = 0; // Reset audio to the beginning
        isAudioPlaying = false; // Mark audio as stopped
        console.log("Audio playback stopped.");
      }
    };

    // Event listeners for buttons
    startButton.addEventListener("click", startCamera);
    stopButton.addEventListener("click", stopCamera);

    // Initially disable the stop button
    stopButton.disabled = true;

    // Load the model when the page is loaded
    window.onload = loadModel;
    video.setAttribute('preload', 'none'); // Don't load video until started
