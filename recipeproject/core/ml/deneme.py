import pandas as pd

input_path = "recipes_export.csv"
output_path = "recipes_export_clean.csv"

df = pd.read_csv(input_path)
df["title"] = df["title"].astype(str).str.strip().str.lower()
df.to_csv(output_path, index=False)
print("Başlıklar temizlendi ve kaydedildi:", output_path)
