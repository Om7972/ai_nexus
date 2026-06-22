import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const FileUploader = ({ onUpload, collection = 'personal' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(({ file, errors }) => ({
        name: file.name,
        message: errors[0]?.message || 'File rejected'
      }));
      setErrors(prev => [...prev, ...newErrors]);
    }

    // Handle accepted files
    for (const file of acceptedFiles) {
      setUploading(true);
      try {
        await onUpload(file, collection);
        setUploadedFiles(prev => [...prev, { name: file.name, status: 'success' }]);
      } catch (error) {
        setErrors(prev => [...prev, {
          name: file.name,
          message: error.message || 'Upload failed'
        }]);
      }
      setUploading(false);
    }
  }, [onUpload, collection]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  const clearNotification = (index, type) => {
    if (type === 'success') {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setErrors(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? 'border-blue-500 bg-blue-500/10 scale-105'
            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            className={`
              p-6 rounded-full
              ${isDragActive ? 'bg-blue-500/20' : 'bg-white/10'}
            `}
          >
            <Upload size={48} className={isDragActive ? 'text-blue-400' : 'text-gray-400'} />
          </motion.div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-400 mb-2">
              Drag and drop your files here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported: PDF, DOCX, TXT, CSV (Max 50MB)
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload notifications */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-green-400">Uploaded successfully</p>
                  </div>
                </div>
                <button
                  onClick={() => clearNotification(index, 'success')}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{error.name}</p>
                    <p className="text-xs text-red-400">{error.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => clearNotification(index, 'error')}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
