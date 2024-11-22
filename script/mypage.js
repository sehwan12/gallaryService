// mypage.js
const modal = document.getElementById('modalContainer');
const modalContentImage = document.getElementById('modalContentImage');
const downloadButton = document.getElementById('download-button');
const likeButton = document.getElementById('like-button');
const likedGallery = document.getElementById('liked-gallery');
const storedLikes = localStorage.getItem('likedPhotos');
const closeModalButton = document.querySelector('.close');

let likedPhotos = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (storedLikes) {
        likedPhotos = JSON.parse(storedLikes);
        displayLikedPhotos();
    } else {
        likedGallery.innerHTML = '<p>좋아요한 사진이 없습니다.</p>';
    }
});

// 좋아요한 사진을 갤러리에 표시하는 함수
function displayLikedPhotos() {
    likedGallery.innerHTML = '';  // 기존 콘텐츠 제거

    likedPhotos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo.url;
        img.dataset.index = index;
        img.tabIndex = 0;  // 키보드 포커스 가능하도록 설정
        img.setAttribute('aria-label', '이미지 확대 보기');

        // 이미지 클릭 이벤트
        img.addEventListener('click', () => {
            currentIndex=index;
            openModal();
            console.log("Liked image clicked");
        });

        // 키보드 이벤트로 이미지 선택
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                currentIndex=index;
                openModal();
                console.log("Liked image selected via keyboard");
            }
        });

        likedGallery.appendChild(img);
    });

    if (likedPhotos.length === 0) {
        likedGallery.innerHTML = '<p>좋아요한 사진이 없습니다.</p>';
    }
}

// 모달 열기 함수 (mypage.html용)
function openModal() {
    // 이미지 설정
    const photo= likedPhotos[currentIndex];
    const photoId=photo.id;
    // 이미지 설정
    modalContentImage.src = photo.fullUrl;
    modalContentImage.alt = photo.alt;

    // 다운로드 버튼 설정
    downloadButton.onclick = () => {
        const imageUrl = photo.fullUrl;
        // CORS 문제를 방지하기 위해 Blob을 사용한 다운로드 구현
        fetch(imageUrl, {
            mode: 'cors'
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `unsplash-${photo.id}.jpg`;  // 원하는 파일 이름으로 설정
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
    };

    // 하트 버튼 초기 상태 설정
    updateLikeButton();

    // 하트 버튼 클릭 이벤트
    likeButton.onclick = () => {
        removeLikePhoto(photoId);
        updateLikeButton();
        displayLikedPhotos();
        console.log('Unlike button clicked');
    };

    // 모달 표시
    modal.classList.remove('hidden');
    modalContentImage.focus();
}

// 모달 닫기 함수
function closeModal() {
    modal.classList.add('hidden'); // 'hidden' 클래스 추가하여 숨김
    modalContentImage.src = ''; // 이미지 초기화
    modalContentImage.alt = ''; // alt 텍스트 초기화
    downloadButton.onclick = null;
    likeButton.onclick = null;
}


//하트 버튼 클릭 이벤트
function updateLikeButton(){
    if(isPhotoLiked()){
        likeButton.classList.add('liked');
        likeButton.textContent='❤️';
    }else{
        likeButton.classList.remove('liked');
        likeButton.textContent='♡';
    }
}

// 현재 사진이 좋아요 목록에 있는지 확인
function isPhotoLiked() {
    const photo = likedPhotos[currentIndex];
    return likedPhotos.some(liked => liked.id === photo.id);
}

// 좋아요 목록에서 사진 제거
function removeLikePhoto(photoId) {
    likedPhotos = likedPhotos.filter(photo => photo.id !== photoId);
    localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
}

// 모달 외부 클릭 시 닫기
modal.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
};

// 이전 이미지 보기
function showPrevImage() {
    currentIndex = (currentIndex - 1 + likedPhotos.length) % likedPhotos.length;
    openModal();
}

// 다음 이미지 보기
function showNextImage() {
    currentIndex = (currentIndex + 1) % likedPhotos.length;
    openModal();
}

// 모달 이벤트 리스너 추가
document.querySelector('.close').addEventListener('click', closeModal);
document.querySelector('.prev').addEventListener('click', showPrevImage);
document.querySelector('.next').addEventListener('click', showNextImage);
