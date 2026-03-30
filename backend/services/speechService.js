const axios = require('axios');

/**
 * Convert audio buffer to text using Azure Speech REST API
 * NOTE: This service now expects a pre-formatted 16kHz Mono PCM WAV buffer
 * from the client, removing the need for server-side FFmpeg transcoding.
 * @param {Buffer} audioBuffer - 16kHz Mono PCM WAV buffer
 */
async function speechToText(audioBuffer) {
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT
    || `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com`;
  
  const url = `${endpoint}/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

  const response = await axios.post(url, audioBuffer, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'Content-Type': 'audio/wav',
      'Accept': 'application/json',
      'Content-Length': audioBuffer.length,
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
