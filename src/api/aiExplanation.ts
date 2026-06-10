/**
 * API client for Bedrock AI recommendation explanation.
 * Calls POST /api/v1/ai/bedrock/recommendations/:id/explain.
 *
 * @author StockOps Team
 * @since 2.0
 */

import api from '@/lib/api'
import type { AiRecommendationExplanation } from '@/types/aiExplanation'

/**
 * Fetches an AI-generated explanation for the given recommendation.
 * Responses are cached server-side (Redis, TTL 1h) so repeated calls are cheap.
 *
 * @param recommendationId - Recommendation identifier
 * @returns AI explanation payload
 */
export async function fetchRecommendationExplanation(
  recommendationId: number,
): Promise<AiRecommendationExplanation> {
  const response = await api.post<AiRecommendationExplanation>(
    `/v1/ai/bedrock/recommendations/${recommendationId}/explain`,
  )
  return response.data
}
