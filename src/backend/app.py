from flask import Flask, request, jsonify
from flask_cors import CORS
import zipfile
import os
import json
import shutil
import time
from album_finder.album_finder import find_similar_images
from music_retriever import MusicRetriever


app = Flask(__name__)

# Mengonfigurasi CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
music_retriever = MusicRetriever()  

IMAGE_FOLDER = "../frontend/public/test/images"
AUDIO_FOLDER = "../frontend/public/test/audio"
MAPPER_FOLDER = "../frontend/public/test/mapper"
QUERY_IMAGE_FOLDER = "../frontend/public/test/query_image"
QUERY_AUDIO_FOLDER = "../frontend/public/test/query_audio"

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




@app.route("/find_similar_audios", methods=["POST"])
def find_similar_audios_endpoint():
    try:
        query_folder = QUERY_AUDIO_FOLDER
        query_files = os.listdir(query_folder)
        if len(query_files) != 1:
            return (
                jsonify({"error": "Query folder must contain exactly one audio"}),
                400,
            )
        start_time = time.time()
        query_features = music_retriever.process_query_file(query_folder, query_files[0])
        all_matches = music_retriever.find_matches(query_features)
        total_results = len(all_matches)
        similar_audios = [
            {
                "audio_name": result.audio_name,
                "song_title": result.song_title,  
                "album_image": result.album_image,
                "album_title": result.album_title,
                "similarity": result.similarity
            } for result in all_matches
        ]

        execution_time = (time.time() - start_time) * 1000
        return (
            jsonify(
                {
                    "similar_audios": similar_audios,
                    "execution_time_ms": execution_time,
                    "total_results" : total_results,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/find_similar_images", methods=["POST"])
def find_similar_images_endpoint():
    try:
        dataset_path = IMAGE_FOLDER
        query_folder = QUERY_IMAGE_FOLDER
        mapper_folder = MAPPER_FOLDER

        # Pastikan hanya ada satu gambar di query folder
        query_files = os.listdir(query_folder)
        if len(query_files) != 1:
            return (
                jsonify({"error": "Query folder must contain exactly one image"}),
                400,
            )

        query_image_path = os.path.join(query_folder, query_files[0])

        start_time = time.time()

        # Temukan gambar yang mirip
        similar_images = find_similar_images(
            query_image_path=query_image_path,
            dataset_path=dataset_path,
            components_count=50,
            max_results=None,
            threshold=0,
        )
        total_results = len(similar_images)

        for image_name, similarity in similar_images:
            print(f"{image_name}: {similarity:.2%}")

        # Baca file mapper JSON
        mapper_files = [f for f in os.listdir(mapper_folder) if f.endswith(".json")]
        if not mapper_files:
            return jsonify({"error": "No mapper file found"}), 400

        mapper_path = os.path.join(mapper_folder, mapper_files[0])
        with open(mapper_path, "r") as json_file:
            mapper_data = json.load(json_file)

        # Buat hasil yang sudah dimapping
        mapped_results = []
        for image_name, similarity in similar_images:
            # Cari informasi audio di image_mapping
            image_info = mapper_data["image_mapping"].get(image_name, {})

            # Dapatkan daftar audio files
            audio_files = image_info.get("audio_files", [])

            # Tambahkan setiap audio file sebagai entri terpisah
            for audio_file in audio_files:
                audio_info = mapper_data["audio_mapping"].get(audio_file, {})
                mapped_results.append(
                    {
                        "image_name": image_name,
                        "similarity": similarity,
                        "audio_file": audio_file,
                        "song_title": audio_info.get("song_title", "Unknown"),
                        "artist": audio_info.get("artist", "Unknown"),
                        "album_name": audio_info.get("album_name", "Unknown"),
                    }
                )

        end_time = time.time()
        execution_time_ms = (end_time - start_time) * 1000

        return (
            jsonify(
                {
                    "similar_images": mapped_results,
                    "execution_time_ms": execution_time_ms,
                    "total_results": total_results
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
                if 'audio_mapping' in data:
                    music_retriever.set_mapping(data['audio_mapping'])
                    

        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format"}), 400

        return jsonify({"message": f"Mapper file saved to {file_path}"}), 200

    # Handle image files (query image)
    if file_type == "image" and file.filename.lower().endswith(
        (".jpg", ".jpeg", ".png")
    ):
        # Hapus file lama di folder QUERY_IMAGE_FOLDER
        for filename in os.listdir(target_folder):
            file_path = os.path.join(target_folder, filename)
            os.remove(file_path)

        # Simpan file baru
        file_path = os.path.join(target_folder, file.filename)
        file.save(file_path)
        return jsonify({"message": f"Image saved to {file_path}"}), 200

    # Handle audio files (query audio)
    if file_type == "audio" and file.filename.lower().endswith(".mid"):
        # Hapus file lama di folder QUERY_AUDIO_FOLDER
        for filename in os.listdir(target_folder):
            file_path = os.path.join(target_folder, filename)
            os.remove(file_path)

        # Simpan file baru
        file_path = os.path.join(target_folder, file.filename)
        file.save(file_path)
        test = music_retriever.load_audio_files(AUDIO_FOLDER)
        return jsonify({"message": f"Audio saved to {file_path}"}), 200

    return (
        jsonify({"error": f"Invalid file type, only {file_type.upper()} allowed"}),
        400,
    )

if __name__ == "__main__":
    app.run(debug=True)
