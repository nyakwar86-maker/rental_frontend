

// import React, { useState, useEffect } from 'react';
// import {
//   FiMapPin,
//   FiHome,
//   FiDollarSign,
//   FiCheckCircle,
//   FiClock,
//   FiEdit2,
//   FiEye,
//   FiImage
// } from 'react-icons/fi';
// import { format } from 'date-fns';
// import { Link } from 'react-router-dom';
// import { getApartmentFirstImage } from '../../services/image.service';
// import { useAuth } from '../../context/AuthContext';

// const ApartmentCard = ({ apartment, isLandlordView = false, preloadedImage = null, showEditButton = true }) => {
//   const [imageUrl, setImageUrl] = useState(preloadedImage);
//   const [imageLoading, setImageLoading] = useState(!preloadedImage);
//   const [imageError, setImageError] = useState(false);
//   const { user } = useAuth();

//   const statusColors = {
//     available: 'bg-green-100 text-green-800',
//     occupied: 'bg-red-100 text-red-800',
//     unavailable: 'bg-gray-100 text-gray-800',
//     pending: 'bg-yellow-100 text-yellow-800'
//   };

//   const formatPrice = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   // Fetch image if not preloaded
//   useEffect(() => {
//     if (!preloadedImage && apartment.id) {
//       const fetchImage = async () => {
//         try {
//           setImageLoading(true);
//           const firstImage = await getApartmentFirstImage(apartment.id);
//           setImageUrl(firstImage);
//         } catch (error) {
//           console.error(`Failed to load image for apartment ${apartment.id}:`, error);
//           setImageError(true);
//         } finally {
//           setImageLoading(false);
//         }
//       };
//       fetchImage();
//     } else if (preloadedImage) {
//       setImageLoading(false);
//     }
//   }, [apartment.id, preloadedImage]);

//   const handleImageError = () => {
//     setImageError(true);
//   };

//   // Check if current user is the landlord of this apartment
//   const isCurrentUserLandlord = user?.id === apartment.landlord_id;

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
//       {/* Image Section */}
//       <div className="h-48 relative overflow-hidden">
//         {imageLoading ? (
//           <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
//         ) : imageUrl && !imageError ? (
//           <img
//             src={imageUrl}
//             alt={apartment.title}
//             className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
//             onError={handleImageError}
//             loading="lazy"
//           />
//         ) : (
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center text-white">
//             <FiImage size={48} className="mb-3 opacity-80" />
//             <span className="text-sm font-medium">No image available</span>
//           </div>
//         )}

//         {/* Status badge */}
//         <div className="absolute top-4 right-4">
//           <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apartment.status]}`}>
//             {apartment.status?.charAt(0).toUpperCase() + apartment.status?.slice(1) || 'Unknown'}
//           </span>
//         </div>
        
//         {/* Verified badge */}
//         {apartment.is_verified && (
//           <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
//             <FiCheckCircle className="mr-1" size={12} />
//             Verified
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-6">
//         <div className="flex justify-between items-start mb-3">
//           <h3 className="text-xl font-bold text-gray-900 truncate">
//             {apartment.title}
//           </h3>
//           <span className="text-2xl font-bold text-blue-600">
//             {formatPrice(apartment.rent_amount)}
//             <span className="text-sm text-gray-500 font-normal">/month</span>
//           </span>
//         </div>

//         <div className="flex items-center text-gray-600 mb-4">
//           <FiMapPin className="mr-2" />
//           <span className="truncate">{apartment.city}, {apartment.neighborhood || 'N/A'}</span>
//         </div>

//         {/* Details Grid */}
//         <div className="grid grid-cols-2 gap-3 mb-4">
//           <div className="flex items-center text-gray-700">
//             <FiHome className="mr-2 text-gray-400" />
//             <span>
//               {apartment.bedrooms || 'N/A'} bed • {apartment.bathrooms || 'N/A'} bath
//             </span>
//           </div>
//           {apartment.square_feet && (
//             <div className="flex items-center text-gray-700">
//               <FiHome className="mr-2 text-gray-400" />
//               <span>{apartment.square_feet.toLocaleString()} sqft</span>
//             </div>
//           )}
//         </div>

//         {/* Amenities */}
//         {apartment.amenities && apartment.amenities.length > 0 && (
//           <div className="mb-4">
//             <div className="flex flex-wrap gap-2">
//               {apartment.amenities.slice(0, 3).map((amenity, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
//                 >
//                   {amenity}
//                 </span>
//               ))}
//               {apartment.amenities.length > 3 && (
//                 <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
//                   +{apartment.amenities.length - 3} more
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Divider */}
//         <div className="border-t border-gray-200 pt-4 mt-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center text-sm text-gray-600">
//               <FiClock className="mr-1" />
//               <span>Posted {format(new Date(apartment.created_at), 'MMM d')}</span>
//             </div>
            
//             {/* Action Buttons */}
//             <div className="flex space-x-2">
//               {/* Always show View Details button */}
//               <Link
//                 to={`/apartments/${apartment.id}`}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
//               >
//                 <FiEye className="mr-1" size={16} />
//                 View
//               </Link>
              
//               {/* Show Edit button only if:
//                   1. isLandlordView prop is true AND showEditButton is true
//                   2. OR current user is the landlord of this apartment */}
//               {(isLandlordView && showEditButton && isCurrentUserLandlord) && (
//                 <Link
//                   to={`/apartments/${apartment.id}/edit`}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
//                 >
//                   <FiEdit2 className="mr-1" size={16} />
//                   Edit
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApartmentCard;

import React, { useState, useEffect } from 'react';
import {
  FiMapPin,
  FiHome,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiEye,
  FiImage,
  FiMaximize,
  FiZap
} from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getApartmentFirstImage } from '../../services/image.service';
import { useAuth } from '../../context/AuthContext';

// Updated Status Colors: Professional yet Vibrant
const statusColors = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  occupied: 'bg-rose-50 text-rose-700 border-rose-100',
  unavailable: 'bg-slate-50 text-slate-700 border-slate-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100'
};

const ApartmentCard = ({ apartment, isLandlordView = false, preloadedImage = null, showEditButton = true }) => {
  const [imageUrl, setImageUrl] = useState(preloadedImage);
  const [imageLoading, setImageLoading] = useState(!preloadedImage);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  console.log(apartment)

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    if (!preloadedImage && apartment.id) {
      const fetchImage = async () => {
        try {
          setImageLoading(true);
          const firstImage = await getApartmentFirstImage(apartment.id);
          setImageUrl(firstImage);
        } catch (error) {
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      };
      fetchImage();
    } else if (preloadedImage) {
      setImageLoading(false);
    }
  }, [apartment.id, preloadedImage]);

  const handleImageError = () => setImageError(true);
  const isCurrentUserLandlord = user?.id === apartment.landlord_id;

  return (
    // Apply "font-outfit" (ensure you link the font in your index.html/tailwind config)
    <div className="group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:-translate-y-2 transition-all duration-500 border border-slate-50 font-outfit">
      
      {/* IMAGE SECTION */}
      <div className="h-64 relative overflow-hidden">
        {imageLoading ? (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        ) : imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={apartment.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center">
            <FiImage size={40} className="text-slate-400" />
          </div>
        )}

        {/* Floating Price: Glassmorphism Style */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/40">
          <span className="text-xl font-black text-slate-900 tracking-tight">{formatPrice(apartment.rent_amount)}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">/ mo</span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {apartment.is_verified && (
            <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
              <FiCheckCircle size={16} />
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColors[apartment.status]}`}>
            {apartment.status}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-6">
        <div className="flex items-center text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
          <FiMapPin className="mr-1.5 animate-bounce" />
          {apartment.neighborhood || apartment.city}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300 leading-tight">
          {apartment.title}
        </h3>

        {/* Modern Specifications Grid */}
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl mb-6 border border-slate-50">
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Beds</span>
            <span className="text-slate-900 font-bold">{apartment.bedrooms || '0'}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Baths</span>
            <span className="text-slate-900 font-bold">{apartment.bathrooms || '0'}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Space</span>
            <span className="text-slate-900 font-bold flex items-center justify-center">
              {apartment.square_feet?.toLocaleString() || '0'} <span className="text-[10px] ml-0.5">ft²</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={`/apartments/${apartment.id}`}
            className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-emerald-600 hover:shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center group/btn"
          >
            <FiEye className="mr-2 group-hover/btn:scale-110 transition-transform" />
            Explore
          </Link>
          
          {(isLandlordView && showEditButton && isCurrentUserLandlord) && (
            <Link
              to={`/apartments/${apartment.id}/edit`}
              className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-emerald-600 transition-all duration-300"
            >
              <FiEdit2 size={20} />
            </Link>
          )}
        </div>

        {/* Posted Date */}
        <div className="mt-5 flex items-center justify-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
          <FiClock className="mr-1.5" />
          Listed {format(new Date(apartment.createdAt), 'MMMM yyyy')}
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;