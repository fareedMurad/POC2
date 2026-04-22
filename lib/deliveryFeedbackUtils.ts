/**
 * Delivery Feedback Utilities
 * Parse and calculate delivery metrics from AI feedback
 */

import { DeliveryAnalysisResult } from "./apiServices";

// Build variables for pace ranges
const PACE_MODERATE_MIN = 130; // WPM
const PACE_MODERATE_MAX = 170; // WPM

export interface DeliveryMetrics {
  pace?: PaceMetric;
  energy?: EnergyMetric;
  confidence?: ConfidenceMetric;
  fillerWords?: FillerWordsMetric;
}

export interface PaceMetric {
  value: number; // WPM
  position: number; // 1-9 (position on the scale)
  label: "Slow" | "Moderate" | "Fast";
}

export interface EnergyMetric {
  value: number; // -1.0 to 1.0
  position: number; // 1-9
  feedback: "Low" | "Moderate" | "High";
}

export interface ConfidenceMetric {
  value: number; // 0.0 to 1.0
  position: number; // 1-9
  feedback: "Low" | "Moderate" | "High";
}

export interface FillerWordsMetric {
  totalCount: number;
  breakdown?: { [key: string]: number };
}

/**
 * Calculate pace metric from delivery analysis
 */
export function calculatePaceMetric(
  deliveryResult: DeliveryAnalysisResult
): PaceMetric | null {
  // Check if pace node exists
  if (!deliveryResult.pace) {
    return null;
  }

  const averageWPM = deliveryResult.pace?.averageWordsPerMinute;

  // If averageWordsPerMinute is null, undefined, or not a number, exclude this metric
  if (averageWPM === null || averageWPM === undefined || isNaN(averageWPM)) {
    return null;
  }

  let label: "Slow" | "Moderate" | "Fast";
  let position: number;

  if (averageWPM < PACE_MODERATE_MIN) {
    // Slow range (< 130 WPM)
    label = "Slow";
    // Position 1-3 (beginning, middle, end of Slow bar)
    // Divide slow range into thirds: 0-43, 43-87, 87-130
    if (averageWPM < 43) position = 1; // Beginning
    else if (averageWPM < 87) position = 2; // Middle
    else position = 3; // End
  } else if (averageWPM > PACE_MODERATE_MAX) {
    // Fast range (> 170 WPM)
    label = "Fast";
    // Position 7-9 (beginning, middle, end of Fast bar)
    // Divide into reasonable ranges: 170-200, 200-230, 230+
    if (averageWPM < 200) position = 7; // Beginning
    else if (averageWPM < 230) position = 8; // Middle
    else position = 9; // End
  } else {
    // Moderate range (130-170 WPM)
    label = "Moderate";
    // Position 4-6 (beginning, middle, end of Moderate bar)
    const rangeSize = PACE_MODERATE_MAX - PACE_MODERATE_MIN; // 40
    const relativePosition = averageWPM - PACE_MODERATE_MIN;
    const percentage = relativePosition / rangeSize;

    if (percentage < 0.33) position = 4; // Beginning
    else if (percentage < 0.67) position = 5; // Middle
    else position = 6; // End
  }

  return {
    value: averageWPM,
    position,
    label,
  };
}

/**
 * Calculate energy metric from delivery analysis
 */
export function calculateEnergyMetric(
  deliveryResult: DeliveryAnalysisResult
): EnergyMetric | null {
  // Check if energyProxy node exists
  if (!deliveryResult.energyProxy) {
    return null;
  }

  const sentimentScore = deliveryResult.energyProxy?.averageSentimentScore;

  // If averageSentimentScore is null, undefined, or not a number, exclude this metric
  if (
    sentimentScore === null ||
    sentimentScore === undefined ||
    isNaN(sentimentScore)
  ) {
    return null;
  }

  let label: "Low" | "Moderate" | "High";
  let position: number;

  if (sentimentScore < -0.1) {
    // Negative/Low energy
    label = "Low";
    // Position 1-3
    if (sentimentScore > -0.4) {
      position = 1;
    } else if (sentimentScore > -0.7) {
      position = 2;
    } else {
      position = 3;
    }
  } else if (sentimentScore > 0.1) {
    // Positive/High energy
    label = "High";
    // Position 7-9
    if (sentimentScore > 0.6) position = 9;
    else if (sentimentScore > 0.3) position = 8;
    else position = 7;
  } else {
    // Neutral/Moderate energy (-0.1 to 0.1)
    label = "Moderate";
    position = 5;
  }

  return {
    value: sentimentScore,
    position,
    feedback: label,
  };
}

/**
 * Calculate confidence metric from delivery analysis
 */
export function calculateConfidenceMetric(
  deliveryResult: DeliveryAnalysisResult
): ConfidenceMetric | null {
  // Check if confidenceProxy node exists
  if (!deliveryResult.confidenceProxy) {
    return null;
  }

  const confidenceScore =
    deliveryResult.confidenceProxy.overallTranscriptConfidence;

  // If overallTranscriptConfidence is null, undefined, or not a number, exclude this metric
  if (
    confidenceScore === null ||
    confidenceScore === undefined ||
    isNaN(confidenceScore)
  ) {
    return null;
  }

  let label: "Low" | "Moderate" | "High";
  let position: number;

  if (confidenceScore < 0.4) {
    // Low confidence
    label = "Low";
    // Position 1-3
    if (confidenceScore < 0.15) position = 1;
    else if (confidenceScore < 0.27) position = 2;
    else position = 3;
  } else if (confidenceScore > 0.7) {
    // High confidence
    label = "High";
    // Position 7-9
    if (confidenceScore > 0.9) position = 9;
    else if (confidenceScore > 0.8) position = 8;
    else position = 7;
  } else {
    // Moderate confidence (0.4 to 0.7)
    label = "Moderate";
    // Position 4-6
    const normalizedScore = (confidenceScore - 0.4) / 0.3; // 0 to 1
    if (normalizedScore < 0.33) position = 4;
    else if (normalizedScore < 0.67) position = 5;
    else position = 6;
  }

  return {
    value: confidenceScore,
    position,
    feedback: label,
  };
}

/**
 * Extract filler words metric from delivery analysis
 */
export function extractFillerWordsMetric(
  deliveryResult: DeliveryAnalysisResult
): FillerWordsMetric | null {
  const fillerWords = deliveryResult.fillerWords;

  if (!fillerWords) {
    return null;
  }

  return {
    totalCount: fillerWords.totalCount || 0,
    breakdown: fillerWords.breakdown,
  };
}

/**
 * Get CSS class for positioning the white triangle indicator
 * 9 distinct positions across the scale:
 * Positions 1-3: Beginning, middle, end of first box (Slow/Low)
 * Positions 4-6: Beginning, middle, end of second box (Moderate)
 * Positions 7-9: Beginning, middle, end of third box (Fast/High)
 */
export function getTrianglePositionClass(position: number): string {
  // Each position is 1/9th of the total width
  const positions: { [key: number]: string } = {
    1: "left-[5%]", // 1/9 - Beginning of first box
    2: "left-[15.22%]", // 2/9 - Middle of first box
    3: "left-[25.33%]", // 3/9 - End of first box
    4: "left-[40%]", // 4/9 - Beginning of second box
    5: "left-[50.56%]", // 5/9 - Middle of second box
    6: "left-[61%]", // 6/9 - End of second box
    7: "left-[72.78%]", // 7/9 - Beginning of third box
    8: "left-[84%]", // 8/9 - Middle of third box
    9: "left-[96%]", // 9/9 - End of third box
  };

  return positions[position] || "left-[50%]"; // Default to center
}

/**
 * Parse full delivery metrics from delivery analysis result
 */
export function parseDeliveryMetrics(
  deliveryResult: DeliveryAnalysisResult
): DeliveryMetrics {
  return {
    pace: calculatePaceMetric(deliveryResult) || undefined,
    energy: calculateEnergyMetric(deliveryResult) || undefined,
    confidence: calculateConfidenceMetric(deliveryResult) || undefined,
    fillerWords: extractFillerWordsMetric(deliveryResult) || undefined,
  };
}
