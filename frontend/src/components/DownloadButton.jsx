import { getDownloadUrl } from '../services/documentService';

export default function DownloadButton({ documentId, documentName }) {
  return (
    <a
      className="download-link"
      href={getDownloadUrl(documentId)}
      aria-label={`Baixar ${documentName}`}
    >
      Baixar
    </a>
  );
}