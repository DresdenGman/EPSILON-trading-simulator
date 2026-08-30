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
  local frames="$3"
  local output="$4"

  ffmpeg -hide_banner -loglevel error -y \
    -loop 1 -i "$input" -t "$duration" \
    -filter_complex "zoompan=z='min(zoom+0.00012,1.022)':d=${frames}:s=1920x1080:fps=30" \
    -an -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -movflags +faststart \
    "$output"
}

python3 "$SCRIPT_DIR/render_scenes.py" "$REPO_ROOT" "$WORK_DIR/scenes"

render_segment "$WORK_DIR/scenes/scene-01.jpg" 5 150 "$WORK_DIR/01.mp4"
render_segment "$WORK_DIR/scenes/scene-02.jpg" 5 150 "$WORK_DIR/02.mp4"
render_segment "$WORK_DIR/scenes/scene-03.jpg" 5.5 165 "$WORK_DIR/03.mp4"
render_segment "$WORK_DIR/scenes/scene-04.jpg" 6 180 "$WORK_DIR/04.mp4"
render_segment "$WORK_DIR/scenes/scene-05.jpg" 5.5 165 "$WORK_DIR/05.mp4"
render_segment "$WORK_DIR/scenes/scene-06.jpg" 5.5 165 "$WORK_DIR/06.mp4"

ffmpeg -hide_banner -loglevel error -y \
  -i "$WORK_DIR/01.mp4" -i "$WORK_DIR/02.mp4" -i "$WORK_DIR/03.mp4" \
  -i "$WORK_DIR/04.mp4" -i "$WORK_DIR/05.mp4" -i "$WORK_DIR/06.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v1];[v1][2:v]xfade=transition=fade:duration=0.5:offset=9.0[v2];[v2][3:v]xfade=transition=fade:duration=0.5:offset=14.0[v3];[v3][4:v]xfade=transition=fade:duration=0.5:offset=19.5[v4];[v4][5:v]xfade=transition=fade:duration=0.5:offset=24.5,format=yuv420p[vout]" \
  -map "[vout]" -an -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -movflags +faststart \
  "$SCRIPT_DIR/epsilon-decision-lab-30s.mp4"

ffmpeg -hide_banner -loglevel error -y \
  -ss 00:00:01 -i "$SCRIPT_DIR/epsilon-decision-lab-30s.mp4" -frames:v 1 \
  "$SCRIPT_DIR/epsilon-decision-lab-30s-poster.jpg"

echo "$SCRIPT_DIR/epsilon-decision-lab-30s.mp4"
