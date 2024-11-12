// script.js

const apiKey = 'XZB6t3Awo2Ul_fGPYWCAJZ50u7-gcjlPa_MNSnD-vyw';  // 발급받은 Unsplash API 키로 교체하세요
let photosArray = [];
let currentIndex = 0;

// DOM 요소 가져오기
const gallery = document.querySelector('.gallery');
//const modal = document.getElementById('image_modal');
const modal=document.getElementById('modalContainer')
const modalContent=document.getElementById('modalContent');
const modalImage = document.getElementById('modalContentImage');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// 이미지 데이터 가져오기
async function getPhotos(query) {
    console.log("hi")
    const apiUrl = `https://api.unsplash.com/search/photos?client_id=${apiKey}&query=${query}&per_page=30`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        photosArray = data.results;
        if(photosArray.length === 0){
            gallery.innerHTML='<p>검색 결과가 없습니다.</p>';
            closeModal();
        }else{
            displayPhotos();
        }  
    } catch (error) {
        console.error(error);
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
    modalImage.focus();
    //document.body.style.overflow='hidden';
}

// 모달에 이미지 표시
function showModalImage() {
    modalImage.src = photosArray[currentIndex].urls.regular;
}

// 모달 닫기
function closeModal() {
    modal.classList.add('hidden');
}

// 이전 이미지 보기
function showPrevImage() {
    currentIndex = (currentIndex - 1 + photosArray.length) % photosArray.length;
    showModalImage();
}

// 다음 이미지 보기
function showNextImage() {
    currentIndex = (currentIndex + 1) % photosArray.length;
    showModalImage();
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

// 초기 함수 호출 (초기에는 인기 이미지를 표시)
getPhotos('popular');