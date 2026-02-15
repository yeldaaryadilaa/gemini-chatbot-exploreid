document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Fitur 1: Dark Mode Toggle
    // Pastikan Anda menambahkan <button id="theme-toggle">Toggle Theme</button> di HTML
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Ganti icon: Bulan (fa-moon) <-> Matahari (fa-sun)
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    // Fitur 2: Chat Widget Toggle
    const chatWidget = document.getElementById('chat-widget');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');

    if (chatToggleBtn && chatWidget && chatCloseBtn) {
        chatToggleBtn.addEventListener('click', () => {
            chatWidget.classList.remove('hidden');
            userInput.focus(); // Fokus ke input saat dibuka

            // Sapaan otomatis jika percakapan masih kosong
            if (conversation.length === 0) {
                const now = new Date();
                const hour = now.getHours();
                let greeting;

                if (hour >= 5 && hour < 12) {
                    greeting = "Selamat Pagi";
                } else if (hour >= 12 && hour < 18) {
                    greeting = "Selamat Siang";
                } else {
                    greeting = "Selamat Malam";
                }

                const message = `${greeting}! Saya Travel Assistant Explore.id. Ada destinasi impian yang ingin Anda kunjungi?`;
                addMessageToChat('model', message);
                conversation.push({ role: 'model', text: message });
            }
        });

        chatCloseBtn.addEventListener('click', () => {
            chatWidget.classList.add('hidden');
        });
    }

    // Fitur 3: Carousel Navigation
    const carouselContainer = document.querySelector('.carousel-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (carouselContainer && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: -320, behavior: 'smooth' }); // Geser ke kiri
        });

        nextBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: 320, behavior: 'smooth' }); // Geser ke kanan
        });

        // Fitur Auto-Scroll
        let autoScrollInterval;
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                // Cek jika sudah mentok kanan, balik ke awal
                if (carouselContainer.scrollLeft + carouselContainer.clientWidth >= carouselContainer.scrollWidth - 10) {
                    carouselContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carouselContainer.scrollBy({ left: 320, behavior: 'smooth' });
                }
            }, 3000); // Geser setiap 3 detik
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        // Mulai auto-scroll
        startAutoScroll();

        // Hentikan saat mouse berada di atas carousel agar user bisa membaca/klik
        carouselContainer.addEventListener('mouseenter', stopAutoScroll);
        carouselContainer.addEventListener('mouseleave', startAutoScroll);
    }

    // Fitur 4: Modal Detail Layanan
    const modal = document.getElementById('service-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const featureCards = document.querySelectorAll('.feature-card');

    if (modal && featureCards.length > 0) {
        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                const detail = card.getAttribute('data-detail');
                
                modalTitle.textContent = title;
                modalDesc.textContent = detail || "Informasi detail belum tersedia.";
                
                modal.classList.remove('hidden');
            });
        });

        closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
        
        // Tutup modal jika klik di luar area konten
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // Store conversation history to maintain context
    const conversation = [];

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Add user's message to the chat box
        addMessageToChat('user', text);
        
        // Add to conversation history
        conversation.push({ role: 'user', text });
        
        // Clear input
        userInput.value = '';

        // 2. Show temporary "Thinking..." bot message
        const botMessageElement = addMessageToChat('model', 'Loading...');

        try {
            // 3. Send the conversation history as a POST request
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ conversation })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // 4. Replace "Thinking..." with the AI's reply
            if (data.result) {
                botMessageElement.textContent = data.result;
                conversation.push({ role: 'model', text: data.result });

                // Play notification sound
                const audio = document.getElementById('notification-sound');
                if (audio) {
                    audio.play().catch(e => console.log('Audio play failed:', e));
                }
            } else {
                botMessageElement.textContent = 'Sorry, no response received.';
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            // 5. Show error message
            botMessageElement.textContent = 'Failed to get response from server.';
        }
    });

    function addMessageToChat(role, text) {
        const messageDiv = document.createElement('div');
        // Add classes for styling (e.g., .message.user or .message.model)
        messageDiv.classList.add('message', role);
        messageDiv.textContent = text;
        
        chatBox.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;

        return messageDiv; // Return the element so we can update it later
    }
});