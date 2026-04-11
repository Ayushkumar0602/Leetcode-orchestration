import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertTriangle } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// We use the CDN endpoints for testing, these contain the neural network weights
const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

export default function AIProctor({ onViolationDetected }) {
    const videoRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [status, setStatus] = useState('Initializing AI...');
    const [cocoModel, setCocoModel] = useState(null);
    const [facialWarning, setFacialWarning] = useState('');
    const onViolationDetectedRef = useRef(onViolationDetected);

    // Keep ref updated to avoid closure traps without re-running effects
    useEffect(() => {
        onViolationDetectedRef.current = onViolationDetected;
    }, [onViolationDetected]);

    // 1. Load ML Models
    useEffect(() => {
        let isMounted = true;
        const loadModels = async () => {
            try {
                setStatus('Loading Face Models...');
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);

                setStatus('Loading Object Models...');
                const ssd = await cocoSsd.load({ base: 'mobilenet_v2' });
                if (isMounted) setCocoModel(ssd);

                if (isMounted) setIsModelsLoaded(true);
                setStatus('Active');
            } catch (err) {
                console.error("Error loading ML models", err);
                if (isMounted) setStatus('Model Load Failed');
            }
        };
        loadModels();
        return () => { isMounted = false; };
    }, []);

    // 2. Start Live Video
    useEffect(() => {
        if (!isModelsLoaded) return;
        
        let stream = null;
        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error(err);
                setStatus('Camera Blocked');
                onViolationDetectedRef.current('Camera or Microphone access was lost.', true);
            }
        };
        startVideo();

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [isModelsLoaded]);

    const handleVideoPlay = () => {
        let isRunning = true;
        let gracePeriod = true;
        let glanceStreak = 0; // Accumulator for sustained away-glances
        
        setTimeout(() => gracePeriod = false, 3000); // 3 sec grace period for lighting to adjust

        const detectLoop = async () => {
            if (!isRunning) return;
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
                requestAnimationFrame(detectLoop);
                return;
            }
            if (status !== 'Active') {
                requestAnimationFrame(detectLoop);
                return;
            }

            if (!gracePeriod) {
                try {
                    // Feature A: Face Detection & Head Pose
                    const detections = await faceapi.detectAllFaces(
                        videoRef.current, 
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }) 
                    ).withFaceLandmarks();
                    
                    if (detections.length === 0) {
                        setFacialWarning('No face detected in frame.');
                    } else if (detections.length > 1) {
                        setFacialWarning('Multiple people detected in frame.');
                    } else {
                        // Check head pose (Pitch & Yaw) by triangulating eyes, nose tip, and chin
                        const landmarks = detections[0].landmarks;
                        const nose = landmarks.getNose()[3]; // Tip of the nose
                        const leftEye = landmarks.getLeftEye()[0];
                        const rightEye = landmarks.getRightEye()[3];
                        const chin = landmarks.getJawOutline()[8];
                        
                        // 1. Yaw (Left vs Right shift)
                        const leftDist = Math.abs(nose.x - leftEye.x);
                        const rightDist = Math.abs(nose.x - rightEye.x);
                        const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) + 1);
                        
                        // 2. Pitch (Looking down or up)
                        const eyeY = (leftEye.y + rightEye.y) / 2;
                        const eyeToNose = Math.abs(eyeY - nose.y);
                        const noseToChin = Math.abs(nose.y - chin.y);
                        
                        // If looking down, chin shortens incredibly on the 2D plane
                        const pitchDownRatio = eyeToNose / (noseToChin + 1);
                        // If looking up, nose tip moves up towards eyes
                        const pitchUpRatio = noseToChin / (eyeToNose + 1);
                        
                        // Human-realistic constraints: allows quick glancing at a keyboard or thinking
                        if (yawRatio > 2.8 || pitchDownRatio > 2.1 || pitchUpRatio > 3.0) { 
                            glanceStreak++;
                            if (glanceStreak > 4) { // Must hold the glance for multiple consecutive frames (~1.5s total)
                                setFacialWarning('Please sit straight and look at the screen.');
                                glanceStreak = 0; // Reset streak
                            }
                        } else {
                            // Rapidly decay the streak if user looks back at the exam
                            if (glanceStreak > 0) glanceStreak--;
                            if (glanceStreak === 0) setFacialWarning(''); // Clear warning once posture is restored
                        }
                    }

                    // Feature B: Object Detection (Phones, Books, Laptops, etc)
                    if (cocoModel) {
                        const predictions = await cocoModel.detect(videoRef.current);
                        const prohibited = predictions.find(p => ['cell phone', 'laptop', 'tablet', 'remote', 'book'].includes(p.class));
                        // Aggressive 30% confidence threshold for near-instant detection
                        if (prohibited && prohibited.score > 0.30) {
                            onViolationDetectedRef.current(`Prohibited item (${prohibited.class}) detected.`);
                        }
                        
                        // Check for secondary persons hiding their faces
                        const people = predictions.filter(p => p.class === 'person');
                        if (people.length > 1) {
                            setFacialWarning('Multiple physical persons detected nearby.');
                        }
                    }
                } catch (err) {
                    // Safely ignore inference drops from bad frames
                }
            }

            // Schedule next frame non-overlapping (Wait 200ms to allow Code Editor breathing room ~ 5FPS)
            setTimeout(() => {
                if (isRunning) requestAnimationFrame(detectLoop);
            }, 200);
        };

        // Start High-Performance tracking loop
        detectLoop();

        // Safely kill tracker if video pauses natively
        videoRef.current.addEventListener('pause', () => isRunning = false, { once: true });
    };

    return (
        <motion.div 
            drag
            dragMomentum={false}
            style={{
                position: 'fixed',
                bottom: 30,
                right: 30,
                width: 220,
                height: 165,
                background: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                zIndex: 90000,
                boxShadow: facialWarning ? '0 10px 40px rgba(239,71,67,0.6)' : '0 10px 40px rgba(0,0,0,0.5)',
                border: facialWarning ? '2px solid rgba(239,71,67,0.8)' : '2px solid rgba(255,255,255,0.1)',
                cursor: 'grab',
                transition: 'all 0.3s ease'
            }}
        >
            <video 
                ref={videoRef}
                autoPlay 
                muted 
                playsInline
                onPlay={handleVideoPlay}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            
            {/* Status indicator overlay */}
            <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', color: status === 'Active' ? '#00b8a3' : '#ffa116', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                {status === 'Active' ? <Camera size={12} /> : <AlertTriangle size={12} />}
                {status}
            </div>

            {/* Facial Warning Banner */}
            {facialWarning && (
                <div style={{ position: 'absolute', top: 34, left: 0, right: 0, background: 'rgba(239,71,67,0.95)', padding: '6px 10px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#fff', backdropFilter: 'blur(6px)', zIndex: 10 }}>
                    {facialWarning}
                </div>
            )}
            
            {/* Grab Handle UI */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '6px', pointerEvents: 'none' }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '99px' }} />
            </div>
        </motion.div>
    );
}
