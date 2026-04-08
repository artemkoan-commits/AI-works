// Image upload functionality
const input = document.getElementById('imageInput');
const gallery = document.getElementById('galleryGrid');

input.addEventListener('change', function () {
  const files = input.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Only allow images
    if (!file.type.startsWith('image/')) continue;

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      gallery.appendChild(img);
    };

    reader.readAsDataURL(file);
  }
});
