import { SetStateAction, useEffect, useState } from 'react';
import Papa from 'papaparse';

type CsvRow = Record<string, string>;

export default function RecommendationPage() {
  const [inputId, setInputId] = useState('');
  const [collabData, setCollabData] = useState<CsvRow[]>([]);
  const [contentData, setContentData] = useState<CsvRow[]>([]);
  const [collabResults, setCollabResults] = useState<string[] | null>(null);
  const [contentResults, setContentResults] = useState<string[] | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/collaborative_filtering.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result: { data: SetStateAction<CsvRow[]> }) => {
            setCollabData(result.data);
          },
        });
      });

    fetch('/content_filtering.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result: { data: SetStateAction<CsvRow[]> }) => {
            setContentData(result.data);
          },
        });
      });
  }, []);

  const handleSearch = () => {
    const collabRow = collabData.find((row) => row['self'] === inputId);
    const contentRow = contentData.find((row) => row['item_id'] === inputId);

    const newMessages: string[] = [];

    if (collabRow) {
      const values = Object.values(collabRow).slice(2, 7); // skip 'self'
      setCollabResults(values);
    } else {
      setCollabResults(null);
      newMessages.push('Item ID not found in collaborative filtering.');
    }

    if (contentRow) {
      const values = Object.values(contentRow).slice(2, 7); // skip 'item_id'
      setContentResults(values);
    } else {
      setContentResults(null);
      newMessages.push('Item ID not found in content filtering.');
    }

    setMessages(newMessages);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Recommendation Lookup</h1>

      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Item ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
      </div>

      {messages.length > 0 && (
        <div className="alert alert-warning">
          {messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      )}

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">Collaborative Filtering Results</div>
            <div className="card-body">
              {collabResults ? (
                <ul className="list-group">
                  {collabResults.map((item, idx) => (
                    <li className="list-group-item" key={idx}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No results found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">Content Filtering Results</div>
            <div className="card-body">
              {contentResults ? (
                <ul className="list-group">
                  {contentResults.map((item, idx) => (
                    <li className="list-group-item" key={idx}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No results found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
