import { MapPin, Bed, Bath, Home, Phone, Mail, User, ExternalLink } from "lucide-react";

/* =========================
   FETCH PROPERTY BY TOKEN
========================= */
async function getProperty(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/share/property/${token}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

/* =========================
   SHARE PROPERTY PAGE
========================= */
export default async function SharePropertyPage(
  props: { params: Promise<{ token: string }> }
) {
  const { token } = await props.params;
  const data = await getProperty(token);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Home className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Invalid</h2>
          <p className="text-gray-600">This property link has expired or is invalid</p>
        </div>
      </div>
    );
  }

  const { property, seller, images } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Main Image */}
      <div className="relative w-full h-[60vh] bg-gray-900">
        {images[0] && (
          <img
            src={images[0].photo_url}
            alt="Property"
            className="w-full h-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Property Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-3">
              {property.property_type}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 capitalize">
              {property.property_type} in {property.location?.split(',')[0]}
            </h1>
            <div className="flex items-center gap-2 text-gray-200">
              <MapPin className="w-5 h-5" />
              <p className="text-lg">{property.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full">
          
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Price & Key Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-green-600">₹ {property.price.toLocaleString('en-IN')}</span>
                <span className="text-gray-500">/ month</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bed className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-xs text-gray-600">Bedrooms</p>
                  </div>
                </div>

                {property.bathrooms && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bath className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                      <p className="text-xs text-gray-600">Bathrooms</p>
                    </div>
                  </div>
                )}

                {property.area && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.area}</p>
                      <p className="text-xs text-gray-600">Sq. Ft.</p>
                    </div>
                  </div>
                )}

                {property.status && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">{property.status}</p>
                      <p className="text-xs text-gray-600">Status</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Gallery */}
            {images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.slice(1).map((img: any, i: number) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer">
                      <img
                        src={img.photo_url}
                        alt={`Property ${i + 2}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {property.lat && property.lng && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-6 h-6 text-blue-900" />
                  <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">{property.location}</p>
                  <a
                    href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-900 font-medium"
                  >
                    View on Google Maps
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <iframe
                  className="w-full h-80 rounded-xl border border-gray-200"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                />
              </div>
            )}
          </div>

          {/* Right Column - Contact Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Property Owner</h3>
                
                {/* Owner Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{seller.name}</p>
                    <p className="text-sm text-gray-500">Property Owner</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <a href={`tel:${seller.contact}`} className="font-medium text-gray-900 hover:text-blue-900 break-all">
                        {seller.contact}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${seller.email}`} className="font-medium text-gray-900 hover:text-blue-900 break-all">
                        {seller.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Call to Action Buttons */}
                <div className="space-y-3">
                  <a
                    href={`tel:${seller.contact}`}
                    className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-center"
                  >
                    Call Now
                  </a>
                  <a
                    href={`mailto:${seller.email}?subject=Inquiry about ${property.property_type} in ${property.location}`}
                    className="block w-full py-3 px-4 bg-blue-900 hover:bg-blue-900 text-white font-semibold rounded-xl transition-colors text-center"
                  >
                    Send Email
                  </a>
                  <a
                    href={`https://wa.me/${seller.contact.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in your ${property.property_type} property in ${property.location}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-xl transition-colors text-center"
                  >
                    WhatsApp
                  </a>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Contact the owner directly for viewings and inquiries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}