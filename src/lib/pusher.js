import Pusher from 'pusher';

let pusher = null;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
} else {
  // Graceful fallback for environments where Pusher is optional
  if (process.env.NODE_ENV !== "production") {
    console.warn('Pusher credentials missing in environment. Real-time notifications will not work.');
  }
}

export { pusher };
