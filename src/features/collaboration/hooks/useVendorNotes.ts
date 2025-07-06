import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/NextAuthContext';
import { VendorNote, VendorNotesCount, GroupedNotes, Collaboration } from '../types';

export const useVendorNotes = (
  collaborationId: string | string[] | undefined,
  collaboration: Collaboration | null
) => {
  const [vendorNotes, setVendorNotes] = useState<VendorNote[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [editNoteRating, setEditNoteRating] = useState<number | null>(null);
  const [editNoteTags, setEditNoteTags] = useState<string[]>([]);
  const [updatingNote, setUpdatingNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState<string | null>(null);

  const { user, getToken } = useAuth();

  // Fetch vendor notes
  useEffect(() => {
    const fetchVendorNotes = async () => {
      if (!collaborationId || !user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendor-notes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch vendor notes');
        }
        
        const data = await response.json();
        setVendorNotes(data);
      } catch (err) {
        console.error('Error fetching vendor notes:', err);
      }
    };

    if (collaboration) {
      fetchVendorNotes();
    }
  }, [collaborationId, user, collaboration, getToken]);

  // Add vendor note
  const handleAddNote = async (noteData: {
    vendorId: string;
    note: string;
    rating: number | null;
    tags: string[];
  }) => {
    if (!noteData.note.trim() || !noteData.vendorId || !collaborationId || !user) return;
    
    setAddingNote(true);
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendor-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorId: noteData.vendorId,
          note: noteData.note.trim(),
          rating: noteData.rating,
          tags: noteData.tags
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      
      const newVendorNote = await response.json();
      setVendorNotes(prev => [newVendorNote, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding note:', err);
      alert(err instanceof Error ? err.message : 'Failed to add note');
      return false;
    } finally {
      setAddingNote(false);
    }
  };

  // Edit note handlers
  const handleEditNote = (note: VendorNote) => {
    setEditingNote(note._id);
    setEditNoteText(note.note);
    setEditNoteRating(note.rating || null);
    setEditNoteTags(note.tags || []);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditNoteText('');
    setEditNoteRating(null);
    setEditNoteTags([]);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editNoteText.trim() || !collaborationId || !user) return;
    
    setUpdatingNote(true);
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendor-notes/${editingNote}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          note: editNoteText.trim(),
          rating: editNoteRating,
          tags: editNoteTags
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update note');
      }
      
      const updatedNote = await response.json();
      console.log('Backend response:', updatedNote);
      console.log('Current vendorNotes before update:', vendorNotes);
      console.log('Editing note ID:', editingNote);
      
      setVendorNotes(prev => {
        const updated = prev.map(note => 
          note._id === editingNote ? updatedNote : note
        );
        console.log('Updated vendorNotes:', updated);
        return updated;
      });
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating note:', err);
      alert(err instanceof Error ? err.message : 'Failed to update note');
    } finally {
      setUpdatingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!collaborationId || !user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this note? This action cannot be undone.');
    if (!confirmed) return;
    
    setDeletingNote(noteId);
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendor-notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      setVendorNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeletingNote(null);
    }
  };

  const handleEditTagToggle = (tag: string) => {
    setEditNoteTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Computed values
  const groupedNotes: GroupedNotes = vendorNotes.reduce((groups, note) => {
    const vendorId = note.vendorId;
    if (!groups[vendorId]) {
      groups[vendorId] = [];
    }
    groups[vendorId].push(note);
    return groups;
  }, {} as Record<string, VendorNote[]>);

  const vendorNotesCount: VendorNotesCount = vendorNotes.reduce((counts, note) => {
    counts[note.vendorId] = (counts[note.vendorId] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return {
    vendorNotes,
    groupedNotes,
    vendorNotesCount,
    addingNote,
    editingNote,
    editNoteText,
    setEditNoteText,
    editNoteRating,
    setEditNoteRating,
    editNoteTags,
    setEditNoteTags,
    updatingNote,
    deletingNote,
    handleAddNote,
    handleEditNote,
    handleCancelEdit,
    handleSaveEdit,
    handleDeleteNote,
    handleEditTagToggle
  };
}; 