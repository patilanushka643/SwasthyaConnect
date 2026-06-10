import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const createEmptyStream = () => new MediaStream();

const VideoConsult = () => {
  const { id: consultationIdParam } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth() || {};
  const { socket } = useSocket() || {};

  const consultationId = useMemo(() => String(consultationIdParam || '').trim(), [consultationIdParam]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(createEmptyStream());
  const hasJoinedRef = useRef(false);
  const isOffererRef = useRef(false);

  const [connectionState, setConnectionState] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Preparing secure consultation session...');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localReady, setLocalReady] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);

  const attachRemoteStream = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play?.().catch(() => undefined);
    }
  };

  const setupPeerConnection = () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !socket || !consultationId) {
        return;
      }

      socket.emit('ice-candidate', {
        consultationId,
        candidate: event.candidate,
        userId: user?._id,
      });
    };

    peerConnection.ontrack = (event) => {
      const [incomingStream] = event.streams || [];

      if (incomingStream) {
        remoteStreamRef.current = incomingStream;
      } else if (event.track) {
        remoteStreamRef.current.addTrack(event.track);
      }

      attachRemoteStream();
      setRemoteReady(true);
      setConnectionState((currentValue) => (currentValue === 'connected' ? currentValue : 'connecting'));
    };

    peerConnection.onconnectionstatechange = () => {
      setConnectionState(peerConnection.connectionState || 'idle');
    };

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState || 'idle';

      if (state === 'connected') {
        setConnectionState('connected');
      }

      if (state === 'failed' || state === 'disconnected') {
        setStatusMessage('Connection interrupted. Reconnecting signaling...');
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const cleanupConnection = async ({ notifyEndCall = false } = {}) => {
    const peerConnection = peerConnectionRef.current;

    if (notifyEndCall && socket && consultationId) {
      socket.emit('end-call', {
        consultationId,
        userId: user?._id,
      });
    }

    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }

    remoteStreamRef.current = createEmptyStream();
    setLocalReady(false);
    setRemoteReady(false);
    setConnectionState('ended');
  };

  const ensureLocalMedia = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play?.().catch(() => undefined);
    }

    const peerConnection = setupPeerConnection();
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    setLocalReady(true);
    return stream;
  };

  const createAndSendOffer = async () => {
    const peerConnection = setupPeerConnection();

    if (!localStreamRef.current || !socket || !consultationId) {
      return;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('video-offer', {
      consultationId,
      sdp: offer,
      userId: user?._id,
    });

    isOffererRef.current = true;
    setStatusMessage('Waiting for the other participant to join...');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!consultationId || !socket || hasJoinedRef.current) {
      return undefined;
    }

    hasJoinedRef.current = true;
    socket.emit('join-consultation', {
      consultationId,
      userId: user?._id,
      role: user?.role,
    });

    return () => {
      hasJoinedRef.current = false;
    };
  }, [consultationId, socket, user?._id, user?.role]);

  useEffect(() => {
    if (!socket || !consultationId) {
      return undefined;
    }

    const handleJoined = async (payload = {}) => {
      if (String(payload?.consultationId || '') !== consultationId) {
        return;
      }

      setStatusMessage('Camera and microphone access is being prepared.');

      try {
        await ensureLocalMedia();

        if ((payload?.participantCount || 0) <= 1) {
          setStatusMessage('Joined room. Waiting for another participant...');
          return;
        }

        setStatusMessage('Joined room. Awaiting offer from the established peer...');
      } catch (error) {
        setConnectionState('failed');
        setStatusMessage(error?.message || 'Unable to access camera or microphone.');
      }
    };

    const handlePeerJoined = async (payload = {}) => {
      if (String(payload?.consultationId || '') !== consultationId) {
        return;
      }

      setStatusMessage('Participant joined. Starting negotiation...');

      try {
        await ensureLocalMedia();

        if (!isOffererRef.current) {
          await createAndSendOffer();
        }
      } catch (error) {
        setConnectionState('failed');
        setStatusMessage(error?.message || 'Unable to initialize consultation call.');
      }
    };

    const handleOffer = async (payload = {}) => {
      if (String(payload?.consultationId || '') !== consultationId || !payload?.sdp) {
        return;
      }

      const peerConnection = setupPeerConnection();
      await ensureLocalMedia();

      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('video-answer', {
        consultationId,
        sdp: answer,
        userId: user?._id,
      });

      setStatusMessage('Answer sent. Establishing media tunnel...');
      setConnectionState('connecting');
    };

    const handleAnswer = async (payload = {}) => {
      if (String(payload?.consultationId || '') !== consultationId || !payload?.sdp) {
        return;
      }

      const peerConnection = setupPeerConnection();
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      setStatusMessage('Secure media session established.');
      setConnectionState('connected');
    };

    const handleIceCandidate = async (payload = {}) => {
      if (String(payload?.consultationId || '') !== consultationId || !payload?.candidate) {
        return;
      }

      const peerConnection = setupPeerConnection();

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (_error) {
        setStatusMessage('ICE candidate exchange paused; retrying network traversal.');
      }
    };

    const handleEndCall = async (payload = {}) => {
      if (String(payload?.consultationId || '') !== consultationId) {
        return;
      }

      setStatusMessage('Consultation ended by participant.');
      await cleanupConnection({ notifyEndCall: false });
    };

    socket.on('consultation-joined', handleJoined);
    socket.on('consultation-peer-joined', handlePeerJoined);
    socket.on('video-offer', handleOffer);
    socket.on('video-answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('end-call', handleEndCall);

    return () => {
      socket.off('consultation-joined', handleJoined);
      socket.off('consultation-peer-joined', handlePeerJoined);
      socket.off('video-offer', handleOffer);
      socket.off('video-answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('end-call', handleEndCall);
    };
  }, [consultationId, socket, user?._id]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!consultationId) {
        setStatusMessage('Missing consultation channel identifier.');
        setConnectionState('failed');
        return;
      }

      try {
        await ensureLocalMedia();
      } catch (error) {
        setConnectionState('failed');
        setStatusMessage(error?.message || 'Camera and microphone access are required for consultation.');
      }
    };

    bootstrap();

    return () => {
      cleanupConnection({ notifyEndCall: false });
    };
  }, [consultationId]);

  const toggleTrack = (kind) => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const track = kind === 'audio' ? stream.getAudioTracks()?.[0] : stream.getVideoTracks()?.[0];

    if (!track) {
      return;
    }

    track.enabled = !track.enabled;

    if (kind === 'audio') {
      setMicEnabled(track.enabled);
    } else {
      setCameraEnabled(track.enabled);
    }
  };

  const handleEndConsultation = async () => {
    await cleanupConnection({ notifyEndCall: true });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-5">
        <header className="rounded-3xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Remote Video Consultation</p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Secure peer-to-peer consultation room</h1>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <p className="font-medium text-white">Channel</p>
              <p className="mt-1 break-all text-cyan-200">{consultationId || 'pending'}</p>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-5 xl:grid-cols-[1.55fr_0.7fr]">
          <div className="relative min-h-[70vh] overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 shadow-[0_24px_90px_rgba(2,6,23,0.5)]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full bg-slate-950/90 object-cover"
            />

            {!remoteReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 px-6 text-center">
                <div className="max-w-md rounded-3xl border border-slate-700 bg-slate-900/80 px-6 py-5 shadow-lg backdrop-blur">
                  <p className="text-lg font-semibold text-white">Waiting for remote participant</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">The room is open and signaling is active. Once the other peer joins, the session will establish automatically.</p>
                </div>
              </div>
            )}

            <div className="absolute left-5 top-5 rounded-full border border-cyan-400/40 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
              {connectionState}
            </div>

            <div className="absolute bottom-5 right-5 h-40 w-28 overflow-hidden rounded-2xl border border-slate-600 bg-slate-950 shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:h-48 md:w-36">
              <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              {!localReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 px-3 text-center text-xs font-medium text-slate-300">
                  Camera preview pending
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 border-t border-slate-700/70 bg-slate-950/80 px-4 py-4 backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-slate-300">{statusMessage}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTrack('audio')}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${micEnabled ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20' : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTrack('video')}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${cameraEnabled ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20' : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEndConsultation}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    End Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-[28px] border border-slate-700 bg-slate-900/90 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Session Summary</p>
              <h2 className="mt-2 text-xl font-bold text-white">Consultation Controls</h2>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Local media</p>
              <p className="mt-2">Audio: {micEnabled ? 'active' : 'muted'}</p>
              <p>Video: {cameraEnabled ? 'active' : 'disabled'}</p>
              <p>Local stream: {localReady ? 'ready' : 'initializing'}</p>
              <p>Remote stream: {remoteReady ? 'ready' : 'waiting'}</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Participant tracking</p>
              <p className="mt-2">User: {user?.name || 'Unknown user'}</p>
              <p>Role: {user?.role || 'unassigned'}</p>
              <p>Socket: {socket?.id || 'not connected'}</p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default VideoConsult;