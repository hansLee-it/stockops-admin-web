/**
 * TypeScript types for Bedrock AI recommendation explanation responses.
 * Matches backend BedrockRecommendationExplanationResponse.
 *
 * @author StockOps Team
 * @since 2.0
 */

/**
 * Risk level categories returned by the AI explanation service.
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

/**
 * AI-generated explanation for a recommendation.
 * Returned by POST /api/v1/ai/bedrock/recommendations/:id/explain.
 */
export interface AiRecommendationExplanation {
  /** Recommendation identifier */
  recommendationId: number
  /** Korean-language LLM-generated summary */
  summary: string
  /** List of reasons supporting the recommendation */
  reasons: string[]
  /** Reviewer checklist items for manual approval */
  reviewerChecklist: string[]
  /** Assessed risk level */
  riskLevel: RiskLevel
  /** Model identifier that generated the explanation */
  modelId: string
  /** ISO timestamp of generation */
  generatedAt: string
}
