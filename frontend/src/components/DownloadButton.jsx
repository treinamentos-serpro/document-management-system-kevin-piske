import { getDownloadUrl } from '../services/documentService';

export default function DownloadButton({ documentId }) {
  return (
    <a className="download-link" href={getDownloadUrl(documentId)}>
      Baixar
    </a>
  );
}