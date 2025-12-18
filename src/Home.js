
import { useState, useRef, useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

const STORAGE_KEY = "saved_url_templates";

const 
Home = () => {
  const [link, setLink] = useState("");
  const [keys, setKeys] = useState([]);
  const [activeKey, setActiveKey] = useState("");
  const [paramValues, setParamValues] = useState({});

  const [urls, setUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [verified, setVerified] = useState({});

  const [savedTemplates, setSavedTemplates] = useState([]);

  const popupRef = useRef(null);

  /* ---------------- LOAD TEMPLATES ---------------- */

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setSavedTemplates(stored);
  }, []);

  const persistTemplates = (list) => {
    setSavedTemplates(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  /* ---------------- LINK HANDLING ---------------- */

  const applyTemplate = (value) => {
    setLink(value);

    if (value.trim()) {
      const extracted = [...value.matchAll(/\{(.*?)\}/g)].map(m => m[1]);
      setKeys(extracted);
      setActiveKey(extracted[0] || "");
      setParamValues({});
      setUrls([]);
      setVerified({});
      setCurrentIndex(0);
    } else {
      setKeys([]);
      setParamValues({});
      setUrls([]);
      setVerified({});
    }
  };

  const handleLinkChange = (e) => {
    applyTemplate(e.target.value);
  };

  /* ---------------- TEMPLATE ACTIONS ---------------- */

  const saveTemplate = () => {
    if (!link.trim()) return;

    const name = prompt("Template name:");
    if (!name) return;

    const tagsInput = prompt("Tags (comma separated):", "");
    const tags = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const newTemplate = {
      id: Date.now(),
      name,
      template: link,
      tags
    };

    persistTemplates([...savedTemplates, newTemplate]);
  };

  const renameTemplate = (id) => {
    const name = prompt("New template name:");
    if (!name) return;

    persistTemplates(
      savedTemplates.map(t =>
        t.id === id ? { ...t, name } : t
      )
    );
  };

  const editTags = (id) => {
    const t = savedTemplates.find(x => x.id === id);
    const input = prompt("Edit tags (comma separated):", t.tags.join(", "));
    if (input === null) return;

    const tags = input.split(",").map(x => x.trim()).filter(Boolean);

    persistTemplates(
      savedTemplates.map(x =>
        x.id === id ? { ...x, tags } : x
      )
    );
  };

  const deleteTemplate = (id) => {
    if (!window.confirm("Delete this template?")) return;
    persistTemplates(savedTemplates.filter(t => t.id !== id));
  };

  /* ---------------- PARAM VALUES ---------------- */

  const handleParamChange = (key, value) => {
    const valuesArray = value
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

    setParamValues(prev => ({
      ...prev,
      [key]: valuesArray
    }));
  };

  /* ---------------- URL GENERATION ---------------- */

  const generateUrls = () => {
    let list = [link];

    keys.forEach((key) => {
      const values = paramValues[key] || [];
      const next = [];

      list.forEach(url => {
        values.forEach(val => {
          next.push(url.replace(`{${key}}`, val));
        });
      });

      list = next;
    });

    return list;
  };

  const startRun = () => {
    const generated = generateUrls();
    setUrls(generated);
    setVerified({});
    setCurrentIndex(0);
    openUrlAtIndex(0, generated);
  };

  /* ---------------- POPUP CONTROL ---------------- */

  const openUrlAtIndex = (index, list = urls) => {
    if (!list[index]) return;

    const url = list[index];

    if (!popupRef.current || popupRef.current.closed) {
      popupRef.current = window.open(
        url,
        "urlRunner",
        "width=1000,height=700,resizable=yes,scrollbars=yes"
      );
    } else {
      popupRef.current.location.href = url;
      popupRef.current.focus();
    }
  };

  const nextUrl = () => {
    if (currentIndex < urls.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      openUrlAtIndex(next);
    }
  };

  const prevUrl = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      openUrlAtIndex(prev);
    }
  };

  /* ---------------- VERIFICATION ---------------- */

  const toggleVerified = () => {
    setVerified(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const verifiedUrls = urls.filter((_, i) => verified[i]);
  const unverifiedUrls = urls.filter((_, i) => !verified[i]);

  /* ---------------- UI ---------------- */

  return (
    <div className="container-fluid">
     

      <div className="container mt-4">
        {/* URL INPUT */}
        <div className="d-flex gap-2 mb-3">
          <input
            className="form-control"
            placeholder="Enter URL template"
            value={link}
            onChange={handleLinkChange}
          />
          <button className="btn btn-outline-primary" onClick={saveTemplate}>
            Save Template
          </button>
        </div>

        {/* SAVED TEMPLATES */}
        {savedTemplates.length > 0 && (
          <div className="mb-4">
            <h5>Saved Templates</h5>
            <ul className="list-group">
              {savedTemplates.map(t => (
                <li key={t.id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{t.name}</strong>
                      {t.tags.length > 0 && (
                        <div className="mt-1">
                          {t.tags.map(tag => (
                            <span key={tag} className="badge bg-secondary me-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => applyTemplate(t.template)}
                      >
                        Load
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => renameTemplate(t.id)}
                      >
                        Rename
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => editTags(t.id)}
                      >
                        Tags
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteTemplate(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PARAM INPUTS */}
        {keys.length > 0 && (
          <>
            <Tabs activeKey={activeKey} onSelect={setActiveKey}>
              {keys.map((key) => (
                <Tab eventKey={key} title={key} key={key}>
                  <textarea
                    className="form-control mt-3"
                    rows={5}
                    placeholder={`Enter values for ${key} (one per line)`}
                    onChange={(e) =>
                      handleParamChange(key, e.target.value)
                    }
                  />
                </Tab>
              ))}
            </Tabs>

            <button className="btn btn-success mt-3" onClick={startRun}>
              Open to check URLs
            </button>
          </>
        )}

        {/* RUNNER */}
        {urls.length > 0 && (
          <>
            <div className="border rounded p-3 my-4">
              <h5>
                URL {currentIndex + 1} / {urls.length}
              </h5>

              <p className="text-break">{urls[currentIndex]}</p>

              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-secondary"
                  onClick={prevUrl}
                  disabled={currentIndex === 0}
                >
                  ⏮ Prev
                </button>

                <button
                  className="btn btn-primary"
                  onClick={nextUrl}
                  disabled={currentIndex === urls.length - 1}
                >
                  Next ⏭
                </button>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!verified[currentIndex]}
                  onChange={toggleVerified}
                />
                <label className="form-check-label">Verified</label>
              </div>
            </div>

            {/* RESULTS */}
            <div className="row">
              <div className="col-md-6">
                <h5 className="text-success">✅ Verified URLs</h5>
                <ul className="list-group">
                  {verifiedUrls.map((url, i) => (
                    <li
                      key={i}
                      className="list-group-item list-group-item-success text-break"
                      onClick={() => {
                        const index = urls.indexOf(url);
                        setCurrentIndex(index);
                        openUrlAtIndex(index);
                      }}
                    >
                      {url}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-md-6">
                <h5 className="text-danger">❌ Not Verified URLs</h5>
                <ul className="list-group">
                  {unverifiedUrls.map((url, i) => (
                    <li
                      key={i}
                      className="list-group-item list-group-item-warning text-break"
                      onClick={() => {
                        const index = urls.indexOf(url);
                        setCurrentIndex(index);
                        openUrlAtIndex(index);
                      }}
                    >
                      {url}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
