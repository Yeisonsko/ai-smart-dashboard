import axios from "axios";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function App() {
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData);
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAsk = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/ask", {
        question: question,
      });

      setAnswer(res.data.answer);
    } catch (error) {
      console.error(error);
    }
  };

  const getNumericColumns = () => {
    if (!data || !data.data || data.data.length === 0) return [];

    const sample = data.data[0];
    return Object.keys(sample).filter(
      (key) => typeof sample[key] === "number"
    );
  };

  const numericCols = data ? getNumericColumns() : [];

  return (
    <div className="bg-black text-white min-h-screen p-10">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">AI Smart Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Analiza datos y genera insights automáticamente con IA
        </p>
      </div>

      {/* UPLOAD */}
      <div className="bg-gray-900 p-6 rounded-2xl mb-10 border border-gray-800">
        <h2 className="text-xl mb-4">Subir archivo</h2>

        <input
          type="file"
          onChange={handleUpload}
          className="bg-gray-800 p-3 rounded-lg w-full cursor-pointer hover:bg-gray-700 transition"
        />
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-8">

          {/* RESUMEN */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl mb-4">Resumen</h2>
            <p className="text-gray-300">
              <strong>Columnas:</strong> {data.columns.join(", ")}
            </p>
            <p className="text-gray-300 mt-2">
              <strong>Filas:</strong> {data.rows}
            </p>
          </div>

          {/* INSIGHTS */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl mb-4">Insights</h2>

            <div className="space-y-3">
              {data?.insights?.map((insight, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* GRÁFICA */}
          <div className="md:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl mb-4">Visualización</h2>

            <div className="overflow-x-auto">
              {data?.data && (
                <LineChart width={700} height={300} data={data.data}>
                  <XAxis dataKey={data.columns[0]} stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />

                  {numericCols.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey={numericCols[0]}
                      stroke="#4ade80"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              )}
            </div>
          </div>

          {/* CHAT IA */}
          <div className="md:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl mb-4">Preguntar a los datos</h2>

            <div className="flex gap-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ej: ¿Cuál es el promedio?"
                className="flex-1 p-3 rounded-lg bg-gray-800 text-white outline-none"
              />

              <button
                onClick={handleAsk}
                className="bg-green-500 px-4 rounded-lg hover:bg-green-400 transition"
              >
                Preguntar
              </button>
            </div>

            {answer && (
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <strong>Respuesta:</strong> {answer}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default App;