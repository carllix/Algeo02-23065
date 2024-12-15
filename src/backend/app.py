from flask import Flask, request, jsonify
from flask_cors import CORS
import zipfile
import os
import json
import shutil

app = Flask(__name__)

# Mengonfigurasi CORS
CORS(app, resources={r"/upload/*": {"origins": "http://localhost:3000"}})

# Folder tujuan untuk setiap jenis dataset
IMAGE_FOLDER = "../../test/images"
AUDIO_FOLDER = "../../test/audio"
MAPPER_FOLDER = "../../test/mapper"
QUERY_IMAGE_FOLDER = "../../test/query_image"
QUERY_AUDIO_FOLDER = "../../test/query_audio"

os.makedirs(IMAGE_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(MAPPER_FOLDER, exist_ok=True)
os.makedirs(QUERY_IMAGE_FOLDER, exist_ok=True)
os.makedirs(QUERY_AUDIO_FOLDER, exist_ok=True)

@app.route("/upload/image", methods=["POST"])
def upload_image_zip():
    return handle_upload(request, IMAGE_FOLDER, "zip")

@app.route("/upload/audio", methods=["POST"])
def upload_audio_zip():
    return handle_upload(request, AUDIO_FOLDER, "zip")

@app.route("/upload/mapper", methods=["POST"])
def upload_mapper_json():
    return handle_upload(request, MAPPER_FOLDER, "json")

@app.route("/upload/query_image", methods=["POST"])
def upload_query_image():
    return handle_upload(request, QUERY_IMAGE_FOLDER, "image")

@app.route("/upload/query_audio", methods=["POST"])
def upload_query_audio():
    return handle_upload(request, QUERY_AUDIO_FOLDER, "audio")

def handle_upload(request, target_folder, file_type):
    """Fungsi untuk menangani upload file dan ekstraksi ZIP ke folder baru,
    atau menyimpan file JSON untuk mapper, dan file gambar/audio query."""

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Handle ZIP files (image or audio)
    if file_type == "zip" and file.filename.endswith(".zip"):
        # Tentukan folder tujuan berdasarkan jenis file
        if target_folder == IMAGE_FOLDER:
            folder_name = "images"
        elif target_folder == AUDIO_FOLDER:
            folder_name = "audio"
        else:
            return jsonify({"error": "Invalid folder"}), 400

        # Hapus isi folder jika sudah ada
        if os.path.exists(target_folder):
            shutil.rmtree(target_folder)
        os.makedirs(target_folder, exist_ok=True)

        # Menyimpan file ZIP sementara
        temp_zip_path = os.path.join(target_folder, file.filename)
        file.save(temp_zip_path)

        # Ekstrak file ZIP ke folder tujuan
        try:
            with zipfile.ZipFile(temp_zip_path, "r") as zip_ref:
                zip_ref.extractall(target_folder)
        except zipfile.BadZipFile:
            return jsonify({"error": "Invalid ZIP file"}), 400

        # Menghapus file ZIP setelah ekstraksi
        os.remove(temp_zip_path)

        return jsonify({"message": f"ZIP file extracted to {target_folder}"}), 200

    # Handle JSON files (mapper)
    if file_type == "json" and file.filename.endswith(".json"):
        # Hapus file JSON lama di folder MAPPER_FOLDER
        for filename in os.listdir(MAPPER_FOLDER):
            file_path = os.path.join(MAPPER_FOLDER, filename)
            if filename.endswith(".json"):
                os.remove(file_path)

        # Simpan file JSON yang baru dengan nama file aslinya
        file_path = os.path.join(MAPPER_FOLDER, file.filename)
        file.save(file_path)

        # Anda dapat membaca dan memproses file JSON di sini jika diperlukan
        try:
            with open(file_path, "r") as json_file:
                data = json.load(json_file)
                # Proses data JSON jika diperlukan
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format"}), 400

        return jsonify({"message": f"Mapper file saved to {file_path}"}), 200

    # Handle image files (query image)
    if file_type == "image" and file.filename.lower().endswith(
        (".jpg", ".jpeg", ".png")
    ):
        file_path = os.path.join(target_folder, file.filename)
        file.save(file_path)
        return jsonify({"message": f"Image saved to {file_path}"}), 200

    # Handle audio files (query audio)
    if file_type == "audio" and file.filename.lower().endswith(".mid"):
        file_path = os.path.join(target_folder, file.filename)
        file.save(file_path)
        return jsonify({"message": f"Audio saved to {file_path}"}), 200

    return (
        jsonify({"error": f"Invalid file type, only {file_type.upper()} allowed"}),
        400,
    )

if __name__ == "__main__":
    app.run(debug=True)
