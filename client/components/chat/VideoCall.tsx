"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VideoCallProps {
    socket: Socket;
    groupId: string;
    currentUserId: number | string;
    currentUserName: string;
    callType: 'audio' | 'video';
    onEndCall: () => void;
}

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export default function VideoCall({ socket, groupId, currentUserId, currentUserName, callType, onEndCall }: VideoCallProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
    const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');

    useEffect(() => {
        let stream: MediaStream;

        const initWebRTC = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                socket.emit("join-call", { roomId: groupId });

                socket.on("user-joined-call", handleUserJoined);
                socket.on("webrtc-offer", handleReceiveOffer);
                socket.on("webrtc-answer", handleReceiveAnswer);
                socket.on("webrtc-ice-candidate", handleReceiveIceCandidate);
                socket.on("user-left-call", handleUserLeft);
            } catch (err) {
                console.error("Error accessing media devices.", err);
                alert("Cannot access camera/microphone.");
                onEndCall();
            }
        };

        initWebRTC();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            Object.values(peersRef.current).forEach(peer => peer.close());
            peersRef.current = {};
            
            socket.emit("leave-call", { roomId: groupId });
            socket.off("user-joined-call", handleUserJoined);
            socket.off("webrtc-offer", handleReceiveOffer);
            socket.off("webrtc-answer", handleReceiveAnswer);
            socket.off("webrtc-ice-candidate", handleReceiveIceCandidate);
            socket.off("user-left-call", handleUserLeft);
        };
    }, []);

    const createPeer = (peerId: string, stream: MediaStream) => {
        const peer = new RTCPeerConnection(ICE_SERVERS);
        
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-ice-candidate", {
                    target: peerId,
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            setRemoteStreams(prev => ({
                ...prev,
                [peerId]: event.streams[0]
            }));
        };

        return peer;
    };

    const handleUserJoined = async ({ peerId }: { peerId: string }) => {
        if (!localStream) return;
        const peer = createPeer(peerId, localStream);
        peersRef.current[peerId] = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
            target: peerId,
            sdp: offer
        });
    };

    const handleReceiveOffer = async ({ caller, sdp }: { caller: string, sdp: any }) => {
        if (!localStream) return;
        const peer = createPeer(caller, localStream);
        peersRef.current[caller] = peer;

        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
            target: caller,
            sdp: answer
        });
    };

    const handleReceiveAnswer = async ({ caller, sdp }: { caller: string, sdp: any }) => {
        const peer = peersRef.current[caller];
        if (peer) {
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        }
    };

    const handleReceiveIceCandidate = async ({ caller, candidate }: { caller: string, candidate: any }) => {
        const peer = peersRef.current[caller];
        if (peer && candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handleUserLeft = ({ peerId }: { peerId: string }) => {
        if (peersRef.current[peerId]) {
            peersRef.current[peerId].close();
            delete peersRef.current[peerId];
        }
        
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
        
        // Auto-end sync for 1-to-1 calls: if the only peer left, end the call locally
        if (Object.keys(peersRef.current).length === 0) {
            onEndCall();
        }
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream && callType === 'video') {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col supports-[backdrop-filter]:backdrop-blur-xl">
            <div className="flex-1 p-4 grid gap-4 auto-rows-fr" style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`
            }}>
                {/* Local Video */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-white/10 group">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                                {currentUserName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md text-white text-sm font-medium border border-white/10">
                        You {isMuted && "(Muted)"}
                    </div>
                </div>

                {/* Remote Videos */}
                {Object.entries(remoteStreams).map(([peerId, stream]) => (
                    <div key={peerId} className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-white/10">
                        <video
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            ref={(el) => {
                                if (el) el.srcObject = stream;
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-6 pb-6">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {callType === 'video' && (
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>
                )}

                <button
                    onClick={() => {
                        const peers = Object.keys(peersRef.current);
                        // If it's a 1-to-1 call, forcefully end it for the other peer
                        if (peers.length === 1) {
                            socket.emit("end-call", { roomId: groupId, target: peers[0] });
                        }
                        onEndCall();
                    }}
                    className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
