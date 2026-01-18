# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "pandas==2.3.3",
#     "requests==2.32.5",
#     "sh==2.2.2",
# ]
# ///

import requests
import pandas as pd
from pathlib import Path


def main() -> None:
    url = "https://huggingface.co/thewh1teagle/phonikud-experiments/resolve/main/comparison/sentences/saspeech_male_unvocalized.csv"

    print(f"Downloading from {url}...")
    response = requests.get(url)
    response.raise_for_status()

    # Save to temp file to read with pandas
    temp_path = Path("temp.csv")
    temp_path.write_bytes(response.content)

    # Read with pandas (pipe-delimited)
    df = pd.read_csv(temp_path, sep="|", header=None, names=["id", "text"])

    # Take first 20 rows
    df_subset = df.head(20)

    # Save to sentences.csv without quotes
    output_path = Path(__file__).parent.parent / "web" / "public" / "sentences.csv"
    df_subset.to_csv(output_path, sep="|", index=False, header=False, quoting=3)  # quoting=3 is QUOTE_NONE

    # Clean up temp file
    temp_path.unlink()

    print(f"Saved {len(df_subset)} sentences to {output_path}")


if __name__ == "__main__":
    main()
