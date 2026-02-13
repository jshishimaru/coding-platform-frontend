// Basic WebSocket wrapper boilerplate
export class SocketClient {
  private socket: WebSocket | null = null;

  connect(url: string) {
    this.socket = new WebSocket(url);
    this.socket.onopen = () => console.log('WebSocket Connected');
    this.socket.onmessage = (event) => console.log('Message:', event.data);
  }

  disconnect() {
    this.socket?.close();
  }
}

export const socketClient = new SocketClient();
