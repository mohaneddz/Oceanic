$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$soundDir = Join-Path $root "public\sounds"
$tmpDir = Join-Path $root "tmp\sound-src"

New-Item -ItemType Directory -Force $soundDir | Out-Null

function Encode-Single {
  param(
    [string]$InputPath,
    [string]$OutputName,
    [string]$Filter,
    [int]$Duration = 150
  )

  $outputPath = Join-Path $soundDir $OutputName
  & ffmpeg -y -stream_loop -1 -i $InputPath -t $Duration -vn -af $Filter -c:a libvorbis -q:a 5 $outputPath | Out-Null
}

function Encode-Mix {
  param(
    [string]$InputA,
    [string]$InputB,
    [string]$OutputName,
    [string]$FilterComplex,
    [int]$Duration = 150
  )

  $outputPath = Join-Path $soundDir $OutputName
  & ffmpeg -y -stream_loop -1 -i $InputA -stream_loop -1 -i $InputB -t $Duration -filter_complex $FilterComplex -map "[a]" -c:a libvorbis -q:a 5 $outputPath | Out-Null
}

function Encode-Synth {
  param(
    [string]$Lavfi,
    [string]$OutputName,
    [int]$Duration = 150
  )

  $outputPath = Join-Path $soundDir $OutputName
  & ffmpeg -y -f lavfi -i $Lavfi -t $Duration -c:a libvorbis -q:a 5 $outputPath | Out-Null
}

$rain = Join-Path $soundDir "rain.ogg"
$storm = Join-Path $soundDir "storm.ogg"
$wind = Join-Path $soundDir "wind.ogg"
$waves = Join-Path $soundDir "waves.ogg"
$stream = Join-Path $soundDir "stream.ogg"
$birds = Join-Path $soundDir "birds.ogg"
$summerNight = Join-Path $soundDir "summer-night.ogg"
$train = Join-Path $soundDir "train.ogg"
$boat = Join-Path $soundDir "boat.ogg"
$city = Join-Path $soundDir "city.ogg"
$coffee = Join-Path $soundDir "coffee-shop.ogg"
$fireplace = Join-Path $soundDir "fireplace.ogg"
$whiteNoise = Join-Path $soundDir "white-noise.ogg"
$pinkNoise = Join-Path $soundDir "pink-noise.ogg"

$rainOcean = Join-Path $tmpDir "rain-ocean.mp3"
$thunderstorm = Join-Path $tmpDir "thunderstorm.mp3"
$forestStream = Join-Path $tmpDir "forest-stream.mp3"
$coffeeRaw = Join-Path $tmpDir "coffee-shop.mp3"
$summerNightRaw = Join-Path $tmpDir "summer-night.webm"

Encode-Single $rain "soft-rain.ogg" "volume=0.86,highpass=f=100,lowpass=f=4200,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $rain "roof-rain.ogg" "volume=0.9,lowpass=f=2600,highpass=f=160,aecho=0.8:0.6:12:0.15,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $rainOcean "tent-rain.ogg" "volume=0.84,lowpass=f=1800,highpass=f=130,aecho=0.8:0.7:24:0.18,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $thunderstorm "distant-thunder.ogg" "volume=1.15,lowpass=f=240,highpass=f=35,alimiter=limit=-2,loudnorm=I=-22:LRA=7:TP=-2"
Encode-Single $wind "mountain-wind.ogg" "volume=0.86,highpass=f=240,lowpass=f=5200,loudnorm=I=-21:LRA=6:TP=-2"
Encode-Mix $wind $birds "leaves.ogg" "[0:a]volume=0.72,highpass=f=300,lowpass=f=5200[a0];[1:a]volume=0.12,highpass=f=2500,lowpass=f=9000[a1];[a0][a1]amix=inputs=2:normalize=0,loudnorm=I=-21:LRA=6:TP=-2[a]"

Encode-Single $waves "deep-waves.ogg" "volume=0.95,lowpass=f=700,highpass=f=45,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $rainOcean "harbor-water.ogg" "volume=0.8,lowpass=f=1200,highpass=f=70,loudnorm=I=-21:LRA=7:TP=-2"
Encode-Single $stream "waterfall.ogg" "volume=0.88,highpass=f=180,lowpass=f=7000,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $stream "droplets.ogg" "volume=0.76,highpass=f=1800,lowpass=f=9000,loudnorm=I=-21:LRA=5:TP=-2"

Encode-Single $forestStream "forest-dawn.ogg" "volume=0.88,highpass=f=140,lowpass=f=9000,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $birds "meadow-birds.ogg" "volume=0.82,highpass=f=1800,lowpass=f=10000,extrastereo=m=1.2,loudnorm=I=-21:LRA=6:TP=-2"
Encode-Single $summerNightRaw "crickets.ogg" "volume=0.9,highpass=f=2200,lowpass=f=8000,loudnorm=I=-22:LRA=5:TP=-2"
Encode-Single $summerNightRaw "frogs.ogg" "volume=1.05,highpass=f=180,lowpass=f=1300,loudnorm=I=-22:LRA=6:TP=-2"
Encode-Single $summerNightRaw "owl-night.ogg" "volume=0.78,highpass=f=700,lowpass=f=2600,atempo=0.96,loudnorm=I=-23:LRA=6:TP=-2"

Encode-Single $train "train-carriage.ogg" "volume=0.92,lowpass=f=2400,highpass=f=70,loudnorm=I=-20:LRA=7:TP=-2"
Encode-Single $train "subway.ogg" "volume=0.96,highpass=f=110,lowpass=f=1800,loudnorm=I=-21:LRA=7:TP=-2"
Encode-Single $boat "cabin-engine.ogg" "volume=0.92,lowpass=f=700,highpass=f=55,loudnorm=I=-21:LRA=7:TP=-2"

Encode-Single $city "downtown-night.ogg" "volume=0.84,lowpass=f=2300,highpass=f=120,loudnorm=I=-22:LRA=7:TP=-2"
Encode-Mix $city $waves "harbor-city.ogg" "[0:a]volume=0.42,highpass=f=180,lowpass=f=2500[a0];[1:a]volume=0.28,highpass=f=80,lowpass=f=1800[a1];[a0][a1]amix=inputs=2:normalize=0,loudnorm=I=-22:LRA=7:TP=-2[a]"
Encode-Single $coffeeRaw "library.ogg" "volume=0.72,lowpass=f=2800,highpass=f=140,loudnorm=I=-23:LRA=5:TP=-2"

Encode-Single $fireplace "campfire.ogg" "volume=0.88,highpass=f=120,lowpass=f=4500,loudnorm=I=-21:LRA=7:TP=-2"
Encode-Single $coffeeRaw "keyboard-room.ogg" "volume=0.74,highpass=f=700,lowpass=f=3800,alimiter=limit=-2,loudnorm=I=-23:LRA=5:TP=-2"
Encode-Single $whiteNoise "fan.ogg" "volume=0.7,lowpass=f=900,highpass=f=40,loudnorm=I=-23:LRA=4:TP=-2"

Encode-Synth "anoisesrc=d=150:c=brown:r=48000,volume=0.38,loudnorm=I=-21:LRA=4:TP=-2" "brown-noise.ogg"
Encode-Synth "anoisesrc=d=150:c=white:r=48000,highpass=f=1500,lowpass=f=9000,volume=0.28,loudnorm=I=-22:LRA=4:TP=-2" "grey-noise.ogg"
Encode-Synth "sine=f=58:r=48000:d=150,volume=0.12,lowpass=f=140,highpass=f=40,loudnorm=I=-23:LRA=3:TP=-2" "low-hum.ogg"
Encode-Synth "anoisesrc=d=150:c=pink:r=48000,highpass=f=90,lowpass=f=850,volume=0.16,aecho=0.8:0.4:18:0.06,loudnorm=I=-22:LRA=4:TP=-2" "focus-drone.ogg"
Encode-Synth "anoisesrc=d=150:c=white:r=48000,lowpass=f=700,volume=0.16,loudnorm=I=-22:LRA=4:TP=-2" "airplane-cabin.ogg"
