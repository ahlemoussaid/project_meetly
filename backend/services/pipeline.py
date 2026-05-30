import os
import sys
import json
import argparse
import warnings
import numpy as np
import io

warnings.filterwarnings("ignore")

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument("--audio", required=True)
    parser.add_argument("--hf_token", default=None)
    parser.add_argument("--model_path", required=True)
    parser.add_argument("--device", default="cpu", choices=["cpu", "cuda"])

    return parser.parse_args()


def format_time(seconds):
    return f"{int(seconds // 60):02d}:{int(seconds % 60):02d}"


def main():
    args = parse_args()

    import torch
    import librosa

    from transformers import (
        WhisperForConditionalGeneration,
        WhisperProcessor
    )

    from peft import PeftModel

    device = torch.device(
        "cuda"
        if torch.cuda.is_available() and args.device == "cuda"
        else "cpu"
    )

    print(f"INFO: Using device: {device}", file=sys.stderr)

    # =====================================
    # 1. DIARIZATION
    # =====================================

    turns = []
    has_diarized = False

    if args.hf_token:

        print("STATE: diarization", file=sys.stderr)

        try:
            from pyannote.audio import Pipeline

            print(
                "INFO: Loading PyAnnote pipeline...",
                file=sys.stderr
            )

            try:
                pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1",
                    token=args.hf_token,
                    use_auth_token=None
                )

            except TypeError:
                pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1",
                    token=args.hf_token
                )

            diarization = pipeline(args.audio)

            for turn, _, speaker in diarization.itertracks(
                yield_label=True
            ):

                turns.append({
                    "speaker": f"Speaker {speaker.split('_')[-1]}",
                    "start": turn.start,
                    "end": turn.end
                })

            has_diarized = len(turns) > 0

            print(
                f"INFO: diarization segments: {len(turns)}",
                file=sys.stderr
            )

        except Exception as e:
            print(
                f"WARNING: Diarization failed: {e}",
                file=sys.stderr
            )

    # =====================================
    # FALLBACK SINGLE SPEAKER
    # =====================================

    if not has_diarized:

        print(
            "INFO: Single-speaker fallback mode",
            file=sys.stderr
        )

        y, sr = librosa.load(args.audio, sr=16000)

        duration = len(y) / sr

        turns = [{
            "speaker": "Speaker 1",
            "start": 0.0,
            "end": duration
        }]

    # =====================================
    # 2. LOAD WHISPER + LORA
    # =====================================

    print(
        "INFO: Loading Whisper model...",
        file=sys.stderr
    )

    base_model = "openai/whisper-large-v3-turbo"

    processor = WhisperProcessor.from_pretrained(base_model)

    base = WhisperForConditionalGeneration.from_pretrained(
        base_model,
        torch_dtype=(
            torch.float16
            if device.type == "cuda"
            else torch.float32
        )
    )

    model = PeftModel.from_pretrained(
        base,
        args.model_path
    )

    model = model.to(device)

    model.eval()

    print(
        "INFO: Model loaded successfully.",
        file=sys.stderr
    )

    # =====================================
    # 3. LOAD AUDIO
    # =====================================

    waveform, sr = librosa.load(
        args.audio,
        sr=16000
    )

    total_duration = len(waveform) / sr

    results = []

    # smaller chunks reduce hallucinations
    chunk_limit = 20.0

    print(
        "STATE: transcribing",
        file=sys.stderr
    )

    # =====================================
    # 4. TRANSCRIPTION LOOP
    # =====================================

    forced_decoder_ids = processor.get_decoder_prompt_ids(
        language="ar",
        task="transcribe"
    )

    for turn in turns:

        speaker = turn["speaker"]

        start = max(0.0, turn["start"])
        end = min(total_duration, turn["end"])

        if start >= end:
            continue

        all_text = []

        current = start

        while current < end:

            chunk_end = min(
                current + chunk_limit,
                end
            )

            segment = waveform[
                int(current * sr):
                int(chunk_end * sr)
            ]

            # skip silent chunks
            if np.abs(segment).mean() < 0.0005:
                current += chunk_limit
                continue

            # pad short audio
            if len(segment) < 1600:
                segment = np.pad(
                    segment,
                    (0, 1600 - len(segment))
                )

            inputs = processor(
                segment,
                sampling_rate=16000,
                return_tensors="pt"
            )

            input_features = inputs.input_features.to(device)

            with torch.no_grad():

                predicted_ids = model.generate(
                    input_features,
                    forced_decoder_ids=forced_decoder_ids,
                    max_new_tokens=256,
                    do_sample=False
                )

            text = processor.batch_decode(
                predicted_ids,
                skip_special_tokens=True
            )[0].strip()

            if text:
                all_text.append(text)

            current += chunk_limit

        final_text = " ".join(all_text).strip()

        results.append({
            "speaker": speaker,
            "start": format_time(start),
            "end": format_time(end),
            "text": final_text
        })

    # =====================================
    # 5. OUTPUT
    # =====================================

    print(
        json.dumps(results, ensure_ascii=False)
    )

    print("INFO: Done", file=sys.stderr)


if __name__ == "__main__":
    main()