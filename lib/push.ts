import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@maganghub.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(title: string, body: string, icon?: string) {
  const subscriptions = await prisma.pushSubscription.findMany();

  const notifications = subscriptions.map((sub) => {
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
    });

    return webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload
    ).catch(async (err) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Subscription expired or removed, delete from DB
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        console.error('Send push error:', err);
      }
    });
  });

  await Promise.all(notifications);
}
