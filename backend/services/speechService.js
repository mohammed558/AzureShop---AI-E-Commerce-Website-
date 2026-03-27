const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

// Configure the path to the ffmpeg binary
ffmpeg.setFfmpegPath('C:\\Users\\MohammadArshad\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe');

/**
 * Helper: Transcode any audio buffer to 16kHz Mono PCM WAV
 */
async function transcodeAudio(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    const outputStream = new PassThrough();
    const chunks = [];

    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    outputStream.on('error', (err) => {
      console.error('Transcoding stream error:', err);
      reject(err);
    });

    ffmpeg(inputStream)
      .toFormat('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .pipe(outputStream);

    inputStream.end(inputBuffer);
  });
}

/**
 * Convert audio buffer to text using Azure Speech REST API
 * @param {Buffer} audioBuffer - Raw audio data (any supported format)
 */
async function speechToText(audioBuffer) {
  // 1. Auto-convert to 16kHz Mono PCM WAV (required by Azure REST API)
  const fixedBuffer = await transcodeAudio(audioBuffer);

  const endpoint = process.env.AZURE_SPEECH_ENDPOINT
    || `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com`;
  const url = `${endpoint}/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

  const response = await axios.post(url, fixedBuffer, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'Content-Type': 'audio/wav',
      'Accept': 'application/json',
      'Content-Length': fixedBuffer.length,
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  if (response.data.RecognitionStatus === 'Success') {
    return response.data.DisplayText;
  }

  throw new Error('Speech recognition failed: ' + response.data.RecognitionStatus);
}

module.exports = { speechToText };
