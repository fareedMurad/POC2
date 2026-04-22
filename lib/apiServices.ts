/**
 * API Services - Professional API Integration Layer
 * Handles all backend communication with proper error handling and type safety
 */

import { authFetch } from "./authFetch";

// ============================================
// CONFIGURATION
// ============================================

const API_ROOT_URL =
  process.env.NEXT_PUBLIC_API_ROOT_URL ||
  // "https://alpha3-praktice-btdgghetcpbkheav.canadacentral-01.azurewebsites.net/Hub/";
  "https://alpha4-praktice-d8gcgndtazgccrhp.eastus-01.azurewebsites.net/Hub/";
// ============================================
// COMMON TYPES & INTERFACES
// ============================================

interface BaseApiResponse {
  operationSuccessful: boolean;
  errorCode?: string;
  errorMessage?: string;
}

// ============================================
// PRESENTATION TYPE MAPPING
// ============================================

/**
 * Maps UI presentation type strings to API numeric values
 * The API expects numeric enum values for presentationType
 */
const PRESENTATION_TYPE_MAP: Record<string, number> = {
  Other: 0,
  Informative: 1,
  Motivational: 2,
  Elevator_Pitch: 3,
  Keynote: 4,
  Persuasive: 5,
};

/**
 * Reverse mapping from API numeric values to UI strings
 */
const PRESENTATION_TYPE_REVERSE_MAP: Record<number, string> = {
  0: "Other",
  1: "Informative",
  2: "Motivational",
  3: "Elevator Pitch",
  4: "Keynote",
  5: "Persuasive",
};

/**
 * Convert UI presentation type to API numeric value
 */
function getPresentationTypeValue(uiType: string): number {
  return PRESENTATION_TYPE_MAP[
    uiType === "Elevator Pitch" ? "Elevator_Pitch" : uiType
  ]; // Default to Informative if unknown
}

/**
 * Convert API numeric presentation type to UI string
 * Exported for use in components that need to display presentation type
 */
export function getPresentationTypeString(apiType: number | string): string {
  if (typeof apiType === "string") return apiType;
  return PRESENTATION_TYPE_REVERSE_MAP[apiType] ?? "Informative";
}

// ============================================
// PRESENTATION TYPES
// ============================================

export interface PresentationData {
  title: string;
  type: string;
  duration: number;
  purpose: string;
  audience: string;
  additionalNotes: string;
  otherType?: string;
  videoFile?: File | null;
  feedbackPreferences: {
    aiGenerated: boolean;
    peerFeedback: boolean;
  };
}

// The actual presentation data object
export interface Presentation {
  presentationId?: string;
  title?: string;
  presentationType?: number | string;
  purpose?: string;
  audience?: string;
  maxDuration?: number;
  otherDetails?: string;
  otherPresentationType?: string;
  objectives?: string; // The objectives field returned from API
  creationDateTime?: string;
  updatedAt?: string;
}

// API response wrapper that includes operationSuccessful
export interface PresentationDTO extends BaseApiResponse {
  presentationDTO?: Presentation;
  presentationObjectivesDTO?: Presentation;
}

// ============================================
// REHEARSAL MEDIA TYPES
// ============================================

export type AiFeedbackRequestStatus =
  | "NONE"
  | "PROCESSING"
  | "FAILED"
  | "COMPLETE" // API may return "COMPLETE" without D
  | "COMPLETED";

// Rehearsal Media object
export interface RehearsalMedia {
  rehearsalMediaId?: string;
  presentationId?: string;
  aiFeedbackRequestId?: string | null;
  title?: string;
  rehearsalMediaType?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  duration?: number;
  fileName?: string;
  fileExtension?: string;
  rehearsalMediaStatus?: string;
  aiFeedbackRequestStatus?: AiFeedbackRequestStatus;
  aiFeedbackOverallScore?: number | null;
  totalPeerFeedbackReceived?: number;
  uploadDateTime?: string;
}

// API response wrappers
export interface RehearsalMediaDTO extends BaseApiResponse {
  presentationTitle: any;
  rehearsalMediaDTO?: RehearsalMedia;
}

export interface BeginUploadDTO extends BaseApiResponse {
  presignedFileUrl?: string;
  presignedThumbnailUrl?: string;
  fileName?: string;
  thumbnailFileName?: string;
  rehearsalMediaId?: string;
}

export interface RehearsalMediaListDTO extends BaseApiResponse {
  pageKey: null;
  rehearsalMediaDTOList?: RehearsalMedia[];
}

// ============================================
// AI FEEDBACK TYPES
// ============================================

export interface DeliveryAnalysisResult {
  pace?: {
    averageWordsPerMinute?: number;
    feedback?: string;
  };
  energyProxy?: {
    averageSentimentScore?: number;
  };
  confidenceProxy?: {
    overallTranscriptConfidence?: number;
  };
  fillerWords?: {
    totalCount?: number;
    breakdown?: { [key: string]: number };
  };
}

export interface AiFeedbackRequest {
  aiFeedbackRequestId?: string;
  rehearsalMediaId?: string;
  presentationId?: string;
  aiFeedbackRequestStatus?: AiFeedbackRequestStatus;
  transcript?: string;
  contentAnalysisResult?: string; // Full text analysis
  deliveryAnalysisResult?: string; // JSON string that needs to be parsed
  creationDateTime?: string;
}

export interface AiFeedbackRequestDTO extends BaseApiResponse {
  aiFeedbackRequestDTO?: AiFeedbackRequest;
}

interface LegalDocuments {
  ContentPolicy?: string;
  PrivacyPolicy?: string;
  TermsAndConditions?: string;
}

export interface LegalDocumentsResult {
  legalDocuments: LegalDocuments;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
}

export interface RegisterProps {
  verificationRequestId(arg0: string, verificationRequestId: any): unknown;
  name?: string;
  email?: string;
  password?: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface ResendVerificationCodeProps {
  verificationRequestId?: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface ValidateVerificationCodeProps {
  resultCode: string;
  validationMessage: string;
  verificationRequestId?: string;
  verificationCode?: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface SignInProps {
  verificationRequestId(arg0: string, verificationRequestId: any): unknown;
  authToken: string;
  email?: string;
  password?: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface PagedPresentationsProps {
  pageSize(pageSize: any): unknown;
  presentationDTOList: never[];
  presentations: never[];
  pageKey: any;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface AddToPresentationFavoritesProps {
  presentationId: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface RemoveFromPresentationFavoritesProps {
  presentationId: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface VerifyEmailForPasswordResetProps {
  verificationRequestId?: string;
  email: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface ResetPasswordProps {
  verificationRequestId?: string;
  newPassword: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface UpdateProfileProps {
  email?: string;
  name?: string;
  password: string;
  operationSuccessful: true;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

// ============================================
// PEER FEEDBACK TYPES
// ============================================

export interface PeerFeedbackSegment {
  segmentIndex: number;
  startingFrame: number;
  endingFrame: number;
  feedback: string;
}

export interface PeerFeedback {
  rehearsalMediaId?: string;
  presentationId?: string;
  peerFeedbackSegments?: PeerFeedbackSegment[];
  creationDateTime?: string;
}

export interface PeerFeedbackListDTO extends BaseApiResponse {
  pageKey: null;
  peerFeedbackDTOList?: PeerFeedback[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build API URL with query parameters
 */
function buildApiUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(endpoint, API_ROOT_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * Handle API errors and throw meaningful messages
 */
function handleApiError(error: any, context: string): never {
  console.error(`API Error in ${context}:`, error);

  if (error.response) {
    throw new Error(
      error.response.data?.errorMessage ||
        `Server error: ${error.response.status}`
    );
  } else if (error.request) {
    throw new Error("No response from server. Please check your connection.");
  } else {
    throw new Error(error.message || "An unexpected error occurred");
  }
}

// ============================================
// Auth and Profile Endpoints
// ============================================

/**
 * Get Legal Documents
 * Retrieve legal documents results
 */
export async function getLegalDocuments() {
  try {
    const url = buildApiUrl("GetLegalDocuments");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: LegalDocumentsResult = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to retrieve AI feedback");
    }

    return result;
  } catch (error) {
    handleApiError(error, "getLegalDocuments");
  }
}

/**
 * Get App Installation
 */
export async function getAppInstallation() {
  try {
    const url = buildApiUrl("GetAppInstallation");
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve app installation"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getAppInstallation");
  }
}

/**
 * Register user
 */
export async function registerUser(
  email: string,
  name: string,
  password: string
): Promise<RegisterProps> {
  try {
    const url = buildApiUrl("Register", {
      email,
      name,
      password,
    });
    const response = await fetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RegisterProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to register user!");
    }

    return result;
  } catch (error) {
    handleApiError(error, "Register");
  }
}

/**
 * POST SignIn
 */
export async function signIn(
  email: string,
  password: string | undefined
): Promise<SignInProps> {
  try {
    const url = buildApiUrl("SignIn", {
      email,
      password,
    });
    const response = await fetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SignInProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to signin!");
    }

    return result;
  } catch (error) {
    handleApiError(error, "SignIn");
  }
}

/**
 * Validate Verification Code
 */
export async function validateVerificationCode(
  verificationRequestId: string,
  verificationCode: string | undefined
): Promise<ValidateVerificationCodeProps> {
  try {
    const url = buildApiUrl("ValidateVerificationCode", {
      verificationRequestId,
      verificationCode,
    });
    const response = await fetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ValidateVerificationCodeProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to resend verification code!"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "ValidateVerificationCode");
  }
}

/**
 * Resend Verification Code
 */
export async function resendVerificationCode(
  verificationRequestId: string
): Promise<ResendVerificationCodeProps> {
  try {
    const url = buildApiUrl("ResendVerificationCode", {
      verificationRequestId,
    });
    const response = await fetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ResendVerificationCodeProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to resend verification code!"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "ResendVerificationCode");
  }
}

/**
 * SignOut endpoint
 */
export async function signOut(): Promise<void> {
  try {
    const url = buildApiUrl("SignOut", {});

    const response = await authFetch(url, {
      method: "POST",
    });

    // ❌ API failure
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // ✅ Some APIs return empty body on success
    const contentLength = response.headers.get("content-length");

    if (contentLength && contentLength !== "0") {
      // parse only if response exists
      const result = await response.json();

      if (result?.operationSuccessful === false) {
        throw new Error(result.errorMessage || "Failed to reset password");
      }
    }

    // ✅ success (no response expected)
    return;
  } catch (error) {
    handleApiError(error, "ResetPassword");
  }
}

/**
 * Verify Email For Password Reset
 */
export async function verifyEmailForPasswordReset(
  email: string
): Promise<VerifyEmailForPasswordResetProps> {
  try {
    const url = buildApiUrl("VerifyEmailForPasswordReset", {
      email,
    });
    const response = await fetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: VerifyEmailForPasswordResetProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to verify email for password reset!"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "verifyEmailForPasswordReset");
  }
}

/**
 * Reset Password
 */
export async function resetPassword(
  verificationRequestId: string,
  newPassword: string
): Promise<void> {
  try {
    const url = buildApiUrl("ResetPassword", {
      verificationRequestId,
      newPassword,
    });

    const response = await fetch(url, {
      method: "POST",
    });

    // ❌ API failure
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // ✅ Some APIs return empty body on success
    const contentLength = response.headers.get("content-length");

    if (contentLength && contentLength !== "0") {
      // parse only if response exists
      const result = await response.json();

      if (result?.operationSuccessful === false) {
        throw new Error(result.errorMessage || "Failed to reset password");
      }
    }

    // ✅ success (no response expected)
    return;
  } catch (error) {
    handleApiError(error, "ResetPassword");
  }
}

// update profile endpoint

export async function updateProfile(
  email: string,
  name: string,
  password: string
) {
  try {
    const url = buildApiUrl("UpdateProfile", {
      email,
      name,
      password,
    });

    const response = await authFetch(url, {
      method: "POST",
    });

    // ❌ API failure
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");

    if (contentLength && contentLength !== "0") {
      const result = await response.json();

      if (result?.operationSuccessful === false) {
        throw new Error(result.errorMessage || "Failed to update profile");
      }
    }

    return;
  } catch (error) {
    handleApiError(error, "UpdateProfile");
  }
}

/**
 * Get User Activity Stats
 */
export async function getUserActivityStats() {
  try {
    const url = buildApiUrl("GetUserActivityStats");
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve user activity stats"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getUserActivityStats");
  }
}

/**
 * Get User Activity Limits
 */
export async function getUserActivityLimits() {
  try {
    const url = buildApiUrl("GetUserActivityLimits");
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve user activity limits"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getUserActivityLimits");
  }
}

// ============================================
// PRESENTATION Endpoints
// ============================================

/**
 * Create Presentation
 * Called when user completes Step 2 and doesn't have a PresentationId
 */
export async function createPresentation(
  data: PresentationData
): Promise<PresentationDTO> {
  try {
    const params = {
      title: data.title.trim(),
      presentationType: getPresentationTypeValue(data.type),
      purpose: data.purpose.trim(),
      audience: data.audience.trim(),
      maxDuration: data.duration,
      otherDetails: data.additionalNotes?.trim() || "",
      otherPresentationType: data.type === "Other" ? data.otherType : "",
    };

    const url = buildApiUrl("CreatePresentation", params);
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PresentationDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to create presentation");
    }

    return result;
  } catch (error) {
    handleApiError(error, "createPresentation");
  }
}

/**
 * Update Presentation
 * Called when user already has a PresentationId and wants to update objectives
 */
export async function updatePresentation(
  presentationId: string,
  data: PresentationData
): Promise<PresentationDTO> {
  try {
    const params = {
      presentationId,
      title: data.title.trim(),
      presentationType: getPresentationTypeValue(data.type),
      purpose: data.purpose.trim(),
      audience: data.audience.trim(),
      maxDuration: data.duration,
      otherDetails: data.additionalNotes?.trim() || "",
      otherPresentationType: data.type === "Other" ? data.otherType : "",
    };

    const url = buildApiUrl("UpdatePresentation", params);
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PresentationDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to update presentation");
    }

    return result;
  } catch (error) {
    handleApiError(error, "updatePresentation");
  }
}

/**
 * Get Presentation
 * Retrieve presentation details by ID
 */
export async function getPresentation(
  presentationId: string
): Promise<PresentationDTO> {
  try {
    const url = buildApiUrl("GetPresentation", { presentationId });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PresentationDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to retrieve presentation");
    }

    return result;
  } catch (error) {
    handleApiError(error, "getPresentation");
  }
}

// ============================================
// REHEARSAL MEDIA APIs
// ============================================

/**
 * Begin Rehearsal Media Upload
 * Get presigned URL for video upload
 */
export async function beginRehearsalMediaUpload(
  presentationId: string
): Promise<BeginUploadDTO> {
  try {
    const url = buildApiUrl("BeginRehearsalMediaUpload", { presentationId });
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BeginUploadDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to begin upload");
    }

    return result;
  } catch (error) {
    handleApiError(error, "beginRehearsalMediaUpload");
  }
}

/**
 * Upload file to presigned URL with progress tracking
 * This is a direct upload to cloud storage (S3/Azure Blob)
 */
export async function uploadToPresignedUrl(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Failed to upload file to storage"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was aborted"));
      });

      // Open connection and send file
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error) {
      console.error("Error uploading to presigned URL:", error);
      reject(new Error("Failed to upload file to storage"));
    }
  });
}

/**
 * Complete Rehearsal Media Upload
 * Called after successful upload to presigned URL
 */
export async function completeRehearsalMediaUpload(
  presentationId: string,
  fileName: string,
  fileSize: number,
  recordingDurationInSeconds: number,
  thumbnailFileName?: string
): Promise<RehearsalMediaDTO> {
  try {
    const params: Record<string, any> = {
      presentationId,
      fileName,
      fileSize,
      recordingDurationInSeconds,
    };

    if (thumbnailFileName) {
      params.thumbnailFileName = thumbnailFileName;
    }

    const url = buildApiUrl("CompleteRehearsalMediaUpload", params);
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RehearsalMediaDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to complete upload");
    }

    return result;
  } catch (error) {
    handleApiError(error, "completeRehearsalMediaUpload");
  }
}

/**
 * Get Rehearsal Media List
 * Retrieve all rehearsals for a presentation
 */
export async function getPagedRehearsalMediaList(
  presentationId: string,
  pageKey: string
): Promise<RehearsalMediaListDTO> {
  try {
    const url = buildApiUrl("GetPagedRehearsalMediaList", {
      presentationId,
      pageKey,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RehearsalMediaListDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve rehearsal list"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getPagedRehearsalMediaList");
  }
}

/**
 * Get Rehearsal Media
 * Get details of a specific rehearsal
 */
export async function getRehearsalMedia(
  presentationId: string,
  rehearsalMediaId: string
): Promise<RehearsalMediaDTO> {
  try {
    const url = buildApiUrl("GetRehearsalMedia", {
      presentationId,
      rehearsalMediaId,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RehearsalMediaDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve rehearsal media"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getRehearsalMedia");
  }
}

/**
 * Get Rehearsal Media
 * Get details of a specific rehearsal
 */
export async function getRehearsalMediaAnonymously(
  presentationId: string,
  rehearsalMediaId: string
): Promise<RehearsalMediaDTO> {
  try {
    const url = buildApiUrl("GetRehearsalMediaAnonymously", {
      presentationId,
      rehearsalMediaId,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RehearsalMediaDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve rehearsal media"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getRehearsalMediaAnonymously");
  }
}

/**
 * Delete Rehearsal Media
 * Remove a rehearsal from the system
 */
export async function deleteRehearsalMedia(
  presentationId: string,
  rehearsalMediaId: string
): Promise<void> {
  try {
    const url = buildApiUrl("DeleteRehearsalMedia", {
      presentationId,
      rehearsalMediaId,
    });
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting rehearsal media:", error);
    throw new Error("Failed to delete rehearsal media");
  }
}

// ============================================
// AI FEEDBACK APIs
// ============================================

/**
 * Submit AI Feedback Request
 * Request AI analysis for a rehearsal
 */
export async function submitAiFeedbackRequest(
  presentationId: string,
  rehearsalMediaId: string
): Promise<AiFeedbackRequestDTO> {
  try {
    const url = buildApiUrl("SubmitAiFeedbackRequest", {
      presentationId,
      rehearsalMediaId,
    });
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AiFeedbackRequestDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to submit AI feedback request"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "submitAiFeedbackRequest");
  }
}

/**
 * Get AI Feedback Request
 * Retrieve AI feedback results
 */
export async function getAiFeedbackRequest(
  presentationId: string,
  rehearsalMediaId: string,
  aiFeedbackRequestId: string
): Promise<AiFeedbackRequestDTO> {
  try {
    const url = buildApiUrl("GetAiFeedbackRequest", {
      presentationId,
      rehearsalMediaId,
      aiFeedbackRequestId,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AiFeedbackRequestDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(result.errorMessage || "Failed to retrieve AI feedback");
    }

    return result;
  } catch (error) {
    handleApiError(error, "getAiFeedbackRequest");
  }
}

// ============================================
// PEER FEEDBACK APIs
// ============================================

/**
 * Save Peer Feedback
 * Submit peer feedback segments as a direct array
 */
export async function savePeerFeedback(
  presentationId: string,
  rehearsalMediaId: string,
  peerFeedbackSegments: PeerFeedbackSegment[]
): Promise<void> {
  try {
    const url = buildApiUrl("SavePeerFeedback", {
      presentationId,
      rehearsalMediaId,
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(peerFeedbackSegments), // Send array directly, not wrapped
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error saving peer feedback:", error);
    throw new Error("Failed to save peer feedback");
  }
}

/**
 * Get Peer Feedback List
 * Retrieve all peer feedback for a rehearsal
 */
export async function getpagedPeerFeedbackList(
  presentationId: string,
  rehearsalMediaId: string,
  pageKey: string
): Promise<PeerFeedbackListDTO> {
  try {
    const url = buildApiUrl("GetpagedPeerFeedbackList", {
      presentationId,
      rehearsalMediaId,
      pageKey,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PeerFeedbackListDTO = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve peer feedback"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getpagedPeerFeedbackList");
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse Delivery Analysis Result JSON
 * Converts the JSON string to typed object
 */
export function parseDeliveryAnalysisResult(
  jsonString: string
): DeliveryAnalysisResult | null {
  try {
    return JSON.parse(jsonString) as DeliveryAnalysisResult;
  } catch (error) {
    console.error("Error parsing delivery analysis result:", error);
    return null;
  }
}

/**
 * Get video duration from file
 * Returns duration in seconds
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };

    video.onerror = () => {
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Extract thumbnail from video file
 * Returns a webp Blob that can be uploaded
 */
export function extractVideoThumbnailBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% of video duration, whichever is earlier
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        // Create canvas and draw video frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to webp blob
        canvas.toBlob(
          (blob) => {
            window.URL.revokeObjectURL(video.src);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create thumbnail blob"));
            }
          },
          "image/webp",
          0.8 // Quality
        );
      } catch (error) {
        window.URL.revokeObjectURL(video.src);
        reject(error);
      }
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video for thumbnail extraction"));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Poll AI Feedback Status
 * Continuously check status until it's no longer PROCESSING
 */
export async function pollAiFeedbackStatus(
  presentationId: string,
  rehearsalMediaId: string,
  onStatusUpdate: (status: AiFeedbackRequestStatus) => void,
  intervalMs: number = 30000 // 30 seconds
): Promise<void> {
  const poll = async () => {
    try {
      const result = await getRehearsalMedia(presentationId, rehearsalMediaId);
      const status =
        result.rehearsalMediaDTO?.aiFeedbackRequestStatus || "NONE";

      onStatusUpdate(status);

      if (status === "PROCESSING") {
        // Continue polling
        setTimeout(poll, intervalMs);
      }
    } catch (error) {
      console.error("Error polling AI feedback status:", error);
      // Retry after interval
      setTimeout(poll, intervalMs);
    }
  };

  poll();
}

/**
 * get Paged Presentations
 */
export async function getPagedPresentations(pageKey: string) {
  try {
    const url = buildApiUrl("GetPagedPresentations", {
      pageKey,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PagedPresentationsProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve paged presentations"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getPagedPresentations");
  }
}

/**
 * Get Paged Favorite Presentations
 */
export async function getPagedFavoritePresentations(pageKey: string) {
  try {
    const url = buildApiUrl("GetPagedFavoritePresentations", {
      pageKey,
    });
    const response = await authFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PagedPresentationsProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to retrieve paged presentations"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "getPagedFavoritePresentations");
  }
}

/**
 * Add To Presentation Favorites
 */
export async function addToPresentationFavorites(
  presentationId: string
): Promise<AddToPresentationFavoritesProps> {
  try {
    const url = buildApiUrl("AddToPresentationFavorites", {
      presentationId: presentationId,
    });
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AddToPresentationFavoritesProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage || "Failed to add the presentation to favorites!"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "addToPresentationFavorites");
  }
}

/**
 * Remove From Presentation Favorites
 */
export async function removeFromPresentationFavorites(
  presentationId: string
): Promise<RemoveFromPresentationFavoritesProps> {
  try {
    const url = buildApiUrl("RemoveFromPresentationFavorites", {
      presentationId: presentationId,
    });
    const response = await authFetch(url, {
      method: "POST",
      // No Content-Type header - API expects query params only, no body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RemoveFromPresentationFavoritesProps = await response.json();

    if (!result.operationSuccessful) {
      throw new Error(
        result.errorMessage ||
          "Failed to remove the presentation from favorites!"
      );
    }

    return result;
  } catch (error) {
    handleApiError(error, "RemoveFromPresentationFavorites");
  }
}
