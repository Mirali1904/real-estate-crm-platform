"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Briefcase, FileText, Edit2, X, Check, Building2, Globe } from "lucide-react";
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
        tenantId,
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-56">
        <Header />

        <div className="p-8 w-full">
  <div className="w-full">

            
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Header Section with Gradient */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
              
              {/* Profile Content */}
              <div className="relative px-8 pb-8">
                
                {/* Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white border-4 border-white shadow-lg">
                      <span className="text-4xl font-bold">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {firstName} {lastName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {position && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          <Briefcase className="w-3.5 h-3.5" />
                          {position}
                        </span>
                      )}
                      {companyName && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-6">
                    
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Email</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Phone</p>
                            <p className="text-sm font-semibold text-gray-900">{phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                        Address
                      </h3>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Location</p>
                          <div className="space-y-0.5 text-sm">
                            <p className="font-semibold text-gray-900">{streetAddress}</p>
                            <p className="text-gray-700">{city}, {state} {zipCode}</p>
                            <p className="text-gray-600 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5" />
                              {country}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                        About
                      </h3>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 leading-relaxed">{bio || "No bio added yet."}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    <div className="pb-4 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                      <p className="text-sm text-gray-600 mt-1">Update your personal and professional information</p>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter first name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter last name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        Professional Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter company name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                          <input
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter your position"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Address
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter street address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter zip code"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            placeholder="Enter country"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Bio
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">About You</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                          placeholder="Write a short bio about yourself..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}