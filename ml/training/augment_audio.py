import os
import pandas as pd
import librosa
import soundfile as sf
from audiomentations import Compose, AddGaussianNoise, TimeStretch, PitchShift
from tqdm import tqdm

# Configure paths
BASE_PATH = os.environ.get("MEETLY_DATASET_DIR")
if not BASE_PATH:
    raise RuntimeError("Set MEETLY_DATASET_DIR to the local dataset directory.")

CSV_PATH = os.path.join(BASE_PATH, "combined_dataset.parquet")
OUTPUT_CSV_PATH = os.path.join(BASE_PATH, "augmented_combined_dataset.parquet")

# The Augmentation Pipeline
augmenter = Compose([
    AddGaussianNoise(min_amplitude=0.001, max_amplitude=0.015, p=0.5),
    TimeStretch(min_rate=0.8, max_rate=1.2, p=0.5),
    PitchShift(min_semitones=-2, max_semitones=2, p=0.5)
])

df = pd.read_parquet(CSV_PATH)
new_rows = []

print("🎙️ Starting Offline Data Augmentation...")

for index, row in tqdm(df.iterrows(), total=len(df)):
    audio_rel_path = row["audio"].replace("\\", "/")
    audio_abs_path = os.path.join(BASE_PATH, audio_rel_path)
    
    # 1. Keep original row
    new_rows.append(row.to_dict())
    
    if os.path.exists(audio_abs_path):
        samples, sample_rate = librosa.load(audio_abs_path, sr=16000)
        
        # 2. Generate 2 augmented versions for each audio file
        for aug_num in range(1, 3):
            aug_samples = augmenter(samples=samples, sample_rate=sample_rate)
            
            # Save new wav file
            new_file_name = audio_rel_path.replace(".wav", f"_aug{aug_num}.wav")
            new_abs_path = os.path.join(BASE_PATH, new_file_name)
            
            sf.write(new_abs_path, aug_samples, sample_rate)
            
            # Add to new dataframe
            new_row = row.copy().to_dict()
            new_row["audio"] = new_file_name
            new_rows.append(new_row)

# Save the massive new dataset
augmented_df = pd.DataFrame(new_rows)
augmented_df.to_parquet(OUTPUT_CSV_PATH)
print(f"✅ Augmentation Complete! Dataset grew from {len(df)} to {len(augmented_df)} rows.")
print(f"💾 Saved to: {OUTPUT_CSV_PATH}")
