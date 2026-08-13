#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
WORK_DIR="$(mktemp -d /private/tmp/epsilon-demo-render.XXXXXX)"

cleanup() {
  rm -rf -- "$WORK_DIR"
}
trap cleanup EXIT

render_segment() {
  local input="$1"
  local duration="$2"
  local kicker="$3"
  local message="$4"
  local output="$5"
  local frames=$((duration * 30))
  local overlay="${output%.mp4}-caption.png"
  local message_size=47

  if (( ${#message} > 70 )); then
    message_size=31
  elif (( ${#message} > 55 )); then
    message_size=38
  fi

  python3 "$SCRIPT_DIR/render_caption.py" \
    "$overlay" "$kicker" "$message" "$message_size"

  ffmpeg -hide_banner -loglevel error -y \
    -loop 1 -i "$input" -loop 1 -i "$overlay" -t "$duration" \
    -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.00022,1.035)':d=${frames}:s=1920x1080:fps=30[background];[background][1:v]overlay=0:820:shortest=1" \
    -an -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -movflags +faststart \
    "$output"
}

render_segment \
  "$REPO_ROOT/website/public/social/epsilon-social-preview-v1.jpg" 5 \
  "EPSILON / QUANTITATIVE DECISION LAB" \
  "Build a market idea. Test it. Then try to break it." \
  "$WORK_DIR/01.mp4"

render_segment \
  "$REPO_ROOT/docs/screenshots/landing.png" 6 \
  "01 / OBSERVE" \
  "Turn a market intuition into a falsifiable claim." \
  "$WORK_DIR/02.mp4"

render_segment \
  "$REPO_ROOT/docs/screenshots/strategy-lab.png" 8 \
  "02 / TEST" \
  "Keep inputs, metrics, trades, and evidence boundaries together." \
  "$WORK_DIR/03.mp4"

render_segment \
  "$REPO_ROOT/website/public/social/epsilon-social-preview-v1.jpg" 6 \
  "03 / CHALLENGE" \
  "Expose assumptions. Refine the question. Retest without erasing history." \
  "$WORK_DIR/04.mp4"

render_segment \
  "$REPO_ROOT/docs/screenshots/landing.png" 5 \
  "OPEN SOURCE / USE IT NOW" \
  "epsilon-livid.vercel.app  |  github.com/DresdenGman/EPSILON-trading-simulator" \
  "$WORK_DIR/05.mp4"

printf "file '%s/01.mp4'\nfile '%s/02.mp4'\nfile '%s/03.mp4'\nfile '%s/04.mp4'\nfile '%s/05.mp4'\n" \
  "$WORK_DIR" "$WORK_DIR" "$WORK_DIR" "$WORK_DIR" "$WORK_DIR" > "$WORK_DIR/concat.txt"

ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i "$WORK_DIR/concat.txt" -c copy \
  "$SCRIPT_DIR/epsilon-decision-lab-30s.mp4"

ffmpeg -hide_banner -loglevel error -y \
  -ss 00:00:01 -i "$SCRIPT_DIR/epsilon-decision-lab-30s.mp4" -frames:v 1 \
  "$SCRIPT_DIR/epsilon-decision-lab-30s-poster.jpg"

echo "$SCRIPT_DIR/epsilon-decision-lab-30s.mp4"
