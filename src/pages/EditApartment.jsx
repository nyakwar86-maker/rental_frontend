// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { apartmentService } from '../services/apartment.service';
// import { uploadImages_WithProgress, deleteImage, clearImageCache } from '../services/image.service';
// import { useAuth } from '../context/AuthContext';
// import { 
//   FiArrowLeft, 
//   FiSave, 
//   FiUpload, 
//   FiX, 
//   FiTrash2, 
//   FiStar,
//   FiImage,
//   FiHome,
//   FiMapPin,
//   FiDollarSign,
//   FiLayers,
//   FiCheck,
//   FiLoader
// } from 'react-icons/fi';
// import { toast } from 'react-hot-toast';


// const EditApartment = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm();
  
//   const [apartment, setApartment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [uploadingImages, setUploadingImages] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
  
//   // Available options
//   const apartmentTypes = ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'];
//   const statusOptions = ['available', 'occupied', 'unavailable', 'pending'];
//   const amenitiesList = [
//     'Parking', 'Pool', 'Gym', 'Laundry', 'Balcony', 
//     'Security', 'Elevator', 'AC', 'Heating', 'WiFi',
//     'Furnished', 'Pet Friendly', 'Wheelchair Access', 
//     'Storage', 'Patio', 'Fireplace'
//   ];


//   // Fetch apartment data
//   useEffect(() => {
//     const fetchApartment = async () => {
//       try {
//         setLoading(true);
//         const data = await apartmentService.getApartment(id);
//         const apartmentData = data.data?.apartment || data.apartment || data;
        
//         setApartment(apartmentData);
//         setExistingImages(apartmentData.images || []);
        
//         // Set form values
//         Object.keys(apartmentData).forEach(key => {
//           if (key !== 'images' && key !== 'landlord') {
//             setValue(key, apartmentData[key]);
//           }
//         });
        
//         // Handle amenities array
//         if (apartmentData.amenities && Array.isArray(apartmentData.amenities)) {
//           setValue('amenities', apartmentData.amenities.join(','));
//         }
        
//       } catch (error) {
//         console.error('Error fetching apartment:', error);
//         toast.error('Failed to load apartment details');
//         navigate('/apartments');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchApartment();
//   }, [id, navigate, setValue]);

//   // Handle image selection
//   const handleImageSelect = (e) => {
//     const files = Array.from(e.target.files);
    
//     // Validate file size and type
//     const validFiles = files.filter(file => {
//       const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
//       const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
//       if (!isValidType) {
//         toast.error(`${file.name} is not a valid image type`);
//         return false;
//       }
//       if (!isValidSize) {
//         toast.error(`${file.name} exceeds 5MB size limit`);
//         return false;
//       }
//       return true;
//     });
    
//     setSelectedImages(prev => [...prev, ...validFiles]);
    
//     // Create previews
//     const newPreviews = validFiles.map(file => ({
//       id: Date.now() + Math.random(),
//       url: URL.createObjectURL(file),
//       name: file.name,
//       size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
//       isNew: true
//     }));
    
//     setImagePreviews(prev => [...prev, ...newPreviews]);
    
//     // Clear file input
//     e.target.value = '';
//   };

//   // Remove image
//   const removeImage = (index, isExisting = false) => {
//     if (isExisting) {
//       // Remove existing image
//       const imageToRemove = existingImages[index];
//       setExistingImages(prev => prev.filter((_, i) => i !== index));
      
//       // Add to images to delete list
//       setValue('imagesToDelete', [...(watch('imagesToDelete') || []), imageToRemove.public_id || imageToRemove.url]);
//     } else {
//       // Remove new image
//       const imageToRemove = imagePreviews[index];
//       URL.revokeObjectURL(imageToRemove.url); // Clean up blob URL
//       setImagePreviews(prev => prev.filter((_, i) => i !== index));
//       setSelectedImages(prev => prev.filter((_, i) => i !== index - existingImages.length));
//     }
//   };

//   // Set primary image
//   const setPrimaryImage = (index, isExisting = false) => {
//     if (isExisting) {
//       const updatedImages = [...existingImages];
//       updatedImages.forEach((img, i) => {
//         img.is_primary = i === index;
//       });
//       setExistingImages(updatedImages);
//     } else {
//       // New images can't be primary until they're uploaded
//       toast.info('Please upload images first before setting primary');
//     }
//   };

//   // Upload images
//   const uploadImages = async () => {
//     if (selectedImages.length === 0) return [];

//     try {
//       setUploadingImages(true);
//       setUploadProgress(0);
      
//       const response = await uploadImages_WithProgress(id, selectedImages, (progress) => {
//         setUploadProgress(progress);
//       });
      
//       toast.success(`${selectedImages.length} image(s) uploaded successfully`);
//       setSelectedImages([]);
//       setUploadProgress(0);
      
//       return response.data?.images || response.images || [];
//     } catch (error) {
//       console.error('Error uploading images:', error);
//       toast.error('Failed to upload some images');
//       return [];
//     } finally {
//       setUploadingImages(false);
//     }
//   };

//   // Form submission
//   const onSubmit = async (data) => {
//     try {
//       // First upload new images if any
//       let uploadedImages = [];
//       if (selectedImages.length > 0) {
//         uploadedImages = await uploadImages();
//       }
      
//       // Prepare apartment data
//       const apartmentData = {
//         ...data,
//         rent_amount: parseFloat(data.rent_amount),
//         security_deposit: data.security_deposit ? parseFloat(data.security_deposit) : 0,
//         service_fee: data.service_fee ? parseFloat(data.service_fee) : 0,
//         bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
//         bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
//         square_feet: data.square_feet ? parseInt(data.square_feet) : null,
//         latitude: data.latitude ? parseFloat(data.latitude) : null,
//         longitude: data.longitude ? parseFloat(data.longitude) : null,
//         amenities: data.amenities ? data.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
//         // Combine existing and new images
//         images: [...existingImages, ...uploadedImages]
//       };

//       // Remove imagesToDelete from the payload
//       delete apartmentData.imagesToDelete;

//       // Update apartment
//       const response = await apartmentService.updateApartment(id, apartmentData);
      
//       // Delete marked images
//       if (data.imagesToDelete && data.imagesToDelete.length > 0) {
//         await Promise.all(
//           data.imagesToDelete.map(imageId => 
//             deleteImage(id, imageId).catch(err => {
//               console.error('Error deleting image:', err);
//             })
//           )
//         );
//       }
      
//       toast.success('Apartment updated successfully!');
      
//       // Clear cache for this apartment
//       apartmentService.clearApartmentCache(id);
//       clearImageCache(id);
      
//       // Navigate to apartment detail page
//       navigate(`/apartments/${id}`);
      
//     } catch (error) {
//       console.error('Error updating apartment:', error);
//       toast.error(error.response?.data?.error || 'Failed to update apartment');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <FiLoader className="animate-spin text-4xl text-blue-600" />
//         <span className="ml-3 text-gray-600">Loading apartment details...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
//           >
//             <FiArrowLeft className="mr-2" />
//             Back to Apartments
//           </button>
          
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Edit Apartment</h1>
//               <p className="text-gray-600 mt-2">Update your apartment listing details</p>
//             </div>
            
//             <button
//               onClick={handleSubmit(onSubmit)}
//               disabled={isSubmitting || uploadingImages}
//               className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSubmitting || uploadingImages ? (
//                 <FiLoader className="animate-spin" />
//               ) : (
//                 <FiSave />
//               )}
//               <span>Save Changes</span>
//             </button>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           {/* Images Section */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//               <FiImage className="mr-2" />
//               Apartment Images
//             </h2>
            
//             {/* Upload Progress */}
//             {uploadingImages && (
//               <div className="mb-4">
//                 <div className="flex justify-between text-sm text-gray-600 mb-1">
//                   <span>Uploading images...</span>
//                   <span>{uploadProgress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//               </div>
//             )}

//             {/* Image Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//               {/* Existing Images */}
//               {existingImages.map((img, index) => (
//                 <div key={img.public_id || img.url} className="relative group">
//                   <img
//                     src={img.url}
//                     alt={`Apartment ${index + 1}`}
//                     className="w-full h-40 object-cover rounded-lg"
//                   />
                  
//                   {/* Overlay */}
//                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
//                     <div className="flex space-x-2">
//                       <button
//                         type="button"
//                         onClick={() => setPrimaryImage(index, true)}
//                         className={`p-2 rounded-full ${img.is_primary ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-50'}`}
//                         title={img.is_primary ? 'Primary Image' : 'Set as Primary'}
//                       >
//                         <FiStar />
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index, true)}
//                         className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
//                         title="Remove Image"
//                       >
//                         <FiTrash2 />
//                       </button>
//                     </div>
//                   </div>
                  
//                   {/* Primary Badge */}
//                   {img.is_primary && (
//                     <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
//                       <FiStar size={10} className="mr-1" />
//                       Primary
//                     </div>
//                   )}
//                 </div>
//               ))}

//               {/* New Image Previews */}
//               {imagePreviews.map((preview, index) => (
//                 <div key={preview.id} className="relative group">
//                   <img
//                     src={preview.url}
//                     alt={preview.name}
//                     className="w-full h-40 object-cover rounded-lg"
//                   />
                  
//                   {/* Overlay */}
//                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
//                     <button
//                       type="button"
//                       onClick={() => removeImage(index)}
//                       className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
//                       title="Remove Image"
//                     >
//                       <FiTrash2 />
//                     </button>
//                   </div>
                  
//                   {/* New Badge */}
//                   <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
//                     New
//                   </div>
//                 </div>
//               ))}

//               {/* Upload Button */}
//               <label className="cursor-pointer">
//                 <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
//                   <FiUpload className="text-3xl text-gray-400 mb-2" />
//                   <span className="text-sm text-gray-600">Upload Images</span>
//                   <span className="text-xs text-gray-500 mt-1">Max 5MB each</span>
//                 </div>
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/jpeg,image/jpg,image/png,image/webp"
//                   onChange={handleImageSelect}
//                   className="hidden"
//                   disabled={uploadingImages}
//                 />
//               </label>
//             </div>
            
//             <p className="text-sm text-gray-500">
//               Tip: First image will be used as the primary/cover image. You can drag to reorder.
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="space-y-8">
//               {/* Basic Information */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FiHome className="mr-2" />
//                   Basic Information
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Title *
//                     </label>
//                     <input
//                       type="text"
//                       {...register('title', { required: 'Title is required' })}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="e.g., Beautiful 2-Bedroom Apartment"
//                     />
//                     {errors.title && (
//                       <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Apartment Type *
//                     </label>
//                     <select
//                       {...register('apartment_type', { required: 'Type is required' })}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Type</option>
//                       {apartmentTypes.map(type => (
//                         <option key={type} value={type}>{type}</option>
//                       ))}
//                     </select>
//                     {errors.apartment_type && (
//                       <p className="mt-1 text-sm text-red-600">{errors.apartment_type.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Description *
//                     </label>
//                     <textarea
//                       {...register('description', { 
//                         required: 'Description is required',
//                         minLength: { value: 50, message: 'Description must be at least 50 characters' }
//                       })}
//                       rows="4"
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Describe the apartment, features, neighborhood..."
//                     />
//                     {errors.description && (
//                       <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status *
//                     </label>
//                     <select
//                       {...register('status', { required: 'Status is required' })}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       {statusOptions.map(status => (
//                         <option key={status} value={status}>
//                           {status.charAt(0).toUpperCase() + status.slice(1)}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.status && (
//                       <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Location */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FiMapPin className="mr-2" />
//                   Location Details
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Address *
//                     </label>
//                     <input
//                       type="text"
//                       {...register('address', { required: 'Address is required' })}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Full street address"
//                     />
//                     {errors.address && (
//                       <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       City *
//                     </label>
//                     <input
//                       type="text"
//                       {...register('city', { required: 'City is required' })}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="City"
//                     />
//                     {errors.city && (
//                       <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Neighborhood
//                     </label>
//                     <input
//                       type="text"
//                       {...register('neighborhood')}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Neighborhood or district"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Latitude
//                       </label>
//                       <input
//                         type="number"
//                         step="any"
//                         {...register('latitude')}
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="40.7128"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Longitude
//                       </label>
//                       <input
//                         type="number"
//                         step="any"
//                         {...register('longitude')}
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="-74.0060"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FiDollarSign className="mr-2" />
//                   Pricing & Fees
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Monthly Rent *
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                       <input
//                         type="number"
//                         {...register('rent_amount', { 
//                           required: 'Rent amount is required',
//                           min: { value: 1, message: 'Rent must be positive' }
//                         })}
//                         className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="0.00"
//                       />
//                     </div>
//                     {errors.rent_amount && (
//                       <p className="mt-1 text-sm text-red-600">{errors.rent_amount.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Security Deposit
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                       <input
//                         type="number"
//                         {...register('security_deposit')}
//                         className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="0.00"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Service Fee
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                       <input
//                         type="number"
//                         {...register('service_fee')}
//                         className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="0.00"
//                       />
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="mt-4 flex items-center">
//                   <input
//                     type="checkbox"
//                     {...register('utilities_included')}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label className="ml-2 text-sm text-gray-700">
//                     Utilities included in rent
//                   </label>
//                 </div>
//               </div>

//               {/* Property Details */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FiLayers className="mr-2" />
//                   Property Details
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bedrooms
//                     </label>
//                     <input
//                       type="number"
//                       {...register('bedrooms')}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="2"
//                       min="0"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bathrooms
//                     </label>
//                     <input
//                       type="number"
//                       step="0.5"
//                       {...register('bathrooms')}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="1.5"
//                       min="0"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Square Feet
//                     </label>
//                     <input
//                       type="number"
//                       {...register('square_feet')}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="850"
//                       min="0"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Lease Duration (months)
//                     </label>
//                     <input
//                       type="number"
//                       {...register('lease_duration')}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="12"
//                       min="1"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Amenities */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Amenities (comma-separated)
//                   </label>
//                   <input
//                     type="text"
//                     {...register('amenities')}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="e.g., Parking, Gym, Pool, WiFi"
//                   />
//                   <p className="mt-1 text-sm text-gray-500">
//                     Enter amenities separated by commas
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                   {amenitiesList.map(amenity => (
//                     <label key={amenity} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         value={amenity}
//                         onChange={(e) => {
//                           const currentAmenities = watch('amenities') || '';
//                           const amenityArray = currentAmenities.split(',').map(a => a.trim()).filter(a => a);
                          
//                           if (e.target.checked) {
//                             amenityArray.push(amenity);
//                           } else {
//                             const index = amenityArray.indexOf(amenity);
//                             if (index > -1) amenityArray.splice(index, 1);
//                           }
                          
//                           setValue('amenities', amenityArray.join(', '));
//                         }}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         checked={watch('amenities')?.includes(amenity)}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">{amenity}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Features */}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-3">
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         {...register('is_verified')}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Verified Listing</span>
//                     </label>
                    
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         {...register('pets_allowed')}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
//                     </label>
                    
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         {...register('furnished')}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Furnished</span>
//                     </label>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         {...register('has_parking')}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Parking Available</span>
//                     </label>
                    
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         {...register('has_pool')}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Swimming Pool</span>
//                     </label>
                    
//                     <label className="flex items-center">
//                       <input
//                         type="checkbox"
//                         {...register('has_gym')}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Gym/Fitness Center</span>
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Hidden field for images to delete */}
//             <input type="hidden" {...register('imagesToDelete')} />
//           </form>
//         </div>

//         {/* Delete Apartment Section */}
//         <div className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-xl font-semibold text-red-700 mb-4">Danger Zone</h2>
          
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-700">Delete this apartment listing permanently</p>
//               <p className="text-sm text-gray-500 mt-1">
//                 This action cannot be undone. All images and data will be permanently deleted.
//               </p>
//             </div>
            
//             <button
//               onClick={async () => {
//                 if (window.confirm('Are you sure you want to delete this apartment? This action cannot be undone.')) {
//                   try {
//                     await apartmentService.deleteApartment(id);
//                     toast.success('Apartment deleted successfully');
//                     apartmentService.clearApartmentCache();
//                     navigate('/apartments');
//                   } catch (error) {
//                     toast.error('Failed to delete apartment');
//                   }
//                 }
//               }}
//               className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
//             >
//               <FiTrash2 />
//               <span>Delete Apartment</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditApartment;



import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { apartmentService } from '../services/apartment.service';
import { uploadImages_WithProgress, deleteImage, clearImageCache } from '../services/image.service';
import { 
  FiArrowLeft, 
  FiSave, 
  FiUpload, 
  FiX, 
  FiTrash2, 
  FiStar,
  FiImage,
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiLayers,
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiUser,
  FiLock
} from 'react-icons/fi';
import { 
  MdLocalParking, 
  MdPool, 
  MdFitnessCenter 
} from 'react-icons/md';
 import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EditApartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm();
  
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  // Available options
  const apartmentTypes = ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'];
  const statusOptions = ['available', 'occupied', 'unavailable', 'pending'];
  const amenitiesList = [
    'Parking', 'Pool', 'Gym', 'Laundry', 'Balcony', 
    'Security', 'Elevator', 'AC', 'Heating', 'WiFi',
    'Furnished', 'Pet Friendly', 'Wheelchair Access', 
    'Storage', 'Patio', 'Fireplace'
  ];

  // Check ownership before allowing edit
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        setCheckingOwnership(true);
        
        // If user is not logged in, redirect
        if (!user) {
          toast.error('Please login to edit apartments');
          navigate('/login', { state: { from: `/apartments/${id}/edit` } });
          return;
        }

        // If user is not a landlord, redirect
        if (user.role !== 'landlord' && user.role !== 'admin') {
          toast.error('Only landlords can edit apartments');
          navigate('/apartments');
          return;
        }

        // Fetch apartment data to check ownership
        const data = await apartmentService.getApartment(id);
        const apartmentData = data.data?.apartment || data.apartment || data;
        
        // Check if current user is the owner
        const isApartmentOwner = user.id === apartmentData.landlord_id;
        const isAdmin = user.role === 'admin';
        
        if (!isApartmentOwner && !isAdmin) {
          toast.error('You are not authorized to edit this apartment');
          navigate('/apartments');
          return;
        }
        
        setIsOwner(isApartmentOwner || isAdmin);
        
        // If authorized, load apartment data
        setApartment(apartmentData);
        setExistingImages(apartmentData.images || []);
        
        // Set form values
        Object.keys(apartmentData).forEach(key => {
          if (key !== 'images' && key !== 'landlord' && key !== 'landlord_id') {
            setValue(key, apartmentData[key]);
          }
        });
        
        // Handle amenities array
        if (apartmentData.amenities && Array.isArray(apartmentData.amenities)) {
          setValue('amenities', apartmentData.amenities.join(', '));
        }
        
        // Handle features object
        if (apartmentData.features) {
          Object.keys(apartmentData.features).forEach(feature => {
            setValue(feature, apartmentData.features[feature]);
          });
        }
        
      } catch (error) {
        console.error('Error checking ownership:', error);
        
        if (error.response?.status === 404) {
          toast.error('Apartment not found');
        } else if (error.response?.status === 403) {
          toast.error('Access denied');
        } else {
          toast.error('Failed to load apartment details');
        }
        
        navigate('/apartments');
      } finally {
        setCheckingOwnership(false);
        setLoading(false);
      }
    };

    checkOwnership();
  }, [id, navigate, user, setValue]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    const newPreviews = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
      isNew: true
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear file input
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove existing image
      const imageToRemove = existingImages[index];
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      
      // Add to images to delete list
      setValue('imagesToDelete', [...(watch('imagesToDelete') || []), imageToRemove.public_id || imageToRemove.url]);
    } else {
      // Remove new image
      const imageToRemove = imagePreviews[index];
      URL.revokeObjectURL(imageToRemove.url); // Clean up blob URL
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      setSelectedImages(prev => prev.filter((_, i) => i !== index - existingImages.length));
    }
  };

  // Set primary image
  const setPrimaryImage = (index, isExisting = false) => {
    if (isExisting) {
      const updatedImages = [...existingImages];
      updatedImages.forEach((img, i) => {
        img.is_primary = i === index;
      });
      setExistingImages(updatedImages);
    } else {
      // New images can't be primary until they're uploaded
      toast.info('Please upload images first before setting primary');
    }
  };

  // Upload images
  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    try {
      setUploadingImages(true);
      setUploadProgress(0);
      
      // Simulate progress for now (you'll need to implement actual progress tracking)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadImages_WithProgress(id, selectedImages);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success(`${selectedImages.length} image(s) uploaded successfully`);
      setSelectedImages([]);
      setImagePreviews([]);
      
      return response.data?.images || response.images || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
      return [];
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    try {
      // First upload new images if any
      let uploadedImages = [];
      if (selectedImages.length > 0) {
        uploadedImages = await uploadImages();
      }
      
      // Prepare apartment data
      const apartmentData = {
        ...data,
        rent_amount: parseFloat(data.rent_amount),
        security_deposit: data.security_deposit ? parseFloat(data.security_deposit) : 0,
        service_fee: data.service_fee ? parseFloat(data.service_fee) : 0,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        square_feet: data.square_feet ? parseInt(data.square_feet) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        amenities: data.amenities ? data.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
        features: {
          parking: data.parking || false,
          pool: data.pool || false,
          gym: data.gym || false,
          pets_allowed: data.pets_allowed || false,
          laundry: data.laundry || false,
          furnished: data.furnished || false
        },
        // Combine existing and new images
        images: [...existingImages, ...uploadedImages]
      };

      // Remove imagesToDelete from the payload
      delete apartmentData.imagesToDelete;
      delete apartmentData.parking;
      delete apartmentData.pool;
      delete apartmentData.gym;
      delete apartmentData.laundry;
      delete apartmentData.furnished;

      // Update apartment
      const response = await apartmentService.updateApartment(id, apartmentData);
      
      // Delete marked images
      if (data.imagesToDelete && data.imagesToDelete.length > 0) {
        await Promise.all(
          data.imagesToDelete.map(imageId => 
            deleteImage(id, imageId).catch(err => {
              console.error('Error deleting image:', err);
            })
          )
        );
      }
      
      toast.success('Apartment updated successfully!');
      
      // Clear cache for this apartment
      apartmentService.clearApartmentCache(id);
    clearImageCache(id);
      
      // Navigate to apartment detail page
      navigate(`/apartments/${id}`);
      
    } catch (error) {
      console.error('Error updating apartment:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update apartment';
      toast.error(errorMessage);
    }
  };

  // Show loading while checking ownership
  if (checkingOwnership) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <FiLoader className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-gray-600">Verifying access permissions...</p>
      </div>
    );
  }

  // Show loading while fetching apartment data
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <FiLoader className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-gray-600">Loading apartment details...</p>
      </div>
    );
  }

  // Show access denied if not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-red-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to edit this apartment listing.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft />
              <span>Go Back</span>
            </button>
            <button
              onClick={() => navigate('/apartments')}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Browse Apartments
            </button>
            {user?.role === 'landlord' && (
              <button
                onClick={() => navigate('/landlord/listings')}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View My Listings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Apartment</h1>
              <p className="text-gray-600 mt-2">Update your apartment listing details</p>
              
              {/* Ownership indicator */}
              <div className="flex items-center mt-2 text-sm">
                {user?.role === 'admin' ? (
                  <div className="flex items-center text-purple-600">
                    <FiUser className="mr-1" />
                    <span>Admin Editing Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <FiCheck className="mr-1" />
                    <span>You own this listing</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || uploadingImages}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || uploadingImages ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiSave />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Images Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiImage className="mr-2" />
              Apartment Images
            </h2>
            
            {/* Upload Progress */}
            {uploadingImages && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading images...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* Existing Images */}
              {existingImages.map((img, index) => (
                <div key={img.public_id || img.url || index} className="relative group">
                  <img
                    src={img.url}
                    alt={`Apartment ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index, true)}
                        className={`p-2 rounded-full ${img.is_primary ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-50'}`}
                        title={img.is_primary ? 'Primary Image' : 'Set as Primary'}
                      >
                        <FiStar />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                        title="Remove Image"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  {/* Primary Badge */}
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <FiStar size={10} className="mr-1" />
                      Primary
                    </div>
                  )}
                </div>
              ))}

              {/* New Image Previews */}
              {imagePreviews.map((preview, index) => (
                <div key={preview.id} className="relative group">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                      title="Remove Image"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  
                  {/* New Badge */}
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    New
                  </div>
                </div>
              ))}

              {/* Upload Button */}
              <label className="cursor-pointer">
                <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <FiUpload className="text-3xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Images</span>
                  <span className="text-xs text-gray-500 mt-1">Max 5MB each</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </label>
            </div>
            
            <p className="text-sm text-gray-500">
              Tip: First image will be used as the primary/cover image. You can drag to reorder.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiHome className="mr-2" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Beautiful 2-Bedroom Apartment"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment Type *
                    </label>
                    <select
                      {...register('apartment_type', { required: 'Type is required' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      {apartmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.apartment_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.apartment_type.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: { value: 50, message: 'Description must be at least 50 characters' }
                      })}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the apartment, features, neighborhood..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      {...register('status', { required: 'Status is required' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available From
                    </label>
                    <input
                      type="date"
                      {...register('available_from')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiMapPin className="mr-2" />
                  Location Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      {...register('address', { required: 'Address is required' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full street address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Neighborhood
                    </label>
                    <input
                      type="text"
                      {...register('neighborhood')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Neighborhood or district"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        {...register('latitude')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        {...register('longitude')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiDollarSign className="mr-2" />
                  Pricing & Fees
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('rent_amount', { 
                          required: 'Rent amount is required',
                          min: { value: 1, message: 'Rent must be positive' }
                        })}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.rent_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.rent_amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('security_deposit')}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('service_fee')}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    {...register('utilities_included')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Utilities included in rent
                  </label>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiLayers className="mr-2" />
                  Property Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      {...register('bedrooms')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      {...register('bathrooms')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.5"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Square Feet
                    </label>
                    <input
                      type="number"
                      {...register('square_feet')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="850"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lease Duration (months)
                    </label>
                    <input
                      type="number"
                      {...register('lease_duration')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    {...register('amenities')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Parking, Gym, Pool, WiFi"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter amenities separated by commas
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        value={amenity}
                        onChange={(e) => {
                          const currentAmenities = watch('amenities') || '';
                          const amenityArray = currentAmenities.split(',').map(a => a.trim()).filter(a => a);
                          
                          if (e.target.checked) {
                            amenityArray.push(amenity);
                          } else {
                            const index = amenityArray.indexOf(amenity);
                            if (index > -1) amenityArray.splice(index, 1);
                          }
                          
                          setValue('amenities', amenityArray.join(', '));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={watch('amenities')?.includes(amenity)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('is_verified')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Verified Listing</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('pets_allowed')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('furnished')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Furnished</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('laundry')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Laundry Facilities</span>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('parking')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <MdLocalParking className="inline mr-1" />
                        Parking Available
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('pool')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <MdPool className="inline mr-1" />
                        Swimming Pool
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('gym')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <MdFitnessCenter className="inline mr-1" />
                        Gym/Fitness Center
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden field for images to delete */}
            <input type="hidden" {...register('imagesToDelete')} />
          </form>
        </div>

        {/* Delete Apartment Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Danger Zone
          </h2>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 font-medium">Delete this apartment listing</p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. All images and data will be permanently deleted.
              </p>
            </div>
            
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this apartment? This action cannot be undone.')) {
                  try {
                    await apartmentService.deleteApartment(id);
                    toast.success('Apartment deleted successfully');
                    apartmentService.clearApartmentCache();
                    navigate('/apartments');
                  } catch (error) {
                    toast.error('Failed to delete apartment');
                  }
                }
              }}
              className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              <FiTrash2 />
              <span>Delete Apartment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditApartment;