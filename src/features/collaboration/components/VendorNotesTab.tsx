import React, { useState } from 'react';
import { SelectedProvider } from '../../../types';
import { VendorNoteForm } from './VendorNoteForm';
import { VendorNotesList } from './VendorNotesList';
import { useVendorNotes } from '../hooks/useVendorNotes';
import { Collaboration } from '../types';

interface VendorNotesTabProps {
  collaborationId: string;
  collaboration: Collaboration;
  selectedProviders: SelectedProvider[];
  onQuickNote: (providerId: string, providerName: string) => void;
  highlightVendorSelect?: boolean;
}

export const VendorNotesTab: React.FC<VendorNotesTabProps> = ({
  collaborationId,
  collaboration,
  selectedProviders,
  onQuickNote,
  highlightVendorSelect: externalHighlight = false
}) => {
  const [highlightVendorSelect, setHighlightVendorSelect] = useState(externalHighlight);
  const [quickNoteVendorId, setQuickNoteVendorId] = useState<string>('');

  const {
    groupedNotes,
    addingNote,
    editingNote,
    editNoteText,
    setEditNoteText,
    editNoteRating,
    setEditNoteRating,
    editNoteTags,
    updatingNote,
    deletingNote,
    handleAddNote,
    handleEditNote,
    handleCancelEdit,
    handleSaveEdit,
    handleDeleteNote,
    handleEditTagToggle
  } = useVendorNotes(collaborationId, collaboration);

  const handleFormSubmit = async (noteData: {
    vendorId: string;
    note: string;
    rating: number | null;
    tags: string[];
  }) => {
    const success = await handleAddNote(noteData);
    if (success) {
      setHighlightVendorSelect(false);
      setQuickNoteVendorId('');
    }
    return success || false;
  };

  const handleFormInteraction = () => {
    setHighlightVendorSelect(false);
    setQuickNoteVendorId('');
  };

  const handleQuickNote = (providerId: string, providerName: string) => {
    setHighlightVendorSelect(true);
    setQuickNoteVendorId(providerId);
    onQuickNote(providerId, providerName);
  };

  return (
    <div className="space-y-6">
      <VendorNoteForm
        onSubmit={handleFormSubmit}
        isSubmitting={addingNote}
        selectedProviders={selectedProviders}
        highlightVendorSelect={highlightVendorSelect}
        onFormInteraction={handleFormInteraction}
        initialVendorId={quickNoteVendorId}
      />

      <VendorNotesList
        groupedNotes={groupedNotes}
        selectedProviders={selectedProviders}
        editingNote={editingNote}
        editNoteText={editNoteText}
        setEditNoteText={setEditNoteText}
        editNoteRating={editNoteRating}
        setEditNoteRating={setEditNoteRating}
        editNoteTags={editNoteTags}
        updatingNote={updatingNote}
        deletingNote={deletingNote}
        onEditNote={handleEditNote}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onDeleteNote={handleDeleteNote}
        onEditTagToggle={handleEditTagToggle}
        onQuickNote={handleQuickNote}
      />
    </div>
  );
}; 