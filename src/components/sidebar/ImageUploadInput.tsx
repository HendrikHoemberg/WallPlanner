import { Upload, X } from 'lucide-react';
import React, { useRef } from 'react';
import { readFileAsDataUrl, validateImageFile } from '../../utils/imageUtils';

interface ImageUploadInputProps {
  imageUrl?: string;
  onImageChange: (dataUrl: string) => void;
  onImageRemove: () => void;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  imageUrl,
  onImageChange,
  onImageRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onImageChange(dataUrl);
    } catch (error) {
      alert('Failed to read file');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Image</label>

      {imageUrl && (
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" />
          <button
            onClick={onImageRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50"
      >
        <Upload size={18} />
        {loading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
      </button>
    </div>
  );
};
