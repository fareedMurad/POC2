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
export function getPresentationTypeValue(uiType: string): number {
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
  objectives?: string;
  isFavorite?: boolean;
  creationDateTime?: any;
  otherDetails?: string;
  feedbackPreferences: {
    aiGenerated: boolean;
    peerFeedback: boolean;
  };
}

// The actual presentation data object
export interface Presentation {
  isFavorite: boolean;
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
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
}

export interface RegisterProps {
  verificationRequestId(arg0: string, verificationRequestId: any): unknown;
  name?: string;
  email?: string;
  password?: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface ResendVerificationCodeProps {
  verificationRequestId?: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface ValidateVerificationCodeProps {
  resultCode: string;
  validationMessage: string;
  verificationRequestId?: string;
  verificationCode?: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface SignInProps {
  verificationRequestId(arg0: string, verificationRequestId: any): unknown;
  authToken: string;
  email?: string;
  password?: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface PagedPresentationsProps {
  favoriteUserSlideDeckDTOList: never[];
  slideDeckDTOList: never[];
  venueTypeList: never[];
  audienceSizeList: never[];
  roomMediaTypeList: never[];
  hasNextPage: boolean;
  items: never[];
  roomLibraryFiltersDTO: PagedPresentationsProps;
  userPanoRoomPhotoDTO: any;
  userPanoRoomPhotoDTOList: never[];
  mobilePanoUploadRequestDTO: any;
  pageSize(pageSize: any): unknown;
  presentationDTOList: never[];
  presentations: never[];
  pageKey: any;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface AddToPresentationFavoritesProps {
  presentationId: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface RemoveFromPresentationFavoritesProps {
  presentationId: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface VerifyEmailForPasswordResetProps {
  verificationRequestId?: string;
  email: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface ResetPasswordProps {
  verificationRequestId?: string;
  newPassword: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface UpdateProfileProps {
  email?: string;
  name?: string;
  password: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

// ============================================
// POC 3 TYPES
// ============================================

export interface CreateMobilePanoUploadRequestProps {
  mobilePanoUploadRequestDTO: any;
  presentationId: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export interface UploadUserPanoRoomPhotoProps {
  presentationId: string;
  operationSuccessful: boolean;
  errorMessage: string;
  errorCode: string;
  result?: any;
}

export type VenueType =
  | "MEETING ROOM"
  | "LIVING ROOM"
  | "BEDROOM"
  | "DINING ROOM"
  | "KITCHEN";

export type AudienceSize = "ZERO" | "ONE" | "TWO" | "THREE_PLUS";

export type RoomMediaType = "PHOTO" | "VIDEO";

export interface FilterRoomLibraryPaginatedParams {
  pageNumber: number;
  venueTypes?: VenueType[];
  audienceSizes?: AudienceSize[];
  roomMediaTypes?: RoomMediaType[];
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

export interface UploadUserSlideDeckProps extends BaseApiResponse {
  userSlideDeckDTO: any;
  presentationId: string;
  fileHash: string;
  slideDeckFile: File;
}

export interface AddToUserSlideDeckFavoritesProps extends BaseApiResponse {
  userSlideDeckid: string;
}

export interface RemoveFromUserSlideDeckFavoritesProps extends BaseApiResponse {
  userSlideDeckid: string;
}
