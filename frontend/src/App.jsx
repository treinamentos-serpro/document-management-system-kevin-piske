import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentService';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  async function refreshDocuments(signal) {
    setIsLoading(true);
    try {
      setDocuments(await listDocuments({ signal }));
      setError('');
      setStatusMessage('Lista de documentos atualizada.');
    } catch (requestError) {
      if (requestError.name === 'AbortError') return;
      setError(requestError.message);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    refreshDocuments(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">DMS · espaço pessoal</p>
        <h1>Seus documentos,<br /><em>no lugar certo.</em></h1>
        <p className="intro">Envie, encontre e baixe seus arquivos com simplicidade.</p>
      </header>

      <section className="workspace" aria-label="Gerenciamento de documentos">
        <UploadComponent
          onUploaded={(document) => {
            setDocuments((current) => [document, ...current]);
            setError('');
            setStatusMessage('Documento enviado com sucesso.');
          }}
          onError={(message) => {
            setError(message);
            setStatusMessage('');
          }}
        />
        {error && <p className="error-message" role="alert">{error}</p>}
        <p className="status-message" role="status" aria-live="polite">{statusMessage}</p>
        <div className="list-header">
          <h2>Arquivos recentes</h2>
          <button className="refresh-button" type="button" onClick={() => refreshDocuments()} disabled={isLoading}>
            Atualizar
          </button>
        </div>
        <DocumentList documents={documents} isLoading={isLoading} />
      </section>
    </main>
  );
}
