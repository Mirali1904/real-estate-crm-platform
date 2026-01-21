"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Briefcase, FileText, Edit2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

 useEffect(() => {
  const raw = localStorage.getItem("loggedUser");
  if (!raw) return;

  const loggedUser = JSON.parse(raw);

const tenantId = loggedUser.tenant_id || loggedUser.tenantId;

fetch(`/api/profile?userId=${loggedUser.id}&tenantId=${tenantId}`)

    .then((res) => res.json())
    .then((data) => {
      setUser(data);

      const nameParts = (data.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");

      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCompanyName(data.company_name || "");
      setPosition(data.position || "");
      setStreetAddress(data.street_address || "");
      setCity(data.city || "");
      setState(data.state || "");
      setZipCode(data.zip_code || "");
      setCountry(data.country || "");
      setBio(data.bio || "");
    });
}, []);


  const handleSave = async () => {
  const raw = localStorage.getItem("loggedUser");
  if (!raw) return;

  const loggedUser = JSON.parse(raw);
  const tenantId = loggedUser.tenant_id || loggedUser.tenantId;

  await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: loggedUser.id,
      tenantId, // ✅ IMPORTANT
      name: `${firstName} ${lastName}`.trim(),
      phone,
      company_name: companyName,
      position,
      street_address: streetAddress,
      city,
      state,
      zip_code: zipCode,
      country,
      bio,
    }),
  });

  setIsEditing(false);
};




  const handleCancel = () => {
  setIsEditing(false);
};


  if (!user) {
  return (
    <div className="flex items-center justify-center h-screen text-gray-500">
      Loading profile...
    </div>
  );
}


  return (
    <div className="w-full">
             <Sidebar />
            
                  <div className="flex-1 ml-56">
                    <Header />

      

      {/* Content Area */}
      <div className="p-8">
        {/* Profile Header Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>
              
              {/* Name and Title */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {firstName} {lastName}
                </h2>
                <p className="text-gray-600 text-lg">{position}</p>
                <p className="text-gray-500">{companyName}</p>
              </div>
            </div>

            {/* Edit Profile Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <>
              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <p className="font-medium text-gray-900">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="font-medium text-gray-900">{phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Address</h3>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{streetAddress}</p>
                    <p className="text-gray-600">{city}, {state} {zipCode}</p>
                    <p className="text-gray-600">{country}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Bio</h3>
                <p className="text-gray-700 leading-relaxed">{bio}</p>
              </div>
            </>
          ) : (
            <>
              {/* Edit Profile Form */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                <p className="text-gray-600 -mt-4">Update your personal and professional information</p>

                {/* Personal Information */}
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-900">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">First Name</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Last Name</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                      <input
                        value={email}
                        disabled
                        className="w-full h-11 px-4 rounded-lg border bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Phone</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-900">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Company Name</label>
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Position</label>
                      <input
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-900">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Street Address</label>
                      <input
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">City</label>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">State</label>
                      <input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Zip Code</label>
                      <input
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-700">Country</label>
                      <input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-base font-semibold mb-4 text-gray-900">Bio</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">About You</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
