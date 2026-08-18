import { useEffect, useRef, useState } from "react";
import {
  FiCamera,
  FiMapPin,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";

import {
  useCheckInMutation,
  useCheckOutMutation,
} from "../../services/api";

const AttendanceActions = ({ today }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(null);

  const [capturedSelfie, setCapturedSelfie] = useState(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState(null);

  const [videoReady, setVideoReady] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [checkIn, { isLoading: isCheckingIn }] =
    useCheckInMutation();

  const [checkOut, { isLoading: isCheckingOut }] =
    useCheckOutMutation();

  const isSubmitting =
    isCheckingIn || isCheckingOut;

  // ==========================================================
  // SELFIE PREVIEW URL
  // ==========================================================

  useEffect(() => {
    if (!capturedSelfie) {
      setSelfiePreviewUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(capturedSelfie);

    setSelfiePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [capturedSelfie]);

  // ==========================================================
  // STOP CAMERA
  // ==========================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setVideoReady(false);
  };

  // ==========================================================
  // CLEANUP ON UNMOUNT
  // ==========================================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);

  // ==========================================================
  // OPEN CAMERA
  // ==========================================================

  const openCamera = async (mode) => {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setMessage("");
    setCapturedSelfie(null);
    setLocation(null);
    setVideoReady(false);

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraMode(mode);
      setCameraOpen(true);
    } catch (error) {
      console.error(
        "Camera access failed:",
        error
      );

      setErrorMessage(
        "Camera access denied. Please allow camera permission and try again."
      );
    }
  };

  // ==========================================================
  // CONNECT STREAM TO VIDEO
  // ==========================================================

  useEffect(() => {
    if (
      !cameraOpen ||
      !streamRef.current ||
      !videoRef.current
    ) {
      return;
    }

    const video = videoRef.current;

    video.srcObject = streamRef.current;

    const handleReady = async () => {
      try {
        await video.play();

        setVideoReady(true);
        setErrorMessage("");
      } catch (error) {
        console.error(
          "Video play failed:",
          error
        );

        setErrorMessage(
          "Unable to start camera preview."
        );
      }
    };

    video.addEventListener(
      "loadedmetadata",
      handleReady
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleReady
      );
    };
  }, [cameraOpen]);

  // ==========================================================
  // CAPTURE SELFIE
  // ==========================================================

  const captureSelfie = () => {
    if (!videoReady) {
      setErrorMessage(
        "Camera is still loading. Please wait."
      );

      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setErrorMessage(
        "Camera is not ready."
      );

      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setErrorMessage(
        "Camera is still loading. Please wait."
      );

      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setErrorMessage(
        "Camera frame is not available yet."
      );

      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setErrorMessage(
        "Unable to capture selfie."
      );

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMessage(
            "Unable to capture selfie."
          );

          return;
        }

        const file = new File(
          [blob],
          `attendance-selfie-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setCapturedSelfie(file);

        stopCamera();

        setMessage(
          "Selfie captured successfully."
        );
      },
      "image/jpeg",
      0.85
    );
  };

  // ==========================================================
  // GET LOCATION
  // ==========================================================

  const getLocation = () => {
    setErrorMessage("");
    setMessage("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationLoading(false);

      setErrorMessage(
        "Location is not supported by this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);

        setMessage(
          "Location captured successfully."
        );
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage(
              "Location permission was denied. Please allow location access and try again."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setErrorMessage(
              "Your location is currently unavailable. Please check your device location settings."
            );
            break;

          case error.TIMEOUT:
            setErrorMessage(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setErrorMessage(
              "Unable to get your location. Please try again."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================================
  // SUBMIT ATTENDANCE
  // ==========================================================

  const submitAttendance = async () => {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setMessage("");

    if (!cameraMode) {
      setErrorMessage(
        "Attendance action is not selected. Please start again."
      );

      return;
    }

    if (!capturedSelfie) {
      setErrorMessage(
        "Please capture your selfie first."
      );

      return;
    }

    if (!location) {
      setErrorMessage(
        "Please capture your current location first."
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      "selfie",
      capturedSelfie
    );

    formData.append(
      "latitude",
      String(location.latitude)
    );

    formData.append(
      "longitude",
      String(location.longitude)
    );

    try {
      if (cameraMode === "check-in") {
        await checkIn(formData).unwrap();

        setMessage(
          "Check-in successful."
        );
      } else if (cameraMode === "check-out") {
        await checkOut(formData).unwrap();

        setMessage(
          "Check-out successful."
        );
      }

      stopCamera();

      setCapturedSelfie(null);
      setLocation(null);
      setCameraMode(null);
    } catch (error) {
      console.error(
        "Attendance submission failed:",
        error
      );

      setErrorMessage(
        error?.data?.message ||
          "Attendance submission failed. Please try again."
      );
    }
  };

  // ==========================================================
  // CANCEL FLOW
  // ==========================================================

  const cancelAttendanceFlow = () => {
    if (isSubmitting) {
      return;
    }

    stopCamera();

    setCapturedSelfie(null);
    setLocation(null);
    setCameraMode(null);

    setMessage("");
    setErrorMessage("");
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 shrink-0"
          aria-hidden="true"
        >
          <FiCamera className="text-base" />
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Today's Actions
        </h2>
      </div>

      {/* SUCCESS */}
      {message && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700"
        >
          <FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </div>
      )}

      {/* ERROR */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {/* ACTION BUTTONS */}
      {!cameraOpen && !capturedSelfie && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              openCamera("check-in")
            }
            disabled={
              isSubmitting ||
              Boolean(today?.checkIn)
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiLogIn aria-hidden="true" />
            {today?.checkIn
              ? "Already Checked In"
              : "Check In"}
          </button>

          <button
            type="button"
            onClick={() =>
              openCamera("check-out")
            }
            disabled={
              isSubmitting ||
              !today?.checkIn ||
              Boolean(today?.checkOut)
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiLogOut aria-hidden="true" />
            {!today?.checkIn
              ? "Check In First"
              : today?.checkOut
              ? "Already Checked Out"
              : "Check Out"}
          </button>
        </div>
      )}

      {/* CAMERA */}
      {cameraOpen && (
        <div className="mt-5 max-w-xl">
          <div className="bg-slate-900 rounded-2xl overflow-hidden ring-1 ring-slate-200">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={captureSelfie}
              disabled={!videoReady}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <FiCamera aria-hidden="true" />
              {videoReady
                ? "Capture Selfie"
                : "Camera Loading..."}
            </button>

            <button
              type="button"
              onClick={cancelAttendanceFlow}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <FiX aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CAPTURED SELFIE */}
      {capturedSelfie && (
        <div className="mt-5 max-w-xl">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
            <FiCheckCircle className="text-green-600" aria-hidden="true" />
            Selfie captured
          </p>

          {selfiePreviewUrl && (
            <img
              src={selfiePreviewUrl}
              alt="Attendance selfie preview"
              className="w-full max-w-md rounded-2xl border border-slate-200"
            />
          )}

          {/* LOCATION */}
          <div className="mt-5">
            {!location ? (
              <button
                type="button"
                onClick={getLocation}
                disabled={locationLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                <FiMapPin aria-hidden="true" />
                {locationLoading
                  ? "Getting Location..."
                  : "Capture Current Location"}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="flex items-center gap-2 font-medium text-green-700 text-sm">
                  <FiMapPin aria-hidden="true" />
                  Location captured
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  Latitude:{" "}
                  {location.latitude}
                </p>

                <p className="text-sm text-slate-600">
                  Longitude:{" "}
                  {location.longitude}
                </p>
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              type="button"
              onClick={submitAttendance}
              disabled={
                !location ||
                isSubmitting
              }
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <FiCheck aria-hidden="true" />
              {isSubmitting
                ? "Submitting..."
                : cameraMode === "check-in"
                ? "Confirm Check In"
                : "Confirm Check Out"}
            </button>

            <button
              type="button"
              onClick={cancelAttendanceFlow}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </section>
  );
};

export default AttendanceActions;