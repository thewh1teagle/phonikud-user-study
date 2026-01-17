# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "pandas",
#     "sh",
#     "tqdm",
# ]
# ///

import pandas as pd
from pathlib import Path
from tqdm import tqdm
import sh


def main() -> None:
    # Get script directory and paths
    script_dir = Path(__file__).parent
    sentences_path = script_dir.parent / "web" / "public" / "sentences.csv"
    audio_base_dir = script_dir.parent / "web" / "public" / "audio"

    # Read sentences
    df = pd.read_csv(sentences_path, sep="|", header=None, names=["id", "text"])

    # Models to download
    models = [
        "gemini_unvocalized",
        "phonikud_stts2",
        "piper-phonikud",
        "roboshaul_nakdimon",
    ]

    base_url = "https://huggingface.co/thewh1teagle/phonikud-experiments/resolve/main/comparison/audio"

    for model in models:
        output_dir = audio_base_dir / model
        output_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n[{model}] Downloading and converting {len(df)} audio files to {output_dir}")

        # Download and convert each audio file
        for sentence_id in tqdm(df["id"], desc=f"Processing {model}"):
            url = f"{base_url}/{model}/{sentence_id}.wav"
            wav_file = output_dir / f"{sentence_id}.wav"
            m4a_file = output_dir / f"{sentence_id}.m4a"

            # Skip if already converted
            if m4a_file.exists():
                continue

            # Download WAV
            sh.wget("-q", "-O", str(wav_file), url)

            # Convert to M4A with ffmpeg (96k for TTS)
            sh.ffmpeg("-i", str(wav_file), "-c:a", "aac", "-b:a", "96k", str(m4a_file), "-y", "-loglevel", "quiet")

            # Delete WAV
            wav_file.unlink()

    print(f"\nDone! Downloaded and converted audio for {len(models)} models")


if __name__ == "__main__":
    main()
