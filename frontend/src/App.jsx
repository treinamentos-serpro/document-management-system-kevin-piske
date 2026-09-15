import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadForm from './components/UploadForm';
import { listDocuments } from './services/documentService';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function refreshDocuments() {
    setIsLoading(true);
    try {
      setDocuments(await listDocuments());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshDocuments();
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">DMS · espaço pessoal</p>
        <h1>Seus documentos,<br /><em>no lugar certo.</em></h1>
        <p className="intro">Envie, encontre e baixe seus arquivos com simplicidade.</p>
      </header>

      <section className="workspace" aria-label="Gerenciamento de documentos">
        <UploadForm
          onUploaded={(document) => {
            setDocuments((current) => [document, ...current]);
            setError('');
          }}
          onError={setError}
        />
        {error && <p className="error-message" role="alert">{error}</p>}
        <div className="list-header">
          <h2>Arquivos recentes</h2>
          <button className="refresh-button" type="button" onClick={refreshDocuments} disabled={isLoading}>
            Atualizar
          </button>
        </div>
        <DocumentList documents={documents} isLoading={isLoading} />
      </section>
    </main>
  );
}
