import React, { useState, useRef } from 'react';
import { 
  Upload, X, Image as ImageIcon, Trash2, Star, Check, Loader
} from 'lucide-react';

const ShopImagesManager = ({ 
  shop, 
  profileImage, 
  galleryImages = [], 
  onUploadProfile,
  onUploadGallery,
  onDeleteImage,
  onSetPrimary,
  isUploading 
}) => {
  const profileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleProfileImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    onUploadProfile(file);
  };

  const handleGalleryImagesSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total images limit (max 10 images)
    if (galleryImages.length + validFiles.length > 10) {
      alert(`You can upload maximum 10 images. Current: ${galleryImages.length}, Trying to add: ${validFiles.length}`);
      return;
    }

    onUploadGallery(validFiles);
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Image Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Shop Profile Image
        </h3>
        <div className="flex items-start space-x-4">
          
          {/* Profile Image Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Shop Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No image</p>
                </div>
              )}
            </div>
            
            {/* Primary Badge */}
            {profileImage && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="w-3 h-3 mr-1 fill-white" />
                Profile
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageSelect}
            />
            
            <button
              onClick={() => profileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {profileImage ? 'Change' : 'Upload'} Profile Image
                </>
              )}
            </button>
            
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">
                • Recommended size: 500x500 pixels
              </p>
              <p className="text-xs text-gray-600">
                • Max file size: 5MB
              </p>
              <p className="text-xs text-gray-600">
                • Formats: JPG, PNG, WEBP
              </p>
            </div>

            {profileImage && (
              <button
                onClick={() => onDeleteImage(profileImage, 'profile')}
                disabled={isUploading}
                className="mt-3 px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Images Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Shop Gallery ({galleryImages.length}/10)
          </h3>
          <div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryImagesSelect}
            />
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploading || galleryImages.length >= 10}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center text-sm"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Images
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {galleryImages.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No gallery images uploaded</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload multiple images to showcase your shop
            </p>
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={isUploading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 inline-flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div 
                key={image.id || index} 
                className="relative group aspect-square"
              >
                {/* Image */}
                <div className="w-full h-full rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-100">
                  <img 
                     src={`http://72.61.171.34:3000${image.url || image.document_url}`}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    
                    {/* Set as Primary */}
                    {!image.is_primary && (
                      <button
                        onClick={() => onSetPrimary(image.id || image.document_id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteImage(image.id || image.document_id, 'gallery')}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Primary
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress[image.id] && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs">{uploadProgress[image.id]}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Guidelines */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Upload high-quality images that showcase your shop</li>
            <li>• Maximum 10 images allowed</li>
            <li>• Each image should be less than 5MB</li>
            <li>• Recommended aspect ratio: Square (1:1)</li>
            <li>• Formats supported: JPG, PNG, WEBP</li>
            <li>• First image will be set as primary by default</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShopImagesManager;