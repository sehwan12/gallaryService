// server/server.js
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
//app.use(cors());
// 미들웨어 설정
app.use(cors({
    origin: '*', // 클라이언트 도메인으로 변경하거나 '*'로 설정
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// 정적 파일 서빙 설정 (API 라우트보다 나중에 설정)
app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(path.join(__dirname, '../page')));
 

// AI 이미지 생성 엔드포인트
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large',
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer', // 이미지 데이터를 버퍼로 받기 위해 설정
            }
        );

        // 이미지 데이터를 클라이언트로 전송
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error generating AI image:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: error.response ? error.response.data.error : 'Internal Server Error',
        });
    }
});

// Unsplash 이미지 검색 엔드포인트
app.get('/api/search-photos', async (req, res) => {
    const { query, page = 1, per_page = 20 } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query,
                page,
                per_page,
            },
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error searching Unsplash photos:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: error.response ? error.response.data.errors : 'Internal Server Error',
        });
    }
});


// 모든 GET 요청에 대해 클라이언트의 index.html 반환
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../page/index.html'));
});

// 서버 시작 함수
function startServer(port) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is in use, trying port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

// 서버 시작
startServer(PORT);