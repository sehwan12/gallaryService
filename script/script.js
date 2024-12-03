// script.js


let photosArray = [];
let currentIndex = 0;
let likedPhotos = []; //좋아요한 사진 목록

// DOM 요소 가져오기
const gallery = document.querySelector('.gallery');
const modal=document.getElementById('modalContainer')
const modalContent=document.getElementById('modalContent');
const modalImage = document.getElementById('modalContentImage');
const modalDescription = document.getElementById('modalDescription'); 
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const downloadButton= document.getElementById('download-button');
const likeButton= document.getElementById('like-button');

//로컬 스토리지에서 좋아요한 사진 불러오기
document.addEventListener('DOMContentLoaded', ()=>{
    const storedLikes=localStorage.getItem('likedPhotos');
    if(storedLikes){
        likedPhotos = JSON.parse(storedLikes);
    }
})

// // 이미지 데이터 가져오기
// async function getPhotos(query) {
//     console.log("hi")
//     const apiUrl = `https://api.unsplash.com/search/photos?client_id=${apiKey}&query=${query}&per_page=30`;
//     try {
//         const response = await fetch(apiUrl);
//         const data = await response.json();
//         photosArray = data.results;
//         if(photosArray.length === 0){
//             gallery.innerHTML='<p>검색 결과가 없습니다.</p>';
//             closeModal();
//         }else{
//             displayPhotos();
//         }  
//     } catch (error) {
//         console.error(error);
//         closeModal();
//     }
// }

// 이미지 데이터 가져오기 (서버 사이드 프록시 사용)
async function getPhotos(query) {
    console.log("hi");
    // const apiUrl = `/api/search-photos?query=${encodeURIComponent(query)}&per_page=30`;
    //const apiUrl = `http://localhost:3000/api/search-photos?query=${encodeURIComponent(query)}&per_page=30`; // 서버 포트로 변경
    const apiUrl = `https://photowiz.onrender.com/api/search-photos`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error:', errorData);
            throw new Error(`API error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        photosArray = data.results;

        if (photosArray.length === 0) {
            gallery.innerHTML = '<p>검색 결과가 없습니다.</p>';
            closeModal();
        } else {
            displayPhotos();
        }
    } catch (error) {
        console.error('Error fetching photos:', error);
        gallery.innerHTML = '<p>이미지를 불러오는 데 문제가 발생했습니다.</p>';
        closeModal();
    }
}



// 갤러리에 이미지 표시
function displayPhotos() {
    console.log("갤러리 표시")
    gallery.innerHTML = '';  // 기존 이미지 제거
    photosArray.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description;
        img.dataset.index = index;
        

        // 이미지 클릭 이벤트
        img.addEventListener('click', (event)=>{
            openModal(event);
            console.log("이미지가 클릭되었습니다");
        });

        gallery.appendChild(img);
    
    });
}

// 모달 열기
function openModal(event) {
    console.log('openModal 함수 호출');
    currentIndex = Number(event.currentTarget.dataset.index);
    if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= photosArray.length) {
        console.error(`Invalid currentIndex: ${currentIndex}`);
        return;
    }
  
    modal.classList.remove('hidden'); // 'hidden' 클래스 제거하여 표시
    showModalImage();
    updateLikeButton();
    modalImage.focus();
    //document.body.style.overflow='hidden';
}

// 모달에 이미지 표시
function showModalImage() {
    const photo=photosArray[currentIndex];
    //modalImage.src = photosArray[currentIndex].urls.regular;
    modalImage.src = photo.urls.regular;
    modalDescription.textContent = photo.alt_description || photo.description || '설명이 없습니다.';
}

// 모달 닫기
function closeModal() {
    modal.classList.add('hidden');
}

// 이전 이미지 보기
function showPrevImage() {
    currentIndex = (currentIndex - 1 + photosArray.length) % photosArray.length;
    showModalImage();
    updateLikeButton();
}

// 다음 이미지 보기
function showNextImage() {
    currentIndex = (currentIndex + 1) % photosArray.length;
    showModalImage();
    updateLikeButton();
}

// 다운로드 버튼 클릭 이벤트 수정
downloadButton.addEventListener('click', () => {
    const photo = photosArray[currentIndex];
    if (photo && photo.urls && photo.urls.full) {
        const imageUrl = photo.urls.full;
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
    } else {
        alert('이미지를 다운로드할 수 없습니다.');
    }
});

//하트 버튼 클릭 이벤트
likeButton.addEventListener('click', ()=>{
    toggleLikeButton();
    updateLikeButton();
})

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
    const photo = photosArray[currentIndex];
    //
    return likedPhotos.some(liked => liked.id === photo.id);
}

// 좋아요 토글 함수
function toggleLikeButton() {
    const photo = photosArray[currentIndex];
    if (isPhotoLiked()) {
        // 좋아요 목록에서 제거
        likedPhotos = likedPhotos.filter(liked => liked.id !== photo.id);
    } else {
        // 좋아요 목록에 추가
        likedPhotos.push({
            id: photo.id,
            alt: photo.alt_description || photo.description || '이미지',
            url: photo.urls.small,
            fullUrl: photo.urls.regular,
            downloadLink: photo.links.download_location
    });
    }
    // 로컬 스토리지에 저장
    localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
}

// 검색 버튼 클릭 이벤트
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        getPhotos(query);
    } else {
        alert('검색어를 입력하세요.');
    }
});

// 엔터 키로 검색 기능 활성화
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// 모달 외부 클릭 시 닫기
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// 모달 이벤트 리스너 추가
document.querySelector('.close').addEventListener('click', closeModal);
document.querySelector('.prev').addEventListener('click', showPrevImage);
document.querySelector('.next').addEventListener('click', showNextImage);

// 키보드 이벤트로 모달 제어
document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('hidden')) { // 모달이 열려있는 경우
        switch (event.key) {
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'Escape':
                closeModal();
                break;
            default:
                break;
        }
    }
});

// 초기 함수 호출 (초기에는 인기 이미지를 표시)
getPhotos('popular');