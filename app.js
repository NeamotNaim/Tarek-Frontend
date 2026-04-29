// Dynamically set API URL based on environment
// For production, change the second URL to your Azure backend App Service URL
const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000/api/images"
  : "https://tarekpix-backend-api-c3egh3hbbrghc2dp.polandcentral-01.azurewebsites.net/api/images";

let likes = {};

async function loadImages() {
  try {
    const res = await fetch(API);
    const images = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    images.forEach((img) => {
      if (!likes[img.id]) likes[img.id] = 0;

      const imageSrc = img.imageUrl || img.url;

      const div = document.createElement("div");
      div.className = "card";

      // Escape quotes for inline JS parameters
      const safeTitle = img.title ? img.title.replace(/'/g, "\\'") : "";
      const safeCategory = img.category ? img.category.replace(/'/g, "\\'") : "";

      div.innerHTML = `
        <img src="${imageSrc}" alt="${img.title}" onclick="openLightbox('${imageSrc}')" />
        <div class="like" onclick="likeImage('${img.id}', event)">❤️ ${likes[img.id]}</div>
        <div class="overlay">
          <h3>${img.title}</h3>
          <p>${img.category}</p>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button onclick="editImage('${img.id}', '${safeTitle}', '${safeCategory}')" style="background: linear-gradient(90deg, #10b981, #059669);">Edit</button>
              <button onclick="deleteImage('${img.id}')" style="background: linear-gradient(90deg, #ef4444, #dc2626);">Delete</button>
          </div>
        </div>
      `;

      gallery.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading images:", error);
  }
}

async function uploadImage() {
  try {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const image = document.getElementById("image");

    if (!title || !category || !image.files[0]) {
      alert("Please fill all fields and choose an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image.files[0]);

    const res = await fetch(API, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("image").value = "";

    loadImages();
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Upload failed. Check backend and console.");
  }
}

async function editImage(id, currentTitle, currentCategory) {
  const newTitle = prompt("Enter new title:", currentTitle);
  const newCategory = prompt("Enter new category:", currentCategory);
  
  if (newTitle !== null && newCategory !== null) {
      try {
          const res = await fetch(`${API}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: newTitle, category: newCategory })
          });
          if (res.ok) {
            loadImages();
          } else {
            alert("Failed to update image.");
          }
      } catch (error) {
          console.error("Error updating image:", error);
      }
  }
}

async function deleteImage(id) {
  try {
    if(confirm("Are you sure you want to delete this image?")) {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        loadImages();
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

function likeImage(id, e) {
  e.stopPropagation();
  likes[id] = (likes[id] || 0) + 1;
  loadImages();
}

function openLightbox(url) {
  document.getElementById("lightbox").style.display = "flex";
  document.getElementById("lightbox-img").src = url;
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

function toggleMode() {
  document.body.classList.toggle("light-mode");
}

loadImages();