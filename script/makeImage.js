const makeGallery = document.getElementById('make-gallery');
const generateAIButton = document.getElementById('generate-ai-button');
const loadingModal = document.getElementById('loadingModal');
const aiModalContainer = document.getElementById('modalContainer');
const aiModalContentImage = document.getElementById('modalContentImage');
const downloadAIButton = document.getElementById('download-ai-button');
const aiCloseModalButton = document.querySelector('#modalContent .close');

let selectedPhotos = [];

// 로컬 스토리지에서 선택된 사진 불러오기
document.addEventListener('DOMContentLoaded', () => {
    const storedSelectedPhotos = localStorage.getItem('selectedPhotos');
    if (storedSelectedPhotos) {
        selectedPhotos = JSON.parse(storedSelectedPhotos);
        displaySelectedPhotos();
    } else {
        makeGallery.innerHTML = '<p>선택한 사진이 없습니다.</p>';
    }
});

// 선택된 사진을 갤러리에 표시하는 함수
function displaySelectedPhotos() {
    makeGallery.innerHTML = '';  // 기존 콘텐츠 제거

    selectedPhotos.forEach((photo, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('make-image-container');

        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = photo.alt || '선택한 이미지';
        img.classList.add('make-image');

        imgContainer.appendChild(img);
        makeGallery.appendChild(imgContainer);
    });

    if (selectedPhotos.length === 0) {
        makeGallery.innerHTML = '<p>선택한 사진이 없습니다.</p>';
    }
}

// AI 이미지 생성 버튼 클릭 이벤트
generateAIButton.addEventListener('click', () => {
    if (selectedPhotos.length === 0) {
        alert('AI 이미지를 생성할 사진을 선택하세요.');
        return;
    }
    generateAIImage();
});

// AI 이미지 생성 함수 (Hugging Face의 Stable Diffusion API 사용)
async function generateAIImage() {
    // 로딩 모달 표시
    loadingModal.classList.remove('hidden');

    // 선택된 사진들의 alt 텍스트를 기반으로 프롬프트 생성
    const prompts = selectedPhotos.map(photo => photo.alt || '이미지').join(', ');
    const promptText = `Create a cohesive and artistic image that combines the following elements: ${prompts}.`;

    console.log("Generated prompt for AI:", promptText);

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`, // 발급받은 API 키로 교체하세요
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: promptText
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error! status: ${response.status}, message: ${errorData.error}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // 로딩 모달 숨김
        loadingModal.classList.add('hidden');

        // AI 이미지 모달에 표시
        displayAIImage(imageUrl);

        // AI 이미지 로컬 스토리지에 저장
        saveAIImage(imageUrl);
    } catch (error) {
        console.error('Error generating AI image:', error);
        alert('AI 이미지 생성 중 오류가 발생했습니다.');
        loadingModal.classList.add('hidden');
    }
}

// AI 이미지 표시 함수
function displayAIImage(url) {
    aiModalContentImage.src = url;
    aiModalContainer.classList.remove('hidden');
}

// AI 이미지 다운로드 버튼 클릭 이벤트
downloadAIButton.addEventListener('click', () => {
    const imageUrl = aiModalContentImage.src;
    if (imageUrl) {
        downloadImage(imageUrl, `ai-generated-${Date.now()}.jpg`);
    } else {
        alert('다운로드할 이미지가 없습니다.');
    }
});

// 다운로드 함수
function downloadImage(imageUrl, filename) {
    fetch(imageUrl, {
        mode: 'cors'
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;  // 원하는 파일 이름으로 설정
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Download initiated for:', imageUrl);
    })
    .catch(error => {
        console.error('Error downloading the image:', error);
        alert('이미지를 다운로드할 수 없습니다.');
    });
}

// AI 이미지 모달 닫기 함수
function closeAIModal() {
    aiModalContainer.classList.add('hidden');
    aiModalContentImage.src = ''; // 이미지 초기화
    aiModalContentImage.alt = ''; // alt 텍스트 초기화
    downloadAIButton.onclick = null;
}

// AI 모달 닫기 버튼 클릭 이벤트
aiCloseModalButton.addEventListener('click', closeAIModal);

// AI 모달 외부 클릭 시 닫기
aiModalContainer.addEventListener('click', (event) => {
    if (event.target === aiModalContainer) {
        closeAIModal();
    }
});

// AI 이미지 로컬 스토리지에 저장
function saveAIImage(imageUrl) {
    let aiImages = [];
    const storedAIImages = localStorage.getItem('aiImages');
    if (storedAIImages) {
        aiImages = JSON.parse(storedAIImages);
    }
    aiImages.push({
        id: `ai-${Date.now()}`,
        url: imageUrl,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('aiImages', JSON.stringify(aiImages));
}