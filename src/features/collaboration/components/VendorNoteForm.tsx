import React, { useState } from 'react';
import { providers } from '../../../data/mockData';
import { SelectedProvider } from '../../../types';
import SearchableDropdown from '../../../components/SearchableDropdown';

interface VendorNoteFormProps {
  onSubmit: (noteData: {
    vendorId: string;
    note: string;
    rating: number | null;
    tags: string[];
  }) => Promise<boolean>;
  isSubmitting: boolean;
  selectedProviders: SelectedProvider[];
  highlightVendorSelect: boolean;
  onFormInteraction: () => void;
  initialVendorId?: string;
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

export const VendorNoteForm: React.FC<VendorNoteFormProps> = ({
  onSubmit,
  isSubmitting,
  selectedProviders,
  highlightVendorSelect,
  onFormInteraction,
  initialVendorId = ''
}) => {
  const [newNote, setNewNote] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>(initialVendorId);

  const handleSubmit = async () => {
    if (!newNote.trim() || !selectedVendor) return;

    const success = await onSubmit({
      vendorId: selectedVendor,
      note: newNote,
      rating: selectedRating,
      tags: selectedTags
    });

    if (success) {
      // Reset form
      setNewNote('');
      setSelectedRating(null);
      setSelectedTags([]);
      setSelectedVendor('');
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const isVendorSelected = (providerId: string) => {
    return selectedProviders.some(p => p.id === providerId);
  };

  return (
    <div className={`bg-white rounded-lg border p-6 transition-all duration-300 ${
      highlightVendorSelect 
        ? 'border-blue-300 ring-2 ring-blue-100 shadow-md' 
        : 'border-gray-200'
    }`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Vendor Note</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vendor
          </label>
          <SearchableDropdown
            options={[
              { value: '', label: 'Choose a vendor...', description: '' },
              { value: 'general', label: 'General Notes', description: 'Notes not specific to any vendor' },
              ...providers.map(provider => ({
                value: provider.id,
                label: provider.name,
                description: `${provider.category}${isVendorSelected(provider.id) ? ' ✓ Selected' : ''}`
              }))
            ]}
            value={selectedVendor}
            onChange={(value) => {
              setSelectedVendor(value);
              onFormInteraction();
            }}
            placeholder="Search for a vendor..."
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={newNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setNewNote(e.target.value);
              onFormInteraction();
            }}
            placeholder="Add your note about this vendor..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
              highlightVendorSelect 
                ? 'border-blue-300 ring-1 ring-blue-100' 
                : 'border-gray-300'
            }`}
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating (optional)
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`w-8 h-8 rounded-full ${
                  selectedRating === rating
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                ★
              </button>
            ))}
            <button
              onClick={() => setSelectedRating(null)}
              className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!newNote.trim() || !selectedVendor || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
}; 