import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Video from '../models/Video.js';
import axios from 'axios';

// Generate transcript using OpenAI Whisper (or AssemblyAI alternative)
export const generateTranscript = asyncHandler(async (req, res) => {
    const { videoId, language = 'en' } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Only owner can generate transcript
    if (video.userId !== req.user.id) {
        throw new ApiError(403, 'Not authorized');
    }

    // Check if already has transcript
    if (video.transcript) {
        return res.status(200).json(new ApiResponse(200, video.transcript, 'Transcript already exists'));
    }

    try {
        // For now, we'll use a placeholder
        // In production, you'd call OpenAI Whisper API or AssemblyAI

        // OPTION A: OpenAI Whisper (requires audio file)
        // const formData = new FormData();
        // formData.append('file', audioFile);
        // formData.append('model', 'whisper-1');
        // const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        //   headers: {
        //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        //   }
        // });

        // OPTION B: AssemblyAI (recommended for video URLs)
        const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;

        if (!assemblyAIKey) {
            throw new ApiError(500, 'Transcription service not configured');
        }

        // Upload video URL to AssemblyAI
        const uploadResponse = await axios.post(
            'https://api.assemblyai.com/v2/transcript',
            {
                audio_url: video.videoUrl,
                language_code: language,
                auto_chapters: true,
                auto_highlights: true,
            },
            {
                headers: {
                    'Authorization': assemblyAIKey,
                },
            }
        );

        const transcriptId = uploadResponse.data.id;

        // Poll for completion (in production, use webhooks)
        let transcript = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max

        while (attempts < maxAttempts) {
            const statusResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                {
                    headers: {
                        'Authorization': assemblyAIKey,
                    },
                }
            );

            if (statusResponse.data.status === 'completed') {
                transcript = statusResponse.data;
                break;
            } else if (statusResponse.data.status === 'error') {
                throw new ApiError(500, 'Transcription failed');
            }

            // Wait 5 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
        }

        if (!transcript) {
            throw new ApiError(500, 'Transcription timeout');
        }

        // Save transcript to video
        video.transcript = {
            text: transcript.text,
            words: transcript.words,
            chapters: transcript.chapters,
            highlights: transcript.auto_highlights_result?.results,
            language,
            generatedAt: new Date(),
        };

        await video.save();

        res.status(200).json(new ApiResponse(200, video.transcript, 'Transcript generated'));

    } catch (error) {
        console.error('Transcription error:', error);
        throw new ApiError(500, error.message || 'Transcription failed');
    }
});

// Get transcript for a video
export const getTranscript = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (!video.transcript) {
        throw new ApiError(404, 'No transcript available');
    }

    res.status(200).json(new ApiResponse(200, video.transcript));
});

// Search within transcript
export const searchTranscript = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const video = await Video.findById(req.params.videoId);

    if (!video || !video.transcript) {
        throw new ApiError(404, 'Transcript not found');
    }

    const results = [];
    const words = video.transcript.words || [];

    // Simple search - find matching words with timestamps
    words.forEach((word, index) => {
        if (word.text.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                text: word.text,
                start: word.start,
                end: word.end,
                context: words.slice(Math.max(0, index - 5), index + 6).map(w => w.text).join(' '),
            });
        }
    });

    res.status(200).json(new ApiResponse(200, results));
});