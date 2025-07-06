import React from 'react';
import { VendorNote, GroupedNotes } from '../types';
import { SelectedProvider } from '../../../types';
import { VendorNoteItem } from './VendorNoteItem';

interface VendorNotesListProps {
  groupedNotes: GroupedNotes;
  selectedProviders: SelectedProvider[];
  editingNote: string | null;
  editNoteText: string;
  setEditNoteText: (text: string) => void;
  editNoteRating: number | null;
  setEditNoteRating: (rating: number | null) => void;
  editNoteTags: string[];
  updatingNote: boolean;
  deletingNote: string | null;
  onEditNote: (note: VendorNote) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeleteNote: (noteId: string) => void;
  onEditTagToggle: (tag: string) => void;
  onQuickNote: (providerId: string, providerName: string) => void;
}

export const VendorNotesList: React.FC<VendorNotesListProps> = ({
  groupedNotes,
  selectedProviders,
  editingNote,
  editNoteText,
  setEditNoteText,
  editNoteRating,
  setEditNoteRating,
  editNoteTags,
  updatingNote,
  deletingNote,
  onEditNote,
  onCancelEdit,
  onSaveEdit,
  onDeleteNote,
  onEditTagToggle,
  onQuickNote
}) => {
  // Get vendor information by ID
  const getVendorInfo = (vendorId: string) => {
    if (vendorId === 'general') {
      return { name: 'General Notes', category: 'General', image: '' };
    }
    
    // Try to find in selected providers first
    const selectedProvider = selectedProviders.find(p => p.id === vendorId);
    if (selectedProvider) {
      return { 
        name: selectedProvider.name, 
        category: selectedProvider.category, 
        image: selectedProvider.image 
      };
    }
    
    // If not found in selected providers, it's from the general provider list
    return { name: 'Unknown Vendor', category: 'Unknown', image: '' };
  };

  if (Object.keys(groupedNotes).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No vendor notes yet</p>
        <p className="text-sm mt-1">Add your first note above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Vendors First */}
      {selectedProviders.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Vendors</h3>
          {selectedProviders.map(selectedProvider => {
            const vendorNotes = groupedNotes[selectedProvider.id] || [];
            const vendorInfo = getVendorInfo(selectedProvider.id);
            
            return (
              <div key={selectedProvider.id} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {vendorInfo.image && (
                      <img src={vendorInfo.image} alt={vendorInfo.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{vendorInfo.name}</h4>
                      <p className="text-sm text-gray-600">{vendorInfo.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      ✓ Selected - ${selectedProvider.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {vendorNotes.length} note{vendorNotes.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => onQuickNote(selectedProvider.id, selectedProvider.name)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors"
                      title="Add note"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {vendorNotes.length > 0 && (
                  <div className="space-y-3">
                    {vendorNotes.map(note => (
                      <div key={note._id}>
                        <VendorNoteItem
                          note={note}
                          isEditing={editingNote === note._id}
                          editNoteText={editNoteText}
                          setEditNoteText={setEditNoteText}
                          editNoteRating={editNoteRating}
                          setEditNoteRating={setEditNoteRating}
                          editNoteTags={editNoteTags}
                          updatingNote={updatingNote}
                          deletingNote={deletingNote}
                          onEdit={() => onEditNote(note)}
                          onCancelEdit={onCancelEdit}
                          onSaveEdit={onSaveEdit}
                          onDelete={() => onDeleteNote(note._id)}
                          onTagToggle={onEditTagToggle}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Other Vendors with Notes */}
      {Object.keys(groupedNotes).filter(vendorId => 
        !selectedProviders.some(sp => sp.id === vendorId)
      ).length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Other Vendors</h3>
          {Object.entries(groupedNotes)
            .filter(([vendorId]) => !selectedProviders.some(sp => sp.id === vendorId))
            .map(([vendorId, notes]) => {
              const vendorInfo = getVendorInfo(vendorId);
              return (
                <div key={vendorId} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {vendorInfo.image && (
                        <img src={vendorInfo.image} alt={vendorInfo.name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{vendorInfo.name}</h4>
                        <p className="text-sm text-gray-600">{vendorInfo.category}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {notes.map(note => (
                      <div key={note._id} className="bg-gray-50 rounded-lg p-3">
                        <VendorNoteItem
                          note={note}
                          isEditing={editingNote === note._id}
                          editNoteText={editNoteText}
                          setEditNoteText={setEditNoteText}
                          editNoteRating={editNoteRating}
                          setEditNoteRating={setEditNoteRating}
                          editNoteTags={editNoteTags}
                          updatingNote={updatingNote}
                          deletingNote={deletingNote}
                          onEdit={() => onEditNote(note)}
                          onCancelEdit={onCancelEdit}
                          onSaveEdit={onSaveEdit}
                          onDelete={() => onDeleteNote(note._id)}
                          onTagToggle={onEditTagToggle}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}; 