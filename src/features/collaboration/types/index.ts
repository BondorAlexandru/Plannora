export interface Collaboration {
  _id: string;
  clientId: string;
  plannerId: string;
  eventId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt?: string;
  clientName: string;
  plannerName: string;
  plannerBusinessName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  budget?: number;
  isClient?: boolean;
}

export interface VendorNote {
  _id: string;
  collaborationId: string;
  eventId: string;
  vendorId: string;
  authorId: string;
  note: string;
  rating?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorName: string;
  isCurrentUser: boolean;
}

export interface VendorNoteFormData {
  note: string;
  rating: number | null;
  tags: string[];
  vendorId: string;
}

export interface VendorNotesCount {
  [vendorId: string]: number;
}

export interface GroupedNotes {
  [vendorId: string]: VendorNote[];
}

export type CollaborationTab = 'chat' | 'notes' | 'vendors' | 'edit-event'; 