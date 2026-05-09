// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { apartmentService } from '../services/apartment.service';
// import { getApartmentImages, ensureFullUrl } from '../services/image.service';
// import { conversationService } from '../services/conversation.service';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { useChat } from '../context/ChatContext'; // ADD THIS
// import {
//   FiArrowLeft,
//   FiMapPin,
//   FiHome,
//   FiDollarSign,
//   FiCheckCircle,
//   FiUser,
//   FiPhone,
//   FiMail,
//   FiCalendar,
//   FiLayers,
//   FiWifi,
//   FiDroplet,
//   FiWind,
//   FiThermometer,
//   FiLock,
//   FiMessageSquare,
//   FiShare2,
//   FiHeart,
//   FiEdit2,
//   FiTrash2,
//   FiChevronLeft,
//   FiChevronRight,
//   FiExternalLink,
//   FiPackage,
//   FiNavigation,
//   FiImage,
//   FiCamera,
//   FiAlertCircle,
//   FiRefreshCw
// } from 'react-icons/fi';
// import { format } from 'date-fns';

// const ApartmentDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useAuth();
//   const [apartment, setApartment] = useState(null);
//   const [landlord, setLandlord] = useState(null);
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [imageLoading, setImageLoading] = useState(true);
//   const [activeImage, setActiveImage] = useState(0);
//   const [startingConversation, setStartingConversation] = useState(false);
//   const [imageErrors, setImageErrors] = useState({});
//   const { startConversation } = useChat(); // ADD THIS
//    const [contacting, setContacting] = useState(false);

//   useEffect(() => {
//     fetchApartmentDetails();
//   }, [id]);

//   const fetchApartmentDetails = async () => {
//     try {
//       setLoading(true);
//       const data = await apartmentService.getApartment(id);
//       console.log('🏢 Apartment data1:', data);
//       console.log('🏢 Apartment data2:', data.apartment != 'undefined' ? data.apartment : 'Empty data');


//       setApartment(data);
//       console.log('🏢 Apartment data:', data.apartment);

//       // Extract landlord info from apartment data


//       if (data.landlord) {
//         setLandlord(data.landlord);
//       } else {
//         // Fallback if landlord data isn't included
//         setLandlord({
//           full_name: 'Property Owner',
//           email: 'contact@example.com',
//           phone: 'N/A',
//           is_verified: false
//         });
//       }

//       // Fetch images after apartment data is loaded
//       await fetchApartmentImages();
//     } catch (error) {
//       console.error('❌ Error fetching apartment:', error);
//       toast.error('Failed to load apartment details');
//       navigate('/apartments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchApartmentImages = async () => {
//     try {
//       setImageLoading(true);
//       const data = await getApartmentImages(id);
//       console.log('🖼️ Fetched images:', data.images);

//       if (data && data.images && data.images.length > 0) {
//         setImages(data.images);
//       } else {
//         // Fallback to images from apartment data
//         const apartmentImages = apartment?.images || [];
//         if (apartmentImages.length > 0) {
//           // Ensure images have proper structure
//           const formattedImages = apartmentImages.map((img, index) => ({
//             id: `img-${index}`,
//             url: typeof img === 'string' ? img : img.url,
//             isPrimary: index === 0
//           }));
//           setImages(formattedImages);
//         } else if (apartment?.main_image) {
//           // Fallback to single main image
//           setImages([{
//             id: 'main-img',
//             url: apartment.main_image,
//             isPrimary: true
//           }]);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error fetching apartment images:', error);
//       // Don't show error toast - images might not exist yet
//     } finally {
//       setImageLoading(false);
//     }
//   };

//   const handleImageError = (imageId, imageUrl) => {
//     console.error(`❌ Image failed to load: ${imageUrl}`);
//     setImageErrors(prev => ({ ...prev, [imageId]: true }));

//     // Try to fix URL if it might be incorrect
//     const fixedUrl = ensureFullUrl ?
//       ensureFullUrl(imageUrl) :
//       imageUrl;

//     console.log(`🔄 Attempting with fixed URL: ${fixedUrl}`);
//     return fixedUrl;
//   };

 
//   // ADD THIS FUNCTION
//   const handleContactLandlord = async () => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     if (user.role !== 'tenant') {
//       alert('Only tenants can contact landlords');
//       return;
//     }

//     try {
//       setContacting(true);
//       const conversation = await startConversation(id);
//       navigate(`/chat/${conversation.id}`);
//     } catch (err) {
//       alert(err.error || 'Failed to start conversation');
//     } finally {
//       setContacting(false);
//     }
//   };

//   const handleDeleteApartment = async () => {
//     if (!window.confirm('Are you sure you want to delete this apartment?')) {
//       return;
//     }

//     try {
//       await apartmentService.deleteApartment(id);
//       toast.success('Apartment deleted successfully');
//       navigate('/apartments');
//     } catch (error) {
//       console.error('Error deleting apartment:', error);
//       toast.error(error.response?.data?.error || 'Failed to delete apartment');
//     }
//   };

//   const retryImageLoad = (imageId) => {
//     setImageErrors(prev => ({ ...prev, [imageId]: false }));
//   };

//   const formatPrice = (amount) => {
//     if (!amount) return '$0';
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   const getAmenityIcon = (amenity) => {
//     const amenityIcons = {
//       'wifi': <FiWifi />,
//       'parking': <FiPackage />,
//       'pool': <FiDroplet />,
//       'ac': <FiWind />,
//       'heating': <FiThermometer />,
//       'security': <FiLock />,
//       'furnished': <FiHome />,
//       'gym': <FiPackage />,
//       'laundry': <FiDroplet />,
//       'balcony': <FiHome />,
//     };
//     return amenityIcons[amenity.toLowerCase()] || <FiHome />;
//   };

//   if (loading || !apartment) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="mb-6">
//           <Skeleton height={24} width={200} />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2">
//             <Skeleton height={400} className="rounded-xl mb-6" />

//             <div className="space-y-4">
//               <Skeleton height={32} width="60%" />
//               <Skeleton height={24} width="40%" />
//               <Skeleton height={100} />
//             </div>
//           </div>

//           <div>
//             <Skeleton height={400} className="rounded-xl" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isOwner = user?.id === apartment.landlord_id;
//   const canContact = isAuthenticated && user?.role === 'tenant' && !isOwner;
//   const hasImages = images.length > 0;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* Back Button */}
//       <button
//         onClick={() => navigate('/apartments')}
//         className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
//       >
//         <FiArrowLeft />
//         <span>Back to Listings</span>
//       </button>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column - Images & Details */}
//         <div className="lg:col-span-2">
//           {/* Image Gallery */}
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
//             <div className="relative h-96 overflow-hidden">
//               {hasImages ? (
//                 <>
//                   {imageErrors[images[activeImage]?.id] ? (
//                     <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
//                       <FiAlertCircle className="text-6xl text-red-400 mb-4" />
//                       <p className="text-red-600 font-medium">Failed to load image</p>
//                       <p className="text-red-500 text-sm mt-2">URL: {images[activeImage]?.url?.substring(0, 50)}...</p>
//                       <button
//                         onClick={() => retryImageLoad(images[activeImage]?.id)}
//                         className="mt-4 flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
//                       >
//                         <FiRefreshCw />
//                         <span>Retry Loading</span>
//                       </button>
//                     </div>
//                   ) : (
//                     <img
//                       key={`${images[activeImage]?.id}-${activeImage}`}
//                       src={images[activeImage]?.url}
//                       alt={apartment.title}
//                       className="w-full h-full object-cover transition-opacity duration-300"
//                       onLoad={() => {
//                         console.log('✅ Image loaded successfully:', images[activeImage]?.url);
//                         setImageLoading(false);
//                       }}
//                       onError={(e) => {
//                         console.error('❌ Image load error:', images[activeImage]?.url);
//                         const newUrl = handleImageError(images[activeImage]?.id, images[activeImage]?.url);
//                         if (newUrl && newUrl !== images[activeImage]?.url) {
//                           e.target.src = newUrl;
//                         } else {
//                           setImageErrors(prev => ({ ...prev, [images[activeImage]?.id]: true }));
//                         }
//                       }}
//                     />
//                   )}

//                   {/* Navigation Arrows */}
//                   {images.length > 1 && (
//                     <>
//                       <button
//                         onClick={() => setActiveImage(prev => (prev - 1 + images.length) % images.length)}
//                         className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
//                       >
//                         <FiChevronLeft size={20} />
//                       </button>
//                       <button
//                         onClick={() => setActiveImage(prev => (prev + 1) % images.length)}
//                         className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg"
//                       >
//                         <FiChevronRight size={20} />
//                       </button>
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center text-white">
//                   {imageLoading ? (
//                     <div className="flex flex-col items-center">
//                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
//                       <p>Loading images...</p>
//                     </div>
//                   ) : (
//                     <>
//                       <FiCamera className="text-6xl mb-4 opacity-50" />
//                       <p className="text-xl font-medium">No images available</p>
//                       <p className="text-sm opacity-75 mt-2">Contact landlord for more photos</p>
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* Status Badges */}
//               <div className="absolute top-4 left-4 flex space-x-2">
//                 <span className={`px-4 py-2 rounded-full text-sm font-medium ${apartment.status === 'available'
//                   ? 'bg-green-500 text-white'
//                   : apartment.status === 'occupied'
//                     ? 'bg-red-500 text-white'
//                     : 'bg-gray-500 text-white'
//                   }`}>
//                   Available
//                   {/* {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)} */}
//                 </span>
//                 {apartment.is_verified && (
//                   <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium flex items-center">
//                     <FiCheckCircle className="mr-1" />
//                     Verified
//                   </span>
//                 )}
//               </div>

//               {/* Image Counter */}
//               {hasImages && (
//                 <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
//                   {activeImage + 1} / {images.length}
//                 </div>
//               )}
//             </div>

//             {/* Thumbnail Strip */}
//             {hasImages && images.length > 1 && (
//               <div className="p-4 bg-gray-50">
//                 <div className="flex space-x-2 overflow-x-auto pb-2">
//                   {images.map((img, index) => (
//                     <button
//                       key={img.id || index}
//                       onClick={() => setActiveImage(index)}
//                       className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 relative ${activeImage === index ? 'border-blue-500' : 'border-transparent'
//                         }`}
//                     >
//                       {imageErrors[img.id] ? (
//                         <div className="w-full h-full bg-red-100 flex items-center justify-center">
//                           <FiAlertCircle className="text-red-400" />
//                         </div>
//                       ) : (
//                         <img
//                           src={img.thumbnailUrl || img.url}
//                           alt={`Thumbnail ${index + 1}`}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             console.error(`❌ Thumbnail failed: ${img.url}`);
//                             setImageErrors(prev => ({ ...prev, [img.id]: true }));
//                           }}
//                         />
//                       )}
//                       {activeImage === index && (
//                         <div className="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Apartment Details */}
//           <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
//             <div className="flex justify-between items-start mb-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {apartment.title}
//                 </h1>
//                 <div className="flex items-center text-gray-600 mb-4">
//                   <FiMapPin className="mr-2" />
//                   <span className="text-lg">{apartment.address}, {apartment.city}</span>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="text-3xl font-bold text-blue-600">
//                   {formatPrice(apartment.rent_amount)}
//                   <span className="text-lg text-gray-500 font-normal">/month</span>
//                 </div>
//                 {apartment.security_deposit > 0 && (
//                   <div className="text-gray-600">
//                     Security: {formatPrice(apartment.security_deposit)}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//               <div className="bg-blue-50 p-4 rounded-xl">
//                 <div className="flex items-center space-x-2 text-blue-600 mb-1">
//                   <FiHome />
//                   <span className="font-medium">Bedrooms</span>
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {apartment.bedrooms || 'N/A'}
//                 </div>
//               </div>

//               <div className="bg-green-50 p-4 rounded-xl">
//                 <div className="flex items-center space-x-2 text-green-600 mb-1">
//                   <FiDroplet />
//                   <span className="font-medium">Bathrooms</span>
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {apartment.bathrooms || 'N/A'}
//                 </div>
//               </div>

//               {apartment.square_feet && (
//                 <div className="bg-purple-50 p-4 rounded-xl">
//                   <div className="flex items-center space-x-2 text-purple-600 mb-1">
//                     <FiLayers />
//                     <span className="font-medium">Square Feet</span>
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {apartment.square_feet.toLocaleString()}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-yellow-50 p-4 rounded-xl">
//                 <div className="flex items-center space-x-2 text-yellow-600 mb-1">
//                   <FiCalendar />
//                   <span className="font-medium">Listed</span>
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {apartment.created_at ? format(new Date(apartment.created_at), 'MMM d') : 'N/A'}
//                 </div>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="mb-8">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
//               <p className="text-gray-700 leading-relaxed whitespace-pre-line">
//                 {apartment.description || 'No description provided.'}
//               </p>
//             </div>

//             {/* Amenities */}
//             {apartment.amenities && apartment.amenities.length > 0 && (
//               <div className="mb-8">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                   {apartment.amenities.map((amenity, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
//                     >
//                       <div className="text-blue-600">
//                         {getAmenityIcon(amenity)}
//                       </div>
//                       <span className="text-gray-700 capitalize">{amenity}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Utilities & Fees */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Utilities</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Utilities Included</span>
//                     <span className={`font-medium ${apartment.utilities_included ? 'text-green-600' : 'text-gray-900'}`}>
//                       {apartment.utilities_included ? 'Yes' : 'No'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Fees</h3>
//                 <div className="space-y-2">
//                   {apartment.service_fee > 0 && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Service Fee</span>
//                       <span className="font-medium text-gray-900">
//                         {formatPrice(apartment.service_fee)}/month
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Images Info */}
//             <div className="mt-8 pt-6 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <FiImage className="text-gray-400" />
//                   <span className="text-gray-700">
//                     {hasImages ? `${images.length} photos available` : 'No photos uploaded yet'}
//                   </span>
//                 </div>
//                 {isOwner && (
//                   <Link
//                     to={`/apartments/${id}/edit`}
//                     className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//                   >
//                     {hasImages ? 'Manage Photos' : 'Add Photos'}
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Action Card & Landlord Info */}
//         <div className="space-y-8">
//           {/* Action Card */}
//           <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
//             <div className="space-y-4">
//               {/* Price */}
//               <div className="text-center mb-6">
//                 <div className="text-4xl font-bold text-blue-600">
//                   {formatPrice(apartment.rent_amount)}
//                 </div>
//                 <div className="text-gray-500">per month</div>
//               </div>

//               {/* Action Buttons */}
//               {canContact ? (
//                 <button
//                   onClick={handleContactLandlord}
//                   disabled={contacting}
//                   className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
//                 >
//                   {contacting ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       <span>Starting Chat...</span>
//                     </>
//                   ) : (
//                     <>
//                       <FiMessageSquare />
//                       <span>Contact Landlord</span>
//                     </>
//                   )}
//                 </button>
//               ) : isOwner ? (
//                 <div className="space-y-3">
//                   <Link
//                     to={`/apartments/${id}/edit`}
//                     className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
//                   >
//                     <FiEdit2 />
//                     <span>Edit Listing</span>
//                   </Link>
//                   <button
//                     onClick={handleDeleteApartment}
//                     className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
//                   >
//                     <FiTrash2 />
//                     <span>Delete Listing</span>
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => {
//                     toast.error('Only tenants can contact landlords');
//                   }}
//                   className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold cursor-not-allowed"
//                 >
//                   Contact Landlord
//                 </button>
//               )}

//               {/* Additional Actions */}
//               <div className="flex space-x-2 pt-4 border-t border-gray-100">
//                 <button className="flex-1 flex items-center justify-center space-x-2 p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                   <FiHeart />
//                   <span>Save</span>
//                 </button>
//                 <button className="flex-1 flex items-center justify-center space-x-2 p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                   <FiShare2 />
//                   <span>Share</span>
//                 </button>
//                 <button className="flex-1 flex items-center justify-center space-x-2 p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                   <FiNavigation />
//                   <span>Map</span>
//                 </button>
//               </div>
//             </div>

//             {/* Quick Info */}
//             <div className="mt-6 space-y-3 text-sm text-gray-600">
//               <div className="flex justify-between">
//                 <span>Property Type</span>
//                 <span className="font-medium">Apartment</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Availability</span>
//                 <span className="font-medium capitalize">{apartment.status || 'Available'}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Verification</span>
//                 <span className="font-medium">{apartment.is_verified ? 'Verified' : 'Pending'}</span>
//               </div>
//             </div>
//           </div>

//           {/* Landlord Card */}
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Landlord Information</h3>

//             <div className="flex items-start space-x-4 mb-6">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//                 {landlord?.full_name?.[0]?.toUpperCase() || 'L'}
//               </div>

//               <div className="flex-1">
//                 <h4 className="font-semibold text-gray-900 text-lg">
//                   {landlord?.full_name || 'Landlord'}
//                 </h4>
//                 <div className="flex items-center mt-1">
//                   {landlord?.is_verified && (
//                     <span className="flex items-center text-green-600 text-sm mr-3">
//                       <FiCheckCircle className="mr-1" />
//                       Verified
//                     </span>
//                   )}
//                   <span className="text-sm text-gray-600">Property Owner</span>
//                 </div>
//               </div>
//             </div>

//             {/* Contact Info */}
//             <div className="space-y-3">
//               {landlord?.email && (
//                 <div className="flex items-center text-gray-700">
//                   <FiMail className="mr-3 text-gray-400" />
//                   <span className="truncate">{landlord.email}</span>
//                 </div>
//               )}

//               {landlord?.phone && (
//                 <div className="flex items-center text-gray-700">
//                   <FiPhone className="mr-3 text-gray-400" />
//                   <span>{landlord.phone}</span>
//                 </div>
//               )}
//             </div>

//             {/* Stats */}
//             <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-gray-900">
//                   {apartment.landlord_stats?.total_listings || 'N/A'}
//                 </div>
//                 <div className="text-sm text-gray-600">Listings</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-gray-900">
//                   {apartment.landlord_stats?.rating || 'N/A'}
//                 </div>
//                 <div className="text-sm text-gray-600">Rating</div>
//               </div>
//             </div>

//             {/* ADD CONTACT BUTTON SECTION */}
//             <div className="action-section">
//               {user?.role === 'tenant' ? (
//                 <button
//                   onClick={handleContactLandlord}
//                   disabled={contacting}
//                   className="contact-btn"
//                 >
//                   {contacting ? 'Starting conversation...' : 'Contact Landlord'}
//                 </button>
//               ) : user?.role === 'landlord' ? (
//                 <div className="landlord-notice">
//                   <p>This is your listing. You can manage it from your dashboard.</p>
//                   <button
//                     onClick={() => navigate('/landlord/dashboard')}
//                     className="btn-secondary"
//                   >
//                     Go to Dashboard
//                   </button>
//                 </div>
//               ) : (
//                 <div className="login-prompt">
//                   <p>Login as a tenant to contact the landlord</p>
//                   <button
//                     onClick={() => navigate('/login')}
//                     className="btn-primary"
//                   >
//                     Login
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Message */}
//           <p className="mt-6 text-sm text-gray-600">
//             {landlord?.full_name || 'The landlord'} typically responds within 2 hours. All communications are secure and private.
//           </p>
//         </div>

//         {/* Safety Tips */}
//         <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
//           <h4 className="font-semibold text-blue-900 mb-3">Safety Tips</h4>
//           <ul className="space-y-2 text-sm text-blue-800">
//             <li className="flex items-start">
//               <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
//               <span>Never wire money or pay with gift cards</span>
//             </li>
//             <li className="flex items-start">
//               <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
//               <span>Meet in person to tour the property</span>
//             </li>
//             <li className="flex items-start">
//               <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
//               <span>Review all contracts carefully</span>
//             </li>
//             <li className="flex items-start">
//               <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
//               <span>Use our secure payment system for deposits</span>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>

//   );
// };

// export default ApartmentDetail;



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apartmentService } from '../services/apartment.service';
import { getApartmentImages, ensureFullUrl } from '../services/image.service';
import { conversationService } from '../services/conversation.service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useChat } from '../context/ChatContext';
import {
  FiArrowLeft, FiMapPin, FiHome, FiCheckCircle, FiLayers, FiCalendar,
  FiMessageSquare, FiHeart, FiShare2, FiEdit2, FiTrash2, FiChevronLeft,
  FiChevronRight, FiNavigation, FiCamera, FiShield, FiDroplet, FiUser, FiRefreshCw
} from 'react-icons/fi';
import { format } from 'date-fns';


const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { startConversation } = useChat();


  // --- RETAINED ORIGINAL STATE ---
  const [apartment, setApartment] = useState(null);
  const [landlord, setLandlord] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [contacting, setContacting] = useState(false);

  // --- RETAINED ORIGINAL FETCH LOGIC ---
  useEffect(() => {
    fetchApartmentDetails();
  }, [id]);

  const fetchApartmentDetails = async () => {
    try {
      setLoading(true);
      const data = await apartmentService.getApartment(id);
      setApartment(data);
      if (data.landlord) setLandlord(data.landlord);
      await fetchApartmentImages();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load apartment details');
      navigate('/apartments');
    } finally {
      setLoading(false);
    }
  };

  const fetchApartmentImages = async () => {
    try {
      setImageLoading(true);
      const data = await getApartmentImages(id);
      if (data?.images?.length > 0) setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setImageLoading(false);
    }
  };

  // --- RESTORED ORIGINAL CONTACT LOGIC ---
  const handleContactLandlord = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      alert('Only tenants can contact landlords');
      return;
    }

    try {
      setContacting(true);
      const conversation = await startConversation(id);
      navigate(`/chat/${conversation.id}`);
    } catch (err) {
      alert(err.error || 'Failed to start conversation');
    } finally {
      setContacting(false);
    }
  };

  const handleDeleteApartment = async () => {
    if (!window.confirm('Are you sure you want to delete this apartment?')) {
      return;
    }

    try {
      await apartmentService.deleteApartment(id);
      toast.success('Apartment deleted successfully');
      navigate('/apartments');
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error(error.response?.data?.error || 'Failed to delete apartment');
    }
  };

  // Slider controls
  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  if (loading || !apartment) return <div className="max-w-7xl mx-auto p-10"><Skeleton height={500} borderRadius="2.5rem" /></div>;

  const isOwner = user?.id === apartment.landlord_id;
  const canContact = isAuthenticated && user?.role === 'tenant' && !isOwner;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-outfit text-slate-900">
      <button onClick={() => navigate('/apartments')} className="flex items-center space-x-2 text-slate-400 hover:text-emerald-600 font-bold uppercase text-[10px] tracking-widest mb-8 transition-colors">
        <FiArrowLeft /> <span>Back to Collection</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Gallery and Description */}
        <div className="lg:col-span-8 space-y-10">
          <div className="relative h-[550px] rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 group">
            {images.length > 0 ? (
              <>
                <img src={images[activeImage]?.url} className="w-full h-full object-cover transition-opacity duration-500" alt="Apartment" />
                {images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={prevImage} className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all">
                      <FiChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all">
                      <FiChevronRight size={24} />
                    </button>
                  </div>
                )}
                <div className="absolute bottom-6 right-8 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase">
                  {activeImage + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500"><FiCamera size={48} className="opacity-20" /></div>
            )}

            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50">
              <span className="block text-[10px] font-black uppercase text-emerald-600 mb-1 tracking-widest">Monthly Rent</span>
              <div className="flex items-baseline gap-1 text-slate-900">
                <span className="text-4xl font-black">${apartment.rent_amount}</span>
                <span className="text-slate-400 text-sm font-bold">/mo</span>
              </div>
            </div>
          </div>

          <div className="px-4">
            <div className="flex items-center text-emerald-600 text-[11px] font-black uppercase tracking-widest mb-3">
              <FiMapPin className="mr-2" /> {apartment.city} • {apartment.neighborhood || 'Verified Location'}
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{apartment.title}</h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">{apartment.description}</p>

            {/* Icons Grid */}
            <div className="grid grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="text-center md:text-left">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Beds</span>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xl font-black"><FiHome className="text-emerald-500"/> {apartment.bedrooms}</div>
              </div>
              <div className="text-center md:text-left border-x border-slate-200 px-6">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Baths</span>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xl font-black"><FiDroplet className="text-emerald-500"/> {apartment.bathrooms}</div>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Sq Ft</span>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xl font-black"><FiLayers className="text-emerald-500"/> {apartment.square_feet}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Sticky Sidebar */}
        <div className="lg:col-span-4 sticky top-10 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <FiShield className="text-emerald-500" /> Professional Listing
            </h3>

            {/* Logic-Based Actions */}

               {canContact ? (
                <button
                  onClick={handleContactLandlord}
                  disabled={contacting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  {contacting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Starting Chat...</span>
                    </>
                  ) : (
                    <>
                      <FiMessageSquare />
                      <span>Contact Landlord</span>
                    </>
                  )}
                </button>
              ) : isOwner ? (
                <div className="space-y-3">
                  <Link
                    to={`/apartments/${id}/edit`}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiEdit2 />
                    <span>Edit Listing</span>
                  </Link>
                  <button
                    onClick={handleDeleteApartment}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiTrash2 />
                    <span>Delete Listing</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    toast.error('Only tenants can contact landlords');
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold cursor-not-allowed"
                >
                  Contact Landlord
                </button>
              )}

            

            {/* Landlord Info (Always visible, part of the same scroll unit) */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">
                  {landlord?.full_name?.charAt(0) || <FiUser />}
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Management</span>
                  <h4 className="text-md font-black text-slate-900">{landlord?.full_name || 'Verified Owner'}</h4>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl text-[11px] text-emerald-700 font-bold border border-emerald-100 leading-relaxed">
                Security Guarantee: Payments and conversations are encrypted.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-5 bg-white rounded-[2rem] border border-slate-100 text-slate-400 hover:text-emerald-500 font-bold transition-all"><FiHeart /> Save</button>
            <button className="flex items-center justify-center gap-2 py-5 bg-white rounded-[2rem] border border-slate-100 text-slate-400 hover:text-emerald-500 font-bold transition-all"><FiShare2 /> Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetail;