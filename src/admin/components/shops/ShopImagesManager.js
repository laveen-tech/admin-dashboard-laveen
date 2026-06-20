import React, { useState, useEffect } from 'react';
import {
  X, FileText, Download, CheckCircle, XCircle, Eye,
  Image as ImageIcon, FileIcon, Clock, AlertCircle
} from 'lucide-react';

const ShopDocumentsModal = ({
                              isOpen,
                              onClose,
                              shop,
                              onApprove,
                              onReject,
                              isSubmitting
                            }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [documentComments, setDocumentComments] = useState({});

  useEffect(() => {
    if (shop && shop.documents) {
      setDocuments(shop.documents);
    }
  }, [shop]);

  if (!isOpen || !shop) return null;

  const getDocumentIcon = (documentType) => {
    const type = documentType?.toLowerCase() || '';
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
      return ImageIcon;
    }
    if (type.includes('pdf')) {
      return FileText;
    }
    return FileIcon;
  };

  const getVerificationBadge = (status) => {
    const config = {
      approved: {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
        label: 'Rejected'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
        label: 'Pending Review'
      }
    };

    const { color, icon: Icon, label } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
          {label}
      </span>
    );
  };

  const handlePreview = (doc) => {
    setSelectedDocument(doc);
    setPreviewUrl(doc.document_url);
  };

  const handleDocumentAction = (docId, action) => {
    const comment = documentComments[docId] || '';
    // This would call API to update individual document status
    console.log(`Document ${docId} ${action}:`, comment);
  };

  const handleApproveShop = () => {
    const allDocumentsApproved = documents.every(
        doc => doc.verification_status === 'approved'
    );

    if (!allDocumentsApproved) {
      alert('Please review and approve all documents before approving the shop.');
      return;
    }

    if (!adminComments.trim()) {
      alert('Please add comments before approving.');
      return;
    }

    onApprove({
      verification_status: 'approved',
      admin_comments: adminComments
    });
  };

  const handleRejectShop = () => {
    if (!adminComments.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    onReject({
      verification_status: 'rejected',
      admin_comments: adminComments
    });
  };

  const pendingCount = documents.filter(d => d.verification_status === 'pending').length;
  const approvedCount = documents.filter(d => d.verification_status === 'approved').length;
  const rejectedCount = documents.filter(d => d.verification_status === 'rejected').length;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Document Review</h2>
                <p className="text-blue-100 mt-1">{shop.shop_name}</p>
              </div>
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-sm text-blue-100">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-sm text-blue-100">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-sm text-blue-100">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">

            {/* No Documents Message */}
            {documents.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Ask the vendor to upload required documents
                  </p>
                </div>
            )}

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {documents.map((doc) => {
                const Icon = getDocumentIcon(doc.document_type);

                return (
                    <div
                        key={doc.document_id}
                        className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      {/* Document Preview */}
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {doc.document_type?.toLowerCase().includes('image') ? (
                            <img
                                src={`http://72.61.171.34:3000${doc.document_url}`}
                                alt={doc.document_type}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Icon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>

                      {/* Document Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {doc.document_type}
                          </h4>
                          {getVerificationBadge(doc.verification_status)}
                        </div>

                        {/* Admin Comments (if any) */}
                        {doc.admin_comments && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {doc.admin_comments}
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                              onClick={() => handlePreview(doc)}
                              className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition flex items-center justify-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <a
                              href={doc.document_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition flex items-center justify-center"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </a>
                        </div>

                        {/* Individual Document Comments */}
                        {doc.verification_status === 'pending' && (
                            <div className="mt-2">
                        <textarea
                            placeholder="Add comments for this document..."
                            className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows="2"
                            value={documentComments[doc.document_id] || ''}
                            onChange={(e) => setDocumentComments({
                              ...documentComments,
                              [doc.document_id]: e.target.value
                            })}
                        />
                              <div className="flex space-x-1 mt-1">
                                <button
                                    onClick={() => handleDocumentAction(doc.document_id, 'approve')}
                                    className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                                >
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  Approve
                                </button>
                                <button
                                    onClick={() => handleDocumentAction(doc.document_id, 'reject')}
                                    className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                  <XCircle className="w-3 h-3 inline mr-1" />
                                  Reject
                                </button>
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>

            {/* Overall Admin Comments */}
            {documents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Shop Review Comments
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows="4"
                      placeholder="Provide overall comments about the shop verification..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This comment will be visible to the vendor
                  </p>
                </div>
            )}
          </div>

<<<<<<< HEAD
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
=======
          {/* Footer Actions */}
          {documents.length > 0 && (
              <div className="border-t bg-gray-50 p-6">
                <div className="flex justify-end space-x-3">
                  <button
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleRejectShop}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Rejecting...
                        </>
                    ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Shop
                        </>
>>>>>>> 5467c3d (Bugs resolved)
                    )}
                  </button>
                  <button
                      onClick={handleApproveShop}
                      disabled={isSubmitting || pendingCount > 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Approving...
                        </>
                    ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Shop
                        </>
                    )}
                  </button>
                </div>
                {pendingCount > 0 && (
                    <p className="text-sm text-amber-600 mt-2 text-right">
                      ⚠️ Please review all {pendingCount} pending document(s) before approving
                    </p>
                )}
              </div>
          )}

          {/* Document Preview Modal */}
          {selectedDocument && previewUrl && (
              <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedDocument(null)}
              >
                <div
                    className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-medium">{selectedDocument.document_type}</h3>
                    <button
                        onClick={() => setSelectedDocument(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    {selectedDocument.document_type?.toLowerCase().includes('pdf') ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[70vh]"
                            title="Document Preview"
                        />
                    ) : (
                        <img
                            src={previewUrl}
                            alt="Document"
                            className="max-w-full h-auto"
                        />
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default ShopDocumentsModal;