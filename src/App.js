import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './App.css';

function App() {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 30,
    height: 30,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const imageRef = useRef(null);

  // Handle file selection and load the image as base64
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSrc(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Set the image reference after it's loaded
  const onImageLoaded = (image) => {
    imageRef.current = image;
    console.log("Image loaded, imageRef.current is set.");
  };

  // Call this function when cropping is complete
  const onCropComplete = (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      makeClientCrop(crop);
    }
  };

  // Update the crop state as the user adjusts the crop
  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  console.log('croppedImageUrl', imageRef.current)

  // Helper function to crop the image using a canvas
  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    console.log("Canvas width:", canvas.width, "Canvas height:", canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl); // Return the cropped image URL
      }, 'image/jpeg', 1);
    });
  };

  // Generate the cropped image and return a URL for it
  const makeClientCrop = async (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(imageRef.current, crop, 'cropped.jpeg');
      setCroppedImageUrl(croppedImageUrl); // Set the cropped image URL to state
    }
  };

  // Function to handle download of cropped image
  const onDownloadCrop = () => {
    if (croppedImageUrl) {
      const link = document.createElement('a');
      link.href = croppedImageUrl;
      link.download = 'cropped_image.jpeg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="App">
      <div>
        <input type="file" accept="image/*" onChange={onSelectFile} />
      </div>
      {src && (
        <ReactCrop
          crop={crop}
          ruleOfThirds
          onImageLoaded={onImageLoaded}
          onComplete={onCropComplete}
          onChange={onCropChange}
        >
          <img src={src} ref={imageRef} alt="Source" style={{ maxHeight: '500px', maxWidth: '500px' }} />
        </ReactCrop>
      )}

      {croppedImageUrl && (
        <div style={{ marginTop: "200px" }}>
          <h3>Cropped Image:</h3>
          <img alt="Crop" style={{ maxWidth: '500px' }} src={croppedImageUrl} />
          <br />
          <button onClick={onDownloadCrop} style={{ marginTop: "20px", padding: "10px", backgroundColor: "navajowhite", color: "black", borderRadius: "8px", border: 'none', fontSize: "15px", fontWeight: "700" }}>
            Save Cropped Image
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
