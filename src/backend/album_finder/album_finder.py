import os
import numpy as np
from PIL import Image
import time

def load_and_preprocess_images(directory_path, image_size=(32, 32)):
    image_data, image_names = [], []
    for file_name in os.listdir(directory_path):
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(directory_path, file_name)
            image = Image.open(image_path).convert('L')
            resized_image = image.resize(image_size)
            image_data.append(np.array(resized_image).flatten())
            image_names.append(file_name)
    return np.array(image_data), image_names

def standardize_images(image_data):
    mean_image = np.mean(image_data, axis=0)
    standardized_images = image_data - mean_image
    return standardized_images, mean_image

def apply_pca(image_data, components_count):
    _, _, right_singular_vectors = np.linalg.svd(image_data, full_matrices=False)
    principal_components = right_singular_vectors[:components_count]
    transformed_data = np.dot(image_data, principal_components.T)
    return transformed_data, principal_components

def compute_image_similarity(dataset_transformed, query_transformed, image_names, threshold=0.6, max_results=None):
    distances = np.linalg.norm(dataset_transformed - query_transformed, axis=1)
    max_distance = np.max(distances)
    similarity_scores = 1 - (distances / max_distance)

    similar_images = [
        (image_names[i], similarity_scores[i])
        for i in np.argsort(similarity_scores)[::-1]
        if similarity_scores[i] >= threshold
    ]
    
    if max_results is not None:
        similar_images = similar_images[:max_results]
    
    return similar_images


def find_similar_images(query_image_path, dataset_path, components_count=50, max_results=None, image_size=(64, 64), threshold=0.6):
    dataset_images, dataset_image_names = load_and_preprocess_images(dataset_path, image_size)
    standardized_dataset, mean_image = standardize_images(dataset_images)

    dataset_transformed, principal_components = apply_pca(standardized_dataset, components_count)

    query_image = Image.open(query_image_path).convert('L').resize(image_size)
    query_flattened = np.array(query_image).flatten()
    query_standardized = query_flattened - mean_image

    query_transformed = np.dot(query_standardized, principal_components.T)

    similar_images = compute_image_similarity(dataset_transformed, query_transformed, dataset_image_names, threshold, max_results)
    return similar_images

# Contoh Penggunaan
if __name__ == "__main__":
    # Sesuaiin dengan direktori dataset dan query
    dataset_path = "../../test/dataset" 
    query_path = "../../test/Gajah.jpg"

    start_time = time.time()

    similar_images = find_similar_images(
        query_path,
        dataset_path,
        components_count=50,
        max_results=None,
        threshold=0.6
    )

    end_time = time.time()
    execution_time_ms = (end_time - start_time) * 1000

    print("Top Similar Images:")
    for image_name, similarity in similar_images:
        print(f"{image_name}: {similarity:.2%}")

    print(f"Execution Time: {execution_time_ms:.2f} ms")