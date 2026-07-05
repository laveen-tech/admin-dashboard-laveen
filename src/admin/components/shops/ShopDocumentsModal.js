import React, { useState, useEffect } from 'react';
import {
  X, FileText, Download, CheckCircle, XCircle, Eye,
  Image as ImageIcon, FileIcon, Clock, AlertCircle, Loader
} from 'lucide-react';
import apiService from '../../services/api.service';

const API_BASE_URL = 'https://saloon-booking-management.onrender.com';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

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
  // Track which document is currently being approved/rejected
  const [processingDocId, setProcessingDocId] = useState(null);

  useEffect(() => {
    if (shop?.documents) {
      setDocuments(shop.documents);
    } else {
      setDocuments([]);
    }
    setAdminComments('');
    setDocumentComments({});
    setSelectedDocument(null);
    setProcessingDocId(null);
  }, [shop]);

  if (!isOpen || !shop) return null;

  const getDocumentIcon = (documentType) => {
    const type = documentType?.toLowerCase() || '';
    if (type.includes('image') || type.includes('jpg') || type.includes('png') ||
        type.includes('shop_profile') || type.includes('shop_gallery')) return ImageIcon;
    if (type.includes('pdf')) return FileText;
    return FileIcon;
  };

  const isImageType = (documentType) => {
    const type = documentType?.toLowerCase() || '';
    return (
        type.includes('image') || type.includes('jpg') || type.includes('jpeg') ||
        type.includes('png') || type.includes('webp') ||
        type.includes('shop_profile_image') || type.includes('shop_gallery_image')
    );
  };

  const getVerificationBadge = (status) => {
    const config = {
      approved: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: 'Rejected' },
      pending:  { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Pending Review' }
    };
    const { color, icon: Icon, label } = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
          {label}
      </span>
    );
  };

  // ✅ KEY FIX: Actually calls the API and updates local state
  const handleDocumentAction = async (docId, action) => {
    const comment = documentComments[docId] || '';

    if (action === 'rejected' && !comment.trim()) {
      alert('Please add a comment/reason before rejecting this document.');
      return;
    }

    setProcessingDocId(docId);
    try {
      await apiService.updateDocumentVerification(docId, {
        status: action,           // 'approved' or 'rejected'
        admin_comments: comment
      });

      // Update local document state immediately — no need to refetch
      setDocuments(prev =>
          prev.map(doc =>
              doc.document_id === docId
                  ? { ...doc, verification_status: action, admin_comments: comment }
                  : doc
          )
      );

      // Clear the comment field for this doc
      setDocumentComments(prev => ({ ...prev, [docId]: '' }));
    } catch (error) {
      console.error(`❌ Failed to ${action} document:`, error);
      alert(`Failed to ${action} document: ${error.message}`);
    } finally {
      setProcessingDocId(null);
    }
  };

  const handlePreview = (doc) => {
    setSelectedDocument(doc);
    setPreviewUrl(getFullUrl(doc.document_url));
  };

  const handleApproveShop = () => {
    if (!adminComments.trim()) {
      alert('Please add overall comments before approving.');
      return;
    }
    onApprove({ verification_status: 'approved', admin_comments: adminComments });
  };

  const handleRejectShop = () => {
    if (!adminComments.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    onReject({ verification_status: 'rejected', admin_comments: adminComments });
  };

  const pendingCount   = documents.filter(d => d.verification_status === 'pending').length;
  const approvedCount  = documents.filter(d => d.verification_status === 'approved').length;
  const rejectedCount  = documents.filter(d => d.verification_status === 'rejected').length;
  // BUG 31: All docs must be approved before Final Approve is enabled
  // If no docs uploaded, still allow final approval
  const allDocumentsApproved = documents.length === 0 || documents.every(
    doc => doc.verification_status === 'approved' || doc.approval_status === 'APPROVED'
  );

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Document Review</h2>
                <p className="text-blue-100 mt-1">{shop.shop_name}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
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

            {documents.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-2">Ask the vendor to upload required documents</p>
                </div>
            )}

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {documents.map((doc) => {
                const Icon = getDocumentIcon(doc.document_type);
                const fullDocUrl = getFullUrl(doc.document_url);
                const isProcessing = processingDocId === doc.document_id;

                return (
                    <div
                        key={doc.document_id}
                        className={`border-2 rounded-lg p-4 transition ${
                            doc.verification_status === 'approved' ? 'border-green-200 bg-green-50' :
                                doc.verification_status === 'rejected' ? 'border-red-200 bg-red-50' :
                                    'border-gray-200 bg-white hover:shadow-md'
                        }`}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        )}
                        {isImageType(doc.document_type) ? (
                            <img
                                src={fullDocUrl}
                                alt={doc.document_type}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="flex-col items-center text-gray-400"
                            style={{ display: isImageType(doc.document_type) ? 'none' : 'flex' }}
                        >
                          <Icon className="w-12 h-12" />
                          <p className="text-xs mt-2 text-center px-2">{doc.document_type}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* Title + Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-sm truncate flex-1">{doc.document_type}</h4>
                          {getVerificationBadge(doc.verification_status)}
                        </div>

                        {/* Existing admin comment */}
                        {doc.admin_comments && (
                            <p className="text-xs text-gray-600 bg-white border rounded p-2">
                              💬 {doc.admin_comments}
                            </p>
                        )}

                        {/* View / Download */}
                        <div className="flex space-x-2">
                          <button
                              onClick={() => handlePreview(doc)}
                              className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition flex items-center justify-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <a
                              href={fullDocUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </a>

                      </div>

                      {/* ✅ Per-document Approve/Reject — shown for pending AND already-decided docs */}
                      <div className="mt-2 border-t pt-2">
                      <textarea
                          placeholder={
                            doc.verification_status === 'pending'
                                ? 'Add comment (required for rejection)...'
                                : 'Add comment to update decision...'
                          }
                          className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                          rows="2"
                          value={documentComments[doc.document_id] || ''}
                          onChange={(e) => setDocumentComments(prev => ({
                            ...prev,
                            [doc.document_id]: e.target.value
                          }))}
                          disabled={isProcessing}
                      />
                        <div className="flex space-x-1 mt-1">
                          <button
                              onClick={() => handleDocumentAction(doc.document_id, 'approved')}
                              disabled={isProcessing || doc.verification_status === 'approved'}
                              className="flex-1 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isProcessing ? (
                                <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                                <><CheckCircle className="w-3 h-3 inline mr-1" />Approve</>
                            )}
                          </button>
                          <button
                              onClick={() => handleDocumentAction(doc.document_id, 'rejected')}
                              disabled={isProcessing || doc.verification_status === 'rejected'}
                              className="flex-1 px-2 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isProcessing ? (
                                <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                                <><XCircle className="w-3 h-3 inline mr-1" />Reject</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
              </div>
              );
              })}
            </div>

            {/* Overall Comments */}
            {documents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Shop Review Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows="4"
                      placeholder="Provide overall comments about the shop verification (visible to vendor)..."
                  />
                </div>
            )}
          </div>

          {/* Footer */}
          {documents.length > 0 && (
              <div className="border-t bg-gray-50 p-6 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    {pendingCount > 0 && (
                        <p className="text-sm text-amber-600">
                          ⚠️ {pendingCount} document(s) still pending review
                        </p>
                    )}
                    {pendingCount === 0 && rejectedCount === 0 && documents.length > 0 && (
                        <p className="text-sm text-green-600">
                          ✅ All documents approved — ready for final approval
                        </p>
                    )}
                    {!allDocumentsApproved && pendingCount === 0 && rejectedCount > 0 && (
                        <p className="text-sm text-red-600">
                          ❌ Rejected documents must be resolved before final approval
                        </p>
                    )}
                    {rejectedCount > 0 && pendingCount === 0 && (
                        <p className="text-sm text-red-600">
                          ❌ {rejectedCount} document(s) rejected
                        </p>
                    )}
                  </div>
                  <div className="flex space-x-3">
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
                          <><Loader className="w-4 h-4 animate-spin mr-2" />Rejecting...</>
                      ) : (
                          <><XCircle className="w-4 h-4 mr-2" />Reject Shop</>
                      )}
                    </button>
                    {/* BUG 31: Final Approve disabled until all documents are approved */}
                    <button
                        onClick={handleApproveShop}
                        disabled={isSubmitting || !allDocumentsApproved}
                        title={!allDocumentsApproved ? 'All documents must be approved before approving the shop' : ''}
                        className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center ${(!allDocumentsApproved || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                          <><Loader className="w-4 h-4 animate-spin mr-2" />Approving...</>
                      ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" />Approve Shop</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Lightbox Preview */}
          {selectedDocument && previewUrl && (
              <div
                  className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4"
                  onClick={() => setSelectedDocument(null)}
              >
                <div
                    className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="font-semibold">{selectedDocument.document_type}</h3>
                    <div className="flex items-center gap-3">
                     <a
                      href={previewUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center"
                      >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                    <button
                        onClick={() => setSelectedDocument(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-center min-h-64">
                  {selectedDocument.document_type?.toLowerCase().includes('pdf') ? (
                      <iframe src={previewUrl} className="w-full h-[70vh]" title="Document Preview" />
                  ) : (
                      <img
                          src={previewUrl}
                          alt="Document"
                          className="max-w-full h-auto rounded"
                          onError={(e) => { e.target.alt = 'Failed to load image'; }}
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
