import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadComponent({ onUploaded, onError }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      onError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    try {
      const document = await uploadDocument(file);
      setFile(null);
      event.target.reset();
      onUploaded(document);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="document-file">Arquivo</label>
      <div className="upload-controls">
        <input
          id="document-file"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
      </div>
    </form>
  );
}