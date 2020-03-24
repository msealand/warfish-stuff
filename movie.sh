#!/bin/bash
set -e

GAME_ID=$1
START_IDX=0

echo "Game $GAME_ID"

MOVIE_BASE_NAME="$GAME_ID"

ffmpeg -y -framerate 10 -start_number $START_IDX -i cache/$GAME_ID/moves/%d.png -c:v libx264 -r 30 -filter drawtext='text="TEST": fontcolor=white: fontsize=24: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/2' -vf scale=1004:588 -pix_fmt yuv420p $MOVIE_BASE_NAME.mp4
ffmpeg -y -i $MOVIE_BASE_NAME.mp4 -vf mpdecimate,setpts=N/FRAME_RATE/TB $MOVIE_BASE_NAME-fast.mp4
ffmpeg -y -i $MOVIE_BASE_NAME-fast.mp4 -filter:v "setpts=10.0*PTS" $MOVIE_BASE_NAME-slow.mp4
