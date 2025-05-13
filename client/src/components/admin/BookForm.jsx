import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
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
      getBookById(id);
    }
  }, [id, isEditMode, clearError, getBookById]);

  useEffect(() => {
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

    let newValue = value;
    if (name === "format") {
      newValue = parseInt(value, 10);
    } else if (type === "number") {
      newValue = value === "" ? "" : parseInt(value, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

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

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please upload a valid image file (JPG, PNG, GIF)",
      }));
      return;
    }

    if (formErrors.imageFile) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
    }

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

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      imageUrl: "",
      caption: "",
      displayOrder: formData.additionalImages.length + 1,
    }));

    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...newImages],
    }));

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

      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          imageFile: "Please upload a valid image file (JPG, PNG, GIF)",
        }));
        return;
      }

      if (formErrors.imageFile) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.imageFile;
          return newErrors;
        });
      }

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

      const newImages = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        imageUrl: "",
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
      return;
    }

    setSubmitting(true);

    try {
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

      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        description: formData.description,
        price: parseFloat(formData.price),
        format: formData.format,
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

      delete bookData.imageFile;
      delete bookData.imagePreview;

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

      newImages.splice(dragIndex, 1);
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
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
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
              } py-3 text-gray-900 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:outline-none ${
                formErrors[name]
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white"
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
              } py-3 text-gray-900 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:outline-none appearance-none bg-white ${
                formErrors[name]
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200"
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
              } py-3 text-gray-900 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:outline-none ${
                formErrors[name]
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
              placeholder={placeholder}
            />
          )}

          {isSelect && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
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
          <p className="text-red-500 text-sm mt-2">{formErrors[name]}</p>
        )}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-2">
      {renderFormField("title", "Title", "text", true, "Enter book title", [])}
      {renderFormField(
        "author",
        "Author",
        "text",
        true,
        "Enter author name",
        []
      )}
      {renderFormField("isbn", "ISBN", "text", true, "978-3-16-148410-0", [])}
      {renderFormField(
        "genre",
        "Genre",
        "text",
        true,
        "e.g. Fantasy, Mystery",
        []
      )}
      {renderFormField(
        "publisher",
        "Publisher",
        "text",
        true,
        "Publisher name",
        []
      )}
      {renderFormField(
        "description",
        "Description",
        "textarea",
        true,
        "Book description",
        []
      )}
    </div>
  );

  const renderDetailsInfo = () => {
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
        {renderFormField(
          "format",
          "Format",
          "select",
          false,
          "",
          formatOptions
        )}
        {renderFormField(
          "language",
          "Language",
          "select",
          false,
          "",
          languageOptions
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full border rounded-lg pl-8 pr-4 py-3 text-gray-900 transition-colors focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:outline-none ${
                formErrors.price
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
              placeholder="0.00"
            />
          </div>
          {formErrors.price && (
            <p className="text-red-500 text-sm mt-2">{formErrors.price}</p>
          )}
        </div>

        {renderFormField(
          "stockQuantity",
          "Stock Quantity",
          "number",
          false,
          "0",
          []
        )}
        {renderFormField(
          "publicationDate",
          "Publication Date",
          "date",
          false,
          "",
          []
        )}
      </div>
    );
  };

  const renderImagesSection = () => (
    <div className="space-y-8">
      {/* Main Image Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Main Cover Image{" "}
          {!isEditMode && <span className="text-red-500">*</span>}
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center relative transition-all ${
            isDragging ? "border-gray-900 bg-gray-50" : "border-gray-300"
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
            <div className="relative h-64 flex items-center justify-center">
              <img
                src={formData.imagePreview}
                alt="Book cover preview"
                className="max-h-full max-w-full object-contain rounded"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveMainImage();
                }}
                className="absolute top-4 right-4 bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
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
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-700 mb-2">
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-gray-500">JPG, PNG, GIF up to 10MB</p>
            </>
          )}
        </div>

        {formErrors.imageFile && (
          <p className="text-red-500 text-sm mt-2">{formErrors.imageFile}</p>
        )}
      </div>

      {/* Additional Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Additional Images
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-all ${
            isDragging ? "border-gray-900 bg-gray-50" : "border-gray-300"
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
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-700 mb-2">Drop additional images here</p>
          <p className="text-sm text-gray-500 mb-4">
            or click the button below to select files
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (additionalFileInputRef.current) {
                additionalFileInputRef.current.click();
              }
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Select Images
          </button>
        </div>

        {/* Display additional images */}
        {formData.additionalImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.additionalImages.map((img, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={handleImageDragOver}
                onDrop={(e) => handleImageDrop(e, index)}
              >
                <div className="aspect-w-3 aspect-h-2">
                  <img
                    src={img.preview || img.imageUrl}
                    alt={`Book image ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, "up")}
                      disabled={index === 0}
                      className={`p-2 bg-white rounded-lg shadow-sm ${
                        index === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                      className={`p-2 bg-white rounded-lg shadow-sm ${
                        index === formData.additionalImages.length - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                      className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="D9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded-md shadow">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
            <p className="text-gray-600">No additional images</p>
            <p className="text-sm text-gray-500 mt-1">
              Add images using the drop zone above
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isEditMode && isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-8 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditMode ? "Edit Book" : "Add New Book"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isEditMode
                  ? "Update the details of this book"
                  : "Fill in the information to add a new book"}
              </p>
            </div>

            {error && (
              <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              {/* Tabs */}
              <div className="mb-8 border-b border-gray-200">
                <div className="flex -mb-px space-x-6">
                  {["basic", "details", "images"].map((tab) => {
                    const isActive = activeTab === tab;
                    const tabTexts = {
                      basic: "Basic Information",
                      details: "Details",
                      images: "Images",
                    };

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          isActive
                            ? "border-gray-900 text-gray-900"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {tabTexts[tab]}
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
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <Link
                  to={isEditMode ? `/books/${id}` : "/books"}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default BookForm;
