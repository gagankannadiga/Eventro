document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('userInput');
  const imageUpload = document.getElementById('imageUpload');

  const appendMessage = (text, sender, imgUrl, fileDownload) => {
    const div = document.createElement('div');
    div.classList.add('message', sender);

    const formattedText = text.replace(/\n/g, '<br><br>');

    div.innerHTML = sender === 'user'
      ? `<strong>You:</strong><br>${formattedText}`
      : `<strong>EventroBot:</strong><br>${formattedText}`;

    if (imgUrl) {
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = "Generated Image";
      img.style.maxWidth = '100%';
      img.style.marginTop = '10px';
      div.appendChild(img);
    }

    if (fileDownload) {
      const a = document.createElement('a');
      a.href = fileDownload;
      a.textContent = "📄 Download Document";
      a.classList.add('download-link');
      a.download = '';
      a.style.display = 'block';
      a.style.marginTop = '8px';
      div.appendChild(a);
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const appendLoading = () => {
    const div = document.createElement('div');
    div.classList.add('message', 'ai');
    div.id = 'loading-message';
    div.innerHTML = `<strong>EventroBot:</strong><br>⏳ Analyzing your request...`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const removeLoading = () => {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) chatBox.removeChild(loadingDiv);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    const imageFile = imageUpload.files[0];
    if (!text && !imageFile) return;

    appendMessage(text || '[Image uploaded]', 'user');
    appendLoading();

    const formData = new FormData();
    formData.append('message', text || '[Image]');
    if (imageFile) formData.append('image', imageFile);

    userInput.value = '';
    imageUpload.value = '';

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      removeLoading();

      appendMessage(json.text || '⚠️ No response from EventroBot.', 'ai', json.image_url, json.docx_url);
    } catch (err) {
      removeLoading();
      appendMessage("⚠️ Something went wrong", 'ai');
      console.error(err);
    }
  });
});
