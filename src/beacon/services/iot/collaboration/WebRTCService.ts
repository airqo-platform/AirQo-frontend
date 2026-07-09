export class WebRTCService {
  private readonly config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  createPeerConnection(
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  ): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    if (onConnectionStateChange) {
      pc.onconnectionstatechange = () => {
        onConnectionStateChange(pc.connectionState);
      };
    }

    return pc;
  }

  createDataChannel(
    pc: RTCPeerConnection,
    label: string,
    onMessage: (data: string) => void,
    onOpen?: () => void,
    onClose?: () => void
  ): RTCDataChannel {
    const channel = pc.createDataChannel(label, {
      ordered: true,
    });

    this.setupDataChannelListeners(channel, onMessage, onOpen, onClose);
    return channel;
  }

  setupDataChannelListeners(
    channel: RTCDataChannel,
    onMessage: (data: string) => void,
    onOpen?: () => void,
    onClose?: () => void
  ): void {
    channel.onmessage = (event) => {
      onMessage(event.data);
    };

    if (onOpen) {
      channel.onopen = () => {
        onOpen();
      };
    }

    if (onClose) {
      channel.onclose = () => {
        onClose();
      };
    }
  }

  async createOffer(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(
    pc: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(
    pc: RTCPeerConnection,
    desc: RTCSessionDescriptionInit
  ): Promise<void> {
    await pc.setRemoteDescription(new RTCSessionDescription(desc));
  }

  async addIceCandidate(
    pc: RTCPeerConnection,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

export const webRTCService = new WebRTCService();
