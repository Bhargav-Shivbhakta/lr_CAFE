// ---------- the bag engine: the ONE door into the bag ----------
// Every "+", "Add" and "Order my usual" button in the app asks Bag.plan() what to do.
// Nothing else may put a dish in the bag. Screens never decide this themselves, so Home,
// Order, search and holiday rows always behave the same way.
//
// The rule:
//   1. Not available right now (sold out, outside its meal hours)  → open the dish page (it says why, offers similar)
//   2. "My usual" with saved choices, or an add-on from a "goes great" row → add exactly that, no questions
//   3. Something must be picked (eggs, protein…)                     → open the dish page
//   4. Anything to offer (Goes great with it, customize)             → open the dish page
//   5. Plain item, nothing to choose and nothing to pair             → add straight away
const Bag = (() => {
  function plan({ available, groups, pairs, saved }) {
    if (!available) return { do: 'sheet', why: 'unavailable' };
    if (saved) return { do: 'add', why: 'usual', choices: saved };
    if (groups.some((g) => g.req && !g.def)) return { do: 'sheet', why: 'choose' };
    if (groups.length || pairs.length) return { do: 'sheet', why: 'offer' };
    return { do: 'add', why: 'plain', choices: {} };
  }
  // the bag line for a dish and its choices; one shape everywhere
  const lineKey = (id, full, note = '') => id + '|' + JSON.stringify(full) + '|' + note;
  return { plan, lineKey };
})();
