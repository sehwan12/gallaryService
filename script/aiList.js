// aiList.js

const aiGallery = document.getElementById('ai-gallery');
const aiModalContainer = document.getElementById('modalContainer');
const aiModalContentImage = document.getElementById('modalContentImage');
const downloadAIButton = document.getElementById('download-ai-button');
const aiCloseModalButton = document.querySelector('#modalContent .close');

let aiImages = [];

// 로컬 스토리지에서 AI 이미지 불러오기
document.addEventListener('DOMContentLoaded', () => {
    const storedAIImages = localStorage.getItem('aiImages');
    if (storedAIImages) {
        aiImages = JSON.parse(storedAIImages);
        displayAIImages();
    } else {
        aiGallery.innerHTML = '<p>생성된 AI 이미지가 없습니다.</p>';
    }
});

// AI 이미지를 갤러리에 표시하는 함수
function displayAIImages() {
    aiGallery.innerHTML = '';  // 기존 콘텐츠 제거

    aiImages.forEach((aiImage, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('make-image-container');

        const img = document.createElement('img');
        img.src = aiImage.url;
        img.alt = `AI 생성 이미지 ${index + 1}`;
        img.dataset.index = index;
        img.tabIndex = 0;  // 키보드 포커스 가능하도록 설정
        img.setAttribute('aria-label', 'AI 생성 이미지 확대 보기');

        // 이미지 클릭 이벤트
        img.addEventListener('click', () => {
            openAIModal(index);
            console.log("AI 이미지가 클릭되었습니다");
        });

        // 키보드 이벤트로 이미지 선택
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                openAIModal(index);
                console.log("AI 이미지가 키보드로 선택되었습니다");
            }
        });

        imgContainer.appendChild(img);
        aiGallery.appendChild(imgContainer);
    });

    if (aiImages.length === 0) {
        aiGallery.innerHTML = '<p>생성된 AI 이미지가 없습니다.</p>';
    }
}

// AI 이미지 모달 열기 함수
function openAIModal(index) {
    const aiImage = aiImages[index];
    if (!aiImage) {
        console.error(`AI 이미지가 존재하지 않습니다: 인덱스 ${index}`);
        return;
    }

    // 이미지 설정
    aiModalContentImage.src = aiImage.url;
    aiModalContentImage.alt = `AI 생성 이미지 ${index + 1}`;

    // 다운로드 버튼 설정
    downloadAIButton.onclick = () => {
        downloadImage(aiImage.url, `ai-generated-${aiImage.id}.jpg`);
    };

    // 모달 표시
    aiModalContainer.classList.remove('hidden');
    aiModalContentImage.focus();
}

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