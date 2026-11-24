/**
 * Feature manifest — the ONE place features are plugged in.
 * Navigation, routes, home widgets and overlays are all generated from this list.
 */
import { registerFeatures } from '@/core/registry';
import { homeFeature } from './home';
import { orderFeature } from './order';
import { scanFeature } from './scan';
import { rewardsFeature } from './rewards';
import { youFeature } from './you';
import { bagFeature } from './bag';
import { joinFeature } from './join';
import { ordersFeature } from './orders';
import { locationsFeature } from './locations';
import { eventsFeature } from './events';
import { inboxFeature } from './inbox';
import { studioFeature } from './studio';
import { soonFeatures } from './soon';

registerFeatures([
  // bottom tabs (order decides position)
  homeFeature, orderFeature, scanFeature, rewardsFeature, youFeature,
  // hidden flows
  bagFeature, joinFeature,
  // "More" hub inside Account
  ordersFeature, locationsFeature, eventsFeature, inboxFeature, studioFeature,
  ...soonFeatures,
]);
