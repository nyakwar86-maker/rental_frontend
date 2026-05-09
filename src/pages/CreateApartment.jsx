// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { apartmentService } from '../services/apartment.service';
// import { imageService } from '../services/image.service';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import {
//   FiHome,
//   FiMapPin,
//   FiDollarSign,
//   FiLayers,
//   FiDroplet,
//   FiWind,
//   FiWifi,
//   FiPackage,
//   FiLock,
//   FiCheck,
//   FiX,
//   FiUpload,
//   FiTrash2,
//   FiArrowLeft,
//   FiArrowRight,
//   FiImage,
//   FiArrowUp
// } from 'react-icons/fi';

// const CreateApartment = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [step, setStep] = useState(1); // 1: Basic Info, 2: Upload Images
//   const [loading, setLoading] = useState(false);
//   const [uploadingImages, setUploadingImages] = useState(false);
//   const [apartmentId, setApartmentId] = useState(null);
//   const [images, setImages] = useState([]);
//   const fileInputRef = useRef(null);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     address: '',
//     city: '',
//     neighborhood: '',
//     rent_amount: '',
//     security_deposit: '',
//     service_fee: '',
//     bedrooms: '',
//     bathrooms: '',
//     square_feet: '',
//     utilities_included: false,
//     amenities: [],
//     status: 'available'
//   });

//   const amenityOptions = [
//     { id: 'wifi', label: 'WiFi', icon: <FiWifi /> },
//     { id: 'parking', label: 'Parking', icon: <FiPackage /> },
//     { id: 'pool', label: 'Swimming Pool', icon: <FiDroplet /> },
//     { id: 'gym', label: 'Gym', icon: <FiPackage /> },
//     { id: 'ac', label: 'Air Conditioning', icon: <FiWind /> },
//     { id: 'heating', label: 'Heating', icon: <FiWind /> },
//     { id: 'security', label: 'Security System', icon: <FiLock /> },
//     { id: 'laundry', label: 'Laundry', icon: <FiDroplet /> },
//     { id: 'furnished', label: 'Furnished', icon: <FiHome /> },
//     { id: 'balcony', label: 'Balcony', icon: <FiHome /> },
//   ];

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleAmenityToggle = (amenity) => {
//     setFormData(prev => ({
//       ...prev,
//       amenities: prev.amenities.includes(amenity)
//         ? prev.amenities.filter(a => a !== amenity)
//         : [...prev.amenities, amenity]
//     }));
//   };

//   const handleImageUpload = async (e) => {
//     const files = Array.from(e.target.files);

//     if (files.length === 0) return;

//     // Validate files
//     const validFiles = files.filter(file => {
//       const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//       const maxSize = 10 * 1024 * 1024; // 10MB

//       if (!validTypes.includes(file.type)) {
//         toast.error(`${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
//         return false;
//       }

//       if (file.size > maxSize) {
//         toast.error(`${file.name}: File too large. Maximum size is 10MB.`);
//         return false;
//       }

//       return true;
//     });

//     if (validFiles.length === 0) return;

//     // Check total image count
//     if (images.length + validFiles.length > 10) {
//       toast.error(`Cannot upload more than 10 images. You have ${images.length} images already.`);
//       return;
//     }

//     // Create image objects with previews
//     const newImages = validFiles.map(file => ({
//       id: `temp-${Date.now()}-${Math.random()}`,
//       file,
//       preview: URL.createObjectURL(file),
//       isNew: true,
//     }));

//     setImages(prev => {
//       const updated = [...prev, ...newImages];
//       // Set first image as primary if no primary exists
//       if (prev.length === 0 && newImages.length > 0) {
//         updated[0].isPrimary = true;
//       }
//       return updated;
//     });

//     // Clear file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const removeImage = (id) => {
//     setImages(prev => {
//       const newImages = prev.filter(img => img.id !== id);
//       const removed = prev.find(img => img.id === id);

//       // Revoke object URL
//       if (removed?.preview && removed.isNew) {
//         URL.revokeObjectURL(removed.preview);
//       }

//       // If removing primary image and there are other images, set first as primary
//       if (removed?.isPrimary && newImages.length > 0) {
//         newImages[0].isPrimary = true;
//       }

//       return newImages;
//     });
//   };

//   const setPrimaryImage = (id) => {
//     setImages(prev => prev.map(img => ({
//       ...img,
//       isPrimary: img.id === id
//     })));
//   };

//   const moveImageToFirst = (id) => {
//     setImages(prev => {
//       const imageToMove = prev.find(img => img.id === id);
//       const otherImages = prev.filter(img => img.id !== id);
//       const newImages = [imageToMove, ...otherImages];

//       // Update primary flags
//       return newImages.map((img, index) => ({
//         ...img,
//         isPrimary: index === 0
//       }));
//     });
//   };

//   const handleCreateApartment = async (e) => {
//     e.preventDefault();

//     if (!user || user.role !== 'landlord') {
//       toast.error('Only landlords can create listings');
//       return;
//     }

//     // Basic validation
//     if (!formData.title || !formData.address || !formData.city || !formData.rent_amount) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     try {
//       setLoading(true);

//       // Prepare data for API
//       const apartmentData = {
//         ...formData,
//         amenities: formData.amenities
//       };

//       // Create apartment
//       const result = await apartmentService.createApartment(apartmentData);
//       const newApartmentId = result.data?.apartment?.id || result.apartment?.id;

//       if (!newApartmentId) {
//         throw new Error('Failed to get apartment ID');
//       }

//       setApartmentId(newApartmentId);

//       // If there are images, go to upload step
//       if (images.length > 0) {
//         setStep(2);
//         toast.success('Apartment created! Now upload your images.');
//       } else {
//         toast.success('Apartment listed successfully!');
//         navigate(`/apartments/${newApartmentId}`);
//       }
//     } catch (error) {
//       console.error('Error creating apartment:', error);
//       toast.error(error.response?.data?.error || 'Failed to create listing');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUploadImages = async () => {
//     if (!apartmentId) {
//       toast.error('No apartment found. Please go back and create the apartment first.');
//       return;
//     }

//     if (images.length === 0) {
//       toast.success('Apartment listed successfully!');
//       navigate(`/apartments/${apartmentId}`);
//       return;
//     }

//     try {
//       setUploadingImages(true);

//       // Get only new image files
//       const newImages = images.filter(img => img.isNew).map(img => img.file);

//       if (newImages.length > 0) {
//         // Upload images
//         await imageService.uploadImages(apartmentId, newImages);
//         toast.success('Images uploaded successfully!');
//       }

//       navigate(`/apartments/${apartmentId}`);
//     } catch (error) {
//       console.error('Error uploading images:', error);
//       toast.error(error.response?.data?.error || 'Failed to upload images');
//     } finally {
//       setUploadingImages(false);
//     }
//   };

//   const handleSkipImages = () => {
//     toast.success('Apartment listed successfully! You can add images later.');
//     navigate(apartmentId ? `/apartments/${apartmentId}` : '/apartments');
//   };

//   // Clean up preview URLs
//   useEffect(() => {
//     return () => {
//       images.forEach(image => {
//         if (image.preview && image.isNew) {
//           URL.revokeObjectURL(image.preview);
//         }
//       });
//     };
//   }, [images]);

//   if (user?.role !== 'landlord') {
//     return (
//       <div className="max-w-4xl mx-auto px-4 py-12 text-center">
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <FiHome className="text-6xl text-gray-300 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
//           <p className="text-gray-600 mb-6">
//             Only landlords can create apartment listings. Please switch to a landlord account.
//           </p>
//           <button
//             onClick={() => navigate('/profile')}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
//           >
//             Go to Profile
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       {/* Progress Steps */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-3xl font-bold text-gray-900">
//             {step === 1 ? 'List Your Property' : 'Upload Property Photos'}
//           </h1>
//           <div className="flex items-center space-x-2 text-sm text-gray-600">
//             <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
//               Step 1: Basic Info
//             </span>
//             <FiArrowRight className="text-gray-400" />
//             <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
//               Step 2: Upload Photos
//             </span>
//           </div>
//         </div>

//         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//           <div 
//             className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
//             style={{ width: step === 1 ? '50%' : '100%' }}
//           ></div>
//         </div>
//       </div>

//       {step === 1 ? (
//         /* Step 1: Basic Information Form */
//         <form onSubmit={handleCreateApartment} className="space-y-8">
//           {/* Basic Information Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-center space-x-3 mb-6">
//               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                 <FiHome className="text-2xl text-blue-600" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
//                 <p className="text-gray-600">Tell us about your property</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Property Title *
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., Modern 2BR Apartment in Downtown"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Monthly Rent ($) *
//                 </label>
//                 <div className="relative">
//                   <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="number"
//                     name="rent_amount"
//                     value={formData.rent_amount}
//                     onChange={handleChange}
//                     required
//                     min="0"
//                     step="0.01"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="1500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Bedrooms *
//                 </label>
//                 <select
//                   name="bedrooms"
//                   value={formData.bedrooms}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select</option>
//                   <option value="0">Studio</option>
//                   <option value="1">1</option>
//                   <option value="2">2</option>
//                   <option value="3">3</option>
//                   <option value="4">4</option>
//                   <option value="5">5+</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Bathrooms *
//                 </label>
//                 <select
//                   name="bathrooms"
//                   value={formData.bathrooms}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select</option>
//                   <option value="1">1</option>
//                   <option value="1.5">1.5</option>
//                   <option value="2">2</option>
//                   <option value="2.5">2.5</option>
//                   <option value="3">3</option>
//                   <option value="3+">3+</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Square Feet
//                 </label>
//                 <div className="relative">
//                   <FiLayers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="number"
//                     name="square_feet"
//                     value={formData.square_feet}
//                     onChange={handleChange}
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="e.g., 850"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status *
//                 </label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="available">Available</option>
//                   <option value="occupied">Occupied</option>
//                   <option value="unavailable">Unavailable</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Location Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-center space-x-3 mb-6">
//               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                 <FiMapPin className="text-2xl text-green-600" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
//                 <p className="text-gray-600">Where is your property located?</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Address *
//                 </label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., 123 Main Street"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   City *
//                 </label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., New York"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Neighborhood
//                 </label>
//                 <input
//                   type="text"
//                   name="neighborhood"
//                   value={formData.neighborhood}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., Downtown"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Description Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="mb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
//               <p className="text-gray-600">Describe your property in detail</p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Property Description *
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 rows={6}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 placeholder="Describe the property, nearby amenities, public transportation, etc."
//               />
//             </div>
//           </div>

//           {/* Amenities Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="mb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Amenities</h2>
//               <p className="text-gray-600">Select all amenities included with your property</p>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//               {amenityOptions.map((amenity) => (
//                 <button
//                   key={amenity.id}
//                   type="button"
//                   onClick={() => handleAmenityToggle(amenity.id)}
//                   className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
//                     formData.amenities.includes(amenity.id)
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-blue-300'
//                   }`}
//                 >
//                   <div className={`text-2xl ${
//                     formData.amenities.includes(amenity.id) ? 'text-blue-600' : 'text-gray-400'
//                   }`}>
//                     {amenity.icon}
//                   </div>
//                   <span className={`text-sm font-medium ${
//                     formData.amenities.includes(amenity.id) ? 'text-blue-700' : 'text-gray-700'
//                   }`}>
//                     {amenity.label}
//                   </span>
//                   {formData.amenities.includes(amenity.id) && (
//                     <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                       <FiCheck className="text-white text-xs" />
//                     </div>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Fees & Utilities Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="mb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Fees & Utilities</h2>
//               <p className="text-gray-600">Additional costs and utility information</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Security Deposit ($)
//                 </label>
//                 <div className="relative">
//                   <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="number"
//                     name="security_deposit"
//                     value={formData.security_deposit}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="e.g., 1500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Service Fee ($/month)
//                 </label>
//                 <div className="relative">
//                   <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="number"
//                     name="service_fee"
//                     value={formData.service_fee}
//                     onChange={handleChange}
//                     min="0"
//                     step="0.01"
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="e.g., 50"
//                   />
//                 </div>
//               </div>

//               <div className="md:col-span-2">
//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="checkbox"
//                     id="utilities_included"
//                     name="utilities_included"
//                     checked={formData.utilities_included}
//                     onChange={handleChange}
//                     className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                   <label htmlFor="utilities_included" className="text-gray-700">
//                     Utilities (water, electricity, gas) are included in the rent
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-between pt-8 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={() => navigate('/apartments')}
//               className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   <span>Creating Listing...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Continue to Photos</span>
//                   <FiArrowRight />
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       ) : (
//         /* Step 2: Image Upload */
//         <div className="space-y-8">
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                   <FiImage className="text-2xl text-green-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-gray-900">Upload Property Photos</h2>
//                   <p className="text-gray-600">
//                     Add images to make your listing stand out ({images.length}/10)
//                   </p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setStep(1)}
//                 className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
//               >
//                 <FiArrowLeft />
//                 <span>Back to Details</span>
//               </button>
//             </div>

//             {/* Upload Area */}
//             <div
//               onClick={() => !uploadingImages && images.length < 10 && fileInputRef.current?.click()}
//               className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
//                 uploadingImages
//                   ? 'border-blue-300 bg-blue-50'
//                   : images.length >= 10
//                   ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
//                   : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
//               }`}
//             >
//               <FiUpload className={`text-4xl mx-auto mb-4 ${
//                 uploadingImages ? 'text-blue-400 animate-bounce' : 'text-gray-400'
//               }`} />

//               {images.length >= 10 ? (
//                 <>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Maximum Images Reached</h3>
//                   <p className="text-gray-600">You can upload up to 10 images per listing</p>
//                 </>
//               ) : uploadingImages ? (
//                 <>
//                   <h3 className="text-lg font-medium text-blue-600 mb-2">Processing Images...</h3>
//                   <p className="text-blue-500">Please wait while we process your images</p>
//                 </>
//               ) : (
//                 <>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Property Photos</h3>
//                   <p className="text-gray-600 mb-4">
//                     Click to browse images. First image will be the main photo.
//                   </p>
//                   <button
//                     type="button"
//                     className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       fileInputRef.current?.click();
//                     }}
//                   >
//                     Select Images
//                   </button>
//                   <p className="text-sm text-gray-500 mt-4">
//                     JPEG, PNG, GIF, WebP up to 10MB each
//                   </p>
//                 </>
//               )}

//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/jpeg,image/png,image/gif,image/webp"
//                 multiple
//                 onChange={handleImageUpload}
//                 className="hidden"
//                 disabled={images.length >= 10 || uploadingImages}
//               />
//             </div>

//             {/* Image Previews */}
//             {images.length > 0 && (
//               <div className="mt-8">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     Selected Images ({images.length}/10)
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     First image is the main photo • Click ⋮ to reorder
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//                   {images.map((image, index) => (
//                     <div
//                       key={image.id}
//                       className={`relative rounded-lg overflow-hidden border-2 ${
//                         image.isPrimary
//                           ? 'border-blue-500 ring-2 ring-blue-200'
//                           : 'border-gray-200'
//                       }`}
//                     >
//                       {/* Image */}
//                       <div className="w-full h-48 overflow-hidden">
//                         <img
//                           src={image.preview}
//                           alt={`Property image ${index + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>

//                       {/* Overlay with Actions */}
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
//                         <div className="absolute top-2 left-2">
//                           {image.isPrimary && (
//                             <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
//                               Main
//                             </span>
//                           )}
//                         </div>

//                         <div className="absolute top-2 right-2">
//                           <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
//                             {index + 1}
//                           </span>
//                         </div>

//                         <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
//                           {index !== 0 && (
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 moveImageToFirst(image.id);
//                               }}
//                               className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 shadow-md"
//                               title="Move to first position"
//                             >
//                               <FiArrowUp size={16} />
//                             </button>
//                           )}

//                           {!image.isPrimary && (
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setPrimaryImage(image.id);
//                               }}
//                               className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 shadow-md"
//                               title="Set as main"
//                             >
//                               <FiHome size={16} />
//                             </button>
//                           )}
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               removeImage(image.id);
//                             }}
//                             className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 shadow-md"
//                             title="Remove image"
//                           >
//                             <FiTrash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Image Tips */}
//                 <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//                   <h4 className="font-medium text-blue-900 mb-2">Tips for Great Photos:</h4>
//                   <ul className="text-sm text-blue-800 space-y-1">
//                     <li>• Use natural daylight for better quality</li>
//                     <li>• Take photos from eye level</li>
//                     <li>• Show all rooms, including bathrooms and kitchen</li>
//                     <li>• Include exterior shots and amenities</li>
//                     <li>• First image should be the best overall shot</li>
//                   </ul>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Step 2 Actions */}
//           <div className="flex justify-between pt-8 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={handleSkipImages}
//               className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
//             >
//               Skip Images
//             </button>

//             <div className="flex space-x-4">
//               <button
//                 type="button"
//                 onClick={() => setStep(1)}
//                 className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2"
//               >
//                 <FiArrowLeft />
//                 <span>Back</span>
//               </button>

//               <button
//                 type="button"
//                 onClick={handleUploadImages}
//                 disabled={uploadingImages}
//                 className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//               >
//                 {uploadingImages ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     <span>Uploading...</span>
//                   </>
//                 ) : (
//                   <>
//                     <FiCheck />
//                     <span>Complete Listing</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateApartment;


import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apartmentService } from '../services/apartment.service';
import { uploadImgs } from '../services/image.service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiLayers,
  FiDroplet,
  FiWind,
  FiWifi,
  FiPackage,
  FiLock,
  FiCheck,
  FiX,
  FiUpload,
  FiTrash2,
  FiImage,
  FiArrowUp
} from 'react-icons/fi';

const CreateApartment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    neighborhood: '',
    rent_amount: '',
    security_deposit: '',
    service_fee: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    utilities_included: false,
    amenities: [],
    status: 'available'
  });

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: <FiWifi /> },
    { id: 'parking', label: 'Parking', icon: <FiPackage /> },
    { id: 'pool', label: 'Swimming Pool', icon: <FiDroplet /> },
    { id: 'gym', label: 'Gym', icon: <FiPackage /> },
    { id: 'ac', label: 'Air Conditioning', icon: <FiWind /> },
    { id: 'heating', label: 'Heating', icon: <FiWind /> },
    { id: 'security', label: 'Security System', icon: <FiLock /> },
    { id: 'laundry', label: 'Laundry', icon: <FiDroplet /> },
    { id: 'furnished', label: 'Furnished', icon: <FiHome /> },
    { id: 'balcony', label: 'Balcony', icon: <FiHome /> },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Check total image count
    if (images.length + validFiles.length > 10) {
      toast.error(`Cannot upload more than 10 images. You have ${images.length} images already.`);
      return;
    }

    setUploading(true);

    // Create image objects with previews
    const newImages = validFiles.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setImages(prev => {
      const updated = [...prev, ...newImages];
      // Set first image as primary if no primary exists
      if (prev.length === 0 && newImages.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });

    setUploading(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);

      // Revoke object URL
      if (removed?.preview && removed.isNew) {
        URL.revokeObjectURL(removed.preview);
      }

      // If removing primary image and there are other images, set first as primary
      if (removed?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }

      return newImages;
    });
  };

  const setPrimaryImage = (id) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === id
    })));
  };

  const moveImageToFirst = (id) => {
    setImages(prev => {
      const imageToMove = prev.find(img => img.id === id);
      const otherImages = prev.filter(img => img.id !== id);
      const newImages = [imageToMove, ...otherImages];

      // Update primary flags
      return newImages.map((img, index) => ({
        ...img,
        isPrimary: index === 0
      }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'landlord') {
      toast.error('Only landlords can create listings');
      return;
    }

    // Basic validation
    if (!formData.title || !formData.address || !formData.city || !formData.rent_amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating apartment with data:', formData);

      // Prepare data for API
      const apartmentData = {
        ...formData,
        amenities: formData.amenities
      };

      // Create apartment
      console.log('Sending apartment creation request...');
      const result = await apartmentService.createApartment(apartmentData);
      console.log('Apartment creation result:', result);

      const apartmentId = result.data?.apartment?.id || result.apartment?.id;

      if (!apartmentId) {
        throw new Error('Failed to get apartment ID from response');
      }

      console.log('Apartment created with ID:', apartmentId);

      // Upload images if there are any
      if (images.length > 0) {
        const newImages = images.filter(img => img.isNew).map(img => img.file);

        if (newImages.length > 0) {
          console.log('Uploading', newImages.length, 'images...');
          try {
            await uploadImgs(apartmentId, newImages);
            console.log('Images uploaded successfully');
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            // Don't fail the whole process if images fail
            toast.error('Apartment created but images failed to upload. You can add them later.');
          }
        }
      }

      toast.success('Apartment listed successfully!');
      navigate(`/apartments/${apartmentId}`);
    } catch (error) {
      console.error('Error creating apartment:', error);
      console.error('Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      // Show specific error messages
      if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to create listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview && image.isNew) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  if (user?.role !== 'landlord') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <FiHome className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only landlords can create apartment listings. Please switch to a landlord account.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
        <p className="text-gray-600">Fill in the details and upload photos for your apartment listing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiHome className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Tell us about your property</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Modern 2BR Apartment in Downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent ($) *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="rent_amount"
                  value={formData.rent_amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms *
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="0">Studio</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms *
              </label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="1.5">1.5</option>
                <option value="2">2</option>
                <option value="2.5">2.5</option>
                <option value="3">3</option>
                <option value="3+">3+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Feet
              </label>
              <div className="relative">
                <FiLayers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="square_feet"
                  value={formData.square_feet}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 850"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiMapPin className="text-2xl text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
              <p className="text-gray-600">Where is your property located?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood
              </label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Downtown"
              />
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">Describe your property in detail</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe the property, nearby amenities, public transportation, etc."
            />
          </div>
        </div>

        {/* Amenities Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Amenities</h2>
            <p className="text-gray-600">Select all amenities included with your property</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {amenityOptions.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => handleAmenityToggle(amenity.id)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${formData.amenities.includes(amenity.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className={`text-2xl ${formData.amenities.includes(amenity.id) ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                  {amenity.icon}
                </div>
                <span className={`text-sm font-medium ${formData.amenities.includes(amenity.id) ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                  {amenity.label}
                </span>
                {formData.amenities.includes(amenity.id) && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white text-xs" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fees & Utilities Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Fees & Utilities</h2>
            <p className="text-gray-600">Additional costs and utility information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit ($)
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Fee ($/month)
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="service_fee"
                  value={formData.service_fee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="utilities_included"
                  name="utilities_included"
                  checked={formData.utilities_included}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="utilities_included" className="text-gray-700">
                  Utilities (water, electricity, gas) are included in the rent
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiImage className="text-2xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Property Photos</h2>
              <p className="text-gray-600">
                Upload photos to make your listing stand out ({images.length}/10)
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => !uploading && images.length < 10 && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${uploading
                ? 'border-blue-300 bg-blue-50'
                : images.length >= 10
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }`}
          >
            <FiUpload className={`text-4xl mx-auto mb-4 ${uploading ? 'text-blue-400 animate-bounce' : 'text-gray-400'
              }`} />

            {images.length >= 10 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Maximum Images Reached</h3>
                <p className="text-gray-600">You can upload up to 10 images per listing</p>
              </>
            ) : uploading ? (
              <>
                <h3 className="text-lg font-medium text-blue-600 mb-2">Processing Images...</h3>
                <p className="text-blue-500">Please wait while we process your images</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Property Photos</h3>
                <p className="text-gray-600 mb-4">
                  Drag & drop images or click to browse. First image will be the main photo.
                </p>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Select Images
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  JPEG, PNG, GIF, WebP up to 10MB each
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={images.length >= 10 || uploading}
            />
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Selected Images ({images.length}/10)
                </h3>
                <p className="text-sm text-gray-600">
                  First image is the main photo • Click ⋮ to reorder
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative rounded-lg overflow-hidden border-2 ${image.isPrimary
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200'
                      }`}
                  >
                    {/* Image */}
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={image.preview}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Overlay with Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 left-2">
                        {image.isPrimary && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Main
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveImageToFirst(image.id);
                            }}
                            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 shadow-md"
                            title="Move to first position"
                          >
                            <FiArrowUp size={16} />
                          </button>
                        )}

                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryImage(image.id);
                            }}
                            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 shadow-md"
                            title="Set as main"
                          >
                            <FiHome size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 shadow-md"
                          title="Remove image"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Image Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tips for Great Photos:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use natural daylight for better quality</li>
                  <li>• Take photos from eye level</li>
                  <li>• Show all rooms, including bathrooms and kitchen</li>
                  <li>• Include exterior shots and amenities</li>
                  <li>• First image should be the best overall shot</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/apartments')}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Listing...</span>
              </>
            ) : (
              <>
                <FiCheck />
                <span>Publish Listing</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateApartment;