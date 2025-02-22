import React, { useState, useEffect } from "react";
import UploadPDF from "../utils/UploadPDF";
import { Trash2 } from "lucide-react";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const [fileHistory, setFileHistory] = useState(() => {
    const saved = localStorage.getItem('fileHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('fileHistory', JSON.stringify(fileHistory));
  }, [fileHistory]);

  const handleFileDownloaded = () => {
    // Since the UploadPDF component uses a fixed name "Medical_Analysis",
    // we'll use that as the default file name
    const fileName = "Medical_Analysis";

    const newHistory = [
      {
        id: Date.now(),
        name: fileName,
        date: new Date().toLocaleString()
      },
      ...fileHistory
    ].slice(0, 10); // Keep only the last 10 files

    setFileHistory(newHistory);
  };

  const handleDeleteFromHistory = (id) => {
    setFileHistory(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="dashboard-container p-6">
      <header className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold mb-2">Добро пожаловать в систему!</h1>
        <p className="text-gray-600">Загрузите свои медицинские анализы и получите таблицу Excel.</p>
      </header>

      <main className="dashboard-main">
        <section className="upload-section mb-8">
          <h2 className="text-xl font-semibold mb-4">Выберите файлы в формате PDF для обработки:</h2>
          <UploadPDF onFileDownloaded={handleFileDownloaded} />
        </section>

        <section className="history-section bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">История загрузок</h2>
          {fileHistory.length > 0 ? (
            <div className="space-y-3">
              {fileHistory.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.date}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDeleteFromHistory(file.id)}
                      style={{background: '#2c3e50'}}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      title="Удалить из истории"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>История пока пуста.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;