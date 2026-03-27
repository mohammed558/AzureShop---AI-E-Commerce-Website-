/**
 * Azure Personalizer Service — STUBBED
 *
 * Azure Personalizer has been retired. This module preserves the original
 * interface so the rest of the codebase stays intact, but returns mock
 * data instead of calling the (no longer available) API.
 *
 * Original functionality:
 *   - POST /personalizer/v1.0/rank  → ranked product actions
 *   - POST /personalizer/v1.0/events/{eventId}/reward → reward signal
 */

/**
 * Mock rank: shuffle actions and return them in random order to simulate
 * a personalised ranking without any real API call.
 * @param {string} userId
 * @param {Object} contextFeatures
 * @param {Array}  actions - [{id, features}]
 */
async function getRankedRecommendations(userId, contextFeatures, actions) {
  const eventId = `mock-${Date.now()}`;

  const shuffled = [...actions].sort(() => Math.random() - 0.5);

  const ranking = shuffled.map((a, i) => ({
    id: a.id,
    probability: +(1 / (i + 1)).toFixed(4),
  }));

  return {
    eventId,
    rewardActionId: ranking[0]?.id || null,
    ranking,
  };
}

/**
 * Mock reward: no-op since there is no Personalizer backend to call.
 * @param {string} eventId
 * @param {number} reward
 */
async function sendReward(eventId, reward) {
  // no-op — Personalizer service is retired
}

module.exports = { getRankedRecommendations, sendReward };
