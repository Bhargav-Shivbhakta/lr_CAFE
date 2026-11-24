import { LIMITS } from './index';

/**
 * Notification Studio copy writer: turns a template + a real menu item (or event)
 * into several ready-to-send versions. Pure function — the same input gives the same output,
 * so the server can generate identical copy later.
 */
export type TemplateId = 'new-item' | 'back' | 'happy-hour' | 'event' | 'rainy' | 'miss-you' | 'weekend';

export const TEMPLATES: { id: TemplateId; label: string; needs: 'item' | 'event'; hint: string }[] = [
  { id: 'new-item', label: 'New on the menu', needs: 'item', hint: 'Introduce a new drink or dish' },
  { id: 'back', label: 'Back in stock', needs: 'item', hint: 'Something sold out is back' },
  { id: 'happy-hour', label: 'Happy hour', needs: 'item', hint: 'Double points, 3–5:30, Mon–Thu' },
  { id: 'event', label: 'Tonight at the café', needs: 'event', hint: 'Live music, run club, open mic' },
  { id: 'rainy', label: 'Rainy day', needs: 'item', hint: 'Cozy weather, warm drink' },
  { id: 'miss-you', label: 'We miss you', needs: 'item', hint: "For people who haven't been in lately" },
  { id: 'weekend', label: 'Weekend special', needs: 'item', hint: 'Plans for Saturday and Sunday' },
];

export interface ComposeInput {
  template: TemplateId;
  item?: { name: string; description: string; price: number; section?: string };
  event?: { title: string; where: string; when: string };
  location: string;
}
export interface Draft { title: string; body: string; fits: boolean }

const money = (n: number) => `$${n.toFixed(2)}`;
const emojiFor = (section?: string) =>
  section === 'Coffee & drinks' ? '☕' : section === 'Pastries & dessert' ? '🍩' : section ? '🥐' : '🎶';
const firstSentence = (s: string) => {
  const t = (s.split(/(?<=\.)\s/)[0] ?? '').trim();
  return t.length > 70 ? '' : t;
};

export function composeNotification(input: ComposeInput): Draft[] {
  const { item, event, location: loc } = input;
  const name = item?.name ?? '';
  const price = item ? money(item.price) : '';
  const short = item ? firstSentence(item.description) : '';
  const e = emojiFor(item?.section);
  const lead = short ? `${short} ` : '';
  let raw: [string, string][] = [];

  switch (input.template) {
    case 'new-item':
      raw = [
        [`New on the menu: ${name}`, `${lead}Now at ${loc} for ${price}.`],
        [`${e} Say hi to ${name}`, `Fresh on the menu at ${loc}. Order ahead and skip the line.`],
        [`${name} just pulled up a chair`, `${lead}Try it today for ${price}.`],
      ];
      break;
    case 'back':
      raw = [
        [`${name} is back`, `Back on the menu at ${loc}. Grab one before it disappears again.`],
        [`${e} You asked. ${name} is back.`, `${lead}Order ahead at ${loc}.`],
        [`Good news: ${name} returned`, `It's back at ${loc} for ${price}. Your move.`],
      ];
      break;
    case 'happy-hour':
      raw = [
        ['Double points until 5:30', `Order ${name} before 5:30 and earn 2× House Key points.`],
        [`${e} 2× points on ${name}`, `Happy hour at ${loc}: double points until 5:30 today.`],
        ['Happy hour at the Living Room', `${name}, double points and a couch with your name on it.`],
      ];
      break;
    case 'event': {
      const t = event?.title ?? 'Something fun';
      raw = [
        [`🎶 ${t} tonight`, `${event?.where ?? loc}, ${event?.when ?? 'tonight'}. Pull up a chair.`],
        [`Tonight at ${event?.where ?? loc}`, `${t}, ${event?.when ?? 'tonight'}. Order ahead so your drink is waiting.`],
        [`Plans tonight? ${t}.`, `See you at ${event?.where ?? loc}, ${event?.when ?? 'tonight'}.`],
      ];
      break;
    }
    case 'rainy':
      raw = [
        [`Rainy day? ${name} weather.`, `Stay cozy. It's ready in about 10 minutes at ${loc}.`],
        [`${e} Grey skies, warm ${name.toLowerCase()}`, `Order ahead and skip the wet line at ${loc}.`],
        ['It is officially couch weather', `${name} for ${price}, ready when you are.`],
      ];
      break;
    case 'miss-you':
      raw = [
        ['We miss you at the Living Room', `It's been a while. ${name} is one tap away.`],
        [`${e} Your couch misses you`, `${name} at ${loc}, whenever you're ready.`],
        ['Long time no see', `Your usual seat is waiting at ${loc}. So is ${name}.`],
      ];
      break;
    case 'weekend':
      raw = [
        [`Weekend plans: ${name}`, `${lead}At ${loc} all weekend.`],
        [`${e} Saturday called. It wants ${name}.`, `Order ahead at ${loc} for ${price}.`],
        ['Make it a Living Room weekend', `${name}, a good seat and nowhere to be.`],
      ];
      break;
  }

  const drafts = raw.map(([title, body]) => ({
    title: title.replace(/\s+/g, ' ').trim(),
    body: body.replace(/\s+/g, ' ').trim(),
  })).map((d) => ({ ...d, fits: [...d.title].length <= LIMITS.title && [...d.body].length <= LIMITS.body }));
  // Versions that fit the limits come first; long ones stay available to edit down.
  return [...drafts.filter((d) => d.fits), ...drafts.filter((d) => !d.fits)];
}
