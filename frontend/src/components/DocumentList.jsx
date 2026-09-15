import DownloadButton from './DownloadButton';

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p className="feedback" role="status" aria-live="polite">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="feedback" role="status">Nenhum documento enviado ainda.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li key={document.id} className="document-item">
          <div>
            <strong>{document.originalName}</strong>
            <span>{formatSize(document.size)} · {new Date(document.uploadedAt).toLocaleString()}</span>
          </div>
          <DownloadButton documentId={document.id} documentName={document.originalName} />
        </li>
      ))}
    </ul>
  );
}