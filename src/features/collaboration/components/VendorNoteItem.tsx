import React from 'react';
import { VendorNote } from '../types';

interface VendorNoteItemProps {
  note: VendorNote;
  isEditing: boolean;
  editNoteText: string;
  setEditNoteText: (text: string) => void;
  editNoteRating: number | null;
  setEditNoteRating: (rating: number | null) => void;
  editNoteTags: string[];
  updatingNote: boolean;
  deletingNote: string | null;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onTagToggle: (tag: string) => void;
}

const availableTags = [
  'Important',
  'Follow-up',
  'Confirmed',
  'Pending',
  'Cancelled',
  'Backup Option',
  'Preferred',
  'Budget-friendly',
  'Premium',
  'Recommended'
];

export const VendorNoteItem: React.FC<VendorNoteItemProps> = ({
  note,
  isEditing,
  editNoteText,
  setEditNoteText,
  editNoteRating,
  setEditNoteRating,
  editNoteTags,
  updatingNote,
  deletingNote,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onTagToggle
}) => {
  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-3 border border-green-200">
        <div className="space-y-4">
          <div>
            <textarea
              value={editNoteText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNoteText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Edit your note..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setEditNoteRating(editNoteRating === rating ? null : rating)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  editNoteRating === rating
                    ? 'bg-yellow-400 text-yellow-800'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
            <button
              onClick={() => setEditNoteRating(null)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  editNoteTags?.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              disabled={!editNoteText.trim() || updatingNote}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingNote ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-green-200">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{note.authorName}</span>
            {note.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600">{note.rating}/5</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
            {note.isCurrentUser && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={onEdit}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                  title="Edit note"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  disabled={deletingNote === note._id}
                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors disabled:opacity-50"
                  title="Delete note"
                >
                  {deletingNote === note._id ? (
                    <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-700 mb-2">{note.note}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 