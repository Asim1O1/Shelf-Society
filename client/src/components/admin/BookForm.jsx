import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useBookStore from "../../stores/useBookStore";
import showToast from "../../utils/ToastUtility";

const BookForm = () => {
  const { id } = useParams();

  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);

  const {
    currentBook,
    isLoading,
    error,
    getBookById,
    createBook,
    updateBook,
    clearError,
    // Assuming this function exists in your store
  } = useBookStore();

  const initialFormState = {
    title: "",
    author: "",
    isbn: "",
    description: "",
    price: "",
    format: "Paperback",
    genre: "",
    language: "English",
    stockQuantity: 1,
    publicationDate: new Date().toISOString().split("T")[0],
    publisher: "",
    imageUrl: "",
    imageFile: null,
    imagePreview: "",
    additionalImages: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    clearError();

    if (isEditMode) {
      // Fetch book data if in edit mode
      getBookById(id);
    }
  }, [id, isEditMode, clearError, getBookById]);

  useEffect(() => {
    // Populate form with book data once it's loaded
    if (isEditMode && currentBook) {
      setFormData({
        title: currentBook.title,
        author: currentBook.author,
        isbn: currentBook.isbn,
        description: currentBook.description,
        price: currentBook.price.toString(),
        format: currentBook.format,
        genre: currentBook.genre,
        language: currentBook.language,
        stockQuantity: currentBook.stockQuantity,
        publicationDate: new Date(currentBook.publicationDate)
          .toISOString()
          .split("T")[0],
        publisher: currentBook.publisher,
        imageUrl: currentBook.imageUrl,
        imagePreview: currentBook.imageUrl,
        imageFile: null,
        additionalImages:
          currentBook.additionalImages?.map((img) => ({
            ...img,
            file: null,
            preview: img.imageUrl,
          })) || [],
      });
    }
  }, [currentBook, isEditMode]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.author.trim()) errors.author = "Author is required";
    if (!formData.isbn.trim()) errors.isbn = "ISBN is required";
    if (!formData.description.trim())
      errors.description = "Description is required";

    if (!formData.price.trim()) {
      errors.price = "Price is required";
    } else if (
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) < 0
    ) {
      errors.price = "Price must be a positive number";
    }

    if (!formData.genre.trim()) errors.genre = "Genre is required";
    if (!formData.publisher.trim()) errors.publisher = "Publisher is required";

    if (
      isNaN(parseInt(formData.stockQuantity)) ||
      parseInt(formData.stockQuantity) < 0
    ) {
      errors.stockQuantity = "Stock quantity must be a positive number";
    }

    if (!isEditMode && !formData.imageFile && !formData.imageUrl) {
      errors.imageFile = "A main cover image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert specific fields to the correct data type
    let newValue = value;
    if (name === "format") {
      newValue = parseInt(value, 10);
    } else if (type === "number") {
      newValue = value === "" ? "" : parseInt(value, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error for this field when user changes it
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please upload a valid image file (JPG, PNG, GIF)",
      }));
      return;
    }

    // Clear any previous error
    if (formErrors.imageFile) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
    }

    // Create a preview
    const preview = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: preview,
    }));
  };

  const handleAdditionalFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        `${invalidFiles.length} file(s) were not added because they are not valid image types.`
      );
    }

    const validFiles = files.filter((file) => validTypes.includes(file.type));

    // Create new additional images with previews
    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      imageUrl: "", // Will be populated after upload
      caption: "",
      displayOrder: formData.additionalImages.length + 1,
    }));

    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...newImages],
    }));

    // Reset the file input so the same file can be selected again if needed
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          imageFile: "Please upload a valid image file (JPG, PNG, GIF)",
        }));
        return;
      }

      // Clear any previous error
      if (formErrors.imageFile) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.imageFile;
          return newErrors;
        });
      }

      // Create a preview
      const preview = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: preview,
      }));
    }
  };

  const handleAdditionalImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      // Validate file types
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      const invalidFiles = files.filter(
        (file) => !validTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        alert(
          `${invalidFiles.length} file(s) were not added because they are not valid image types.`
        );
      }

      const validFiles = files.filter((file) => validTypes.includes(file.type));

      // Create new additional images with previews
      const newImages = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        imageUrl: "", // Will be populated after upload
        caption: "",
        displayOrder: formData.additionalImages.length + 1,
      }));

      setFormData((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, ...newImages],
      }));
    }
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Your existing validation code
      return;
    }

    setSubmitting(true);

    try {
      // Process main image
      let mainImageUrl = formData.imageUrl;

      if (formData.imageFile) {
        try {
          const imageBase64 = await fileToBase64(formData.imageFile);
          mainImageUrl = imageBase64;
        } catch (error) {
          console.error("Error processing main image:", error);
          setFormErrors((prev) => ({
            ...prev,
            imageFile: "Failed to process main image. Please try again.",
          }));
          setSubmitting(false);
          return;
        }
      }

      // Process additional images - but we need to define fileToBase64 for additional images too
      const additionalImagesWithUrls = await Promise.all(
        formData.additionalImages.map(async (img, index) => {
          if (img.imageUrl && !img.file) {
            return {
              ...img,
              displayOrder: index + 1,
            };
          }

          if (img.file) {
            try {
              const imageBase64 = await fileToBase64(img.file);
              return {
                ...img,
                imageUrl: imageBase64,
                displayOrder: index + 1,
              };
            } catch (error) {
              console.error(
                `Error processing additional image ${index + 1}:`,
                error
              );
              return {
                ...img,
                imageUrl: "",
                displayOrder: index + 1,
              };
            }
          }

          return img;
        })
      );

      // Prepare the book data
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        description: formData.description,
        price: parseFloat(formData.price),
        format: formData.format, // Make sure this matches exactly with the enum
        genre: formData.genre,
        language: formData.language,
        stockQuantity: parseInt(formData.stockQuantity),
        publicationDate: formData.publicationDate,
        publisher: formData.publisher,
        imageUrl: mainImageUrl,
        additionalImages: additionalImagesWithUrls
          .filter((img) => img.imageUrl)
          .map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            caption: img.caption,
            displayOrder: img.displayOrder,
          })),
      };

      // Remove fields that shouldn't be sent to the API
      delete bookData.imageFile;
      delete bookData.imagePreview;

      // Wrap in dto object
      const requestPayload = bookData;

      let result;

      if (isEditMode) {
        result = await updateBook(id, requestPayload);
      } else {
        result = await createBook(requestPayload);
      }

      if (result.success) {
        showToast.success("Book saved successfully!");
      }
    } catch (error) {
      showToast.error("Failed to save book. Please try again.");
      console.error("Error saving book:", error);
      setFormErrors((prev) => ({
        ...prev,
        form: "Failed to save book. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.additionalImages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;

    setFormData((prev) => {
      const newImages = [...prev.additionalImages];
      const temp = newImages[index];
      newImages[index] = newImages[newIndex];
      newImages[newIndex] = temp;
      return { ...prev, additionalImages: newImages };
    });
  };

  const handleImageDragStart = (e, index) => {
    e.dataTransfer.setData("imageIndex", index.toString());
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
  };

  const handleImageDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("imageIndex"));

    if (dragIndex === dropIndex) return;

    setFormData((prev) => {
      const newImages = [...prev.additionalImages];
      const draggedImage = newImages[dragIndex];

      // Remove the dragged item
      newImages.splice(dragIndex, 1);

      // Insert at the new position
      newImages.splice(dropIndex, 0, draggedImage);

      return { ...prev, additionalImages: newImages };
    });
  };

  const handleRemoveMainImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }

    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: "",
      imagePreview: "",
    }));
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderFormField = (
    name,
    label,
    type = "text",
    required = false,
    placeholder = "",
    options = [],
    icon = null
  ) => {
    const isTextarea = type === "textarea";
    const isSelect = type === "select";

    return (
      <div className="mb-5">
        <label className="block text-slate-700 font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}

          {isTextarea ? (
            <textarea
              name={name}
              value={formData[name]}
              onChange={handleChange}
              rows="4"
              className={`w-full border rounded-lg ${
                icon ? "pl-10" : "px-4"
              } py-3 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none ${
                formErrors[name]
                  ? "border-red-500 bg-red-50"
                  : "border-slate-300"
              }`}
              placeholder={placeholder}
            ></textarea>
          ) : isSelect ? (
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={`w-full border rounded-lg ${
                icon ? "pl-10" : "px-4"
              } py-3 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none bg-white ${
                formErrors[name]
                  ? "border-red-500 bg-red-50"
                  : "border-slate-300"
              }`}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              min={type === "number" ? "0" : undefined}
              className={`w-full border rounded-lg ${
                icon ? "pl-10" : "px-4"
              } py-3 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none ${
                formErrors[name]
                  ? "border-red-500 bg-red-50"
                  : "border-slate-300"
              }`}
              placeholder={placeholder}
            />
          )}

          {isSelect && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {formErrors[name] && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {formErrors[name]}
          </p>
        )}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-slate-800 mb-5">
        Basic Information
      </h2>

      {renderFormField(
        "title",
        "Title",
        "text",
        true,
        "Enter book title",
        [],
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      )}

      {renderFormField(
        "author",
        "Author",
        "text",
        true,
        "Enter author name",
        [],
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {renderFormField(
        "isbn",
        "ISBN",
        "text",
        true,
        "e.g. 978-3-16-148410-0",
        [],
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {renderFormField(
        "genre",
        "Genre",
        "text",
        true,
        "e.g. Fantasy, Mystery, Romance",
        [],
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      )}

      {renderFormField(
        "publisher",
        "Publisher",
        "text",
        true,
        "Enter publisher name",
        [],
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {renderFormField(
        "description",
        "Description",
        "textarea",
        true,
        "Enter book description",
        [],
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  const renderDetailsInfo = () => {
    // Modify your format options to match the enum exactly
    const formatOptions = [
      { value: 0, label: "Paperback" },
      { value: 1, label: "Hardcover" },
      { value: 2, label: "Signed" },
      { value: 3, label: "Limited Edition" },
      { value: 4, label: "First Edition" },
      { value: 5, label: "Collector's Edition" },
      { value: 6, label: "Author's Edition" },
      { value: 7, label: "Deluxe Edition" },
      { value: 8, label: "E-Book" },
    ];

    const languageOptions = [
      { value: "English", label: "English" },
      { value: "Spanish", label: "Spanish" },
      { value: "French", label: "French" },
      { value: "German", label: "German" },
      { value: "Italian", label: "Italian" },
      { value: "Japanese", label: "Japanese" },
      { value: "Chinese", label: "Chinese" },
      { value: "Other", label: "Other" },
    ];

    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">
          Detailed Information
        </h2>

        {renderFormField(
          "format",
          "Format",
          "select",
          false,
          "",
          formatOptions,
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        )}

        {renderFormField(
          "language",
          "Language",
          "select",
          false,
          "",
          languageOptions,
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <div className="mb-5">
          <label className="block text-slate-700 font-medium mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full border rounded-lg pl-10 py-3 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none ${
                formErrors.price
                  ? "border-red-500 bg-red-50"
                  : "border-slate-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {formErrors.price && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {formErrors.price}
            </p>
          )}
        </div>

        {renderFormField(
          "stockQuantity",
          "Stock Quantity",
          "number",
          false,
          "0",
          [],
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {renderFormField(
          "publicationDate",
          "Publication Date",
          "date",
          false,
          "",
          [],
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  };

  const renderImagesSection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-5">Book Images</h2>

      {/* Main Image Upload */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          Main Cover Image{" "}
          {!isEditMode && <span className="text-red-500 ml-1">*</span>}
        </h3>

        <div className="flex flex-col md:flex-row md:space-x-4">
          <div
            className={`flex-grow mb-4 md:mb-0 border-2 border-dashed rounded-lg p-4 text-center relative ${
              isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300"
            } ${formErrors.imageFile ? "border-red-500 bg-red-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/jpg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {formData.imagePreview ? (
              <div className="relative h-48 flex items-center justify-center">
                <img
                  src={formData.imagePreview}
                  alt="Book cover preview"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveMainImage();
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-slate-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-slate-700 mb-1 font-medium">
                  Drag and drop your book cover image here
                </p>
                <p className="text-slate-500 text-sm mb-3">
                  or click to browse files
                </p>
                <p className="text-xs text-slate-400">
                  Supports: JPG, PNG, GIF
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Select Image
                  </button>
                </div>
              </>
            )}
          </div>

          {uploadingImage && (
            <div className="flex-shrink-0 w-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>

        {formErrors.imageFile && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {formErrors.imageFile}
          </p>
        )}
      </div>

      {/* Additional Images */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Additional Images
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center mb-4 ${
            isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleAdditionalImageDrop}
        >
          <input
            type="file"
            ref={additionalFileInputRef}
            onChange={handleAdditionalFileChange}
            accept="image/jpeg,image/png,image/gif,image/jpg"
            className="hidden"
            multiple
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-slate-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-slate-700 mb-1 font-medium">
            Drag and drop additional book images here
          </p>
          <p className="text-slate-500 text-sm mb-3">
            or click the button below to browse files
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supports: JPG, PNG, GIF (you can select multiple files)
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (additionalFileInputRef.current) {
                additionalFileInputRef.current.click();
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 inline-block mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Images
          </button>
        </div>

        {/* Display additional images */}
        {formData.additionalImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.additionalImages.map((img, index) => (
              <div
                key={index}
                className="flex items-center border border-slate-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={handleImageDragOver}
                onDrop={(e) => handleImageDrop(e, index)}
              >
                <div className="w-16 h-16 border border-slate-200 rounded-md overflow-hidden flex items-center justify-center bg-slate-50 mr-3 flex-shrink-0">
                  <img
                    src={img.preview || img.imageUrl}
                    alt={`Book image ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-book.jpg";
                      e.target.alt = "Invalid image preview";
                    }}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-medium text-slate-700 flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded mr-2">
                      {index + 1}
                    </span>
                    <span className="truncate">Image {index + 1}</span>
                  </div>
                  <div className="text-sm text-slate-500 truncate">
                    {img.file ? img.file.name : "Existing image"}
                  </div>
                </div>
                <div className="flex flex-col space-y-1 ml-2">
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, "up")}
                    disabled={index === 0}
                    className={`p-1 rounded ${
                      index === 0
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                    title="Move up"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, "down")}
                    disabled={index === formData.additionalImages.length - 1}
                    className={`p-1 rounded ${
                      index === formData.additionalImages.length - 1
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                    title="Move down"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-slate-200 rounded-lg bg-slate-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto text-slate-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-slate-600 mb-1">
              No additional images added yet
            </p>
            <p className="text-sm text-slate-500">
              Add images using the drag & drop area above
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-t-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-1">
          {isEditMode ? "Edit Book Details" : "Add New Book"}
        </h1>
        <p className="text-indigo-100">
          {isEditMode
            ? "Update information for this book in your inventory"
            : "Enter the details to add a new book to your store"}
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-b-xl">
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">An error occurred</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tabs */}
          <div className="mb-8 border-b border-slate-200">
            <div className="flex -mb-px">
              {["basic", "details", "images"].map((tab) => {
                const isActive = activeTab === tab;
                const tabTexts = {
                  basic: "Basic Information",
                  details: "Details",
                  images: "Images",
                };

                const tabIcons = {
                  basic: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  ),
                  details: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  ),
                  images: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ),
                };

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                      isActive
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {tabIcons[tab]}
                    {tabTexts[tab]}

                    {/* Show error indicator if there are errors in this tab */}
                    {(tab === "basic" &&
                      Object.keys(formErrors).some((key) =>
                        [
                          "title",
                          "author",
                          "isbn",
                          "description",
                          "genre",
                          "publisher",
                        ].includes(key)
                      )) ||
                    (tab === "details" &&
                      Object.keys(formErrors).some((key) =>
                        ["price", "stockQuantity"].includes(key)
                      )) ||
                    (tab === "images" &&
                      Object.keys(formErrors).some((key) =>
                        ["imageFile"].includes(key)
                      )) ? (
                      <span className="ml-2 flex h-2 w-2 bg-red-500 rounded-full"></span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="mb-8">
            {activeTab === "basic" && renderBasicInfo()}
            {activeTab === "details" && renderDetailsInfo()}
            {activeTab === "images" && renderImagesSection()}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6">
            <Link
              to={isEditMode ? `/books/${id}` : "/books"}
              className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : isEditMode ? (
                "Update Book"
              ) : (
                "Create Book"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
