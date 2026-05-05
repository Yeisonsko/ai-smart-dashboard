from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

app = FastAPI()

# CORS (para permitir conexión con React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variable global para guardar el dataset
global_df = None

# Modelo para preguntas
class Question(BaseModel):
    question: str

# Función de insights
def generate_insights(df):
    insights = []

    numeric_columns = df.select_dtypes(include=['number']).columns

    for col in numeric_columns:
        avg = df[col].mean()
        max_val = df[col].max()
        min_val = df[col].min()

        insights.append(f"El promedio de {col} es {avg:.2f}")
        insights.append(f"El valor máximo de {col} es {max_val}")
        insights.append(f"El valor mínimo de {col} es {min_val}")

    return insights

# Endpoint para subir CSV
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    global global_df
    global_df = df

    insights = generate_insights(df)

    return {
        "columns": df.columns.tolist(),
        "rows": len(df),
        "data": df.head(20).to_dict(orient="records"),
        "insights": insights
    }

# Endpoint para preguntas (YA usa datos reales)
@app.post("/ask")
def ask_question(q: Question):
    global global_df

    if global_df is None:
        return {"answer": "Primero sube un archivo CSV"}

    question = q.question.lower()

    numeric_columns = global_df.select_dtypes(include=['number']).columns

    if len(numeric_columns) == 0:
        return {"answer": "No hay columnas numéricas en los datos"}

    col = numeric_columns[0]  # usamos la primera columna numérica

    if "promedio" in question:
        value = global_df[col].mean()
        return {"answer": f"El promedio de {col} es {value:.2f}"}

    elif "max" in question or "máximo" in question:
        value = global_df[col].max()
        return {"answer": f"El valor máximo de {col} es {value}"}

    elif "min" in question:
        value = global_df[col].min()
        return {"answer": f"El valor mínimo de {col} es {value}"}

    else:
        return {"answer": "No entendí la pregunta, intenta con promedio, máximo o mínimo"}